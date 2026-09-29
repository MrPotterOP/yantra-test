/**
 * Applications Collection
 * ─────────────────────────────────────────────────────────────────────────────
 * Job applications submitted through the public careers form.
 * This is the CMS inbox — admins review, update status, and manage candidates here.
 *
 * Data flow:
 *   Applicant fills OpenRoles modal → POST /api/careers/:slug/apply
 *   → This creates a document in the "applications" collection
 *   → Admin reviews in Payload CMS (/admin/collections/applications)
 *
 * Admin features:
 *   - List view with status colour-coded badges and application timestamp
 *   - Status filter (new / reviewed / shortlisted / rejected)
 *   - Status can be updated inline from the list or edit view
 *   - All applicant fields are read-only (submitted via public form)
 *   - Direct links to email, phone (mailto/tel), and Google Drive resume
 *   - Deletion permanently removes the application
 *
 * Access: Public create (application submission), admin read/update/delete.
 */

import type { CollectionConfig } from 'payload'

export const Applications: CollectionConfig = {
  slug: 'applications',
  labels: {
    singular: 'Application',
    plural: 'Applications',
  },

  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    useAsTitle: 'fullName',
    group: 'Careers',
    description: 'Job applications submitted through the public careers form.',
    defaultColumns: ['fullName', 'career', 'status', 'email', 'createdAt'],
    // Prevent editing applicant-submitted data from the admin UI
    // Status is the only field that should be updated by admins
  },

  // ── Timestamps ─────────────────────────────────────────────────────────────
  timestamps: true,

  // ── Access ─────────────────────────────────────────────────────────────────
  access: {
    // Public create — form submission from the careers page
    create: () => true,
    // Authenticated admin read/update/delete
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  // ── Fields ─────────────────────────────────────────────────────────────────
  fields: [

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 1 — Applicant Information (submitted by the user, read-only in admin)
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'fullName',
      type: 'text',
      label: 'Full Name',
      required: true,
      admin: {
        readOnly: true,
        description: 'Submitted by the applicant — do not edit.',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      admin: {
        readOnly: true,
        description: 'Submitted by the applicant — do not edit.',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
      required: true,
      admin: {
        readOnly: true,
        description: 'Submitted by the applicant — do not edit.',
      },
    },
    {
      name: 'resumeLink',
      type: 'text',
      label: 'Resume Link (Google Drive)',
      required: true,
      admin: {
        readOnly: true,
        description: 'Google Drive link to the applicant\'s resume/CV. Click to open.',
      },
    },
    {
      name: 'coverNote',
      type: 'textarea',
      label: 'Cover Note',
      required: false,
      admin: {
        readOnly: true,
        description: 'Optional cover letter submitted by the applicant.',
        rows: 5,
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Role Reference
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'career',
      type: 'relationship',
      relationTo: 'careers' as any,
      hasMany: false,
      required: true,
      label: 'Applied For',
      admin: {
        readOnly: true,
        description: 'The career listing this application was submitted against.',
        position: 'sidebar',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Admin-managed Status
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'status',
      type: 'select',
      label: 'Application Status',
      required: true,
      defaultValue: 'new',
      admin: {
        description: 'Update this as you review the application.',
        position: 'sidebar',
      },
      options: [
        { label: '🔵 New', value: 'new' },
        { label: '🟡 Reviewed', value: 'reviewed' },
        { label: '🟢 Shortlisted', value: 'shortlisted' },
        { label: '🔴 Rejected', value: 'rejected' },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Internal Notes (admin-only)
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'notes',
      type: 'textarea',
      label: 'Internal Notes',
      required: false,
      admin: {
        description: 'Private notes visible only to admins. Never shared with the applicant.',
        rows: 4,
        placeholder: 'Strong candidate — schedule interview...',
        position: 'sidebar',
      },
    },
  ],
}
