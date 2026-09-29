/**
 * /careers — Careers Page (ISR Server Component)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches active job listings from Payload CMS via the Local API and passes
 * them as a prop to OpenRoles. Falls back gracefully to an empty list.
 *
 * On-demand ISR: revalidated when any career listing is saved or deleted
 * (via Careers collection afterChange/afterDelete hooks → revalidatePath('/careers')).
 *
 * Why pass initialRoles as a prop instead of fetching in OpenRoles?
 * - Server Components fetch happens at zero latency (in-process, no HTTP round-trip)
 * - The initial render is fully hydrated — no loading spinner for primary content
 * - OpenRoles can still refresh client-side if needed (current useEffect stays as
 *   a progressive enhancement / revalidation mechanism)
 */

import { getPayload } from 'payload'
import config from '@payload-config'

import Header from '@/components/Contact/Header'
import OpenRoles from '@/components/Careers/OpenRoles/OpenRoles'
import Culture from '@/components/Careers/Culture/Culture'
import Footer from '@/components/Footer/Footer'

// ─── On-demand ISR — revalidated by collection hooks ─────────────────────────
export const revalidate = false

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export const metadata = {
  title: 'Careers | Yantra — Join Our Team',
  description:
    'Join Yantra\'s team of engineers, designers, and installation specialists. ' +
    'Explore open roles and build world-class architectural environments with us.',
  openGraph: {
    title: 'Careers | Yantra',
    description: 'Explore open roles at Yantra and join our growing team.',
    type: 'website',
    url: '/careers',
  },
  alternates: { canonical: '/careers' },
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getActiveListings() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'careers',
      where: {
        isActive: { equals: true },
      },
      depth: 0,
      limit: 100,
      pagination: false,
      sort: 'createdAt',
    })

    // Project only the fields OpenRoles.js needs — keep the wire payload lean
    return docs.map((doc) => ({
      id: doc.id,
      role: doc.role,
      field: doc.field,
      location: doc.location,
      description: doc.description,
    }))
  } catch (err) {
    console.error('[/careers] Error fetching career listings:', err)
    return []  // Graceful degradation → OpenRoles shows "no open positions" state
  }
}

// ─── Page component ───────────────────────────────────────────────────────────

export default async function CareersPage() {
  const initialRoles = await getActiveListings()

  return (
    <main>
      <Header
        bg={'/images/bannerBg.jpg'}
        title={'Work With Yantra'}
        description={
          'Join our team of engineers, designers, and installation specialists ' +
          'building world-class architectural environments.'
        }
      />

      {/*
        Pass server-fetched roles as initialRoles prop.
        OpenRoles renders immediately with full data — no client-side loading spinner.
        The component's useEffect acts as a refresh layer only.
      */}
      <OpenRoles initialRoles={initialRoles} />

      <Culture />
      <Footer />
    </main>
  )
}