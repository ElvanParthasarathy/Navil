import './முகப்பு.css';
import '../பதிவிறக்கங்கள்/பதிவிறக்கங்கள்.css';
import '../படைப்புகள்/படைப்புகள்.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { ArrowRight, ArrowClockwise, Translate } from '@phosphor-icons/react';
import { db } from '../../நூலகம்/ஃபயர்பேஸ்/வாடிக்கையாளர்';
import { ref, onValue } from 'firebase/database';

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

const DEFAULT_QUOTE = {
    id: '',
    classification: 'அகம்',
    main: 'சொல்லில் உயர்வு தமிழ்ச் சொல்லே — அதைத் தொழுது படித்திடடி பாப்பா!',
    sub: 'Tamil is the loftiest of spoken tongues — revere and recite it, young child.',
    tag: 'பாரதியார் • Bharathiyar',
    mainLang: 'ta',
    subLang: 'en'
};

const DEFAULT_POEM = {
    id: '',
    classification: 'புறம்',
    theme: 'இலக்கியம் • Literature',
    main: {
        title: 'செந்தமிழ் நாடெனும் போதினிலே',
        text: 'செந்தமிழ் நாடெனும் போதினிலே — இன்பத்\nதேன்வந்து பாயுது காதினிலே!',
        isTruncated: false,
        lang: 'ta'
    },
    sub: {
        title: '',
        text: 'When the words "Land of Senthamizh" ring, sweet nectar pours into our ears.',
        isTruncated: false,
        lang: 'en'
    }
};

const getTruncatedVerse = (rawText: string) => {
    if (!rawText) return { text: '', isTruncated: false };
    const clean = cleanHtmlTags(rawText);
    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 2) {
        return { text: lines.join('\n'), isTruncated: false };
    }
    return {
        text: lines.slice(0, 2).join('\n') + '\n...',
        isTruncated: true
    };
};

const getQuoteTexts = (quoteObj: any) => {
    if (!quoteObj) return DEFAULT_QUOTE;

    let variants = quoteObj.variants || [];
    if (variants && !Array.isArray(variants)) {
        variants = Object.values(variants);
    }

    let quoteTags: string[] = [];
    if (Array.isArray(quoteObj.tags)) {
        quoteTags = quoteObj.tags.map((t: any) => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
    } else if (quoteObj.tags && typeof quoteObj.tags === 'string') {
        quoteTags = quoteObj.tags.split(',').map((t: any) => t.trim()).filter(Boolean);
    }

    if (quoteTags.length === 0) {
        quoteTags = [quoteObj.tag, quoteObj.theme].map((t: any) => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
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
            main: cleanHtmlTags(rawText) || DEFAULT_QUOTE.main,
            sub: subText || DEFAULT_QUOTE.sub,
            tag: finalQuoteTag,
            mainLang: quoteObj.lang || 'ta',
            subLang: subLang
        };
    }

    let mainVar = variants[0];
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
        main: mainVar ? cleanHtmlTags(mainVar.text) : DEFAULT_QUOTE.main,
        sub: subText || null,
        tag: finalQuoteTag,
        mainLang: mainVar ? mainVar.lang : 'ta',
        subLang: subLang
    };
};

const getPoemDetails = (poemObj: any) => {
    if (!poemObj) return DEFAULT_POEM;

    let terms: string[] = [];
    if (Array.isArray(poemObj.tags)) {
        terms = poemObj.tags.map((t: any) => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
    } else if (poemObj.tags && typeof poemObj.tags === 'string') {
        terms = poemObj.tags.split(',').map((t: any) => t.trim()).filter(Boolean);
    }

    if (terms.length === 0) {
        terms = [poemObj.theme, poemObj.style, poemObj.meter].map((t: any) => t && typeof t === 'string' ? t.trim() : '').filter(Boolean);
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
            subDetail = { title: '', text: subTrunc.text, isTruncated: subTrunc.isTruncated, lang: 'en' };
        } else if (poemObj.translation) {
            const subTrunc = getTruncatedVerse(poemObj.translation);
            subDetail = { title: '', text: subTrunc.text, isTruncated: subTrunc.isTruncated, lang: 'en' };
        }
        return {
            id: poemObj.id || '',
            classification: poemObj.classification || '',
            theme: finalTheme,
            main: {
                title: poemObj.title || 'Untitled',
                text: trunc.text || DEFAULT_POEM.main.text,
                isTruncated: trunc.isTruncated,
                lang: poemObj.lang || 'ta'
            },
            sub: subDetail || DEFAULT_POEM.sub
        };
    }

    let mainVar = variants[0];
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

export default function CompanyHome() {
    const navigate = useNavigate();

    // Card ripple for Nammil card
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const handleCardMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { id: Date.now(), x, y };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 700);
    };

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

    // Carousel states
    const [currentQuote, setCurrentQuote] = useState<any>(() => {
        return dbQuotes.length > 0 ? dbQuotes[Math.floor(Math.random() * dbQuotes.length)] : null;
    });
    const [isQuoteFading, setIsQuoteFading] = useState(false);
    const [isQuoteRotating, setIsQuoteRotating] = useState(false);

    const [currentPoem, setCurrentPoem] = useState<any>(() => {
        return dbPoems.length > 0 ? dbPoems[Math.floor(Math.random() * dbPoems.length)] : null;
    });
    const [isPoemFading, setIsPoemFading] = useState(false);
    const [isPoemRotating, setIsPoemRotating] = useState(false);

    // Fetch live quotes and poems from Firebase Database in real-time
    useEffect(() => {
        const unsubs: (() => void)[] = [];
        try {
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
            }, () => {});
            unsubs.push(unsubQuotes);

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
            }, () => {});
            unsubs.push(unsubPoems);
        } catch (e) {
            console.error("Firebase Database read error on CompanyHome:", e);
        }
        return () => {
            unsubs.forEach(fn => fn());
        };
    }, []);

    // Synchronize initial selections if empty
    useEffect(() => {
        if (dbQuotes.length > 0 && !currentQuote) {
            setCurrentQuote(dbQuotes[Math.floor(Math.random() * dbQuotes.length)]);
        }
    }, [dbQuotes]);

    useEffect(() => {
        if (dbPoems.length > 0 && !currentPoem) {
            setCurrentPoem(dbPoems[Math.floor(Math.random() * dbPoems.length)]);
        }
    }, [dbPoems]);

    const handleNewQuote = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!dbQuotes || dbQuotes.length <= 1) return;
        setIsQuoteFading(true);
        setIsQuoteRotating(true);
        setTimeout(() => {
            let next;
            do {
                next = dbQuotes[Math.floor(Math.random() * dbQuotes.length)];
            } while (currentQuote && next.id === currentQuote.id);
            setCurrentQuote(next);
            setIsQuoteFading(false);
            setTimeout(() => setIsQuoteRotating(false), 500);
        }, 300);
    };

    const handleNewPoem = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!dbPoems || dbPoems.length <= 1) return;
        setIsPoemFading(true);
        setIsPoemRotating(true);
        setTimeout(() => {
            let next;
            do {
                next = dbPoems[Math.floor(Math.random() * dbPoems.length)];
            } while (currentPoem && next.id === currentPoem.id);
            setCurrentPoem(next);
            setIsPoemFading(false);
            setTimeout(() => setIsPoemRotating(false), 500);
        }, 300);
    };

    const quoteTexts = getQuoteTexts(currentQuote);
    const poemDetails = getPoemDetails(currentPoem);

    const handleQuoteCardClick = () => {
        if (quoteTexts.id) {
            navigate(`/navilgal/writings/quotes/${quoteTexts.id}`);
        } else {
            navigate('/navilgal/writings/quotes');
        }
    };

    const handlePoemCardClick = () => {
        if (poemDetails.id) {
            navigate(`/navilgal/writings/poems/${poemDetails.id}`);
        } else {
            navigate('/navilgal/writings/poems');
        }
    };

    return (
        <>
            <Helmet>
                <title>எல்வன் நவில் | Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Elvan Navil is an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/" />
            </Helmet>
            <MobileTopBar title="எல்வன் நவில்" />
            
            <div className="home-page company-home-page page-view fadeIn">
                {/* 1. STUDIO HEADER */}
                <header className="home-brand-header animate-entry">
                    <h1 className="home-brand-title" lang="ta">
                        எல்வன் நவில்
                    </h1>
                    <div className="home-brand-title-sub">Elvan Navil</div>
                    <p className="home-brand-subtitle" lang="ta">
                        நல்வரவு. இது எல்வன் நவில் — சிந்தனைமிக்க கணினி மென்பொருட்கள், தனித்துவ அச்சுக்கலை மற்றும் இருமொழி இலக்கியங்களை நேர்த்தியாக உருவாக்கும் தன்னுரிமை எண்மப் படைப்பரங்கு.
                    </p>
                    <p className="home-brand-subtitle home-brand-subtitle-en">
                        Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.
                    </p>
                </header>

                {/* 2. BRAND DEFINITION & ETYMOLOGY */}
                <div className="dictionary-container animate-entry">
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

                {/* 3. FEATURED PRODUCTS: NAMMIL & NAVIL TRANSLITERATOR (SIDE BY SIDE) */}
                <section className="home-section animate-entry" style={{ marginTop: '48px' }}>
                    <div className="home-section-header" style={{ margin: '0 0 20px', paddingBottom: '8px' }}>
                        <div className="home-section-badge">படைப்புகள் • Featured Creations</div>
                        <h2 className="home-section-title" lang="ta">மென்பொருள் & கருவிகள்</h2>
                        <div className="home-section-desc">Software & Linguistic Tools</div>
                    </div>

                    <div className="bento-grid" style={{ marginTop: 0 }}>
                        {/* CARD 1: NAMMIL */}
                        <div className="span-6" style={{ display: 'flex' }}>
                            <Link 
                                to="/downloads/nammil" 
                                className="store-app-card" 
                                style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                                title="Nammil — Multi-Account WhatsApp Companion"
                                onMouseDown={handleCardMouseDown}
                            >
                                {ripples.map(ripple => (
                                    <span 
                                        key={ripple.id} 
                                        className="store-card-ripple" 
                                        style={{ left: ripple.x, top: ripple.y }} 
                                    />
                                ))}
                                <div>
                                    {/* TOP ROW: ICON + TITLE + FREE PILL */}
                                    <div className="store-card-header">
                                        <div className="store-card-identity">
                                            <img 
                                                src="/nammil_icon.png" 
                                                alt="Nammil App Icon" 
                                                className="store-card-icon"
                                                onError={(e: any) => { e.target.style.display = 'none'; }}
                                            />
                                            <div className="store-card-title-wrap">
                                                <h2 className="store-card-title">
                                                    <span className="store-card-name-ta" lang="ta">நம்மில்</span>
                                                    <span className="store-card-name-en">Nammil</span>
                                                </h2>
                                                <div className="store-card-meta">
                                                    <span>Social & Productivity • சமூகம்</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="store-card-pill">Free</div>
                                    </div>

                                    {/* TEASER DESCRIPTION */}
                                    <div className="store-card-desc-wrap" style={{ marginTop: '16px' }}>
                                        <p className="store-card-desc store-card-desc-ta" lang="ta">
                                            பல கணக்கு அமர்வுகள், தானியங்கி ஊடக ஒழுங்கமைப்பு மற்றும் விண்டோஸ் அறிவிப்புகளுடன் வாட்ஸ்அப்பிற்கான நவீன கணினித் துணைச்செயலி.
                                        </p>
                                        <p className="store-card-desc store-card-desc-en">
                                            A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions and media organization.
                                        </p>
                                    </div>
                                </div>

                                {/* SCREENSHOT PREVIEW BANNER */}
                                <div className="store-card-banner-frame" style={{ marginTop: '18px' }}>
                                    <img 
                                        src="/nammil/slide_1.webp" 
                                        alt="Nammil Desktop Screenshot Preview" 
                                        className="store-card-banner-img"
                                        loading="eager"
                                    />
                                </div>
                            </Link>
                        </div>

                        {/* CARD 2: NAVIL TRANSLITERATOR */}
                        <div className="span-6" style={{ display: 'flex' }}>
                            <Link 
                                to="/tools/transliterator" 
                                className="category-card"
                                style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 'auto' }}
                                title="Navil Transliterator — Phonetic Latin-to-Tamil typing engine"
                            >
                                <div>
                                    <div className="cat-icon-box"><Translate weight="regular" /></div>
                                    <div className="cat-content" style={{ marginTop: '16px' }}>
                                        <div className="cat-title">
                                            நவில் மொழிமாற்றி
                                            <span className="cat-beta-badge">BETA</span>
                                        </div>
                                        <div className="cat-title-sub">Navil Transliterator</div>
                                        <p className="cat-desc" lang="ta">தொல்காப்பிய இலக்கண ஒலிபெயர்ப்பு முறைமை.</p>
                                        <p className="cat-desc-sub">Phonetic Latin-to-Tamil typing engine.</p>
                                    </div>
                                </div>
                                <div className="cat-footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                    மொழிமாற்றியைத் தொடங்க <ArrowRight weight="regular" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 5. REFLECTIONS & POETRY - NAVIL MIZHIGAL & MOZHIGAL */}
                <section className="home-section animate-entry" style={{ marginTop: '48px' }}>
                    <div className="home-section-header" style={{ margin: '0 0 20px', paddingBottom: '8px' }}>
                        <div className="home-section-badge">இலக்கியம் • Literature</div>
                        <h2 className="home-section-title" lang="ta">நவில்கள்</h2>
                        <div className="home-section-desc">Reflections & Lyrical Literature</div>
                    </div>

                    <div className="bento-grid" style={{ marginTop: 0 }}>
                        {/* POEM PLAYER */}
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
                                <p className="player-main-text" lang={poemDetails.main.lang}>
                                    {poemDetails.main.text}
                                </p>

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

                        {/* QUOTE PLAYER */}
                        <section className="bento-card span-6 quote-bento clickable-card" onClick={handleQuoteCardClick}>
                            <div className="quote-header-row">
                                <span className="quote-tag-badge" lang="ta">நவில் மொழிகள் • Navil Quotes</span>
                                <button
                                    className="quote-refresh-btn"
                                    onClick={handleNewQuote}
                                    title="Read another reflection"
                                    aria-label="Read another reflection"
                                >
                                    <ArrowClockwise weight="regular" size={18} className={isQuoteRotating ? 'rotate-icon' : ''} />
                                </button>
                            </div>

                            <div className="player-display" style={{ opacity: isQuoteFading ? 0 : 1 }}>
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
                </section>
                
                {/* 6. FOOTER */}
                <footer style={{ marginTop: '64px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '32px' }}>
                    <p style={{ margin: '0 0 10px', fontWeight: 600 }}>© 2026 Elvan Navil (எல்வன் நவில்) • Bilingual Digital Creation Studio</p>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', margin: 0 }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>முகப்பு / Home</Link>
                        <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>பற்றி / About</Link>
                        <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>தொடர்பு / Contact</Link>
                        <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>தனியுரிமைக் கொள்கை / Privacy</Link>
                        <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>விதிமுறைகள் / Terms</Link>
                        <Link to="/disclaimer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>பொறுப்புத் துறப்பு / Disclaimer</Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
