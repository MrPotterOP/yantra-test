'use client'

import styles from './styles.module.css';
import Image from 'next/image';
import Link from 'next/link';

import { useState } from 'react';



function FAQs() {

    const [activeIndex, setActiveIndex] = useState(0);

    //handlers

    const handleIndex = (index) => {
        if (activeIndex === index) {
            setActiveIndex(0);
        } else {
            setActiveIndex(index);
        }
    }

    return ( 
        <section id={`${styles.faqs}`} className={'faqs'}>

            <div className={`${styles.faqsTitle}`}>
                <p className={styles.titleText}>FAQS</p>

                <h1 className={styles.title}>Response to FAQs</h1>
            </div>

            <div className={styles.faqsBox}>

                <div className={`${styles.faq} ${activeIndex === 1 ? styles.active : ''}`} onClick={() => handleIndex(1)}>
                    <div className={styles.faqQuestion}>
                        <p>HOW DO I GET YANTRA TO QUOTE FOR WINDOWS FOR MY UPCOMING PROJECT ? </p>

                        <Image src="/images/down.png" alt="Down Arrow" width={28} height={28}></Image>
                    </div>

                    <div className={styles.faqAnswer}>
                        <p>YOU CAN GET IN TOUCH WITH OUR TEAM ON <span>SALES@YANTRAINDIA.COM</span>  OR CALL US ON <span>+91 80974 07700</span> . IT WOULD BE A GREAT HELP TO US IF YOU CAN ALSO SHARE THE DRAWINGS/ WINDOW SCHEDULE WITH US TO HELP YOU BETTER.</p>

                        <div className={styles.faqAnswerImage}>
                            <Image src="/images/service2.jpg" alt="Project Work" width={400} height={300} />
                            <Link href="/contact">
                                <p>Book a Call</p>
                                <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={`${styles.faq} ${activeIndex === 2 ? styles.active : ''}`} onClick={() => handleIndex(2)}>
                    <div className={styles.faqQuestion}>
                        <p>DOES YANTRA ONLY SUPPLY MANUFACTURED WINDOWS OR DO THEY ALSO INSTALL ?</p>

                        <Image src="/images/down.png" alt="Down Arrow" width={28} height={28}></Image>
                    </div>

                    <div className={styles.faqAnswer}>
                        <p>WE ONLY DO A TURNKEY PROJECT IN WHICH OUR TRAINED TEAM WOULD TAKE FINAL MEASURMENTS FROM SITE AND SUPPLY AND INSTALL THE FINISHED PRODUCT ALONG WITH WARRANTY POST INSTALLATION. </p>
                    </div>
                </div>

                <div className={`${styles.faq} ${activeIndex === 3 ? styles.active : ''}`} onClick={() => handleIndex(3)}>
                    <div className={styles.faqQuestion}>
                        <p>WHAT MATERIAL ARE YANTRA WINDOWS MADE OF ?</p>

                        <Image src="/images/down.png" alt="Down Arrow" width={28} height={28}></Image>
                    </div>

                    <div className={styles.faqAnswer}>
                        <p>MOST OF OUR PROFILES ARE MADE OUT OF ALUMINIUM. WE ALSO USE SEASON TREATED WOOD / STAINLESS STEEL OR BRASS IN FEW OF OUR WINDOW SYSTEMS WHICH ARE IMPORTED FROM ITALY.</p>
                    </div>
                </div>

                <div className={`${styles.faq} ${activeIndex === 4 ? styles.active : ''}`} onClick={() => handleIndex(4)}>
                    <div className={styles.faqQuestion}>
                        <p>WHAT AFTER SALES SERVICE DOES YANTRA OFFER ?</p>

                        <Image src="/images/down.png" alt="Down Arrow" width={28} height={28}></Image>
                    </div>

                    <div className={styles.faqAnswer}>
                        <p>WE OFFER 1 YEAR OF FREE SERVICE POST INSTALLATION OF WINDOWS. POST WHICH THE WINDOWS ARE COVERED FOR LIFE LONG WARRANTY AGAINST MANUFACTURING DEFECTS. FOR REPAIRS AND SERVICING OF WINDOWS WE ALSO OFFER LIFE TIME SUPPORT ON MOST PORDUCTS.</p>
                    </div>
                </div>


            </div>
            
        </section>
     );
}

export default FAQs;