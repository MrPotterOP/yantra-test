'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

// ----------------------------------------------------------------------
// DUMMY DATA FOR IMMEDIATE TESTING
// ----------------------------------------------------------------------
const dummyHtmlContent = `
  <h2>Why Choose a Sliding Panel Roof?</h2>
  <p>The SolaGlide Sliding Panel Roof is not just a structural addition; it’s a statement of versatility. Designed for open-air spaces like restaurants, cafes, and event venues, it allows you to:</p>
  <ul>
    <li>Maximize Space Efficiency: With motorized sliding panels, you can adjust the roofing to suit the weather or ambiance.</li>
    <li>Enjoy Every Season: Transform your outdoor area into a cozy wintergarden in colder months or a breezy sunroom in summer.</li>
    <li>Seamless Design: Its sleek, modern appearance enhances any architectural style while offering reliable protection against the elements.</li>
  </ul>
  <p>Explore more about the SolaGlide Sliding Panel Roof on Libart’s official page: Sliding Panel Roof Systems.</p>
  
  <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" alt="Architectural Roof Framework" />
  <em>*CREDITS - UNSPLASH</em>

  <h3>Combining Panora Vertical Retracting Windows Doors</h3>
  <p>Integrating our Panora windows takes this concept to an entirely new level. These vertically retracting glass panels function seamlessly with the overhead architecture to provide a total environmental seal when closed, and completely unobstructed flow when open.</p>

  <h2>The Hawk's Nest: A Case Study in Excellence</h2>
  <p>Located in the heart of the bustling commercial district, The Hawk's Nest required an innovative approach to their rooftop dining experience. They needed a space that could handle severe winter snow loads while providing an open-air summer patio.</p>
  <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80" alt="Hawk's Nest Interior" />
  
  <h3>Structural Load Management</h3>
  <p>By implementing a custom extrusion profile, we increased the snow load capacity by 40% without compromising the minimal aesthetic profile of the glass bays. The system drains internal condensation invisibly through the main support pillars.</p>

  <h2>Maintenance and Long-Term Durability</h2>
  <p>Engineered from 6061-T6 aluminum alloy and finished with architectural-grade powder coating, the system requires minimal maintenance. The motorized tracks utilize self-lubricating polymer wheels designed to withstand decades of cycle testing.</p>
`;
// ----------------------------------------------------------------------

export default function BlogBody({ htmlContent = dummyHtmlContent }) {
    const [toc, setToc] = useState([]);
    const [activeId, setActiveId] = useState('');

    const contentRef = useRef(null);
    const isClickScrolling = useRef(false); // Flag to prevent observer fighting click-scroll
    const scrollTimeout = useRef(null);

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    };

    // 1. Parse markup, inject IDs into DOM, and build TOC array
    useEffect(() => {
        if (!contentRef.current) return;

        const headings = contentRef.current.querySelectorAll('h2, h3');
        const tocItems = [];

        headings.forEach((heading, index) => {
            const text = heading.innerText || heading.textContent;
            const slug = `heading-${slugify(text)}-${index}`;

            // Mutate the raw HTML node directly so it exists for standard browser anchors
            heading.setAttribute('id', slug);

            tocItems.push({
                id: slug,
                text: text,
                level: heading.tagName.toLowerCase()
            });
        });

        setToc(tocItems);

        // Set the first item as active by default if it exists
        if (tocItems.length > 0) setActiveId(tocItems[0].id);
    }, [htmlContent]);

    // 2. Intersection Observer logic
    useEffect(() => {
        if (toc.length === 0) return;

        const handleIntersect = (entries) => {
            // If the user just clicked a link, ignore standard scroll events temporarily
            if (isClickScrolling.current) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        };

        // -120px offset accounts for fixed navbars. -40% bottom margin ensures it catches mid-screen.
        const observerOptions = {
            root: null,
            rootMargin: '-120px 0px -40% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        const headingElements = contentRef.current.querySelectorAll('h2, h3');
        headingElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [toc]);

    // 3. Bulletproof click-to-scroll logic
    const handleAnchorClick = (e, id) => {
        e.preventDefault();
        const targetElement = document.getElementById(id);

        if (targetElement) {
            // Lock the observer so it doesn't flicker states while scrolling
            isClickScrolling.current = true;
            setActiveId(id);

            // Calculate absolute document offset, not viewport relative
            const headerOffset = 140;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = targetElement.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Unlock observer after smooth scroll completes (~800ms)
            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                isClickScrolling.current = false;
            }, 800);
        }
    };

    return (
        <div className={styles.BlogBody_section}>
            <div className={styles.BlogBody_gridContainer}>

                {/* --- TOC Sidebar Track --- */}
                <aside className={styles.BlogBody_tocSidebar}>
                    <h5 className={styles.BlogBody_tocMainTitle}>Contents</h5>
                    <nav className={styles.BlogBody_tocNavTrack}>
                        {toc.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => handleAnchorClick(e, item.id)}
                                className={`${styles.BlogBody_tocLink} ${styles[`BlogBody_${item.level}`]} ${activeId === item.id ? styles.BlogBody_activeLink : ''
                                    }`}
                            >
                                {item.text}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* --- Editor Markup Viewport --- */}
                <article
                    ref={contentRef}
                    className={styles.BlogBody_articleContent}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

            </div>
        </div>
    );
}