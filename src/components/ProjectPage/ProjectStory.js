'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './story.module.css';
import { motion } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

export default function ProjectStory({
    story = {
        title: "Combine Indoor Comfort with Outdoor Freedom with Libart's SolaGlide Sliding Panel Roof",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. This is extra text to force an overflow state. We want to make sure the clamp works perfectly and the user gets a smooth read-more experience. Adding even more text here to ensure the visual weight triggers our custom React layout effect. The sticky image will stay in view as you read all of this.",
        image: "/images/hero3.jpg"
    }
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [clampedHeight, setClampedHeight] = useState(160); // Default mobile clamp height

    const contentRef = useRef(null);
    const sectionRef = useRef(null);

    // Dynamic breakpoint detection for the clamp height
    useEffect(() => {
        const updateDimensions = () => {
            // 240px for desktop (~9 lines), 160px for mobile (~6 lines)
            const currentClampHeight = window.innerWidth > 992 ? 240 : 160;
            setClampedHeight(currentClampHeight);

            if (contentRef.current) {
                setIsOverflowing(contentRef.current.scrollHeight > currentClampHeight);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [story.description]);

    const handleToggle = () => {
        if (isExpanded) {
            // Smooth scroll back up to preserve context
            sectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            // Delay the collapse slightly so the scroll starts first
            setTimeout(() => setIsExpanded(false), 150);
        } else {
            setIsExpanded(true);
        }
    };

    return (
        <section className={styles.storySection} ref={sectionRef}>
            <div className={styles.storyContainer}>

                <motion.div
                    className={styles.textContentWrapper}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1, ease: customEase }}
                >
                    <h3 className={styles.storyTitle}>{story.title}</h3>

                    {/* Framer Motion controls the height of this wrapper. 
            The text inside is untouched, completely preventing the "warping" bug.
          */}
                    <motion.div
                        initial={false}
                        animate={{
                            height: isExpanded ? "auto" : (isOverflowing ? clampedHeight : "auto")
                        }}
                        transition={{ duration: 0.7, ease: customEase }}
                        className={`${styles.storyParagraphWrapper} ${isOverflowing && !isExpanded ? styles.showMask : ''}`}
                    >
                        <p ref={contentRef} className={styles.storyParagraph}>
                            {story.description}
                        </p>
                    </motion.div>

                    {/* Button only renders if the text is physically taller than the clamp height */}
                    {isOverflowing && (
                        <motion.button
                            className={styles.readMoreBtn}
                            onClick={handleToggle}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isExpanded ? 'Read Less' : 'Read More'}
                        </motion.button>
                    )}
                </motion.div>

                <div className={styles.imageContentWrapper}>
                    <motion.div
                        className={styles.imageStickyContainer}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: customEase, delay: 0.2 }}
                    >
                        <img
                            src={story.image}
                            alt={story.title}
                            className={styles.storyImage}
                        />
                    </motion.div>
                </div>

            </div>
        </section>
    );
}