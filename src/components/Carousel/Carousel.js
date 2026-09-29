'use client';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Import your card variants
import ProductCard from '../Products/Product';
import BlogCard from '../Blogs/Blog';
import ProjectCard from '../Projects/Project';
import styles from './styles.module.css';

export default function Carousel({
    data = [],
    type = 'product', // 'product' | 'blog' | 'project'
    title = 'WE OFFER PRODUCTS LIKE',
    isLoading = false
}) {
    // ---------------------------------------------------------------------------
    // INTERNAL CONFIGURATION VARIABLES
    // Adjust base paths and component mappings here rather than passing via props
    // ---------------------------------------------------------------------------
    const RESOURCE_CONFIG = {
        product: {
            basePath: '/products',
            CardComponent: ProductCard
        },
        blog: {
            basePath: '/blog',
            CardComponent: BlogCard
        },
        project: {
            basePath: '/projects',
            CardComponent: ProjectCard
        }
    };

    const activeConfig = RESOURCE_CONFIG[type] || RESOURCE_CONFIG.product;
    const ActiveCard = activeConfig.CardComponent;
    const activeBasePath = activeConfig.basePath;

    // ---------------------------------------------------------------------------
    // SCROLL & STATE LOGIC
    // ---------------------------------------------------------------------------
    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        if (scrollWidth === clientWidth) {
            setScrollProgress(0);
            return;
        }

        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll, { passive: true });
            // Initial check in case content overflows on mount
            handleScroll();
        }
        return () => {
            if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
        };
    }, [data, isLoading]);

    const scrollContainer = (direction) => {
        if (!scrollRef.current) return;
        // Dynamic scroll amount based on screen size for better UX
        const scrollAmount = scrollRef.current.clientWidth > 768 ? 400 : 300;

        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // ---------------------------------------------------------------------------
    // RENDER GUARDS & ANIMATIONS
    // ---------------------------------------------------------------------------
    if (!isLoading && (!data || data.length === 0)) return null;

    const customEase = [0.22, 1, 0.36, 1];

    return (
        <section className={styles.carouselSection}>
            <div className={styles.carouselHeader}>
                <motion.h2
                    className={styles.carouselHeading}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: customEase }}
                >
                    {title}
                </motion.h2>

                <div className={styles.carouselNav}>
                    <button
                        onClick={() => scrollContainer('left')}
                        className={styles.carouselNavButton}
                        aria-label="Scroll left"
                        disabled={scrollProgress === 0}
                    >
                        <Image
                            src="/images/arrow.png"
                            alt="Previous"
                            width={28}
                            height={24}
                            className={styles.carouselArrowLeft}
                        />
                    </button>
                    <button
                        onClick={() => scrollContainer('right')}
                        className={styles.carouselNavButton}
                        aria-label="Scroll right"
                        disabled={scrollProgress >= 99}
                    >
                        <Image
                            src="/images/arrow.png"
                            alt="Next"
                            width={28}
                            height={24}
                            className={styles.carouselArrowRight}
                        />
                    </button>
                </div>
            </div>

            <motion.div
                className={styles.carouselTrack}
                ref={scrollRef}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.9, delay: 0.2, ease: customEase }}
            >
                {isLoading ? (
                    // Skeleton loading state
                    [...Array(4)].map((_, i) => (
                        <ActiveCard key={`skeleton-${i}`} isLoading={true} />
                    ))
                ) : (
                    data.map((item) => (
                        <ActiveCard
                            key={item.slug || item.id}
                            data={item}
                            basePath={activeBasePath}
                            isLoading={false}
                        />
                    ))
                )}
            </motion.div>
        </section>
    );
}