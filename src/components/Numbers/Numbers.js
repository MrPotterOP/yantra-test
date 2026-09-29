'use client';
import styles from './styles.module.css';
import { motion } from 'framer-motion';

export default function Numbers() {


    const SlidingDigit = ({ char, index }) => {

        const isNumber = !isNaN(char) && char !== ' ';

        if (!isNumber) {
            return <span style={{ display: 'inline-block' }}>{char}</span>;
        }

        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

        return (
            <span
                style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    height: '1em',
                    lineHeight: '1em'
                }}
            >
                <motion.span
                    initial={{ y: '0%' }}

                    whileInView={{ y: `-${char * 10}%` }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        delay: index * 0.1
                    }}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    {digits.map((digit) => (
                        <span key={digit} style={{ height: '1em' }}>
                            {digit}
                        </span>
                    ))}
                </motion.span>
            </span>
        );
    };


    const NumberBlock = ({ number, title }) => {

        const chars = number.split('');

        return (
            <div className={styles.num}>
                <h3 style={{ display: 'flex', justifyContent: 'center', margin: 0 }}>
                    {chars.map((char, idx) => (
                        <SlidingDigit key={idx} char={char} index={idx} />
                    ))}
                </h3>
                <p>{title}</p>
            </div>
        );
    };

    const data = [
        {
            number: '15+',
            title: 'Years of Excellence'
        },
        {
            number: '500+',
            title: 'Projects Delivered'
        },
        {
            number: '14+',
            title: 'Cities Covered'
        },
        {
            number: '100+',
            title: 'In-House Installation'
        }
    ];

    return (
        <div className={styles.numbers}>
            {data.map((item, idx) => (
                <NumberBlock key={idx} number={item.number} title={item.title} />
            ))}
        </div>
    );
}