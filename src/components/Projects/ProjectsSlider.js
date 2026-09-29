import styles from './styles.module.css';
import Image from 'next/image';

function ProjectSlider() {
    return (
        <section className={styles.projectSlider}>

            <h1 className={styles.sectionTitle}>OUR PROJECTS GALLERY</h1>

            <div className={styles.sliderBox}>
                <div className={styles.slider}>
                    <Image src="/images/proSlide1.jpeg" alt="Project 1" width={600} height={500} />
                    <Image src="/images/proSlide2.jpeg" alt="Project 2" width={600} height={500} />
                    <Image src="/images/proSlide3.jpeg" alt="Project 3" width={600} height={500} />
                    <Image src="/images/proSlide4.jpeg" alt="Project 4" width={600} height={500} />
                    <Image src="/images/proSlide5.jpeg" alt="Project 5" width={600} height={500} />
                    <Image src="/images/proSlide6.jpeg" alt="Project 6" width={600} height={500} />
                    <Image src="/images/proSlide7.jpg" alt="Project 7" width={600} height={500} />
                </div>

                <div className={styles.slider}>
                    <Image src="/images/proSlide1.jpeg" alt="Project 1" width={600} height={500} />
                    <Image src="/images/proSlide2.jpeg" alt="Project 2" width={600} height={500} />
                    <Image src="/images/proSlide3.jpeg" alt="Project 3" width={600} height={500} />
                    <Image src="/images/proSlide4.jpeg" alt="Project 4" width={600} height={500} />
                    <Image src="/images/proSlide5.jpeg" alt="Project 5" width={600} height={500} />
                    <Image src="/images/proSlide6.jpeg" alt="Project 6" width={600} height={500} />
                    <Image src="/images/proSlide7.jpg" alt="Project 7" width={600} height={500} />
                </div>
            </div>
        </section>
    );
}

export default ProjectSlider;