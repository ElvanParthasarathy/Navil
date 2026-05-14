// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useScrollRestore } from '../lib/scrollRestoration';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';

const CATEGORY_META = {
    pencil: {
        titleTa: 'ஓவியங்கள்',
        titleEn: 'Pencil Drawings',
        descTa: 'கையால் வரைந்த பென்சில் ஓவியங்கள்',
        descEn: 'Freehand pencil sketches and portrait art.',
    },
    editing: {
        titleTa: 'தொகுப்புகள்',
        titleEn: 'Editings',
        descTa: 'புகைப்படத் திருத்தங்கள் மற்றும் டிஜிட்டல் படைப்புகள்',
        descEn: 'Photo manipulations and digital creations.',
    },
    poster: {
        titleTa: 'சுவரொட்டிகள்',
        titleEn: 'Posters',
        descTa: 'நிகழ்வுகளுக்கான போஸ்டர் வடிவமைப்புகள்',
        descEn: 'Event banners and creative poster designs.',
    },
    painting: {
        titleTa: 'ஓவியக்கலை',
        titleEn: 'Paintings',
        descTa: 'வண்ணங்களில் வரையப்பட்ட ஓவியங்கள்',
        descEn: 'Color paintings and mixed media artworks.',
    },
    quotes: {
        titleTa: 'மேற்கோள் அட்டைகள்',
        titleEn: 'Quotes',
        descTa: 'பொன்மொழிகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual quote cards and typographic designs.',
    },
    poems: {
        titleTa: 'கவிதை அட்டைகள்',
        titleEn: 'Poems',
        descTa: 'கவிதைகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual poem cards and creative typography.',
    },
};

const ITEMS_PER_PAGE = 9;

const ArtsGallery = () => {
    const { category } = useParams();
    const meta = CATEGORY_META[category];
    const { setPageTitle } = useOutletContext();
    useScrollRestore(false);

    // Data state
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Lightbox state
    const [lightboxItem, setLightboxItem] = useState(null);
    const [lightboxImageIdx, setLightboxImageIdx] = useState(0);
    const [imageLoading, setImageLoading] = useState({});

    useEffect(() => {
        if (meta) setPageTitle(`${meta.titleTa}|${meta.titleEn}`);
    }, [setPageTitle, meta]);

    // Fetch from Firebase
    useEffect(() => {
        if (!category) return;
        setLoading(true);
        setVisibleCount(ITEMS_PER_PAGE);
        const artsRef = ref(db, 'arts');
        const unsubscribe = onValue(artsRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataObj = snapshot.val();
                const dataArray = Object.entries(dataObj)
                    .map(([key, val]) => ({ ...val, id: key }))
                    .filter(item => item.category === category)
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                setAllItems(dataArray);
            } else {
                setAllItems([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase fetch error:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [category]);

    const visibleItems = allItems.slice(0, visibleCount);
    const hasMore = visibleCount < allItems.length;
    const remainingCount = allItems.length - visibleCount;

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (lightboxItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [lightboxItem]);

    // Keyboard nav for lightbox
    useEffect(() => {
        if (!lightboxItem) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') { setLightboxItem(null); return; }
            const imgs = lightboxItem.images || [lightboxItem.image];
            if (e.key === 'ArrowRight' && lightboxImageIdx < imgs.length - 1) setLightboxImageIdx(i => i + 1);
            if (e.key === 'ArrowLeft' && lightboxImageIdx > 0) setLightboxImageIdx(i => i - 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxItem, lightboxImageIdx]);

    const openLightbox = (item) => {
        setLightboxItem(item);
        setLightboxImageIdx(0);
    };

    const handleImageLoad = useCallback((id) => {
        setImageLoading(prev => ({ ...prev, [id]: false }));
    }, []);

    if (!meta) {
        return (
            <div className="page-view fadeIn" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <h2>Category Not Found</h2>
                <Link to="/arts" style={{ color: 'var(--text-muted)' }}>Return to Arts</Link>
            </div>
        );
    }

    const cleanCaption = (cap) => {
        if (!cap) return '';
        // Remove hashtags and trailing whitespace
        return cap.replace(/#\S+/g, '').replace(/\n{2,}/g, '\n').trim();
    };

    return (
        <div className="page-view fadeIn">
            <Helmet>
                <title>{meta.titleEn} | Elvan Parthasarathy</title>
                <meta name="description" content={meta.descEn} />
            </Helmet>

            <style>{`
                .arts-gallery-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px 100px;
                }
                .arts-gallery-header {
                    margin-bottom: 32px;
                }
                .arts-gallery-title {
                    font-size: clamp(2rem, 3vw, 2.8rem);
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1.3;
                    margin-bottom: 4px;
                }
                .arts-gallery-sub {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #888;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }
                .arts-gallery-desc {
                    font-size: 1rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                /* Masonry-inspired grid */
                .arts-grid {
                    columns: 3;
                    column-gap: 8px;
                }
                .arts-grid-item {
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    background: var(--bg-panel);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    break-inside: avoid;
                }
                .arts-grid-item img {
                    width: 100%;
                    height: auto;
                    display: block;
                    object-fit: contain;
                    transition: transform 0.4s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s;
                }
                .arts-grid-item:hover img {
                    transform: scale(1.03);
                }
                .arts-grid-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(transparent 40%, rgba(0,0,0,0.7));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    display: flex;
                    align-items: flex-end;
                    padding: 16px;
                }
                .arts-grid-item:hover .arts-grid-overlay {
                    opacity: 1;
                }
                .arts-grid-overlay-text {
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    line-height: 1.3;
                    max-height: 2.6em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .arts-multi-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    pointer-events: none;
                }

                /* Lightbox */
                .arts-lightbox {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    background: rgba(0,0,0,0.92);
                    backdrop-filter: blur(20px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    animation: lbFadeIn 0.25s ease;
                }
                @keyframes lbFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .arts-lb-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    transition: background 0.2s;
                }
                .arts-lb-close:hover { background: rgba(255,255,255,0.2); }
                .arts-lb-img-wrapper {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 60px 60px 10px;
                    position: relative;
                    overflow: hidden;
                    min-height: 0;
                }
                .arts-lb-img-wrapper img {
                    max-width: 100%;
                    max-height: calc(100vh - 180px);
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 8px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                }
                .arts-lb-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s;
                    z-index: 10;
                }
                .arts-lb-nav:hover { background: rgba(255,255,255,0.2); }
                .arts-lb-nav.prev { left: 16px; }
                .arts-lb-nav.next { right: 16px; }
                .arts-lb-footer {
                    padding: 16px 24px 24px;
                    color: rgba(255,255,255,0.8);
                    text-align: center;
                    max-width: 700px;
                    width: 100%;
                }
                .arts-lb-caption {
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 8px;
                }
                .arts-lb-date {
                    font-size: 0.8rem;
                    opacity: 0.5;
                    font-weight: 500;
                }
                .arts-lb-dots {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 12px;
                }
                .arts-lb-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .arts-lb-dot.active {
                    background: white;
                    transform: scale(1.3);
                }

                .arts-empty {
                    text-align: center;
                    padding: 80px 20px;
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                /* Shimmer for loading images */
                .arts-img-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);
                    background-size: 800px 100%;
                    animation: shimmerAnim 1.5s ease-in-out infinite;
                }
                @keyframes shimmerAnim {
                    0% { background-position: -400px 0; }
                    100% { background-position: 400px 0; }
                }

                /* Show More button */
                .arts-show-more-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 32px;
                }
                .arts-show-more-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 32px;
                    border: 1px solid var(--border-light);
                    background: var(--bg-card);
                    color: var(--text-main);
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 100px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
                }
                .arts-show-more-btn:hover {
                    background: var(--text-main);
                    color: var(--bg-app);
                    border-color: var(--text-main);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px color-mix(in srgb, var(--text-main) 20%, transparent);
                }
                .arts-show-more-btn:active {
                    transform: scale(0.97);
                }
                .arts-show-more-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: 100px;
                    background: color-mix(in srgb, var(--text-main) 10%, transparent);
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .arts-show-more-btn:hover .arts-show-more-count {
                    background: rgba(255,255,255,0.2);
                }

                /* Loading skeleton */
                .arts-skeleton-grid {
                    columns: 3;
                    column-gap: 8px;
                }
                .arts-skeleton-item {
                    background: var(--bg-panel);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    break-inside: avoid;
                    overflow: hidden;
                    position: relative;
                }
                .arts-skeleton-item::after {
                    content: '';
                    display: block;
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);
                    background-size: 800px 100%;
                    animation: shimmerAnim 1.5s ease-in-out infinite;
                }

                @media (max-width: 768px) {
                    .arts-gallery-page { padding: 0 0 100px 0; }
                    .arts-gallery-header { padding: 20px 24px 8px; text-align: center; }
                    .arts-gallery-title { display: none; }
                    .arts-gallery-sub { display: none; }
                    .arts-gallery-desc { text-align: center; font-size: 0.95rem; }
                    .arts-grid { columns: 2; column-gap: 4px; padding: 0 4px; }
                    .arts-grid-item { margin-bottom: 4px; border-radius: 4px; }
                    .arts-grid-overlay { display: none; }
                    .arts-lb-nav { width: 36px; height: 36px; }
                    .arts-lb-nav.prev { left: 8px; }
                    .arts-lb-nav.next { right: 8px; }
                    .arts-lb-img-wrapper { padding: 56px 12px 8px; }
                    .arts-lb-img-wrapper img { max-height: calc(100vh - 160px); }
                    .arts-lb-footer { padding: 12px 16px 20px; }
                    .arts-skeleton-grid { columns: 2; column-gap: 4px; padding: 0 4px; }
                    .arts-skeleton-item { margin-bottom: 4px; border-radius: 4px; }
                    .arts-show-more-wrapper { padding: 0 20px; }
                    .arts-show-more-btn { width: 100%; justify-content: center; }
                }

                .back-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-decoration: none;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 100px;
                    padding: 10px 20px;
                    flex-shrink: 0;
                    white-space: nowrap;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .back-pill:hover {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    color: var(--text-main);
                }
                .back-pill:active {
                    transform: scale(0.95);
                    background: color-mix(in srgb, var(--text-main) 18%, transparent);
                }
            `}</style>

            <div className="arts-gallery-page">
                <header className="arts-gallery-header animate-entry">
                    <div className="mobile-hide" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div className="mobile-hide">
                            <h1 className="arts-gallery-title">{meta.titleTa}</h1>
                        </div>
                        <div className="mobile-hide" style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '8px', letterSpacing: '0.5px' }}>{meta.titleEn}</div>

                        <Link to="/arts" className="back-pill desktop-only">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                        </Link>
                    </div>
                    <p className="arts-gallery-desc">{meta.descTa}</p>
                    <p className="arts-gallery-desc" style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
                        {meta.descEn}
                    </p>
                </header>

                {loading ? (
                    <div className="arts-skeleton-grid animate-entry">
                        {[200, 280, 180, 240, 200, 260].map((h, i) => (
                            <div key={i} className="arts-skeleton-item" style={{ paddingBottom: `${h}px` }} />
                        ))}
                    </div>
                ) : allItems.length === 0 ? (
                    <div className="arts-empty animate-entry">
                        <p>இன்னும் படைப்புகள் இல்லை. விரைவில் சேர்க்கப்படும்!</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>No artworks yet. Check back soon!</p>
                    </div>
                ) : (
                    <>
                        <div className="arts-grid animate-entry">
                            {visibleItems.map((item) => {
                                const imgs = item.images || [item.image];
                                const isLoading = imageLoading[item.id] !== false;
                                const caption = cleanCaption(item.caption);

                                return (
                                    <div
                                        key={item.id}
                                        className="arts-grid-item"
                                        onClick={() => openLightbox(item)}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={caption || 'View artwork'}
                                        onKeyDown={(e) => e.key === 'Enter' && openLightbox(item)}
                                    >
                                        {isLoading && <div className="arts-img-shimmer" />}
                                        <img
                                            src={item.image}
                                            alt={caption || 'Artwork'}
                                            loading="lazy"
                                            onLoad={() => handleImageLoad(item.id)}
                                            style={{ opacity: isLoading ? 0 : 1 }}
                                        />
                                        {imgs.length > 1 && (
                                            <div className="arts-multi-badge">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <path d="M8 1v2M16 1v2M1 8h2M1 16h2" />
                                                </svg>
                                                {imgs.length}
                                            </div>
                                        )}
                                        <div className="arts-grid-overlay">
                                            {caption && <div className="arts-grid-overlay-text">{caption}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {hasMore && (
                            <div className="arts-show-more-wrapper animate-entry">
                                <button
                                    className="arts-show-more-btn"
                                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                                >
                                    மேலும் காட்டு / Show More
                                    <span className="arts-show-more-count">{remainingCount}</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxItem && (() => {
                const imgs = lightboxItem.images || [lightboxItem.image];
                const caption = cleanCaption(lightboxItem.caption);
                return (
                    <div className="arts-lightbox" onClick={() => setLightboxItem(null)}>
                        <button className="arts-lb-close" onClick={() => setLightboxItem(null)} aria-label="Close">
                            <FiX size={22} />
                        </button>
                        <div className="arts-lb-img-wrapper" onClick={(e) => e.stopPropagation()}>
                            {imgs.length > 1 && lightboxImageIdx > 0 && (
                                <button className="arts-lb-nav prev" onClick={() => setLightboxImageIdx(i => i - 1)}>
                                    <FiChevronLeft size={22} />
                                </button>
                            )}
                            <img
                                src={imgs[lightboxImageIdx]}
                                alt={caption || 'Artwork'}
                                key={lightboxImageIdx}
                            />
                            {imgs.length > 1 && lightboxImageIdx < imgs.length - 1 && (
                                <button className="arts-lb-nav next" onClick={() => setLightboxImageIdx(i => i + 1)}>
                                    <FiChevronRight size={22} />
                                </button>
                            )}
                        </div>
                        <div className="arts-lb-footer" onClick={(e) => e.stopPropagation()}>
                            {caption && <div className="arts-lb-caption">{caption}</div>}
                            <div className="arts-lb-date">{lightboxItem.date}</div>
                            {imgs.length > 1 && (
                                <div className="arts-lb-dots">
                                    {imgs.map((_, i) => (
                                        <button
                                            key={i}
                                            className={`arts-lb-dot ${i === lightboxImageIdx ? 'active' : ''}`}
                                            onClick={() => setLightboxImageIdx(i)}
                                            aria-label={`Image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default ArtsGallery;
