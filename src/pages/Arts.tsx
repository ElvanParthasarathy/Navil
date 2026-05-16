import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';

// Icons as inline SVGs for the category cards
const PencilIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
    </svg>
);

const EditingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
);

const PosterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);

const PaintingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/>
    </svg>
);

const QuoteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
    </svg>
);

const PoemIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 6.1H3" />
        <path d="M21 12.1H3" />
        <path d="M15.1 18H3" />
    </svg>
);

const IllustrationIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.71 3.29c-.78-.78-2.05-.78-2.83 0l-3.3 3.3a3 3 0 1 0 4.24 4.24l3.3-3.3c.78-.78.78-2.05 0-2.83Z" />
        <path d="M16 11l-8 8H4v-4l8-8" />
        <path d="M3 21l3-3" />
    </svg>
);

const DigitalArtIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <path d="M7 11l2 2 4-4"/>
    </svg>
);

const CATEGORIES = {
    pencil: {
        titleTa: 'ஓவியங்கள்',
        titleEn: 'Pencil Drawings',
        descTa: 'கையால் வரைந்த பென்சில் ஓவியங்கள்',
        descEn: 'Freehand pencil sketches and portrait art.',
        footerTa: 'ஓவியங்களைக் காண',
        icon: <PencilIcon />,
    },
    editing: {
        titleTa: 'தொகுப்புகள்',
        titleEn: 'Editings',
        descTa: 'புகைப்படத் திருத்தங்கள் மற்றும் டிஜிட்டல் படைப்புகள்',
        descEn: 'Photo manipulations and digital creations.',
        footerTa: 'படைப்புகளைக் காண',
        icon: <EditingIcon />,
    },
    poster: {
        titleTa: 'சுவரொட்டிகள்',
        titleEn: 'Posters',
        descTa: 'நிகழ்வுகளுக்கான போஸ்டர் வடிவமைப்புகள்',
        descEn: 'Event banners and creative poster designs.',
        footerTa: 'வடிவமைப்புகளைக் காண',
        icon: <PosterIcon />,
    },
    painting: {
        titleTa: 'ஓவியக்கலை',
        titleEn: 'Paintings',
        descTa: 'வண்ணங்களில் வரையப்பட்ட ஓவியங்கள்',
        descEn: 'Color paintings and mixed media artworks.',
        footerTa: 'ஓவியங்களைக் காண',
        icon: <PaintingIcon />,
    },
    quotes: {
        titleTa: 'மேற்கோள் அட்டைகள்',
        titleEn: 'Quotes',
        descTa: 'பொன்மொழிகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual quote cards and typographic designs.',
        footerTa: 'மேற்கோள்களைக் காண',
        icon: <QuoteIcon />,
    },
    poems: {
        titleTa: 'கவிதை அட்டைகள்',
        titleEn: 'Poems',
        descTa: 'கவிதைகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual poem cards and creative typography.',
        footerTa: 'கவிதைகளைக் காண',
        icon: <PoemIcon />,
    },
    illustrations: {
        titleTa: 'சித்திரங்கள்',
        titleEn: 'Illustrations',
        descTa: 'டிஜிட்டல் சித்திரங்கள் மற்றும் லோகோ வடிவமைப்புகள்',
        descEn: 'Digital illustrations, logos, and vector art.',
        footerTa: 'படைப்புகளைக் காண',
        icon: <IllustrationIcon />,
    },
    digital_arts: {
        titleTa: 'டிஜிட்டல் கலை',
        titleEn: 'Digital Arts',
        descTa: 'கணினி மென்பொருளில் உருவாக்கிய கலைப்படைப்புகள்',
        descEn: 'Artworks created using digital software.',
        footerTa: 'படைப்புகளைக் காண',
        icon: <DigitalArtIcon />,
    },
};

const Arts = () => {
    const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();

    const [categoryCounts, setCategoryCounts] = useState({});

    useEffect(() => {
        setPageTitle('படைப்புகள்|arts');
    }, [setPageTitle]);

    // Fetch counts from Firebase
    useEffect(() => {
        const artsRef = ref(db, 'arts');
        const unsubscribe = onValue(artsRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataObj = snapshot.val() as Record<string, any>;
                const counts: Record<string, number> = {};
                Object.values(dataObj).forEach(item => {
                    const cat = item.category || 'other';
                    counts[cat] = (counts[cat] || 0) + 1;
                });
                setCategoryCounts(counts);
            } else {
                setCategoryCounts({});
            }
        }, () => {});
        return () => unsubscribe();
    }, []);

    return (
        <div className="writings-page page-view fadeIn">
            <style>{`
                .writings-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px 32px;
                }
                .writings-header {
                    margin-bottom: 48px;
                    text-align: left;
                }
                .writings-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: 0;
                    margin-bottom: 10px;
                    color: var(--text-main);
                    line-height: 1.3;
                }
                .writings-title-sub {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #888888;
                    margin-bottom: 16px;
                    letter-spacing: 0.5px;
                }
                .writings-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin: 0;
                }
                /* MOBILE / TOUCH DEVICE ADJUSTMENTS */
                @media (max-width: 768px) {
                    .writings-page { padding: 0 0 100px 0; }
                    .writings-header { padding: 28px 28px 10px; text-align: center; margin-bottom: 24px; }
                    .writings-title { display: none; }
                    .writings-title-sub { display: none; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; text-align: center; }
                    .category-grid { grid-template-columns: 1fr; gap: 16px; padding: 0 20px; margin-top: 24px; }
                    
                    .category-card { 
                        min-height: auto; 
                        padding: 24px; 
                    }

                    .cat-footer {
                        opacity: 1;
                        transform: none;
                    }
                }

                .arts-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: 100px;
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-left: 8px;
                    vertical-align: middle;
                }

            `}</style>

            <header className="writings-header animate-entry">
                <h1 className="writings-title">படைப்புகள்</h1>
                <div className="writings-title-sub">Arts & Creations</div>
                <p className="writings-subtitle">
                    வரைவுகள், வடிவமைப்புகள் & டிஜிட்டல் படைப்புகள்
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                    Drawings, Designs & Digital Creations
                </p>
            </header>

            <div className="category-grid animate-entry">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <Link to={`/arts/${key}`} className="category-card" key={key}>
                        <div className="cat-icon-box">{cat.icon}</div>
                        <div className="cat-content">
                            <div className="cat-title">
                                {cat.titleTa}
                                {categoryCounts[key] > 0 && (
                                    <span className="arts-count-badge">{categoryCounts[key]}</span>
                                )}
                            </div>
                            <div className="cat-title-sub">{cat.titleEn}</div>
                            <p className="cat-desc">{cat.descTa}</p>
                            <p className="cat-desc-sub">{cat.descEn}</p>
                        </div>
                        <div className="cat-footer">{cat.footerTa} <FiArrowRight /></div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Arts;
