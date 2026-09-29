/**
 * Migration: Drop stale `slug` unique index from `careers` collection
 * ─────────────────────────────────────────────────────────────────────────────
 * The `slug` field was removed from the Careers schema, but MongoDB retains
 * the unique index. This causes: "The following field is invalid: slug" when
 * creating new job listings.
 *
 * Run once manually:
 *   node src/lib/migrations/drop-careers-slug-index.js
 *
 * Or call dropCareersSlugIndex() from an API route / startup hook once.
 */

import mongoose from 'mongoose'

export async function dropCareersSlugIndex() {
  try {
    // Only run if connected
    if (mongoose.connection.readyState !== 1) return

    const db = mongoose.connection.db
    const collection = db.collection('careers')

    // List existing indexes
    const indexes = await collection.indexes()
    const slugIndex = indexes.find(
      (idx) => idx.key && idx.key.slug !== undefined
    )

    if (slugIndex) {
      await collection.dropIndex(slugIndex.name || 'slug_1')
      console.log('[migration] Dropped stale careers.slug index:', slugIndex.name)
    } else {
      console.log('[migration] careers.slug index not found — nothing to drop')
    }
  } catch (err) {
    // Non-fatal: log and continue
    console.warn('[migration] Could not drop careers.slug index:', err.message)
  }
}
