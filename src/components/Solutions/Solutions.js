'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

export default function Solutions() {
    // Default fallback data if none is provided via props
    const solutionsData = [
        { id: 1, title: "Hotel & Resort", slug: "hotel-and-resort", image: "/images/sky2.jpg" },
        { id: 2, title: "Restaurant & Cafe", slug: "restaurant-and-cafe", image: "/images/bannerBg.jpg" },
        { id: 3, title: "Shopping Mall", slug: "shopping-mall", image: "/images/worklocation.jpg" },
        { id: 4, title: "RoofTop Bar & Restaurant", slug: "rooftop-bar", image: "/images/project1.jpeg" },
        { id: 5, title: "Leisure & Recreation", slug: "leisure", image: "/images/hero4.jpeg" },
        { id: 6, title: "Residential", slug: "residential", image: "/images/hero5.jpeg" },
    ];

    const customEase = [0.22, 1, 0.36, 1];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.8, ease: customEase }
        }
    };

    return (
        <section className={styles.solutionsSection}>
            <div className={styles.solutionsContainer}>

                {/* Header Area */}
                <div className={styles.solutionsHeader}>
                    <motion.h2
                        className={styles.solutionsHeading}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.8, ease: customEase }}
                    >
                        Solutions we offer
                    </motion.h2>
                </div>

                {/* Dynamic Bento Grid */}
                <motion.div
                    className={styles.solutionsGrid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {solutionsData.map((solution) => (
                        <motion.div
                            key={solution.id}
                            variants={cardVariants}
                            className={styles.solutionCardWrapper}
                        >
                            <Link href={`/products`} className={styles.solutionCard}>
                                <Image
                                    src={solution.image}
                                    alt={solution.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className={styles.solutionImage}
                                    loading="lazy"
                                />

                                {/* The dark overlay and text content */}
                                <div className={styles.solutionOverlay}>
                                    <h3 className={styles.solutionTitle}>{solution.title}</h3>
                                    <span className={styles.solutionExplore}>EXPLORE &rarr;</span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}