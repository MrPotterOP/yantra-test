import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ProductDetail from "../../../components/ProductPage/ProductDetails/ProductDetails";
import Carousel from "@/components/Carousel/Carousel";
import CTAbanner from "@/components/CTAbanner/CTAbanner";



export default function Product() {

    const products = [
        {
            slug: "sliding-windows",
            title: "Sliding Windows",
            category: "Window System",
            intro:
                "Smooth horizontal sliding windows with slim aluminium frames and large glass panels.",
            coverImg: "/images/product1.jpg",
        },
        {
            slug: "casement-windows",
            title: "Casement Windows",
            category: "Window System",
            intro:
                "Side-hinged windows designed for maximum ventilation and weather resistance. Side-hinged windows designed for maximum ventilation and weather resistance. Side-hinged windows designed for maximum ventilation and weather resistance. Side-hinged windows designed for maximum ventilation and weather resistance.",
            coverImg: "/images/product2.jpg",
        },
        {
            slug: "folding-doors",
            title: "Folding Doors",
            category: "Door System",
            intro:
                "Bi-fold aluminium doors that create seamless indoor and outdoor living spaces.",
            coverImg: "/images/product3.jpg",
        },
        {
            slug: "lift-and-slide-doors",
            title: "Lift & Slide Doors",
            category: "Door System",
            intro:
                "Premium large-format sliding doors with effortless operation and panoramic views.",
            coverImg: "/images/product4.jpg",
        },
        {
            slug: "fixed-glazing",
            title: "Fixed Glazing",
            category: "Glass Solution",
            intro:
                "Minimalist fixed glass panels for uninterrupted daylight and modern aesthetics.",
            coverImg: "/images/product5.jpg",
        },
        {
            slug: "skylight-systems",
            title: "Skylight Systems",
            category: "Skylight",
            intro:
                "Custom skylight solutions that maximize natural light while maintaining thermal performance.",
            coverImg: "/images/product6.jpg",
        },
    ];

    const projects = [
        {
            slug: 'luxury-villa-mumbai',
            title: 'Luxury Villa',
            tag: 'Residential',
            location: 'Mumbai',
            intro:
                'Complete aluminium window and sliding door installation designed to maximize natural light and unobstructed views.',
            coverImg: '/images/project1.jpeg',
        },
        {
            slug: 'corporate-office',
            title: 'Corporate Office',
            tag: 'Commercial',
            location: 'Pune',
            intro:
                'Modern façade glazing and premium sliding systems installed for a contemporary corporate workspace.',
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
        {
            slug: 'luxury-resort',
            title: 'Luxury Resort',
            tag: 'Hospitality',
            location: 'Goa',
            intro:
                'Custom skylight systems and high-performance glazing solutions for guest villas and common areas.',
            coverImg: '/images/projectJp.jpg',
        },
        {
            slug: 'showroom-project',
            title: 'Premium Showroom',
            tag: 'Commercial',
            location: 'Ahmedabad',
            intro:
                'Large fixed glazing and elegant entrance systems designed to enhance product visibility and customer experience.',
            coverImg: '/images/project2.jpg',
        },
        {
            slug: 'farmhouse-project',
            title: 'Modern Farmhouse',
            tag: 'Residential',
            location: 'Nashik',
            intro:
                'Bespoke aluminium windows, folding doors, and skylights tailored for a contemporary countryside residence.',
            coverImg: '/images/project1.jpeg',
        },
    ];

    return (
        <main>
            <Navbar theme="dark" />
            <ProductDetail />
            <Carousel title="Similar Products" data={products} type="product" />
            <Carousel title="Featured Projects" data={projects} type="projects" />
            <CTAbanner />
            <Footer />
        </main>
    )
}