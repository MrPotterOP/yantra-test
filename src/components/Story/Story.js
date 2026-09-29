'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

export default function Story() {

    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.97 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
        }
    };

    return (
        <section className={styles.storySection}>
            <div className={styles.storyContainer}>

                {/* Text Content Block */}
                <motion.div
                    className={styles.storyTextColumn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-120px" }}
                    variants={textVariants}
                >
                    <h2>OUR STORY</h2>
                    <p>
                        We started in Mumbai in 2010, fabricating windows and skylights for homes along the coast that needed to hold up against severe monsoon winds and corrosive salt air. That requirement products that survive Mumbai's weather, is still the standard we build to for every project we take on, whether it's an oceanfront villa in Bandra or a high-altitude resort in Bangalore.
                    </p>
                    <p>
                        Today, our fabrication unit and design team remain rooted in Mumbai, but our installation network covers Pune, Bangalore, Delhi NCR, and beyond. Every single order, regardless of its final destination, is engineered, assembled, and quality-checked at our Mumbai facility before it ships to ensure uncompromising precision.
                    </p>
                </motion.div>

                {/* Architectural Image Block */}
                <motion.div
                    className={styles.storyImageColumn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-120px" }}
                    variants={imageVariants}
                >
                    <div className={styles.storyImageWrapper}>
                        <Image
                            src="/images/sky1.jpg"
                            alt="Our Story Architectural Skylight"
                            fill
                            sizes="(max-width: 62em) 100vw, 50vw"
                            priority
                            className={styles.storyImage}
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}