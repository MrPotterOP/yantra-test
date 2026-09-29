/**
 * Products Collection
 * ─────────────────────────────────────────────────────────────────────────────
 * Yantra product catalogue. Each product can have multiple images (gallery),
 * a customisation configurator (colour/text/image choices), technical specs,
 * and a support/documentation accordion.
 *
 * Frontend rendering (ProductDetails.js prop shape):
 *   product.name          — main H1 title
 *   product.subtitle      — sub-heading
 *   product.description   — narrative paragraph
 *   product.breadcrumbs   — nav trail [ 'Home', category, title ]
 *   product.images        — [{ url, alt, thumbUrl }]
 *   product.specs         — [{ label, value }]
 *   product.customizations— [{ id, title, type, choices: [{ id, name, value }] }]
 *   product.information   — [{ id, title, content }]  ← Support & Documentation
 *
 * Admin features:
 *   - Auto-generate slug from title (SlugField custom component)
 *   - Preview button when required fields are filled
 *   - Featured on Homepage toggle
 *   - M2M relationships: relatedProjects, relatedBlogs, relatedProducts
 */

import type {
  CollectionConfig,
  CollectionBeforeValidateHook,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
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

const revalidateOnChange: CollectionAfterChangeHook = ({ doc }) => {
  try {
    revalidatePath('/products')
    if (doc?.slug) {
      revalidatePath(`/products/${doc.slug}`)
    }
    if (doc?.isFeatured) {
      revalidatePath('/')
    }
  } catch {
    // no-op outside request context
  }
}

const revalidateOnDelete: CollectionAfterDeleteHook = ({ doc }) => {
  try {
    revalidatePath('/products')
    if (doc?.slug) {
      revalidatePath(`/products/${doc.slug}`)
    }
    revalidatePath('/')
  } catch {
    // no-op outside request context
  }
}

// ─── Collection definition ────────────────────────────────────────────────────

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },

  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    useAsTitle: 'title',
    group: 'Products',
    description: 'Yantra product catalogue — windows, doors, skylights, and glazing systems.',
    defaultColumns: ['title', 'category', 'isFeatured', 'updatedAt'],

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
      return `${base}/api/preview?secret=${secret}&collection=products&slug=${slug}`
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
    beforeValidate: [autoSlugFromTitle],
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },

  // ── Fields ─────────────────────────────────────────────────────────────────
  fields: [

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 1 — Identity
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      label: 'Product Name',
      required: true,
      maxLength: 150,
      admin: {
        description: 'Full product name shown in the H1, cards, and browser tab.',
        placeholder: 'e.g. SolaGlide Sliding Windows',
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
          'URL path for the product page, e.g. /products/solaglide-sliding-windows. ' +
          'Click "Auto-generate" to derive from title.',
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
      name: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      required: true,
      maxLength: 200,
      admin: {
        description: 'Short subtitle shown below the product name on the detail page.',
        placeholder: 'e.g. Smooth horizontal sliding with slim aluminium frames',
      },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Category',
      required: true,
      admin: {
        description:
          'Product category for breadcrumb navigation (e.g. "Window System", "Door System").',
        placeholder: 'e.g. Window System',
        position: 'sidebar',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Featured on Homepage',
      defaultValue: false,
      admin: {
        description: 'When checked, this product appears in the Products section on the home page.',
        position: 'sidebar',
      },
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Media
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'images',
      type: 'array',
      label: 'Product Images',
      required: true,
      minRows: 1,
      admin: {
        description:
          'Product gallery images. The first image is shown as the cover on listing cards. ' +
          'Add multiple for the detail-page image carousel.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Image',
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
          admin: {
            description: 'Alt text for accessibility. Leave blank to use the media library alt.',
            placeholder: 'e.g. SolaGlide sliding window installed in a Mumbai villa',
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Content
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      admin: {
        description: 'Main product narrative paragraph shown below the subtitle on the detail page.',
        rows: 6,
        placeholder:
          'Describe the product — its design philosophy, key benefits, and typical use cases.',
      },
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Technical Specifications
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'specs',
      type: 'array',
      label: 'Technical Specifications',
      required: true,
      minRows: 1,
      maxRows: 12,
      admin: {
        description: 'Key-value specification rows shown in the "Technical Specifications" table.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Specification Label',
          required: true,
          admin: {
            width: '40%',
            placeholder: 'e.g. Frame Material, Glass Thickness, Thermal Rating',
          },
        },
        {
          name: 'value',
          type: 'text',
          label: 'Value',
          required: true,
          admin: {
            width: '60%',
            placeholder: 'e.g. 6063 Aluminium Alloy, 6mm toughened glass, U=1.2 W/m²K',
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 5 — Customisation Configurator
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'customizations',
      type: 'array',
      label: 'Customisation Options',
      required: false,
      admin: {
        description:
          'Interactive configurator options displayed on the product detail page. ' +
          'Each option has a type (colour swatch / image card / text button) and a list of choices.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Option Title',
          required: true,
          admin: {
            width: '50%',
            placeholder: 'e.g. Frame Colour, Glass Type, Opening Style',
          },
        },
        {
          name: 'type',
          type: 'select',
          label: 'Display Type',
          required: true,
          defaultValue: 'text',
          admin: {
            width: '50%',
            description: 'How choices are rendered in the configurator.',
          },
          options: [
            { label: 'Colour Swatch', value: 'color' },
            { label: 'Image Card', value: 'image' },
            { label: 'Text Button', value: 'text' },
          ],
        },
        {
          name: 'choices',
          type: 'array',
          label: 'Choices',
          required: true,
          minRows: 1,
          admin: {
            description:
              'Available choices for this option. ' +
              'For colour: value = hex/CSS colour (e.g. "#1a1a1a"). ' +
              'For image: value = image URL or path. ' +
              'For text: value = label (same as name).',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Choice Label',
              required: true,
              admin: {
                width: '50%',
                placeholder: 'e.g. Matte Black, Clear Glass, Slide Left',
              },
            },
            {
              name: 'value',
              type: 'text',
              label: 'Value',
              required: true,
              admin: {
                width: '50%',
                placeholder: 'e.g. #1a1a1a, /images/glass-clear.jpg, slide-left',
              },
            },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 6 — Support & Documentation
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'support',
      type: 'array',
      label: 'Support & Documentation',
      required: false,
      admin: {
        description:
          'Accordion sections shown in the "Support & Documentation" panel on the product page. ' +
          'E.g. Installation Guide, Warranty Information, Maintenance Tips.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Section Title',
          required: true,
          admin: {
            placeholder: 'e.g. Installation Guide, Warranty, Maintenance',
          },
        },
        {
          name: 'content',
          type: 'textarea',
          label: 'Content',
          required: true,
          admin: {
            rows: 4,
            placeholder: 'Detailed information for this section...',
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 7 — Related Content
    // ────────────────────────────────────────────────────────────────────────
    {
      name: 'relatedProjects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      required: false,
      label: 'Related Projects',
      admin: {
        description: 'Projects that feature or use this product.',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedBlogs',
      type: 'relationship',
      relationTo: 'blogs',
      hasMany: true,
      required: false,
      label: 'Related Blog Posts',
      admin: {
        description: 'Blog posts that feature or discuss this product.',
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products' as any,
      hasMany: true,
      required: false,
      label: 'Similar Products',
      admin: {
        description: 'Other products to show in the "Similar Products" carousel.',
        position: 'sidebar',
      },
    },
  ],
}
