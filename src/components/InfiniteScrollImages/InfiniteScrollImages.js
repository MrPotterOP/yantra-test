'use client';

import Image from "next/image";
import styles from './styles.module.css';

import { motion } from "framer-motion";


function InfiniteScrollImages() {

    const images = [
        "/images/company1.png",
        "/images/company2.png",
        "/images/company3.png",
        "/images/company5.png",
        "/images/company6.png",
        "/images/company7.png",
    ];


    return ( 
        <section id={styles.infiniteScrollImages}>

            <motion.div className={styles.scroll}
                initial={{ opacity: 0.6, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            >

                <div>

                    {images.map((image, index) => (
                        <Image
                            key={index}
                            src={image}
                            alt="Company Image"
                            width={200}
                            height={68}
                        />
                    ))}

                </div>


                <div>

                    {images.map((image, index) => (
                        <Image
                            key={index}
                            src={image}
                            alt="Company Image"
                            width={200}
                            height={68}
                        />
                    ))}

                </div>


                
            </motion.div>

        </section>
     );
}

export default InfiniteScrollImages;