'use client'

import { useEffect, useState } from "react";
import styles from './styles.module.css';
import Image from "next/image";

function ThankYou() {


    const [timer, setTimer] = useState(6);

    // useEffect(() => {
    //     if(!name){
    //         window.location.href = "/";
    //     }
    //   }, [name]);

    // useEffect(()=>{
    //     // const name = sessionStorage.getItem('name');

    //     if(!name){
    //         router.push('/');
    //     }
    // })

    




    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setTimer((prevTimer) => prevTimer - 1);
    //         if (timer === 1) {
    //             // sessionStorage.removeItem('name');
    //             window.location.href = "/";
    //         }
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, [timer]);


    return ( 
        <main id={styles.thanks}>
            <div className={styles.thanksBox}>

                <div className={styles.thanksBg}>
                    <Image src="/images/thanks.gif" alt="Thanks" width={140} height={140}></Image>
                </div>
                <div className={styles.thanksText}>
                    <h1>Thank You !</h1>
                    <p>Your enquiry has been received and we will get back to you soon. <br /> <span>you will be redirected to the home page in {timer} seconds</span></p>
                </div>
            </div>


            
        </main>
     );
}

export default ThankYou;