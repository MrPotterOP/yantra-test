/**
 * Media Collection
 * ─────────────────────────────────────────────────────────────────────────────
 * Central media library for Yantra. All uploads go to Cloudinary via the
 * cloudinaryAdapter (configured in payload.config.ts + cloudinary-adapter.ts).
 *
 * Delete strategy — two-layer approach for reliability:
 *
 *   Layer 1 (beforeDelete hook): Captures the Cloudinary public_id from the
 *   document BEFORE Payload deletes the MongoDB record, then destroys it from
 *   Cloudinary. This is the primary, reliable path because doc data is still
 *   available.
 *
 *   Layer 2 (plugin afterDelete hook): The @payloadcms/plugin-cloud-storage
 *   plugin registers its own afterDelete hook that also calls handleDelete in
 *   the adapter. This acts as a fallback — handleDelete treats "not found" as
 *   success so duplicate calls are safely idempotent.
 *
 * Together these ensure: if the beforeDelete hook fires correctly, the asset
 * is already gone before the plugin's afterDelete runs. If beforeDelete
 * fails for any reason, the plugin hook catches it. We never silently leave
 * orphaned assets in Cloudinary.
 */

import { v2 as cloudinary } from 'cloudinary'
import type { CollectionConfig, CollectionBeforeDeleteHook } from 'payload'

// Ensure Cloudinary is configured (also done in the adapter, but guard here
// in case this collection module is loaded independently)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ─── beforeDelete hook ────────────────────────────────────────────────────────

/**
 * Deletes the asset from Cloudinary BEFORE the MongoDB record is removed.
 *
 * Why beforeDelete and not afterDelete?
 * - In afterDelete, the `doc` payload might have already had its relationships
 *   cleaned up. More importantly, the filename (= Cloudinary public_id) is
 *   available with certainty only while the document is still in the database.
 * - Using beforeDelete means we fetch the full document via the local API to
 *   guarantee we have the correct public_id, regardless of what the hook
 *   receives in its arguments.
 *
 * Failure mode: If Cloudinary deletion fails (network error, API outage),
 * we LOG the error but allow Payload's delete to proceed — the admin can
 * manually clean up orphaned Cloudinary assets. We never block a CMS delete
 * due to a storage cleanup failure.
 */
const deleteFromCloudinary: CollectionBeforeDeleteHook = async ({ id, req }) => {
  try {
    // Fetch the full document via the local Payload API to get its filename
    const doc = await req.payload.findByID({
      collection: 'media',
      id: id as string,
      depth: 0,
    })

    if (!doc?.filename) {
      req.payload.logger.warn({
        msg: `[Media] beforeDelete: document ${id} has no filename — nothing to delete from Cloudinary`,
      })
      return
    }

    // The filename IS the Cloudinary public_id (e.g. "yantra/projects/abc123")
    const publicId = doc.filename as string

    // Strip any file extension (Cloudinary's destroy API needs bare public_id)
    const normalisedId = publicId.replace(/\.(jpe?g|png|webp|avif|gif|svg)$/i, '')

    req.payload.logger.info({
      msg: `[Media] Deleting from Cloudinary: ${normalisedId}`,
    })

    const result = await cloudinary.uploader.destroy(normalisedId, {
      resource_type: 'image',
      invalidate: true,   // also purge from Cloudinary's CDN cache
    })

    if (result.result === 'ok') {
      req.payload.logger.info({
        msg: `[Media] Successfully deleted from Cloudinary: ${normalisedId}`,
      })
    } else if (result.result === 'not found') {
      req.payload.logger.warn({
        msg: `[Media] Asset not found on Cloudinary (already deleted?): ${normalisedId}`,
      })
    } else {
      req.payload.logger.error({
        msg: `[Media] Unexpected Cloudinary destroy result for "${normalisedId}": ${result.result}`,
      })
    }

  } catch (err) {
    // NEVER block a CMS delete due to a storage cleanup failure.
    // Log the error for the admin to investigate and continue.
    req.payload.logger.error({
      err,
      msg: `[Media] beforeDelete Cloudinary cleanup failed for document ${id} — asset may be orphaned in Cloudinary. Clean up manually via the Cloudinary dashboard.`,
    })
  }
}

// ─── Collection definition ────────────────────────────────────────────────────

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  admin: {
    useAsTitle: 'alt',
    description:
      'Central media library. Upload images and files here to use them across Products, Projects, and Blogs.',
    group: 'Content',
  },
  access: {
    read: () => true,   // Public read so frontend can access images
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  // ── Hooks ──────────────────────────────────────────────────────────────────
  hooks: {
    beforeDelete: [deleteFromCloudinary],
    // The @payloadcms/plugin-cloud-storage plugin also registers an afterDelete
    // hook via getAfterDeleteHook() — that calls our adapter's handleDelete.
    // Both hooks run: beforeDelete (primary) + afterDelete (fallback).
    // handleDelete treats "not found" as success, so double-deletion is safe.
  },

  // ── Upload config ──────────────────────────────────────────────────────────
  upload: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'image/svg+xml',
    ],
    // Image sizes for responsive srcsets
    // NOTE: In our Cloudinary setup, all sizes share the same public_id.
    // Cloudinary applies different transformations at the URL level.
    // These size definitions tell Payload what metadata to store.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    // Use the stored Cloudinary URL directly as the admin thumbnail
    adminThumbnail: ({ doc }) => doc?.url as string,
    // NOTE: `disableLocalStorage` is handled by the cloudStorage plugin in payload.config.ts
  },

  // ── Fields ─────────────────────────────────────────────────────────────────
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
      admin: {
        description: 'Describe the image for accessibility and SEO. E.g. "Sliding window installation in Mumbai villa"',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption',
      admin: {
        description: 'Optional caption shown below the image on blog posts and project pages.',
      },
    },
    {
      name: 'folder',
      type: 'select',
      label: 'Folder',
      defaultValue: 'general',
      admin: {
        description: 'Organise this file in the media library.',
        position: 'sidebar',
      },
      options: [
        { label: 'General', value: 'general' },
        { label: 'Products', value: 'products' },
        { label: 'Projects', value: 'projects' },
        { label: 'Blogs', value: 'blogs' },
        { label: 'Team / About', value: 'team' },
      ],
    },
  ],
}
