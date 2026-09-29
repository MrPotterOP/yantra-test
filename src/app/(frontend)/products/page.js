/**
 * /products — Product Listing Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Component. Fetches all products from Payload CMS and renders them
 * grouped by category in a grid layout.
 *
 * On-demand ISR: revalidated whenever a product is saved in the CMS
 * (via afterChange hooks that call revalidatePath('/products')).
 */

import { getPayload } from 'payload'
import config from '@payload-config'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import CTAbanner from '@/components/CTAbanner/CTAbanner'
import Carousel from '@/components/Carousel/Carousel'

import { productToCardProps } from '@/lib/adapters/product-adapter'

// ─── On-demand ISR — no periodic timer ───────────────────────────────────────
export const revalidate = false

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export const metadata = {
  title: 'Products | Yantra — Windows, Doors, Skylights & Glazing Systems',
  description:
    'Explore Yantra\'s full product catalogue — aluminium sliding windows, casement windows, ' +
    'folding doors, skylights, and bespoke glazing systems engineered for Indian climates.',
  openGraph: {
    title: 'Products | Yantra',
    description: 'Browse our full range of aluminium windows, doors, and glazing systems.',
    type: 'website',
    url: '/products',
  },
  alternates: { canonical: '/products' },
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getProducts() {
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'products',
      depth: 2,        // populate images[].image.url (Cloudinary)
      limit: 100,
      pagination: false,
      sort: 'title',
    })
    return docs.map(productToCardProps).filter(Boolean)
  } catch (err) {
    console.error('[/products] Error fetching products:', err)
    return []
  }
}

// ─── Group products by category ───────────────────────────────────────────────

function groupByCategory(products) {
  const map = new Map()
  for (const p of products) {
    const cat = p.category || 'Other'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat).push(p)
  }
  // Return in insertion order (sort ensures stable ordering)
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
}

// ─── Page component ───────────────────────────────────────────────────────────

export default async function ProductsListingPage() {
  const products = await getProducts()
  const groups = groupByCategory(products)

  return (
    <main>
      <Navbar theme="dark" />

      {/* Page Header */}
      <section style={{
        paddingTop: '140px',
        paddingBottom: '40px',
        paddingLeft: '24px',
        paddingRight: '24px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: '16px',
        }}>
          Our Products
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--color-gray, #888)',
          maxWidth: '560px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Engineered aluminium systems for windows, doors, skylights, and glazing —
          built for precision, longevity, and design integrity.
        </p>
      </section>

      {/* Products grouped by category */}
      {groups.map(({ category, items }) => (
        <Carousel
          key={category}
          title={category}
          data={items}
          type="product"
        />
      ))}

      {/* Fallback when no products exist in CMS yet */}
      {groups.length === 0 && (
        <section style={{ padding: '120px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-gray, #888)', fontSize: '1rem' }}>
            Products coming soon.
          </p>
        </section>
      )}

      <CTAbanner
        title="Can't Find What You're Looking For?"
        cta="Talk to an Expert"
        imgSrc="/images/sky2.jpg"
        link="/contact"
      />

      <Footer />
    </main>
  )
}
