/**
 * Project Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functions that convert a Payload CMS "projects" document (depth: 2)
 * into the exact prop shapes consumed by the existing frontend components.
 *
 * Rules (from frontend.md §3):
 * - Pure functions only — no DB calls, no side effects, no Next.js imports
 * - Takes a fully-populated Payload document (relationship fields resolved)
 * - Returns the exact shape the UI component expects — nothing more
 *
 * Component ↔ Adapter contract:
 *
 *   Hero.js           ← project: { title, id, location, category, image, breadcrumbs }
 *   Specifications.js ← specs:   [{ label, value }]            (2–5 items)
 *   ProjectStory.js   ← story:   { title, description, image }
 *   ProjectGallery.js ← images:  [{ url, alt }]
 *   Project.js (card) ← data:    { slug, title, tag, location, intro, coverImg }
 */

import { blogToCardProps, productToCardProps } from './card-adapters.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns true if the string is a valid absolute URL or absolute path that
 * next/image can accept. Rejects bare MongoDB ObjectIds (24-char hex strings)
 * and any other value that would crash next/image.
 */
function isValidImageSrc(str) {
  if (!str || typeof str !== 'string') return false
  // MongoDB ObjectId — 24 hex chars. Must NOT reach next/image.
  if (/^[0-9a-f]{24}$/i.test(str)) return false
  // Must be absolute URL or root-relative path
  if (str.startsWith('http://') || str.startsWith('https://')) return true
  if (str.startsWith('/')) return true
  return false
}

/** Resolve a Payload upload/relationship field to its URL string safely. */
function resolveMediaUrl(field) {
  if (!field) return ''
  // If it's already a populated media document, extract the URL
  if (typeof field === 'object') {
    const url = field.url || field.thumbnailURL || ''
    return isValidImageSrc(url) ? url : ''
  }
  // String: could be a pre-resolved URL or a raw ID — validate before returning
  if (typeof field === 'string') {
    return isValidImageSrc(field) ? field : ''
  }
  return ''
}

/** Resolve a Payload upload/relationship field to alt text safely. */
function resolveMediaAlt(field, fallback = '') {
  if (!field || typeof field !== 'object') return fallback
  // Payload Media collection stores alt in `altText` if we add the field,
  // otherwise fall back to the filename
  return field.altText || field.filename || fallback
}

/** Resolve a populated category relationship to its name string. */
function resolveCategoryName(categoryField) {
  if (!categoryField) return ''
  if (typeof categoryField === 'object') return categoryField.name || ''
  return '' // raw ID — shouldn't happen at depth >= 1
}

// ─── Card adapter ─────────────────────────────────────────────────────────────

/**
 * projectToCardProps
 *
 * Used by: Project.js card, Carousel type="project"
 *
 * @param {object} doc  Payload projects document (depth: 1 minimum)
 * @returns {{ slug, title, tag, location, intro, coverImg }}
 */
export function projectToCardProps(doc) {
  const coverImg = resolveMediaUrl(doc.heroImage)
  return {
    slug: doc.slug || '',
    title: doc.title || '',
    // "tag" is what Project.js renders as the category pill
    tag: resolveCategoryName(doc.category),
    location: doc.location || '',
    // "intro" is the first 200 chars of the story description used on the card
    intro: doc.storyDescription
      ? doc.storyDescription.replace(/\s+/g, ' ').slice(0, 200)
      : '',
    // coverImg is null if we cannot resolve a valid URL — the card renders a fallback
    coverImg: coverImg || null,
  }
}

// ─── Detail adapter ───────────────────────────────────────────────────────────

/**
 * projectToDetailProps
 *
 * Used by: /projects/[slug]/page.js (ISR Server Component)
 *
 * @param {object} doc  Payload projects document (depth: 2 — all relationships populated)
 * @returns {{ project, specs, story, images, relatedProjects, relatedBlogs, relatedProducts }}
 */
export function projectToDetailProps(doc) {
  // ── Hero ────────────────────────────────────────────────────────────────
  const project = {
    title: doc.title || '',
    id: doc.projectNumber || '',
    location: doc.location || '',
    category: resolveCategoryName(doc.category),
    image: resolveMediaUrl(doc.heroImage),
    // Breadcrumbs used in the Hero component's nav trail
    breadcrumbs: ['Home', 'Projects', doc.title || 'Project'],
  }

  // ── Specifications ──────────────────────────────────────────────────────
  // Payload array field; already in { label, value } shape — just slice to safety
  const specs = (doc.specifications || [])
    .slice(0, 5)
    .map(({ label, value }) => ({ label: label || '', value: value || '' }))

  // ── Story ────────────────────────────────────────────────────────────────
  const story = {
    title: doc.storyTitle || '',
    description: doc.storyDescription || '',
    image: resolveMediaUrl(doc.storyImage),
  }

  // ── Gallery ──────────────────────────────────────────────────────────────
  const images = (doc.gallery || [])
    .map((item) => ({
      url: resolveMediaUrl(item),
      alt: resolveMediaAlt(item, doc.title || 'Project image'),
    }))
    .filter((img) => img.url)

  // ── M2M Related content ───────────────────────────────────────────────────

  // Related projects (manually curated, self-referential)
  const relatedProjects = (doc.relatedProjects || [])
    .filter((p) => p && typeof p === 'object' && p.slug !== doc.slug)
    .map(projectToCardProps)
    .filter(Boolean)

  // Related blogs
  const relatedBlogs = (doc.relatedBlogs || [])
    .filter((b) => b && typeof b === 'object')
    .map(blogToCardProps)
    .filter(Boolean)

  // Related products
  const relatedProducts = (doc.relatedProducts || [])
    .filter((p) => p && typeof p === 'object')
    .map(productToCardProps)
    .filter(Boolean)

  return { project, specs, story, images, relatedProjects, relatedBlogs, relatedProducts }
}

// ─── Category-grouped listing adapter ────────────────────────────────────────

/**
 * groupProjectsByCategory
 *
 * Used by: /project/page.js (listing page — category-wise carousels)
 *
 * @param {object[]} docs  Array of Payload projects documents (depth: 1)
 * @param {object[]} categories  Array of Payload project-categories documents
 * @returns {{ id, name, slug, projects: CardProps[] }[]}
 */
export function groupProjectsByCategory(docs, categories) {
  // Build a lookup: categoryId → cardProps[]
  const map = {}
  for (const doc of docs) {
    const catId =
      doc.category && typeof doc.category === 'object'
        ? doc.category.id
        : doc.category
    if (!catId) continue
    if (!map[catId]) map[catId] = []
    map[catId].push(projectToCardProps(doc))
  }

  // Order by the categories array (maintains display order from CMS)
  return categories
    .filter((cat) => map[cat.id] && map[cat.id].length > 0)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      projects: map[cat.id],
    }))
}
