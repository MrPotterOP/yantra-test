/**
 * /products/[slug] — ISR Product Detail Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Component. Pre-renders all published products at build time via
 * generateStaticParams(). Cache is invalidated on-demand whenever a product
 * is saved in the CMS (via Products collection afterChange hook →
 * revalidatePath('/products/[slug]')).
 *
 * Data pipeline:
 *   Payload Local API (depth: 2)
 *       → product-adapter.js (pure fn — DB shape → UI shape)
 *           → Existing UI components (ProductDetails, Carousel, CTAbanner)
 *
 * Related content (all conditional — hidden if 0 items):
 *   - relatedProducts: other products in the same collection (self-referential)
 *   - relatedProjects: projects where this product was used
 *   - relatedBlogs: blog articles that feature or discuss this product
 */

import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import Navbar from '@/components/Navbar/Navbar'
import Footer from '@/components/Footer/Footer'
import Carousel from '@/components/Carousel/Carousel'
import CTAbanner from '@/components/CTAbanner/CTAbanner'
import ProductDetail from '@/components/ProductPage/ProductDetails/ProductDetails'
import PreviewBanner from '@/components/payload/PreviewBanner'

import { productToDetailProps } from '@/lib/adapters/product-adapter'

// ─── ISR config — on-demand only ─────────────────────────────────────────────
export const revalidate = false

// ─── Payload helpers ──────────────────────────────────────────────────────────

async function getProduct(slug) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    // depth: 2 populates images[].image, relatedProjects[],
    // relatedProducts[], relatedBlogs[]
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

// ─── generateStaticParams ─────────────────────────────────────────────────────
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 500,
    pagination: false,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params
  const doc = await getProduct(slug)
  if (!doc) return { title: 'Product Not Found | Yantra' }

  // Cover image from first product image
  const firstImage = (doc.images || [])[0]
  const coverUrl =
    firstImage && typeof firstImage.image === 'object'
      ? firstImage.image.url || ''
      : ''

  const description =
    doc.subtitle ||
    (doc.description ? doc.description.slice(0, 160) : '') ||
    `${doc.title} — An aluminium ${doc.category || 'product'} by Yantra.`

  return {
    title: `${doc.title} | Yantra`,
    description,
    openGraph: {
      title: doc.title,
      description,
      type: 'website',
      url: `/products/${doc.slug}`,
      images: coverUrl
        ? [{ url: coverUrl, width: 1200, height: 800, alt: doc.title }]
        : [],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `/products/${doc.slug}` },
    keywords: ['Yantra', doc.category || '', doc.title].filter(Boolean),
  }
}

// ─── Page component ───────────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }) {
  const { slug } = await params

  // Check if we're in Draft Mode (editor clicked Preview in CMS)
  const { isEnabled: isDraftMode } = await draftMode()

  const doc = await getProduct(slug)

  if (!doc) notFound()

  // Adapt Payload document → component prop shapes
  // productToDetailProps now returns:
  //   { product, relatedProducts, relatedProjects, relatedBlogs }
  const adapted = productToDetailProps(doc)
  if (!adapted) notFound()

  const { product, relatedProducts, relatedProjects, relatedBlogs } = adapted

  return (
    <main>
      {/* Preview banner — only visible to editors in Draft Mode */}
      {isDraftMode && <PreviewBanner path={`/products/${slug}`} />}

      <Navbar theme="dark" />

      {/* ── Product detail section (sticky gallery + spec configurator) ── */}
      <ProductDetail product={product} />

      {relatedProducts.length > 0 && (
        <Carousel
          title="Similar Products"
          data={relatedProducts}
          type="product"
        />
      )}

      {relatedProjects.length > 0 && (
        <Carousel
          title="Related Projects"
          data={relatedProjects}
          type="project"
        />
      )}

      {relatedBlogs.length > 0 && (
        <Carousel
          title="Related Articles"
          data={relatedBlogs}
          type="blog"
        />
      )}

      <CTAbanner
        title={`Enquire About ${product.name}`}
        cta="Get a Quote"
        imgSrc="/images/sky2.jpg"
        link="/contact"
      />

      <Footer />
    </main>
  )
}
