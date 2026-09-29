'use client';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

export default function HowWeWork() {
    const steps = [
        {
            id: 1,
            title: "Site Visit",
            text: "Precise measurements and structural assessment (in-person for Mumbai, guided video consultation for other cities)."
        },
        {
            id: 2,
            title: "Design & Quote",
            text: "Tailored material recommendations and detailed structural blueprints provided by our engineering team."
        },
        {
            id: 3,
            title: "Fabrication",
            text: "Precision-built and rigorously tested at our state-of-the-art facility in Mumbai."
        },
        {
            id: 4,
            title: "Installation",
            text: "Seamlessly executed by our in-house team or certified local installation partners across India."
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

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: customEase }
        }
    };

    // Swapped to an elegant fade to perfectly handle both vertical & horizontal orientations
    const lineVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.8, ease: customEase, delay: 0.3 }
        }
    };

    return (
        <section className={styles.workSection}>
            <div className={styles.workContainer}>

                <motion.h2
                    className={styles.workHeading}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, ease: customEase }}
                >
                    HOW WE WORK
                </motion.h2>

                <motion.div
                    className={styles.stepsGrid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {steps.map((step, index) => (
                        <motion.div key={step.id} className={styles.stepItem} variants={itemVariants}>

                            <div className={styles.stepVisuals}>
                                <div className={styles.stepBox}>
                                    {step.id}
                                </div>
                            </div>

                            <div className={styles.stepContent}>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepText}>{step.text}</p>
                            </div>

                            {/* Rendered at the item level to calculate relative coordinates correctly */}
                            {index !== steps.length - 1 && (
                                <motion.div
                                    className={styles.connectorLine}
                                    variants={lineVariants}
                                />
                            )}

                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}