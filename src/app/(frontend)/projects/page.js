/**
 * /project — Project Listing Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Server Component. Fetches all projects grouped by category from Payload CMS
 * and renders a category-titled <Carousel> for each group.
 *
 * If no projects exist in the CMS yet, gracefully renders nothing (no carousels).
 * The CTA banner and footer always render.
 *
 * On-demand ISR: revalidated whenever a project or category is saved in the
 * CMS (via afterChange hooks that call revalidatePath('/project')).
 */

import { getPayload } from 'payload'
import config from '@payload-config'

import Navbar from '@/components/Navbar/Navbar'
import Carousel from '@/components/Carousel/Carousel'
import CTAbanner from '@/components/CTAbanner/CTAbanner'
import Footer from '@/components/Footer/Footer'

import { groupProjectsByCategory } from '@/lib/adapters/project-adapter'

// ─── On-demand ISR — no periodic timer ───────────────────────────────────────
export const revalidate = false

// ─── SEO metadata ─────────────────────────────────────────────────────────────
export const metadata = {
  title: 'Projects | Yantra — Windows, Doors & Skylights',
  description:
    'Explore Yantra\'s portfolio of residential, commercial, and hospitality ' +
    'projects featuring custom aluminium windows, skylights, and glazing systems ' +
    'across India.',
  openGraph: {
    title: 'Projects | Yantra',
    description:
      'Browse our portfolio of aluminium window, skylight, and glazing projects.',
    type: 'website',
    url: '/project',
  },
  alternates: { canonical: '/project' },
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getProjectsData() {
  const payload = await getPayload({ config })

  // Fetch categories and projects in parallel — no N+1
  const [{ docs: categories }, { docs: projects }] = await Promise.all([
    payload.find({
      collection: 'project-categories',
      depth: 0,
      limit: 50,
      pagination: false,
    }),
    payload.find({
      collection: 'projects',
      depth: 2,   // populate heroImage.url (Cloudinary) and category.name
      limit: 200,
      pagination: false,
    }),
  ])

  return { categories, projects }
}

// ─── Page component ───────────────────────────────────────────────────────────
export default async function ProjectListingPage() {
  const { categories, projects } = await getProjectsData()

  // Group projects into per-category arrays, ordered by the categories list
  const categorised = groupProjectsByCategory(projects, categories)

  return (
    <main>
      <Navbar
        theme='dark'
      />

      {/* Category-wise project carousels */}
      {categorised.map((group) => (
        <Carousel
          key={group.id}
          title={group.name}
          data={group.projects}
          type="project"
        />
      ))}

      {/* Fallback when no projects exist in CMS yet */}
      {categorised.length === 0 && (
        <section style={{ padding: '120px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-gray, #888)', fontSize: '1rem' }}>
            Projects coming soon.
          </p>
        </section>
      )}

      <CTAbanner
        title="Interested in Working With Us?"
        cta="Enquire Now"
        imgSrc="/images/sky2.jpg"
        link="/contact"
      />

      <Footer />
    </main>
  )
}