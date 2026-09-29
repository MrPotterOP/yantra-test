'use client';

import styles from './styles.module.css';
import { motion } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

function Hero() {
  return (
    <section id={styles.hero} className={'hero'}>
      <div className={styles.heroBox}>
        <motion.div
          className={styles.heroVideoWrapper}
          initial={{ opacity: 0.6, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: customEase }}
        >
          <video
            src="https://res.cloudinary.com/dx7zhktvq/video/upload/v1783574056/yantra/hero_uh8fjf.mp4"
            autoPlay
            loop
            muted
            playsInline
            className={styles.bgVideo}
          />
        </motion.div>

        <div className={styles.heroContent}>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: customEase, delay: 0.1 }}
          >
            enabling <br /> innovative living environment
          </motion.h1>
        </div>

        <motion.div
          className={styles.heroDescriptionBox}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: customEase, delay: 0.2 }}
        >
          <p>
            You have a home to make and we have a product for you. We provide
            tailor-made home solutions for Doors, Windows, Balustrades,
            Retractable & Fixed Glass Roofs, and Pergolas.
          </p>
        </motion.div>

      </div>
    </section>
  );
}

export default Hero;