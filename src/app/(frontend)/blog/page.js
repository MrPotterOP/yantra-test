/**
 * /blog — Blog Index & Journal
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Component. Fetches all published articles and featured projects from
 * Payload CMS. If the CMS database is empty, gracefully falls back to mock data
 * so the page remains 100% stable during content onboarding.
 */

import { getPayload } from 'payload'
import config from '@payload-config'

import Navbar from '@/components/Navbar/Navbar'
import BlogHero from '@/components/BlogPage/Hero/Hero'
import BlogsSection from '@/components/Blogs/Blogs'
import Carousel from '@/components/Carousel/Carousel'
import CTAbanner from '@/components/CTAbanner/CTAbanner'
import Footer from '@/components/Footer/Footer'

import { blogToCardProps, blogToDetailProps } from '@/lib/adapters/blog-adapter'
import { projectToCardProps } from '@/lib/adapters/project-adapter'

export const revalidate = false // On-demand revalidation via Payload hooks

export const metadata = {
  title: 'Blog & Architectural Journal | Yantra',
  description:
    'Explore articles, case studies, and engineering guides on aluminium windows, panoramic doors, and retractable skylights.',
}

async function getBlogData() {
  try {
    const payload = await getPayload({ config })
    const { docs: blogs } = await payload.find({
      collection: 'blogs',
      depth: 2,
      limit: 50,
      sort: '-date',
    })

    const { docs: projects } = await payload.find({
      collection: 'projects',
      depth: 1,
      limit: 6,
      sort: '-updatedAt',
    })

    return {
      blogs: blogs.map(blogToCardProps).filter(Boolean),
      latestBlogDoc: blogs[0] ?? null,
      projects: projects.map(projectToCardProps).filter(Boolean),
    }
  } catch (error) {
    console.error('Error fetching CMS blog data:', error)
    return { blogs: [], latestBlogDoc: null, projects: [] }
  }
}

export default async function BlogIndexPage() {
  const { blogs, latestBlogDoc, projects } = await getBlogData()

  // Fallback projects if none yet in CMS
  const fallbackProjects = [
    {
      slug: 'luxury-villa-mumbai',
      title: 'Luxury Villa',
      tag: 'Residential',
      location: 'Mumbai',
      intro:
        'Complete aluminium window and sliding door installation designed to maximize natural light.',
      coverImg: '/images/project1.jpeg',
    },
    {
      slug: 'corporate-office',
      title: 'Corporate Office',
      tag: 'Commercial',
      location: 'Pune',
      intro:
        'Modern façade glazing and premium sliding systems installed for a contemporary workspace.',
      coverImg: '/images/project2.jpg',
    },
    {
      slug: 'penthouse-residence',
      title: 'Penthouse Residence',
      tag: 'Residential',
      location: 'Bangalore',
      intro:
        'Minimal frame lift & slide doors with panoramic glazing to create a seamless indoor-outdoor experience.',
      coverImg: '/images/project3.jpeg',
    },
  ]

  const displayProjects = projects.length > 0 ? projects : fallbackProjects

  // If we have a latest blog doc, adapt its hero props
  const heroPost = latestBlogDoc ? blogToDetailProps(latestBlogDoc).post : undefined

  return (
    <main>
      <Navbar theme="dark" />

      {/* Featured / Latest post hero banner */}
      <BlogHero post={heroPost} />

      {/* Blog articles grid / carousel track */}
      <BlogsSection blogs={blogs.length > 0 ? blogs : undefined} />

      {/* Cross-linking: Featured Projects carousel */}
      <Carousel
        title="Featured Projects"
        type="project"
        data={displayProjects}
      />

      <CTAbanner />
      <Footer />
    </main>
  )
}