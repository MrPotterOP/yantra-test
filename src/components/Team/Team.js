'use client';
import styles from './styles.module.css';

import Image from 'next/image';

import { motion } from 'framer-motion';
import Link from 'next/link';

function Team() {

    const hidden = {
        opacity: 0,
        y: 50
    }

    const visible = {
        opacity: 1,
        y: 0
    }

    const transition = {
        duration: 1,
        ease: 'easeInOut'
    }

    return ( 
        <section id={styles.team}>
            <motion.div 
                initial={hidden}
                whileInView={visible}
                viewport={{ once: true }}
                transition={transition}
                className={styles.teamTitle}>
                <p>LEADERSHIP</p>

                <h1>Meet the board of directors</h1>
            </motion.div>

            <div className={styles.teamBox}>
                <div className={styles.member}>
                    <div className={styles.memberImage}>
                        <Image src="/images/member1.png" alt="Member Image" width={500} height={900} />
                    </div>

                    <div className={styles.memberInfo}>
                        <motion.h4
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true }}
                            transition={transition}
                        >SMITA LIMAYE</motion.h4>

                        <motion.p
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true }}
                            transition={transition}
                        >DIRECTOR - OPERATIONS & CUSTOMER FULFILMENT</motion.p>

                        <div className={styles.memberSocial}>
                            <Link href="https://www.linkedin.com/in/smita-limaaye-83579827/" target="_blank" rel="noopener noreferrer">
                                <div className={styles.memberSocialIcon}>
                                    <Image src="/images/linkedin.png" alt="Linkedin" width={20} height={20} />
                                </div>

                            </Link>

                            {/* <div className={styles.memberSocialIcon}>
                                <Image src="/images/email.png" alt="Email" width={20} height={20} />
                            </div> */}
                        </div>
                    </div>
                </div>

                <div className={styles.member}>
                    <div className={styles.memberImage}>
                        <Image src="/images/member2.png" alt="Member Image" width={500} height={900} />
                    </div>

                    <div className={styles.memberInfo}>
                        <motion.h4
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true }}
                            transition={transition}
                        >RAVI PANJWANI</motion.h4>

                        <motion.p
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true }}
                            transition={transition}
                        >FOUNDER</motion.p>

                        <div className={styles.memberSocial}>

                            <Link href="https://www.linkedin.com/in/ravi-panjwani-57388022/" target="_blank" rel="noopener noreferrer" >

                                <div className={styles.memberSocialIcon}>
                                    <Image src="/images/linkedin.png" alt="Linkedin" width={20} height={20} />
                                </div>

                            </Link>

                            <Link href="mailto:ravi.panjwani@yantraindia.com" target="_blank" rel="noopener noreferrer" >
                                <div className={styles.memberSocialIcon}>
                                    <Image src="/images/email.png" alt="Email" width={20} height={20} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={styles.member}>
                    <div className={styles.memberImage}>
                        <Image src="/images/member3.png" alt="Member Image" width={500} height={900} />
                    </div>

                    <div className={styles.memberInfo}>
                        <motion.h4
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true }}
                            transition={transition}
                        >NIKHIL DASWANI</motion.h4>

                        <motion.p
                            initial={hidden}
                            whileInView={visible}
                            viewport={{ once: true }}
                            transition={transition}
                        >DIRECTOR - MARKETING & BUSINESS DEVELOPMENT</motion.p>

                        <div className={styles.memberSocial}>
                            <Link href="https://www.linkedin.com/in/nikhil-daswani-12487a76/" target="_blank" rel="noopener noreferrer" >
                                <div className={styles.memberSocialIcon}>
                                    <Image src="/images/linkedin.png" alt="Linkedin" width={20} height={20} />
                                </div>
                            </Link>
                            

                            {/* <div className={styles.memberSocialIcon}>
                                <Image src="/images/email.png" alt="Email" width={20} height={20} />
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Team;
