// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { subscribe, getCachedRaw } from '../lib/firebaseCache';
import AdBanner from './AdBanner';
import { getOptimizedImage } from '../lib/media';
import { Engagement } from './Engagement';
import MobileTopBar from './MobileTopBar';
import { FloatingBackButton } from './FloatingBackButton';

const CATEGORY_META = {
    'blog': { title: 'வலைப்பதிவுகள்', subtitle: 'Blog Posts' },
    'articles': { title: 'கட்டுரைகள்', subtitle: 'Articles' },
    'stories': { title: 'சிறுகதைகள்', subtitle: 'Short Stories' },
    'diary': { title: 'நாளேடு', subtitle: 'Diary' },
    'poems': { title: 'நவில் மிழிகள்', subtitle: 'Navil Poems' },
    'quotes': { title: 'நவில் மொழிகள்', subtitle: 'Navil Quotes' }
};

const LANG_LABELS = { ta: 'தமிழ்', en: 'English', ml: 'മലയാളം', hi: 'Hindi', te: 'Telugu', sa: 'Sanskrit' };
const TRANSL_LABELS = { en: 'Aa', ta: 'த', ml: 'മ', hi: 'हि', te: 'తె', sa: 'सं' };
const INDIC_LANGS = ['ta', 'ml', 'hi', 'sa', 'te'];

// Fix Google Drive image URLs embedded inside HTML content (from TipTap editor)
const fixDriveImages = (html: string): string => {
    const drivePattern = /(src=["'])[^"']*(drive\.google\.com\/(?:file\/d\/|open\?id=)|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)[^"']*(["'])/gi;
    return html.replace(drivePattern, (_match, before, _domain, fileId, after) => {
        return `${before}https://drive.google.com/thumbnail?id=${fileId}&sz=w1200${after}`;
    });
};

// Convert text to renderable HTML — handles both plain text and TipTap's br-based HTML
const textToHtml = (raw) => {
    if (!raw) return '';
    if (!/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) {
        return fixDriveImages(raw.split('\n').map(line => 
            line.trim() ? `<p>${line}</p>` : '<p style="height:1.2em"></p>'
        ).join(''));
    }
    let html = raw.replace(/<p>([\s\S]*?)<\/p>/gi, (match, content) => {
        const lines = content.split(/<br\s*\/?>/gi);
        return lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '<p style="height:1.2em"></p>';
            return `<p>${trimmed}</p>`;
        }).join('');
    });
    return fixDriveImages(html);
};

/** Clean up a single post item from raw Firebase data */
const cleanItem = (data) => {
    if (data.variants) {
        if (!Array.isArray(data.variants)) data.variants = Object.values(data.variants);
        data.variants.forEach(v => {
            if (v.transliterations?._empty) delete v.transliterations._empty;
            if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
            if (v.authorTransliterations?._empty) delete v.authorTransliterations._empty;
            if (!v.transliterations) v.transliterations = {};
            if (!v.titleTransliterations) v.titleTransliterations = {};
            if (!v.authorTransliterations) v.authorTransliterations = {};
        });
    }
    return data;
};

const ReadingView = () => {
    const { category, slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const meta = CATEGORY_META[category] || null;

    const transitionDirection = location.state?.transition || null;
    const animationClass = transitionDirection === 'prev'
        ? 'slideFromLeft'
        : transitionDirection === 'next'
            ? 'slideFromRight'
            : 'fadeIn';

    const [post, setPost] = useState(() => {
        // Try to resolve from cache immediately — no loading spinner needed
        const raw = getCachedRaw(category);
        if (raw && raw[slug]) return { ...cleanItem({ ...raw[slug] }), id: slug };
        if (raw) {
            const found = Object.entries(raw).find(([key, val]) => val.id === slug || key === slug);
            if (found) return { ...cleanItem({ ...found[1] }), id: found[0] };
        }
        return null;
    });
    const [loading, setLoading] = useState(() => {
        const raw = getCachedRaw(category);
        return !raw;
    });
    const [seriesParts, setSeriesParts] = useState([]);
    const [variantTranslStates, setVariantTranslStates] = useState({}); // { "postId-vIndex": activeLang | null }
    const [activeSection, setActiveSection] = useState(null); // 'urai' | 'notes' | null
    const [displaySection, setDisplaySection] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pwdAttempt, setPwdAttempt] = useState('');
    const [pwdError, setPwdError] = useState(false);
    const [decryptedUrai, setDecryptedUrai] = useState('');
    const [decryptedNotes, setDecryptedNotes] = useState('');

    // Locked only when lock toggle is on AND password exists
    const isLocked = !!post?.isUraiNotesLocked && !!post?.uraiNotesPassword;

    const handleUnlock = (e) => {
        e.preventDefault();
        if (pwdAttempt.trim() === post?.uraiNotesPassword) {
            setIsUnlocked(true);
            setPwdError(false);
        } else {
            setPwdError(true);
        }
    };

    useEffect(() => {
        if (activeSection) {
            setDisplaySection(activeSection);
        }
    }, [activeSection]);

    const displayUrai = isLocked ? (isUnlocked ? post?.urai : null) : post?.urai;
    const displayNotes = isLocked ? (isUnlocked ? post?.notes : null) : post?.notes;

    const { autoThumbnails } = useOutletContext();

    // Safely compute primary title for page context
    const variants = post?.variants || [];
    const contentObj = post?.content || {};
    const hasVariants = variants.length > 0;
    const primaryTitle = (category === 'stories') ? (post?.title || variants[0]?.title || '') : (hasVariants ? (variants[0]?.title || post?.title || '') : (contentObj[Object.keys(contentObj)[0]]?.title || post?.title || ''));
    const firstVariantKey = `${post?.id}-0`;
    const firstVariantActiveLang = variantTranslStates[firstVariantKey] || null;
    let displayPrimaryTitle = primaryTitle;
    if (hasVariants && firstVariantActiveLang) {
        if (variants[0]?.titleTransliterations?.[firstVariantActiveLang]) {
            displayPrimaryTitle = variants[0].titleTransliterations[firstVariantActiveLang];
        } else if (post?.titleTransliterations?.[firstVariantActiveLang]) {
            displayPrimaryTitle = post.titleTransliterations[firstVariantActiveLang];
        }
    }

    const finalCoverImage = post ? (post.cover_image || null) : null;



    const toggleVariantTransl = (vKey, lang) => {
        setVariantTranslStates(prev => ({
            ...prev,
            [vKey]: prev[vKey] === lang ? null : lang
        }));
    };


    // Subscribe to the shared cache — reuses existing listener, no duplicate DB calls
    useEffect(() => {
        if (!meta) return;

        const unsubscribe = subscribe(category, (data) => {
            if (!data) return;
            // The cache gives us a sorted array — find our post by slug/id from the raw map
            const raw = getCachedRaw(category);
            if (!raw) return;

            let foundPost = null;
            if (raw[slug]) {
                foundPost = { ...cleanItem({ ...raw[slug] }), id: slug };
            } else {
                const found = Object.entries(raw).find(([key, val]) => val.id === slug || key === slug);
                if (found) foundPost = { ...cleanItem({ ...found[1] }), id: found[0] };
            }

            if (foundPost) {
                setPost(foundPost);
                // Build series parts for stories
                if (category === 'stories' && foundPost.series_name) {
                    const siblings = Object.entries(raw)
                        .map(([sKey, sVal]) => ({ ...cleanItem({ ...sVal }), id: sKey, slug: sKey }))
                        .filter(p => p.series_name === foundPost.series_name)
                        .sort((a, b) => (a.series_part || 0) - (b.series_part || 0));
                    setSeriesParts(siblings);
                }
            } else {
                setPost(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [category, slug, meta]);

    useEffect(() => {
        if (category === 'stories' && post) {
            if (post.series_name) {
                sessionStorage.setItem('elvan_stories_expanded_series', `series-${post.series_name}`);
            } else {
                sessionStorage.removeItem('elvan_stories_expanded_series');
            }
        }
    }, [category, post]);

    if (!meta) return <div className="page-view" style={{ padding: '60px' }}>Content not found</div>;

    if (loading) {
        return (
            <>
                <MobileTopBar title={`${meta.title}|${meta.subtitle || ''}`} showBack={true} backUrl={`/writings/${category}`} />
                <div key={slug} className={`page-view ${animationClass}`} style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px 100px' }}>
                <style>{`
                    .reader-skeleton-wrapper {
                        max-width: 800px;
                        padding-top: 60px;
                    }
                    
                    .reader-pulse {
                        background: linear-gradient(90deg, 
                            color-mix(in srgb, var(--border-light) 30%, transparent) 0%,
                            color-mix(in srgb, var(--text-main) 6%, var(--bg-card)) 50%,
                            color-mix(in srgb, var(--border-light) 30%, transparent) 100%
                        );
                        background-size: 200% 100%;
                        animation: premiumShimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                        border-radius: 8px;
                    }
                    
                    @keyframes premiumShimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                    
                    .skel-header {
                        margin-bottom: 56px;
                    }
                    
                    .skel-title {
                        height: 52px;
                        width: 85%;
                        margin-bottom: 24px;
                        border-radius: 12px;
                    }
                    
                    .skel-meta {
                        height: 18px;
                        width: 250px;
                        border-radius: 8px;
                    }
                    
                    .skel-paragraph {
                        margin-bottom: 40px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    
                    .skel-line {
                        height: 18px;
                        border-radius: 6px;
                        width: 100%;
                    }
                    
                    .skel-line.short { width: 45%; }
                    .skel-line.medium { width: 80%; }
                    .skel-line.long { width: 95%; }
                    .skel-line.full { width: 100%; }
                `}</style>
                <div className="reader-skeleton-wrapper">
                    <div className="skel-header">
                        <div className="reader-pulse skel-title"></div>
                        <div className="reader-pulse skel-meta"></div>
                    </div>

                    <div className="skel-paragraph">
                        <div className="reader-pulse skel-line full"></div>
                        <div className="reader-pulse skel-line long"></div>
                        <div className="reader-pulse skel-line full"></div>
                        <div className="reader-pulse skel-line medium"></div>
                        <div className="reader-pulse skel-line short"></div>
                    </div>

                    <div className="skel-paragraph">
                        <div className="reader-pulse skel-line long"></div>
                        <div className="reader-pulse skel-line full"></div>
                        <div className="reader-pulse skel-line full"></div>
                        <div className="reader-pulse skel-line medium"></div>
                    </div>

                    <div className="skel-paragraph">
                        <div className="reader-pulse skel-line full"></div>
                        <div className="reader-pulse skel-line long"></div>
                        <div className="reader-pulse skel-line short"></div>
                    </div>
                </div>
            </div>
            </>
        );
    }

    if (!post) {
        return (
            <>
                <MobileTopBar title={`${meta?.title}|${meta?.subtitle || ''}`} showBack={true} backUrl={`/writings/${category}`} />
                <div key={slug} className={`page-view ${animationClass}`} style={{ padding: '60px', textAlign: 'center' }}>
                    <h2>Post Not Found</h2>
                    <button onClick={() => navigate(`/writings/${category}`)} className="adm-btn ghost">Return to {meta.title}</button>
                </div>
            </>
        );
    }

    const isStory = category === 'stories';
    const isMinimal = category === 'thoughts';

    let nextPart = null;
    let prevPart = null;
    if (seriesParts.length > 0) {
        const currIndex = seriesParts.findIndex(p => p.id === post.id);
        if (currIndex < seriesParts.length - 1) nextPart = seriesParts[currIndex + 1];
        if (currIndex > 0) prevPart = seriesParts[currIndex - 1];
    }

    return (
        <>
            <MobileTopBar title={`${meta?.title}|${meta?.subtitle || ''}`} showBack={true} backUrl={`/writings/${category}`} />
            <Helmet>
                <title>{displayPrimaryTitle} | {meta.subtitle}</title>
            </Helmet>
            <div key={slug} className={`page-view ${animationClass}`} style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 20px 100px' }}>
            {/* Transliteration toggle styles (same as WritingPage) */}
            <style>{`
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
                .variant-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--text-muted);
                    opacity: 0.7;
                }
                .variant-header-row .variant-badge {
                    margin-bottom: 0;
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
                .expand-pill {
                    display: inline-flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 12px;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 100px;
                    padding: 10px 18px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                    border: none;
                    color: var(--text-main);
                    min-width: 120px;
                }
                .expand-pill:hover {
                    background: color-mix(in srgb, var(--text-main) 10%, transparent);
                }
                .expand-pill.active {
                    background: var(--text-main);
                    color: var(--bg-app);
                }
                .expand-pill.active .pill-en {
                    color: var(--bg-app);
                    opacity: 0.6;
                }
                .pill-text-stack {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    line-height: 1.1;
                }
                @media (max-width: 600px) {
                    .expand-pill {
                        padding: 8px 16px;
                        gap: 8px;
                        flex: 1;
                    }
                }
                .expand-pill .pill-ta {
                    font-family: "Mukta Malar", sans-serif;
                    font-size: 1rem;
                    font-weight: 700;
                    line-height: 1;
                }
                .expand-pill .pill-en {
                    font-size: 0.7rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    opacity: 0.7;
                    text-transform: lowercase;
                    letter-spacing: 0.01em;
                }
                .expand-pill svg {
                    transition: transform 0.3s ease;
                    opacity: 0.6;
                    flex-shrink: 0;
                }
                .expand-pill.active svg {
                    opacity: 1;
                }
                .expand-pill.active svg {
                    transform: rotate(180deg);
                }
                .collapsible-section {
                    display: grid;
                    grid-template-rows: 1fr;
                    transition: grid-template-rows 0.35s cubic-bezier(0.25, 1, 0.5, 1), margin-bottom 0.35s ease;
                    margin-bottom: 24px;
                }
                .collapsible-section.collapsed {
                    grid-template-rows: 0fr;
                    margin-bottom: 0;
                }
                .collapsible-inner {
                    min-height: 0;
                    overflow: hidden;
                    opacity: 1;
                    transition: opacity 0.35s ease, padding 0.35s ease, margin 0.35s ease;
                }
                .collapsible-section.collapsed .collapsible-inner {
                    opacity: 0;
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                    margin-top: 0 !important;
                    margin-bottom: 0 !important;
                }
                @media (max-width: 768px) {
                    .reader-header-area {
                        margin-top: 8px;
                    }
                }
            `}</style>

            {/* Header: Title and Back Button */}
            <div className="reader-header-area" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <h1
                    lang={firstVariantActiveLang || (hasVariants ? variants[0]?.lang : Object.keys(contentObj)[0]) || 'ta'}
                    style={{ fontSize: '2rem', fontWeight: '700', lineHeight: '1.2', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.5px', maxWidth: '80%' }}
                >
                    {displayPrimaryTitle}
                </h1>
                <FloatingBackButton to={`/writings/${category}`} />
            </div>

            <article className="animate-entry" style={{ maxWidth: '800px' }}>
                {!isMinimal && finalCoverImage && category !== 'poems' && category !== 'quotes' && (
                    <div style={{ width: '100%', borderRadius: isStory ? '0' : '24px', overflow: 'hidden', marginBottom: '40px' }}>
                        <img src={getOptimizedImage(finalCoverImage, 'medium')} alt={primaryTitle || 'Cover'} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    </div>
                )}

                <header style={{ marginBottom: '40px', textAlign: isStory ? 'center' : 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: isStory ? 'center' : 'flex-start', flexWrap: 'wrap', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px', fontWeight: 500 }}>
                        <FiCalendar />
                        {new Date(post.publish_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        {post.series_name && <span style={{ color: 'var(--text-main)' }}>• {post.series_name} — Part {post.series_part}</span>}
                        {post.tags?.length > 0 && <span>• {post.tags.join(', ')}</span>}
                    </div>
                </header>

                {/* Variant-based display (same as poems) */}
                {hasVariants ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                        {variants.map((variant, vIndex) => {
                            const vKey = `${post.id}-${vIndex}`;
                            const activeLang = variantTranslStates[vKey] || null;
                            const translObj = variant.transliterations || {};
                            const translKeys = Object.keys(translObj).filter(k => translObj[k]);
                            const hasAnyTransl = translKeys.length > 0;
                            const isIndic = INDIC_LANGS.includes(variant.lang);

                            // Sort transliteration keys like poems
                            const sortedKeys = variant.lang === 'ml'
                                ? ['ta', 'en', ...translKeys.filter(k => k !== 'ta' && k !== 'en')].filter(k => translKeys.includes(k))
                                : ['en', ...translKeys.filter(k => k !== 'en')];

                            // Determine displayed content
                            let displayTitle = variant.title || post?.title;
                            if (activeLang) {
                                if (variant.titleTransliterations?.[activeLang]) {
                                    displayTitle = variant.titleTransliterations[activeLang];
                                } else if (post?.titleTransliterations?.[activeLang]) {
                                    displayTitle = post.titleTransliterations[activeLang];
                                }
                            }
                            let displayText = variant.text;
                            if (activeLang && translObj[activeLang]) {
                                displayText = translObj[activeLang];
                            }

                            const isMulti = variants.length > 1;

                            return (
                                <div key={vIndex} style={{ 
                                    paddingBottom: isMulti ? '40px' : '0', 
                                    marginBottom: isMulti ? '40px' : '0',
                                    borderBottom: isMulti ? '2px dashed var(--border-light)' : 'none' 
                                }}>
                                    {/* Header row with badge + transliteration toggles */}
                                    {!isStory && (
                                        <div className="variant-header-row">
                                        <div className="variant-badge">
                                            {LANG_LABELS[variant.lang] || variant.lang?.toUpperCase() || `#${vIndex + 1}`}
                                            {variant.label && <span style={{ marginLeft: '4px' }}>({variant.label})</span>}
                                        </div>

                                        {/* Transliteration toggles (only for Indic languages) */}
                                        {isIndic && hasAnyTransl && sortedKeys.map(tLang => (
                                            <React.Fragment key={tLang}>
                                                <label className="transl-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={activeLang === tLang}
                                                        onChange={() => toggleVariantTransl(vKey, tLang)}
                                                    />
                                                    <span className="transl-slider" />
                                                </label>
                                                <span className="transl-switch-label">{TRANSL_LABELS[tLang] || tLang}</span>
                                            </React.Fragment>
                                        ))}
                                        </div>
                                    )}

                                    {(isMulti || isStory) && displayTitle && ((variant.title || post?.title) !== primaryTitle) && (
                                        <h1
                                            lang={activeLang || variant.lang}
                                            style={{
                                                fontSize: isStory ? '2.5rem' : '2rem',
                                                fontWeight: isStory ? '800' : '700',
                                                fontFamily: isStory ? 'serif' : 'inherit',
                                                lineHeight: '1.2',
                                                color: 'var(--text-main)',
                                                marginBottom: '16px'
                                            }}>
                                            {displayTitle}
                                        </h1>
                                    )}

                                    {variant.author && (
                                        <div lang={activeLang || variant.lang} style={{ fontSize: '1rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
                                            — {activeLang && variant.authorTransliterations?.[activeLang] ? variant.authorTransliterations[activeLang] : variant.author}
                                        </div>
                                    )}

                                    {/* Content Body */}
                                    <div
                                        lang={activeLang || variant.lang}
                                        className={`rich-content-body ${isStory ? 'story-format' : ''}`}
                                        style={{ fontSize: '1.15rem', lineHeight: '1.9', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}
                                        dangerouslySetInnerHTML={{ __html: textToHtml(displayText) || '<p>No content available.</p>' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Fallback: old content{} model */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {Object.keys(contentObj).filter(l => contentObj[l]?.title || contentObj[l]?.body).map((langCode) => {
                            const lContent = contentObj[langCode] || {};
                            const isMulti = Object.keys(contentObj).length > 1;
                            return (
                                <div key={langCode} style={{ paddingBottom: isMulti ? '24px' : '0', borderBottom: isMulti ? '1px solid var(--border-light)' : 'none' }}>
                                    {isMulti && <div className="variant-badge" style={{ marginBottom: '16px' }}>{LANG_LABELS[langCode] || langCode.toUpperCase()}</div>}
                                    {lContent.title && lContent.title !== displayPrimaryTitle && <h1 lang={langCode} style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2', color: 'var(--text-main)', marginBottom: '16px' }}>{lContent.title}</h1>}
                                    <div lang={langCode} className="rich-content-body" style={{ fontSize: '1.15rem', lineHeight: '1.9', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}
                                        dangerouslySetInnerHTML={{ __html: textToHtml(lContent.body) || '<p>No content available.</p>' }} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Cover Image for Poems & Quotes */}
                {!isMinimal && finalCoverImage && (category === 'poems' || category === 'quotes') && (
                    <div style={{ width: '100%', borderRadius: '24px', overflow: 'hidden', marginTop: '40px', background: 'var(--bg-panel)' }}>
                        <img src={getOptimizedImage(finalCoverImage, 'medium')} alt={primaryTitle || 'Cover'} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    </div>
                )}

                {/* Urai & Notes section */}
                {(post.urai || post.notes) && !post.is_private && (
                    <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: activeSection ? '24px' : '0', transition: 'margin 0.3s ease' }}>
                            {post.urai && (
                                <button 
                                    className={`expand-pill ${activeSection === 'urai' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveSection(activeSection === 'urai' ? null : 'urai');
                                        setPwdError(false);
                                        setPwdAttempt('');
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        {isLocked ? (
                                            isUnlocked ? <path d="M7 11V7a5 5 0 0 1 10 0v4 M5 11h14v10H5z" /> : <path d="M7 11V7a5 5 0 0 1 9.9-1 M5 11h14v10H5z" />
                                        ) : (
                                            activeSection === 'urai' ? <line x1="5" y1="12" x2="19" y2="12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                                        )}
                                    </svg>
                                    <div className="pill-text-stack">
                                        <span className="pill-ta">விளக்கம்</span>
                                        <span className="pill-en">meaning</span>
                                    </div>
                                </button>
                            )}
                            {post.notes && (
                                <button 
                                    className={`expand-pill ${activeSection === 'notes' ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveSection(activeSection === 'notes' ? null : 'notes');
                                        setPwdError(false);
                                        setPwdAttempt('');
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        {isLocked ? (
                                            isUnlocked ? <path d="M7 11V7a5 5 0 0 1 10 0v4 M5 11h14v10H5z" /> : <path d="M7 11V7a5 5 0 0 1 9.9-1 M5 11h14v10H5z" />
                                        ) : (
                                            activeSection === 'notes' ? <line x1="5" y1="12" x2="19" y2="12" /> : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                                        )}
                                    </svg>
                                    <div className="pill-text-stack">
                                        <span className="pill-ta">குறிப்புகள்</span>
                                        <span className="pill-en">notes</span>
                                    </div>
                                </button>
                            )}
                        </div>

                        {isLocked && !isUnlocked ? (
                            <div className={`collapsible-section ${!activeSection ? 'collapsed' : ''}`}>
                                <div className="collapsible-inner">
                                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                        <form onSubmit={handleUnlock} className="easter-egg-lock" style={{ maxWidth: '300px', margin: '0 auto' }}>
                                            <div style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
                                                This section is locked. Enter password to view.
                                                {post.uraiNotesPasswordHint && <div style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8 }}>Hint: {post.uraiNotesPasswordHint}</div>}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <input 
                                                    type="password"
                                                    value={pwdAttempt}
                                                    onChange={(e) => { setPwdAttempt(e.target.value); setPwdError(false); }}
                                                    placeholder="Enter Password"
                                                    className="pwd-input"
                                                    style={{ padding: '12px 16px', borderRadius: '12px', border: pwdError ? '1px solid #ff4444' : '1px solid var(--border-light)', background: 'var(--bg-panel)', color: 'var(--text-main)', outline: 'none', width: '100%' }}
                                                />
                                                <button type="submit" style={{ padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--text-main)', color: 'var(--bg-app)', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                                                    Unlock
                                                </button>
                                            </div>
                                            {pwdError && <div style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '12px' }}>Incorrect password.</div>}
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {post.urai && displayUrai && displaySection === 'urai' && (
                                    <div className={`collapsible-section ${activeSection !== 'urai' ? 'collapsed' : ''}`}>
                                        <div className="collapsible-inner">
                                            <div
                                                style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-muted)', padding: '12px 0' }}
                                                dangerouslySetInnerHTML={{ __html: textToHtml(displayUrai) }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {post.notes && displayNotes && displaySection === 'notes' && (
                                    <div className={`collapsible-section ${activeSection !== 'notes' ? 'collapsed' : ''}`}>
                                        <div className="collapsible-inner">
                                            <div
                                                style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-muted)', padding: '12px 0' }}
                                                dangerouslySetInnerHTML={{ __html: textToHtml(displayNotes) }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Story Series Navigation */}
                {isStory && (nextPart || prevPart) && (
                    <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                            {post.series_name} — Continue Reading
                        </h4>
                        <div className="pagination-nav-pill" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center', width: 'auto' }}>
                            {prevPart ? (
                                <Link
                                    to={`/writings/stories/${prevPart.slug || prevPart.id}`}
                                    state={{ transition: 'prev' }}
                                    className="page-btn prev-btn"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="15 18 9 12 15 6" /></svg>
                                    பகுதி {prevPart.series_part}
                                </Link>
                            ) : (
                                <button className="page-btn prev-btn" disabled>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="15 18 9 12 15 6" /></svg>
                                    முந்தை
                                </button>
                            )}

                            {nextPart ? (
                                <Link
                                    to={`/writings/stories/${nextPart.slug || nextPart.id}`}
                                    state={{ transition: 'next' }}
                                    className="page-btn next-btn"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                                >
                                    பகுதி {nextPart.series_part}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}><polyline points="9 18 15 12 9 6" /></svg>
                                </Link>
                            ) : (
                                <button className="page-btn next-btn" disabled>
                                    அடுத்து
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Real-time Likes & Comments */}
                <Engagement postId={post.id} category={category} />
            </article>


            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />

            {/* Rich content body styles */}
            <style>{`
                .rich-content-body h2 { font-size: 1.8rem; margin: 40px 0 16px; font-weight: 700; color: var(--text-main); }
                .rich-content-body h3 { font-size: 1.4rem; margin: 32px 0 12px; font-weight: 600; color: var(--text-main); }
                .rich-content-body p { margin: 0; color: var(--text-main); line-height: inherit; }
                .rich-content-body blockquote { border-left: 4px solid var(--text-main); padding-left: 24px; margin: 32px 0; font-style: italic; color: var(--text-muted); font-size: 1.25rem; }
                .rich-content-body img { max-width: 100%; border-radius: 16px; margin: 32px 0; }
                .rich-content-body ul, .rich-content-body ol { padding-left: 24px; margin-bottom: 24px; }
                .rich-content-body li { margin-bottom: 12px; }
                .rich-content-body hr { border: none; border-top: 1px solid var(--border-light); margin: 48px 0; }
                .rich-content-body pre { background: var(--bg-card); padding: 24px; border-radius: 12px; overflow-x: auto; font-family: 'Fira Code', monospace; font-size: 0.95rem; margin-bottom: 24px; }
                .rich-content-body code { background: color-mix(in srgb, var(--text-main) 8%, transparent); padding: 2px 6px; border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.9em; }
                
                .story-format p { font-size: 1.25rem; line-height: 2; margin-bottom: 28px; }
                .story-format blockquote { font-style: italic; }

                /* Pagination Pill Buttons */
                .pagination-nav-pill {
                    display: flex;
                    align-items: center;
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

                /* Directional Slide Keyframes & Transitions */
                @keyframes slideFromRight {
                    from { opacity: 0; transform: translateX(36px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .slideFromRight {
                    animation: slideFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                @keyframes slideFromLeft {
                    from { opacity: 0; transform: translateX(-36px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .slideFromLeft {
                    animation: slideFromLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
        </>
    );
};

export default ReadingView;

