import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

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

// Classification badge labels
const DEFAULT_CLASSIFICATION_LABELS = {
    'அகம்': { label: 'அகம்', color: '#e8a0bf' },
    'புறம்': { label: 'புறம்', color: '#d4af37' },
};

const LANG_LABELS = { en: 'Aa', ta: 'த', ml: 'മ', hi: 'हि', te: 'తె', sa: 'सं' };

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
    classificationLabels = DEFAULT_CLASSIFICATION_LABELS,
}) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeGenre, setActiveGenre] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [variantTranslStates, setVariantTranslStates] = useState({});

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: rows, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .order('display_order', { ascending: true })
                    .order('date', { ascending: false });

                if (error) throw error;

                const mapped = (rows || []).map(p => ({
                    ...p,
                    isPinned: p.is_pinned,
                    pinExpiresAt: p.pin_expires_at,
                    pinType: p.pin_type || 'auto',
                }));
                setData(mapped);
            } catch (err) {
                console.warn(`Supabase fetch for ${tableName} failed, using legacy JSON:`, err.message);
                // Only use legacy data as fallback when Supabase fails
                setData(legacyData || []);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
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
        return new Date(b.date || 0) - new Date(a.date || 0);
    });

    // Only show themes that actually exist in the data
    const existingThemes = [...new Set(rawPosts.map(p => p.theme).filter(Boolean))];


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
                (post.variants?.some(v =>
                    (v.text || '').toLowerCase().includes(s) ||
                    (v.title || '').toLowerCase().includes(s) ||
                    Object.values(v.transliterations || {}).some(t => (t || '').toLowerCase().includes(s)) ||
                    Object.values(v.titleTransliterations || {}).some(t => (t || '').toLowerCase().includes(s))
                ));
            const matchesGenre = activeGenre === 'All' || post.theme === activeGenre;
            return matchesSearch && matchesGenre;
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
    const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);
    const currentPosts = sortedPosts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);



    return (
        <div className="writings-page-wrapper">
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
                    margin-bottom: 24px;
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
                    margin-bottom: 24px;
                }
                .poems-main-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: -1.5px;
                    line-height: 1.1;
                    margin-bottom: 10px;
                    color: var(--text-main);
                }
                .poems-title-sub {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #888888;
                    margin-bottom: 16px;
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
                    margin-bottom: 40px;
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
                .pinned-badge.new-post {
                    color: #4CAF50;
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
                    word-break: break-word;
                }

                .poem-attribution {
                    font-family: "Mukta Malar", "Noto Sans Malayalam", sans-serif;
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
                    justify-content: center;
                    align-items: center;
                    gap: 24px;
                    padding: 40px 0;
                    margin-top: 40px;
                    border-top: 1px solid var(--border-light);
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
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 0.9rem;
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
                    padding: 10px 24px;
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
                <div className="poems-nav">
                    <div className="poems-header-area">
                        <h1 className="poems-main-title">{pageTitleTamil || pageTitle}</h1>
                        {pageTitleTamil && <div className="poems-title-sub">{pageTitle}</div>}
                        <p className="poems-subtitle" style={{ margin: 0 }}>{pageSubtitle}</p>
                        {pageSubtitleEnglish && (
                            <p className="poems-subtitle" style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px', maxWidth: '100%' }}>
                                {pageSubtitleEnglish}
                            </p>
                        )}
                    </div>
                    <Link to="/writings" className="back-link">
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
                            <option key={theme} value={theme}>{themeLabels[theme] || theme}</option>
                        ))}
                    </select>
                </div>

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
                                                <span className="classification-badge" style={{ color: (classificationLabels[post.classification]?.color || 'var(--text-muted)') }}>
                                                    {classificationLabels[post.classification]?.label || post.classification}
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
                                                            __html: activeLang && translObj[activeLang] ? translObj[activeLang] : (variant.text || '')
                                                        }}
                                                    />
                                                    {variant.author && (
                                                        <div className="poem-attribution" lang={variant.lang}>{variant.author}</div>
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
                            lang="ta"
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage(prev => Math.max(prev - 1, 1));
                            }}
                        >
                            &larr; முன்பு
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
                            அடுத்து &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WritingPage;
