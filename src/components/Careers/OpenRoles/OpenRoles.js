'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './styles.module.css';

const customEase = [0.22, 1, 0.36, 1];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 }
    }
};

const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: customEase } }
};

// ── Inline Apply Modal ────────────────────────────────────────────────────────
function ApplyModal({ role, onClose }) {
    const overlayRef = useRef(null);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        resumeLink: '',
        coverNote: '',
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('idle'); // idle | loading | success | error

    // Trap scroll + close on Escape
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const set = (k, v) => {
        setForm(prev => ({ ...prev, [k]: v }));
        setErrors(prev => ({ ...prev, [k]: '' }));
    };

    // Client-side validation — mirrors server-side rules for instant feedback
    const validate = () => {
        const e = {};
        if (!form.fullName.trim()) {
            e.fullName = 'Full name is required';
        } else if (form.fullName.trim().length > 200) {
            e.fullName = 'Full name must be under 200 characters';
        }

        if (!form.email.trim()) {
            e.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            e.email = 'Please provide a valid email address';
        }

        if (!form.phone.trim()) {
            e.phone = 'Phone number is required';
        }

        if (!form.resumeLink.trim()) {
            e.resumeLink = 'Resume link is required';
        } else if (!form.resumeLink.trim().startsWith('https://drive.google.com/')) {
            e.resumeLink = 'Must be a Google Drive link (https://drive.google.com/…)';
        }

        if (form.coverNote && form.coverNote.length > 2000) {
            e.coverNote = 'Cover note must be under 2000 characters';
        }

        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setStatus('loading');
        try {
            // POST to the ID-based endpoint
            const res = await fetch(`/api/frontend/careers/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    resumeLink: form.resumeLink,
                    coverNote: form.coverNote,
                    careerId: role.id,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 422 && data.details) {
                // Map server field-level errors back to the form
                const mapped = {};
                Object.entries(data.details).forEach(([f, msg]) => {
                    mapped[f] = Array.isArray(msg) ? msg[0] : msg;
                });
                setErrors(mapped);
                setStatus('idle');
            } else if (res.status === 404) {
                // Role was deactivated between page load and submission
                setErrors({ _global: 'This position is no longer accepting applications.' });
                setStatus('idle');
            } else if (!res.ok) {
                setStatus('error');
            } else {
                setStatus('success');
            }
        } catch {
            // Network failure — show generic error, preserve form data
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                ref={overlayRef}
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ opacity: 0, y: 32, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: customEase }}
                >
                    {/* Header */}
                    <div className={styles.modalHeader}>
                        <div>
                            <p className={styles.modalLabel}>Applying for</p>
                            <h3 className={styles.modalTitle}>{role.role}</h3>
                            <p className={styles.modalMeta}>{role.field} · {role.location}</p>
                        </div>
                        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    {status === 'success' ? (
                        <div className={styles.modalSuccess}>
                            <div className={styles.successIcon}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <h4>Application Submitted!</h4>
                            <p>Thank you for applying for the <strong>{role.role}</strong> position. We&apos;ll review your application and get back to you shortly.</p>
                            <button className={styles.modalDone} onClick={onClose}>Close</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
                            {/* Global error (e.g. role deactivated, network failure) */}
                            {errors._global && (
                                <p className={styles.formError}>{errors._global}</p>
                            )}

                            <div className={styles.formRow}>
                                <Field
                                    label="Full Name" id="apply-name" type="text" required
                                    value={form.fullName} onChange={v => set('fullName', v)}
                                    error={errors.fullName} placeholder="Jane Smith"
                                />
                                <Field
                                    label="Email Address" id="apply-email" type="email" required
                                    value={form.email} onChange={v => set('email', v)}
                                    error={errors.email} placeholder="jane@example.com"
                                />
                            </div>
                            <Field
                                label="Phone Number" id="apply-phone" type="tel" required
                                value={form.phone} onChange={v => set('phone', v)}
                                error={errors.phone} placeholder="+91 98765 43210"
                            />
                            <Field
                                label="Resume (Google Drive link)" id="apply-resume" type="url" required
                                value={form.resumeLink} onChange={v => set('resumeLink', v)}
                                error={errors.resumeLink}
                                placeholder="https://drive.google.com/file/d/…"
                                hint="Share a publicly accessible Google Drive link to your resume/CV"
                            />
                            <div className={styles.fieldStack}>
                                <label className={styles.fieldLabel} htmlFor="apply-note">
                                    Cover Note <span className={styles.fieldOptional}>(optional)</span>
                                </label>
                                <textarea
                                    id="apply-note"
                                    className={[
                                        styles.textarea,
                                        errors.coverNote ? styles.fieldInputError : ''
                                    ].join(' ')}
                                    rows={4}
                                    maxLength={2000}
                                    value={form.coverNote}
                                    onChange={e => set('coverNote', e.target.value)}
                                    placeholder="Tell us why you'd be a great fit for this role…"
                                />
                                {errors.coverNote && (
                                    <span className={styles.fieldError}>{errors.coverNote}</span>
                                )}
                                <span className={styles.fieldHint}>
                                    {form.coverNote.length}/2000 characters
                                </span>
                            </div>

                            {status === 'error' && (
                                <p className={styles.formError}>
                                    Something went wrong. Please check your connection and try again.
                                </p>
                            )}

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                                <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                                    {status === 'loading' ? (
                                        <span className={styles.spinner} />
                                    ) : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function Field({ label, id, type, value, onChange, error, placeholder, hint, required }) {
    return (
        <div className={styles.fieldStack}>
            <label className={styles.fieldLabel} htmlFor={id}>
                {label} {required && <span className={styles.fieldRequired}>*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={[styles.fieldInput, error ? styles.fieldInputError : ''].join(' ')}
                placeholder={placeholder}
                autoComplete="off"
            />
            {hint && <span className={styles.fieldHint}>{hint}</span>}
            {error && <span className={styles.fieldError}>{error}</span>}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * OpenRoles
 *
 * @param {object[]} initialRoles — Pre-fetched roles from the server (SSR).
 *   Passed from careers/page.js. When provided, the component renders without
 *   a loading state on first paint. The useEffect still runs as a client-side
 *   refresh to pick up any changes since the page was rendered.
 */
export default function OpenRoles({ initialRoles = [] }) {
    const [roles, setRoles] = useState(initialRoles);
    const [isLoading, setIsLoading] = useState(initialRoles.length === 0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [applyingRole, setApplyingRole] = useState(null);

    useEffect(() => {
        // If we got initialRoles from the server, skip the loading state
        // but still refresh to catch any CMS updates since page generation
        if (initialRoles.length > 0) {
            setIsLoading(false);
        }

        fetch('/api/frontend/careers')
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch');
                return r.json();
            })
            .then(data => {
                if (Array.isArray(data)) setRoles(data);
                setIsLoading(false);
            })
            .catch(() => {
                // If fetch fails, keep the initialRoles (SSR data) — don't clear them
                setIsLoading(false);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <section className={styles.openRolesSection}>
                <div className={styles.openRolesContainer}>

                    <motion.h2
                        className={styles.openRolesHeading}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.9, ease: customEase }}
                    >
                        OPEN ROLES
                    </motion.h2>

                    {/* Loading skeletons — only shown when no initialRoles were passed */}
                    {isLoading && (
                        <div className={styles.openRolesList}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`${styles.openRolesRow} ${styles.skeletonRow}`}>
                                    <div className={styles.openRolesHeader}>
                                        <div className={styles.skeletonTitle} />
                                        <div className={styles.skeletonMeta} />
                                        <div className={styles.skeletonMeta} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Roles list */}
                    {!isLoading && (
                        <motion.div
                            className={styles.openRolesList}
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                        >
                            {roles.length === 0 ? (
                                <div className={styles.openRolesEmptyState}>
                                    <p>We currently have no open positions, but we&apos;re always looking for great talent.</p>
                                </div>
                            ) : (
                                roles.map((role, idx) => {
                                    const isActive = activeIndex === idx;
                                    return (
                                        <motion.div
                                            key={role.id}
                                            className={`${styles.openRolesRow} ${isActive ? styles.openRolesRowActive : ''}`}
                                            variants={rowVariants}
                                        >
                                            {/* Header row */}
                                            <div
                                                className={styles.openRolesHeader}
                                                onClick={() => setActiveIndex(isActive ? -1 : idx)}
                                            >
                                                <h3 className={styles.openRolesTitle}>{role.role}</h3>
                                                <p className={styles.openRolesMeta}>{role.field}</p>
                                                <p className={styles.openRolesMeta}>{role.location}</p>

                                                <div className={styles.openRolesAction}>
                                                    <button
                                                        className={styles.openRolesApplyLink}
                                                        onClick={(e) => { e.stopPropagation(); setApplyingRole(role); }}
                                                    >
                                                        Apply Now
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable description */}
                                            <AnimatePresence initial={false}>
                                                {isActive && (
                                                    <motion.div
                                                        className={styles.openRolesDescriptionWrapper}
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.4, ease: customEase }}
                                                    >
                                                        <div className={styles.openRolesDescriptionInner}>
                                                            <p className={styles.openRolesDescription}>{role.description}</p>
                                                            <button
                                                                className={styles.openRolesApplyInline}
                                                                onClick={() => setApplyingRole(role)}
                                                            >
                                                                Apply for this role →
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}

                    {/* Footer CTA */}
                    <motion.div
                        className={styles.openRolesCta}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.8, delay: 0.4, ease: customEase }}
                    >
                        <h3 className={styles.openRolesCtaHeading}>DON&apos;T SEE A PERFECT FIT?</h3>
                        <p className={styles.openRolesCtaText}>
                            We are always looking for exceptional talent. Send us your resume
                            <br /> and a brief note on what you can bring to Yantra at
                            <br />
                            <a href="mailto:careers@yantraindia.com" className={styles.openRolesEmailLink}>
                                careers@yantraindia.com
                            </a>
                        </p>
                    </motion.div>

                </div>
            </section>

            {/* Application modal — rendered in portal-like fashion at root level */}
            {applyingRole && (
                <ApplyModal role={applyingRole} onClose={() => setApplyingRole(null)} />
            )}
        </>
    );
}