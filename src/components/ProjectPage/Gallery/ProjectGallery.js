'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

// Viewport slide animation variants based on direction
const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? '4%' : '-4%',
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: customEase }
    },
    exit: (direction) => ({
        x: direction < 0 ? '4%' : '-4%',
        opacity: 0,
        transition: { duration: 0.6, ease: customEase }
    })
};

export default function ProjectGallery({
    images = [
        { url: "/images/hero1.jpeg", alt: "Modern architectural framework primary view" },
        { url: "/images/hero2.jpg", alt: "Interior minimal concrete floating staircase" },
        { url: "/images/hero3.jpg", alt: "Symmetrical structural pillars and glass facade" },
        { url: "/images/sky2.jpg", alt: "Minimal overhead geometry and skylight installation" },
        { url: "/images/hero1.jpeg", alt: "Modern architectural framework primary view" },
        { url: "/images/hero2.jpg", alt: "Interior minimal concrete floating staircase" },
        { url: "/images/hero3.jpg", alt: "Symmetrical structural pillars and glass facade" },
        { url: "/images/sky2.jpg", alt: "Minimal overhead geometry and skylight installation" },
    ]
}) {
    const [[page, direction], setPage] = useState([0, 0]);

    // Safely wrap index bounds dynamically matching any array size
    const activeIndex = Math.abs(page % images.length);

    const navigate = (newDirection) => {
        setPage([page + newDirection, newDirection]);
    };

    const jumpToImage = (index) => {
        const targetDirection = index > activeIndex ? 1 : -1;
        setPage([index, targetDirection]);
    };

    if (!images || images.length === 0) return null;

    return (
        <section className={styles.gallerySection}>
            <div className={styles.galleryContainer}>

                {/* --- Main Active Asset Viewport --- */}
                <div className={styles.mainViewportWrapper}>
                    <div className={styles.viewportClip}>
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.img
                                key={page}
                                src={images[activeIndex].url}
                                alt={images[activeIndex].alt}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className={styles.activeGalleryImg}
                            />
                        </AnimatePresence>
                    </div>

                    {/* Left Navigation Overlay Trigger */}
                    <button
                        className={`${styles.navArrow} ${styles.leftArrow}`}
                        onClick={() => navigate(-1)}
                        aria-label="Previous image"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    {/* Right Navigation Overlay Trigger */}
                    <button
                        className={`${styles.navArrow} ${styles.rightArrow}`}
                        onClick={() => navigate(1)}
                        aria-label="Next image"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* --- Syncing Multi-Asset Thumbnail Track --- */}
                <div className={styles.thumbnailTrackWrapper}>
                    <div className={styles.thumbnailScrollTrack}>
                        {images.map((img, idx) => {
                            const isActive = idx === activeIndex;
                            return (
                                <button
                                    key={`${img.url}-${idx}`}
                                    onClick={() => jumpToImage(idx)}
                                    className={`${styles.thumbnailCard} ${isActive ? styles.activeCard : ''}`}
                                    aria-label={`Jump to image detail row ${idx + 1}`}
                                >
                                    <img src={img.url} alt={img.alt} className={styles.thumbnailImg} />

                                    {/* Premium subtle active frame border overlay */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeBorderFrame"
                                            className={styles.activeFrameIndicator}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}