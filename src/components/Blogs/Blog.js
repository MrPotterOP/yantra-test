'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './blog.module.css';

export default function Blog({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className={styles.blogCard}>
                <div className={`${styles.blogCardImageSkeleton} ${styles.blogCardShimmer}`}></div>
                <div className={styles.blogCardContent}>
                    <div className={`${styles.blogCardTitleSkeleton} ${styles.blogCardShimmer}`}></div>
                    <div className={`${styles.blogCardTextSkeleton} ${styles.blogCardShimmer}`}></div>
                    <div className={`${styles.blogCardTextSkeleton} ${styles.blogCardShimmer}`} style={{ width: '60%' }}></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <Link href={`/blog/${data.slug}`} className={styles.blogCardLink}>
            <motion.div className={styles.blogCard}>
                <div className={styles.blogCardImageWrapper}>
                    {data.coverImg ? (
                        <Image
                            src={data.coverImg}
                            alt={data.title}
                            fill
                            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 33vw"
                            className={styles.blogCardImage}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.blogCardImageFallback}>
                            <span>Image Unavailable</span>
                        </div>
                    )}
                </div>

                <div className={styles.blogCardContent}>
                    <h3 className={styles.blogCardTitle}>{data.title}</h3>
                    <p className={styles.blogCardIntro}>{data.intro}</p>

                    {data.date && (
                        <div className={styles.blogCardDate}>
                            <span>{data.date}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    );
}