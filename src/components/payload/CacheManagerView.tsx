/**
 * CacheManagerView — Custom Payload CMS Admin Page
 * ─────────────────────────────────────────────────────────────────────────────
 * A dedicated "Cache Manager" page in the admin panel sidebar.
 * Accessible at /admin/cache-manager
 *
 * Features:
 *   - Three collection panels: Projects, Blogs, Products
 *   - Each panel lists all published documents (fetched from Payload REST API)
 *   - Per-document "Revalidate" button (precise cache bust for that page)
 *   - "Revalidate All" button per collection
 *   - Search/filter within each collection's list
 *   - Visual status feedback: idle → loading → success → error
 *   - Amber/sunbeam theme matching the CMS palette
 *
 * Security: Uses useAuth().token (Payload JWT) as Bearer credential.
 * The API route (/api/revalidate) validates it server-side.
 *
 * This is a 'use client' component — Payload renders custom views client-side.
 */
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@payloadcms/ui'

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = 'idle' | 'loading' | 'success' | 'error'

interface ContentDoc {
  id: string
  title: string
  slug: string
  updatedAt: string
}

interface CollectionState {
  docs: ContentDoc[]
  loading: boolean
  error: string | null
  filter: string
  allStatus: DocStatus
  docStatuses: Record<string, DocStatus>
}

// ─── Collection config ────────────────────────────────────────────────────────

const COLLECTIONS = [
  {
    key: 'projects',
    label: 'Projects',
    icon: '🏛',
    slug: 'projects',
    color: '#f59e0b',
  },
  {
    key: 'blogs',
    label: 'Blogs',
    icon: '✍',
    slug: 'blogs',
    color: '#8b5cf6',
  },
  {
    key: 'products',
    label: 'Products',
    icon: '🪟',
    slug: 'products',
    color: '#0ea5e9',
  },
] as const

type CollectionKey = typeof COLLECTIONS[number]['key']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ─── Single collection panel ──────────────────────────────────────────────────

interface PanelProps {
  collection: typeof COLLECTIONS[number]
  state: CollectionState
  onFilter: (val: string) => void
  onRevalidateOne: (slug: string) => void
  onRevalidateAll: () => void
}

function CollectionPanel({ collection, state, onFilter, onRevalidateOne, onRevalidateAll }: PanelProps) {
  const filteredDocs = state.docs.filter(
    (d) =>
      d.title.toLowerCase().includes(state.filter.toLowerCase()) ||
      d.slug.toLowerCase().includes(state.filter.toLowerCase())
  )

  const panelStyle: React.CSSProperties = {
    background:   'var(--theme-elevation-0, #fff)',
    border:       `1px solid var(--theme-elevation-150, #e5e7eb)`,
    borderRadius: '8px',
    overflow:     'hidden',
    marginBottom: '20px',
  }

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '14px 18px',
    background:     'var(--theme-elevation-50, #f9fafb)',
    borderBottom:   '1px solid var(--theme-elevation-150, #e5e7eb)',
  }

  return (
    <div style={panelStyle}>
      {/* Panel header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>{collection.icon}</span>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--theme-text)' }}>
            {collection.label}
          </span>
          <span style={{
            background:   `${collection.color}22`,
            color:         collection.color,
            borderRadius: '20px',
            padding:      '1px 8px',
            fontSize:     '0.75rem',
            fontWeight:    600,
          }}>
            {state.loading ? '…' : state.docs.length}
          </span>
        </div>

        <button
          onClick={onRevalidateAll}
          disabled={state.allStatus === 'loading' || state.docs.length === 0}
          style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '5px',
            padding:      '5px 12px',
            borderRadius: '4px',
            border:       `1px solid ${collection.color}55`,
            background:   state.allStatus === 'success' ? `${collection.color}15` : 'transparent',
            color:        state.allStatus === 'error' ? '#ef4444'
                        : state.allStatus === 'success' ? '#10b981'
                        : collection.color,
            fontSize:     '0.8rem',
            fontWeight:    600,
            cursor:       state.allStatus === 'loading' || state.docs.length === 0 ? 'not-allowed' : 'pointer',
            opacity:      state.docs.length === 0 ? 0.4 : 1,
            transition:   'all 0.15s',
            fontFamily:   'inherit',
          }}
        >
          {state.allStatus === 'loading' && <SpinIcon />}
          {state.allStatus === 'success' && '✓ '}
          {state.allStatus === 'error' && '✗ '}
          {state.allStatus === 'idle' && <RefreshSmallIcon color={collection.color} />}
          {state.allStatus === 'loading' ? 'Revalidating All…'
           : state.allStatus === 'success' ? 'All Revalidated'
           : state.allStatus === 'error' ? 'Failed — Retry'
           : `Revalidate All ${collection.label}`}
        </button>
      </div>

      {/* Search bar */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)' }}>
        <input
          type="search"
          placeholder={`Search ${collection.label.toLowerCase()}…`}
          value={state.filter}
          onChange={(e) => onFilter(e.target.value)}
          style={{
            width:        '100%',
            padding:      '7px 12px',
            borderRadius: '4px',
            border:       '1px solid var(--theme-elevation-200, #e5e7eb)',
            background:   'var(--theme-elevation-0, #fff)',
            color:        'var(--theme-text)',
            fontSize:     '0.8125rem',
            outline:      'none',
            fontFamily:   'inherit',
            boxSizing:    'border-box',
          }}
        />
      </div>

      {/* Document list */}
      <div style={{ minHeight: '60px' }}>
        {state.loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-elevation-500, #9ca3af)', fontSize: '0.85rem' }}>
            Loading {collection.label.toLowerCase()}…
          </div>
        )}
        {state.error && (
          <div style={{ padding: '16px 18px', color: '#ef4444', fontSize: '0.85rem' }}>
            ⚠ {state.error}
          </div>
        )}
        {!state.loading && !state.error && filteredDocs.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.85rem' }}>
            {state.filter ? 'No matches found.' : `No ${collection.label.toLowerCase()} found in CMS.`}
          </div>
        )}
        {!state.loading && filteredDocs.map((doc, i) => {
          const docSt = state.docStatuses[doc.slug] || 'idle'
          const isLast = i === filteredDocs.length - 1
          return (
            <div
              key={doc.id}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '10px 18px',
                borderBottom:   isLast ? 'none' : '1px solid var(--theme-elevation-100, #f3f4f6)',
                transition:     'background 0.1s',
              }}
            >
              {/* Doc info */}
              <div style={{ minWidth: 0, flex: 1, marginRight: '12px' }}>
                <div style={{
                  fontSize:     '0.875rem',
                  fontWeight:    500,
                  color:        'var(--theme-text)',
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {doc.title}
                </div>
                <div style={{
                  fontSize:  '0.75rem',
                  color:     'var(--theme-elevation-400, #9ca3af)',
                  marginTop: '2px',
                  display:   'flex',
                  gap:       '8px',
                }}>
                  <code style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>/{doc.slug}</code>
                  <span>· Updated {relativeTime(doc.updatedAt)}</span>
                </div>
              </div>

              {/* Per-doc revalidate button */}
              <button
                onClick={() => onRevalidateOne(doc.slug)}
                disabled={docSt === 'loading'}
                style={{
                  flexShrink:   0,
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          '4px',
                  padding:      '4px 10px',
                  borderRadius: '4px',
                  border:       `1px solid ${
                    docSt === 'success' ? '#10b98155'
                    : docSt === 'error' ? '#ef444455'
                    : `${collection.color}44`
                  }`,
                  background:   docSt === 'success' ? '#10b98108'
                              : docSt === 'error' ? '#ef444408'
                              : 'transparent',
                  color:        docSt === 'success' ? '#10b981'
                              : docSt === 'error' ? '#ef4444'
                              : collection.color,
                  fontSize:     '0.75rem',
                  fontWeight:    600,
                  cursor:       docSt === 'loading' ? 'not-allowed' : 'pointer',
                  transition:   'all 0.15s',
                  fontFamily:   'inherit',
                  whiteSpace:   'nowrap',
                }}
              >
                {docSt === 'loading' && <><SpinIcon /> Revalidating…</>}
                {docSt === 'success' && '✓ Done'}
                {docSt === 'error' && '✗ Retry'}
                {docSt === 'idle' && <><RefreshSmallIcon color={collection.color} /> Revalidate</>}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function SpinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ animation: 'cm-spin 0.8s linear infinite', display: 'inline-block' }}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function RefreshSmallIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function CacheManagerView() {
  const { token } = useAuth()

  // State per collection
  const initialState = (): CollectionState => ({
    docs:       [],
    loading:    true,
    error:      null,
    filter:     '',
    allStatus:  'idle',
    docStatuses: {},
  })

  const [states, setStates] = useState<Record<CollectionKey, CollectionState>>({
    projects: initialState(),
    blogs:    initialState(),
    products: initialState(),
  })

  // Track timers for auto-reset (using ref to avoid stale closure)
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // ── Fetch docs from Payload REST API ─────────────────────────────────────

  const fetchDocs = useCallback(async (collectionKey: CollectionKey, slug: string) => {
    try {
      const res = await fetch(
        `/api/${slug}?limit=200&depth=0&sort=-updatedAt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const docs: ContentDoc[] = (data.docs || []).map((d: any) => ({
        id:        String(d.id),
        title:     d.title || d.name || d.slug || d.id,
        slug:      d.slug,
        updatedAt: d.updatedAt,
      }))

      setStates((prev) => ({
        ...prev,
        [collectionKey]: {
          ...prev[collectionKey],
          docs,
          loading: false,
          error:   null,
        },
      }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setStates((prev) => ({
        ...prev,
        [collectionKey]: {
          ...prev[collectionKey],
          loading: false,
          error:   `Failed to load: ${msg}`,
        },
      }))
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    COLLECTIONS.forEach((col) => fetchDocs(col.key, col.slug))
  }, [token, fetchDocs])

  // ── Homepage revalidation (standalone) ─────────────────────────────────
  const [homepageStatus, setHomepageStatus] = useState<DocStatus>('idle')

  const revalidateHomepage = useCallback(async () => {
    if (homepageStatus === 'loading') return
    if (timerRefs.current['homepage']) clearTimeout(timerRefs.current['homepage'])
    setHomepageStatus('loading')
    try {
      const res = await fetch('/api/revalidate', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ collection: 'homepage' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setHomepageStatus('success')
      timerRefs.current['homepage'] = setTimeout(() => setHomepageStatus('idle'), 3000)
    } catch (err: unknown) {
      setHomepageStatus('error')
      timerRefs.current['homepage'] = setTimeout(() => setHomepageStatus('idle'), 4000)
      console.error('[CacheManager] Homepage revalidation error:', err)
    }
  }, [token, homepageStatus])

  // ── Revalidation ─────────────────────────────────────────────────────────

  const revalidate = useCallback(async (
    collectionKey: CollectionKey,
    slug: string | null,  // null = revalidate all
    isAll: boolean
  ) => {
    const timerKey = isAll ? `${collectionKey}:all` : `${collectionKey}:${slug}`

    // Clear any existing reset timer for this item
    if (timerRefs.current[timerKey]) clearTimeout(timerRefs.current[timerKey])

    // Set loading state
    setStates((prev) => ({
      ...prev,
      [collectionKey]: {
        ...prev[collectionKey],
        allStatus:   isAll ? 'loading' : prev[collectionKey].allStatus,
        docStatuses: isAll
          ? prev[collectionKey].docStatuses
          : { ...prev[collectionKey].docStatuses, [slug!]: 'loading' },
      },
    }))

    try {
      const body: Record<string, string> = { collection: collectionKey }
      if (slug) body.slug = slug

      const res = await fetch('/api/revalidate', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      // Success
      setStates((prev) => ({
        ...prev,
        [collectionKey]: {
          ...prev[collectionKey],
          allStatus:   isAll ? 'success' : prev[collectionKey].allStatus,
          docStatuses: isAll
            ? prev[collectionKey].docStatuses
            : { ...prev[collectionKey].docStatuses, [slug!]: 'success' },
        },
      }))

      // Auto-reset to idle after 3s
      timerRefs.current[timerKey] = setTimeout(() => {
        setStates((prev) => ({
          ...prev,
          [collectionKey]: {
            ...prev[collectionKey],
            allStatus:   isAll ? 'idle' : prev[collectionKey].allStatus,
            docStatuses: isAll
              ? prev[collectionKey].docStatuses
              : { ...prev[collectionKey].docStatuses, [slug!]: 'idle' },
          },
        }))
      }, 3000)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Revalidation failed'

      setStates((prev) => ({
        ...prev,
        [collectionKey]: {
          ...prev[collectionKey],
          allStatus:   isAll ? 'error' : prev[collectionKey].allStatus,
          docStatuses: isAll
            ? prev[collectionKey].docStatuses
            : { ...prev[collectionKey].docStatuses, [slug!]: 'error' },
        },
      }))

      // Auto-reset after 4s
      timerRefs.current[timerKey] = setTimeout(() => {
        setStates((prev) => ({
          ...prev,
          [collectionKey]: {
            ...prev[collectionKey],
            allStatus:   isAll ? 'idle' : prev[collectionKey].allStatus,
            docStatuses: isAll
              ? prev[collectionKey].docStatuses
              : { ...prev[collectionKey].docStatuses, [slug!]: 'idle' },
          },
        }))
      }, 4000)

      console.error('[CacheManager] Revalidation error:', message)
    }
  }, [token])

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', fontFamily: 'inherit' }}>

      {/* Keyframes for spinner */}
      <style>{`@keyframes cm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <h1 style={{
            margin:     0,
            fontSize:   '1.5rem',
            fontWeight:  700,
            color:      'var(--theme-text)',
          }}>
            Cache Manager
          </h1>
        </div>
        <p style={{
          margin:     0,
          color:      'var(--theme-elevation-500, #6b7280)',
          fontSize:   '0.875rem',
          lineHeight:  1.5,
        }}>
          Force-revalidate the Next.js ISR cache for specific pages or entire collections.
          Useful when content appears stale after a save, or after direct database edits.
        </p>
      </div>

      {/* Info callout */}
      <div style={{
        display:      'flex',
        gap:          '10px',
        padding:      '12px 16px',
        background:   'rgba(245,158,11,0.08)',
        border:       '1px solid rgba(245,158,11,0.25)',
        borderRadius: '6px',
        marginBottom: '24px',
        fontSize:     '0.8125rem',
        color:        'var(--theme-text)',
        lineHeight:    1.5,
      }}>
        <span style={{ flexShrink: 0, marginTop: '1px' }}>ℹ️</span>
        <div>
          <strong>How it works:</strong> Revalidating a page marks its Next.js cache as stale.
          The <em>next visitor</em> to that URL triggers a fresh server render.
          Pages already cached in Cloudflare or a CDN may need separate purging.
        </div>
      </div>

      {/* Homepage card — single-route revalidation, no doc list */}
      <div style={{
        background:   'var(--theme-elevation-0, #fff)',
        border:       '1px solid var(--theme-elevation-150, #e5e7eb)',
        borderRadius: '8px',
        marginBottom: '20px',
        overflow:     'hidden',
      }}>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '14px 18px',
          background:     'var(--theme-elevation-50, #f9fafb)',
          borderBottom:   '1px solid var(--theme-elevation-150, #e5e7eb)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem' }}>🏠</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--theme-text)' }}>
                Homepage
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400, #9ca3af)', marginTop: '2px' }}>
                Refreshes featured projects, blogs, and products on the homepage
              </div>
            </div>
          </div>

          <button
            onClick={revalidateHomepage}
            disabled={homepageStatus === 'loading'}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          '5px',
              padding:      '5px 14px',
              borderRadius: '4px',
              border:       `1px solid ${
                homepageStatus === 'success' ? '#10b98155'
                : homepageStatus === 'error' ? '#ef444455'
                : '#10b98144'
              }`,
              background:   homepageStatus === 'success' ? '#10b98110'
                          : homepageStatus === 'error'   ? '#ef444408'
                          : 'transparent',
              color:        homepageStatus === 'success' ? '#10b981'
                          : homepageStatus === 'error'   ? '#ef4444'
                          : '#10b981',
              fontSize:     '0.8rem',
              fontWeight:    600,
              cursor:       homepageStatus === 'loading' ? 'not-allowed' : 'pointer',
              transition:   'all 0.15s',
              fontFamily:   'inherit',
              whiteSpace:   'nowrap',
            }}
          >
            {homepageStatus === 'loading' && <><SpinIcon /> Revalidating…</>}
            {homepageStatus === 'success' && '✓ Revalidated'}
            {homepageStatus === 'error'   && '✗ Failed — Retry'}
            {homepageStatus === 'idle'    && <><RefreshSmallIcon color="#10b981" /> Revalidate Homepage</>}
          </button>
        </div>
      </div>

      {/* Collection panels */}
      {COLLECTIONS.map((col) => (
        <CollectionPanel
          key={col.key}
          collection={col}
          state={states[col.key]}
          onFilter={(val) =>
            setStates((prev) => ({
              ...prev,
              [col.key]: { ...prev[col.key], filter: val },
            }))
          }
          onRevalidateOne={(slug) => revalidate(col.key, slug, false)}
          onRevalidateAll={() => revalidate(col.key, null, true)}
        />
      ))}
    </div>
  )
}
