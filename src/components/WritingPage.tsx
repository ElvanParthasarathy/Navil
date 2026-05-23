// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { subscribe, getCached } from '../lib/firebaseCache';
import AdBanner from './AdBanner';
import { Helmet } from 'react-helmet-async';

// Friendly bilingual genre/theme labels (shared default)
const DEFAULT_THEME_LABELS = {
    'Longing': 'Longing — ஏக்கம்',
    'Admiration': 'Admiration — வியப்பு',
    'Philosophy': 'Philosophy — தத்துவம்',
    'Happiness': 'Happiness — மகிழ்ச்சி',
    'Strength': 'Strength — வலிமை',
    'Cosmos': 'Cosmos — விண்வெளி',
    'Love': 'Love — அன்பு',
    'Nature': 'Nature — இயற்கை',
    'War': 'War — போர்',
    'Identity': 'Identity — அடையாளம்',
    'Hope': 'Hope — நம்பிக்கை',
    'Loss': 'Loss — இழப்பு',
    'Life': 'Life — வாழ்க்கை',
    'Spirituality': 'Spirituality — ஆன்மீகம்',
    'Journey': 'Journey — பயணம்',
    'Perspective': 'Perspective — பார்வை',
};

// Classification colors — preset for known types, auto-generated for custom
const CLASSIFICATION_COLORS = {
    'அகம்': '#e8a0bf',   // pink
    'புறம்': '#d4af37',   // gold
};

// Generate a consistent HSL color from any string
const getClassColor = (name) => {
    if (!name) return '#888';
    if (CLASSIFICATION_COLORS[name]) return CLASSIFICATION_COLORS[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = ((hash % 360) + 360) % 360;
    return `hsl(${hue}, 55%, 60%)`;
};

const LANG_LABELS = { en: 'Aa', ta: 'த', ml: 'മ', hi: 'हि', te: 'తె', sa: 'सं' };
const LANG_NAMES = { ta: 'தமிழ்', en: 'English', ml: 'മലയാളം', hi: 'Hindi', te: 'Telugu', sa: 'Sanskrit' };

// Convert text to renderable HTML — handles both plain text and TipTap's br-based HTML
const textToHtml = (raw) => {
    if (!raw) return '';
    // If it's plain text (no HTML tags), convert newlines
    if (!/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) {
        return raw.split('\n').map(line => 
            line.trim() ? `<p>${line}</p>` : '<p style="height:1.2em"></p>'
        ).join('');
    }
    // For TipTap HTML: split <br> inside <p> tags into separate <p> elements
    // so each line break creates a proper block and blank lines are visible
    let html = raw.replace(/<p>([\s\S]*?)<\/p>/gi, (match, content) => {
        const lines = content.split(/<br\s*\/?>/gi);
        return lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '<p style="height:1.2em"></p>';
            return `<p>${trimmed}</p>`;
        }).join('');
    });
    return html;
};

// Sleek, interactive collapsible zone for Urai and Notes that transitions smoothly
const PoemInfoZone = ({ urai, notes, hint, isUraiNotesLocked, password, isPrivate }) => {
    const [activeSection, setActiveSection] = React.useState(null);
    const [displaySection, setDisplaySection] = React.useState(null);
    const [isUnlocked, setIsUnlocked] = React.useState(false);
    const [pwdAttempt, setPwdAttempt] = React.useState('');
    const [pwdError, setPwdError] = React.useState(false);

    if (isPrivate) return null;
    if (!urai && !notes) return null;

    // Locked only when lock toggle is on AND password exists
    const isLocked = !!isUraiNotesLocked && !!password;

    const toggleSection = (section) => {
        setActiveSection(prev => prev === section ? null : section);
        setPwdError(false);
        setPwdAttempt('');
    };

    const handleUnlock = (e) => {
        e.preventDefault();
        if (pwdAttempt.trim() === password) {
            setIsUnlocked(true);
            setPwdError(false);
        } else {
            setPwdError(true);
        }
    };

    const displayUrai = isLocked ? (isUnlocked ? urai : null) : urai;
    const displayNotes = isLocked ? (isUnlocked ? notes : null) : notes;

    React.useEffect(() => {
        if (activeSection) {
            setDisplaySection(activeSection);
        }
    }, [activeSection]);

    return (
        <div className="info-pills-container">
            <div className="info-pills-row">
                {urai && (
                    <button 
                        className={`info-pill-btn ${activeSection === 'urai' ? 'active' : ''}`}
                        onClick={() => toggleSection('urai')}
                    >
                        <span>உரை · Urai</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {activeSection === 'urai' ? <line x1="5" y1="12" x2="19" y2="12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>}
                        </svg>
                    </button>
                )}
                {notes && (
                    <button 
                        className={`info-pill-btn ${activeSection === 'notes' ? 'active' : ''}`}
                        onClick={() => toggleSection('notes')}
                    >
                        <span>Notes</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {isLocked ? (
                                    isUnlocked ? <path d="M7 11V7a5 5 0 0 1 10 0v4 M5 11h14v10H5z" /> : <path d="M7 11V7a5 5 0 0 1 9.9-1 M5 11h14v10H5z" />
                                ) : (
                                    activeSection === 'notes' ? <line x1="5" y1="12" x2="19" y2="12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                                )}
                        </svg>
                    </button>
                )}
            </div>

            <div className={`info-pill-content-wrapper ${activeSection ? 'expanded' : ''}`}>
                <div className="info-pill-content-inner">
                    <div className="info-pill-box">
                        <div className="info-pill-box-header">
                            {displaySection === 'urai' ? 'விளக்கவுரை · Commentary' : 'Additional Notes'}
                        </div>
                        
                        {isLocked && !isUnlocked ? (
                            <div className="info-content animate-fade" style={{ textAlign: 'center', padding: '20px 0' }}>
                                <form onSubmit={handleUnlock} className="easter-egg-lock">
                                    <div style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                                        This section is locked. Enter password to view.
                                        {hint && <div style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8 }}>Hint: {hint}</div>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <input 
                                            type="password"
                                            value={pwdAttempt}
                                            onChange={(e) => { setPwdAttempt(e.target.value); setPwdError(false); }}
                                            placeholder="Password..."
                                            className="pwd-input"
                                            style={{ padding: '8px 16px', borderRadius: '20px', border: pwdError ? '1px solid #ff4444' : '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-main)', outline: 'none' }}
                                        />
                                        <button type="submit" style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', background: 'var(--text-main)', color: 'var(--bg-app)', cursor: 'pointer', fontWeight: 'bold' }}>
                                            Unlock
                                        </button>
                                    </div>
                                    {pwdError && <div style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '8px' }}>Incorrect password.</div>}
                                </form>
                            </div>
                        ) : (
                            <>
                                {displaySection === 'urai' && displayUrai && (
                                    <div 
                                        className={`info-content urai animate-fade ${!activeSection ? 'hiding' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: textToHtml(displayUrai) }}
                                    />
                                )}
                                {displaySection === 'notes' && displayNotes && (
                                    <div 
                                        className={`info-content animate-fade ${!activeSection ? 'hiding' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: textToHtml(displayNotes) }}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Shared display component for Poems and Quotes pages.
 *
 * @param {string}  pageTitle             – e.g. "Poems" or "Quotes"
 * @param {string}  pageSubtitle          – description line
 * @param {string}  tableName             – Supabase table name
 * @param {Array}   legacyData            – fallback JSON data
 * @param {Object}  [themeLabels]         – override bilingual labels
 * @param {Object}  [classificationLabels] – override classification badges
 */
const WritingPage = ({
    pageTitle,
    pageTitleTamil,
    pageSubtitle,
    pageSubtitleEnglish,
    tableName,
    legacyData,
    themeLabels = DEFAULT_THEME_LABELS,
    classificationLabels,
}) => {
    const [data, setData] = useState(() => {
        const cached = getCached(tableName);
        return cached ? cached.map(p => ({
            ...p,
            isPinned: p.is_pinned,
            pinExpiresAt: p.pin_expires_at,
            pinType: p.pin_type || 'auto',
            variants: p.variants || [],
        })) : [];
    });
    const [isLoading, setIsLoading] = useState(() => !getCached(tableName));
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = sessionStorage.getItem(`elvan_${tableName}_page`);
        return saved ? parseInt(saved, 10) : 1;
    });
    const [activeGenre, setActiveGenre] = useState(() => sessionStorage.getItem(`elvan_${tableName}_genre`) || 'All');
    const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem(`elvan_${tableName}_search`) || '');
    const [variantTranslStates, setVariantTranslStates] = useState({});

    const ITEMS_PER_PAGE = (tableName === 'poems' || tableName === 'quotes') ? 6 : 5;

    const { setPageTitle } = useOutletContext();

    useEffect(() => {
        setPageTitle(`${pageTitleTamil || pageTitle}|${pageTitle}`);
    }, [setPageTitle, pageTitle, pageTitleTamil]);

    useEffect(() => {
        sessionStorage.setItem(`elvan_${tableName}_search`, searchTerm);
    }, [searchTerm, tableName]);

    useEffect(() => {
        sessionStorage.setItem(`elvan_${tableName}_genre`, activeGenre);
    }, [activeGenre, tableName]);

    useEffect(() => {
        sessionStorage.setItem(`elvan_${tableName}_page`, currentPage.toString());
    }, [currentPage, tableName]);

    // Subscribe to the shared Firebase cache
    useEffect(() => {
        const unsubscribe = subscribe(tableName, (rows) => {
            if (!rows) { setData([]); setIsLoading(false); return; }
            const mapped = rows.map(p => ({
                ...p,
                isPinned: p.is_pinned,
                pinExpiresAt: p.pin_expires_at,
                pinType: p.pin_type || 'auto',
                variants: p.variants || [],
            }));
            setData(mapped);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [tableName]);

    // Normalize data: backward compat for legacy quotes that use `tag` instead of `theme`/`title`
    const normalizedData = data.map(item => ({
        ...item,
        title: item.title || item.variants?.[0]?.title || '',
        theme: item.theme || item.tag || '',
    }));

    const rawPosts = [...normalizedData].sort((a, b) => {
        const orderA = typeof a.display_order === 'number' ? a.display_order : 999999;
        const orderB = typeof b.display_order === 'number' ? b.display_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        if (tableName === 'stories') {
            const seriesA = a.series_name || '';
            const seriesB = b.series_name || '';
            if (seriesA !== seriesB) return seriesA.localeCompare(seriesB);
            const partA = parseInt(a.series_part) || 0;
            const partB = parseInt(b.series_part) || 0;
            return partA - partB; // Ascending order
        }
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

    // Tags to exclude from the filter dropdown (badge classifications, language variants, meta-tags)
    const EXCLUDED_TAGS = new Set([
        'அகம்', 'புறம்',           // Tamil badge classifications
        'അകം', 'പുറം',             // Malayalam equivalents
        'agam', 'puram',           // English transliterations
        'തമിഴാളം', 'തമிഴாழம்',     // Meta-tags
    ].map(s => s.toLowerCase()));

    const isExcludedTag = (tag) => {
        if (!tag) return true;
        return EXCLUDED_TAGS.has(tag.trim().toLowerCase());
    };

    // Collect only clean theme tags for the filter dropdown (exclude badge classifications)
    const existingClassifications = new Set();
    rawPosts.forEach(p => {
        // Do NOT add p.classification — those are badge-only values (அகம்/புறம்)
        if (p.tags && Array.isArray(p.tags)) {
            p.tags.forEach(tag => {
                if (tag && typeof tag === 'string' && !isExcludedTag(tag)) {
                    existingClassifications.add(tag.trim());
                }
            });
        }
        // Also include theme if present (legacy field)
        if (p.theme && typeof p.theme === 'string' && !isExcludedTag(p.theme)) {
            existingClassifications.add(p.theme.trim());
        }
    });
    const filterOptions = [...existingClassifications].sort();


    const toggleVariantTransl = (variantKey, lang) => {
        setVariantTranslStates(prev => ({
            ...prev,
            [variantKey]: prev[variantKey] === lang ? null : lang
        }));
    };

    const filteredPosts = useMemo(() => {
        const filtered = rawPosts.filter(post => {
            const s = searchTerm.toLowerCase();
            const matchesSearch = !s ||
                (post.title || '').toLowerCase().includes(s) ||
                (post.author || '').toLowerCase().includes(s) ||
                (post.classification || '').toLowerCase().includes(s) ||
                (post.tags?.some(tag => (tag || '').toLowerCase().includes(s))) ||
                (post.variants?.some(v =>
                    (v.text || '').toLowerCase().includes(s) ||
                    (v.title || '').toLowerCase().includes(s) ||
                    (v.author || '').toLowerCase().includes(s) ||
                    Object.values(v.transliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.titleTransliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.authorTransliterations || {}).some(t => (t || '').toLowerCase().includes(s))
                ));
            const matchesGenre = activeGenre === 'All' || 
                post.classification === activeGenre || 
                (post.tags && post.tags.includes(activeGenre));
            
            // Hide private/draft posts from the public view
            const isPublic = !post.is_private;

            return matchesSearch && matchesGenre && isPublic;
        });
        return filtered.sort((a, b) => {
            const orderA = typeof a.display_order === 'number' ? a.display_order : 999999;
            const orderB = typeof b.display_order === 'number' ? b.display_order : 999999;
            if (orderA !== orderB) return orderA - orderB;

            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA;
        });
    }, [searchTerm, activeGenre, rawPosts]);

    // Pinned logic — supports both auto (with expiry) and permanent pins
    const now = new Date();
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const isAPinned = a.isPinned && (
            a.pinType === 'permanent' ||
            !a.pinExpiresAt ||
            new Date(a.pinExpiresAt) > now
        );
        const isBPinned = b.isPinned && (
            b.pinType === 'permanent' ||
            !b.pinExpiresAt ||
            new Date(b.pinExpiresAt) > now
        );

        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;
        return 0;
    });

    // Pagination logic
    const [isPaginationExpanded, setIsPaginationExpanded] = React.useState(false);

    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const currentPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);



    return (
        <div className="writings-page-wrapper">
            <Helmet>
                <title>{pageTitleTamil || pageTitle} | {pageTitle}</title>
                <meta name="description" content={pageSubtitleEnglish || pageSubtitle} />
                <link rel="canonical" href={`https://elvanparthasarathy.vercel.app/writings/${tableName}`} />
            </Helmet>
            <style>{`
                /* =========================================
                   MINIMAL, KINETIC, TOUCH-OPTIMIZED UI
                   ========================================= */
                .poems-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 10px 20px 100px;
                }

                .poems-nav {
                    margin-bottom: 12px;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                }
                .poems-header-area {
                    flex: 1;
                }
                .back-link {
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
                    transition: background 0.3s ease, color 0.3s ease;
                    flex-shrink: 0;
                    white-space: nowrap;
                    align-self: flex-start;
                    margin-top: 8px;
                }
                .back-link:hover {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    color: var(--text-main);
                }
                .back-link:active {
                    transform: scale(0.95);
                    background: color-mix(in srgb, var(--text-main) 18%, transparent);
                }

                /* Header Area */
                .poems-header-area {
                    margin-bottom: 12px;
                }
                .poems-main-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: 0;
                    line-height: 1.3;
                    margin-bottom: 10px;
                    color: var(--text-main);
                }
                .poems-title-sub {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #888888;
                    margin-bottom: 8px;
                    letter-spacing: 0.5px;
                }
                .poems-subtitle {
                    font-size: 1rem;
                    color: var(--text-muted);
                    font-weight: 400;
                    line-height: 1.6;
                    max-width: 90%;
                }

                /* Filters & Search */
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
                .filter-icon-wrapper:hover {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
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
                .pagination-toggle-btn:hover {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
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
                    transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-bottom: 24px;
                }
                .pagination-collapsible.expanded {
                    grid-template-rows: 1fr;
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

                .pagination-dots {
                    color: var(--text-muted);
                    padding: 0 4px;
                    font-weight: 600;
                    opacity: 0.5;
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

                .transl-switch {
                    position: relative;
                    display: inline-block;
                    width: 36px;
                    height: 20px;
                    flex-shrink: 0;
                }
                .transl-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .transl-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: color-mix(in srgb, var(--text-main) 15%, transparent);
                    border-radius: 20px;
                    transition: background 0.25s ease;
                }
                .transl-slider::before {
                    content: '';
                    position: absolute;
                    height: 16px;
                    width: 16px;
                    left: 2px;
                    bottom: 2px;
                    background: var(--bg-app);
                    border-radius: 50%;
                    transition: transform 0.25s cubic-bezier(0.4, 0.0, 0.2, 1), background 0.25s ease;
                }
                .transl-switch input:checked + .transl-slider {
                    background: var(--text-main);
                }
                .transl-switch input:checked + .transl-slider::before {
                    transform: translateX(16px);
                    background: var(--bg-app);
                }
                .transl-switch-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    letter-spacing: 0.02em;
                    user-select: none;
                }
                .variant-header-row {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .variant-header-row .variant-badge {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                /* Poem Items — CSS-only stagger animation (no JS observer) */
                .poem-item {
                    margin-bottom: 80px;
                    padding-bottom: 40px;
                    border-bottom: 1px solid var(--border-light);
                    position: relative;
                    animation: poemFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                .poem-item:nth-child(1) { animation-delay: 0s; }
                .poem-item:nth-child(2) { animation-delay: 0.06s; }
                .poem-item:nth-child(3) { animation-delay: 0.12s; }
                .poem-item:nth-child(4) { animation-delay: 0.18s; }
                .poem-item:nth-child(5) { animation-delay: 0.24s; }
                .poem-item:nth-child(n+6) { animation-delay: 0.3s; }
                @keyframes poemFadeIn {
                    from { opacity: 0; transform: translateY(18px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .poem-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
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
                    gap: 8px;
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
                .pinned-badge.new-post {
                    color: #4CAF50;
                }
                .classification-badge {
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    padding: 3px 10px;
                    border: none;
                    border-radius: 99px;
                    background: color-mix(in srgb, currentColor 15%, transparent);
                    white-space: nowrap;
                }

                .lang-dots {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-left: 4px;
                }
                .lang-dot {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    font-size: 0.6rem;
                    font-weight: 700;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    color: var(--text-muted);
                    letter-spacing: 0;
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

                /* Typographic Meta Line */
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

                /* Variants Wrapper */
                .variant-wrapper {
                    margin-bottom: 16px;
                }
                .variant-wrapper:last-child {
                    margin-bottom: 0;
                }
                
                .variant-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--text-muted);
                    opacity: 0.7;
                    margin-bottom: 12px;
                }
                
                .variant-title {
                    font-family: inherit;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 14px;
                    color: var(--text-main);
                    line-height: 1.25;
                    letter-spacing: -0.5px;
                }

                /* The core text reading experience */
                .poem-text-content {
                    font-family: inherit; 
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--text-main);
                    word-break: break-word;
                }
                .poem-text-content p {
                    margin: 0;
                    line-height: inherit;
                }

                .poem-attribution {
                    font-family: inherit;
                    margin-top: 24px;
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    font-style: normal;
                }
                .poem-attribution::before {
                    content: '— ';
                }

                .poem-dedication {
                    margin: 32px 0 48px;
                    font-size: 1rem;
                    color: var(--text-muted);
                    font-style: italic;
                    border-left: 2px solid var(--border-light);
                    padding-left: 16px;
                }

                /* Interactive Urai/Notes Pill Component */
                .info-pills-container {
                    margin-top: 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .info-pills-row {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .info-pill-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    border-radius: 99px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                    border: none;
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    color: var(--text-muted);
                    user-select: none;
                    letter-spacing: 0.3px;
                }

                .info-pill-btn:hover {
                    color: var(--text-main);
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    transform: translateY(-1.5px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .info-pill-btn.active {
                    background: var(--text-main);
                    color: var(--bg-app);
                    box-shadow: 0 6px 16px color-mix(in srgb, var(--text-main) 15%, transparent);
                }

                .info-pill-btn svg {
                    transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                    opacity: 0.7;
                }

                .info-pill-btn.active svg {
                    transform: rotate(180deg);
                    opacity: 1;
                }

                .info-pill-content-wrapper {
                    display: grid;
                    grid-template-rows: 0fr;
                    transition: grid-template-rows 0.35s cubic-bezier(0.25, 1, 0.5, 1);
                    overflow: hidden;
                }

                .info-pill-content-wrapper.expanded {
                    grid-template-rows: 1fr;
                }

                .info-pill-content-inner {
                    min-height: 0;
                }

                .info-pill-box {
                    background: color-mix(in srgb, var(--text-main) 4%, transparent);
                    border-radius: 18px;
                    padding: 24px;
                    margin-top: 8px;
                    margin-bottom: 4px;
                }

                .info-pill-box-header {
                    font-size: 0.75rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    color: var(--text-muted);
                    margin-bottom: 14px;
                    opacity: 0.8;
                }

                .info-content {
                    font-size: 0.95rem;
                    line-height: 1.75;
                    color: var(--text-muted);
                    white-space: pre-wrap;
                }

                .info-content.urai {
                    color: color-mix(in srgb, var(--text-main) 88%, transparent);
                    font-size: 1.05rem;
                }

                .animate-fade {
                    animation: fadeInContent 0.3s ease forwards;
                }

                @keyframes fadeInContent {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Keyframes */
                @keyframes subtleFadeUp {
                    0% { opacity: 0; transform: translateY(30px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .poems-empty {
                    font-size: 1.25rem;
                    color: var(--text-muted);
                    padding: 40px 0;
                }

                .pagination-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 0;
                    margin-top: 32px;
                    border-top: 1px solid var(--border-light);
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
                .page-number-btn:hover {
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    color: var(--text-main);
                    border-color: var(--text-main);
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
                .page-info {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                /* Responsive Modifications */
                @media (max-width: 768px) {
                    .poems-container {
                        padding: 16px 16px 100px;
                    }
                    .controls-area {
                        flex-direction: row;
                        align-items: center;
                        gap: 12px;
                    }
                    .poems-nav {
                        margin-bottom: 20px;
                    }
                    .poems-header-area {
                        margin-bottom: 16px;
                    }
                    .poems-main-title {
                        display: none;
                    }
                    .poems-subtitle {
                        font-size: 0.95rem;
                        max-width: 100%;
                    }
                    .minimal-search input {
                        font-size: 1.05rem;
                    }
                    .poem-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .poem-title {
                        font-size: 1.6rem;
                        margin-bottom: 0;
                    }
                    .poem-item {
                        margin-bottom: 60px;
                    }
                    .poem-meta-minimal {
                        margin-bottom: 20px;
                        gap: 12px;
                        font-size: 0.8rem;
                    }
                    .variant-wrapper {
                        margin-bottom: 24px;
                    }
                    .poem-text-content {
                        font-size: 1.05rem; 
                        line-height: 1.7;
                    }
                    .info-block {
                        padding: 24px 0;
                        margin-top: 24px;
                    }
                    .pill-btn {
                        padding: 8px 16px;
                        font-size: 0.85rem;
                    }
                    .pagination-wrapper {
                        gap: 24px;
                        margin-top: 60px;
                        padding-left: 0;
                        padding-right: 0;
                        padding-bottom: 0;
                        align-items: center;
                        width: 100%;
                    }
                    .page-numbers.centered {
                        gap: 20px;
                    }
                    .page-numbers.spread {
                        gap: 10px;
                        justify-content: center;
                    }
                    .page-btn {
                        padding: 10px 20px;
                        font-size: 0.9rem;
                    }
                    .page-number-btn {
                        width: 48px !important;
                        height: 48px !important;
                        font-size: 1.1rem !important;
                    }
                    .poems-main-title { display: none; }
                    .poems-title-sub { display: none; }
                    .poems-nav { display: none; }
                }
                .info-content.hiding {
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
            `}</style>

            <div className="poems-container">
                <div className="poems-nav">
                    <div className="poems-header-area">
                        <h1 className="poems-main-title">{pageTitleTamil || pageTitle}</h1>
                        {pageTitleTamil && <div className="poems-title-sub">{pageTitle}</div>}
                    </div>
                    <Link to="/writings" className="back-link desktop-only">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                    </Link>
                </div>



                <div className="controls-area">
                    <div className="minimal-search">
                        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="தேடுக..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            aria-label={`Search ${pageTitle.toLowerCase()}`}
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
                            <option value="All">வகைகள்</option>
                            {filterOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
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
                            <div className="pagination-wrapper" style={{ marginTop: '0', borderTop: 'none' }}>
                                <div className="pagination-inner">
                                    {(() => {
                                        const pages: (number | string)[] = [];
                                        if (totalPages <= 7) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            pages.push(1);
                                            if (currentPage > 4) pages.push('...');
                                            
                                            const start = Math.max(2, currentPage - 1);
                                            const end = Math.min(totalPages - 1, currentPage + 1);
                                            
                                            for (let i = start; i <= end; i++) {
                                                if (!pages.includes(i)) pages.push(i);
                                            }
                                            
                                            if (currentPage < totalPages - 3) pages.push('...');
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
                        </div>
                    </div>
                )}



                <div className="poems-list">
                    {isLoading ? (
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
                            const postId = post.id || index;

                            const isCurrentlyPinned = post.isPinned && (
                                post.pinType === 'permanent' ||
                                !post.pinExpiresAt ||
                                new Date(post.pinExpiresAt) > now
                            );

                            return (
                                <article key={postId} className="poem-item">
                                    {(isCurrentlyPinned || post.classification) && (
                                        <div className="poem-badges-wrapper">
                                            {isCurrentlyPinned && (
                                                <div className="pinned-badge">
                                                    <span>✨</span> Featured
                                                </div>
                                            )}
                                            {post.classification && (
                                                <span className="classification-badge" style={{ color: getClassColor(post.classification) }}>
                                                    {post.classification}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="poem-header">
                                        <span className="poem-number">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</span>
                                        {post.title && (() => {
                                            const primaryVKey = `${postId}-0`;
                                            const activeLang = variantTranslStates[primaryVKey];
                                            const primaryVariant = post.variants?.[0];

                                            let displayTitle = post.title;
                                            if (activeLang && primaryVariant?.titleTransliterations?.[activeLang]) {
                                                displayTitle = primaryVariant.titleTransliterations[activeLang];
                                            }

                                            return <h2 className="poem-title" lang={activeLang || primaryVariant?.lang || 'en'}>{displayTitle}</h2>;
                                        })()}
                                    </div>

                                    <div className="poem-meta-minimal">
                                        {post.date && <span className="meta-date">{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                        {(post.tags?.length > 0) && post.tags.map((tag, ti) => (
                                            <React.Fragment key={ti}>
                                                {(ti > 0 || post.date) && <div className="meta-separator" />}
                                                <span>{tag}</span>
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {post.dedication && (
                                        <div className="poem-dedication">For {post.dedication}</div>
                                    )}

                                    <div className="poem-variants">
                                        {(post.variants || []).map((variant, vIndex) => {
                                            const vKey = `${postId}-${vIndex}`;
                                            const activeLang = variantTranslStates[vKey] || null;
                                            const translObj = variant.transliterations || {};
                                            const translKeys = Object.keys(translObj);
                                            const hasAnyTransl = translKeys.length > 0;

                                            // Determine display order: for Malayalam, Tamil first then English; otherwise English first then rest
                                            const sortedKeys = variant.lang === 'ml'
                                                ? ['ta', 'en', ...translKeys.filter(k => k !== 'ta' && k !== 'en')].filter(k => translKeys.includes(k))
                                                : ['en', ...translKeys.filter(k => k !== 'en')];

                                            return (
                                                <div key={vIndex} className="variant-wrapper">
                                                    <div className="variant-header-row">
                                                        <div className="variant-badge">
                                                            {LANG_NAMES[variant.lang] || variant.lang}
                                                            {variant.label && <span style={{ marginLeft: '4px' }}>({variant.label})</span>}
                                                        </div>
                                                        {hasAnyTransl && sortedKeys.map(lang => (
                                                            <React.Fragment key={lang}>
                                                                <label className="transl-switch">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={activeLang === lang}
                                                                        onChange={() => toggleVariantTransl(vKey, lang)}
                                                                    />
                                                                    <span className="transl-slider" />
                                                                </label>
                                                                <span className="transl-switch-label">{LANG_LABELS[lang] || lang}</span>
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                    {variant.title && variant.title !== post.title && (
                                                        <div className="variant-title" lang={activeLang || variant.lang}>
                                                            {activeLang && variant.titleTransliterations?.[activeLang]
                                                                ? variant.titleTransliterations[activeLang]
                                                                : variant.title}
                                                        </div>
                                                    )}
                                                    <div
                                                        className="poem-text-content"
                                                        lang={activeLang || variant.lang}
                                                        dangerouslySetInnerHTML={{
                                                            __html: textToHtml(activeLang && translObj[activeLang] ? translObj[activeLang] : (variant.text || ''))
                                                        }}
                                                    />
                                                    {variant.author && (
                                                        <div className="poem-attribution" lang={activeLang || variant.lang}>
                                                            {activeLang && variant.authorTransliterations?.[activeLang]
                                                                ? variant.authorTransliterations[activeLang]
                                                                : variant.author}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {['poems', 'quotes'].includes(tableName) && (
                                        <PoemInfoZone urai={post.urai} notes={post.notes} hint={post.uraiNotesPasswordHint} isUraiNotesLocked={post.isUraiNotesLocked} password={post.uraiNotesPassword} isPrivate={post.is_private} />
                                    )}
                                </article>
                            );
                        })
                        .reduce((acc, item, idx, arr) => {
                            acc.push(item);
                            if (idx < arr.length - 1) {
                                acc.push(
                                    <AdBanner 
                                        key={`ad-inline-${idx}`} 
                                        variant="inline" 
                                        wrapperStyle={{ marginTop: '-40px', marginBottom: '80px', paddingBottom: '40px', borderBottom: '1px solid var(--border-light)' }} 
                                    />
                                );
                            }
                            return acc;
                        }, [])
                    ) : (
                        <div className="poems-empty">
                            <p>I couldn't find any piece of work that matches.</p>
                            <AdBanner variant="inline" wrapperStyle={{ padding: '40px 0', marginTop: '20px' }} />
                        </div>
                    )}
                </div>

                <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />

                {totalPages > 1 && (
                    <div className="pagination-wrapper" style={{ marginTop: '40px', paddingTop: '16px' }}>
                        <div className="pagination-inner">
                            {(() => {
                                const pages: (number | string)[] = [];
                                if (totalPages <= 7) {
                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                } else {
                                    pages.push(1);
                                    if (currentPage > 4) pages.push('...');
                                    
                                    const start = Math.max(2, currentPage - 1);
                                    const end = Math.min(totalPages - 1, currentPage + 1);
                                    
                                    for (let i = start; i <= end; i++) {
                                        if (!pages.includes(i)) pages.push(i);
                                    }
                                    
                                    if (currentPage < totalPages - 3) pages.push('...');
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
                )}
            </div>
        </div>
    );
};

export default WritingPage;

