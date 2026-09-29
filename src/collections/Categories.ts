/**
 * Project Categories Collection
 *
 * Taxonomy for grouping Projects. Examples: Residential, Commercial,
 * Hotel & Restaurant, Hospitality, etc.
 *
 * One project → one category (enforced on the Projects collection side).
 * Categories are public-readable so the frontend can build category-filtered
 * project listing carousels without auth.
 */

import type { CollectionConfig, CollectionBeforeValidateHook, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

// ─── Slug utility ─────────────────────────────────────────────────────────────
const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip non-alphanumeric (except space/hyphen)
    .replace(/[\s_]+/g, '-')    // spaces/underscores → hyphens
    .replace(/-+/g, '-')        // collapse multiple hyphens
    .replace(/^-|-$/g, '')      // trim leading/trailing hyphens

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Auto-generate slug from name if the slug field is left empty. */
const autoSlugFromName: CollectionBeforeValidateHook = ({ data = {} }) => {
  if (!data.slug && data.name) {
    data.slug = slugify(data.name)
  } else if (data.slug) {
    data.slug = slugify(data.slug) // normalise manually-typed slugs
  }
  return data
}

/** Revalidate the project listing page when a category changes. */
const revalidateOnChange: CollectionAfterChangeHook = () => {
  try {
    revalidatePath('/project')
  } catch {
    // revalidatePath can fail outside an active request context (e.g. seed scripts)
  }
}

/** Revalidate on category delete as well. */
const revalidateOnDelete: CollectionAfterDeleteHook = () => {
  try {
    revalidatePath('/project')
  } catch {
    // no-op if outside request context
  }
}

// ─── Collection definition ────────────────────────────────────────────────────

export const Categories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: 'Project Category',
    plural: 'Project Categories',
  },

  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    useAsTitle: 'name',
    group: 'Projects',
    description:
      'Categories for grouping projects (e.g. Residential, Commercial, Hospitality). ' +
      'Each project belongs to exactly one category.',
    defaultColumns: ['name', 'slug', 'updatedAt'],
  },

  // ── Access ─────────────────────────────────────────────────────────────────
  access: {
    // Public read so the frontend can fetch categories without auth
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  // ── Hooks ──────────────────────────────────────────────────────────────────
  hooks: {
    beforeValidate: [autoSlugFromName],
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },

  // ── Fields ─────────────────────────────────────────────────────────────────
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Category Name',
      required: true,
      maxLength: 80,
      admin: {
        placeholder: 'e.g. Residential, Commercial, Hotel & Restaurant',
        description: 'Displayed as a tag/pill on project cards and in the site navigation.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      unique: true,
      admin: {
        description:
          'URL-safe identifier — auto-generated from the name if left blank. ' +
          'Used in filter queries on the project listing page.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) return slugify(data.name)
            if (value) return slugify(value)
            return value
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description:
          'Optional short description shown on the category filter page (future). ' +
          'Not currently rendered on the frontend.',
        rows: 3,
      },
    },
  ],
}
