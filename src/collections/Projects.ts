/**
 * Projects Collection
 * ─────────────────────────────────────────────────────────────────────────────
 * Core content type for Yantra's project showcase. Each project belongs to
 * exactly one category and contains a hero image, specifications (2–5 items),
 * a project story, and a gallery.
 *
 * All fields are required as per the product brief.
 *
 * Frontend rendering (unchanged components):
 *   Hero        → project.{ title, id, location, category, image, breadcrumbs }
 *   Specs       → specs [ { label, value } ]
 *   ProjectStory → story.{ title, description, image }
 *   Gallery     → images [ { url, alt } ]
 *   Carousel    → card.{ slug, title, tag, location, intro, coverImg }
 *
 * Admin features:
 *   - Auto-generate slug button (SlugField custom component)
 *   - Preview button in top action bar (disabled until required fields are filled)
 *   - Featured on Homepage toggle (controls home page showcase)
 *   - Many-to-many relationship with Blogs (relatedBlogs)
 */

import type {
  CollectionConfig,
  CollectionBeforeValidateHook,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { revalidatePath } from 'next/cache'

// ─── Slug utility (shared pattern across collections) ─────────────────────────
const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Auto-generate slug from title on create if slug field is left empty.
 * If slug is manually provided, normalise it through slugify.
 * This runs before any validation so the required-field check always passes.
 */
const autoSlugFromTitle: CollectionBeforeValidateHook = ({ data = {} }) => {
  if (!data.slug && data.title) {
    data.slug = slugify(data.title)
  } else if (data.slug) {
    data.slug = slugify(data.slug)
  }
  return data
}

/**
 * On save: revalidate the project listing page, the specific detail page,
 * and the homepage if this project is featured.
 */
const revalidateOnChange: CollectionAfterChangeHook = ({ doc }) => {
  try {
    revalidatePath('/project')
    if (doc?.slug) {
      revalidatePath(`/project/${doc.slug}`)
    }
    if (doc?.isFeatured) {
      revalidatePath('/')
    }
  } catch {
    // no-op outside request context (e.g. seeding scripts)
  }
}

/**
 * On delete: bust the listing page, the detail page, and the homepage.
 */
const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  try {
    revalidatePath('/project')
    if (doc?.slug) {
      revalidatePath(`/project/${doc.slug}`)
    }
    revalidatePath('/')
  } catch {
    // no-op outside request context
  }
}

// ─── Collection definition ────────────────────────────────────────────────────

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },

  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    useAsTitle: 'title',
    group: 'Projects',
    description: 'Project showcases for the Yantra portfolio.',
    defaultColumns: ['title', 'category', 'location', 'projectNumber', 'isFeatured', 'updatedAt'],

    /**
     * Payload's native preview URL generator.
     * Returns a URL → Payload renders its own "Preview" button in the action bar.
     * The button is only visible after the document has been saved (doc has an id + slug).
     * The URL opens the Next.js Draft Mode enabler which sets the __prerender_bypass
     * cookie and then redirects to the actual project page.
     */
    preview: (doc) => {
      const slug = doc?.slug
      if (!slug) return null  // no slug = no preview
      const secret = process.env.PAYLOAD_PREVIEW_SECRET
      if (!secret) return null
      const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${base}/api/preview?secret=${secret}&collection=projects&slug=${slug}`
    },
  },

  // ── Access ─────────────────────────────────────────────────────────────────
  access: {
    read: () => true,          // Public — used by ISR pages & public API
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  // ── Hooks ──────────────────────────────────────────────────────────────────
  hooks: {
    beforeValidate: [autoSlugFromTitle],
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
      label: 'Project Title',
      required: true,
      maxLength: 150,
      admin: {
        description:
          'Shown on the project card, hero, and browser tab. Maximum 150 characters.',
        placeholder: 'e.g. Crowne Plaza – Ortakoy Bosphorus Hotel',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      admin: {
        components: {
          Field: '@/components/payload/SlugField',
        },
        description:
          'URL path for the project page, e.g. /project/crowne-plaza-ortakoy. ' +
          'Click "Auto-generate" to derive from title, or type manually.',
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
    {
      name: 'projectNumber',
      type: 'text',
      label: 'Project Number',
      required: true,
      admin: {
        description: 'Internal reference number shown in the project hero (e.g. "1003").',
        placeholder: 'e.g. 1003',
        width: '50%',
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      required: true,
      admin: {
        description: 'City or region where the project was installed.',
        placeholder: 'e.g. Mumbai, Maharashtra',
        width: '50%',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Classification & Hero
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'project-categories' as any,
      hasMany: false,
      required: true,
      label: 'Category',
      admin: {
        description:
          'The project category (e.g. Residential, Commercial). ' +
          'Used on the listing page to group projects into category carousels.',
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
          'When checked, this project appears in the Featured Projects section on the home page.',
        position: 'sidebar',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Hero Image',
      admin: {
        description:
          'Full-width background image for the project hero section. ' +
          'Ideal size: 1920×1080px (landscape). Select from the Media library.',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Specifications
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'specifications',
      type: 'array',
      label: 'Specifications',
      required: true,
      minRows: 2,
      maxRows: 5,
      admin: {
        description:
          'Technical specs displayed in the specifications strip on the project page. ' +
          'Minimum 2 · Maximum 5 entries.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
          required: true,
          admin: {
            placeholder: 'e.g. System, Glazing, Material, Size',
            width: '40%',
          },
        },
        {
          name: 'value',
          type: 'text',
          label: 'Value',
          required: true,
          admin: {
            placeholder: 'e.g. Retractable Skylights, 10m × 40m',
            width: '60%',
          },
        },
      ],
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Story
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'storyTitle',
      type: 'text',
      label: 'Story Title',
      required: true,
      admin: {
        description:
          'Heading for the project story section (left-side text panel).',
        placeholder:
          'e.g. Combining Indoor Comfort with Outdoor Freedom Using SolaGlide Sliding Roof',
      },
    },
    {
      name: 'storyDescription',
      type: 'textarea',
      label: 'Story Description',
      required: true,
      admin: {
        description:
          'Narrative text describing the project. Shown with a "Read More" expand if too long. ' +
          'Plain text only — no markdown.',
        rows: 6,
      },
    },
    {
      name: 'storyImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Story Image',
      admin: {
        description:
          'Sticky image shown alongside the story text on the right. ' +
          'Ideal size: 800×1000px (portrait). Select from the Media library.',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 5 — Gallery
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: 'Gallery Images',
      admin: {
        description:
          'Select 2–10 images from the media library for the interactive gallery viewer. ' +
          'Images appear in the order selected.',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 6 — Related Content
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'relatedBlogs',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      required: false,
      label: 'Related Blog Posts',
      admin: {
        description:
          'Link blog articles that feature, reference, or discuss this project.',
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
          'Link products used in this project (e.g. windows, skylights). Displayed in a carousel below the project.',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      required: false,
      label: 'Related Projects',
      admin: {
        description:
          'Manually link similar or related projects. Overrides the auto-generated similar-by-category carousel.',
        position: 'sidebar',
      },
    },
  ],
}
