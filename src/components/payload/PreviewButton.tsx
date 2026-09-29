/**
 * PreviewButton — Custom Payload CMS edit-view action button
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders an amber "Preview ↗" button in the top action bar of the document
 * edit view (alongside Save/Publish buttons).
 *
 * ENABLED  → opens the live frontend URL in a new tab when all required fields
 *             for that collection are filled.
 * DISABLED → shows a greyed-out non-clickable button with a tooltip listing
 *             the exact missing fields.
 *
 * Registration (in collection admin.components):
 *   views: { edit: { default: { actions: ['@/components/payload/PreviewButton'] } } }
 *
 * Works with: blogs, projects, products (gracefully degrades for others).
 *
 * NOTE on React hook rules: ALL useField() calls must always run, unconditionally,
 * to satisfy the Rules of Hooks. We call every field we might ever need upfront,
 * then selectively use the values based on collectionSlug.
 */
'use client'

import React from 'react'
import { useField, useDocumentInfo } from '@payloadcms/ui'

// Map collection slug → frontend URL prefix
const PREVIEW_PATHS: Record<string, string> = {
  blogs: '/blog',
  projects: '/project',
  products: '/products',
}

// Required fields per collection — drives the disabled state & tooltip
const REQUIRED_FIELDS: Record<string, string[]> = {
  blogs: ['Title', 'Slug', 'Author', 'Cover Image', 'Body'],
  projects: ['Title', 'Slug', 'Location', 'Category', 'Hero Image'],
  products: ['Title', 'Slug'],
}

export default function PreviewButton() {
  const { collectionSlug } = useDocumentInfo()

  // ── ALL useField calls must be unconditional (Rules of Hooks) ─────────────
  // We read every field we may need across all supported collections upfront.
  const { value: slug }       = useField<string>({ path: 'slug' })
  const { value: title }      = useField<string>({ path: 'title' })
  const { value: author }     = useField<string>({ path: 'author' })
  const { value: coverImage } = useField<unknown>({ path: 'coverImage' })
  const { value: body }       = useField<unknown>({ path: 'body' })
  const { value: location }   = useField<string>({ path: 'location' })
  const { value: category }   = useField<unknown>({ path: 'category' })
  const { value: heroImage }  = useField<unknown>({ path: 'heroImage' })
  // ─────────────────────────────────────────────────────────────────────────

  // Only show the button for collections that have a frontend preview route
  const pathPrefix = collectionSlug ? PREVIEW_PATHS[collectionSlug] : undefined
  if (!pathPrefix) return null  // Not a previewable collection → render nothing

  // Determine which required fields are missing for this collection
  const missingFields: string[] = []

  if (collectionSlug === 'blogs') {
    if (!title?.trim())  missingFields.push('Title')
    if (!slug?.trim())   missingFields.push('Slug')
    if (!author?.trim()) missingFields.push('Author')
    if (!coverImage)     missingFields.push('Cover Image')
    if (!body)           missingFields.push('Body')
  } else if (collectionSlug === 'projects') {
    if (!title?.trim())    missingFields.push('Title')
    if (!slug?.trim())     missingFields.push('Slug')
    if (!location?.trim()) missingFields.push('Location')
    if (!category)         missingFields.push('Category')
    if (!heroImage)        missingFields.push('Hero Image')
  } else if (collectionSlug === 'products') {
    if (!title?.trim()) missingFields.push('Title')
    if (!slug?.trim())  missingFields.push('Slug')
  }

  const isPreviewable = missingFields.length === 0
  const previewUrl    = slug?.trim() ? `${pathPrefix}/${slug.trim()}` : '#'

  // ── Styling ───────────────────────────────────────────────────────────────
  const baseStyle: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            '6px',
    padding:        '0 14px',
    height:         '38px',
    borderRadius:   '4px',
    fontSize:       '0.8125rem',
    fontWeight:      500,
    fontFamily:     'inherit',
    letterSpacing:  '0.01em',
    textDecoration: 'none',
    transition:     'all 0.15s ease-in-out',
    border:         '1px solid',
    whiteSpace:     'nowrap',
    userSelect:     'none',
  }

  const enabledStyle: React.CSSProperties = {
    ...baseStyle,
    color:       '#f59e0b',
    borderColor: 'rgba(245, 158, 11, 0.5)',
    background:  'transparent',
    cursor:      'pointer',
  }

  const disabledStyle: React.CSSProperties = {
    ...baseStyle,
    color:       'var(--theme-elevation-400, #6b7280)',
    borderColor: 'var(--theme-elevation-200, #e5e7eb)',
    background:  'transparent',
    opacity:      0.5,
    cursor:      'not-allowed',
  }

  const ExternalIcon = () => (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )

  if (!isPreviewable) {
    const tooltip = `Preview disabled — fill in: ${missingFields.join(', ')}`
    return (
      <button
        type="button"
        disabled
        title={tooltip}
        aria-label={tooltip}
        style={disabledStyle}
      >
        Preview
        <ExternalIcon />
      </button>
    )
  }

  return (
    <a
      href={previewUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open live preview at ${previewUrl}`}
      aria-label={`Preview ${title} in new tab`}
      style={enabledStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.background   = 'rgba(245, 158, 11, 0.1)'
        el.style.borderColor  = '#f59e0b'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.background   = 'transparent'
        el.style.borderColor  = 'rgba(245, 158, 11, 0.5)'
      }}
    >
      Preview
      <ExternalIcon />
    </a>
  )
}
