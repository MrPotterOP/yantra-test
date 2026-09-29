/**
 * GET /api/careers
 * ─────────────────────────────────────────────────────────────────────────────
 * Public endpoint returning all active career listings.
 * Consumed by OpenRoles.js on the /careers page.
 *
 * Response shape (array):
 * [
 *   {
 *     id: string,
 *     role: string,
 *     field: string,
 *     location: string,
 *     description: string,
 *   }
 * ]
 *
 * Edge cases handled:
 * - Empty collection → returns []
 * - Payload connection failure → returns [] with 200 (graceful degradation)
 */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'careers',
      where: {
        isActive: { equals: true },
      },
      depth: 0,        // no relationships to resolve
      limit: 100,
      pagination: false,
      sort: 'createdAt', // oldest first — preserves editorial order
    })

    // Return only the fields the frontend needs — never expose internal fields
    const listings = docs.map((doc) => ({
      id: doc.id,
      role: doc.role,
      field: doc.field,
      location: doc.location,
      description: doc.description,
    }))

    return NextResponse.json(listings, {
      status: 200,
      headers: {
        // Short cache — careers listings can change; 60s is safe
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (err) {
    console.error('[GET /api/careers] Error:', err)
    // Graceful degradation: return empty list so the UI shows "no open positions"
    // rather than a broken page or error state
    return NextResponse.json([], { status: 200 })
  }
}
