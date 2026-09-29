'use client';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

export default function WhyUs() {
    const features = [
        {
            id: "01",
            text: "Free site visit in Mumbai scheduled within 48 hours."
        },
        {
            id: "02",
            text: "100% In-house fabrication zero third-party subcontracting."
        },
        {
            id: "03",
            text: "Comprehensive 10-year warranty on all installations."
        },
        {
            id: "04",
            text: "Dedicated Pan-India delivery & installation network."
        }
    ];

    const customEase = [0.22, 1, 0.36, 1];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.9, ease: customEase }
        }
    };

    return (
        <section className={styles.whyUsSection}>
            <div className={styles.whyUsContainer}>
                {/* Section Heading */}
                <motion.h2
                    className={styles.whyUsHeading}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.9, ease: customEase }}
                >
                    WHY CHOOSE US
                </motion.h2>

                {/* Features Grid */}
                <motion.div
                    className={styles.whyUsGrid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            className={styles.whyUsCard}
                            variants={cardVariants}
                        >
                            <div className={styles.whyUsCardNumber}>
                                {feature.id}
                            </div>

                            <p className={styles.whyUsCardText}>
                                {feature.text}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}