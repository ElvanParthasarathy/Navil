import './Home.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HeroSection } from '../../components/features/home/HeroSection';
import MobileTopBar from '../../components/ui/MobileTopBar';
import profileData from '../../data/profile.json';
import profilePic from '../../assets/instagram/profile.jpg';
import { db } from '../../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';

// Import icons

import staticStories from '../../data/stories.json';
import staticArts from '../../data/arts.json';
import { ArrowRight, ArrowClockwise, User, InstagramLogo, Feather, Image, Compass, Info, BookOpen, Pen, ChatCircleText, PencilSimpleLine, Newspaper, MoonStars } from '@phosphor-icons/react';

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
    const [counts, setCounts] = useState({
        poems: 0,
        quotes: 0,
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
    const quotesSource = dbQuotes;
    const poemsSource = dbPoems;

    // Interactive quote carousel state (stably initialized once from cache or fallback)
    const [currentQuote, setCurrentQuote] = useState<any>(() => {
        const pool = dbQuotes;
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
        const pool = dbPoems;
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
                                            <Feather weight="regular" size={16} />
                                        </div>
                                        <div className="btn-text-group">
                                            <span className="btn-text-ta" lang="ta">எழுத்துகள்</span>
                                            <span className="btn-text-en">writings</span>
                                        </div>
                                    </button>
                                    <button onClick={() => navigate('/arts', { state: { fromQuickLink: true } })} className="mobile-quick-link-btn">
                                        <div className="btn-icon-wrapper">
                                            <Image weight="regular" size={16} />
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
                                <ArrowClockwise weight="regular" size={18} className={isPoemRotating ? 'rotate-icon' : ''} />
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
                                    Click here to read more <ArrowRight weight="regular" size={14} className="arrow" />
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
                                <ArrowClockwise weight="regular" size={18} className={isRotating ? 'rotate-icon' : ''} />
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
                                    Click here to read more <ArrowRight weight="regular" size={14} className="arrow" />
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

