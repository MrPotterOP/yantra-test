/**
 * SlugField — Custom Payload CMS field component
 * ─────────────────────────────────────────────────────────────────────────────
 * Replaces the default text input for "slug" fields with an identical input
 * plus an "Auto-generate" button that reads the sibling "title" field and
 * derives a normalised URL slug.
 *
 * Used by: Projects and Blogs collections.
 *
 * Registration in a field config:
 *   admin: { components: { Field: '@/components/payload/SlugField' } }
 */
'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

// ─── Shared slugify utility (mirrors the server-side hook) ────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface SlugFieldProps {
  field: {
    label?: string | Record<string, string>
    required?: boolean
  }
  path: string
  readOnly?: boolean
}

export default function SlugField({ field, path, readOnly }: SlugFieldProps) {
  const { value: slug, setValue: setSlug } = useField<string>({ path })
  // Watch the sibling title field — works because they share the same form context
  const { value: title } = useField<string>({ path: 'title' })

  const label =
    typeof field?.label === 'string'
      ? field.label
      : typeof field?.label === 'object'
      ? Object.values(field.label)[0]
      : 'Slug'

  const handleGenerate = () => {
    if (title) setSlug(slugify(String(title)))
  }

  return (
    <div className="field-type text" style={{ width: '100%' }}>
      {/* Mirror Payload's built-in label structure */}
      <label
        htmlFor={`field-${path}`}
        className="field-label"
        style={{ display: 'block', marginBottom: '8px' }}
      >
        {label}
        {field?.required && (
          <span className="required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {/* Slug text input — mirrors .text-input styles from Payload's admin */}
        <input
          id={`field-${path}`}
          type="text"
          value={String(slug ?? '')}
          onChange={(e) => !readOnly && setSlug(e.target.value)}
          readOnly={readOnly}
          placeholder="my-url-slug"
          className="text-input"
          style={{ flex: 1 }}
        />

        {/* Auto-generate button */}
        {!readOnly && (
          <button
            type="button"
            onClick={handleGenerate}
            title="Generate slug from the Title field"
            style={{
              padding: '0 14px',
              height: '40px',
              background: 'transparent',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b'
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Auto-generate
          </button>
        )}
      </div>

      {/* Hint text */}
      <p
        className="field-description"
        style={{ marginTop: '6px', fontSize: '0.75rem', opacity: 0.7 }}
      >
        URL identifier — e.g.{' '}
        <code style={{ fontFamily: 'monospace' }}>my-url-slug</code>.{' '}
        Click &ldquo;Auto-generate&rdquo; to derive from the title, or type
        manually.
      </p>
    </div>
  )
}
