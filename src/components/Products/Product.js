'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './product.module.css';

export default function Product({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className={styles.productCard}>
                <div className={`${styles.productImageSkeleton} ${styles.shimmer}`}></div>
                <div className={styles.productContent}>
                    <div className={`${styles.titleSkeleton} ${styles.shimmer}`}></div>
                    <div className={`${styles.textSkeleton} ${styles.shimmer}`}></div>
                    <div className={`${styles.textSkeleton} ${styles.shimmer}`} style={{ width: '60%' }}></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <Link href={`/products/${data.slug}`} className={styles.productCardLink}>
            {/* Removed the whileHover y-axis jump for a more grounded feel */}
            <motion.div className={styles.productCard}>
                <div className={styles.productImageWrapper}>
                    {data.coverImg ? (
                        <Image
                            src={data.coverImg}
                            alt={data.title}
                            fill
                            sizes="(max-width: 768px) 85vw, (max-width: 1200px) 45vw, 33vw"
                            className={styles.productImage}
                            loading="lazy"
                        />
                    ) : (
                        <div className={styles.productImageFallback}>
                            <span>Image Unavailable</span>
                        </div>
                    )}
                </div>

                <div className={styles.productContent}>
                    <h3 className={styles.productTitle}>{data.title}</h3>
                    <p className={styles.productIntro}>{data.intro}</p>
                </div>
            </motion.div>
        </Link>
    );
}