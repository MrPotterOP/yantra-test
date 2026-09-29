
import styles from './styles.module.css';

import Image from 'next/image';
import Link from 'next/link';


function CTAbanner({
    title = "Experience the Best in Window Innovation",
    imgSrc = "/images/bannerBg.jpg",
    cta = "Book a Visit With Us",
    link = "https://calendly.com/yantrawindows/visit-to-the-yantra-experience-centre-andheri-west"
}) {



    return (



        <section id={`${styles.banner}`} className={'footer'}>
            <div className={styles.bannerBox}>
                <Image className={styles.bannerBg} src={imgSrc} width={1100} height={900} alt="building architecture"></Image>

                <div className={styles.bgGrad}></div>

                <div className={styles.bannerContext}>

                    <div className={styles.contextBox}>
                        <h1>{title}</h1>

                        <Link href={link} target={"_blank"} >
                            <p>{cta}</p>
                            <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
                        </Link>


                    </div>

                </div>
            </div>
        </section>
    );
}

export default CTAbanner;