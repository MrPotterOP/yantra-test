/**
 * /projects/[slug] — ISR Project Detail Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Component. Pre-renders all published projects at build time via
 * generateStaticParams(). Cache is invalidated on-demand whenever a project
 * is saved in the CMS (via the Projects collection afterChange hook that calls
 * revalidatePath). No periodic timer — zero wasted re-renders.
 *
 * Data pipeline:
 *   Payload Local API (depth: 2)
 *       → project-adapter.js (pure fn — DB shape → UI shape)
 *           → Existing UI components (Hero, Specs, Story, Gallery, Carousel)
 *
 * Related content strategy:
 *   - relatedProjects: CMS-linked (manual curation). If none linked, fall back
 *     to similar-by-category (auto). Section hidden if both yield 0 results.
 *   - relatedProducts: CMS-linked only. Section hidden if 0 linked.
 *   - relatedBlogs: CMS-linked only. Section hidden if 0 linked.
 */

import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import Navbar from '@/components/Navbar/Navbar'
import Hero from '@/components/ProjectPage/Hero/Hero'
import ProjectSpecs from '@/components/ProjectPage/Specifications'
import ProjectStory from '@/components/ProjectPage/ProjectStory'
import ProjectGallery from '@/components/ProjectPage/Gallery/ProjectGallery'
import Carousel from '@/components/Carousel/Carousel'
import CTAbanner from '@/components/CTAbanner/CTAbanner'
import Footer from '@/components/Footer/Footer'
import PreviewBanner from '@/components/payload/PreviewBanner'

import {
  projectToDetailProps,
  projectToCardProps,
} from '@/lib/adapters/project-adapter'

// ─── ISR config — on-demand only (no timer) ───────────────────────────────────
export const revalidate = false

// ─── Payload helpers ──────────────────────────────────────────────────────────

async function getProject(slug) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    // depth: 2 populates heroImage, storyImage, gallery[],
    // relatedProjects[], relatedProducts[], relatedBlogs[]
    depth: 2,
    limit: 1,
  })
  return docs[0] ?? null
}

/**
 * Fallback: fetch similar projects in the same category (excluding self).
 * Only called if the CMS hasn't manually linked any relatedProjects.
 */
async function getSimilarProjectsByCategory(categoryId, excludeSlug) {
  if (!categoryId) return []
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: {
      and: [
        { 'category.id': { equals: categoryId } },
        { slug: { not_equals: excludeSlug } },
      ],
    },
    depth: 2,
    limit: 5,
  })
  return docs.map(projectToCardProps).filter(Boolean)
}

// ─── generateStaticParams — pre-builds all project pages at deploy time ───────
export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 500,
    pagination: false,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { slug } = await params
  const doc = await getProject(slug)
  if (!doc) return { title: 'Project Not Found | Yantra' }

  const heroUrl =
    doc.heroImage && typeof doc.heroImage === 'object'
      ? doc.heroImage.url || ''
      : ''

  const categoryName =
    doc.category && typeof doc.category === 'object'
      ? doc.category.name || ''
      : ''

  const description =
    doc.storyDescription?.replace(/\s+/g, ' ').slice(0, 160) ||
    `${doc.title} — A Yantra project in ${doc.location}.`

  return {
    title: `${doc.title} | Yantra`,
    description,
    openGraph: {
      title: doc.title,
      description,
      type: 'website',
      url: `/projects/${doc.slug}`,
      images: heroUrl
        ? [{ url: heroUrl, width: 1920, height: 1080, alt: doc.title }]
        : [],
    },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: `/projects/${doc.slug}` },
    keywords: ['Yantra', categoryName, doc.location, doc.title].filter(Boolean),
  }
}

// ─── Page component ───────────────────────────────────────────────────────────
export default async function ProjectDetailPage({ params }) {
  const { slug } = await params

  // Check if we're in Draft Mode (editor clicked Preview from CMS)
  const { isEnabled: isDraftMode } = await draftMode()

  const doc = await getProject(slug)

  // 404 for unknown/unpublished slugs — clean signal to search engines
  if (!doc) notFound()

  // Adapt Payload document → component prop shapes
  // projectToDetailProps now returns: { project, specs, story, images,
  //   relatedProjects, relatedBlogs, relatedProducts }
  const {
    project,
    specs,
    story,
    images,
    relatedProjects: cmsRelatedProjects,
    relatedBlogs,
    relatedProducts,
  } = projectToDetailProps(doc)

  // ── Related projects: prefer CMS-linked, fall back to same-category ────────
  const categoryId =
    doc.category && typeof doc.category === 'object'
      ? doc.category.id
      : doc.category

  const relatedProjects =
    cmsRelatedProjects.length > 0
      ? cmsRelatedProjects
      : await getSimilarProjectsByCategory(categoryId, doc.slug)

  const categoryName =
    doc.category && typeof doc.category === 'object'
      ? doc.category.name || ''
      : ''

  return (
    <main>
      {/* Preview banner — only visible to editors in Draft Mode */}
      {isDraftMode && <PreviewBanner path={`/projects/${slug}`} />}

      <Navbar />

      {/* Hero — full-bleed background image + title, location, category tags */}
      <Hero project={project} />

      {/* Specs strip — key/value pairs (2–5 entries) */}
      <ProjectSpecs specs={specs} />

      {/* Story — expandable narrative + sticky image */}
      <ProjectStory story={story} />

      {/* Interactive gallery viewer with thumbnail strip */}
      <ProjectGallery images={images} />

      {relatedProjects.length > 0 && (
        <Carousel
          title="Related Projects"
          data={relatedProjects}
          type="project"
        />
      )}

      {relatedProducts.length > 0 && (
        <Carousel
          title="Related Products"
          data={relatedProducts}
          type="product"
        />
      )}

      {relatedBlogs.length > 0 && (
        <Carousel
          title="Related Articles"
          data={relatedBlogs}
          type="blog"
        />
      )}

      {/* CTA banner — contextualised to the project's category */}
      <CTAbanner
        title={`Enquire About Our ${categoryName} Projects`}
        cta="Enquire Now"
        imgSrc="/images/sky2.jpg"
        link="/contact"
      />

      <Footer />
    </main>
  )
}
