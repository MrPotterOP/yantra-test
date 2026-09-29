import Link from "next/link";
import styles from './styles.module.css';
import Image from "next/image";

function Footer() {

    const CareerMail = {
        subject: "Application for [Job Title] - [Your Name]",
        body: `(Kindly ensure your resume or CV is attached when submitting your application. You can add your introduction or relevant details below)`,
        email: "careers@yantraindia.com"
    }

    return (
        <footer id={styles.footer}>
            <div className={styles.footerMain}>
                <div className={styles.footerLinks}>
                    <p className={styles.linkTitle}>COMPANY</p>

                    <div className={styles.links}>
                        <Link href={"#"} data-hover="Services"><span>Services</span></Link>
                        <Link href={"#"} data-hover="Projects"><span>Projects</span></Link>
                        <Link href={"#"} data-hover="Works"><span>Works</span></Link>
                    </div>
                </div>

                <div className={styles.footerLinks}>
                    <p className={styles.linkTitle}>ABOUT</p>

                    <div className={styles.links}>
                        <Link href={"/contact"} data-hover="Contact"><span>Contact</span></Link>
                        <Link href={"#"} data-hover="Mission"><span>Mission</span></Link>
                        <Link href={`mailto:${CareerMail.email}?subject=${CareerMail.subject}&body=${CareerMail.body}`} data-hover="Careers"><span>Careers</span></Link>
                    </div>
                </div>

                <div className={styles.footerLinks}>
                    <p className={styles.linkTitle}>RESOURCES</p>

                    <div className={styles.links}>
                        <Link href={`mailto:${CareerMail.email}?subject=${CareerMail.subject}&body=${CareerMail.body}`} data-hover="Work With Us"><span>Work With Us</span></Link>
                    </div>
                </div>

                <div className={styles.footerForm}>
                    <p className={styles.linkTitle}>SAY HELLO TO US</p>

                    <div className={styles.inputBox}>
                        <input type="email" placeholder="name@example.com"></input>

                        <button className={styles.cta}>
                            <p>Say Hello</p>
                            <Image src="/images/arrow.png" alt="Arrow" width={28} height={28} />
                        </button>
                    </div>

                    <div className={styles.address}>
                        <p>1203, Aston Building, SunderVan Complex Road,
                            Shastri Nagar, Above Mercedes Showroom,
                            Andheri West, Mumbai - 400053</p>

                        <div className={styles.socials}>
                            <Link href={"https://www.instagram.com/yantrawindows/?hl=en"} target="_blank" rel="noreferrer" data-hover="Instagram"><Image src="/images/insta.png" alt="Instagram" width={28} height={28} /></Link>
                            <Link href={"https://www.facebook.com/YantraMumbai/"} target="_blank" rel="noreferrer" data-hover="Facebook"><Image src="/images/fb.png" alt="Facebook" width={28} height={28} /></Link>
                            <Link href={"https://www.linkedin.com/company/yantra-aluminium-window-systems-private-limited/mycompany/"} target="_blank" rel="noreferrer" data-hover="LinkedIn"><Image src="/images/linkedin.png" alt="LinkedIn" width={28} height={28} /></Link>
                            <Link href={"https://www.youtube.com/channel/UC0l8ePP0WfD791MVF4dzwBA"} target="_blank" rel="noreferrer" data-hover="Youtube"><Image src="/images/yt.png" alt="Youtube" width={24} height={24} /></Link>
                        </div>

                    </div>
                </div>
            </div>

            <div className={styles.line}></div>

            <p className={styles.copyright}>Copyright © 2024 | All Rights Reserved</p>
        </footer>
    );
}

export default Footer;
