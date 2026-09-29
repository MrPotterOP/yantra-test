/**
 * CacheManagerNavLink — Custom Payload Admin Sidebar Navigation Item
 * ─────────────────────────────────────────────────────────────────────────────
 * Injected via payload.config.ts → admin.components.afterNavLinks
 * Renders a "Cache Manager" link in the admin sidebar below the standard nav.
 */
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function CacheManagerNavLink() {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/cache-manager')

  return (
    <div style={{ padding: '0 8px', marginTop: '2px' }}>
      <Link
        href="/admin/cache-manager"
        prefetch={false}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '8px 12px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize:     '0.875rem',
          fontWeight:    isActive ? 600 : 400,
          color:        isActive
            ? '#f59e0b'
            : 'var(--theme-elevation-800, #374151)',
          background:   isActive
            ? 'rgba(245,158,11,0.1)'
            : 'transparent',
          transition:   'background 0.15s, color 0.15s',
        }}
      >
        {/* Lightning bolt icon */}
        <svg
          width="15" height="15" viewBox="0 0 24 24"
          fill={isActive ? '#f59e0b' : 'none'}
          stroke={isActive ? '#f59e0b' : 'currentColor'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        Cache Manager
      </Link>
    </div>
  )
}
