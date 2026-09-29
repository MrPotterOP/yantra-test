'use client';

import styles from './styles.module.css';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Advantages() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveIndex((prevIndex) => (prevIndex + 1) % 4);
        }, 10000);

        return () => clearTimeout(timer);
    }, [activeIndex]);

    const premiumEase = [0.22, 1, 0.36, 1];

    const layoutTransition = {
        type: "spring",
        bounce: 0,
        duration: 0.8
    };

    const advantagesData = [
        {
            title: "NETWORK",
            icon: "/images/adv_net.png",
            desc: "SYNERGY WITH OTHER AGENCIES. Complete co-ordination between all agencies working on site to give a seamless experience to the end customer."
        },
        {
            title: "LIFETIME WARRANTY",
            icon: "/images/adv_war.png",
            desc: "A Lifetime warranty for all our services. At Yantra, we assure you of an unparalleled home design experience. We conduct quality checks at every stage to offer products free from material and manufacturing defects."
        },
        {
            title: "ANNUAL MAINTENANCE",
            icon: "/images/adv_maint.png",
            desc: "We offer an Annual Maintenance Contract for all our services. We create products that withstand the test of time. Our efficient service engineers undertake servicing at any location convenient to the customers."
        },
        {
            title: "AVAILABILITY",
            icon: "/images/adv_avail.png",
            desc: "Our availability across India. With a Pan India presence, we understand our customers' requirements and source the best materials from across the globe to create world-class products."
        }
    ];

    return (
        <section id={styles.advantages}>
            <div className={styles.advantagesContainer}>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.4, ease: premiumEase }}
                    className={styles.advantagesBackground}
                >
                    <Image
                        src="/images/adv_bg.jpeg"
                        alt="advantages background"
                        fill
                        sizes="100vw"
                        quality={90}
                        className={styles.advantagesBackgroundImage}
                    />

                    <div className={styles.advantagesOverlay}></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.9, ease: premiumEase }}
                    className={styles.advantagesHeader}
                >
                    <p>WHY CHOOSE US</p>
                    <h1>OUR ADVANTAGES</h1>
                </motion.div>

                <motion.div
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                        duration: 0.9,
                        ease: premiumEase,
                        delay: 0.15
                    }}
                    className={styles.advantagesList}
                >
                    {advantagesData.map((item, idx) => {
                        const isActive = activeIndex === idx;

                        return (
                            <motion.div
                                key={idx}
                                layout
                                transition={layoutTransition}
                                className={`${styles.advantagesCard} ${isActive ? styles.advantagesCardActive : ''
                                    }`}
                                onClick={() => setActiveIndex(idx)}
                            >
                                <motion.div
                                    layout
                                    transition={layoutTransition}
                                    className={styles.advantagesCardContent}
                                >
                                    {/* Icon Group */}
                                    <motion.div
                                        layout
                                        transition={layoutTransition}
                                        className={styles.advantagesIconGroup}
                                    >
                                        <motion.div
                                            layout
                                            transition={layoutTransition}
                                            className={styles.advantagesIconWrapper}
                                        >
                                            <Image
                                                src={item.icon}
                                                alt={item.title}
                                                width={40}
                                                height={40}
                                            />
                                        </motion.div>

                                        <motion.div
                                            layout
                                            transition={layoutTransition}
                                            className={styles.advantagesDivider}
                                        />

                                        <motion.h3
                                            layout
                                            transition={layoutTransition}
                                        >
                                            {item.title}
                                        </motion.h3>
                                    </motion.div>

                                    {/* Description */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    y: 15
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: 5
                                                }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.2,
                                                    ease: "easeOut"
                                                }}
                                                className={styles.advantagesDescription}
                                            >
                                                <p>{item.desc}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Progress Bar */}
                                <div className={styles.advantagesProgressBar}>
                                    {isActive && (
                                        <motion.div
                                            className={styles.advantagesProgress}
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{
                                                duration: 10,
                                                ease: "linear"
                                            }}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

export default Advantages;