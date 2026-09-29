'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Project from './Project';
import styles from './styles.module.css';

export default function Projects({ isLoading = false, projects: projectsProp }) {
    // Use live CMS data when provided; fall back to hardcoded array so the
    // home page continues to work until it is wired up to the CMS.
    const projects = projectsProp ?? [
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

    const scrollRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    if (!isLoading && (!projects || projects.length === 0)) {
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
    }, [projects, isLoading]);

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
        <section className={styles.projectsSection}>
            <div className={styles.projectsHeader}>
                <motion.h2
                    className={styles.projectsHeading}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        ease: customEase,
                    }}
                >
                    Featured Projects
                </motion.h2>

                <div className={styles.projectsNav}>
                    <button
                        onClick={() => scrollContainer('left')}
                        className={styles.navButton}
                        aria-label="Previous projects"
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
                        aria-label="Next projects"
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
                className={styles.projectsTrack}
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
                        <Project key={i} isLoading />
                    ))
                ) : (
                    projects.map((project) => (
                        <Project
                            key={project.slug}
                            data={project}
                            isLoading={false}
                        />
                    ))
                )}
            </motion.div>
        </section>
    );
}