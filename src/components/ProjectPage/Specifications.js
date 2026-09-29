'use client';

import styles from './specifications.module.css';
import { motion } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: customEase }
    }
};

export default function ProjectSpecs({
    specs = [
        { label: "System", value: "Retractable Structures\nRetractable Skylights" },
        { label: "Sub-System", value: "SolaGlide" },
        { label: "Glazing", value: "75% Opening Up: 7 Bay,\nSpan 11.09mx8.25m,\nL: 10.96m" },
        { label: "Size", value: "10m x 40m" }
    ]
}) {

    // Enforce the strict 6-item structural limit for layout safety
    const visibleSpecs = specs.slice(0, 6);

    return (
        <section className={styles.specsSection}>
            <motion.div
                className={styles.specsContainer}
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
            >
                {visibleSpecs.map((spec, index) => (
                    <motion.div
                        key={`${spec.label}-${index}`}
                        className={styles.specBox}
                        variants={itemVariants}
                    >
                        <span className={styles.specLabel}>{spec.label}</span>
                        <p className={styles.specValue}>{spec.value}</p>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}