/**
 * GET /api/preview/exit
 * ─────────────────────────────────────────────────────────────────────────────
 * Disables Next.js Draft Mode and redirects back to the referring page
 * (or to the homepage if no referrer). Called by the PreviewBanner "Exit"
 * button on the preview page.
 */

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(request) {
  const draft = await draftMode()
  draft.disable()

  // Redirect back to wherever the editor came from, or fall back to home
  const { searchParams } = new URL(request.url)
  const returnTo = searchParams.get('returnTo') || '/'

  // Safety: only allow relative paths (no external redirects)
  const safePath = returnTo.startsWith('/') ? returnTo : '/'
  redirect(safePath)
}
