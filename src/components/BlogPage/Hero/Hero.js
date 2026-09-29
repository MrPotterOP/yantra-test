'use client';

import styles from './styles.module.css';
import { motion } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: customEase }
    }
};

const imageRevealVariants = {
    hidden: { opacity: 0, scale: 1.04 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 1.4, ease: customEase, delay: 0.2 }
    }
};

// --- DUMMY DATA FOR TESTING ---
const DUMMY_POST = {
    title: "REVOLUTIONIZE YOUR SPACES WITH SOLAGLIDE",
    date: "December 4th, 2024",
    author: "Sam Altmen",
    image: "/images/sky2.jpg"
};


const TEST_IS_LOADING = false;

export default function BlogHero({
    post = DUMMY_POST,
    isLoading = TEST_IS_LOADING
}) {
    return (
        <header className={styles.heroSection}>
            <div className={styles.heroContainer}>

                {/* Top Info Layout Wrapper */}
                <div className={styles.metaGrid} key={isLoading ? 'loading-meta' : 'loaded-meta'}>
                    {isLoading ? (
                        <motion.div
                            className={`${styles.skeleton} ${styles.skeletonTitle}`}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                        />
                    ) : (
                        <motion.h1
                            className={styles.blogTitle}
                            initial="hidden"
                            animate="visible"
                            variants={fadeUpVariants}
                        >
                            {post.title}
                        </motion.h1>
                    )}

                    <motion.div
                        className={styles.authorDateBlock}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <motion.div variants={fadeUpVariants} className={styles.metaItem}>
                                    <div className={`${styles.skeleton} ${styles.skeletonMetaLabel}`} />
                                    <div className={`${styles.skeleton} ${styles.skeletonMetaValue}`} />
                                </motion.div>
                                <motion.div variants={fadeUpVariants} className={styles.metaItem}>
                                    <div className={`${styles.skeleton} ${styles.skeletonMetaLabel}`} />
                                    <div className={`${styles.skeleton} ${styles.skeletonMetaValue}`} />
                                </motion.div>
                            </>
                        ) : (
                            <>
                                <motion.div variants={fadeUpVariants} className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Date</span>
                                    <span className={styles.metaValue}>{post.date}</span>
                                </motion.div>

                                <motion.div variants={fadeUpVariants} className={styles.metaItem}>
                                    <span className={styles.metaLabel}>Author</span>
                                    <span className={styles.metaValue}>{post.author}</span>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </div>

                {/* Dynamic Structural Breadcrumbs */}
                <motion.nav
                    className={styles.breadcrumbs}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6, ease: customEase }}
                    key={isLoading ? 'loading-nav' : 'loaded-nav'}
                >
                    {isLoading ? (
                        <div className={`${styles.skeleton} ${styles.skeletonBreadcrumb}`} />
                    ) : (
                        <>
                            <span className={styles.crumbLink}>Home</span>
                            <span className={styles.separator}>&gt;</span>
                            <span className={styles.crumbLink}>Blogs</span>
                            <span className={styles.separator}>&gt;</span>
                            <span className={styles.activeCrumb}>{post.title}</span>
                        </>
                    )}
                </motion.nav>

                {/* Wide Landscape Banner Viewport */}
                <div className={styles.imageViewport}>
                    {isLoading ? (
                        <div className={`${styles.skeleton} ${styles.skeletonImageBlock}`} />
                    ) : (
                        <motion.img
                            src={post.image}
                            alt={post.title}
                            className={styles.heroImage}
                            initial="hidden"
                            animate="visible"
                            variants={imageRevealVariants}
                        />
                    )}
                </div>

            </div>
        </header>
    );
}