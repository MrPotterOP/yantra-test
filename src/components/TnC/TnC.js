'use client';

import styles from './styles.module.css';
import { motion, useInView } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

function Tnc() {
    const [active, setActive] = useState(0);

    const terms = [
        "MATERIAL", "SCOPE OF WORK", "FINISH", 
        "GLASS SPECIFICATIONS", "WINDOW SPECIFICATIONS", 
        "ORDER CONFIRMATION", "PRICING", "DELIVERY", 
        "WARRANTY", "PAYMENT", "INSTALLATION", "COMPLETION CERTIFICATE"
    ];

    // Create refs for each section manually
    const ref0 = useRef(null);
    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);
    const ref7 = useRef(null);
    const ref8 = useRef(null);
    const ref9 = useRef(null);
    const ref10 = useRef(null);
    const ref11 = useRef(null);

    const refs = [ref0, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, ref10, ref11];

    // Create inView states for each section
    const inView0 = useInView(ref0, { triggerOnce: false });
    const inView1 = useInView(ref1, { triggerOnce: false });
    const inView2 = useInView(ref2, { triggerOnce: false });
    const inView3 = useInView(ref3, { triggerOnce: false });
    const inView4 = useInView(ref4, { triggerOnce: false });
    const inView5 = useInView(ref5, { triggerOnce: false });
    const inView6 = useInView(ref6, { triggerOnce: false });
    const inView7 = useInView(ref7, { triggerOnce: false });
    const inView8 = useInView(ref8, { triggerOnce: false });
    const inView9 = useInView(ref9, { triggerOnce: false });
    const inView10 = useInView(ref10, { triggerOnce: false });
    const inView11 = useInView(ref11, { triggerOnce: false });

    const inViewStates = [
        inView0, inView1, inView2, inView3, inView4, 
        inView5, inView6, inView7, inView8, inView9, 
        inView10, inView11
    ];

    useEffect(() => {
        // Find the index of the first section that is in view
        const activeIndex = inViewStates.findIndex(inView => inView);
        if (activeIndex !== -1) {
            setActive(activeIndex);
        }
    }, [inViewStates]);

    const hidden = {
        opacity: 0,
        y: 50
    };

    const show = {
        opacity: 1,
        y: 0
    };

    const transition = {
        duration: 1,
        ease: 'easeInOut'
    };

    return (
        <section id={styles.tnc}>
            <div className={styles.tncNav}>
                {terms.map((term, i) => (
                    <motion.p 
                    initial={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.1 + 0.3, type: 'spring', stiffness: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={term} 
                    className={`${styles.tncNavText} ${active === i-1 ? styles.active : ''}`} 
                    onClick={() => (i > 0) ? refs[i-1].current.scrollIntoView({ behavior: 'smooth' }) : refs[i].current.scrollIntoView({ behavior: 'smooth' })}>
                        {term}
                    </motion.p>
                ))}
            </div>

            <div className={styles.tncContent}>
                <motion.div
                 initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref0}>
                    <p><span>Material </span>content included in this quotation is based on the details received,
                    as listed below. Quantities, dimensions, and product descriptions are detailed hereinafter.</p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref1}>
                    <p><span>Scope of Work </span>Designing, Providing, Fabricating, and fixing of Windows.</p>
                </motion.div>

                <motion.div 
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                className={styles.tncText} 
                ref={ref2}>
                    <p><span>Finish </span>As approved by Architect / Interior Designer from Powder Coating / Anodizing or Wooden Coating (If mentioned in Offer)</p>
                </motion.div>

                <motion.div 
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                className={styles.tncText} 
                ref={ref3}>
                    <p><span>Glass Specifications </span>Glasses to be provided are stated in the window offer.</p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref4}>
                    <p><span>Window Specifications </span>The Windows are manufactured according to the specification as approved by the customer. <br /> <br />  Screen or Louvers, Exhaust Fans not included in the offer. (Unless Specified) <br /> <br /> We are not responsible for any consequences caused due to any deviation from the Normal/Standard Design and/or Installation Method done on request from the Client/Architect which we may not be in a position to foresee while agreeing to such deviations, also such deviation would void the warranty offered by <strong>Yantra Aluminium Window Systems Pvt Ltd</strong></p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref5}>
                    <p><span>Order Confirmation </span>Order will be considered as confirmed only on receipt of the following <br /> <br /> 

                    The Offer Duly Stamped and Signed on Every Page, Confirming The Techno- Commercial Details Viz: Billing Address, Delivery Address, Glass Thickness, The Opening Direction, The Fittings, The Fabrication Sizes, The Elevation And The Price. <br /> <br />

                    Advance Payment as mentioned in payment schedule.
                    </p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref6}>
                    <p><span>Pricing </span>All statutory duties & taxes, whether central, state or local shall be levied @ rate prevailing on the date of delivery. In case of multiple deliveries in the same project, spread over a period of time, the taxes & duties levied may be different based on prevailing rate at the time of each delivery. <br /> <br />
                    This Offer may change with the change in the Dimension, Elevation, Glass Type, and Hardware Type etc., which may please be noted. <br /> <br />
                    Offers Based On Rough Dimensions The Invoice Value Will Differ From This Quotation Value As The Rates May Change As Per The Final Sizes Of Windows/Doors Delivered At Site. However, all the terms and discount offered shall remain unchanged. <br /> <br />
                    The Price offered is valid for 6 Days from the date of the Quotation. <br /> <br />
                    As a standard practice we do not change the value of window in case of 5% change
                    In size (Either reduction or addition)
                    </p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref7}>
                    <p><span>Delivery </span>Material to be delivered in 90-120 days after final order confirmation and advance. <br /> <br />
                    Complete Installation Handover to be done within 15-20 days depending on site clearances. <br /> <br />
                    above dates depend on site clearances. <br /> <br />
                    When window frames and/or glasses are delivered at site, either in part or full quantities, any defect such as scratch marks etc. should be brought to our notice within 3 days from the delivery date. We will not be responsible for any defects/scratches, after this period other than manufacturing defects.
                    </p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref8}>
                    <p><span>Warranty </span>We offer a warranty of ten years on Aluminium Windows and 15 years on Aluminium Surface Treatment.<br /> <br />
                    A detailed Warranty Certificate will be provided after completion of the project.
                    </p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref9}>
                    <p><span>Payment </span>Payment to be made as per schedule mentioned below and shall be independent of the project progress. <br /> <br />
                    50% advance of Contract Value + 100% advance of Glass Value against order confirmation. <br /> <br />
                    50% of Contract Value, against material delivery at site. <br /> <br />
                    10% against material readiness and before dispatch from factory. <br /> <br />
                    Retention Amount: 10% against installation completion, before handover at site or against submission of BG.
                    </p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref10}>
                    <p><span>Installation </span>Should there be any delay in site readiness after material delivery, suitable storage with proper stacking of all material (glass and frames) has to be provided by the client. <br /> <br />
                    Installation should commence within 10 days from the date of receipt of material at site. <br /> <br />
                    The site should be made available for carrying out the installation work (without any hindrances) and the final measurements should not deviate from the preliminary measurements. In the event of any delay in the site clearance, the same will be deemed as delivered and installation should commence after the readiness of the site. <br /> <br />
                    No Wet work will be carried out by <strong>Yantra Aluminium Window Systems Pvt Ltd.</strong> <br /> <br />
                    The Site should be kept dry, clean, and clear from obstruction, and safe, for installing windows. <br /> <br />
                    Temporary electric and water connections to be provided at the site. <br /> <br />
                    In case of a delay of more than one month in execution of installation on account of client, re-fabrication or any extra costs (Over and above the PO) involved, if any, will be at Clients risk & cost and payable directly before the material is taken up for installation.
                    </p>
                </motion.div>

                <motion.div
                initial={hidden}
                 whileInView={show}
                 viewport={{ once: true }}
                 transition={transition}
                 className={styles.tncText} 
                 ref={ref11}>
                    <p><span>Completion Certificate </span>A Completion Certificate issued by the client/architect/consultant after satisfactory completion of works and a handing-over certificate to be issued on completion of all works as per the offer.<br /> <br />
                    In case of delay in issuance of this certificate beyond 15 days from completion of installation, it will be deemed that the work has been satisfactorily completed and in accordance with the terms of this contract.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

export default Tnc;
