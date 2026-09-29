import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { GenerateFileURL } from '@payloadcms/plugin-cloud-storage/types'

import { Media } from './src/collections/Media'
import { Categories } from './src/collections/Categories'
import { Projects } from './src/collections/Projects'
import { Blogs } from './src/collections/Blogs'
import { Products } from './src/collections/Products'
import { Careers } from './src/collections/Careers'
import { Applications } from './src/collections/Applications'
import { cloudinaryAdapter } from './src/lib/cloudinary-adapter'

// ─── Cloudinary URL builder for image sizes ────────────────────────────────
// Payload calls this for each imageSizes entry (thumbnail, card, hero).
// We return a Cloudinary transformation URL so the admin panel can show
// previews without needing local files on disk.
const generateCloudinaryFileURL: GenerateFileURL = ({ filename, size }) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName || !filename) return ''

  // Size-specific transformation parameters
  const transforms: Record<string, string> = {
    thumbnail: 'w_400,h_300,c_fill,q_auto,f_auto',
    card:      'w_768,h_512,c_fill,q_auto,f_auto',
    hero:      'w_1920,h_1080,c_fill,q_auto,f_auto',
  }

  const t = size?.name && transforms[size.name]
    ? `${transforms[size.name]}/`
    : 'q_auto,f_auto/'

  // filename is set to the Cloudinary public_id during upload
  return `https://res.cloudinary.com/${cloudName}/image/upload/${t}${filename}`
}

export default buildConfig({
  // ─── Editor ────────────────────────────────────────────────────────────────
  editor: lexicalEditor(),

  // ─── Collections ───────────────────────────────────────────────────────────
  // Phase 1: Media
  // Phase 2: Project Categories + Projects
  // Phase 3: Blogs (Lexical rich text + Media integration)
  // Phase 4: Products
  // Phase 5: Careers + Applications
  collections: [Media, Categories, Projects, Blogs, Products, Careers, Applications],

  // ─── Auth ──────────────────────────────────────────────────────────────────
  secret: process.env.PAYLOAD_SECRET || '',

  // ─── Database ──────────────────────────────────────────────────────────────
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),

  // ─── Image processing ──────────────────────────────────────────────────────
  // Sharp is used for thumbnail generation and image resizing
  sharp,

  // ─── Admin Panel ───────────────────────────────────────────────────────────
  admin: {
    // Custom CSS for the admin panel (amber/sunbeam theme — Phase 6)
    // (lives in src/app/(payload)/custom.css, imported by layout.tsx)
    meta: {
      titleSuffix: '— Yantra CMS',
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/favicon.ico' }],
    },

    components: {
      // ── Sidebar nav link ─────────────────────────────────────────────────
      // "⚡ Cache Manager" link injected at the bottom of the admin nav
      afterNavLinks: ['@/components/payload/CacheManagerNavLink'],

      // ── Custom full-page views ───────────────────────────────────────────
      // Accessible at /admin/cache-manager
      views: {
        cacheManager: {
          Component: '@/components/payload/CacheManagerView',
          path: '/cache-manager',
        },
      },
    },
  },

  // ─── Plugins ───────────────────────────────────────────────────────────────
  plugins: [
    // Cloudinary storage: replaces local disk storage for the media collection
    cloudStoragePlugin({
      collections: {
        media: {
          adapter: cloudinaryAdapter({ folder: 'yantra' }),
          // Don't save files to disk — Cloudinary is the source of truth
          disableLocalStorage: true,
          // Disable Payload's proxied file serving (files come from Cloudinary CDN)
          disablePayloadAccessControl: true,
          // Generate Cloudinary transformation URLs for each image size
          // This is what Payload uses to show thumbnails in the admin panel
          generateFileURL: generateCloudinaryFileURL,
        },
      },
    }),
  ],
})