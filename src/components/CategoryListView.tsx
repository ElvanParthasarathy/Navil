// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';
import AdBanner from './AdBanner';
import { Helmet } from 'react-helmet-async';

const CATEGORY_META = {
    'blog': {
        title: 'வலைப்பதிவுகள்', subtitle: 'Blog Posts',
        descTa: 'என் அன்றாடத் தேடல்களும் வாழ்வியல் பகிர்வுகளும்.', descEn: 'My daily reflections and personal updates.',
        table: 'blog_posts', classification: 'General',
    },
    'articles': {
        title: 'கட்டுரைகள்', subtitle: 'Articles',
        descTa: 'பல்வேறு பொதுத் தலைப்புகளிலான விரிவான பார்வைகள்.', descEn: 'Detailed perspectives on general topics.',
        table: 'articles_v2', classification: 'Article',
    },
    'stories': {
        title: 'சிறுகதைகள்', subtitle: 'Short Stories',
        descTa: 'என் கற்பனையில் உருவான சிறு புனைவுகள்.', descEn: 'My original fiction and short narratives.',
        table: 'short_stories_v2', classification: 'Fiction',
    },
    'diary': {
        title: 'நாளேடு', subtitle: 'Diary',
        descTa: 'என் நாள்களின் நினைவுகளும் பதிவுகளும்', descEn: 'Memories and records of my days.',
        table: 'diary_v2', classification: 'Journal',
    }
};

const LANG_LABELS = { ta: 'தமிழ்', en: 'English', ml: 'മலயாளம்', hi: 'Hindi', te: 'Telugu', sa: 'Sanskrit' };

const CategoryListView = () => {
    const { category } = useParams();
    const meta = CATEGORY_META[category] || null;

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeGenre, setActiveGenre] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (!meta) return;
        setLoading(true);
        const catRef = ref(db, category);
        const unsubscribe = onValue(catRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataObj = snapshot.val();
                const dataArray = Object.entries(dataObj).map(([slug, val]) => {
                    const item = { ...val, id: slug };
                    if (item.variants) {
                        if (!Array.isArray(item.variants)) item.variants = Object.values(item.variants);
                        item.variants.forEach(v => {
                            if (v.transliterations?._empty) delete v.transliterations._empty;
                            if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                            if (!v.transliterations) v.transliterations = {};
                            if (!v.titleTransliterations) v.titleTransliterations = {};
                        });
                    }
                    return item;
                });
                
                dataArray.sort((a, b) => {
                    if (a.display_order !== b.display_order) return (a.display_order || 0) - (b.display_order || 0);
                    const da = new Date(a.publish_date || a.date || 0);
                    const dbDate = new Date(b.publish_date || b.date || 0);
                    return dbDate - da;
                });
                setPosts(dataArray);
            } else {
                setPosts([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase fetch error:", error);
            setLoading(false);
        });

        setCurrentPage(1);
        return () => unsubscribe();
    }, [category, meta]);

    const { setPageTitle } = useOutletContext();

    useEffect(() => {
        if (meta?.title) setPageTitle(meta.title);
    }, [setPageTitle, meta?.title]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // Reset pagination when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeGenre]);

    // Compute all unique genres/tags for the filter bar
    const allGenres = React.useMemo(() => {
        const genres = new Set();
        posts.forEach(post => {
            if (post.tags) {
                const tagArray = typeof post.tags === 'string' ? post.tags.split(',') : post.tags;
                tagArray.forEach(t => genres.add(t.trim()));
            }
            if (post.style) genres.add(post.style);
            if (post.theme) genres.add(post.theme);
            if (post.meter) genres.add(post.meter);
            if (post.classification) genres.add(post.classification);
        });
        return Array.from(genres).filter(Boolean).sort();
    }, [posts]);

    const filteredPosts = React.useMemo(() => {
        return posts.filter(post => {
            const hasVariants = post.variants && post.variants.length > 0;
            const primaryVariant = hasVariants ? post.variants[0] : null;

            const title = (primaryVariant?.title || post.title || '').toLowerCase();
            const author = (primaryVariant?.author || '').toLowerCase();
            const body = (primaryVariant?.text || '').toLowerCase();
            const series = (post.series_name || '').toLowerCase();

            const postGenres = [
                ...(Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',') : [])).map(t => t.trim()),
                post.style,
                post.theme,
                post.meter,
                post.classification
            ].filter(Boolean);

            const s = searchTerm.toLowerCase();
            const matchesSearch = !s ||
                title.includes(s) ||
                author.includes(s) ||
                body.includes(s) ||
                series.includes(s) ||
                postGenres.some(g => g.toLowerCase().includes(s));

            const matchesGenre = !activeGenre || postGenres.includes(activeGenre);

            return matchesSearch && matchesGenre;
        });
    }, [searchTerm, activeGenre, posts]);

    // Pagination logic
    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const currentPosts = filteredPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (!meta) {
        return (
            <div className="page-view fadeIn" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <h2>Category Not Found</h2>
                <Link to="/writings" style={{ color: 'var(--text-muted)' }}>Return to Writings</Link>
            </div>
        );
    }

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px 100px' }}>
            <Helmet>
                <title>{meta.subtitle} | Elvan Parthasarathy</title>
                <meta name="description" content={meta.descEn} />
                <link rel="canonical" href={`https://elvanparthasarathy.vercel.app/writings/${category}`} />
            </Helmet>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="mobile-hide">
                    <h1 lang="ta" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0', lineHeight: 1.3, marginBottom: '10px', color: 'var(--text-main)' }}>{meta.title}</h1>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '8px', letterSpacing: '0.5px' }}>{meta.subtitle}</div>
                <div className="header-desc">
                    <p lang="ta" style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{meta.descTa}</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '2px' }}>{meta.descEn}</p>
                </div>

                <Link to="/writings" className="back-pill desktop-only">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </div>

            {/* Filters & Search Sync */}
            <div className="controls-area" style={{ maxWidth: '800px' }}>
                <div className="minimal-search">
                    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="தேடுக..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label={`Search ${meta.title}`}
                    />
                </div>

                {allGenres.length > 0 && (
                    <select
                        className="theme-dropdown"
                        value={activeGenre}
                        onChange={(e) => setActiveGenre(e.target.value)}
                    >
                        <option value="">All Genres</option>
                        {allGenres.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-wrapper" style={{ marginTop: 0, paddingTop: 0, marginBottom: '32px', borderTop: 'none', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px' }}>
                    <button
                        className="page-btn"
                        lang="ta"
                        disabled={currentPage === 1}
                        onClick={() => {
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> முன்பு
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                className={`page-number-btn ${currentPage === num ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentPage(num);
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <button
                        className="page-btn"
                        lang="ta"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        }}
                    >
                        அடுத்து <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gap: '40px', maxWidth: '800px' }}>
                {loading ? (
                    <div className="skeleton-loader">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="skeleton-item">
                                <div className="skeleton-badge" />
                                <div className="skeleton-title" />
                                <div className="skeleton-meta" />
                                <div className="skeleton-lines">
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line" />
                                    <div className="skeleton-line" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : currentPosts.length > 0 ? (
                    currentPosts.map((post, index) => {
                        // Support both old content{} model and new variants[] model
                        const variants = post.variants || [];
                        const contentObj = post.content || {};
                        const hasVariants = variants.length > 0;

                        // Get primary title for card display
                        let primaryTitle = '';
                        let primaryExcerpt = '';
                        let primaryLang = '';
                        if (hasVariants) {
                            primaryLang = variants[0]?.lang || '';
                            primaryTitle = variants[0]?.title || '';
                            // Strip HTML tags for excerpt from text
                            const textHtml = variants[0]?.text || '';
                            primaryExcerpt = textHtml.replace(/<[^>]+>/g, '').substring(0, 150);
                        } else {
                            primaryLang = Object.keys(contentObj)[0] || '';
                            primaryTitle = contentObj[primaryLang]?.title || '';
                            primaryExcerpt = contentObj[primaryLang]?.excerpt || '';
                        }

                        // Generate genres/tags array avoiding empty items
                        const genres = [
                            ...(post.tags || []),
                            post.style,
                            post.theme,
                            post.meter
                        ].filter(Boolean);

                        const displayIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                        return (
                            <Link
                                to={`/writings/${category}/${post.slug || post.id}`}
                                key={post.id}
                                style={{
                                    textDecoration: 'none',
                                    display: 'block',
                                    color: 'inherit'
                                }}
                                className="poem-link-card"
                            >
                                <article className="poem-item">
                                    {(post.pin_type === 'permanent' || post.classification || meta.classification) && (
                                        <div className="poem-badges-wrapper">
                                            {post.pin_type === 'permanent' && (
                                                <div className="pinned-badge">
                                                    <span>✨</span> Featured
                                                </div>
                                            )}
                                            {(post.classification || meta.classification) && (
                                                <span className="classification-badge">
                                                    {post.classification || meta.classification}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="poem-header">
                                        <span className="poem-number">{displayIndex}</span>
                                        {primaryTitle && <h2 className="poem-title" lang={primaryLang}>{primaryTitle}</h2>}
                                    </div>

                                    <div className="poem-meta-minimal">
                                        <span className="meta-date">
                                            {new Date(post.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        {genres.length > 0 && <div className="meta-separator" />}
                                        {genres.map((g, i) => (
                                            <React.Fragment key={i}>
                                                <span>{g}</span>
                                                {i < genres.length - 1 && <div className="meta-separator" />}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {post.series_name && (
                                        <div className="poem-dedication">Part {post.series_part} of {post.series_name}</div>
                                    )}

                                    {primaryExcerpt && (
                                        <div className="poem-text-content" lang={primaryLang} style={{ marginTop: '16px', color: 'var(--text-muted)' }}>
                                            {primaryExcerpt}...
                                        </div>
                                    )}

                                    <div className="read-more-wrapper">
                                        <div className="read-more-pill">
                                            <span lang="ta" style={{ fontFamily: '"Mukta Malar", sans-serif' }}>மேலும் வாசிக்க</span>
                                            <span style={{ margin: '0 6px', opacity: 0.4 }}>/</span>
                                            Read article
                                            <span className="arrow">→</span>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        );
                    })
                    .reduce((acc, item, idx) => {
                        acc.push(item);
                        // Insert a native-looking ad after the 3rd item
                        if (idx === 2) {
                            acc.push(
                                <AdBanner key="ad-feed" variant="inline" wrapperStyle={{ padding: '48px 0' }} />
                            );
                        }
                        return acc;
                    }, [])
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No content available yet. Check back soon!</p>
                        <AdBanner variant="inline" wrapperStyle={{ padding: '40px 0', marginTop: '20px' }} />
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-wrapper">
                    <button
                        className="page-btn"
                        lang="ta"
                        disabled={currentPage === 1}
                        onClick={() => {
                            setCurrentPage(prev => Math.max(prev - 1, 1));
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> முன்பு
                    </button>

                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                className={`page-number-btn ${currentPage === num ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentPage(num);
                                }}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <button
                        className="page-btn"
                        lang="ta"
                        disabled={currentPage === totalPages}
                        onClick={() => {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        }}
                    >
                        அடுத்து <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                </div>
            )}
            {/* INJECTED POEM CSS FOR EXACT UI MATCH */}
            <style>{`
                .poem-link-card {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: block;
                }
                .poem-link-card:hover {
                    transform: translateY(-4px);
                }
                .poem-link-card:active {
                    transform: translateY(0) scale(0.98);
                }
                .poem-link-card:hover .poem-number {
                    background: var(--text-main);
                    color: var(--bg-app);
                    box-shadow: 0 0 20px color-mix(in srgb, var(--text-main) 50%, transparent);
                }
                .poem-link-card:hover .poem-title {
                    color: var(--text-main);
                    text-shadow: 0 0 15px color-mix(in srgb, var(--text-main) 30%, transparent);
                }

                /* Pagination Styles */
                .pagination-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 24px;
                    margin-top: 32px;
                    padding-top: 32px;
                    border-top: 1px solid var(--border-light);
                    margin-bottom: 20px;
                }
                .page-info {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .page-numbers {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .page-number-btn {
                    background: transparent;
                    color: var(--text-muted);
                    border: 1px solid var(--border-light);
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .page-number-btn:hover {
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    color: var(--text-main);
                    border-color: var(--text-main);
                }
                .page-number-btn.active {
                    background: var(--text-main);
                    color: var(--bg-app);
                    border-color: var(--text-main);
                    box-shadow: 0 4px 15px color-mix(in srgb, var(--text-main) 30%, transparent);
                }
                .page-btn {
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    color: var(--text-main);
                    border: none;
                    padding: 8px 20px;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .page-btn:hover:not(:disabled) {
                    background: var(--text-main);
                    color: var(--bg-app);
                    transform: translateY(-2px);
                }
                .page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .page-btn:active:not(:disabled) {
                    transform: scale(0.95);
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
                .read-more-wrapper {
                    margin-top: 32px;
                    display: flex;
                }
                .read-more-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 20px;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 100px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                }
                .read-more-pill .arrow {
                    margin-left: 6px;
                    transition: transform 0.3s ease;
                }
                .poem-link-card:hover .read-more-pill {
                    background: var(--text-main);
                    color: var(--bg-app);
                    box-shadow: 0 4px 15px color-mix(in srgb, var(--text-main) 30%, transparent);
                }
                .poem-link-card:hover .read-more-pill .arrow {
                    opacity: 1;
                }

                /* Pagination */
                .pagination-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 24px;
                    margin-top: 32px;
                    padding-top: 32px;
                    border-top: 1px solid var(--border-light);
                }
                .page-info {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .page-btn {
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    color: var(--text-main);
                    border: none;
                    padding: 8px 20px;
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .page-btn:hover:not(:disabled) {
                    background: var(--text-main);
                    color: var(--bg-app);
                    transform: translateY(-2px);
                }
                .page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .page-btn:active:not(:disabled) {
                    transform: scale(0.95);
                }

                .poem-item {
                    border-top: 1px solid var(--border-light);
                    padding: 48px 0;
                }
                /* First item has no top border so it aligns perfectly with the header box */
                .poem-item:first-child {
                    border-top: none;
                    padding-top: 0;
                }

                /* Filters & Search */
                .controls-area {
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: row;
                    gap: 16px;
                    align-items: center;
                }
                .minimal-search {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 100px;
                    padding: 0 18px;
                    transition: background 0.3s ease;
                }
                .minimal-search:focus-within {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
                }
                .search-icon {
                    flex-shrink: 0;
                    color: var(--text-muted);
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }
                .minimal-search:focus-within .search-icon {
                    opacity: 1;
                }
                .minimal-search input {
                    width: 100%;
                    padding: 12px 0;
                    font-size: 0.95rem;
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    border-radius: 0;
                }
                .minimal-search input:focus {
                    outline: none;
                }
                .minimal-search input::placeholder {
                    color: color-mix(in srgb, var(--text-muted) 40%, transparent);
                    font-weight: 300;
                }
                
                .theme-dropdown {
                    padding: 12px 18px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border: none;
                    border-radius: 100px;
                    color: var(--text-muted);
                    cursor: pointer;
                    min-width: 140px;
                    outline: none;
                    transition: background 0.3s ease, color 0.3s;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 16px center;
                    padding-right: 36px;
                }
                .theme-dropdown:focus {
                    background-color: color-mix(in srgb, var(--text-main) 12%, transparent);
                    color: var(--text-main);
                }
                .theme-dropdown option {
                    background: var(--bg-app);
                    color: var(--text-main);
                }

                /* Mobile overrides for search */
                @media (max-width: 768px) {
                    .controls-area {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .theme-dropdown {
                        width: 100%;
                    }
                    .minimal-search input {
                        font-size: 1.05rem;
                    }
                }
                .poem-item:first-child {
                    border-top: none;
                    padding-top: 0;
                }

                /* Skeleton Shimmer Loader */
                .skeleton-loader {
                    display: flex;
                    flex-direction: column;
                    gap: 60px;
                    padding: 10px 0;
                }
                .skeleton-item {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    animation: skeletonPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .skeleton-item:nth-child(2) { animation-delay: 0.15s; }
                .skeleton-item:nth-child(3) { animation-delay: 0.3s; }
                @keyframes skeletonPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .skeleton-badge {
                    width: 90px;
                    height: 28px;
                    border-radius: 99px;
                    background: var(--border-light);
                }
                .skeleton-title {
                    width: 55%;
                    height: 28px;
                    border-radius: 6px;
                    background: var(--border-light);
                }
                .skeleton-meta {
                    width: 35%;
                    height: 14px;
                    border-radius: 4px;
                    background: var(--border-light);
                }
                .skeleton-line {
                    height: 14px;
                    border-radius: 4px;
                    background: var(--border-light);
                }
                .skeleton-line:nth-child(1) { width: 100%; }
                .skeleton-line:nth-child(2) { width: 92%; }
                .skeleton-line:nth-child(3) { width: 78%; }
                .skeleton-line:nth-child(4) { width: 60%; }
                .skeleton-lines {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 6px;
                }

                .poem-badges-wrapper {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .pinned-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #d4af37;
                }
                .classification-badge {
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    padding: 3px 10px;
                    border: none;
                    border-radius: 99px;
                    background: color-mix(in srgb, currentColor 15%, transparent);
                    white-space: nowrap;
                    color: var(--text-muted);
                }
                .poem-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 8px;
                    gap: 12px;
                }
                .poem-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    border: none;
                    border-radius: 50%;
                    flex-shrink: 0;
                    font-variant-numeric: tabular-nums;
                    padding: 0 4px;
                }
                .poem-title {
                    font-family: inherit;
                    font-size: 1.8rem;
                    font-weight: 700;
                    letter-spacing: -1px;
                    color: var(--text-main);
                    line-height: 1.2;
                    margin: 0;
                }
                .poem-meta-minimal {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                }
                .meta-separator {
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: color-mix(in srgb, var(--text-muted) 30%, transparent);
                }
                .meta-date {
                    color: var(--text-main);
                    font-weight: 500;
                }
                .poem-dedication {
                    margin: 16px 0;
                    font-size: 1rem;
                    color: var(--text-muted);
                    font-style: italic;
                    border-left: 2px solid var(--border-light);
                    padding-left: 16px;
                }
                .poem-text-content {
                    font-family: inherit; 
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--text-main);
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                
                @media (max-width: 600px) {
                    .pagination-wrapper {
                        gap: 8px;
                        margin-top: 24px;
                        padding-top: 24px;
                        justify-content: space-between;
                        width: 100%;
                    }
                    .page-btn {
                        padding: 8px 12px;
                        font-size: 0.75rem;
                    }
                    .page-number-btn {
                        width: 44px !important;
                        height: 44px !important;
                        font-size: 1rem !important;
                    }
                }
            `}</style>
        </div >
    );
};

export default CategoryListView;

