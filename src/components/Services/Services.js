'use client'

import styles from './styles.module.css';
import Image from 'next/image';
import { useState } from 'react';


function Services() {

    const [activeIndex, setActiveIndex] = useState(0);

    //handlers 

    const handleClick = (index) => {
        if (activeIndex === index) {
            setActiveIndex(0);
        } else {
            setActiveIndex(index);
        }
    }

    return ( 
        <section id={styles.services}>
            <div className={styles.servicesTitle}>
                <p>OUR SERVICES</p>

                <h1>OUR WIDE RANGE OF SERVICES INCLUDES</h1>
            </div>

            <div className={styles.servicesBox}>

                <div className={`${styles.service} ${activeIndex === 1 ? styles.active : ''}`} onClick={() => handleClick(1)}>
                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Doors and windows</h2>

                                <p>Our aluminium doors and windows combine sleek design with exceptional durability. Featuring sliding, casement, pivot, and more, they provide modern aesthetics, energy efficiency, and customizable solutions to enhance any living or working space.</p>
                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service1.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>

                <div className={`${styles.service} ${activeIndex === 2 ? styles.active : ''}`} onClick={() => handleClick(2)} >


                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Vertical Sliding Windows and Doors</h2>

                                <p>Our vertical sliding windows and doors, available in both automated and manual versions, offer a perfect blend of functionality and style. They provide smooth operation, space efficiency, and a modern look suitable for various architectural styles.</p>

                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service2.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>

                <div className={`${styles.service} ${activeIndex === 3 ? styles.active : ''}`} onClick={() => handleClick(3)}>
                        
                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Balustrades (Railings)</h2>

                                <p>Enhance safety and style with our range of balustrades, available in seamless or framed designs. These railings offer robust construction, aesthetic appeal, and the perfect balance of security and elegance for stairs, balconies, and terraces.</p>

                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service3.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>


                <div className={`${styles.service} ${activeIndex === 4 ? styles.active : ''}`} onClick={() => handleClick(4)}>
                        
                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Retractable Sunroofs</h2>

                                <p>Transform your outdoor areas with our retractable sunroofs and structures by Libart. Options include freestanding, lean-to, sunroof, and SolarGlide, providing flexible, stylish solutions for enhanced outdoor living and protection from the elements.</p>

                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service2.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>


                <div className={`${styles.service} ${activeIndex === 5 ? styles.active : ''}`} onClick={() => handleClick(5)}>
                        
                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Fixed Glass Roofs & Glass Houses</h2>

                                <p>Our fixed glass roofs and climate-controlled glass houses offer unparalleled natural light and panoramic views. Available with built-in blinds, these structures provide superior comfort, energy efficiency, and a luxurious, light-filled environment.</p>

                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service2.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>

                <div className={`${styles.service} ${activeIndex === 6 ? styles.active : ''}`} onClick={() => handleClick(6)}>
                        
                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Retractable & Fixed Pergolas</h2>

                                <p>Discover our range of pergolas, including bioclimatic with adjustable louvres, fixed by Aluminco, and retractable fabric screen roofs. Each pergola offers durable construction and elegant design, ensuring year-round outdoor comfort and style.</p>

                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service2.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>

                <div className={`${styles.service} ${activeIndex === 7 ? styles.active : ''}`} onClick={() => handleClick(7)}>
                        
                        <div className={styles.serviceBar}>
                            <Image 
                                src="/images/arrow.png"
                                alt="Arrow"
                                width={100}
                                height={100}
                            ></Image>

                            <div className={styles.serviceContext}>
                                <h2>Zipline & Collapsible Insect Screens</h2>

                                <p>Protect your living spaces with our Zipline and collapsible insect screens. Featuring Renson, Freedom, and Meshworkz options, these screens offer effective protection from insects while maintaining unobstructed views and easy operation with sleek, retractable designs.</p>

                            </div>
                        </div>

                        <div className={styles.serviceImage}>
                            <Image src="/images/service2.jpg" alt="Service Image" width={500} height={500}></Image>
                        </div>
                </div>


            </div>

        </section>
     );
}

export default Services;