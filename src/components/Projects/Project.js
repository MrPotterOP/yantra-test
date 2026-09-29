'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './project.module.css';

export default function Project({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className={styles.projectCard}>
                <div className={`${styles.projectCardImageSkeleton} ${styles.projectCardShimmer}`}></div>
                <div className={styles.projectCardContent}>
                    <div className={`${styles.projectCardTitleSkeleton} ${styles.projectCardShimmer}`}></div>
                    <div className={`${styles.projectCardTextSkeleton} ${styles.projectCardShimmer}`}></div>
                    <div className={`${styles.projectCardTextSkeleton} ${styles.projectCardShimmer}`} style={{ width: '60%' }}></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <Link href={`/projects/${data.slug}`} className={styles.projectCardLink}>
            <motion.div className={styles.projectCard}>
                <div className={styles.projectCardImageWrapper}>
                    {data.coverImg ? (
                        <Image
                            src={data.coverImg}
                            alt={data.title}
                            fill
                            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 33vw"
                            className={styles.projectCardImage}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.projectCardImageFallback}>
                            <span>Image Unavailable</span>
                        </div>
                    )}

                    {data.tag && (
                        <div className={styles.projectCardTag}>
                            {data.tag}
                        </div>
                    )}
                </div>

                <div className={styles.projectCardContent}>
                    <h3 className={styles.projectCardTitle}>{data.title}</h3>
                    <p className={styles.projectCardIntro}>{data.intro}</p>

                    {data.location && (
                        <div className={styles.projectCardLocation}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>{data.location}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}