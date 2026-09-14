import './முகப்பு.css';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import profileData from '../../தரவு/தன்னுரு.json';
import profilePic from '../../வளங்கள்/இன்ஸ்டாகிராம்/தன்னுரு.png';
import { 
    DownloadSimple, 
    GithubLogo, 
    ArrowRight, 
    CheckCircle, 
    TextAa, 
    PianoKeys, 
    Translate, 
    BookOpen, 
    Sparkle, 
    ShieldCheck, 
    ArrowsClockwise, 
    Users, 
    FolderSimple, 
    BellSimpleRinging 
} from '@phosphor-icons/react';

export default function CompanyHome() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>எல்வன் நவில் | Elvan Navil</title>
                <meta name="description" content="Elvan Navil is an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature." />
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
                                    நல்வரவு. இது எல்வன் நவில் — சிந்தனைகளை உரைக்க, எழுத்துகளைப் பகிர, தன்னுரிமை மென்பொருட்கள், தனித்துவ அச்சுக்கலை மற்றும் எண்மப் படைப்புகளைக் காட்சிப்படுத்தும் வெளி.
                                </p>
                                <p className="company-hero-desc-en">
                                    Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.
                                </p>
                                <div className="company-quick-actions">
                                    <a href="#flagship-nammil" className="company-pill-btn primary">
                                        <DownloadSimple weight="bold" size={16} />
                                        <span>நம்மில் (Nammil)</span>
                                    </a>
                                    <button onClick={() => navigate('/navilgal')} className="company-pill-btn">
                                        <BookOpen weight="regular" size={16} />
                                        <span lang="ta">நவில்கள் (Archive)</span>
                                    </button>
                                    <button onClick={() => navigate('/tools')} className="company-pill-btn">
                                        <Sparkle weight="regular" size={16} />
                                        <span lang="ta">கருவிகள் (Tools)</span>
                                    </button>
                                    <button onClick={() => navigate('/about')} className="company-pill-btn">
                                        <span>பற்றி (About)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* 2. FLAGSHIP DESKTOP APP: NAMMIL (span-7) */}
                    <section id="flagship-nammil" className="bento-card span-7 product-card">
                        <div>
                            <div className="product-badge-row">
                                <span className="badge-tag green">FLAGSHIP DESKTOP APP</span>
                                <span className="badge-tag blue">v1.2.8</span>
                                <span className="badge-tag neutral">Windows 10 / 11</span>
                                <span className="badge-tag neutral">MIT License</span>
                            </div>

                            <div className="product-header-row">
                                <div className="product-icon-box" style={{ background: '#128c7e' }}>
                                    <img src="/nammil_icon.png" alt="Nammil App Icon" className="product-icon-img" onError={(e: any) => { e.target.style.display = 'none'; }} />
                                </div>
                                <div>
                                    <h3 className="product-title" lang="ta">நம்மில் (Nammil)</h3>
                                    <p className="product-subtitle">Sleek, Privacy-Focused Multi-Account WhatsApp Companion</p>
                                </div>
                            </div>

                            <p className="product-desc" lang="ta">
                                அதிகாரப்பூர்வ வாட்ஸ்அப் ஒரு கணக்கை மட்டுமே அனுமதிக்கும் தடையை உடைத்து, 5 கணக்குகள் வரை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக இயக்கவும், பதிவிறக்கங்களைத் தானாக ஒழுங்கமைக்கவும் உருவாக்கப்பட்ட நேர்த்தியான கணினிச் செயலி.
                            </p>

                            <div className="feature-bullets">
                                <div className="feature-bullet-item">
                                    <Users weight="bold" size={18} className="feature-bullet-icon" />
                                    <span><strong>5 Isolated Sessions</strong> with zero credential collision</span>
                                </div>
                                <div className="feature-bullet-item">
                                    <FolderSimple weight="bold" size={18} className="feature-bullet-icon" />
                                    <span><strong>Automated Organizer</strong> sorting media by format</span>
                                </div>
                                <div className="feature-bullet-item">
                                    <BellSimpleRinging weight="bold" size={18} className="feature-bullet-icon" />
                                    <span><strong>Native Windows Chimes</strong> with unread counters</span>
                                </div>
                                <div className="feature-bullet-item">
                                    <ShieldCheck weight="bold" size={18} className="feature-bullet-icon" />
                                    <span><strong>100% Local Privacy</strong> with zero remote telemetry</span>
                                </div>
                            </div>
                        </div>

                        <div className="product-action-row">
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil/releases/download/v1.2.8/Nammil-Setup.exe" 
                                className="company-pill-btn primary"
                                download
                            >
                                <DownloadSimple weight="bold" size={18} />
                                <span>Download Nammil (.exe ~114MB)</span>
                            </a>
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="company-pill-btn"
                            >
                                <GithubLogo weight="regular" size={18} />
                                <span>GitHub Repository</span>
                            </a>
                        </div>
                    </section>

                    {/* 3. BESPOKE TYPOGRAPHY: ELVAN SANS (span-5) */}
                    <section className="bento-card span-5 product-card">
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
                                தமிழ் எழுத்துகளின் தனித்துவ அழகியலையும் லத்தீன் எழுத்துகளின் நவீன வடிவ அமைப்பையும் ஒன்றிணைத்து எல்வன் பார்த்தசாரதியால் உருவாக்கப்பட்ட உயர்தர அச்சுரு.
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
                            <a 
                                href="https://github.com/ElvanParthasarathy" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="company-pill-btn"
                            >
                                <span>Explore Typeface</span>
                                <ArrowRight weight="bold" size={16} />
                            </a>
                        </div>
                    </section>

                    {/* 4. WEB TOOLS & ENGINES (span-6) */}
                    <section className="bento-card span-6">
                        <div>
                            <div className="product-badge-row">
                                <span className="badge-tag neutral">WEB TOOLS & ENGINES</span>
                                <span className="badge-tag green">Interactive</span>
                            </div>

                            <h3 className="product-title" style={{ fontSize: '1.4rem' }} lang="ta">
                                நவில் கருவிகள் & இயங்குதளங்கள்
                            </h3>
                            <p className="product-subtitle" style={{ marginBottom: '14px' }}>
                                Native web applications and phonetic linguistic engines
                            </p>

                            <div className="tools-compact-list">
                                <Link to="/tools/transliterator" className="tool-compact-row">
                                    <div className="tool-row-left">
                                        <div className="tool-row-icon">
                                            <Translate weight="bold" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="tool-row-title" lang="ta">தொல்காப்பிய மொழிமாற்றி</h4>
                                            <p className="tool-row-desc">Phonetic English-to-Tamil typing based on Tolkappiyam</p>
                                        </div>
                                    </div>
                                    <ArrowRight weight="bold" size={16} />
                                </Link>

                                <Link to="/tools/piano" className="tool-compact-row">
                                    <div className="tool-row-left">
                                        <div className="tool-row-icon">
                                            <PianoKeys weight="bold" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="tool-row-title" lang="ta">எல்வன் கின்னரப்பெட்டி</h4>
                                            <p className="tool-row-desc">Interactive virtual piano synthesizer with keyboard mapping</p>
                                        </div>
                                    </div>
                                    <ArrowRight weight="bold" size={16} />
                                </Link>

                                <Link to="/tools/arichuvadi" className="tool-compact-row">
                                    <div className="tool-row-left">
                                        <div className="tool-row-icon">
                                            <BookOpen weight="bold" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="tool-row-title" lang="ta">நவில் அரிச்சுவடி</h4>
                                            <p className="tool-row-desc">Convert modern Tamil into ancient Thamizhi and Vatteluttu</p>
                                        </div>
                                    </div>
                                    <ArrowRight weight="bold" size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* 5. GATEWAY TO NAVILGAL ARCHIVE (span-6) */}
                    <section 
                        className="bento-card span-6 navilgal-gateway-card"
                        onClick={() => navigate('/navilgal')}
                    >
                        <div>
                            <div className="product-badge-row">
                                <span className="badge-tag purple">LITERARY & ART ARCHIVE</span>
                                <span className="badge-tag neutral">Cultural Realm</span>
                            </div>

                            <h3 className="product-title" style={{ fontSize: '1.5rem', color: 'var(--text-main)' }} lang="ta">
                                எல்வனின் நவில்கள்
                            </h3>
                            <p className="product-subtitle" style={{ color: 'var(--text-muted)' }}>
                                Elvanin Navilgal — The Literary & Artistic Archive
                            </p>

                            <p className="product-desc" style={{ marginTop: '12px' }} lang="ta">
                                சிந்தனைகளை உரைக்க, உணர்வுகளைப் பகிர, ஓவியங்களையும் கவிதைகளையும் காட்சிப்படுத்தும் தனித்துவ இலக்கியச் சோலை.
                            </p>

                            <div className="navilgal-pills">
                                <span className="navilgal-pill" lang="ta">✨ நவில் மிழிகள் (Poems)</span>
                                <span className="navilgal-pill" lang="ta">💬 நவில் மொழிகள் (Quotes)</span>
                                <span className="navilgal-pill" lang="ta">📖 சிறுகதைகள் (Stories)</span>
                                <span className="navilgal-pill" lang="ta">🎨 கரிக்கோல் ஓவியங்கள் (Arts)</span>
                                <span className="navilgal-pill" lang="ta">📝 நாளேடு (Diary)</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontWeight: 700, fontSize: '0.95rem' }}>
                            <span>நவில்களில் நுழைக • Enter Archive</span>
                            <ArrowRight weight="bold" size={18} />
                        </div>
                    </section>

                    {/* 6. DICTIONARY DEFINITION LAYOUT (span-12) */}
                    <div className="span-12 dictionary-container" style={{ margin: '8px 0 0' }}>
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
                </div>
            </div>
        </>
    );
}
