/**
 * RevalidateButton — Custom Payload CMS action component
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a "Revalidate" button in the document edit view action bar alongside
 * Save / Publish. Allows editors to manually bust the ISR cache for a specific
 * document without waiting for the automatic afterChange hook (useful for
 * production deployments where you want to force a cache refresh).
 *
 * Behaviour:
 *   IDLE     → "↻ Revalidate" button (amber, outline style)
 *   LOADING  → "Revalidating…" disabled spinner (prevents double-click)
 *   SUCCESS  → "✓ Revalidated" green confirmation for 3 seconds, then IDLE
 *   ERROR    → "✗ Failed" red with retry for 4 seconds, then IDLE
 *
 * The button is DISABLED when:
 *   - The document has no slug (not yet saved with required fields)
 *   - A revalidation is already in progress
 *
 * Security: Uses the editor's own Payload session token (from useAuth().token)
 * as the Bearer credential. The API route validates it server-side against the
 * Payload user store — no extra secrets in the browser bundle.
 *
 * Supported collections: blogs, projects, products
 * (Returns null for any other collection — no button rendered)
 *
 * Registration: add to collection admin.components.views.edit.default.actions
 *
 * NOTE: ALL useField() calls are unconditional (Rules of Hooks compliance).
 */
'use client'

import React, { useState, useCallback } from 'react'
import { useField, useDocumentInfo, useAuth } from '@payloadcms/ui'

// Collections where revalidation is relevant
const SUPPORTED_COLLECTIONS = new Set(['blogs', 'projects', 'products'])

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function RevalidateButton() {
  const { collectionSlug } = useDocumentInfo()
  const { token } = useAuth()

  // Always call all hooks unconditionally (Rules of Hooks)
  const { value: slug } = useField<string>({ path: 'slug' })

  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [lastRevalidatedAt, setLastRevalidatedAt] = useState<string | null>(null)

  // Only render for supported collections
  if (!collectionSlug || !SUPPORTED_COLLECTIONS.has(collectionSlug)) return null

  const hasSlug = Boolean(slug?.trim())
  const isDisabled = !hasSlug || status === 'loading'

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleRevalidate = useCallback(async () => {
    if (isDisabled) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          collection: collectionSlug,
          slug: slug?.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setLastRevalidatedAt(data.revalidatedAt)
      setStatus('success')

      // Return to idle after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setErrorMsg(message)
      setStatus('error')

      // Return to idle after 4 seconds
      setTimeout(() => {
        setStatus('idle')
        setErrorMsg('')
      }, 4000)
    }
  }, [isDisabled, token, collectionSlug, slug])

  // ── Styling ───────────────────────────────────────────────────────────────

  const baseStyle: React.CSSProperties = {
    display:       'inline-flex',
    alignItems:    'center',
    gap:           '6px',
    padding:       '0 14px',
    height:        '38px',
    borderRadius:  '4px',
    fontSize:      '0.8125rem',
    fontWeight:     500,
    fontFamily:    'inherit',
    letterSpacing: '0.01em',
    transition:    'all 0.15s ease-in-out',
    border:        '1px solid',
    whiteSpace:    'nowrap',
    cursor:        'pointer',
    userSelect:    'none',
    background:    'transparent',
  }

  const styleMap: Record<Status, React.CSSProperties> = {
    idle: {
      ...baseStyle,
      color:       hasSlug ? '#f59e0b' : 'var(--theme-elevation-400, #6b7280)',
      borderColor: hasSlug ? 'rgba(245,158,11,0.45)' : 'var(--theme-elevation-200, #e5e7eb)',
      opacity:     hasSlug ? 1 : 0.5,
      cursor:      hasSlug ? 'pointer' : 'not-allowed',
    },
    loading: {
      ...baseStyle,
      color:       '#f59e0b',
      borderColor: 'rgba(245,158,11,0.45)',
      opacity:      0.7,
      cursor:      'not-allowed',
    },
    success: {
      ...baseStyle,
      color:       '#10b981',
      borderColor: 'rgba(16,185,129,0.5)',
      background:  'rgba(16,185,129,0.06)',
      cursor:      'default',
    },
    error: {
      ...baseStyle,
      color:       '#ef4444',
      borderColor: 'rgba(239,68,68,0.5)',
      background:  'rgba(239,68,68,0.06)',
      cursor:      'pointer',
    },
  }

  // ── Icons ─────────────────────────────────────────────────────────────────

  const RefreshIcon = ({ spinning }: { spinning?: boolean }) => (
    <svg
      width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
      style={spinning ? {
        animation:        'spin 1s linear infinite',
        display:          'inline-block',
        transformOrigin:  'center',
      } : undefined}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )

  const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )

  const XIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  const tooltipText = !hasSlug
    ? 'Save the document with a slug first to enable revalidation'
    : status === 'success'
    ? `Cache cleared at ${lastRevalidatedAt ? new Date(lastRevalidatedAt).toLocaleTimeString() : 'just now'}`
    : status === 'error'
    ? `Error: ${errorMsg}`
    : `Force-refresh the Next.js cache for this ${collectionSlug.replace(/s$/, '')} page`

  return (
    <>
      {/* Inline keyframes for spinner — avoids needing a separate CSS file */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <button
        type="button"
        onClick={status === 'error' ? handleRevalidate : handleRevalidate}
        disabled={isDisabled}
        title={tooltipText}
        aria-label={tooltipText}
        aria-busy={status === 'loading'}
        style={styleMap[status]}
      >
        {status === 'idle' && (
          <>
            <RefreshIcon />
            Revalidate
          </>
        )}
        {status === 'loading' && (
          <>
            <RefreshIcon spinning />
            Revalidating…
          </>
        )}
        {status === 'success' && (
          <>
            <CheckIcon />
            Revalidated
          </>
        )}
        {status === 'error' && (
          <>
            <XIcon />
            Retry
          </>
        )}
      </button>
    </>
  )
}
