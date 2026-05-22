import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../components/MobileTopBar';
import profileData from '../data/profile.json';
import profilePic from '../assets/instagram/profile.jpg';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';

// Import icons
import { FiArrowRight, FiRotateCw, FiUser, FiInstagram, FiFeather, FiImage, FiCompass, FiInfo } from 'react-icons/fi';
import { BsBook, BsPen, BsChatQuote, BsPencilSquare, BsNewspaper, BsMoonStars } from 'react-icons/bs';

// Static JSON imports as instant fallbacks for counts & quotes
import staticPoems from '../data/poems.json';
import staticQuotes from '../data/quotes.json';
import staticStories from '../data/stories.json';
import staticArts from '../data/arts.json';

const CLASSIFICATION_COLORS: Record<string, string> = {
    'அகம்': '#e8a0bf',   // pink
    'புறம்': '#d4af37',   // gold
};

const getClassColor = (name: string) => {
    if (!name) return '#888';
    if (CLASSIFICATION_COLORS[name]) return CLASSIFICATION_COLORS[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = ((hash % 360) + 360) % 360;
    return `hsl(${hue}, 55%, 60%)`;
};

const Home = () => {
    // Dynamic counts state initialized with local static fallbacks
    const [counts, setCounts] = useState({
        poems: staticPoems.length,
        quotes: staticQuotes.length,
        blog: 0,
        articles: 0,
        stories: staticStories.length,
        diary: 0,
        arts: staticArts.length
    });

    const navigate = useNavigate();

    // Live Database Lists (Quotes & Poems) initialized synchronously from localStorage
    const [dbQuotes, setDbQuotes] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('elvan_db_quotes');
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });
    const [dbPoems, setDbPoems] = useState<any[]>(() => {
        try {
            const cached = localStorage.getItem('elvan_db_poems');
            return cached ? JSON.parse(cached) : [];
        } catch {
            return [];
        }
    });

    // Fetch live counts and data from Firebase Database in real-time
    useEffect(() => {
        const unsubs: (() => void)[] = [];
        try {
            const writingKeys = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];
            writingKeys.forEach(key => {
                const r = ref(db, key);
                const unsub = onValue(r, (snap) => {
                    if (snap.exists()) {
                        const count = Object.keys(snap.val()).length;
                        setCounts(prev => ({ ...prev, [key]: count }));
                    }
                }, () => { });
                unsubs.push(unsub);
            });

            const artsRef = ref(db, 'arts');
            const unsubArts = onValue(artsRef, (snap) => {
                if (snap.exists()) {
                    const dataObj = snap.val() as Record<string, any>;
                    let totalArts = 0;
                    Object.values(dataObj).forEach(() => {
                        totalArts++;
                    });
                    setCounts(prev => ({ ...prev, arts: totalArts }));
                }
            }, () => { });
            unsubs.push(unsubArts);

            // Fetch live quotes
            const quotesRef = ref(db, 'quotes');
            const unsubQuotes = onValue(quotesRef, (snap) => {
                if (snap.exists()) {
                    const data = snap.val();
                    const list = Object.entries(data).map(([key, val]: [string, any]) => ({
                        ...val,
                        id: val.id || key
                    }));
                    setDbQuotes(list);
                    try {
                        localStorage.setItem('elvan_db_quotes', JSON.stringify(list));
                    } catch (err) {
                        console.error(err);
                    }
                }
            }, () => { });
            unsubs.push(unsubQuotes);

            // Fetch live poems
            const poemsRef = ref(db, 'poems');
            const unsubPoems = onValue(poemsRef, (snap) => {
                if (snap.exists()) {
                    const data = snap.val();
                    const list = Object.entries(data).map(([key, val]: [string, any]) => ({
                        ...val,
                        id: val.id || key
                    }));
                    setDbPoems(list);
                    try {
                        localStorage.setItem('elvan_db_poems', JSON.stringify(list));
                    } catch (err) {
                        console.error(err);
                    }
                }
            }, () => { });
            unsubs.push(unsubPoems);
        } catch (e) {
            console.error("Firebase Database read error on Home page:", e);
        }
        return () => {
            unsubs.forEach(fn => fn());
        };
    }, []);

    // Sources pool (dynamic database list, fallback to static JSON backups)
    const quotesSource = dbQuotes.length > 0 ? dbQuotes : staticQuotes;
    const poemsSource = dbPoems.length > 0 ? dbPoems : staticPoems;

    // Interactive quote carousel state (stably initialized once from cache or fallback)
    const [currentQuote, setCurrentQuote] = useState<any>(() => {
        const pool = dbQuotes.length > 0 ? dbQuotes : staticQuotes;
        return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    });
    const [isFading, setIsFading] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    // Sync quotes when database resolves or initial fallback
    useEffect(() => {
        if (dbQuotes.length > 0) {
            const isFromDb = currentQuote && dbQuotes.some((q: any) => q.id === currentQuote.id);
            if (!isFromDb) {
                setCurrentQuote(dbQuotes[Math.floor(Math.random() * dbQuotes.length)]);
            }
        } else if (staticQuotes.length > 0 && !currentQuote) {
            setCurrentQuote(staticQuotes[Math.floor(Math.random() * staticQuotes.length)]);
        }
    }, [dbQuotes]);

    const handleNewQuote = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // Avoid navigating when clicking shuffle
        if (!quotesSource || quotesSource.length <= 1) return;
        setIsFading(true);
        setIsRotating(true);
        setTimeout(() => {
            let next;
            do {
                next = quotesSource[Math.floor(Math.random() * quotesSource.length)];
            } while (currentQuote && next.id === currentQuote.id);
            setCurrentQuote(next);
            setIsFading(false);
            setTimeout(() => setIsRotating(false), 500);
        }, 300);
    };

    // Helper to extract language-specific texts from quote object
    const getQuoteTexts = (quoteObj: any) => {
        if (!quoteObj) return { id: '', classification: '', main: '', sub: '', tag: 'Reflection', mainLang: 'ta', subLang: 'en' };

        let variants = quoteObj.variants || [];
        if (variants && !Array.isArray(variants)) {
            variants = Object.values(variants);
        }

        const cleanHtmlTags = (rawText: string) => {
            if (!rawText) return '';
            return rawText
                .replace(/<\/p>\s*<p>/gi, '\n')
                .replace(/<p>/gi, '')
                .replace(/<\/p>/gi, '')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .trim();
        };

        // Extract tags for quotes
        let quoteTags: string[] = [];
        if (Array.isArray(quoteObj.tags)) {
            quoteTags = quoteObj.tags.map(t => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
        } else if (quoteObj.tags && typeof quoteObj.tags === 'string') {
            quoteTags = quoteObj.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        // If no tags, fall back to tag/theme fields (excluding classification)
        if (quoteTags.length === 0) {
            quoteTags = [
                quoteObj.tag,
                quoteObj.theme
            ].map(t => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
        }

        const finalQuoteTag = quoteTags.length > 0 ? quoteTags.join(' • ') : 'Philosophy';

        if (variants.length === 0) {
            const rawText = quoteObj.text || '';
            let subText = '';
            let subLang = 'en';
            if (quoteObj.transliteration) {
                subText = cleanHtmlTags(quoteObj.transliteration);
                subLang = 'en';
            } else if (quoteObj.translation) {
                subText = cleanHtmlTags(quoteObj.translation);
                subLang = 'en';
            }
            return {
                id: quoteObj.id || '',
                classification: quoteObj.classification || '',
                main: cleanHtmlTags(rawText),
                sub: subText || null,
                tag: finalQuoteTag,
                mainLang: quoteObj.lang || 'ta',
                subLang: subLang
            };
        }

        // Find main variant: EXACT order saved (index 0)
        let mainVar = variants[0];

        // Find sub variant: EXACT order saved (index 1)
        let subVar = variants[1];

        let subText = '';
        let subLang = 'en';

        if (subVar) {
            subText = cleanHtmlTags(subVar.text || '');
            subLang = subVar.lang || 'en';
        } else if (mainVar && mainVar.transliterations && Object.keys(mainVar.transliterations).length > 0) {
            const firstLang = Object.keys(mainVar.transliterations)[0];
            const translitText = mainVar.transliterations[firstLang];
            if (translitText && typeof translitText === 'string') {
                subText = cleanHtmlTags(translitText);
                subLang = firstLang;
            }
        }

        return {
            id: quoteObj.id || '',
            classification: quoteObj.classification || '',
            main: mainVar ? cleanHtmlTags(mainVar.text) : '',
            sub: subText || null,
            tag: finalQuoteTag,
            mainLang: mainVar ? mainVar.lang : 'ta',
            subLang: subLang
        };
    };

    const quoteTexts = getQuoteTexts(currentQuote);

    // Interactive poem player state (stably initialized once from cache or fallback)
    const [currentPoem, setCurrentPoem] = useState<any>(() => {
        const pool = dbPoems.length > 0 ? dbPoems : staticPoems;
        return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    });
    const [isPoemFading, setIsPoemFading] = useState(false);
    const [isPoemRotating, setIsPoemRotating] = useState(false);

    // Sync poems when database resolves or initial fallback
    useEffect(() => {
        if (dbPoems.length > 0) {
            const isFromDb = currentPoem && dbPoems.some((p: any) => p.id === currentPoem.id);
            if (!isFromDb) {
                setCurrentPoem(dbPoems[Math.floor(Math.random() * dbPoems.length)]);
            }
        } else if (staticPoems.length > 0 && !currentPoem) {
            setCurrentPoem(staticPoems[Math.floor(Math.random() * staticPoems.length)]);
        }
    }, [dbPoems]);

    const handleNewPoem = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation(); // Avoid navigating when clicking shuffle
        if (!poemsSource || poemsSource.length <= 1) return;
        setIsPoemFading(true);
        setIsPoemRotating(true);
        setTimeout(() => {
            let next;
            do {
                next = poemsSource[Math.floor(Math.random() * poemsSource.length)];
            } while (currentPoem && next.id === currentPoem.id);
            setCurrentPoem(next);
            setIsPoemFading(false);
            setTimeout(() => setIsPoemRotating(false), 500);
        }, 300);
    };

    // HTML-safe line truncator for poems
    const getTruncatedVerse = (rawText: string) => {
        if (!rawText) return { text: '', isTruncated: false };

        let clean = rawText
            .replace(/<\/p>\s*<p>/gi, '\n')
            .replace(/<p>/gi, '')
            .replace(/<\/p>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '');

        const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

        if (lines.length <= 2) {
            return { text: lines.join('\n'), isTruncated: false };
        }

        return {
            text: lines.slice(0, 2).join('\n') + '\n...',
            isTruncated: true
        };
    };

    // Helper to get poem details with multi-language support (main + translation)
    const getPoemDetails = (poemObj: any) => {
        const fallback = {
            id: '',
            classification: '',
            theme: 'Literature',
            main: { title: 'Poem', text: '', lang: 'en', isTruncated: false },
            sub: null
        };
        if (!poemObj) return fallback;

        // Prioritize tags array/string for poem tags display
        let terms: string[] = [];
        if (Array.isArray(poemObj.tags)) {
            terms = poemObj.tags.map(t => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
        } else if (poemObj.tags && typeof poemObj.tags === 'string') {
            terms = poemObj.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        // If no tags, fall back to other fields (excluding classification)
        if (terms.length === 0) {
            terms = [
                poemObj.theme,
                poemObj.style,
                poemObj.meter
            ]
                .map(t => t && typeof t === 'string' ? t.trim() : '')
                .filter(Boolean);
        }

        const uniqueTerms = Array.from(new Set(terms));
        const finalTheme = uniqueTerms.length > 0 ? uniqueTerms.join(' • ') : 'Literature';

        let variants = poemObj.variants || [];
        if (variants && !Array.isArray(variants)) {
            variants = Object.values(variants);
        }

        if (variants.length === 0) {
            const rawText = poemObj.text || '';
            const trunc = getTruncatedVerse(rawText);
            let subDetail = null;
            if (poemObj.transliteration) {
                const subTrunc = getTruncatedVerse(poemObj.transliteration);
                subDetail = {
                    title: '',
                    text: subTrunc.text,
                    isTruncated: subTrunc.isTruncated,
                    lang: 'en'
                };
            } else if (poemObj.translation) {
                const subTrunc = getTruncatedVerse(poemObj.translation);
                subDetail = {
                    title: '',
                    text: subTrunc.text,
                    isTruncated: subTrunc.isTruncated,
                    lang: 'en'
                };
            }
            return {
                id: poemObj.id || '',
                classification: poemObj.classification || '',
                theme: finalTheme,
                main: {
                    title: poemObj.title || 'Untitled',
                    text: trunc.text,
                    isTruncated: trunc.isTruncated,
                    lang: poemObj.lang || 'ta'
                },
                sub: subDetail
            };
        }

        // Find main variant: EXACT order saved (index 0)
        let mainVar = variants[0];

        // Find sub variant: EXACT order saved (index 1)
        let subVar = variants[1];

        const mainTrunc = getTruncatedVerse(mainVar.text || '');

        let subDetail: any = null;
        if (subVar) {
            const subTrunc = getTruncatedVerse(subVar.text || '');
            subDetail = {
                title: subVar.title || '',
                text: subTrunc.text,
                isTruncated: subTrunc.isTruncated,
                lang: subVar.lang || 'en'
            };
        } else if (mainVar && mainVar.transliterations && Object.keys(mainVar.transliterations).length > 0) {
            const firstLang = Object.keys(mainVar.transliterations)[0];
            const translitText = mainVar.transliterations[firstLang];
            if (translitText && typeof translitText === 'string') {
                const subTrunc = getTruncatedVerse(translitText);
                subDetail = {
                    title: '',
                    text: subTrunc.text,
                    isTruncated: subTrunc.isTruncated,
                    lang: firstLang
                };
            }
        }

        return {
            id: poemObj.id || '',
            classification: poemObj.classification || '',
            theme: finalTheme,
            main: {
                title: mainVar.title || poemObj.title || 'Untitled',
                text: mainTrunc.text,
                isTruncated: mainTrunc.isTruncated,
                lang: mainVar.lang || 'ta'
            },
            sub: subDetail
        };
    };

    const poemDetails = getPoemDetails(currentPoem);

    const handleQuoteCardClick = () => {
        if (quoteTexts.id) {
            navigate(`/writings/quotes/${quoteTexts.id}`);
        }
    };

    const handlePoemCardClick = () => {
        if (poemDetails.id) {
            navigate(`/writings/poems/${poemDetails.id}`);
        }
    };

    return (
        <>
            <Helmet>
                <title>நவில் | Navil</title>
                <meta name="description" content="Welcome to the digital home of Elvan Parthasarathy. A creative sanctuary for poetry, thoughts, writings, and artistic expressions." />
                <link rel="canonical" href="https://elvanparthasarathy.vercel.app/" />
            </Helmet>
            <MobileTopBar title="நவில்" />
            <div className="home-page page-view fadeIn">
                <style>{`
                .home-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 20px 80px;
                    position: relative;
                    contain: layout style;
                }

                /* BACKGROUND GRADIENT DECORATION */
                .home-bg-blobs {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    z-index: -2;
                    pointer-events: none;
                    will-change: transform;
                    transform: translateZ(0);
                    contain: strict;
                }

                .bg-blob-circle {
                    position: absolute;
                    width: clamp(280px, 40vw, 450px);
                    height: clamp(280px, 40vw, 450px);
                    background: linear-gradient(135deg, color-mix(in srgb, var(--text-main) 8%, transparent), color-mix(in srgb, var(--bg-panel) 40%, transparent));
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    filter: blur(60px);
                    opacity: 0.4;
                    animation: morphBlob 16s linear infinite alternate;
                    will-change: transform, border-radius;
                    transform: translateZ(0);
                    backface-visibility: hidden;
                }

                .blob-1 {
                    top: 5%;
                    right: -10%;
                }

                .blob-2 {
                    bottom: 10%;
                    left: -10%;
                    animation-delay: -5s;
                }

                @keyframes morphBlob {
                    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg) scale(1); }
                    50% { border-radius: 60% 40% 50% 70% / 50% 70% 40% 60%; transform: rotate(90deg) scale(1.1); }
                    100% { border-radius: 70% 30% 60% 50% / 30% 60% 50% 70%; transform: rotate(180deg) scale(0.9); }
                }

                /* GRID LAYOUT */
                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 24px;
                    margin-top: 32px;
                }

                .span-12 { grid-column: span 12; }
                .span-6 { grid-column: span 6; }

                /* PREMIUM CARD SYSTEM */
                .bento-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border: none;
                    border-radius: 28px;
                    padding: 32px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
                                box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }

                [data-theme='dark'] .bento-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 45%));
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                @media (hover: hover) and (pointer: fine) {
                    .bento-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
                    }
                }

                 header.span-12 {
                     padding: 16px 0 0;
                 }
 
                 /* HERO CARD CONTENT */
                 .hero-layout {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 40px;
                }

                .hero-identity {
                    flex: 1.2;
                }

                .hero-intro-text {
                    font-size: clamp(2.4rem, 5vw, 3.4rem);
                    font-weight: 800;
                    line-height: 1.2;
                    letter-spacing: -0.03em;
                    color: var(--text-main);
                    margin-bottom: 8px;
                }

                .hero-subtitle {
                    font-size: clamp(1.4rem, 3vw, 1.8rem);
                    font-weight: 500;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                }

                .mobile-quick-links {
                    display: none;
                }

                .hero-avatar-area {
                    position: relative;
                    flex-shrink: 0;
                    width: 260px;
                    height: 260px;
                }

                .hero-avatar-bg-glow {
                     position: absolute;
                     inset: -20px;
                     background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                     border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                     filter: blur(40px);
                     opacity: 0.2;
                     animation: morphGlow 10s linear infinite alternate;
                     z-index: 1;
                     will-change: border-radius;
                     transform: translateZ(0);
                     backface-visibility: hidden;
                 }
 
                 @keyframes morphGlow {
                     0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                     100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
                 }

                .hero-avatar-image {
                    width: 100%;
                    height: 100%;
                    border-radius: 20%;
                    object-fit: cover;
                    border: 8px solid var(--bg-card);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                    position: relative;
                    z-index: 2;
                }

                /* DICTIONARY ELEMENT */
                .dictionary-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-top: 56px;
                    width: 100%;
                }

                .dict-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border: none;
                    padding: 32px;
                    border-radius: 28px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                }

                [data-theme='dark'] .dict-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 45%));
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                @media (hover: hover) and (pointer: fine) {
                    .dict-card-disabled-hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
                        z-index: 2;
                    }
                }

                .dict-word-header {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .dict-word {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .dict-meta {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    font-style: italic;
                    opacity: 0.8;
                }

                .dict-definition {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                }

                /* DYNAMIC QUOTE CARD */
                .quote-bento {
                    min-height: 280px;
                }

                .quote-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 12px;
                }

                .quote-badges-container {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px 6px;
                    min-width: 0;
                    flex: 1;
                }

                .quote-tag-badge {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 6px 12px;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    color: var(--text-main);
                    border-radius: 99px;
                    white-space: nowrap;
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

                .quote-refresh-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: none;
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    position: relative;
                    z-index: 10;
                    transition: background 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                                transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                }

                .quote-refresh-btn:hover {
                    background: color-mix(in srgb, var(--text-main) 16%, transparent);
                    transform: scale(1.06) rotate(15deg);
                }

                .quote-refresh-btn:active {
                    transform: scale(0.92);
                }

                .rotate-icon {
                    animation: spinIcon 0.5s ease-in-out;
                }

                @keyframes spinIcon {
                    to { transform: rotate(360deg); }
                }

                .player-display {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    transition: opacity 0.3s ease;
                }

                .player-main-text {
                    font-size: clamp(1.1rem, 1.7vw, 1.28rem);
                    font-weight: 500;
                    line-height: 1.5;
                    color: var(--text-main);
                    font-style: normal;
                    white-space: pre-line;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    height: 3.2em;
                    margin: 0;
                    padding: 0;
                }

                .player-sub-display {
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1px solid color-mix(in srgb, var(--text-muted) 12%, transparent);
                }

                .player-sub-text {
                    font-size: clamp(0.88rem, 1.3vw, 0.98rem);
                    font-style: italic;
                    line-height: 1.55;
                    color: var(--text-muted);
                    white-space: pre-line;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    height: 3.35em;
                    margin: 0;
                    padding: 0;
                }

                .player-read-more-container {
                    margin-top: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                .player-read-more-btn {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-main);
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: gap 0.2s ease;
                }

                .player-read-more-btn .arrow {
                    transition: transform 0.2s ease;
                }

                .clickable-card:hover .player-read-more-btn {
                    gap: 10px;
                }

                .clickable-card:hover .player-read-more-btn .arrow {
                    transform: translateX(2px);
                }

                .bio-wide-grid {
                    grid-template-columns: 1fr;
                }

                @media (min-width: 768px) {
                    .bio-wide-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .clickable-card {
                    cursor: pointer;
                    transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), 
                                box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
                }

                .clickable-card:hover {
                    transform: none !important;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04) !important;
                }

                [data-theme="dark"] .clickable-card:hover {
                    transform: none !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
                }

                 .clickable-card:active:not(:has(.quote-refresh-btn:active)) {
                     transform: scale(0.97) !important;
                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                 }
 
                 [data-theme="dark"] .clickable-card:active:not(:has(.quote-refresh-btn:active)) {
                     transform: scale(0.97) !important;
                     background: rgba(255, 255, 255, 0.02) !important;
                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
                 }

                /* HUB: WRITINGS CARD */
                .hub-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                }

                .hub-card-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .hub-card-desc {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                    margin-bottom: 24px;
                    line-height: 1.5;
                }
                

                /* ABOUT PHILOSOPHY CARD */
                .philosophy-quote-box {
                    border-left: 3px solid var(--text-main);
                    padding-left: 16px;
                    margin-bottom: 24px;
                }

                .philosophy-ta {
                    font-size: 1.1rem;
                    font-weight: 700;
                    line-height: 1.4;
                    margin-bottom: 6px;
                    color: var(--text-main);
                }

                .philosophy-en {
                    font-size: 0.95rem;
                    font-style: italic;
                    color: var(--text-muted);
                }

                .card-explore-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-main);
                    text-decoration: none;
                    margin-top: auto;
                    transition: gap 0.2s ease;
                }

                .card-explore-link:hover {
                    gap: 12px;
                }

                /* RESPONSIVE BREAKPOINTS */
                 @media (max-width: 1023px) {
                     .home-page {
                         padding-top: 16px;
                     }
                     .bento-grid {
                         grid-template-columns: 1fr;
                         gap: 20px;
                         margin-top: 20px;
                     }
                      header.span-12 {
                          padding-top: 0px;
                      }
                      .mobile-quick-links {
                          display: flex;
                          gap: 12px;
                          margin-top: 24px;
                          justify-content: center;
                          width: 100%;
                      }
                      .mobile-quick-link-btn {
                          flex: 1;
                          max-width: 180px;
                          background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                          border: none;
                          color: var(--text-main);
                          padding: 8px 12px 8px 8px;
                          border-radius: 100px;
                          display: flex;
                          align-items: center;
                          gap: 10px;
                          cursor: pointer;
                          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                          text-align: left;
                      }
                      .mobile-quick-link-btn .btn-icon-wrapper {
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          width: 32px;
                          height: 32px;
                          border-radius: 50%;
                          background: color-mix(in srgb, var(--text-main) 8%, transparent);
                          color: var(--text-main);
                          flex-shrink: 0;
                      }
                      .mobile-quick-link-btn .btn-text-group {
                          display: flex;
                          flex-direction: column;
                          align-items: flex-start;
                          gap: 0px;
                          line-height: 1.2;
                          min-width: 0;
                          overflow: hidden;
                      }
                      .mobile-quick-link-btn .btn-text-ta {
                          font-size: 0.82rem;
                          font-weight: 700;
                          color: var(--text-main);
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          transform: translateX(-1.5px);
                      }
                      .mobile-quick-link-btn .btn-text-en {
                          font-size: 0.72rem;
                          font-weight: 500;
                          color: var(--text-muted);
                          text-transform: none;
                          letter-spacing: 0;
                      }
                      .mobile-quick-link-btn:active {
                          transform: scale(0.97) !important;
                          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
                      }
                      [data-theme='dark'] .mobile-quick-link-btn {
                          background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 45%));
                          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                      }
                      [data-theme='dark'] .mobile-quick-link-btn .btn-icon-wrapper {
                          background: rgba(255, 255, 255, 0.06);
                      }
                      [data-theme='dark'] .mobile-quick-link-btn:active {
                          transform: scale(0.97) !important;
                          background: rgba(255, 255, 255, 0.02) !important;
                          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
                      }
                     .span-12, .span-8, .span-6, .span-4 {
                        grid-column: span 1;
                    }
                    .hero-layout {
                        flex-direction: column;
                        text-align: center;
                        gap: 24px;
                    }
                    .hero-avatar-area {
                        width: clamp(120px, 20vw, 180px);
                        height: clamp(120px, 20vw, 180px);
                    }
                    .hero-avatar-image {
                        border-radius: 50%;
                        border-width: 3px;
                    }
                    .dictionary-container {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }
                    .writings-sub-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 580px) {
                    .writings-sub-grid {
                        grid-template-columns: 1fr;
                    }
                    .bento-card {
                        padding: 24px;
                        border-radius: 24px;
                    }
                }
                `}</style>

                {/* ANIMATED ABSTRACT GRADIENT BACKGROUND */}
                <div className="home-bg-blobs">
                    <div className="bg-blob-circle blob-1"></div>
                    <div className="bg-blob-circle blob-2"></div>
                </div>

                {/* THE BENTO GRID */}
                <div className="bento-grid">

                    {/* 1. HERO & BRAND DESCRIPTION (span-12) */}
                    <header className="span-12" style={{ cursor: 'default' }}>
                        <div className="hero-layout">
                            <div className="hero-avatar-area">
                                <div className="hero-avatar-bg-glow"></div>
                                <img
                                    src={profilePic}
                                    alt={profileData.fullName}
                                    className="hero-avatar-image"
                                />
                            </div>
                            <div className="hero-identity">
                                <h1 className="hero-intro-text" lang="ta">எல்வன் நவில்</h1>
                                <h2 className="hero-subtitle">Elvan Navil</h2>
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-muted)', maxWidth: '650px', marginBottom: '12px' }} lang="ta">
                                    நல்வரவு. இது நவில் — சிந்தனைகளை உரைக்க, எழுத்துகளைப் பகிர, எண்மப் படைப்புகளைக் காட்சிப்படுத்தும் வெளி.
                                </p>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)', maxWidth: '650px' }}>
                                    Welcome. This is Navil—a personal digital archive to express thoughts, share writings, and display creative digital arts.
                                </p>
                                <div className="mobile-quick-links">
                                    <button onClick={() => navigate('/writings', { state: { fromQuickLink: true } })} className="mobile-quick-link-btn">
                                        <div className="btn-icon-wrapper">
                                            <FiFeather size={16} />
                                        </div>
                                        <div className="btn-text-group">
                                            <span className="btn-text-ta" lang="ta">எழுத்துகள்</span>
                                            <span className="btn-text-en">writings</span>
                                        </div>
                                    </button>
                                    <button onClick={() => navigate('/arts', { state: { fromQuickLink: true } })} className="mobile-quick-link-btn">
                                        <div className="btn-icon-wrapper">
                                            <FiImage size={16} />
                                        </div>
                                        <div className="btn-text-group">
                                            <span className="btn-text-ta" lang="ta">படைப்புகள்</span>
                                            <span className="btn-text-en">arts</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* DICTIONARY DEFINITION LAYOUT */}
                        <div className="dictionary-container">
                            <div className="dict-card">
                                <div className="dict-word-header">
                                    <span className="dict-word" lang="ta">நவில்</span>
                                    <span className="dict-meta">வினைச்சொல்</span>
                                </div>
                                <p className="dict-definition" lang="ta">
                                    தமிழ் வேர்ச்சொல் "நவிலுதல்" — உரைத்தல், பேசுதல், பாடுதல், அல்லது வார்த்தைகள் வழி எண்ணங்களை வெளிப்படுத்துதல்.
                                </p>
                            </div>

                            <div className="dict-card">
                                <div className="dict-word-header">
                                    <span className="dict-word">Navil</span>
                                    <span className="dict-meta">/nʌvɪl/ • verb</span>
                                </div>
                                <p className="dict-definition">
                                    Derived from Tamil “Naviluthal” — meaning to speak, utter, narrate, or express core reflections through lyrical words.
                                </p>
                            </div>
                        </div>
                    </header>


                    {/* 4. DYNAMIC INTERACTIVE POEM PLAYER (span-6) */}
                    <section className="bento-card span-6 quote-bento clickable-card" onClick={handlePoemCardClick}>
                        <div className="quote-header-row">
                            <span className="quote-tag-badge" lang="ta">நவில் மிழிகள் • Navil Poems</span>
                            <button
                                className="quote-refresh-btn"
                                onClick={handleNewPoem}
                                title="Read another poem"
                                aria-label="Read another poem"
                            >
                                <FiRotateCw size={18} className={isPoemRotating ? 'rotate-icon' : ''} />
                            </button>
                        </div>

                        <div className="player-display" style={{ opacity: isPoemFading ? 0 : 1 }}>
                            {/* Main original variant (Tamil / Malayalam) */}
                            <p className="player-main-text" lang={poemDetails.main.lang}>
                                {poemDetails.main.text}
                            </p>

                            {/* Secondary translation variant (English / others) */}
                            {poemDetails.sub && (
                                <div className="player-sub-display">
                                    <p className="player-sub-text" lang={poemDetails.sub.lang}>
                                        {poemDetails.sub.text}
                                    </p>
                                </div>
                            )}

                            <div className="player-read-more-container">
                                <span className="player-read-more-btn">
                                    Click here to read more <FiArrowRight size={14} className="arrow" />
                                </span>
                                {poemDetails.classification && (
                                    <span className="classification-badge" style={{ color: getClassColor(poemDetails.classification) }}>
                                        {poemDetails.classification}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{poemDetails.theme}</span> • Click card to read full poem, or refresh to load another.
                        </div>
                    </section>

                    {/* 4b. DYNAMIC INTERACTIVE QUOTE PLAYER (span-6) */}
                    <section className="bento-card span-6 quote-bento clickable-card" onClick={handleQuoteCardClick}>
                        <div className="quote-header-row">
                            <span className="quote-tag-badge" lang="ta">நவில் மொழிகள் • Navil Quotes</span>
                            <button
                                className="quote-refresh-btn"
                                onClick={handleNewQuote}
                                title="Read another reflection"
                                aria-label="Read another reflection"
                            >
                                <FiRotateCw size={18} className={isRotating ? 'rotate-icon' : ''} />
                            </button>
                        </div>

                        <div className="player-display" style={{ opacity: isFading ? 0 : 1 }}>
                            {quoteTexts.main && (
                                <blockquote className="player-main-text" lang={quoteTexts.mainLang}>
                                    “{quoteTexts.main}”
                                </blockquote>
                            )}
                            {quoteTexts.sub && (
                                <div className="player-sub-display">
                                    <p className="player-sub-text" lang={quoteTexts.subLang}>
                                        {quoteTexts.sub}
                                    </p>
                                </div>
                            )}

                            <div className="player-read-more-container">
                                <span className="player-read-more-btn">
                                    Click here to read more <FiArrowRight size={14} className="arrow" />
                                </span>
                                {quoteTexts.classification && (
                                    <span className="classification-badge" style={{ color: getClassColor(quoteTexts.classification) }}>
                                        {quoteTexts.classification}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{quoteTexts.tag}</span> • Click card to read full quote, or refresh to load another.
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
};

export default Home;
