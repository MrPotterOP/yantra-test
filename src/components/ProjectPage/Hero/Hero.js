'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

// Animation variants for cleaner JSX
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: customEase } }
};

// --- DUMMY DATA FOR TESTING ---
const DUMMY_PROJECT = {
    title: "CROWNE PLAZA - ORTAKOY BOSPHORUS HOTEL",
    id: "1003",
    location: "New Delhi",
    category: "Restaurant & Cafe",
    image: "/images/hero3.jpg", // Temporary valid image for testing
    breadcrumbs: ["Home", "Projects", "Crowne Plaza - Ortakoy Bosphorus Hotel"]
};


const TEST_IS_LOADING = false;

export default function ProjectHero({
    project = DUMMY_PROJECT,
    isLoading = TEST_IS_LOADING
}) {

    const [activeTag, setActiveTag] = useState(null);

    return (
        <section className={styles.projectHeroSection}>
            <motion.div
                className={styles.projectHeroMediaWrapper}
                initial={{ opacity: 0.6, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.4, ease: customEase }}
            >
                {isLoading ? (
                    <div className={`${styles.skeletonDark} ${styles.skeletonImageBlock}`} />
                ) : (
                    <img
                        src={project.image}
                        alt={`View of ${project.title}`}
                        className={styles.projectHeroBgImg}
                    />
                )}
            </motion.div>

            {/* Content Wrapper anchored to bottom-left */}
            <div className={styles.projectHeroContentWrapper}>

                {/* Breadcrumbs */}
                <motion.nav
                    aria-label="breadcrumb"
                    className={styles.projectHeroBreadcrumbs}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: customEase, delay: 0.5 }}
                >
                    {isLoading ? (
                        <div className={`${styles.skeletonTranslucent} ${styles.skeletonBreadcrumb}`} />
                    ) : (
                        project.breadcrumbs.join(' > ')
                    )}
                </motion.nav>

                {/* White Info Box */}
                <motion.div
                    className={styles.projectHeroInfoBox}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    // Ensures the framer-motion animations re-trigger when loading state changes
                    key={isLoading ? 'loading' : 'loaded'}
                >
                    {isLoading ? (
                        <>
                            <motion.div variants={itemVariants} className={`${styles.skeleton} ${styles.skeletonSubtitle}`} />
                            <motion.div variants={itemVariants} className={`${styles.skeleton} ${styles.skeletonTitle}`} />

                            <motion.div variants={itemVariants} className={styles.projectHeroTagsGrid}>
                                <div className={`${styles.skeleton} ${styles.skeletonTag}`} />
                                <div className={`${styles.skeleton} ${styles.skeletonTag}`} />
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <motion.p variants={itemVariants} className={styles.projectHeroSubtitle}>
                                Project No. {project.id}
                            </motion.p>

                            <motion.h1 variants={itemVariants} className={styles.projectHeroTitle}>
                                {project.title}
                            </motion.h1>

                            <motion.div variants={itemVariants} className={styles.projectHeroTagsGrid}>
                                {/* Location Tag */}
                                <motion.button
                                    className={`${styles.projectHeroTag} ${activeTag === 'location' ? styles.active : ''}`}
                                    onClick={() => setActiveTag(activeTag === 'location' ? null : 'location')}
                                    whileHover={{ scale: 1.02, backgroundColor: 'var(--color-black)', color: 'var(--color-white)' }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.3, ease: customEase }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {project.location}
                                </motion.button>

                                {/* Category Tag */}
                                <motion.button
                                    className={`${styles.projectHeroTag} ${activeTag === 'category' ? styles.active : ''}`}
                                    onClick={() => setActiveTag(activeTag === 'category' ? null : 'category')}
                                    whileHover={{ scale: 1.02, backgroundColor: 'var(--color-black)', color: 'var(--color-white)' }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ duration: 0.3, ease: customEase }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                        <line x1="9" y1="21" x2="9" y2="9"></line>
                                    </svg>
                                    {project.category}
                                </motion.button>
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </div>
        </section>
    );
}