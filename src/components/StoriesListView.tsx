// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useOutletContext, useParams } from 'react-router-dom';
import { subscribe, getCached } from '../lib/firebaseCache';
import AdBanner from './AdBanner';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../lib/media';
import MobileTopBar from './MobileTopBar';
import { FloatingBackButton } from './FloatingBackButton';

const LANG_LABELS = { ta: 'தமிழ்', en: 'English', ml: 'മലയാളം', hi: 'Hindi', te: 'Telugu', sa: 'Sanskrit' };

const analyzePostVersions = (variants: any[]) => {
    if (!variants || variants.length === 0) return null;

    const variantEntries: { lang: string; label: string }[] = [];
    const translitLangs = new Set<string>();
    const translationEntries: { lang: string }[] = [];

    variants.forEach(v => {
        const lang = v.lang || '';
        if (v.label === 'Translation') {
            translationEntries.push({ lang });
        } else {
            variantEntries.push({ lang, label: v.label || 'Original' });
        }
        const translits = v.transliterations || {};
        Object.keys(translits).forEach(tl => translitLangs.add(tl));
    });

    return {
        variants: variantEntries,
        transliterations: [...translitLangs],
        translations: translationEntries,
    };
};

const StoriesListView = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [posts, setPosts] = useState(() => getCached('stories') || []);
    const [seriesList, setSeriesList] = useState(() => getCached('series') || []);
    const [loading, setLoading] = useState(() => !getCached('stories'));
    const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('elvan_stories_search') || '');
    const [activeGenre, setActiveGenre] = useState(() => sessionStorage.getItem('elvan_stories_genre') || '');
    const [currentPage, setCurrentPage] = useState(() => {
        const urlPage = searchParams.get('page');
        if (urlPage) return parseInt(urlPage, 10);
        const saved = sessionStorage.getItem('elvan_stories_page');
        return saved ? parseInt(saved, 10) : 1;
    });

    const handlePageChange = (targetPage: number) => {
        setCurrentPage(targetPage);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('page', targetPage.toString());
        setSearchParams(nextParams, { preventScrollReset: true });
        
        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    };

    const handleFilterResetPage = () => {
        setCurrentPage(1);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('page', '1');
        setSearchParams(nextParams, { replace: true, preventScrollReset: true });
    };

    useEffect(() => {
        const urlPage = searchParams.get('page');
        if (urlPage) {
            const parsed = parseInt(urlPage, 10);
            if (parsed !== currentPage) {
                setCurrentPage(parsed);
            }
        } else {
            if (currentPage !== 1) {
                setCurrentPage(1);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        sessionStorage.setItem('elvan_stories_search', searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        sessionStorage.setItem('elvan_stories_genre', activeGenre);
    }, [activeGenre]);

    useEffect(() => {
        sessionStorage.setItem('elvan_stories_page', currentPage.toString());
    }, [currentPage]);

    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const cached = getCached('stories');
        if (!cached) setLoading(true);

        const unsubscribeStories = subscribe('stories', (data) => {
            setPosts(data || []);
            setLoading(false);
        });
        
        const unsubscribeSeries = subscribe('series', (data) => {
            setSeriesList(data || []);
        });

        return () => {
            unsubscribeStories();
            unsubscribeSeries();
        };
    }, []);

    const { autoThumbnails } = useOutletContext() as any;

    const allGenres = React.useMemo(() => {
        const genres = new Set();
        posts.forEach(post => {
            if (post.tags) {
                const tagArray = typeof post.tags === 'string' ? post.tags.split(',') : post.tags;
                tagArray.forEach(t => {
                    const trimmed = t.trim();
                    if (trimmed) genres.add(trimmed);
                });
            }
            if (post.style) genres.add(post.style);
            if (post.theme) genres.add(post.theme);
            if (post.meter) genres.add(post.meter);
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
                postGenres.some(g => g.toLowerCase().includes(s)) ||
                (post.variants?.some(v =>
                    (v.text || '').toLowerCase().includes(s) ||
                    (v.title || '').toLowerCase().includes(s) ||
                    (v.author || '').toLowerCase().includes(s) ||
                    Object.values(v.transliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.titleTransliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.authorTransliterations || {}).some(t => (t || '').toLowerCase().includes(s))
                ));

            const matchesGenre = !activeGenre || postGenres.includes(activeGenre);

            return matchesSearch && matchesGenre;
        });
    }, [searchTerm, activeGenre, posts]);

    const groupedItems = React.useMemo(() => {
        const standalonePosts: any[] = [];
        const seriesMap = new Map<string, any[]>();

        posts.forEach(post => {
            const seriesName = post.series_name?.trim();
            if (!seriesName) {
                standalonePosts.push(post);
            } else {
                if (!seriesMap.has(seriesName)) {
                    seriesMap.set(seriesName, []);
                }
                seriesMap.get(seriesName)!.push(post);
            }
        });

        const s = searchTerm.toLowerCase();
        const activeGenreLower = activeGenre.toLowerCase();

        const matchPost = (post: any) => {
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

            const matchesSearch = !s ||
                title.includes(s) ||
                author.includes(s) ||
                body.includes(s) ||
                series.includes(s) ||
                postGenres.some(g => g.toLowerCase().includes(s)) ||
                (post.variants?.some(v =>
                    (v.text || '').toLowerCase().includes(s) ||
                    (v.title || '').toLowerCase().includes(s) ||
                    (v.author || '').toLowerCase().includes(s) ||
                    Object.values(v.transliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.titleTransliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.authorTransliterations || {}).some(t => (t || '').toLowerCase().includes(s))
                ));

            const matchesGenre = !activeGenre || postGenres.some(g => g.toLowerCase() === activeGenreLower);

            return matchesSearch && matchesGenre;
        };

        const resultItems: any[] = [];

        standalonePosts.forEach(post => {
            if (matchPost(post)) {
                resultItems.push({
                    type: 'standalone' as const,
                    id: post.id,
                    publishDate: post.publish_date,
                    post
                });
            }
        });

        seriesMap.forEach((parts, seriesName) => {
            const hasMatchingPart = parts.some(part => matchPost(part));
            if (hasMatchingPart) {
                const sortedParts = [...parts].sort((a, b) => {
                    const partA = parseInt(a.series_part, 10) || 0;
                    const partB = parseInt(b.series_part, 10) || 0;
                    return partA - partB;
                });

                const latestPublishDate = parts.reduce((latest, current) => {
                    return new Date(current.publish_date) > new Date(latest) ? current.publish_date : latest;
                }, parts[0].publish_date);
                
                // Find matching master series data robustly
                const normalizedSeriesName = seriesName.trim().toLowerCase();
                const masterSeries = seriesList.find(s => {
                    if (!s.title) return false;
                    const sTitle = s.title.trim().toLowerCase();
                    return sTitle === normalizedSeriesName || 
                           (s.id && s.id.trim().toLowerCase() === normalizedSeriesName) ||
                           sTitle === normalizedSeriesName.replace(/ /g, '-');
                }) || {};

                resultItems.push({
                    type: 'series' as const,
                    id: `series-${seriesName}`,
                    seriesName: masterSeries.title || seriesName,
                    masterCover: masterSeries.coverImage || masterSeries.cover_image || null,
                    masterDescription: masterSeries.description || null,
                    parts: sortedParts,
                    publishDate: latestPublishDate
                });
            }
        });

        resultItems.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

        return resultItems;
    }, [posts, filteredPosts, searchTerm, activeGenre, seriesList]);

    const [isPaginationExpanded, setIsPaginationExpanded] = React.useState(false);
    const totalPages = Math.ceil(groupedItems.length / ITEMS_PER_PAGE);
    const currentItems = groupedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const { seriesId } = useParams();

    const expandedSeriesData = React.useMemo(() => {
        if (!seriesId) return null;
        return groupedItems.find(item => item.type === 'series' && item.id === `series-${seriesId}`) || null;
    }, [seriesId, groupedItems]);

    React.useEffect(() => {
        if (!seriesId) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') navigate('/writings/stories');
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [seriesId, navigate]);

    const isDedicatedSeriesView = !!(seriesId && expandedSeriesData && expandedSeriesData.type === 'series');

    return (
        <>
            {isDedicatedSeriesView ? (
                <MobileTopBar 
                    title={expandedSeriesData.seriesName} 
                    showBack={true} 
                    onBack={() => navigate('/writings/stories')} 
                />
            ) : (
                <MobileTopBar 
                    title="சிறுகதைகள்|short stories" 
                    showBack={true} 
                    backUrl="/writings" 
                />
            )}
            <div 
                key={seriesId || 'list'}
                className="page-view animate-entry" 
                style={isDedicatedSeriesView ? { width: '100%', padding: '0 0 100px' } : { maxWidth: '1200px', margin: '0 auto', padding: '10px 20px 100px' }}
            >
                {isDedicatedSeriesView ? (
                    (() => {
                        const sd = expandedSeriesData;
                        const sdParts = sd.parts;
                        const sdFirst = sdParts[0];
                        const sdCover = sd.masterCover || sdParts.find(p => p.cover_image)?.cover_image || null;
                        const sdClassification = sdParts.find(p => p.classification)?.classification || null;
                        const sdFirstVariant = sdFirst?.variants?.[0];
                        const fallbackExcerpt = sdFirstVariant?.text
                            ? sdFirstVariant.text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').substring(0, 300)
                            : '';
                        const sdExcerpt = sd.masterDescription || fallbackExcerpt;
                        const sdGenresSet = new Set();
                        sdParts.forEach(p => {
                            [...(p.tags || []), p.style, p.theme, p.meter].filter(Boolean).forEach(g => sdGenresSet.add(g));
                        });
                        const sdGenres = Array.from(sdGenresSet);

                        return (
                            <>
                                <Helmet>
                                    <title>{sd.seriesName} | Short Stories</title>
                                    <meta name="description" content={sdExcerpt} />
                                    <link rel="canonical" href="https://elvanparthasarathy.vercel.app/writings/stories" />
                                </Helmet>

                                <div className="tv-hero-bg">
                                    {sdCover && <img src={getOptimizedImage(sdCover, 'medium')} alt="" />}
                                    <div className="tv-hero-bg-overlay" />
                                </div>

                                <FloatingBackButton to="/writings/stories" />

                                <div className="tv-container">
                                    <div className="tv-hero-section">
                                        <div className="tv-hero-left">
                                            <div className="tv-hero-cover-wrapper">
                                                {sdCover ? (
                                                    <img src={getOptimizedImage(sdCover, 'medium')} alt={sd.seriesName} />
                                                ) : (
                                                    <div className="tv-cover-placeholder">
                                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="tv-hero-right">
                                            <h1 className="tv-series-title">{sd.seriesName}</h1>

                                            <div className="tv-meta-row">
                                                <span className="tv-ep-count-badge">{sdParts.length} அத்தியாயங்கள்</span>
                                                {sdClassification && (
                                                    <span className={`tv-class-badge ${sdClassification === 'அகம்' ? 'agam' : sdClassification === 'புறம்' ? 'puram' : ''}`}>
                                                        {sdClassification}
                                                    </span>
                                                )}
                                                {sdGenres.slice(0, 3).map((g, i) => (
                                                    <span key={i} className="tv-genre-badge">{g}</span>
                                                ))}
                                            </div>

                                            {sdExcerpt && <p className="tv-synopsis">{sdExcerpt}...</p>}

                                            <div className="tv-actions">
                                                <Link
                                                    to={`/writings/stories/${sdFirst.slug || sdFirst.id}`}
                                                    className="tv-primary-btn"
                                                    state={{ fromQuickLink: true }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginTop: '2px' }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0px', lineHeight: 1.2 }}>
                                                        <span style={{ fontSize: '1em' }}>வாசிக்கத் தொடங்கு</span>
                                                        <span style={{ fontSize: '0.7em', opacity: 0.7, fontWeight: 500, letterSpacing: '0.2px' }}>Start reading (Part 1)</span>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tv-episodes-section">
                                        <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingLeft: '24px' }}>
                                            <h3 className="tv-section-title" style={{ marginBottom: '4px', paddingBottom: 0, borderBottom: 'none' }}>அத்தியாயங்கள்</h3>
                                            <span style={{ fontSize: '0.95em', opacity: 0.6, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'none' }}>chapters</span>
                                        </div>
                                        <div className="tv-episodes-grid">
                                            {sdParts.map((part, idx) => {
                                                const partTitle = part.variants?.[0]?.title || part.title || `Part ${part.series_part}`;
                                                const partDate = part.publish_date
                                                    ? new Date(part.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '';
                                                const partExcerpt = part.variants?.[0]?.text
                                                    ? part.variants[0].text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 150)
                                                    : '';
                                                const partNumStr = String(part.series_part || idx + 1).padStart(2, '0');

                                                return (
                                                    <Link
                                                        key={part.id}
                                                        to={`/writings/stories/${part.slug || part.id}`}
                                                        className="tv-ep-card"
                                                        state={{ fromQuickLink: true }}
                                                    >
                                                        <div className="tv-ep-number-bg">{partNumStr}</div>
                                                        <div className="tv-ep-card-body">
                                                            <div className="tv-ep-meta">
                                                                <span className="tv-ep-num-pill">பகுதி {part.series_part || idx + 1}</span>
                                                                {partDate && <span className="tv-ep-date">{partDate}</span>}
                                                            </div>
                                                            <h4 className="tv-ep-title">{partTitle}</h4>
                                                            {partExcerpt && <p className="tv-ep-excerpt">{partExcerpt}...</p>}
                                                            <div className="tv-ep-footer">
                                                                <span>வாசிக்கத் தொடங்கு</span>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()
                ) : (
                    <>
                        <Helmet>
                            <title>சிறுகதைகள் | Short Stories</title>
                            <meta name="description" content="My original fiction and short narratives." />
                            <link rel="canonical" href="https://elvanparthasarathy.vercel.app/writings/stories" />
                        </Helmet>
                        
                        <FloatingBackButton to="/writings" />

                        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h1 lang="ta" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '0', lineHeight: 1.3, marginBottom: '10px', color: 'var(--text-main)' }}>சிறுகதைகள்</h1>
                                <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '8px', letterSpacing: '0.5px' }}>Short Stories</div>
                            </div>
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
                                        handleFilterResetPage();
                                    }}
                                    aria-label="Search Short Stories"
                                />
                            </div>

                            <div className="filter-icon-wrapper">
                                <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                <select
                                    className="theme-dropdown"
                                    value={activeGenre}
                                    onChange={(e) => {
                                        setActiveGenre(e.target.value);
                                        handleFilterResetPage();
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
                                        <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                                    )}
                                </button>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className={`pagination-collapsible ${isPaginationExpanded ? 'expanded' : ''}`}>
                                <div className="pagination-collapsible-inner">
                                    <div className="pagination-wrapper" style={{ marginTop: '0', borderTop: 'none' }}>
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
                                                                        handlePageChange(num as number);
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
                                                        handlePageChange(Math.max(currentPage - 1, 1));
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
                                                        handlePageChange(Math.min(currentPage + 1, totalPages));
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

                        <div className="blog-grid-container animate-entry">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="skeleton-item" style={{ background: 'var(--bg-card)', borderRadius: '16px', overflow: 'hidden' }}>
                                        <div className="skeleton-cover" style={{ aspectRatio: '16 / 9', background: 'color-mix(in srgb, var(--border-light) 50%, transparent)' }} />
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
                            ) : currentItems.length > 0 ? (
                                currentItems.map((item) => {
                                    if (item.type === 'series') {
                                        const parts = item.parts;
                                        const firstPart = parts[0];
                                        const seriesTitle = item.seriesName;
                                        const coverImage = item.masterCover || parts.find(p => p.cover_image)?.cover_image || null;
                                        const classification = parts.find(p => p.classification)?.classification || null;

                                        let primaryExcerpt = item.masterDescription;
                                        if (!primaryExcerpt) {
                                            const firstHasVariants = firstPart.variants && firstPart.variants.length > 0;
                                            if (firstHasVariants) {
                                                const textHtml = firstPart.variants[0]?.text || '';
                                                primaryExcerpt = textHtml
                                                    .replace(/<[^>]+>/g, '')
                                                    .replace(/&nbsp;/g, ' ')
                                                    .replace(/&amp;/g, '&')
                                                    .replace(/&lt;/g, '<')
                                                    .replace(/&gt;/g, '>')
                                                    .substring(0, 120);
                                            } else {
                                                const firstContent = firstPart.content || {};
                                                const primaryLang = Object.keys(firstContent)[0] || '';
                                                primaryExcerpt = firstContent[primaryLang]?.excerpt || '';
                                            }
                                        }

                                        const genresSet = new Set();
                                        parts.forEach(p => {
                                            [...(p.tags || []), p.style, p.theme, p.meter].filter(Boolean).forEach(g => genresSet.add(g));
                                        });
                                        const genres = Array.from(genresSet);

                                        return (
                                            <div
                                                key={item.id}
                                                className="blog-link-card"
                                                onClick={() => {
                                                    navigate(`/writings/stories/series/${item.seriesName}`);
                                                    window.scrollTo(0, 0);
                                                }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        navigate(`/writings/stories/series/${item.seriesName}`);
                                                        window.scrollTo(0, 0);
                                                    }
                                                }}
                                                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                                            >
                                                <article className="blog-card-item">
                                                    {coverImage ? (
                                                        <div className="blog-cover-wrapper">
                                                            <img src={getOptimizedImage(coverImage, 'thumb')} alt={seriesTitle} loading="lazy" />
                                                            {classification && (
                                                                <span className={`blog-classification-badge ${classification === 'அகம்' ? 'agam' : classification === 'புறம்' ? 'puram' : ''}`}>{classification}</span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        classification && (
                                                            <div style={{ display: 'flex', gap: '8px', padding: '24px 24px 0', flexWrap: 'wrap' }}>
                                                                <span className={`blog-classification-badge inline ${classification === 'அகம்' ? 'agam' : classification === 'புறம்' ? 'puram' : ''}`}>{classification}</span>
                                                            </div>
                                                        )
                                                    )}
                                                    <div className="blog-card-content" style={!coverImage && classification ? { paddingTop: '12px' } : {}}>
                                                        <div className="blog-meta-minimal">
                                                            <span className="meta-date" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                                                                தொடர் ({parts.length} அத்தியாயங்கள்)
                                                            </span>
                                                            {genres.length > 0 && <span className="meta-dot">•</span>}
                                                            {genres.slice(0, 2).map((g, i) => (
                                                                <React.Fragment key={i}>
                                                                    <span>{g}</span>
                                                                    {i < Math.min(genres.length, 2) - 1 && <span className="meta-dot">•</span>}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>

                                                        {seriesTitle && <h2 className="blog-title">{seriesTitle}</h2>}

                                                        {primaryExcerpt && (
                                                            <div className="blog-excerpt">
                                                                {primaryExcerpt}...
                                                            </div>
                                                        )}

                                                        <div className="blog-card-footer">
                                                            <div className="blog-read-more" style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>
                                                                தொடரைத் திறக்க <span className="arrow">→</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            </div>
                                        );
                                    }

                                    const post = item.post;
                                    const variants = post.variants || [];
                                    const contentObj = post.content || {};
                                    const hasVariants = variants.length > 0;

                                    let primaryTitle = post.title || '';
                                    let primaryExcerpt = '';
                                    let primaryLang = '';
                                    if (hasVariants) {
                                        primaryLang = variants[0]?.lang || '';
                                        primaryTitle = variants[0]?.title || post.title || '';
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

                                    const genres = [
                                        ...(post.tags || []),
                                        post.style,
                                        post.theme,
                                        post.meter
                                    ].filter(Boolean);

                                    const coverImage = post.cover_image || null;

                                    return (
                                        <Link
                                            to={`/writings/stories/${post.slug || post.id}`}
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

                                                    <div className="blog-card-footer">
                                                        {hasVariants && (() => {
                                                            const info = analyzePostVersions(variants);
                                                            if (!info) return null;
                                                            const { variants: vEntries, transliterations: tLangs, translations: trEntries } = info;
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
                                                            கதையை வாசிக்க <span className="arrow">→</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    );
                                })
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px', minWidth: 0, overflow: 'hidden' }}>
                                    <p>No content available yet. Check back soon!</p>
                                    <AdBanner variant="inline" wrapperStyle={{ padding: '40px 0', marginTop: '20px' }} />
                                </div>
                            )}
                        </div>

                        {!loading && currentItems.length > 0 && (
                            <div style={{ padding: '24px 0' }}>
                                <AdBanner variant="inline" />
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination-wrapper" style={{ marginTop: '40px', paddingTop: '16px' }}>
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
                                                                handlePageChange(num as number);
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
                                                handlePageChange(Math.max(currentPage - 1, 1));
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
                                                handlePageChange(Math.min(currentPage + 1, totalPages));
                                            }}
                                        >
                                            அடுத்து <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ─── Android TV Dedicated Series View ─── */}
                <style>{`
                    .tv-series-view {
                        position: relative;
                        width: 100%;
                        overflow: hidden;
                        color: var(--text-main);
                    }

                    /* Ambient Blurred Backdrop */
                    .tv-hero-bg {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 550px;
                        overflow: hidden;
                        z-index: 0;
                        pointer-events: none;
                    }
                    .tv-hero-bg img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        filter: blur(80px);
                        opacity: 0.16;
                    }
                    [data-theme='light'] .tv-hero-bg img {
                        opacity: 0.08;
                    }
                    .tv-hero-bg-overlay {
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(180deg, transparent 0%, var(--bg-app) 100%);
                    }

                    .tv-container {
                        position: relative;
                        z-index: 2;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 10px 20px 100px;
                    }

                    /* Two Column TV Landing Layout */
                    .tv-hero-section {
                        display: flex;
                        gap: 40px;
                        align-items: flex-start;
                        margin-bottom: 48px;
                    }
                    .tv-hero-left {
                        flex-shrink: 0;
                        width: 280px;
                    }
                    .tv-hero-cover-wrapper {
                        width: 100%;
                        aspect-ratio: 2 / 3;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
                        background: var(--bg-panel);
                        border: 1px solid color-mix(in srgb, var(--border-light) 40%, transparent);
                    }
                    [data-theme='light'] .tv-hero-cover-wrapper {
                        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
                    }
                    .tv-hero-cover-wrapper img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .tv-cover-placeholder {
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                        color: rgba(255,255,255,0.2);
                    }

                    .tv-hero-right {
                        flex: 1;
                        padding-top: 10px;
                    }
                    .tv-show-tagline {
                        font-size: 0.8rem;
                        font-weight: 800;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                        color: color-mix(in srgb, var(--text-main) 60%, transparent);
                        display: block;
                        margin-bottom: 8px;
                    }
                    .tv-series-title {
                        font-size: 2.5rem;
                        font-weight: 800;
                        line-height: 1.2;
                        margin: 0 0 16px;
                        color: var(--text-main);
                        font-family: 'Mukta Malar', sans-serif;
                    }
                    .tv-meta-row {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 20px;
                    }
                    .tv-ep-count-badge, .tv-class-badge, .tv-genre-badge {
                        padding: 6px 16px;
                        border-radius: 100px;
                        font-size: 0.82rem;
                        font-weight: 700;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        line-height: 1;
                    }
                    .tv-ep-count-badge {
                        background: var(--text-main);
                        color: var(--bg-app);
                        font-weight: 800;
                    }
                    .tv-class-badge, .tv-genre-badge {
                        background: color-mix(in srgb, var(--text-main) 8%, transparent);
                        color: var(--text-muted);
                    }
                    .tv-class-badge.agam { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
                    .tv-class-badge.puram { background: rgba(234, 179, 8, 0.15); color: #eab308; }

                    .tv-synopsis {
                        font-size: 1.05rem;
                        line-height: 1.8;
                        color: var(--text-muted);
                        margin: 0 0 32px;
                        max-width: 680px;
                    }
                    .tv-actions {
                        display: flex;
                        gap: 12px;
                    }
                    .tv-primary-btn {
                        display: inline-flex;
                        align-items: center;
                        gap: 12px;
                        background: var(--text-main);
                        color: var(--bg-app);
                        padding: 10px 24px;
                        border-radius: 50px;
                        font-size: 0.9rem;
                        font-weight: 700;
                        text-decoration: none;
                        box-shadow: 0 4px 14px color-mix(in srgb, var(--text-main) 20%, transparent);
                        transition: all 0.2s ease-out;
                    }
                    .tv-primary-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 6px 20px color-mix(in srgb, var(--text-main) 30%, transparent);
                    }
                    .tv-primary-btn:active {
                        transform: translateY(1px);
                    }

                    /* Sleek TV Episode Section */
                    .tv-episodes-section {
                        margin-top: 56px;
                    }
                    .tv-section-title {
                        font-size: 1.4rem;
                        font-weight: 800;
                        color: var(--text-main);
                        margin-bottom: 24px;
                        padding-bottom: 12px;
                        border-bottom: 1px solid var(--border-light);
                    }
                    .tv-episodes-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }
                    .tv-ep-card {
                        position: relative;
                        background: var(--bg-card);
                        border: none;
                        border-radius: 24px;
                        overflow: hidden;
                        display: flex;
                        text-decoration: none;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        cursor: pointer;
                        height: 100%;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    }
                    [data-theme='dark'] .tv-ep-card {
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                        background: linear-gradient(145deg, #141414, color-mix(in srgb, #141414, transparent 35%));
                    }
                    .tv-ep-card:active {
                        transform: scale(0.985) !important;
                        background: var(--nav-hover) !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                        transition: transform 0.1s ease-out, background 0.1s ease-out;
                    }
                    .tv-ep-number-bg {
                        position: absolute;
                        bottom: -15px;
                        right: 0px;
                        font-size: 5.5rem;
                        font-weight: 900;
                        color: color-mix(in srgb, var(--text-main) 3%, transparent);
                        user-select: none;
                        line-height: 1;
                        z-index: 0;
                        font-family: system-ui, sans-serif;
                        transition: color 0.3s ease;
                    }
                    .tv-ep-card:hover .tv-ep-number-bg {
                        color: color-mix(in srgb, var(--text-main) 6%, transparent);
                    }
                    .tv-ep-card-body {
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                        z-index: 1;
                    }
                    .tv-ep-meta {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 10px;
                    }
                    .tv-ep-num-pill {
                        font-size: 0.72rem;
                        font-weight: 800;
                        text-transform: uppercase;
                        background: color-mix(in srgb, var(--text-main) 8%, transparent);
                        color: var(--text-main);
                        padding: 3px 10px;
                        border-radius: 50px;
                        letter-spacing: 0.5px;
                    }
                    .tv-ep-date {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: var(--text-muted);
                        text-transform: uppercase;
                    }
                    .tv-ep-title {
                        font-size: 1.15rem;
                        font-weight: 700;
                        color: var(--text-main);
                        margin: 0 0 10px;
                        line-height: 1.4;
                    }
                    .tv-ep-excerpt {
                        font-size: 0.88rem;
                        line-height: 1.6;
                        color: var(--text-muted);
                        margin: 0 0 20px;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .tv-ep-footer {
                        margin-top: auto;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 0.8rem;
                        font-weight: 800;
                        color: var(--text-main);
                    }
                    .tv-ep-footer svg {
                        transition: transform 0.2s ease;
                    }
                    .tv-ep-card:hover .tv-ep-footer svg {
                        transform: translateX(4px);
                    }

                    /* Responsive Mobile overrides for TV View */
                    @media (max-width: 900px) {
                        .tv-episodes-grid {
                            grid-template-columns: 1fr;
                            gap: 16px;
                        }
                    }
                    @media (max-width: 768px) {
                        .tv-container {
                            padding: 16px 16px 100px;
                        }
                        .tv-hero-section {
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                            gap: 24px;
                            margin-bottom: 32px;
                        }
                        .tv-hero-left {
                            width: 200px;
                        }
                        .tv-hero-right {
                            width: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                        }
                        .tv-series-title {
                            font-size: 1.85rem;
                        }
                        .tv-meta-row {
                            justify-content: center;
                        }
                        .tv-synopsis {
                            font-size: 0.95rem;
                            line-height: 1.7;
                            margin-bottom: 24px;
                        }
                        .tv-actions {
                            width: 100%;
                            justify-content: center;
                        }
                        .tv-primary-btn {
                            width: auto;
                            justify-content: center;
                            padding: 12px 32px;
                            font-size: 1rem;
                        }
                        .tv-ep-card-body {
                            padding: 20px;
                        }
                        .tv-episodes-section {
                            margin-top: 40px;
                        }
                    }

                    /* Styles from CategoryListView.tsx */
                    .blog-link-card {
                        text-decoration: none;
                        color: inherit;
                    }
                    .blog-grid-container {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 24px;
                        width: 100%;
                        margin-top: 20px;
                    }
                    .stories-netflix-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 28px !important;
                    }
                    .blog-card-item {
                        background: linear-gradient(145deg, var(--bg-card), color-mix(in srgb, var(--bg-card), transparent 20%));
                        border-radius: 16px;
                        overflow: hidden;
                        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    }
                    [data-theme='dark'] .blog-card-item {
                        background: linear-gradient(145deg, #141414, color-mix(in srgb, #141414, transparent 35%));
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    }
                    .blog-link-card:active .blog-card-item {
                        transform: scale(0.985);
                        background: var(--nav-hover);
                        transition-duration: 0.1s;
                    }
                    .blog-cover-wrapper {
                        width: 100%;
                        aspect-ratio: 16 / 9;
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
                        line-height: 1.5;
                        color: var(--text-main);
                        margin-bottom: 12px;
                        padding: 4px 0;
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
                        line-height: 1.8;
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

                    /* Cinematic card for series */
                    .nfx-series-card {
                        position: relative;
                        border-radius: 16px;
                        overflow: hidden;
                        cursor: pointer;
                        background: #0a0a0a;
                        transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
                    }
                    [data-theme='light'] .nfx-series-card {
                        background: #111;
                    }
                    .nfx-series-card:hover {
                        transform: scale(1.03) translateY(-4px);
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
                    }
                    .nfx-series-card:active {
                        transform: scale(0.98);
                        transition-duration: 0.1s;
                    }
                    .nfx-cover {
                        position: relative;
                        width: 100%;
                        aspect-ratio: 16 / 10;
                        overflow: hidden;
                    }
                    .nfx-cover img {
                        width: 100%; height: 100%;
                        object-fit: cover;
                        transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    }
                    .nfx-series-card:hover .nfx-cover img {
                        transform: scale(1.08);
                    }
                    .nfx-cover-placeholder {
                        width: 100%; height: 100%;
                        display: flex; align-items: center; justify-content: center;
                        background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                        color: rgba(255,255,255,0.2);
                    }
                    .nfx-cover-gradient {
                        position: absolute;
                        bottom: 0; left: 0; right: 0;
                        height: 70%;
                        background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 40%, transparent 100%);
                        pointer-events: none;
                    }
                    .nfx-cover-info {
                        position: absolute;
                        bottom: 0; left: 0; right: 0;
                        padding: 20px 20px 16px;
                        z-index: 2;
                    }
                    .nfx-title {
                        font-size: 1.35rem;
                        font-weight: 800;
                        color: #fff;
                        line-height: 1.3;
                        margin: 0 0 8px;
                        text-shadow: 0 2px 8px rgba(0,0,0,0.5);
                    }
                    .nfx-meta-row {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 6px;
                    }
                    .nfx-ep-badge {
                        background: rgba(255,255,255,0.15);
                        backdrop-filter: blur(10px);
                        color: #fff;
                        padding: 3px 10px;
                        border-radius: 100px;
                        font-size: 0.72rem;
                        font-weight: 700;
                        letter-spacing: 0.3px;
                    }
                    .nfx-class-pill {
                        padding: 3px 10px;
                        border-radius: 100px;
                        font-size: 0.72rem;
                        font-weight: 700;
                        background: rgba(255,255,255,0.1);
                        color: rgba(255,255,255,0.8);
                    }
                    .nfx-class-pill.agam { background: rgba(236, 72, 153, 0.3); color: #fbcfe8; }
                    .nfx-class-pill.puram { background: rgba(234, 179, 8, 0.3); color: #fef08a; }
                    .nfx-genre-pill {
                        padding: 3px 10px;
                        border-radius: 100px;
                        font-size: 0.68rem;
                        font-weight: 600;
                        background: rgba(255,255,255,0.08);
                        color: rgba(255,255,255,0.6);
                        letter-spacing: 0.3px;
                    }
                    .nfx-hover-overlay {
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        opacity: 0;
                        transition: opacity 0.35s ease;
                        z-index: 3;
                    }
                    .nfx-series-card:hover .nfx-hover-overlay {
                        opacity: 1;
                    }
                    .nfx-play-btn {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        background: rgba(255,255,255,0.95);
                        color: #111;
                        padding: 12px 28px;
                        border-radius: 100px;
                        font-size: 0.9rem;
                        font-weight: 800;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        transform: scale(0.9);
                        transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    }
                    .nfx-series-card:hover .nfx-play-btn {
                        transform: scale(1);
                    }
                    .nfx-card-excerpt {
                        padding: 14px 20px 18px;
                        font-size: 0.85rem;
                        line-height: 1.6;
                        color: rgba(255,255,255,0.5);
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    /* Search and Filters */
                    .controls-area {
                        margin-top: 8px;
                        margin-bottom: 8px;
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
                        transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin-bottom 0.25s ease;
                        margin-bottom: 0;
                    }
                    .pagination-collapsible.expanded {
                        grid-template-rows: 1fr;
                        margin-bottom: 24px;
                    }
                    .pagination-collapsible-inner {
                        overflow: hidden;
                        opacity: 0;
                        transform: translateY(-10px);
                        transition: opacity 0.25s ease, transform 0.25s ease;
                    }
                    .pagination-collapsible.expanded .pagination-collapsible-inner {
                        opacity: 1;
                        transform: translateY(0);
                    }

                    @media (min-width: 769px) {
                        .blog-grid-container {
                            margin-top: 28px;
                        }
                        .pagination-collapsible {
                            padding-top: 16px;
                        }
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

                    /* Skeleton Shim */
                    .skeleton-item {
                        display: flex;
                        flex-direction: column;
                        gap: 14px;
                        animation: skeletonPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                    @keyframes skeletonPulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.4; }
                    }
                    .skeleton-cover {
                        aspect-ratio: 16 / 9;
                        background: color-mix(in srgb, var(--border-light) 50%, transparent);
                    }

                    /* Pagination */
                    .pagination-wrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        margin-top: 32px;
                        padding-top: 0;
                        border-top: 1px solid var(--border-light);
                        margin-bottom: 20px;
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
                        .blog-grid-container {
                            grid-template-columns: 1fr;
                            gap: 20px;
                        }
                        .pagination-wrapper {
                            gap: 20px !important;
                            margin-top: 40px !important;
                            padding-left: 0 !important;
                            padding-right: 0 !important;
                            padding-bottom: 0 !important;
                            align-items: center;
                            width: 100%;
                        }
                        .pagination-inner {
                            gap: 24px;
                            width: 100%;
                        }
                        .page-numbers.centered {
                            gap: 12px;
                            flex-wrap: wrap;
                        }
                        .page-numbers.spread {
                            gap: 8px;
                            justify-content: center;
                            flex-wrap: wrap;
                        }
                        .pagination-nav-pill {
                            justify-content: center;
                            gap: 10px;
                        }
                        .page-btn {
                            padding: 12px 18px;
                            font-size: 0.85rem;
                            flex: 1;
                            justify-content: center;
                            max-width: 140px;
                        }
                        .page-number-btn {
                            width: 42px !important;
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
            </div>
        </>
    );
};

export default StoriesListView;
