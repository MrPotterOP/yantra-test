'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './styles.module.css';

export default function Culture() {
    const cultureFeatures = [
        {
            id: "impact",
            title: "DIRECT IMPACT",
            text: "No bureaucratic red tape. You work directly on projects that transform premium real estate across the country."
        },
        {
            id: "tools",
            title: "INDUSTRY-LEADING TOOLS",
            text: "Equipped with state-of-the-art software and fabrication tech to ensure your execution matches your ambition."
        },
        {
            id: "exposure",
            title: "PAN-INDIA EXPOSURE",
            text: "Depending on your role, you'll have the opportunity to oversee installations and connect with architects in major metropolitan hubs."
        }
    ];

    const customEase = [0.22, 1, 0.36, 1];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.9, ease: customEase }
        }
    };

    return (
        <section className={styles.cultureSection}>
            {/* Next.js Optimized Background Image */}
            <Image
                src="/images/sky2.jpg"
                alt="Working at Yantra Culture"
                fill
                className={styles.cultureBgImage}
                quality={90}
            />

            {/* Dark gradient overlay to guarantee text contrast */}
            <div className={styles.cultureOverlay}></div>

            <div className={styles.cultureContainer}>
                <motion.h2
                    className={styles.cultureHeading}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.9, ease: customEase }}
                >
                    WORKING AT YANTRA
                </motion.h2>

                <motion.div
                    className={styles.cultureGrid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {cultureFeatures.map((feature) => (
                        <motion.div
                            key={feature.id}
                            className={styles.cultureCard}
                            variants={cardVariants}
                        >
                            <h3 className={styles.cultureCardTitle}>
                                {feature.title}
                            </h3>
                            <p className={styles.cultureCardText}>
                                {feature.text}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}