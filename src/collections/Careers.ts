/**
 * Careers Collection
 * ─────────────────────────────────────────────────────────────────────────────
 * Job listings managed by Yantra's admin team in the Payload CMS.
 *
 * Public frontend flow:
 *   GET /api/frontend/careers           → lists all isActive:true careers → feeds OpenRoles.js
 *   POST /api/frontend/careers/apply    → creates an Application document
 *
 * Admin features:
 *   - isActive toggle — unpublishes role without deleting it
 *   - Department field with suggestions
 *
 * Data contract (what OpenRoles.js expects per role):
 *   { id, role, field, location, description, isActive }
 *
 * NOTE: The `slug` field was removed from this collection.
 * If you see "The following field is invalid: slug" when creating a listing,
 * MongoDB still has a stale unique index on the `careers.slug` field from
 * the previous schema. Drop it from the MongoDB shell:
 *   db.careers.dropIndex("slug_1")
 * Or run: node src/lib/migrations/drop-careers-slug-index.js
 */

import type {
  CollectionConfig,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterOperationHook,
} from 'payload'
import { revalidatePath } from 'next/cache'

// ─── Hooks ────────────────────────────────────────────────────────────────────

const revalidateOnChange: CollectionAfterChangeHook = () => {
  try {
    revalidatePath('/careers')
  } catch {
    // no-op outside request context
  }
}

const revalidateOnDelete: CollectionAfterDeleteHook = () => {
  try {
    revalidatePath('/careers')
  } catch {
    // no-op outside request context
  }
}

/**
 * Self-healing index migration hook.
 * Runs once after any operation; drops the stale `slug` unique index
 * if it still exists from the old schema. Idempotent — safe to run repeatedly.
 * After the index is dropped it will never find it again so overhead is ~0.
 */
const dropStaleSlugIndex: CollectionAfterOperationHook = async ({ req }) => {
  try {
    // Access mongoose connection via Payload's db adapter
    const db = (req as any).payload?.db?.connection?.db
    if (!db) return

    const collection = db.collection('careers')
    const indexes: Array<{ name: string; key: Record<string, unknown> }> = await collection.indexes()
    const slugIndex = indexes.find(
      (idx) => idx.key && 'slug' in idx.key
    )

    if (slugIndex) {
      await collection.dropIndex(slugIndex.name)
      console.log('[Careers] Dropped stale slug index:', slugIndex.name)
    }
  } catch {
    // Non-fatal — never crash a real operation over a migration cleanup
  }
}

// ─── Collection definition ────────────────────────────────────────────────────

export const Careers: CollectionConfig = {
  slug: 'careers',
  labels: {
    singular: 'Job Listing',
    plural: 'Job Listings',
  },

  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    useAsTitle: 'role',
    group: 'Careers',
    description: 'Active job openings displayed on the public careers page.',
    defaultColumns: ['role', 'field', 'location', 'isActive', 'updatedAt'],
  },

  // ── Access ─────────────────────────────────────────────────────────────────
  access: {
    read: () => true,            // Public — consumed by the careers API endpoint
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },

  // ── Hooks ──────────────────────────────────────────────────────────────────
  hooks: {
    afterOperation: [dropStaleSlugIndex],
    afterChange: [revalidateOnChange],
    afterDelete: [revalidateOnDelete],
  },

  // ── Fields ─────────────────────────────────────────────────────────────────
  fields: [

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 1 — Identity
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'role',
      type: 'text',
      label: 'Role Title',
      required: true,
      maxLength: 120,
      admin: {
        description: 'Displayed as the job title on the careers page.',
        placeholder: 'e.g. Senior Aluminium Systems Engineer',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 2 — Classification
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'field',
      type: 'text',
      label: 'Department',
      required: true,
      admin: {
        description:
          'Department this role belongs to. Common values: Engineering, Design, Sales, Operations, Marketing.',
        placeholder: 'e.g. Engineering',
        width: '50%',
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location',
      required: true,
      admin: {
        description: 'Work location. E.g. "Mumbai, Maharashtra" or "Remote".',
        placeholder: 'e.g. Mumbai, Maharashtra',
        width: '50%',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 3 — Job Description
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'description',
      type: 'textarea',
      label: 'Job Description',
      required: true,
      admin: {
        description:
          'Detailed job description shown when the role is expanded on the careers page. ' +
          'Include responsibilities, requirements, and what success looks like.',
        rows: 8,
        placeholder:
          'We are looking for a passionate engineer to join our product team...',
      },
    },

    // ──────────────────────────────────────────────────────────────────────────
    // SECTION 4 — Visibility
    // ──────────────────────────────────────────────────────────────────────────
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active (publicly visible)',
      defaultValue: true,
      admin: {
        description:
          'When unchecked, this role is hidden from the careers page without being deleted. ' +
          'Useful for pausing hiring without losing the listing.',
        position: 'sidebar',
      },
    },
  ],
}
