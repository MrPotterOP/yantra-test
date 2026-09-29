/**
 * /blog/[slug] — ISR Blog Detail Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Component. Pre-renders all published blog posts at build time via
 * generateStaticParams(). Cache is invalidated on-demand whenever a post
 * is saved/updated/deleted in the CMS (via the Blogs collection afterChange hook
 * that calls revalidatePath). No periodic timer — zero wasted re-renders.
 *
 * Data pipeline:
 *   Payload Local API (depth: 2)
 *       → blog-adapter.js (pure fn — DB shape → UI shape)
 *           → Existing UI components (BlogHero, BlogBody, Carousel)
 *
 * Related content strategy (per section):
 *   1. Use CMS-linked relationships (relatedProjects / relatedBlogs / relatedProducts)
 *   2. If a section is empty → that carousel is NOT rendered
 *   Exception: relatedBlogs — if CMS hasn't linked any, fall back to recent posts
 *   so the page is never completely bare of discovery links.
 */

import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import Navbar from '@/components/Navbar/Navbar'
import BlogHero from '@/components/BlogPage/Hero/Hero'
import BlogBody from '@/components/BlogPage/Body/Body'
import Carousel from '@/components/Carousel/Carousel'
import CTAbanner from '@/components/CTAbanner/CTAbanner'
import Footer from '@/components/Footer/Footer'
import PreviewBanner from '@/components/payload/PreviewBanner'

import {
  blogToDetailProps,
  blogToCardProps,
  extractExcerpt,
  resolveMediaUrl,
} from '@/lib/adapters/blog-adapter'

// ─── ISR config — on-demand invalidation only ──────────────────────────────────
export const revalidate = false

// ─── Data fetcher ─────────────────────────────────────────────────────────────

async function getBlog(slug) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blogs',
    where: { slug: { equals: slug } },
    depth: 2, // populates coverImage, relatedProjects, relatedBlogs, relatedProducts
    limit: 1,
  })
  return docs[0] ?? null
}

async function getRecentBlogs(excludeSlug) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blogs',
    where: { slug: { not_equals: excludeSlug } },
    depth: 1,
    limit: 5,
    sort: '-date',
  })
  return docs.map(blogToCardProps).filter(Boolean)
}

// ─── generateStaticParams — pre-builds all blog pages at deploy time ──────────
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'blogs',
    depth: 0,
    limit: 500,
    pagination: false,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params
  const doc = await getBlog(slug)
  if (!doc) return { title: 'Blog Post Not Found | Yantra' }

  const coverUrl = resolveMediaUrl(doc.coverImage)
  const description =
    extractExcerpt(doc.body, 160) ||
    `${doc.title} — Architectural insights and engineering articles by Yantra.`

  return {
    title: `${doc.title} | Yantra Blog`,
    description,
    openGraph: {
      title: doc.title,
      description,
      type: 'article',
      url: `/blog/${doc.slug}`,
      images: coverUrl
        ? [{ url: coverUrl, width: 1200, height: 630, alt: doc.title }]
        : [],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `/blog/${doc.slug}` },
    authors: [{ name: doc.author || 'Yantra Editorial Team' }],
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }) {
  const { slug } = await params

  // Check if we're in Draft Mode (editor clicked Preview from CMS)
  const { isEnabled: isDraftMode } = await draftMode()

  const doc = await getBlog(slug)

  // 404 for unknown slugs — clean signal to search engines
  if (!doc) notFound()

  // Adapt Payload document → component prop shapes
  const { post, htmlContent, relatedProjects, relatedBlogs, relatedProducts } = blogToDetailProps(doc)

  // relatedBlogs fallback: if no CMS-linked articles, fetch 5 recent posts
  // so the page always offers at least one discovery path for the reader.
  const fallbackBlogs =
    relatedBlogs.length === 0 ? await getRecentBlogs(doc.slug) : []
  const displayBlogs = relatedBlogs.length > 0 ? relatedBlogs : fallbackBlogs

  return (
    <main>
      {/* Preview banner — only visible to editors in Draft Mode */}
      {isDraftMode && <PreviewBanner path={`/blog/${slug}`} />}

      <Navbar theme="dark" />

      {/* Hero with title, date, author, breadcrumbs & cover image */}
      <BlogHero post={post} />

      {/* Body with interactive Table of Contents & rich-text markup */}
      <BlogBody htmlContent={htmlContent} />

      {/* Related projects carousel — only if CMS has linked projects */}
      {relatedProjects.length > 0 && (
        <Carousel
          title="Related Projects"
          type="project"
          data={relatedProjects}
        />
      )}

      {relatedProducts.length > 0 && (
        <Carousel
          title="Related Products"
          type="product"
          data={relatedProducts}
        />
      )}

      {displayBlogs.length > 0 && (
        <Carousel
          title="Related Articles"
          type="blog"
          data={displayBlogs}
        />
      )}

      <CTAbanner />

      <Footer />
    </main>
  )
}
