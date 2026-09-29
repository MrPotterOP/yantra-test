'use client';
import styles from './styles.module.css';
import Image from 'next/image';
import { motion } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];

const SlidingDigit = ({ char, index }) => {
    const isNumber = !isNaN(char) && char !== ' ';

    if (!isNumber) {
        // Now using a class to enforce perfect vertical alignment
        return <span className={styles.staticChar}>{char}</span>;
    }

    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', overflow: 'hidden', height: '1em', lineHeight: '1em' }}>
            <motion.span
                initial={{ y: '0%' }}
                whileInView={{ y: `-${char * 10}%` }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 1.2, ease: customEase, delay: index * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column' }}
            >
                {digits.map((digit) => (
                    <span key={digit} style={{ height: '1em' }}>{digit}</span>
                ))}
            </motion.span>
        </span>
    );
};

const NumberBlock = ({ number, title }) => {
    const chars = number.split('');

    return (
        <motion.div
            className={styles.numBlock}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: customEase }}
        >
            <h3 className={styles.numberValue}>
                {chars.map((char, idx) => (
                    <SlidingDigit key={idx} char={char} index={idx} />
                ))}
            </h3>
            <p className={styles.numberTitle}>{title}</p>
        </motion.div>
    );
};

function About() {
    return (
        <section id={styles.about} className={'about'}>
            <div className={styles.aboutTitle}>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: customEase }}
                    className={styles.titleText}>ABOUT</motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: customEase, delay: 0.1 }}
                >We are focused on bringing the best of the world to India.</motion.h1>
            </div>

            <div className={styles.numbersContainer}>
                <NumberBlock number="15+" title="Years of Excellence" />
                <NumberBlock number="4.2/5★" title="Google Reviews" />
                <NumberBlock number="500+" title="Projects Delivered" />
            </div>

            <motion.div className={styles.aboutBox}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: customEase }}
            >
                <Image src="/images/about.jpg" alt="About Image" width={1000} height={1500}></Image>
                <Image src="/images/about2.jpeg" alt="About Image" width={1000} height={1500}></Image>

                <div className={styles.aboutTextBox}>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: customEase }}
                    >With an understanding of the latest international trends, chic design and customisable home solutions,
                        We bring to you performance-based products, backed by superb engineering. Products that strive towards making your living environment as comfortable as possible.</motion.p>
                </div>

                <div className={styles.aboutTextBox}>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: customEase }}
                    >We are focused on bringing the best of the world to India. The products we provide are designed with precision, keeping in mind your every need.
                        We are dedicated & determined to provide the right fenestration solutions to you, anywhere, every time.</motion.p>
                </div>

            </motion.div>
        </section>
    );
}

export default About;