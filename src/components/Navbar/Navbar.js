'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';
import Image from 'next/image';
import Link from 'next/link';

function Navbar({ theme = 'light' }) {
    const [active, setActive] = useState(false);

    const navItemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1 + 0.3,
                type: 'spring',
                stiffness: 50
            }
        })
    };

    const logoAndBtnVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.2,
                type: 'spring',
                stiffness: 50
            }
        }
    };

    const handleScroll = (href) => {
        setActive(false);
        const element = document.body.getElementsByTagName('main')[0].getElementsByClassName(href.replace('#', ''));
        if (element) {
            element[0].scrollIntoView({ behavior: 'smooth' });
        }
    }

    return (
        <motion.nav
            id={styles.navbar}
            // Add the dynamic class here
            className={theme === 'dark' ? styles.darkTheme : ''}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0 }
            }}
        >
            <div className={styles.navBox}>
                <motion.a
                    href="/#hero"
                    className={styles.navLogo}
                    initial="hidden"
                    animate="visible"
                    variants={logoAndBtnVariants}
                >
                    {/* Optional: If your logo is white text, you might want to switch the src conditionally: */}
                    {/* src={theme === 'dark' ? "/images/logo-dark.png" : "/images/logo.png"} */}
                    <Image src="/images/logo.png" alt="Yantra Doors and Windows Logo" width={161} height={44} />
                </motion.a>

                <ul id="nav-mobile" className={`${styles.navMenu} ${active ? styles.active : ""}`}>
                    {['#hero', '#about', '#services', '#projects', '/contact', '#', '#faqs'].map((href, index) => (
                        <motion.li
                            key={index}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={navItemVariants}
                        >
                            <Link href={href} passHref legacyBehavior>
                                <a onClick={() => handleScroll(href)} data-hover={["HOME", "ABOUT US", "PRODUCTS", "WORK", "CONTACT", "BLOG", "FAQ"][index]}>
                                    <span>{["HOME", "ABOUT US", "PRODUCTS", "WORK", "CONTACT", "BLOG", "FAQ"][index]}</span>
                                </a>
                            </Link>
                        </motion.li>
                    ))}
                </ul>

                <motion.button
                    className={styles.btnCta}
                    initial="hidden"
                    animate="visible"
                    variants={logoAndBtnVariants}
                >
                    <a href="https://calendly.com/yantrawindows/visit-to-the-yantra-experience-centre-andheri-west" target={"_blank"}>Visit Us</a>
                    <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
                </motion.button>

                <button className={styles.hamburger} onClick={() => setActive(!active)}>
                    <Image src={active ? "/images/close.png" : "/images/menu.png"} alt="Hamburger Menu" width={24} height={24} />
                </button>
            </div>
        </motion.nav>
    );
}

export default Navbar;