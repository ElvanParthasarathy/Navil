// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import { subscribe, getCached } from '../lib/firebaseCache';
import AdBanner from './AdBanner';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../lib/media';

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
        descTa: 'ஒரு கதை சொல்லட்டா சார்?', descEn: 'My original fiction and short narratives.',
        table: 'short_stories_v2', classification: 'Fiction',
    },
    'diary': {
        title: 'நாளேடு', subtitle: 'Diary',
        descTa: 'என் நாள்களின் நினைவுகளும் பதிவுகளும்', descEn: 'Memories and records of my days.',
        table: 'diary_v2', classification: 'Journal',
    },
    'poems': {
        title: 'செய்யுள்கள்', subtitle: 'Poems',
        descTa: 'என் உள்ளத்தின் உணர்வுகள் கவிதைகளாக...', descEn: 'My heartfelt poems and verses.',
        table: 'poems_v2', classification: 'Poetry',
    },
    'quotes': {
        title: 'பொன்மொழிகள்', subtitle: 'Quotes',
        descTa: 'வாழ்க்கையின் தத்துவங்கள் சுருக்கமாக.', descEn: 'Short philosophical thoughts.',
        table: 'quotes_v2', classification: 'Quote',
    }
};

const LANG_LABELS = { ta: 'தமிழ்', en: 'English', ml: 'മലയാളം', hi: 'Hindi', te: 'Telugu', sa: 'Sanskrit' };
const LANG_SHORT = { ta: 'த', en: 'Aa', ml: 'മ', hi: 'हि', te: 'తె', sa: 'सं' };

/** Analyze variants to produce grouped summary: variants, transliterations, translations */
const analyzePostVersions = (variants: any[]) => {
    if (!variants || variants.length === 0) return null;

    // Collect variant labels (Original, Variant, etc.)
    const variantEntries: { lang: string; label: string }[] = [];
    // Collect unique transliterations across all variants
    const translitLangs = new Set<string>();
    // Collect translations (variants with label === 'Translation')
    const translationEntries: { lang: string }[] = [];

    variants.forEach(v => {
        const lang = v.lang || '';
        if (v.label === 'Translation') {
            translationEntries.push({ lang });
        } else {
            variantEntries.push({ lang, label: v.label || 'Original' });
        }
        // Gather transliterations
        const translits = v.transliterations || {};
        Object.keys(translits).forEach(tl => translitLangs.add(tl));
    });

    return {
        variants: variantEntries,
        transliterations: [...translitLangs],
        translations: translationEntries,
    };
};

const CategoryListView = () => {
    const { category } = useParams();
    const meta = CATEGORY_META[category] || null;

    const [posts, setPosts] = useState(() => getCached(category) || []);
    const [loading, setLoading] = useState(() => !getCached(category));
    const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem(`elvan_${category}_search`) || '');
    const [activeGenre, setActiveGenre] = useState(() => sessionStorage.getItem(`elvan_${category}_genre`) || '');
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = sessionStorage.getItem(`elvan_${category}_page`);
        return saved ? parseInt(saved, 10) : 1;
    });

    useEffect(() => {
        sessionStorage.setItem(`elvan_${category}_search`, searchTerm);
    }, [searchTerm, category]);

    useEffect(() => {
        sessionStorage.setItem(`elvan_${category}_genre`, activeGenre);
    }, [activeGenre, category]);

    useEffect(() => {
        sessionStorage.setItem(`elvan_${category}_page`, currentPage.toString());
    }, [currentPage, category]);

    // Sync state when category changes
    useEffect(() => {
        const cached = getCached(category);
        setPosts(cached || []);
        setLoading(!cached);
        setSearchTerm(sessionStorage.getItem(`elvan_${category}_search`) || '');
        setActiveGenre(sessionStorage.getItem(`elvan_${category}_genre`) || '');
        const savedPage = sessionStorage.getItem(`elvan_${category}_page`);
        setCurrentPage(savedPage ? parseInt(savedPage, 10) : 1);
    }, [category]);

    const ITEMS_PER_PAGE = 5;

    // Subscribe to the shared Firebase cache — no redundant listeners
    useEffect(() => {
        if (!meta) return;
        const cached = getCached(category);
        if (!cached) setLoading(true);

        const unsubscribe = subscribe(category, (data) => {
            setPosts(data || []);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [category, meta]);

    const { setPageTitle, autoThumbnails } = useOutletContext();

    useEffect(() => {
        if (meta?.title) setPageTitle(`${meta.title}|${meta.subtitle || ''}`);
    }, [setPageTitle, meta?.title, meta?.subtitle]);

    // We no longer reset pagination automatically in a useEffect to avoid mount-time resets.
    // Instead, we reset explicitly in the onChange handlers below.

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
    const [isPaginationExpanded, setIsPaginationExpanded] = React.useState(false);
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
            <div className="mobile-hide" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <h1 lang="ta" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0', lineHeight: 1.3, marginBottom: '10px', color: 'var(--text-main)' }}>{meta.title}</h1>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '8px', letterSpacing: '0.5px' }}>{meta.subtitle}</div>
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
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        aria-label={`Search ${meta.title}`}
                    />
                </div>

                <div className="filter-icon-wrapper">
                    <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    <select
                        className="theme-dropdown"
                        value={activeGenre}
                        onChange={(e) => {
                            setActiveGenre(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">வகைகள்</option>
                        {allGenres.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
                {totalPages > 1 && (
                    <button 
                        className={`pagination-toggle-btn ${isPaginationExpanded ? 'active' : ''}`}
                        onClick={() => setIsPaginationExpanded(!isPaginationExpanded)}
                        aria-label="Toggle Pages"
                    >
                        {isPaginationExpanded ? (
                            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : (
                            <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        )}
                    </button>
                )}
            </div>

            {totalPages > 1 && (
                <div className={`pagination-collapsible ${isPaginationExpanded ? 'expanded' : ''}`}>
                    <div className="pagination-collapsible-inner">
                        <div className="pagination-wrapper" style={{ marginTop: '0', paddingTop: '16px', borderTop: 'none', paddingBottom: '16px' }}>
                            <div className="pagination-inner">
                                {(() => {
                                    const pages: (number | string)[] = [];
                                    if (totalPages <= 5) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        pages.push(1);
                                        
                                        if (currentPage > 3) pages.push('...');
                                        
                                        const start = Math.max(2, currentPage - 1);
                                        const end = Math.min(totalPages - 1, currentPage + 1);
                                        
                                        for (let i = start; i <= end; i++) {
                                            if (!pages.includes(i)) pages.push(i);
                                        }
                                        
                                        if (currentPage < totalPages - 2) pages.push('...');
                                        if (!pages.includes(totalPages)) pages.push(totalPages);
                                    }
                                    
                                    return (
                                        <div className={`page-numbers ${pages.length <= 5 ? 'centered' : 'spread'}`}>
                                            {pages.map((num, i) => (
                                                num === '...' ? (
                                                    <span key={`dots-${i}`} className="pagination-dots">...</span>
                                                ) : (
                                                    <button
                                                        key={num}
                                                        className={`page-number-btn ${currentPage === num ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setCurrentPage(num as number);
                                                        }}
                                                    >
                                                        {num}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    );
                                })()}

                                <div className="pagination-nav-pill">
                                    <button
                                        className="page-btn prev-btn"
                                        lang="ta"
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage(prev => Math.max(prev - 1, 1));
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> முந்தை
                                    </button>
                                    <span className="pagination-label">{currentPage} / {totalPages}</span>
                                    <button
                                        className="page-btn next-btn"
                                        lang="ta"
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                        }}
                                    >
                                        அடுத்து <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            <div className="blog-grid-container animate-entry" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px', width: '100%' }}>
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="skeleton-item" style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="skeleton-cover" style={{ height: '200px', background: 'color-mix(in srgb, var(--border-light) 50%, transparent)' }} />
                            <div style={{ padding: '24px' }}>
                                <div className="skeleton-meta" style={{ height: '14px', width: '40%', marginBottom: '16px', background: 'var(--border-light)', borderRadius: '4px' }} />
                                <div className="skeleton-title" style={{ height: '24px', width: '80%', marginBottom: '16px', background: 'var(--border-light)', borderRadius: '6px' }} />
                                <div className="skeleton-lines">
                                    <div className="skeleton-line" style={{ height: '14px', width: '100%', marginBottom: '8px', background: 'color-mix(in srgb, var(--border-light) 40%, transparent)', borderRadius: '4px' }} />
                                    <div className="skeleton-line" style={{ height: '14px', width: '90%', background: 'color-mix(in srgb, var(--border-light) 40%, transparent)', borderRadius: '4px' }} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : currentPosts.length > 0 ? (
                    currentPosts.map((post, index) => {
                        // Support both old content{} model and new variants[] model
                        const variants = post.variants || [];
                        const contentObj = post.content || {};
                        const hasVariants = variants.length > 0;

                        // Get primary title for card display
                        let primaryTitle = post.title || '';
                        let primaryExcerpt = '';
                        let primaryLang = '';
                        if (hasVariants) {
                            primaryLang = variants[0]?.lang || '';
                            primaryTitle = variants[0]?.title || post.title || '';
                            // Strip HTML tags for excerpt from text
                            const textHtml = variants[0]?.text || '';
                            primaryExcerpt = textHtml
                                .replace(/<[^>]+>/g, '')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/&amp;/g, '&')
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .substring(0, 120);
                        } else {
                            primaryLang = Object.keys(contentObj)[0] || '';
                            primaryTitle = contentObj[primaryLang]?.title || post.title || '';
                            primaryExcerpt = contentObj[primaryLang]?.excerpt || '';
                        }

                        // Generate genres/tags array avoiding empty items
                        const genres = [
                            ...(post.tags || []),
                            post.style,
                            post.theme,
                            post.meter
                        ].filter(Boolean);

                        const coverImage = post.cover_image || (autoThumbnails ? `https://picsum.photos/seed/${post.id}/800/400` : null);

                        return (
                            <Link
                                to={`/writings/${category}/${post.slug || post.id}`}
                                key={post.id}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                                className="blog-link-card"
                            >
                                <article className="blog-card-item">
                                    {coverImage && (
                                        <div className="blog-cover-wrapper">
                                            <img src={getOptimizedImage(coverImage, 'thumb')} alt={primaryTitle} loading="lazy" />
                                            {(post.is_pinned || post.pin_type === 'permanent') && (
                                                <span className="blog-featured-badge">✨ Featured</span>
                                            )}
                                            {post.classification && (
                                                <span className={`blog-classification-badge ${post.classification === 'அகம்' ? 'agam' : post.classification === 'புறம்' ? 'puram' : ''}`}>{post.classification}</span>
                                            )}
                                        </div>
                                    )}
                                    <div className="blog-card-content">
                                        {!coverImage && ((post.is_pinned || post.pin_type === 'permanent') || post.classification) && (
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                                {(post.is_pinned || post.pin_type === 'permanent') && (
                                                    <span className="blog-featured-badge inline">✨ Featured</span>
                                                )}
                                                {post.classification && (
                                                    <span className={`blog-classification-badge inline ${post.classification === 'அகம்' ? 'agam' : post.classification === 'புறம்' ? 'puram' : ''}`}>{post.classification}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="blog-meta-minimal">
                                            <span className="meta-date">
                                                {new Date(post.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            {genres.length > 0 && <span className="meta-dot">•</span>}
                                            {genres.slice(0, 2).map((g, i) => (
                                                <React.Fragment key={i}>
                                                    <span>{g}</span>
                                                    {i < Math.min(genres.length, 2) - 1 && <span className="meta-dot">•</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {primaryTitle && <h2 className="blog-title" lang={primaryLang}>{primaryTitle}</h2>}
                                        
                                        {post.series_name && (
                                            <div className="blog-series-badge">Part {post.series_part} of {post.series_name}</div>
                                        )}

                                        {primaryExcerpt && (
                                            <div className="blog-excerpt" lang={primaryLang}>
                                                {primaryExcerpt}...
                                            </div>
                                        )}

                                        {/* Footer area (always bottom aligned) */}
                                        <div className="blog-card-footer">
                                            {/* Included Versions Indicator */}
                                            {hasVariants && (() => {
                                                const info = analyzePostVersions(variants);
                                                if (!info) return null;
                                                const { variants: vEntries, transliterations: tLangs, translations: trEntries } = info;
                                                // Build flat tag list
                                                const tags: { text: string; type: string }[] = [];
                                                vEntries.forEach(ve => {
                                                    const name = LANG_LABELS[ve.lang] || ve.lang;
                                                    const isMain = ve.label === 'Original';
                                                    tags.push({ text: !isMain ? `${name} ${ve.label}` : name, type: isMain ? 'main' : 'v' });
                                                });
                                                trEntries.forEach(te => {
                                                    tags.push({ text: `${LANG_LABELS[te.lang] || te.lang} Translation`, type: 't' });
                                                });
                                                tLangs.forEach(tl => {
                                                    tags.push({ text: `${LANG_LABELS[tl] || tl} Transliteration`, type: 'tl' });
                                                });
                                                return (
                                                    <div className="vs-line">
                                                        {tags.map((t, i) => (
                                                            <React.Fragment key={i}>
                                                                {i > 0 && <span className="vs-sep">·</span>}
                                                                <span className={`vs-tag vs-${t.type}`}>{t.text}</span>
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                );
                                            })()}

                                            <div className="blog-read-more">
                                                {category === 'poems' ? 'செய்யுளை வாசிக்க' :
                                                 category === 'quotes' ? 'பொன்மொழியை வாசிக்க' :
                                                 category === 'stories' ? 'கதையை வாசிக்க' :
                                                 category === 'diary' ? 'நாளேட்டை வாசிக்க' :
                                                 category === 'articles' || category === 'blog' ? 'கட்டுரையை வாசிக்க' :
                                                 'வாசிக்க'} <span className="arrow">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        );
                    })
                    .reduce((acc, item, idx) => {
                        acc.push(item);
                        // Insert a native-looking ad after the 5th item
                        if (idx === 4) {
                            acc.push(
                                <div key="ad-feed" style={{ gridColumn: '1 / -1', padding: '24px 0' }}>
                                    <AdBanner variant="inline" />
                                </div>
                            );
                        }
                        return acc;
                    }, [])
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No content available yet. Check back soon!</p>
                        <AdBanner variant="inline" wrapperStyle={{ padding: '40px 0', marginTop: '20px' }} />
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-wrapper" style={{ marginTop: '40px' }}>
                    <div className="pagination-inner">
                        {(() => {
                            const pages: (number | string)[] = [];
                            if (totalPages <= 5) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                            } else {
                                pages.push(1);
                                
                                if (currentPage > 3) pages.push('...');
                                
                                const start = Math.max(2, currentPage - 1);
                                const end = Math.min(totalPages - 1, currentPage + 1);
                                
                                for (let i = start; i <= end; i++) {
                                    if (!pages.includes(i)) pages.push(i);
                                }
                                
                                if (currentPage < totalPages - 2) pages.push('...');
                                if (!pages.includes(totalPages)) pages.push(totalPages);
                            }
                            
                            return (
                                <div className={`page-numbers ${pages.length <= 5 ? 'centered' : 'spread'}`}>
                                    {pages.map((num, i) => (
                                        num === '...' ? (
                                            <span key={`dots-${i}`} className="pagination-dots">...</span>
                                        ) : (
                                            <button
                                                key={`bottom-${num}`}
                                                className={`page-number-btn ${currentPage === num ? 'active' : ''}`}
                                                onClick={() => {
                                                    setCurrentPage(num as number);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                {num}
                                            </button>
                                        )
                                    ))}
                                </div>
                            );
                        })()}

                        <div className="pagination-nav-pill">
                            <button
                                className="page-btn prev-btn"
                                lang="ta"
                                disabled={currentPage === 1}
                                onClick={() => {
                                    setCurrentPage(prev => Math.max(prev - 1, 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> முந்தை
                            </button>
                            <span className="pagination-label">{currentPage} / {totalPages}</span>
                            <button
                                className="page-btn next-btn"
                                lang="ta"
                                disabled={currentPage === totalPages}
                                onClick={() => {
                                    setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                அடுத்து <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* INJECTED POEM CSS FOR EXACT UI MATCH */}
            <style>{`
                .poem-link-card {
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: block;
                }
                .poem-link-card:active {
                    transform: scale(0.985);
                    transition-duration: 0.1s;
                }

                /* Pagination Styles */
                .pagination-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
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
                .pagination-inner {
                    display: flex;
                    flex-direction: column;
                    align-items: stretch;
                    gap: 16px;
                }
                .page-numbers {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                .page-numbers.spread {
                    justify-content: space-between;
                }
                .page-numbers.centered {
                    justify-content: center;
                    gap: 8px;
                }
                .pagination-dots {
                    color: var(--text-muted);
                    padding: 0 4px;
                    font-weight: 600;
                    opacity: 0.5;
                }
                .page-number-btn {
                    background: var(--bg-panel);
                    color: var(--text-main);
                    border: none;
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
                .page-number-btn.active {
                    background: var(--text-main);
                    color: var(--bg-app);
                    border-color: var(--text-main);
                }
                .pagination-nav-pill {
                    display: flex;
                    align-items: center;
                    width: 100%;
                }
                .page-btn {
                    background: var(--bg-panel);
                    color: var(--text-main);
                    border: none;
                    padding: 8px 18px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    border-radius: 100px;
                    white-space: nowrap;
                }
                .page-btn:hover:not(:disabled) {
                    background: color-mix(in srgb, var(--text-main) 20%, transparent);
                }
                .page-btn.prev-btn {
                    padding-left: 12px;
                }
                .page-btn.next-btn {
                    padding-right: 12px;
                }
                .page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .page-btn:active:not(:disabled) {
                    transform: scale(0.95);
                }
                .pagination-label {
                    flex: 1;
                    text-align: center;
                    padding: 8px 16px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    font-family: "Mukta Malar", sans-serif;
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
                .page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .page-btn:active:not(:disabled) {
                    transform: scale(0.95);
                }

                .blog-card-item {
                    background: var(--bg-card);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .blog-link-card:active .blog-card-item {
                    transform: scale(0.985);
                    background: var(--nav-hover);
                    transition-duration: 0.1s;
                }

                .blog-cover-wrapper {
                    width: 100%;
                    height: 200px;
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-panel);
                }
                .blog-cover-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .blog-link-card:hover .blog-cover-wrapper img {
                    transform: scale(1.05);
                }

                .blog-featured-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: color-mix(in srgb, #f59e0b 20%, rgba(0,0,0,0.7));
                    backdrop-filter: blur(8px);
                    color: #fbbf24;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .blog-classification-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    color: #fff;
                    padding: 4px 12px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .blog-classification-badge.inline {
                    position: static;
                    display: inline-block;
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    color: var(--text-main);
                    backdrop-filter: none;
                    margin-bottom: 12px;
                }
                .blog-featured-badge.inline {
                    position: static;
                    display: inline-block;
                    background: color-mix(in srgb, #f59e0b 10%, transparent);
                    backdrop-filter: none;
                    color: #f59e0b;
                    margin-bottom: 12px;
                }
                .blog-classification-badge.agam {
                    background: color-mix(in srgb, #ec4899 20%, rgba(0,0,0,0.7));
                    color: #fbcfe8;
                }
                .blog-classification-badge.puram {
                    background: color-mix(in srgb, #eab308 20%, rgba(0,0,0,0.7));
                    color: #fef08a;
                }

                .blog-card-content {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .blog-meta-minimal {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .meta-dot {
                    opacity: 0.4;
                }

                .blog-title {
                    font-size: 1.4rem;
                    font-weight: 700;
                    line-height: 1.5; /* Increased for Malayalam script breathing room */
                    color: var(--text-main);
                    margin-bottom: 12px;
                    padding: 4px 0; /* Prevents clipping of tall characters */
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    transition: color 0.2s ease;
                }
                .blog-link-card:hover .blog-title {
                    color: color-mix(in srgb, var(--text-main) 80%, var(--bg-app));
                }

                .blog-series-badge {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 12px;
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    padding: 4px 10px;
                    border-radius: 6px;
                    display: inline-block;
                }

                .blog-excerpt {
                    font-size: 0.95rem;
                    line-height: 1.8; /* Increased for Malayalam/Tamil clarity */
                    color: var(--text-muted);
                    margin-bottom: 20px;
                    padding-bottom: 4px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .blog-card-footer {
                    margin-top: auto;
                    display: flex;
                    flex-direction: column;
                }
                .blog-read-more {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-main);
                    transition: gap 0.2s ease;
                }
                .blog-link-card:hover .blog-read-more {
                    gap: 10px;
                }
                .blog-read-more .arrow {
                    transition: transform 0.2s ease;
                }

                /* ─── Compact Versions Line ─── */
                .vs-line {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 4px;
                    margin-top: 12px;
                    margin-bottom: 14px;
                    font-size: 0.72rem;
                    line-height: 1.4;
                }
                .vs-sep {
                    color: var(--text-muted);
                    opacity: 0.3;
                    font-weight: 600;
                    user-select: none;
                }
                .vs-tag {
                    font-weight: 600;
                    letter-spacing: 0.1px;
                    white-space: nowrap;
                }
                .vs-v, .vs-t, .vs-tl {
                    color: var(--text-muted);
                }
                .vs-main {
                    color: var(--text-main);
                    font-weight: 800;
                }

                .controls-area {
                    margin-bottom: 24px;
                    display: flex;
                    flex-direction: row;
                    gap: 12px;
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
                    font-family: "Mukta Malar", sans-serif;
                }
                .minimal-search input:focus {
                    outline: none;
                }
                .minimal-search input::placeholder {
                    color: var(--text-muted);
                    font-weight: 600;
                    opacity: 0.7;
                }
                
                .filter-icon-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 50%;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                @media (hover: hover) {
                    .filter-icon-wrapper:hover {
                        background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    }
                }
                .filter-icon {
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .filter-icon-wrapper .theme-dropdown {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    opacity: 0;
                    cursor: pointer;
                    padding: 0;
                    min-width: 0;
                    -webkit-appearance: none;
                }

                .pagination-toggle-btn {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 50%;
                    flex-shrink: 0;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                }
                .pagination-toggle-btn.active {
                    background: var(--text-main);
                }
                .pagination-toggle-btn .icon {
                    color: var(--text-muted);
                    pointer-events: none;
                }
                .pagination-toggle-btn.active .icon {
                    color: var(--bg-app);
                }

                .pagination-collapsible {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-bottom: 24px;
                }
                .pagination-collapsible.expanded {
                    grid-template-rows: 1fr;
                }
                .pagination-collapsible-inner {
                    overflow: hidden;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                .pagination-collapsible.expanded .pagination-collapsible-inner {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (min-width: 769px) {
                    .controls-area {
                        gap: 16px;
                    }
                    .filter-icon-wrapper {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        background: color-mix(in srgb, var(--text-main) 6%, transparent);
                        border-radius: 100px;
                        padding: 0 16px;
                        width: auto;
                        height: auto;
                        transition: all 0.3s ease;
                    }
                    .filter-icon-wrapper:hover {
                        background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    }
                    .filter-icon {
                        display: block;
                        color: var(--text-muted);
                        opacity: 0.6;
                    }
                    .filter-icon-wrapper .theme-dropdown {
                        position: static;
                        opacity: 1;
                        padding: 12px 8px 12px 8px;
                        padding-right: 28px;
                        min-width: 90px;
                        width: auto;
                        background: none;
                        border: none;
                        outline: none;
                        box-shadow: none;
                        border-radius: 0;
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: var(--text-muted);
                        font-family: "Mukta Malar", sans-serif;
                        appearance: none;
                        background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23888' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                        background-repeat: no-repeat;
                        background-position: right 4px center;
                        cursor: pointer;
                    }
                    .filter-icon-wrapper .theme-dropdown:focus {
                        color: var(--text-main);
                    }
                }
                .theme-dropdown option {
                    background: var(--bg-app);
                    color: var(--text-main);
                }

                /* Mobile overrides for search */
                @media (max-width: 768px) {
                    .controls-area {
                        gap: 8px;
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
                
                @media (max-width: 768px) {
                    .pagination-wrapper {
                        gap: 20px !important;
                        margin-top: 40px !important;
                        padding-top: 24px !important;
                        padding-bottom: 24px !important;
                        align-items: center;
                        width: 100%;
                    }
                    .pagination-inner {
                        gap: 24px; /* Increased vertical space between rows */
                        width: 100%;
                    }
                    .page-numbers.centered {
                        gap: 12px;
                        flex-wrap: wrap;
                    }
                    .page-numbers.spread {
                        gap: 8px;
                        justify-content: center;
                        flex-wrap: wrap; /* Allow wrapping to prevent horizontal cutting */
                    }
                    .pagination-nav-pill {
                        justify-content: center;
                        gap: 10px;
                    }
                    .page-btn {
                        padding: 12px 18px; /* Larger tap target */
                        font-size: 0.85rem;
                        flex: 1;
                        justify-content: center;
                        max-width: 140px;
                    }
                    .page-number-btn {
                        width: 42px !important; /* Larger touch target */
                        height: 42px !important;
                        font-size: 1rem !important;
                    }
                    .pagination-dots {
                        font-size: 0.9rem;
                        padding: 0 4px;
                    }
                    .pagination-label {
                        font-size: 0.8rem;
                        padding: 8px 12px;
                        flex: 0 1 auto;
                        white-space: nowrap;
                    }
                    .controls-area {
                        padding: 0 4px;
                        gap: 10px;
                    }
                    .minimal-search {
                        padding: 0 16px;
                    }
                }
            `}</style>
        </div >
    );
};

export default CategoryListView;

