/**
 * Blogs Collection
 * ─────────────────────────────────────────────────────────────────────────────
 * Blog articles for the Yantra website. Uses the Payload Lexical rich-text
 * editor for the body, with full image-from-media support built in.
 *
 * Data contract (what the frontend components expect):
 *   BlogHero.js   → post: { title, date, author, image }
 *   BlogBody.js   → htmlContent: string  (converted from Lexical JSON on read)
 *   Blog.js card  → data: { slug, title, intro, coverImg, date }
 *
 * Admin features:
 *   - "Auto-generate" slug button (SlugField custom component)
 *   - "Preview ↗" action button (PreviewButton) — enabled only when required fields filled
 *   - isFeatured toggle → controls homepage featured blogs showcase
 *   - Many-to-many: relatedProjects, relatedBlogs (self-referential)
 *   - date (auto-set on creation, auto-updated, editable for back-dating)
 *   - Lexical rich-text editor with image upload from Media library
 *
 * ISR: afterChange hooks call revalidatePath to bust the static cache instantly.
 */

import type {
  CollectionConfig,
  CollectionBeforeValidateHook,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { lexicalEditor, lexicalHTMLField } from '@payloadcms/richtext-lexical'
import { revalidatePath } from 'next/cache'

// ─── Slug utility ─────────────────────────────────────────────────────────────
const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

// ─── Hooks ────────────────────────────────────────────────────────────────────

const autoSlugFromTitle: CollectionBeforeValidateHook = ({ data = {} }) => {
  if (!data.slug && data.title) {
    data.slug = slugify(data.title)
  } else if (data.slug) {
    data.slug = slugify(data.slug)
  }
  return data
}

/** Auto-set date on creation if not manually specified. */
const setDateHook: CollectionBeforeValidateHook = ({ data = {}, operation }) => {
  if (operation === 'create' && !data.date) {
    data.date = new Date().toISOString()
  }
  return data
}

const revalidateOnChange: CollectionAfterChangeHook = ({ doc }) => {
  try {
    revalidatePath('/blog')
    if (doc?.slug) {
      revalidatePath(`/blog/${doc.slug}`)
    }
    // If this is a featured post it also affects the home page blog section
    if (doc?.isFeatured) {
      revalidatePath('/')
    }
  } catch {
    // no-op outside request context
  }
}

const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  try {
    revalidatePath('/blog')
    if (doc?.slug) {
      revalidatePath(`/blog/${doc.slug}`)
    }
    revalidatePath('/') // in case this was featured
  } catch {
    // no-op outside request context
  }
}

// ─── Collection ───────────────────────────────────────────────────────────────

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  labels: { singular: 'Blog Post', plural: 'Blog Posts' },

  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Blog articles and architectural insights published on the Yantra website.',
    defaultColumns: ['title', 'author', 'date', 'isFeatured', 'updatedAt'],

    /**
     * Payload native preview URL — renders the CMS's built-in "Preview" button.
     * Enabled only after save (when doc.slug exists).
     */
    preview: (doc) => {
      const slug = doc?.slug
      if (!slug) return null
      const secret = process.env.PAYLOAD_PREVIEW_SECRET
      if (!secret) return null
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${base}/api/preview?secret=${secret}&collection=blogs&slug=${slug}`
    },
  },

  // ── Access ─────────────────────────────────────────────────────────────────
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  // ── Hooks ──────────────────────────────────────────────────────────────────
  hooks: {
    beforeValidate: [setDateHook, autoSlugFromTitle],
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },

  // ── Fields ─────────────────────────────────────────────────────────────────
  fields: [

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 1 — Identity
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      required: true,
      admin: {
        placeholder: 'e.g. Why Aluminium Windows Outperform uPVC in Indian Climates',
        description: 'Shown in the blog hero, card, and browser tab.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      // Replace the default input with our custom auto-generate component
      admin: {
        components: {
          Field: '@/components/payload/SlugField',
        },
        description: 'URL identifier for the article (e.g. /blog/understanding-aluminium-windows).',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) return slugify(data.title)
            if (value) return slugify(value)
            return value
          },
        ],
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Meta (sidebar)
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'date',
      type: 'date',
      label: 'Published Date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'do MMM yyyy, h:mm a',
        },
        description: 'Auto-set on creation. Adjust if scheduling or back-dating.',
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'text',
      label: 'Author',
      required: true,
      defaultValue: 'Yantra Editorial Team',
      admin: {
        placeholder: 'e.g. Yantra Editorial Team',
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Featured on Homepage',
      defaultValue: false,
      admin: {
        description:
          'When checked, this article appears in the Featured Articles section on the home page.',
        position: 'sidebar',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Cover image
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Cover Image',
      admin: {
        description:
          'Wide landscape image shown in the blog hero and on listing cards. ' +
          'Ideal: 1200×628px. Select from the Media library.',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Body (Lexical rich text)
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'body',
      type: 'richText',
      label: 'Body / Content',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
        ],
      }),
      admin: {
        description:
          'Rich text editor. Use the toolbar to add headings, lists, links, blockquotes, and media images ' +
          'from the Media library. Images are served via Cloudinary CDN.',
      },
    },

    // Virtual field converting lexical body to HTML for fast reading
    lexicalHTMLField({
      lexicalFieldName: 'body',
      htmlFieldName: 'body_html',
    }),

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 5 — Relations (sidebar)
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      required: false,
      label: 'Related Projects',
      admin: {
        description:
          'Link projects referenced in this article. Displayed in a carousel below the article.',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedBlogs',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      required: false,
      label: 'Related Articles',
      admin: {
        description:
          'Link related blog articles. Displayed in a "Related Articles" carousel.',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: false,
      label: 'Related Products',
      admin: {
        description:
          'Link products featured or discussed in this article. Displayed in a carousel below the article.',
        position: 'sidebar',
      },
    },
  ],
}
