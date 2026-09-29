/**
 * POST /api/frontend/careers/apply
 * ─────────────────────────────────────────────────────────────────────────────
 * Public endpoint for submitting a job application.
 * Called from the ApplyModal in OpenRoles.js.
 *
 * Request body (JSON):
 * {
 *   fullName:    string  (required)
 *   email:       string  (required, valid email)
 *   phone:       string  (required)
 *   resumeLink:  string  (required, must be google drive URL)
 *   coverNote:   string  (optional)
 *   careerId:    string  (required)
 * }
 *
 * Success: 201 { success: true, message: string }
 * Validation error: 422 { error: 'Validation failed', details: { fieldName: message } }
 * Not found: 404 { error: 'Job listing not found or is no longer active' }
 * Server error: 500 { error: 'Internal server error' }
 *
 * Edge cases handled:
 * - Invalid/missing fields → 422 with per-field detail map
 * - ID points to inactive/deleted role → 404
 * - Duplicate application from same email → allowed (admin can dedupe)
 * - Payload write failure → 500
 * - XSS: coverNote is stored as plain text (no HTML rendered on admin side directly)
 * - Rate limiting: should be added at CDN/middleware level for production
 */

import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GDRIVE_RE = /^https:\/\/drive\.google\.com\//
const PHONE_RE = /^[\d\s\+\-\(\)]{7,20}$/ // loose — allows international formats

function validate(body) {
  const errors = {}

  if (!body.fullName || !body.fullName.trim()) {
    errors.fullName = 'Full name is required'
  } else if (body.fullName.trim().length > 200) {
    errors.fullName = 'Full name must be under 200 characters'
  }

  if (!body.email || !body.email.trim()) {
    errors.email = 'Email address is required'
  } else if (!EMAIL_RE.test(body.email.trim())) {
    errors.email = 'Please provide a valid email address'
  }

  if (!body.phone || !body.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!PHONE_RE.test(body.phone.trim())) {
    errors.phone = 'Please provide a valid phone number'
  }

  if (!body.resumeLink || !body.resumeLink.trim()) {
    errors.resumeLink = 'Resume link is required'
  } else if (!GDRIVE_RE.test(body.resumeLink.trim())) {
    errors.resumeLink = 'Must be a Google Drive link (https://drive.google.com/…)'
  }

  if (body.coverNote && body.coverNote.length > 2000) {
    errors.coverNote = 'Cover note must be under 2000 characters'
  }

  if (!body.careerId) {
    errors.careerId = 'Career ID is required'
  }

  return errors
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request) {

  // 1. Parse request body safely
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body — expected JSON' },
      { status: 400 }
    )
  }

  // 2. Client-side-mirrored validation (defense-in-depth)
  const validationErrors = validate(body)
  if (Object.keys(validationErrors).length > 0) {
    return NextResponse.json(
      { error: 'Validation failed', details: validationErrors },
      { status: 422 }
    )
  }

  try {
    const payload = await getPayload({ config })

    // 3. Look up the career listing by ID
    //    — ensures the role still exists and is active before accepting the application
    const { docs: careers } = await payload.find({
      collection: 'careers',
      where: {
        and: [
          { id: { equals: body.careerId } },
          { isActive: { equals: true } },
        ],
      },
      depth: 0,
      limit: 1,
    })

    const career = careers[0]

    // 4. Role not found or deactivated — don't accept the application
    if (!career) {
      return NextResponse.json(
        { error: 'Job listing not found or is no longer accepting applications.' },
        { status: 404 }
      )
    }

    // 5. Create the application document
    //    fullName, email, phone, resumeLink, coverNote are stored as-is (plain text)
    //    — no HTML, no markdown, safe for display in admin panel
    await payload.create({
      collection: 'applications',
      data: {
        fullName: body.fullName.trim(),
        email: body.email.trim().toLowerCase(),
        phone: body.phone.trim(),
        resumeLink: body.resumeLink.trim(),
        coverNote: body.coverNote ? body.coverNote.trim() : '',
        career: career.id,   // relationship to the Careers collection
        status: 'new',       // always starts as 'new' — admin updates from here
      },
    })

    // 6. Success response
    return NextResponse.json(
      {
        success: true,
        message: `Thank you for applying for the ${career.role} role. We'll be in touch shortly.`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error(`[POST /api/frontend/careers/apply] Error:`, err)
    return NextResponse.json(
      { error: 'Something went wrong on our end. Please try again shortly.' },
      { status: 500 }
    )
  }
}
