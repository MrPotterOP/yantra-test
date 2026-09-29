'use client';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Product from './Product';
import styles from './styles.module.css';

export default function Products({ isLoading = false }) {

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


    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    if (!isLoading && (!products || products.length === 0)) {
        return null;
    }

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollWidth === clientWidth) return setScrollProgress(0);

        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
            handleScroll();
        }
        return () => {
            if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
        };
    }, [products, isLoading]);

    const scrollContainer = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth > 768 ? 400 : 300;

        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const customEase = [0.22, 1, 0.36, 1];

    return (
        <section className={styles.productsSection}>
            <div className={styles.productsHeader}>
                <motion.h2
                    className={styles.productsHeading}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: customEase }}
                >
                    WE OFFER PRODUCTS LIKE
                </motion.h2>

                {/* Updated Navigation Controls using Images */}
                <div className={styles.productsNav}>
                    <button
                        onClick={() => scrollContainer('left')}
                        className={styles.navButton}
                        aria-label="Previous products"
                    >
                        <Image
                            src="/images/arrow.png"
                            alt="Previous"
                            width={28}
                            height={24}
                            className={styles.arrowLeft}
                        />
                    </button>
                    <button
                        onClick={() => scrollContainer('right')}
                        className={styles.navButton}
                        aria-label="Next products"
                    >
                        <Image
                            src="/images/arrow.png"
                            alt="Next"
                            width={28}
                            height={24}
                            className={styles.arrowRight}
                        />
                    </button>
                </div>
            </div>

            {/* Scrollable Track - Now bleeds to the right */}
            <motion.div
                className={styles.productsTrack}
                ref={scrollRef}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.9, delay: 0.2, ease: customEase }}
            >
                {isLoading ? (
                    [...Array(3)].map((_, i) => <Product key={i} isLoading={true} />)
                ) : (
                    products.map((product) => (
                        <Product key={product.slug} data={product} isLoading={false} />
                    ))
                )}
            </motion.div>
        </section>
    );
}