import styles from './styles.module.css';

import Link from "next/link";
import Image from "next/image";


function StickyBtns() {
    return ( 
        <div className={styles.stickyBtns}>
            <Link href="/contact" className={styles.stickyBtn}>
                <p>Enquire Now</p>
                <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
            </Link>

            <Link href="https://wa.me/918097407700" target={"_blank"} className={styles.stickyBtn} >
                <p>WhatsApp Us</p>
                <Image src="/images/whatsapp.png" alt="Arrow" width={28} height={28} />
            </Link>

            
        </div>
    );
}

export default StickyBtns;