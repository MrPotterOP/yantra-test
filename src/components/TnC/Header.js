'use client';

import styles from './styles.module.css';

import Navbar from '../Navbar/Navbar';
import Image from 'next/image';

import {motion} from 'framer-motion';


function Header() {
    return ( 
        <header>
            <Navbar />

            <motion.div className={styles.headerBox}
                initial={{ opacity: 0, y: 10, scale: 1.1 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: .8, ease: 'easeInOut' }}
            >
                <div className={styles.headerBg}>
                    <Image src="/images/tnc.jpg" alt="T&C" width={1800} height={600}></Image>

                    <div className={styles.bgGrad}></div>
                </div>

                <motion.div className={styles.headerText} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4, duration: .4, ease: 'easeInOut' }}><h1>TERMS OF SALES</h1>
                </motion.div>
            </motion.div>

            
        </header>
    );
}

export default Header;