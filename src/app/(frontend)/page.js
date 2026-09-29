import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import InfiniteScrollImages from "@/components/InfiniteScrollImages/InfiniteScrollImages";
import About from "@/components/About/About";
import HowWeWork from "@/components/HowWeWork/HowWeWork";
import Products from "@/components/Products/Products";
import Projects from "@/components/Projects/Projects";
import Solutions from "@/components/Solutions/Solutions";
import FAQs from "@/components/FAQs/FAQs";
import CTAbanner from "@/components/CTAbanner/CTAbanner";
import Footer from "@/components/Footer/Footer";
import PopUpForm from "@/components/PopUpForm/PopUpForm";
import StickyBtns from "@/components/StickyBtns/StickyBtns";
import Carousel from "@/components/Carousel/Carousel";
import RevealOverlay from "@/components/Reveal/Reveal";

import { getPayload } from 'payload'
import config from '@payload-config'
import { projectToCardProps } from '@/lib/adapters/project-adapter'
import { blogToCardProps } from '@/lib/adapters/blog-adapter'
import { productToCardProps } from '@/lib/adapters/product-adapter'

export const metadata = {
  title: "Home | Yantra - WINDOWS DOORS SKYLIGHTS BALUSTRADES",
  openGraph: {
    type: 'website',
    title: "Home | Yantra - WINDOWS DOORS SKYLIGHTS BALUSTRADES",
    description: "Discover Yantra's custom home solutions, including doors, windows, balustrades, retractable & fixed glass roofs, and pergolas. We offer lifetime warranties, annual maintenance contracts, and a Pan India presence. Visit us to enhance your living spaces with innovative designs",
    url: 'https://www.yantraindia.com/',
    image: '/images/about.jpg',
  },
  viewport: 'width=device-width, initial-scale=1.0',
  charSet: 'utf-8',
  themeColor: '#FFFFFF',
  mobileWebAppCapable: 'yes',
  language: 'en-US'
}

/**
 * getFeaturedContent
 * ─────────────────────────────────────────────────────────────────────────────
 * Fetches content for all three homepage sections (projects, blogs, products).
 *
 * Strategy per section:
 *   1. Try featured items (isFeatured: true)
 *   2. If none, fall back to the 5 most recently updated items
 *   3. If still none, return an empty array → section is NOT rendered
 *
 * No dummy/placeholder data. Empty = the section is hidden entirely.
 */
async function getFeaturedContent() {
  try {
    const payload = await getPayload({ config })

    // ── Projects ──────────────────────────────────────────────────────────
    let { docs: projectDocs } = await payload.find({
      collection: 'projects',
      where: { isFeatured: { equals: true } },
      depth: 2,
      limit: 6,
    })

    if (projectDocs.length === 0) {
      const { docs: recent } = await payload.find({
        collection: 'projects',
        depth: 2,
        limit: 5,
        sort: '-updatedAt',
      })
      projectDocs = recent
    }

    // ── Blogs ─────────────────────────────────────────────────────────────
    let { docs: blogDocs } = await payload.find({
      collection: 'blogs',
      where: { isFeatured: { equals: true } },
      depth: 2,
      limit: 6,
      sort: '-date',
    })

    if (blogDocs.length === 0) {
      const { docs: recent } = await payload.find({
        collection: 'blogs',
        depth: 2,
        limit: 5,
        sort: '-date',
      })
      blogDocs = recent
    }

    // ── Products ──────────────────────────────────────────────────────────
    let { docs: productDocs } = await payload.find({
      collection: 'products',
      where: { isFeatured: { equals: true } },
      depth: 2,
      limit: 6,
    })

    if (productDocs.length === 0) {
      const { docs: recent } = await payload.find({
        collection: 'products',
        depth: 2,
        limit: 5,
        sort: '-updatedAt',
      })
      productDocs = recent
    }

    return {
      projects: projectDocs.map(projectToCardProps).filter(Boolean),
      blogs: blogDocs.map(blogToCardProps).filter(Boolean),
      products: productDocs.map(productToCardProps).filter(Boolean),
    }
  } catch (err) {
    console.error('[Homepage] Error fetching CMS content:', err)
    return { projects: [], blogs: [], products: [] }
  }
}

export default async function Home() {
  const { projects, blogs, products } = await getFeaturedContent()

  return (
    <main>
      <RevealOverlay />
      <Navbar />
      <StickyBtns />
      <PopUpForm />
      <Hero />
      <InfiniteScrollImages />
      <About />
      <HowWeWork />

      {/* CMS-powered featured products carousel (conditional) */}
      {products.length > 0 && (
        <Carousel type="product" data={products} title="We offer products like" />
      )}

      {/* CMS-powered featured projects (conditional) */}
      {projects.length > 0 && (
        <Projects projects={projects} />
      )}

      <Solutions />

      {/* CMS-powered featured blogs (conditional) */}
      {blogs.length > 0 && (
        <Carousel type="blog" data={blogs} title="Read More About" />
      )}

      <FAQs />
      <CTAbanner />
      <Footer />
    </main>
  );
}
