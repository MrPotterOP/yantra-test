/**
 * POST /api/revalidate
 * ─────────────────────────────────────────────────────────────────────────────
 * On-demand ISR revalidation endpoint for Blogs, Projects, and Products.
 *
 * Security model:
 *   This route is gated by the caller's Payload auth token — the same JWT
 *   the admin dashboard already holds in the browser. The token is sent as
 *   "Authorization: Bearer <token>" and validated against Payload's auth
 *   system server-side. Only authenticated admin users can trigger revalidation.
 *   No extra secrets to manage or expose.
 *
 * Called by: RevalidateButton.tsx (custom Payload admin component)
 *
 * Request body:
 *   { collection: "blogs" | "projects" | "products", slug: string }
 *
 * Response:
 *   { success: true, paths: string[], revalidatedAt: string }
 *   { error: string }  with appropriate HTTP status
 *
 * Revalidation scope per call:
 *   blogs    → /blog, /blog/[slug], /
 *   projects → /project, /project/[slug], /
 *   products → /products, /products/[slug], /
 *
 * Security notes:
 *   - Auth validated via Payload JWT before any revalidation runs
 *   - Collection slug validated against an allowlist (no arbitrary path injection)
 *   - Payload token is scoped to the admin session — revokes on logout
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

// Allowed collections and their revalidation path generators.
// Must exactly match the paths used in each collection's afterChange hooks.
const REVALIDATION_MAP: Record<string, (slug: string) => string[]> = {
  blogs: (slug) => [
    '/blog',
    `/blog/${slug}`,
    '/',
  ],
  projects: (slug) => [
    '/project',
    `/project/${slug}`,
    '/',
  ],
  products: (slug) => [
    '/products',
    `/products/${slug}`,
    '/',
  ],
  // Homepage is a special case — no slug needed, just revalidates '/'
  homepage: (_slug) => ['/'],
}

// Revalidate the entire listing for a collection (no specific slug)
const LISTING_PATHS: Record<string, string[]> = {
  blogs:    ['/blog', '/'],
  projects: ['/project', '/'],
  products: ['/products', '/'],
  homepage: ['/'],
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Extract and validate the Payload auth token ─────────────────────
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized — no auth token provided' },
        { status: 401 }
      )
    }

    // Validate the token against Payload's auth system.
    // payload.auth() reads the token from the Authorization header directly.
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: req.headers })

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid or expired session' },
        { status: 401 }
      )
    }

    // ── 2. Parse and validate the request body ─────────────────────────────
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { collection, slug } = body as { collection?: string; slug?: string }

    // Validate collection against the allowlist — no arbitrary path injection
    if (!collection || !REVALIDATION_MAP[collection]) {
      return NextResponse.json(
        { error: `Unknown collection: "${collection}". Allowed: ${Object.keys(REVALIDATION_MAP).join(', ')}` },
        { status: 400 }
      )
    }

    // ── 3. Determine which paths to revalidate ─────────────────────────────
    let paths: string[]

    if (slug && typeof slug === 'string' && slug.trim()) {
      // Validate slug — only allow URL-safe slugs
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
        return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
      }
      paths = REVALIDATION_MAP[collection](slug.trim())
    } else {
      // No slug provided — revalidate the collection listing + homepage
      paths = LISTING_PATHS[collection]
    }

    // ── 4. Revalidate all paths ────────────────────────────────────────────
    const revalidatedAt = new Date().toISOString()
    for (const path of paths) {
      revalidatePath(path)
    }

    payload.logger.info({
      msg: `[Revalidate] ${user.email} revalidated ${collection}${slug ? `/${slug}` : ' (listing)'}`,
      paths,
      revalidatedAt,
    })

    return NextResponse.json({
      success: true,
      collection,
      slug: slug || null,
      paths,
      revalidatedAt,
      revalidatedBy: user.email,
    })

  } catch (err: unknown) {
    console.error('[Revalidate] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error during revalidation' },
      { status: 500 }
    )
  }
}

// Only POST is supported — reject everything else cleanly
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}
