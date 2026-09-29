'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

export default function WorkLocations() {
    const mumbaiLocations = [
        "ANDHERI", "BANDRA", "POWAI", "THANE", "NAVI MUMBAI", "SOUTH BOMBAY"
    ];

    const panIndiaLocations = [
        "PUNE", "BANGALORE", "DELHI NCR", "HYDERABAD", "AHMEDABAD", "GOA"
    ];

    const customEase = [0.22, 1, 0.36, 1];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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

    const lineVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: {
            height: '100%',
            opacity: 0.4,
            transition: { duration: 1.2, ease: customEase, delay: 0.4 }
        }
    };

    return (
        <section className={styles.workLocationsSection}>
            {/* Background Image & Dark Overlay */}
            <div className={styles.workLocationsBgWrapper}>
                <Image
                    src="/images/worklocation.jpg"
                    alt="Abstract Architectural Ceiling"
                    fill
                    sizes="100vw"
                    className={styles.workLocationsBgImage}
                    quality={90}
                />
                <div className={styles.workLocationsOverlay}></div>
            </div>

            <div className={styles.workLocationsContainer}>
                {/* Header Section */}
                <motion.div
                    className={styles.workLocationsHeader}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.9, ease: customEase }}
                >
                    <p className={styles.workLocationsSubhead}>LOCATIONS</p>
                    <h2 className={styles.workLocationsHeading}>WHERE WE WORK</h2>
                </motion.div>

                {/* Lists Section */}
                <div className={styles.workLocationsContentGrid}>

                    <motion.div
                        className={styles.workLocationsColumn}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.h3 variants={itemVariants}>
                            MUMBAI (LOCAL SERVICE)
                        </motion.h3>

                        <ul className={styles.workLocationsList}>
                            {mumbaiLocations.map((loc, idx) => (
                                <motion.li key={idx} variants={itemVariants}>
                                    {loc}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    <div className={styles.workLocationsDividerWrapper}>
                        <motion.div
                            className={styles.workLocationsDivider}
                            variants={lineVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                        />
                    </div>

                    <motion.div
                        className={styles.workLocationsColumn}
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.h3 variants={itemVariants}>
                            PAN-INDIA INSTALLATION
                        </motion.h3>

                        <ul className={styles.workLocationsList}>
                            {panIndiaLocations.map((loc, idx) => (
                                <motion.li key={idx} variants={itemVariants}>
                                    {loc}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}