/**
 * PreviewBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * A fixed top banner that appears only in Draft Mode (Next.js preview).
 * Shows editors they are in preview mode and lets them exit cleanly.
 *
 * Usage (in Server Component pages):
 *   import { draftMode } from 'next/headers'
 *   import PreviewBanner from '@/components/payload/PreviewBanner'
 *
 *   const { isEnabled } = await draftMode()
 *   ...
 *   {isEnabled && <PreviewBanner path={`/project/${slug}`} />}
 *
 * The `path` prop should be the current page path (for the exit redirect).
 */
'use client'

import React, { useState } from 'react'

export default function PreviewBanner({ path = '/' }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const exitUrl = `/api/preview/exit?returnTo=${encodeURIComponent(path)}`

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position:       'fixed',
        top:             0,
        left:            0,
        right:           0,
        zIndex:          9999,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '12px',
        padding:        '10px 20px',
        background:     'rgba(245, 158, 11, 0.95)',
        backdropFilter: 'blur(8px)',
        color:          '#1a1a1a',
        fontSize:       '0.8125rem',
        fontWeight:      600,
        letterSpacing:  '0.02em',
        boxShadow:      '0 2px 12px rgba(0,0,0,0.25)',
        fontFamily:     'inherit',
      }}
    >
      {/* Eye icon */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>

      <span>Preview Mode — You are viewing a draft version of this page.</span>

      <div style={{ display: 'flex', gap: '8px', marginLeft: '4px' }}>
        <a
          href={`/admin`}
          style={{
            padding:         '4px 12px',
            borderRadius:    '4px',
            background:      'rgba(0,0,0,0.15)',
            color:           '#1a1a1a',
            textDecoration:  'none',
            fontSize:        '0.75rem',
            fontWeight:       700,
            whiteSpace:      'nowrap',
          }}
        >
          ← Back to CMS
        </a>

        <a
          href={exitUrl}
          style={{
            padding:        '4px 12px',
            borderRadius:   '4px',
            background:     '#1a1a1a',
            color:          '#f59e0b',
            textDecoration: 'none',
            fontSize:       '0.75rem',
            fontWeight:      700,
            whiteSpace:     'nowrap',
          }}
        >
          Exit Preview
        </a>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss preview banner"
          style={{
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            padding:      '4px',
            color:        '#1a1a1a',
            lineHeight:    1,
            opacity:       0.7,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
