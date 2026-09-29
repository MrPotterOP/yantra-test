/**
 * Blog Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functions that convert a Payload CMS "blogs" document (depth: 2)
 * into the exact prop shapes consumed by the existing frontend components.
 *
 * Component ↔ Adapter contract:
 *   Hero.js (BlogPage/Hero)  ← post: { title, date, author, image }
 *   Body.js (BlogPage/Body)  ← htmlContent: string (converted from Lexical AST)
 *   Blog.js (Blogs/Blog)     ← data: { slug, title, intro, coverImg, date }
 *   Carousel.js (type=blog)  ← data: [ { slug, title, intro, coverImg, date } ]
 *
 * Rules (from frontend.md §3):
 * - Pure functions only — no direct DB calls, no side effects
 * - Takes fully-populated Payload documents
 * - Converts Lexical rich-text AST into semantic HTML with Cloudinary image URLs
 */

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { projectToCardProps, productToCardProps } from './card-adapters.js'

// ─── Media Helpers ────────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid absolute URL or absolute path that
 * next/image can accept. Rejects bare MongoDB ObjectIds (24-char hex strings).
 */
function isValidImageSrc(str) {
  if (!str || typeof str !== 'string') return false
  if (/^[0-9a-f]{24}$/i.test(str)) return false // bare MongoDB ObjectId
  if (str.startsWith('http://') || str.startsWith('https://')) return true
  if (str.startsWith('/')) return true
  return false
}

/** Resolve a Payload upload field to its CDN URL string safely. */
export function resolveMediaUrl(field) {
  if (!field) return ''
  if (typeof field === 'object') {
    const url = field.url || field.thumbnailURL || ''
    return isValidImageSrc(url) ? url : ''
  }
  if (typeof field === 'string') {
    return isValidImageSrc(field) ? field : ''
  }
  return ''
}

/** Resolve alt text from a media field safely. */
export function resolveMediaAlt(field, fallback = '') {
  if (!field || typeof field !== 'object') return fallback
  return field.altText || field.filename || fallback
}

// ─── Date Formatting ──────────────────────────────────────────────────────────

/**
 * Formats an ISO date string into standard blog format:
 * e.g. "2024-12-04T10:00:00.000Z" → "December 4th, 2024"
 */
export function formatBlogDate(dateInput) {
  if (!dateInput) return ''
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return String(dateInput)

    const day = d.getDate()
    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return 'th'
      switch (n % 10) {
        case 1:
          return 'st'
        case 2:
          return 'nd'
        case 3:
          return 'rd'
        default:
          return 'th'
      }
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    return `${monthNames[d.getMonth()]} ${day}${getOrdinal(day)}, ${d.getFullYear()}`
  } catch {
    return String(dateInput)
  }
}

// ─── Text / Excerpt Extraction ────────────────────────────────────────────────

/**
 * Recursively extracts plain text from a Lexical serialized AST node.
 */
function extractTextFromLexicalNode(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (node.text) return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromLexicalNode).join(' ')
  }
  return ''
}

/**
 * Extracts a concise plain-text excerpt for card intros.
 */
export function extractExcerpt(body, maxLength = 160) {
  if (!body) return ''
  let text = ''

  if (typeof body === 'string') {
    text = body.replace(/<[^>]+>/g, ' ')
  } else if (typeof body === 'object') {
    const root = body.root || body
    text = extractTextFromLexicalNode(root)
  }

  // Normalize whitespaces
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trim()}...`
}

// ─── Lexical AST to HTML Converter ────────────────────────────────────────────

/**
 * Robust fallback serializer for Lexical AST nodes.
 * Handles headings, paragraphs, lists, quotes, links, inline formats, and image uploads.
 */
function serializeNodeToHtml(node) {
  if (!node) return ''

  // Text node
  if (node.type === 'text') {
    let text = node.text || ''
    // Format bitmask in Lexical: 1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code
    const format = node.format || 0
    if (format & 1) text = `<strong>${text}</strong>`
    if (format & 2) text = `<em>${text}</em>`
    if (format & 4) text = `<s>${text}</s>`
    if (format & 8) text = `<u>${text}</u>`
    if (format & 16) text = `<code>${text}</code>`
    return text
  }

  const childrenHtml = Array.isArray(node.children)
    ? node.children.map(serializeNodeToHtml).join('')
    : ''

  switch (node.type) {
    case 'heading': {
      const tag = node.tag || 'h2'
      return `<${tag}>${childrenHtml}</${tag}>`
    }
    case 'paragraph': {
      return childrenHtml ? `<p>${childrenHtml}</p>` : ''
    }
    case 'quote': {
      return `<blockquote>${childrenHtml}</blockquote>`
    }
    case 'list': {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${childrenHtml}</${tag}>`
    }
    case 'listitem': {
      return `<li>${childrenHtml}</li>`
    }
    case 'link': {
      const url = node.fields?.url || '#'
      const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${url}"${newTab}>${childrenHtml}</a>`
    }
    case 'upload': {
      const uploadDoc = node.value
      if (!uploadDoc || typeof uploadDoc !== 'object') return ''
      const url = uploadDoc.url || ''
      if (!url) return ''
      const alt = uploadDoc.altText || uploadDoc.filename || 'Blog illustration'
      const caption = uploadDoc.caption ? `<em>${uploadDoc.caption}</em>` : ''
      return `<img src="${url}" alt="${alt}" loading="lazy" />${caption}`
    }
    case 'horizontalrule': {
      return '<hr />'
    }
    case 'linebreak': {
      return '<br />'
    }
    default: {
      return childrenHtml
    }
  }
}

/**
 * Converts Lexical rich text AST into clean, semantic HTML string.
 * Guards against null/empty/malformed data before calling the Payload converter
 * to prevent "w is not a function" TypeError crashes.
 */
export function lexicalToHtml(body) {
  if (!body) return ''
  if (typeof body === 'string') return body

  // Validate that the data has the expected Lexical shape before converting
  const hasValidLexicalData =
    typeof body === 'object' &&
    body !== null &&
    body.root &&
    typeof body.root === 'object' &&
    Array.isArray(body.root.children) &&
    body.root.children.length > 0

  if (!hasValidLexicalData) return ''

  // Try the official Payload sync converter
  try {
    const html = convertLexicalToHTML({
      data: body,
      disableContainer: true,
    })
    if (html && typeof html === 'string' && html.trim()) {
      return html
    }
  } catch (err) {
    // Log to help debugging but don't crash — fall through to custom serializer
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[blog-adapter] convertLexicalToHTML failed, using fallback serializer:', err?.message)
    }
  }

  // Fallback serializer — pure JS, handles all standard Lexical node types
  try {
    const root = body.root || body
    if (Array.isArray(root.children)) {
      return root.children.map(serializeNodeToHtml).join('\n')
    }
  } catch {
    // Return empty on total parse failure — never throw to the caller
  }

  return ''
}


// ─── Card Adapter ─────────────────────────────────────────────────────────────

/**
 * blogToCardProps
 * Used by: Blog.js card, Carousel type="blog", and Blogs listing track
 *
 * @param {object} doc  Payload blogs document
 * @returns {{ slug, title, intro, coverImg, date }}
 */
export function blogToCardProps(doc) {
  if (!doc) return null

  const rawDate = doc.date || doc.publishedAt || doc.createdAt
  return {
    slug: doc.slug || '',
    title: doc.title || '',
    intro: extractExcerpt(doc.body, 140),
    coverImg: resolveMediaUrl(doc.coverImage) || '/images/sky2.jpg',
    date: formatBlogDate(rawDate),
  }
}

// ─── Detail Adapter ───────────────────────────────────────────────────────────

/**
 * blogToDetailProps
 * Used by: /blog/[slug]/page.js (ISR Server Component)
 *
 * @param {object} doc  Payload blogs document (depth: 2)
 * @returns {{ post, htmlContent, relatedProjects, relatedBlogs, relatedProducts }}
 */
export function blogToDetailProps(doc) {
  if (!doc) return null

  const rawDate = doc.date || doc.publishedAt || doc.createdAt
  const post = {
    title: doc.title || '',
    date: formatBlogDate(rawDate),
    author: doc.author || 'Yantra Editorial Team',
    image: resolveMediaUrl(doc.coverImage) || '/images/sky2.jpg',
  }

  // Convert Lexical body or use pre-calculated body_html
  const htmlContent = doc.body_html || lexicalToHtml(doc.body)

  // Map related projects to project card shapes
  const relatedProjects = (doc.relatedProjects || [])
    .filter((p) => p && typeof p === 'object')
    .map(projectToCardProps)
    .filter(Boolean)

  // Map related blogs to blog card shapes (excluding self)
  const relatedBlogs = (doc.relatedBlogs || [])
    .filter((b) => b && typeof b === 'object' && b.slug !== doc.slug)
    .map(blogToCardProps)
    .filter(Boolean)

  // Map related products to product card shapes
  const relatedProducts = (doc.relatedProducts || [])
    .filter((p) => p && typeof p === 'object')
    .map(productToCardProps)
    .filter(Boolean)

  return {
    post,
    htmlContent,
    relatedProjects,
    relatedBlogs,
    relatedProducts,
  }
}
