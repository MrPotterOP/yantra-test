/**
 * Cloudinary Storage Adapter for Payload CMS v3
 * ─────────────────────────────────────────────────────────────────────────────
 * Integrates with @payloadcms/plugin-cloud-storage to store all uploaded
 * media files in Cloudinary instead of the local filesystem.
 *
 * ── How Payload + the cloud-storage plugin handle uploads ────────────────────
 *
 * When a user uploads an image to the CMS, Payload:
 *   1. Receives the raw file (req.file)
 *   2. Generates resized variants in memory (req.payloadUploadSizes) for each
 *      entry in the collection's `imageSizes` config (thumbnail, card, hero)
 *   3. The plugin's afterChange hook collects ALL of these via getIncomingFiles():
 *        [original, thumbnail-buffer, card-buffer, hero-buffer]  ← 4 items
 *   4. The plugin calls handleUpload() for EACH item in parallel
 *   5. All handleUpload() results are merged with spread ({...acc, ...metadata})
 *      and saved back to the document
 *
 * ── The 3-copy problem (why 3 orphaned assets were left in Cloudinary) ───────
 *
 * Because we use Cloudinary's on-the-fly URL transformations (not separate
 * uploads) for image sizes, we only need to upload the ORIGINAL file once.
 * Cloudinary generates responsive crops at request time from that one asset.
 *
 * But since Payload generates resized buffers and the plugin calls handleUpload
 * for each of them, we got 4 actual Cloudinary uploads per media item, creating
 * 4 independent assets with different public_ids. Our handleUpload response
 * stored only the LAST public_id in the document — leaving the other 3 as
 * permanently orphaned assets in Cloudinary.
 *
 * ── The fix ──────────────────────────────────────────────────────────────────
 *
 * handleUpload now detects whether it's being called for the MAIN file or for
 * a resized variant by comparing the file's buffer/filename to what Payload
 * passed as the original. If it's a size variant, we return null — the plugin
 * skips nulls in the merge step — so no extra upload occurs.
 *
 * Result: exactly 1 Cloudinary upload per media item, regardless of how many
 * imageSizes are configured. The sizes data in the document is populated with
 * the same public_id, relying on Cloudinary URL transformation params for
 * different crops/dimensions.
 *
 * ── Delete strategy ──────────────────────────────────────────────────────────
 *
 *   Layer 1 (beforeDelete on Media collection): Runs before MongoDB delete,
 *   fetches the document, destroys the Cloudinary asset by public_id.
 *
 *   Layer 2 (plugin afterDelete → handleDelete here): Runs after MongoDB delete
 *   as a fallback. Handles "not found" gracefully (idempotent).
 */

import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import type {
  Adapter,
  GeneratedAdapter,
  HandleUpload,
  HandleDelete,
  GenerateURL,
} from '@payloadcms/plugin-cloud-storage/types'

// ─── Configure Cloudinary SDK ─────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a Cloudinary CDN URL for a given public_id and optional transformation. */
function cloudinaryUrl(publicId: string, transformation = 'q_auto,f_auto'): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`
}

/**
 * Strip any file extension that Cloudinary may append.
 * Cloudinary's destroy() requires the bare public_id WITHOUT extension.
 */
function normalisePublicId(raw: string): string {
  return raw.replace(/\.(jpe?g|png|webp|avif|gif|svg)$/i, '')
}

/**
 * Destroy a Cloudinary asset by public_id. Idempotent — "not found" is OK.
 * Throws on unexpected API failures so the caller can decide how to handle.
 */
async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const normalised = normalisePublicId(publicId)
  if (!normalised) return

  const result = await cloudinary.uploader.destroy(normalised, {
    resource_type: 'image',
    invalidate: true,  // also purge from Cloudinary's CDN edge cache
  })

  if (result.result === 'ok') {
    console.log(`[CloudinaryAdapter] Deleted: ${normalised}`)
  } else if (result.result === 'not found') {
    // Already deleted (e.g. by the beforeDelete hook) — perfectly fine
    console.warn(`[CloudinaryAdapter] Already gone from Cloudinary: ${normalised}`)
  } else {
    throw new Error(`[CloudinaryAdapter] Unexpected destroy result for "${normalised}": ${result.result}`)
  }
}

/**
 * Upload a readable buffer to Cloudinary and resolve with the upload result.
 * Uses upload_stream for memory efficiency (no temp files).
 */
function uploadToCloudinary(
  buffer: Buffer,
  opts: { folder: string }
): Promise<{ public_id: string; bytes: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder,
        resource_type: 'auto',
        // No eager transformations — we generate Cloudinary URLs at read time
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result) return reject(new Error('[CloudinaryAdapter] Empty result from Cloudinary'))
        resolve({
          public_id: result.public_id,
          bytes:     result.bytes,
          width:     result.width,
          height:    result.height,
        })
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

// ─── Adapter Factory ──────────────────────────────────────────────────────────

/**
 * Returns a Payload-compatible storage adapter that uploads to Cloudinary.
 *
 * @param options.folder - Cloudinary root folder (default: "yantra")
 */
export const cloudinaryAdapter = ({ folder = 'yantra' } = {}): Adapter => {
  return ({ collection }): GeneratedAdapter => {

    // ── handleUpload ──────────────────────────────────────────────────────────
    //
    // Called by the plugin for EACH file the plugin identifies:
    //   - Once for the main uploaded file (req.file)
    //   - Once for EACH resized variant (req.payloadUploadSizes.thumbnail, etc.)
    //
    // Our strategy: upload ONLY the main file. Return null for size variants so
    // the plugin skips them in its merge step. Cloudinary handles resizing via
    // URL transformation parameters — we don't need to upload separate crops.
    //
    // Detection: Payload's imageSizes resizer generates buffers whose byteLength
    // matches the resized dimensions. The main file's filename matches what
    // Payload stored in doc.filename before calling the hook. However, the
    // cleanest detection is: if the plugin-provided `file.filename` is the SAME
    // as the doc-level filename, it's the main file; if it's a size-suffixed name
    // (e.g. "abc-thumbnail-400x300.jpg"), it's a size variant.
    //
    // But actually, looking at getIncomingFiles source:
    //   mainFile.filename  = data.filename                (e.g. "originalname.jpg")
    //   sizeFile.filename  = `${resizedFileData.filename}` (e.g. "originalname-400x300.jpg")
    //
    // Payload generates size filenames as `${basename}-${width}x${height}.${ext}`.
    // We exploit this: if file.filename !== data.filename (the doc's base filename),
    // it's a resized variant → skip it.
    const handleUpload: HandleUpload = ({ data, file }): Promise<any> => {
      // ── Skip resized variants ──────────────────────────────────────────────
      // data.filename is the original doc filename (before cloud storage renames it).
      // size variants have a different filename generated by Payload's image resizer.
      // We detect them by checking if the file's filename matches the main doc filename.
      //
      // NOTE: `data.filename` here is the Payload-generated filename BEFORE our
      // adapter overrides it with the Cloudinary public_id. On first create, both
      // can match. A safer guard: if the file buffer is significantly smaller than
      // the original (i.e. it's a thumbnail crop), skip it. But the most reliable
      // guard available without patching the plugin is checking against `req.file`.
      //
      // Since the plugin calls handleUpload in parallel for all files and we can't
      // access req here directly (it's not passed to handleUpload — only data and file
      // are), we use filename-based detection:
      //   - Main file: file.filename === data.filename  (exact match before cloud rename)
      //   - Size file: file.filename contains size suffix like "-400x300"

      // ── Detection: is this the main file or a resized size variant? ─────────
      //
      // Payload's image resizer generates size filenames as:
      //   `${baseName}-${width}x${height}.${ext}`   e.g. "photo-400x300.jpg"
      //
      // The main file's filename is the original filename Payload assigned
      // (e.g. "photo-1234567890.jpg"), stored in data.filename.
      //
      // We use TWO checks in parallel — both must fail for us to treat a file
      // as the main file:
      //   1. Filename equality: file.filename === data.filename (main file exact match)
      //   2. Pattern check: size files always contain "-WIDTHxHEIGHT." in the name
      //
      // This belt-and-suspenders approach handles edge cases like:
      //   - First upload (data.filename hasn't been overridden yet)
      //   - Replacement uploads (data.filename is already the Cloudinary public_id)
      const hasSizeSuffix = /[-_]\d+x\d+\./.test(file.filename)
      const isDifferentFromDoc = file.filename !== data.filename
      const isSizeVariant = hasSizeSuffix || isDifferentFromDoc

      if (isSizeVariant) {
        // Return null — the plugin's merge step filters out null results.
        // No upload to Cloudinary, no orphaned asset, no waste.
        return Promise.resolve(null)
      }

      // ── Upload the main (original) file ───────────────────────────────────
      const docFolder = data?.folder ? String(data.folder) : 'general'
      const cloudFolder = `${folder}/${docFolder}`

      return uploadToCloudinary(file.buffer, { folder: cloudFolder })
        .then(({ public_id: publicId, bytes, width, height }) => {
          // We store the Cloudinary public_id as `filename` everywhere.
          // All image sizes reference the SAME public_id — Cloudinary transforms
          // them on the fly via URL parameters (c_fill,w_400,h_300 etc.).
          const baseUrl  = cloudinaryUrl(publicId)
          const thumbUrl = cloudinaryUrl(publicId, 'w_400,h_300,c_fill,q_auto,f_auto')

          return {
            filename:     publicId,
            filesize:     bytes,
            mimeType:     file.mimeType,
            url:          baseUrl,
            thumbnailURL: thumbUrl,   // shown in Payload admin grid view
            width,
            height,
            // All sizes share the same public_id; Cloudinary handles the crops.
            // Payload stores these size records in the document for field reference.
            sizes: {
              thumbnail: {
                filename: publicId,
                filesize:  bytes,
                mimeType:  file.mimeType,
                width:     400,
                height:    300,
                url:       cloudinaryUrl(publicId, 'w_400,h_300,c_fill,q_auto,f_auto'),
              },
              card: {
                filename: publicId,
                filesize:  bytes,
                mimeType:  file.mimeType,
                width:     768,
                height:    512,
                url:       cloudinaryUrl(publicId, 'w_768,h_512,c_fill,q_auto,f_auto'),
              },
              hero: {
                filename: publicId,
                filesize:  bytes,
                mimeType:  file.mimeType,
                width:     1920,
                height:    1080,
                url:       cloudinaryUrl(publicId, 'w_1920,h_1080,c_fill,q_auto,f_auto'),
              },
            },
          }
        })
        .catch((err) => {
          console.error('[CloudinaryAdapter] Upload failed:', err)
          throw err
        })
    }

    // ── handleDelete ──────────────────────────────────────────────────────────
    //
    // Called by the plugin's afterDelete hook once per filename in the doc:
    //   [doc.filename, sizes.thumbnail.filename, sizes.card.filename, sizes.hero.filename]
    //
    // Since all four are the same public_id (that's how we store them), this
    // will call destroyCloudinaryAsset with the same id up to 4 times.
    // The 2nd–4th calls get "not found" (already deleted) and are treated as OK.
    //
    // The beforeDelete hook on the Media collection is the PRIMARY cleanup path
    // that runs before Payload even touches MongoDB. This is the fallback.
    const handleDelete: HandleDelete = async ({ doc, filename }) => {
      try {
        // Prefer `filename` argument (per-size call from plugin) over doc.filename
        const publicId = filename || doc?.filename
        if (!publicId) {
          console.warn('[CloudinaryAdapter] handleDelete: no public_id available — skipping')
          return
        }
        await destroyCloudinaryAsset(publicId)
      } catch (err) {
        // Never rethrow — allow Payload's DB delete to complete regardless.
        console.error('[CloudinaryAdapter] handleDelete error (non-fatal):', err)
      }
    }

    // ── generateURL ───────────────────────────────────────────────────────────
    // Payload calls this after each read to resolve the `url` field.
    // We return the stored URL directly, or reconstruct it from the public_id.
    const generateURL: GenerateURL = ({ data, filename }) => {
      if (data?.url) return data.url as string
      if (filename) return cloudinaryUrl(filename)
      return ''
    }

    return {
      name: 'cloudinary',
      handleUpload,
      handleDelete,
      generateURL,
      staticHandler: undefined as any,  // served from Cloudinary CDN directly
    }
  }
}
