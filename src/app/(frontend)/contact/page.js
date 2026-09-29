import { getPayload } from 'payload'
import config from '@payload-config'

import CTAbanner from "@/components/CTAbanner/CTAbanner";
import Footer from "@/components/Footer/Footer";
import Carousel from "@/components/Carousel/Carousel";

import Header from "@/components/Contact/Header";
import ContactForm from "@/components/Contact/ContactForm";
import ProjectSlider from "@/components/Projects/ProjectsSlider";
import StickyBtns from "@/components/StickyBtns/StickyBtns";

import { productToCardProps } from '@/lib/adapters/card-adapters.js'

export const revalidate = false; // Disable periodic revalidation; ISR on-demand can be added later if needed

async function getFeaturedProducts() {
  try {
    const payload = await getPayload({ config })
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

    return productDocs.map(productToCardProps).filter(Boolean)
  } catch (err) {
    console.error("Error fetching contact page products:", err)
    return []
  }
}

export default async function Contact() {
    const products = await getFeaturedProducts()

    return (
        <main>
            <Header
                description="Fill the basic info about you and the project and we will reach out to you within 24 hours. If you have anything specific or any quarry you can mail us at sales@yantraindia.com"
                title="CONTACT US"
            />
            <ContactForm />
            <ProjectSlider />
            
            {products.length > 0 && (
                <Carousel 
                    title="OUR PRODUCTS"
                    type="product" 
                    data={products} 
                />
            )}
            
            <StickyBtns />

            <CTAbanner />
            <Footer />
        </main>
    );
}
