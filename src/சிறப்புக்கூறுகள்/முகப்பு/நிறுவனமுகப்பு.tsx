import './முகப்பு.css';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import profileData from '../../தரவு/தன்னுரு.json';
import profilePic from '../../வளங்கள்/இன்ஸ்டாகிராம்/தன்னுரு.png';
import staticStories from '../../தரவு/கதைகள்.json';
import staticArts from '../../தரவு/கலைகள்.json';
import { 
    DownloadSimple, 
    ArrowRight, 
    BookOpen, 
    Sparkle, 
    TextAa, 
    Feather, 
    ChatCircleText, 
    Scroll, 
    Palette, 
    Compass
} from '@phosphor-icons/react';

export default function CompanyHome() {
    const navigate = useNavigate();

    // High quality covers from data
    const storyCover = staticStories?.[0]?.cover || "https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/stories/01_%E0%AE%9C%E0%AF%86%E0%AE%AF%E0%AF%8D_/001_470201373_18014247662659667_7928533396878174755_n_17858287635052256.jpg";
    const artCover = staticArts?.[0]?.image || "https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/elvan.jp/posts/202503/486661112_17917995261074513_4323922563204709560_n_17946532850955870.webp";

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
                {/* ANIMATED ABSTRACT GRADIENT BACKGROUND */}
                <div className="home-bg-blobs">
                    <div className="bg-blob-circle blob-1"></div>
                    <div className="bg-blob-circle blob-2"></div>
                </div>

                <div className="bento-grid">
                    {/* 1. STUDIO HERO HEADER */}
                    <header className="span-12 company-hero-card" style={{ cursor: 'default' }}>
                        <div className="company-hero-layout">
                            <div className="hero-avatar-area">
                                <div className="hero-avatar-bg-glow"></div>
                                <img
                                    src={profilePic}
                                    alt={profileData?.fullName || "Elvan Parthasarathy"}
                                    className="hero-avatar-image"
                                />
                            </div>
                            <div className="company-hero-text">
                                <h1 className="company-hero-title" lang="ta">எல்வன் நவில்</h1>
                                <h2 className="company-hero-subtitle">Elvan Navil</h2>
                                <p className="company-hero-desc-ta" lang="ta">
                                    நல்வரவு. இது எல்வன் நவில் — சிந்தனைகளை உரைக்க, எழுத்துகளைப் பகிர, தன்னுரிமை மென்பொருட்கள், தனித்துவ அச்சுக்கலை மற்றும் எண்மப் படைப்புகளைக் காட்சிப்படுத்தும் படைப்பரங்கு.
                                </p>
                                <p className="company-hero-desc-en">
                                    Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.
                                </p>
                                <div className="company-quick-actions">
                                    <button onClick={() => navigate('/navilgal')} className="company-pill-btn primary">
                                        <BookOpen weight="bold" size={16} />
                                        <span lang="ta">நவில்கள் (Archive)</span>
                                    </button>
                                    <button onClick={() => navigate('/tools')} className="company-pill-btn">
                                        <Sparkle weight="regular" size={16} />
                                        <span lang="ta">கருவிகள் (Tools)</span>
                                    </button>
                                    <button onClick={() => navigate('/downloads')} className="company-pill-btn">
                                        <DownloadSimple weight="regular" size={16} />
                                        <span lang="ta">பதிவிறக்கங்கள் (Downloads)</span>
                                    </button>
                                    <button onClick={() => navigate('/about')} className="company-pill-btn">
                                        <span>பற்றி (About)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* 2. DICTIONARY DEFINITION LAYOUT */}
                    <div className="span-12 dictionary-container" style={{ margin: '0 0 8px' }}>
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

                    {/* 3. NETFLIX-STYLE DIRECT ACCESS CARDS */}
                    <div className="span-12">
                        <div className="home-section-header">
                            <div className="home-section-badge">
                                <Compass weight="bold" size={14} />
                                <span>படைப்புகள் • CREATIVE ARCHIVE</span>
                            </div>
                            <h2 className="home-section-title" lang="ta">நவில் படைப்புகள் — நேரடி அணுகல்</h2>
                            <p className="home-section-desc">
                                Direct access to poetry, insights, narrative fiction, art gallery, and classical texts.
                            </p>
                        </div>

                        <div className="home-netflix-grid">
                            {/* Card 1: Poems */}
                            <Link to="/navilgal/ezhuthugal/poems" className="home-netflix-card">
                                <div 
                                    className="home-netflix-bg" 
                                    style={{ 
                                        background: 'radial-gradient(circle at 70% 30%, #4338ca 0%, #1e1b4b 60%, #09090b 100%)' 
                                    }} 
                                />
                                <div className="home-netflix-overlay" />
                                <div className="home-netflix-badge">
                                    <Feather weight="bold" size={13} />
                                    <span>நவில் மிழிகள் • POETRY</span>
                                </div>
                                <div className="home-netflix-content">
                                    <h3 className="home-netflix-title" lang="ta">கவிதைகள் & நவில் மிழிகள்</h3>
                                    <div className="home-netflix-subtitle">Lyrical Tamil Verses & Emotional Expressions</div>
                                    <p className="home-netflix-desc" lang="ta">
                                        என் உணர்வுகளையும் அழகியலையும் பேசும் ஓசைநயமிக்க கவிதை வரிகள் மற்றும் இதயத்துடிப்புகள்.
                                    </p>
                                    <div className="home-netflix-cta">
                                        <span>கவிதைகளை வாசிக்க</span>
                                        <ArrowRight weight="bold" size={15} />
                                    </div>
                                </div>
                            </Link>

                            {/* Card 2: Quotes */}
                            <Link to="/navilgal/ezhuthugal/quotes" className="home-netflix-card">
                                <div 
                                    className="home-netflix-bg" 
                                    style={{ 
                                        background: 'radial-gradient(circle at 30% 30%, #065f46 0%, #022c22 60%, #09090b 100%)' 
                                    }} 
                                />
                                <div className="home-netflix-overlay" />
                                <div className="home-netflix-badge">
                                    <ChatCircleText weight="bold" size={13} />
                                    <span>நவில் மொழிகள் • QUOTES</span>
                                </div>
                                <div className="home-netflix-content">
                                    <h3 className="home-netflix-title" lang="ta">சிந்தனைகள் & நவில் மொழிகள்</h3>
                                    <div className="home-netflix-subtitle">Aphorisms, Philosophy & Personal Insights</div>
                                    <p className="home-netflix-desc" lang="ta">
                                        என் பட்டறிவில் உதித்த ஆழ்ந்த சிந்தனைத் துளிகளும் வாழ்வியல் தத்துவங்களும்.
                                    </p>
                                    <div className="home-netflix-cta">
                                        <span>மொழிகளைப் பார்க்க</span>
                                        <ArrowRight weight="bold" size={15} />
                                    </div>
                                </div>
                            </Link>

                            {/* Card 3: Stories */}
                            <Link to="/navilgal/ezhuthugal/stories" className="home-netflix-card">
                                <img 
                                    src={storyCover} 
                                    alt="Stories Cover" 
                                    className="home-netflix-bg" 
                                    loading="lazy" 
                                />
                                <div className="home-netflix-overlay" />
                                <div className="home-netflix-badge">
                                    <BookOpen weight="bold" size={13} />
                                    <span>சிறுகதைகள் • STORIES</span>
                                </div>
                                <div className="home-netflix-content">
                                    <h3 className="home-netflix-title" lang="ta">சிறுகதைகள் & தொடர் கதைகள்</h3>
                                    <div className="home-netflix-subtitle">Immersive Fiction & Narrative Chronicles</div>
                                    <p className="home-netflix-desc" lang="ta">
                                        கற்பனையும் வாழ்வும் பின்னிப் பிணைந்த நெகிழ்ச்சியான மனிதக் கதைகள் மற்றும் தொடர்கள்.
                                    </p>
                                    <div className="home-netflix-cta">
                                        <span>கதைகளில் மூழ்குக</span>
                                        <ArrowRight weight="bold" size={15} />
                                    </div>
                                </div>
                            </Link>

                            {/* Card 4: Arts & Sketches */}
                            <Link to="/navilgal/arts" className="home-netflix-card">
                                <img 
                                    src={artCover} 
                                    alt="Art Gallery Cover" 
                                    className="home-netflix-bg" 
                                    loading="lazy" 
                                />
                                <div className="home-netflix-overlay" />
                                <div className="home-netflix-badge">
                                    <Palette weight="bold" size={13} />
                                    <span>கலைக்கூடம் • ART GALLERY</span>
                                </div>
                                <div className="home-netflix-content">
                                    <h3 className="home-netflix-title" lang="ta">கலைக்கூடம் & வரைபடங்கள்</h3>
                                    <div className="home-netflix-subtitle">Posters, Sketches & Digital Artworks</div>
                                    <p className="home-netflix-desc" lang="ta">
                                        கரிக்கோல் ஓவியங்கள், சுவரொட்டிகள் மற்றும் எண்ம வரைகலைகளின் பிரத்யேகக் காட்சி.
                                    </p>
                                    <div className="home-netflix-cta">
                                        <span>கலைக்கூடத்தைக் காண்க</span>
                                        <ArrowRight weight="bold" size={15} />
                                    </div>
                                </div>
                            </Link>

                            {/* Card 5: Classical Texts (Tolkappiyam & Thirukkural) */}
                            <Link to="/tools/arichuvadi/books" className="home-netflix-card">
                                <div 
                                    className="home-netflix-bg" 
                                    style={{ 
                                        background: 'radial-gradient(circle at 50% 30%, #78350f 0%, #451a03 60%, #09090b 100%)' 
                                    }} 
                                />
                                <div className="home-netflix-overlay" />
                                <div className="home-netflix-badge">
                                    <Scroll weight="bold" size={13} />
                                    <span>செவ்வியல் • CLASSICAL BOOKS</span>
                                </div>
                                <div className="home-netflix-content">
                                    <h3 className="home-netflix-title" lang="ta">தொல்காப்பியம் & திருக்குறள்</h3>
                                    <div className="home-netflix-subtitle">Ancient Literature in Modern, Brahmi & Vatteluttu</div>
                                    <p className="home-netflix-desc" lang="ta">
                                        தமிழின் உன்னத செவ்வியல் நூல்களை நவீன உரைநடை, ஆதித் தமிழி மற்றும் வட்டெழுத்தில் வாசிக்கும் தளம்.
                                    </p>
                                    <div className="home-netflix-cta">
                                        <span>செவ்வியல் நூல்கள்</span>
                                        <ArrowRight weight="bold" size={15} />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* 4. STUDIO INNOVATIONS: TYPOGRAPHY & SOFTWARE HIGHLIGHT */}
                    <section className="bento-card span-6 studio-teaser-card">
                        <div>
                            <div className="product-badge-row">
                                <span className="badge-tag purple">BESPOKE TYPEFACE</span>
                                <span className="badge-tag neutral">16 Styles</span>
                                <span className="badge-tag neutral">OFL 1.1</span>
                            </div>

                            <div className="product-header-row">
                                <div className="product-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                                    <TextAa weight="bold" size={32} color="#ffffff" />
                                </div>
                                <div>
                                    <h3 className="product-title" lang="ta">எல்வன் சான்ஸ்</h3>
                                    <p className="product-subtitle">Elvan Sans Font Family</p>
                                </div>
                            </div>

                            <p className="product-desc" lang="ta">
                                தமிழ் எழுத்துகளின் தனித்துவ அழகியலையும் லத்தீன் எழுத்துகளின் நவீன வடிவ அமைப்பையும் ஒன்றிணைத்து உருவாக்கப்பட்ட உயர்தர அச்சுரு.
                            </p>

                            <div className="font-specimen-box">
                                <div className="font-sample-ta" lang="ta">
                                    அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு.
                                </div>
                                <div className="font-sample-en">
                                    Harmonious weight-matched typography across English & Tamil.
                                </div>
                            </div>
                        </div>

                        <div className="product-action-row">
                            <Link to="/downloads#elvan-sans" className="company-pill-btn">
                                <span>அச்சுருவை பதிவிறக்குக (Get Font)</span>
                                <ArrowRight weight="bold" size={16} />
                            </Link>
                        </div>
                    </section>

                    <section className="bento-card span-6 studio-teaser-card">
                        <div>
                            <div className="product-badge-row">
                                <span className="badge-tag green">FLAGSHIP SOFTWARE</span>
                                <span className="badge-tag blue">v1.2.8</span>
                                <span className="badge-tag neutral">Windows 10 / 11</span>
                            </div>

                            <div className="product-header-row">
                                <div className="product-icon-box" style={{ background: '#128c7e' }}>
                                    <img 
                                        src="/nammil_icon.png" 
                                        alt="Nammil Icon" 
                                        className="product-icon-img"
                                        onError={(e: any) => { e.target.style.display = 'none'; }} 
                                    />
                                </div>
                                <div>
                                    <h3 className="product-title" lang="ta">நம்மில் (Nammil)</h3>
                                    <p className="product-subtitle">Multi-Account WhatsApp Companion for Windows</p>
                                </div>
                            </div>

                            <p className="product-desc" lang="ta">
                                5 கணக்குகள் வரை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக இயக்கவும், பதிவிறக்கங்களைத் தானாக ஒழுங்கமைக்கவும் உருவாக்கப்பட்ட தனியுரிமைக் கணினிச் செயலி.
                            </p>

                            <div className="font-specimen-box" style={{ padding: '14px 18px' }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                                    ✓ 5 Isolated Sessions & Zero Telemetry
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    Automated media sorter with native Windows chimes.
                                </div>
                            </div>
                        </div>

                        <div className="product-action-row">
                            <Link to="/downloads#nammil" className="company-pill-btn primary">
                                <DownloadSimple weight="bold" size={16} />
                                <span>நம்மில் பதிவிறக்கம் (Downloads Hub)</span>
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
