/**
 * card-adapters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Leaf module — zero cross-adapter imports. Safe to import from any adapter
 * without creating circular dependencies.
 *
 * Exports the three card-prop mappers that are shared across detail adapters:
 *   - blogToCardProps
 *   - projectToCardProps
 *   - productToCardProps
 *
 * These are identical copies of the functions in their respective adapter
 * modules. The detail adapters (blog-, project-, product-adapter.js) import
 * the OTHER collections' card mappers from here, not from each other, which
 * breaks the circular dependency chain in ESM.
 *
 * Rule: DO NOT import anything from blog-, project-, or product-adapter.js
 * in this file. Only pure helpers and Payload-independent logic here.
 */

// ─── Shared media helpers ─────────────────────────────────────────────────────

function isValidImageSrc(str) {
  if (!str || typeof str !== 'string') return false
  if (/^[0-9a-f]{24}$/i.test(str)) return false
  if (str.startsWith('http://') || str.startsWith('https://')) return true
  if (str.startsWith('/')) return true
  return false
}

function resolveMediaUrl(field) {
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

function resolveCategoryName(categoryField) {
  if (!categoryField) return ''
  if (typeof categoryField === 'object') return categoryField.name || ''
  return ''
}

// ─── Blog date formatter ──────────────────────────────────────────────────────

function getOrdinal(n) {
  if (n > 3 && n < 21) return 'th'
  switch (n % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

function formatBlogDate(dateInput) {
  if (!dateInput) return ''
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return String(dateInput)
    const day = d.getDate()
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    return `${monthNames[d.getMonth()]} ${day}${getOrdinal(day)}, ${d.getFullYear()}`
  } catch {
    return String(dateInput)
  }
}

// ─── Excerpt extractor (mirrors blog-adapter) ─────────────────────────────────

function extractTextFromNode(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (node.text) return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join(' ')
  }
  return ''
}

function extractExcerpt(body, maxLength = 160) {
  if (!body) return ''
  let text = ''
  if (typeof body === 'string') {
    text = body.replace(/<[^>]+>/g, ' ')
  } else if (typeof body === 'object') {
    const root = body.root || body
    text = extractTextFromNode(root)
  }
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength).trim()}...`
}

// ─── Card prop mappers ────────────────────────────────────────────────────────

/**
 * blogToCardProps — shared card mapper for blog documents.
 * Shape: { slug, title, intro, coverImg, date }
 */
export function blogToCardProps(doc) {
  if (!doc) return null
  const rawDate = doc.date || doc.publishedAt || doc.createdAt
  return {
    slug:     doc.slug || '',
    title:    doc.title || '',
    intro:    extractExcerpt(doc.body, 140),
    coverImg: resolveMediaUrl(doc.coverImage) || '/images/sky2.jpg',
    date:     formatBlogDate(rawDate),
  }
}

/**
 * projectToCardProps — shared card mapper for project documents.
 * Shape: { slug, title, tag, location, intro, coverImg }
 */
export function projectToCardProps(doc) {
  if (!doc) return null
  const coverImg = resolveMediaUrl(doc.heroImage)
  return {
    slug:     doc.slug || '',
    title:    doc.title || '',
    tag:      resolveCategoryName(doc.category),
    location: doc.location || '',
    intro:    doc.storyDescription
      ? doc.storyDescription.replace(/\s+/g, ' ').slice(0, 200)
      : '',
    coverImg: coverImg || null,
  }
}

/**
 * productToCardProps — shared card mapper for product documents.
 * Shape: { slug, title, intro, coverImg, category }
 */
export function productToCardProps(doc) {
  if (!doc) return null
  const firstImage = (doc.images || [])[0]
  const coverImg = firstImage ? resolveMediaUrl(firstImage.image) : null
  return {
    slug:     doc.slug || '',
    title:    doc.title || '',
    intro:    doc.subtitle || (doc.description ? doc.description.slice(0, 160) + '...' : ''),
    coverImg: coverImg || null,
    category: doc.category || '',
  }
}
