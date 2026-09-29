/**
 * Product Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functions that convert a Payload CMS "products" document (depth: 2)
 * into the exact prop shapes consumed by the existing frontend components.
 *
 * Component ↔ Adapter contract:
 *   ProductDetails.js ← product: { name, subtitle, description, breadcrumbs,
 *                                   images, specs, customizations, information }
 *   Product.js (card) ← data:    { slug, title, intro, coverImg, category }
 *   Carousel.js       ← data:    [ { slug, title, intro, coverImg } ]
 *
 * Rules (from frontend.md §3):
 * - Pure functions only — no DB calls, no side effects, no Next.js imports
 * - Takes a fully-populated Payload document (relationship fields resolved)
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { blogToCardProps, projectToCardProps } from './card-adapters.js'

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

/** Resolve a Payload upload/relationship field to its URL string safely. */
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

/** Resolve alt text from a media field safely. */
function resolveMediaAlt(field, fallback = '') {
  if (!field || typeof field !== 'object') return fallback
  return field.alt || field.altText || field.filename || fallback
}

/**
 * Stable deterministic ID from an index (for configurator and accordion state).
 * Payload array items don't have guaranteed stable IDs in all contexts.
 */
function makeId(prefix, index) {
  return `${prefix}-${index}`
}

// ─── Card Adapter ─────────────────────────────────────────────────────────────

/**
 * productToCardProps
 *
 * Used by: Product.js card, Carousel type="product", /products listing page
 *
 * @param {object} doc  Payload products document (depth: 1 minimum)
 * @returns {{ slug, title, intro, coverImg, category }}
 */
export function productToCardProps(doc) {
  if (!doc) return null

  // First valid image from the images array (depth:1 populates the upload field)
  const firstImage = (doc.images || [])[0]
  const coverImg = firstImage ? resolveMediaUrl(firstImage.image) : null

  return {
    slug: doc.slug || '',
    title: doc.title || '',
    // Use subtitle as the card intro; fall back to description excerpt
    intro: doc.subtitle || (doc.description ? doc.description.slice(0, 160) + '...' : ''),
    coverImg: coverImg || null,
    category: doc.category || '',
  }
}

// ─── Detail Adapter ───────────────────────────────────────────────────────────

/**
 * productToDetailProps
 *
 * Used by: /products/[slug]/page.js (ISR Server Component)
 *
 * Returns the exact shape consumed by ProductDetails.js.
 *
 * @param {object} doc  Payload products document (depth: 2)
 * @returns {{ product, relatedProjects, relatedProducts, relatedBlogs }}
 */
export function productToDetailProps(doc) {
  if (!doc) return null

  // ── Images gallery ────────────────────────────────────────────────────────
  // ProductDetails.js expects: product.images = [{ url, alt, thumbUrl }]
  const images = (doc.images || [])
    .map((entry, i) => {
      const url = resolveMediaUrl(entry.image)
      if (!url) return null
      const mediaDoc = typeof entry.image === 'object' ? entry.image : null
      const alt =
        entry.alt ||
        (mediaDoc ? resolveMediaAlt(mediaDoc, doc.title || 'Product image') : doc.title || 'Product image')
      // Use the card-size Cloudinary URL for the thumbnail strip if available
      const thumbUrl = mediaDoc?.sizes?.card?.url || mediaDoc?.sizes?.thumbnail?.url || url
      return { url, alt, thumbUrl }
    })
    .filter(Boolean)

  // ── Specs ─────────────────────────────────────────────────────────────────
  // ProductDetails.js expects: product.specs = [{ label, value }]
  const specs = (doc.specs || []).map((s) => ({
    label: s.label || '',
    value: s.value || '',
  }))

  // ── Customizations ────────────────────────────────────────────────────────
  // ProductDetails.js expects: product.customizations = [{
  //   id, title, type, choices: [{ id, name, value }]
  // }]
  const customizations = (doc.customizations || []).map((opt, i) => ({
    id: opt.id || makeId('custom', i),
    title: opt.title || '',
    type: opt.type || 'text', // 'color' | 'image' | 'text'
    choices: (opt.choices || []).map((c, j) => ({
      id: c.id || makeId(`choice-${i}`, j),
      name: c.name || '',
      value: c.value || '',
    })),
  }))

  // ── Support / Information ─────────────────────────────────────────────────
  // ProductDetails.js expects: product.information = [{
  //   id, title, content
  // }]
  const information = (doc.support || []).map((item, i) => ({
    id: item.id || makeId('info', i),
    title: item.title || '',
    content: item.content || '',
  }))

  // ── Product shape ─────────────────────────────────────────────────────────
  const product = {
    name: doc.title || '',
    subtitle: doc.subtitle || '',
    description: doc.description || '',
    breadcrumbs: ['Home', doc.category || 'Products', doc.title || ''],
    images,
    specs,
    customizations,
    information,
  }

  // ── M2M Related content ───────────────────────────────────────────────────
  // Related products (self-referential — same collection)
  const relatedProducts = (doc.relatedProducts || [])
    .filter((p) => p && typeof p === 'object')
    .map(productToCardProps)
    .filter(Boolean)

  // Related projects
  const relatedProjects = (doc.relatedProjects || [])
    .filter((p) => p && typeof p === 'object')
    .map(projectToCardProps)
    .filter(Boolean)

  // Related blogs
  const relatedBlogs = (doc.relatedBlogs || [])
    .filter((b) => b && typeof b === 'object')
    .map(blogToCardProps)
    .filter(Boolean)

  return { product, relatedProducts, relatedProjects, relatedBlogs }
}

// ─── Related content adapters ─────────────────────────────────────────────────

/**
 * productRelatedProjects
 *
 * Adapts the relatedProjects array on a product doc to project card props.
 * Import projectToCardProps from project-adapter to avoid duplication.
 *
 * @param {object} doc  Fully populated products document
 * @returns {object[]} Array of project card props
 */
export function productRelatedProjects(doc) {
  // Dynamic import of project-adapter to stay dependency-free at module level
  // The caller should handle this — see usage in the page component
  return (doc.relatedProjects || []).filter((p) => p && typeof p === 'object')
}

/**
 * productRelatedProducts
 *
 * Adapts the relatedProducts array on a product doc to product card props.
 *
 * @param {object} doc  Fully populated products document
 * @returns {object[]} Array of product card props
 */
export function productRelatedProducts(doc) {
  return (doc.relatedProducts || [])
    .filter((p) => p && typeof p === 'object')
    .map(productToCardProps)
    .filter(Boolean)
}
