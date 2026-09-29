import styles from './styles.module.css';

import Navbar from '../Navbar/Navbar';

import Image from 'next/image';

function Header({
    bg,
    title,
    description
}) {
    return (
        <header className={styles.header}>
            <Navbar />

            <div className={styles.headerBox}>
                <div className={styles.headerBg}>
                    <Image src={bg || "/images/contact.png"} alt="Contact" width={1800} height={600}></Image>

                    <div className={styles.bgGrad}></div>
                </div>

                <div className={styles.headerText}>
                    <h1>{title || "Yantra Windows"}</h1>
                    <p>{description || "Discover Yantra's custom home solutions, including doors, windows, balustrades, retractable & fixed glass roofs, and pergolas. We offer lifetime warranties, annual maintenance contracts, and a Pan India presence."}</p>
                </div>
            </div>
        </header>
    );
}

export default Header;