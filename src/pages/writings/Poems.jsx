import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
// Legacy fallback — kept as static backup
import legacyPoemsData from '../../data/poems.json';

const Poems = () => {
    const [poemsData, setPoemsData] = useState(legacyPoemsData || []);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPoems = async () => {
            try {
                const { data, error } = await supabase
                    .from('poems')
                    .select('*')
                    .order('date', { ascending: false });

                if (error) throw error;

                // Map snake_case DB fields → camelCase JS fields
                const mapped = (data || []).map(p => ({
                    ...p,
                    isPinned: p.is_pinned,
                    pinExpiresAt: p.pin_expires_at,
                }));
                setPoemsData(mapped);
            } catch (err) {
                console.warn('Supabase fetch failed, using legacy JSON:', err.message);
                // Falls back to legacyPoemsData already set in useState
            } finally {
                setIsLoading(false);
            }
        };
        fetchPoems();
    }, []);

    const rawPosts = [...poemsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Friendly bilingual genre/theme labels
    const THEME_LABELS = {
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
    };

    // Classification badge labels
    const CLASSIFICATION_LABELS = {
        'அகம்': { label: 'அகம் (Akam)', color: '#e8a0bf' },
        'புறம்': { label: 'புறம் (Puram)', color: '#d4af37' },
    };

    // Only show themes that actually exist in the data
    const existingThemes = [...new Set(rawPosts.map(p => p.theme).filter(Boolean))];

    const [activeGenre, setActiveGenre] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [variantTranslStates, setVariantTranslStates] = useState({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const LANG_LABELS = { en: 'Aa', ta: 'த', ml: 'മ', hi: 'हि', te: 'తె', sa: 'सं' };

    const toggleVariantTransl = (variantKey, lang) => {
        setVariantTranslStates(prev => ({
            ...prev,
            [variantKey]: prev[variantKey] === lang ? null : lang
        }));
    };

    const filteredPosts = useMemo(() => {
        const filtered = rawPosts.filter(post => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = (post.title || '').toLowerCase().includes(searchStr) ||
                (post.variants?.some(v => v.text.toLowerCase().includes(searchStr)));
            const matchesGenre = activeGenre === 'All' || post.theme === activeGenre;
            return matchesSearch && matchesGenre;
        });
        // Sort by date within the filtered posts
        return filtered.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
        });
    }, [searchTerm, activeGenre, rawPosts]);

    // Pinned logic
    const now = new Date();
    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const isAPinned = a.isPinned && (!a.pinExpiresAt || new Date(a.pinExpiresAt) > now);
        const isBPinned = b.isPinned && (!b.pinExpiresAt || new Date(b.pinExpiresAt) > now);

        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;
        return 0; // If both or neither are pinned, keep the date sorting
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
    const currentPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [currentPosts]); // Changed dependency to currentPosts

    return (
        <div className="page-view fadeIn">
            <style>{`
                /* =========================================
                   MINIMAL, KINETIC, TOUCH-OPTIMIZED UI
                   ========================================= */
                .poems-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0;
                    padding: 30px 24px 100px;
                }

                .poems-nav {
                    margin-bottom: 24px;
                }
                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    text-decoration: none;
                    transition: color 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    padding: 8px 16px 8px 0; /* large touch target */
                }
                .back-link:hover {
                    color: var(--text-main);
                    transform: translateX(-6px);
                }

                /* Header Area */
                .poems-header-area {
                    margin-bottom: 24px;
                    animation: subtleFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .poems-main-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: -1.5px;
                    line-height: 1.1;
                    margin-bottom: 16px;
                    color: var(--text-main);
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
                    margin-bottom: 40px;
                    display: flex;
                    flex-direction: row;
                    gap: 16px;
                    opacity: 0;
                    animation: subtleFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
                    align-items: center;
                }
                .minimal-search {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                }
                .minimal-search input {
                    width: 100%;
                    padding: 10px 0;
                    font-size: 1.1rem;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid var(--border-light);
                    color: var(--text-main);
                    border-radius: 0;
                    transition: border-color 0.4s ease;
                }
                .minimal-search input:focus {
                    outline: none;
                    border-bottom-color: var(--text-main);
                }
                .minimal-search input::placeholder {
                    color: color-mix(in srgb, var(--text-muted) 40%, transparent);
                    font-weight: 300;
                }
                
                .theme-dropdown {
                    padding: 10px 0;
                    font-size: 1.05rem;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid var(--border-light);
                    color: var(--text-muted);
                    cursor: pointer;
                    min-width: 150px;
                    outline: none;
                    transition: all 0.3s ease;
                }
                .theme-dropdown:focus {
                    border-bottom-color: var(--text-main);
                    color: var(--text-main);
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
                    height: 14px;
                    width: 14px;
                    left: 3px;
                    bottom: 3px;
                    background: var(--bg-app);
                    box-shadow: 0 1px 3px color-mix(in srgb, var(--text-main) 30%, transparent);
                    border-radius: 50%;
                    transition: transform 0.25s ease, background 0.25s ease;
                }
                .transl-switch input:checked + .transl-slider {
                    background: var(--text-main);
                }
                .transl-switch input:checked + .transl-slider::before {
                    transform: translateX(16px);
                    background: var(--bg-app);
                    box-shadow: none;
                }
                .transl-switch-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    letter-spacing: 0.02em;
                    user-select: none;
                }
                .variant-header-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .variant-header-row .variant-badge {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                /* Poem Items */
                .poem-item {
                    margin-bottom: 80px;
                    padding-bottom: 40px;
                    border-bottom: 1px solid var(--border-light);
                    animation: subtleFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    position: relative;
                }
                .poem-item:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                
                /* Kinetic Reveal */
                .reveal-on-scroll {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reveal-on-scroll.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .pinned-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    color: #d4af37; /* Gold accent */
                    margin-bottom: 12px;
                }
                .pinned-badge.new-post {
                    color: #4CAF50;
                }
                .classification-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    padding: 5px 14px;
                    border: none;
                    border-radius: 99px;
                    margin-bottom: 12px;
                    background: color-mix(in srgb, currentColor 15%, transparent);
                }
                .poem-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 8px;
                    gap: 16px;
                }

                .poem-title {
                    font-family: "Mukta Malar", "Noto Sans Malayalam", sans-serif;
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
                    margin-bottom: 32px;
                }
                .variant-wrapper:last-child {
                    margin-bottom: 0;
                }
                
                .variant-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--text-muted);
                    margin-bottom: 12px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid var(--border-light);
                }
                
                .variant-title {
                    font-family: "Mukta Malar", "Noto Sans Malayalam", sans-serif;
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: var(--text-main);
                    font-style: auto;
                    letter-spacing: -0.5px;
                }

                /* The core text reading experience */
                .poem-text-content {
                    font-family: inherit; 
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--text-main);
                    white-space: pre-wrap;
                    word-break: break-word; /* prevent overflow */
                }

                .poem-attribution {
                    font-family: "Mukta Malar", "Noto Sans Malayalam", sans-serif;
                    margin-top: 24px;
                    font-size: 1.15rem; /* slightly larger for cursive font readability */
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

                /* Minimal Interactive Urai/Notes */
                .info-block {
                    margin-top: 24px;
                    padding: 24px 0;
                    border-top: 1px solid var(--border-light);
                    transition: opacity 0.3s ease;
                }
                .info-block:hover {
                    opacity: 1; 
                }
                
                .info-label {
                    font-size: 0.8rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: var(--text-main);
                    margin-bottom: 16px;
                }
                .info-content {
                    font-size: 0.95rem;
                    line-height: 1.7;
                    color: var(--text-muted);
                    white-space: pre-wrap;
                }
                .info-content.urai {
                    color: color-mix(in srgb, var(--text-main) 85%, transparent);
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
                    justify-content: space-between;
                    align-items: center;
                    padding: 40px 0;
                    margin-top: 40px;
                    border-top: 1px solid var(--border-light);
                }
                .page-btn {
                    padding: 10px 24px;
                    border: 1px solid var(--border-light);
                    background: transparent;
                    color: var(--text-main);
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }
                .page-btn:hover:not(:disabled) {
                    background: var(--text-main);
                    color: var(--bg-app);
                }
                .page-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .page-info {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                }

                /* Responsive Modifications */
                @media (max-width: 768px) {
                    .poems-container {
                        padding: 16px 16px 100px;
                    }
                    .controls-area {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .theme-dropdown {
                        width: 100%;
                    }
                    .poems-nav {
                        margin-bottom: 20px;
                    }
                    .poems-header-area {
                        margin-bottom: 16px;
                    }
                    .poems-main-title {
                        font-size: 2.2rem;
                        margin-bottom: 12px;
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
                }
            `}</style>

            <div className="poems-container">
                <nav className="poems-nav">
                    <Link to="/writings" className="back-link">
                        <span>&larr;</span> Back to Writings
                    </Link>
                </nav>

                <div className="poems-header-area">
                    <h1 className="poems-main-title">Poems</h1>
                    <p className="poems-subtitle">Verses, rhythms, and lyrical expressions.</p>
                </div>

                <div className="controls-area">
                    <div className="minimal-search">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset page on search
                            }}
                            aria-label="Search poems"
                        />
                    </div>
                    <select
                        className="theme-dropdown"
                        value={activeGenre}
                        onChange={(e) => {
                            setActiveGenre(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="All">All Genres</option>
                        {existingThemes.map(theme => (
                            <option key={theme} value={theme}>{THEME_LABELS[theme] || theme}</option>
                        ))}
                    </select>
                </div>

                <div className="poems-list">
                    {currentPosts.length > 0 ? (
                        currentPosts.map((post, index) => {
                            const poemId = post.id || index;

                            const isCurrentlyPinned = post.isPinned && (!post.pinExpiresAt || new Date(post.pinExpiresAt) > now);

                            return (
                                <article key={poemId} className="poem-item reveal-on-scroll">
                                    {isCurrentlyPinned && (
                                        <div className="pinned-badge">
                                            <span>✨</span> Featured
                                        </div>
                                    )}
                                    {post.classification && CLASSIFICATION_LABELS[post.classification] && (
                                        <span className="classification-badge" style={{ color: CLASSIFICATION_LABELS[post.classification].color }}>
                                            {CLASSIFICATION_LABELS[post.classification].label}
                                        </span>
                                    )}
                                    <div className="poem-header">
                                        {(post.title) && <h2 className="poem-title">{post.title}</h2>}
                                    </div>

                                    <div className="poem-meta-minimal">
                                        {post.date && <span className="meta-date">{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                        {post.date && (post.style || post.theme || post.meter) && <div className="meta-separator" />}

                                        {post.style && <span>{post.style}</span>}
                                        {post.style && (post.theme || post.meter) && <div className="meta-separator" />}

                                        {post.theme && <span>{post.theme}</span>}
                                        {post.theme && (post.meter) && <div className="meta-separator" />}

                                        {post.meter && <span>{post.meter}</span>}
                                    </div>

                                    {post.dedication && (
                                        <div className="poem-dedication">For {post.dedication}</div>
                                    )}

                                    <div className="poem-variants">
                                        {(post.variants || []).map((variant, vIndex) => {
                                            const vKey = `${poemId}-${vIndex}`;
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
                                                        {variant.label && <div className="variant-badge">{variant.label}</div>}
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
                                                        <div className="variant-title">
                                                            {activeLang && variant.titleTransliterations?.[activeLang]
                                                                ? variant.titleTransliterations[activeLang]
                                                                : variant.title}
                                                        </div>
                                                    )}
                                                    <div className="poem-text-content">
                                                        {activeLang && translObj[activeLang]
                                                            ? translObj[activeLang]
                                                            : variant.text}
                                                    </div>
                                                    {variant.author && (
                                                        <div className="poem-attribution">{variant.author}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {post.urai && (
                                        <div className="info-block">
                                            <div className="info-label">Urai · உரை</div>
                                            <div className="info-content urai">{post.urai}</div>
                                        </div>
                                    )}

                                    {post.notes && (
                                        <div className="info-block" style={{ borderTop: post.urai ? 'none' : '1px solid var(--border-light)', paddingTop: post.urai ? '0' : '32px', marginTop: post.urai ? '0' : '24px' }}>
                                            <div className="info-label">Notes</div>
                                            <div className="info-content">{post.notes}</div>
                                        </div>
                                    )}
                                </article>
                            );
                        })
                    ) : (
                        <div className="poems-empty">I couldn't find any piece of work that matches.</div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination-wrapper">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage(prev => Math.max(prev - 1, 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            &larr; Previous
                        </button>
                        <span className="page-info">Page {currentPage} of {totalPages}</span>
                        <button
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => {
                                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Next &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Poems;
