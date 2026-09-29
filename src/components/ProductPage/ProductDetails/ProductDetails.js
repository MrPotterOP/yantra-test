'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { motion, AnimatePresence } from 'framer-motion';

const customEase = [0.22, 1, 0.36, 1];


// ----------------------------------------------------------------------
// SUB-COMPONENT: DYNAMIC OPTION RENDERER
// ----------------------------------------------------------------------
const CustomizationOption = ({ optionData, selectedChoice, onSelect, isOpen, toggleOpen }) => {
    return (
        <div className={styles.ProdDet_accordionItem}>
            <button className={styles.ProdDet_accordionTrigger} onClick={() => toggleOpen(optionData.id)}>
                <span className={styles.ProdDet_accordionTitle}>{optionData.title}</span>
                <span className={styles.ProdDet_accordionIcon}>{isOpen ? '-' : '+'}</span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: customEase }}
                        className={styles.ProdDet_accordionBodyOverflowClip}
                    >
                        <div className={styles.ProdDet_accordionBodyInner}>
                            <span className={styles.ProdDet_variantActiveLabelDisplay}>
                                {selectedChoice?.name || "Select an option"}
                            </span>

                            <div className={styles.ProdDet_dynamicOptionGrid}>
                                {optionData.choices.map((choice) => {
                                    const isActive = selectedChoice?.id === choice.id;

                                    switch (optionData.type) {
                                        case 'color':
                                            return (
                                                <button
                                                    key={choice.id}
                                                    className={`${styles.ProdDet_colorSwatchCapsule} ${isActive ? styles.ProdDet_swatchActive : ''}`}
                                                    style={{ '--swatch-bg': choice.value }}
                                                    onClick={() => onSelect(optionData.id, choice)}
                                                    aria-label={`Select ${choice.name}`}
                                                />
                                            );
                                        case 'image':
                                            return (
                                                <button
                                                    key={choice.id}
                                                    className={`${styles.ProdDet_glazeSelectionCard} ${isActive ? styles.ProdDet_glazeCardActive : ''}`}
                                                    onClick={() => onSelect(optionData.id, choice)}
                                                >
                                                    <div className={styles.ProdDet_glazeCardIconViewport}>
                                                        <img src={choice.value} alt="" aria-hidden="true" />
                                                    </div>
                                                </button>
                                            );
                                        case 'text':
                                        default:
                                            return (
                                                <button
                                                    key={choice.id}
                                                    className={`${styles.ProdDet_textSelectionCard} ${isActive ? styles.ProdDet_textCardActive : ''}`}
                                                    onClick={() => onSelect(optionData.id, choice)}
                                                >
                                                    {choice.name}
                                                </button>
                                            );
                                    }
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export default function ProductDetail({ product }) {
    if (!product) return null;

    // Guard: if no images are provided, render a graceful fallback
    // This can happen during CMS setup before images are uploaded
    if (!product.images || product.images.length === 0) {
        return (
            <div className={styles.ProdDet_section}>
                <div style={{ padding: '120px 24px', textAlign: 'center' }}>
                    <h1 className={styles.ProdDet_mainTitle}>{product.name}</h1>
                    <h2 className={styles.ProdDet_subTitleLine}>{product.subtitle}</h2>
                    <p className={styles.ProdDet_narrativeParagraph}>{product.description}</p>
                </div>
            </div>
        );
    }

    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const initialConfig = product.customizations.reduce((acc, opt) => {
        acc[opt.id] = opt.choices[0];
        return acc;
    }, {});
    const [configuration, setConfiguration] = useState(initialConfig);

    const initialAccordions = {
        ...product.customizations.reduce((acc, opt) => ({ ...acc, [opt.id]: true }), {}),
        ...product.information.reduce((acc, info) => ({ ...acc, [info.id]: false }), {})
    };
    const [openSections, setOpenSections] = useState(initialAccordions);

    // Advanced Magnifier State (Pixel-perfect exact mapping)
    const [zoomParams, setZoomParams] = useState({
        show: false,
        x: 0,
        y: 0,
        bgPosX: 0,
        bgPosY: 0,
        bgWidth: 0,
        bgHeight: 0
    });

    const imageContainerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 991px)").matches);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleSection = (id) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleOptionSelect = (optionId, choice) => {
        setConfiguration(prev => ({ ...prev, [optionId]: choice }));
    };

    const handleImageNav = (newDirection, e) => {
        if (e) e.stopPropagation(); // Prevent zooming when clicking arrows
        let nextIndex = activeImgIndex + newDirection;
        if (nextIndex >= product.images.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = product.images.length - 1;
        setDirection(newDirection);
        setActiveImgIndex(nextIndex);
    };

    const handleMouseMove = (e) => {
        if (isMobile || !imageContainerRef.current) return;

        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();

        // Mouse position relative to container
        const x = e.clientX - left;
        const y = e.clientY - top;

        // High Intensity Zoom Factor (e.g., 4x zoom)
        const zoomFactor = 1.6;
        const lensSize = 80; // Matches the CSS width/height of the square lens

        // Calculate exact background size required
        const bgWidth = width * zoomFactor;
        const bgHeight = height * zoomFactor;

        // Calculate exact background position to center the pixel under the cursor
        const bgPosX = (lensSize / 2) - (x * zoomFactor);
        const bgPosY = (lensSize / 2) - (y * zoomFactor);

        setZoomParams({ show: true, x, y, bgPosX, bgPosY, bgWidth, bgHeight });
    };

    const handleMouseLeave = () => setZoomParams(prev => ({ ...prev, show: false }));

    // Suppresses zoom lens when hovering over arrows to keep UX clean
    const handleArrowHover = (e) => {
        e.stopPropagation();
        setZoomParams(prev => ({ ...prev, show: false }));
    };

    const handleEnquiry = () => {
        console.log("Submit Configuration Payload:", configuration);
    };

    return (
        <div className={styles.ProdDet_section}>
            <div className={styles.ProdDet_layoutGrid}>

                {/* --- LEFT HAND: ADAPTIVE MEDIA CAROUSEL BLOCK --- */}
                <div className={styles.ProdDet_stickyMediaContainer}>
                    <div
                        className={styles.ProdDet_viewportMaster}
                        ref={imageContainerRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onMouseEnter={handleMouseMove}
                    >
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            <motion.img
                                key={activeImgIndex}
                                src={product.images[activeImgIndex].url}
                                alt={product.images[activeImgIndex].alt}
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(10px)' }}
                                transition={{ duration: 0.4, ease: customEase }}
                                className={styles.ProdDet_activeViewportImg}
                            />
                        </AnimatePresence>

                        {/* Boxed Custom Magnifier Lens */}
                        {zoomParams.show && (
                            <div
                                className={styles.ProdDet_magnifierLens}
                                style={{
                                    left: zoomParams.x,
                                    top: zoomParams.y,
                                    backgroundImage: `url(${product.images[activeImgIndex].url})`,
                                    backgroundSize: `${zoomParams.bgWidth}px ${zoomParams.bgHeight}px`,
                                    backgroundPosition: `${zoomParams.bgPosX}px ${zoomParams.bgPosY}px`
                                }}
                            />
                        )}

                        {/* Slider Triggers (Boxed Frosted Glass) */}
                        <button
                            className={`${styles.ProdDet_sliderArrow} ${styles.ProdDet_leftArrow}`}
                            onClick={(e) => handleImageNav(-1, e)}
                            onMouseEnter={handleArrowHover}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button
                            className={`${styles.ProdDet_sliderArrow} ${styles.ProdDet_rightArrow}`}
                            onClick={(e) => handleImageNav(1, e)}
                            onMouseEnter={handleArrowHover}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>

                    <div className={styles.ProdDet_thumbnailTrack}>
                        {product.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setDirection(idx > activeImgIndex ? 1 : -1);
                                    setActiveImgIndex(idx);
                                }}
                                className={`${styles.ProdDet_thumbCard} ${idx === activeImgIndex ? styles.ProdDet_thumbActive : ''}`}
                            >
                                {/* Use thumbUrl (Cloudinary 120x90) if available, else fall back to full url */}
                                <img src={img.thumbUrl || img.url} alt={img.alt} className={styles.ProdDet_thumbAsset} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT HAND: SCROLLING DATA ENGINE --- */}
                <div className={styles.ProdDet_detailsScrollContainer}>
                    <nav className={styles.ProdDet_breadcrumbs}>
                        {product.breadcrumbs.map((crumb, index) => (
                            <span key={index} className={styles.ProdDet_crumbNode}>
                                {crumb} {index < product.breadcrumbs.length - 1 && <span className={styles.ProdDet_crumbSep}>&gt; </span>}
                            </span>
                        ))}
                    </nav>

                    <h1 className={styles.ProdDet_mainTitle}>{product.name}</h1>
                    <h2 className={styles.ProdDet_subTitleLine}>{product.subtitle}</h2>
                    <p className={styles.ProdDet_narrativeParagraph}>{product.description}</p>

                    <div className={styles.ProdDet_specsSection}>
                        <h4 className={styles.ProdDet_sectionLabel}>Technical Specifications</h4>
                        <div className={styles.ProdDet_specsTable}>
                            {product.specs.map((spec, idx) => (
                                <div key={idx} className={styles.ProdDet_specsRow}>
                                    <span className={styles.ProdDet_specLabel}>{spec.label}</span>
                                    <span className={styles.ProdDet_specValue}>{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {product.customizations.length > 0 && (
                        <div className={styles.ProdDet_configuratorStack}>
                            <h3 className={styles.ProdDet_sectionLabel}>Customisation Options</h3>
                            {product.customizations.map((option) => (
                                <CustomizationOption
                                    key={option.id}
                                    optionData={option}
                                    selectedChoice={configuration[option.id]}
                                    onSelect={handleOptionSelect}
                                    isOpen={openSections[option.id]}
                                    toggleOpen={toggleSection}
                                />
                            ))}
                        </div>
                    )}

                    {product.information.length > 0 && (
                        <div className={styles.ProdDet_configuratorStack}>
                            <h3 className={styles.ProdDet_sectionLabel}>Support & Documentation</h3>
                            {product.information.map((info) => (
                                <div key={info.id} className={styles.ProdDet_accordionItem}>
                                    <button className={styles.ProdDet_accordionTrigger} onClick={() => toggleSection(info.id)}>
                                        <span className={styles.ProdDet_accordionTitle}>{info.title}</span>
                                        <span className={styles.ProdDet_accordionIcon}>{openSections[info.id] ? '-' : '+'}</span>
                                    </button>
                                    <AnimatePresence>
                                        {openSections[info.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: customEase }}
                                                className={styles.ProdDet_accordionBodyOverflowClip}
                                            >
                                                <div className={styles.ProdDet_accordionBodyInner}>
                                                    <p className={styles.ProdDet_accordionTextContentParagraph}>{info.content}</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    )}

                    <button onClick={handleEnquiry} className={styles.ProdDet_actionCTAButton}>
                        <span>Enquire About This Configuration</span>
                        <span className={styles.ProdDet_ctaArrowSymbol}>↗</span>
                    </button>
                </div>
            </div>
        </div>
    );
}