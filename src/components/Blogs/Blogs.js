'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Blog from './Blog';
import styles from './styles.module.css'; // Make sure to copy your Projects parent CSS here

export default function Blogs({ isLoading = false, blogs: blogsProp }) {
    const blogs = (blogsProp && blogsProp.length > 0) ? blogsProp : [
        {
            slug: 'understanding-aluminium-windows',
            title: 'Understanding Aluminium Windows',
            date: 'December 20th, 2024',
            intro: 'A comprehensive guide to choosing the right aluminium windows for your next residential project.',
            coverImg: '/images/project1.jpeg', // update with your blog images
        },
        {
            slug: 'future-of-facade-glazing',
            title: 'The Future of Façade Glazing',
            date: 'December 15th, 2024',
            intro: 'Exploring modern façade glazing techniques reshaping contemporary corporate workspaces.',
            coverImg: '/images/project2.jpg',
        },
        {
            slug: 'seamless-indoor-outdoor-living',
            title: 'Indoor-Outdoor Living',
            date: 'November 28th, 2024',
            intro: 'How minimal frame lift & slide doors can completely transform your penthouse or villa.',
            coverImg: '/images/project3.jpeg',
        },
        {
            slug: 'energy-efficient-skylights',
            title: 'Energy Efficient Skylights',
            date: 'November 10th, 2024',
            intro: 'Discover how custom skylight systems are elevating luxury resorts and hospitality.',
            coverImg: '/images/projectJp.jpg',
        },
    ];

    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    if (!isLoading && (!blogs || blogs.length === 0)) {
        return null;
    }

    const handleScroll = () => {
        if (!scrollRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

        if (scrollWidth === clientWidth) {
            setScrollProgress(0);
            return;
        }

        const progress =
            (scrollLeft / (scrollWidth - clientWidth)) * 100;

        setScrollProgress(progress);
    };

    useEffect(() => {
        const currentRef = scrollRef.current;

        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
            handleScroll();
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [blogs, isLoading]);

    const scrollContainer = (direction) => {
        if (!scrollRef.current) return;

        const scrollAmount =
            scrollRef.current.clientWidth > 768 ? 400 : 300;

        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    const customEase = [0.22, 1, 0.36, 1];

    return (
        <section className={styles.blogsSection}>
            <div className={styles.blogsHeader}>
                <motion.h2
                    className={styles.blogsHeading}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        ease: customEase,
                    }}
                >
                    Latest Articles
                </motion.h2>

                <div className={styles.blogsNav}>
                    <button
                        onClick={() => scrollContainer('left')}
                        className={styles.navButton}
                        aria-label="Previous articles"
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
                        aria-label="Next articles"
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

            <motion.div
                ref={scrollRef}
                className={styles.blogsTrack}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                    duration: 0.9,
                    delay: 0.2,
                    ease: customEase,
                }}
            >
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <Blog key={i} isLoading />
                    ))
                ) : (
                    blogs.map((blog) => (
                        <Blog
                            key={blog.slug}
                            data={blog}
                            isLoading={false}
                        />
                    ))
                )}
            </motion.div>
        </section>
    );
}