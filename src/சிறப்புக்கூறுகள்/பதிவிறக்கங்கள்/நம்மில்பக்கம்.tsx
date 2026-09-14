import './பதிவிறக்கங்கள்.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import {
    DownloadSimple,
    GithubLogo,
    ShieldCheck,
    FolderSimple,
    BellSimpleRinging,
    Users,
    CaretLeft,
    CaretRight,
    ArrowsOutSimple,
    X,
    Star,
    Desktop,
    Sparkle,
    ShareNetwork
} from '@phosphor-icons/react';

const slides = [
    {
        src: '/nammil/slide_1.webp',
        label: 'Account 1',
        titleTa: 'பல கணக்குகள் • முதன்மை கணக்கு',
        titleEn: 'Multi Accounts • Primary Session',
        descTa: 'தனித்தனி வாட்ஸ்அப் அமர்வுகளுடன் பாதுகாப்பான மற்றும் வேகமான உரையாடல்.',
        descEn: 'Run your primary WhatsApp session with native audio notifications and isolated cookies.'
    },
    {
        src: '/nammil/slide_2.webp',
        label: 'Account 2',
        titleTa: 'பல கணக்குகள் • இரண்டாம் கணக்கு',
        titleEn: 'Multi Accounts • Secondary Session',
        descTa: 'வணிகம் மற்றும் தனிப்பட்ட வாட்ஸ்அப் கணக்குகளை ஒரே நேரத்தில் இயக்கும் வசதி.',
        descEn: 'Switch seamlessly between personal and work WhatsApp accounts without browser switching.'
    },
    {
        src: '/nammil/slide_3.webp',
        label: 'Media Sorter',
        titleTa: 'தானியங்கி கோப்பு வரிசையாக்கம்',
        titleEn: 'Automated Media Sorter',
        descTa: 'பதிவிறக்கம் செய்யப்படும் கோப்புகளைத் தானாக படங்கள், ஆவணங்கள், ஒலிக் கோப்புகளாக ஒழுங்கமைக்கும் வசதி.',
        descEn: 'Automatically categorizes incoming WhatsApp downloads into dedicated organized folders.'
    },
    {
        src: '/nammil/slide_4.webp',
        label: 'Notifications',
        titleTa: 'செயலியில் உடனடி அறிவிப்புகள்',
        titleEn: 'In-App Notification Feed',
        descTa: 'அனைத்து கணக்குகளின் உள்வரும் தகவல்களையும் ஒரே மேடையிலிருந்து எளிதாகப் பார்வையிடும் வசதி.',
        descEn: 'Aggregated notification manager with unread badge counters and native chime sound support.'
    },
    {
        src: '/nammil/slide_5.webp',
        label: 'Settings',
        titleTa: 'அமைப்புகள் & செயலி விவரம்',
        titleEn: 'Settings & About Nammil',
        descTa: 'கணக்குகள் மேலாண்மை, தானியங்கி புதுப்பிப்பு மற்றும் 100% உள்ளூர் தனியுரிமை பாதுகாப்பு.',
        descEn: 'Fine-tune app preferences, storage paths, and enjoy 100% local privacy with zero telemetry.'
    },
    {
        src: '/nammil/slide_6.webp',
        label: 'Brand',
        titleTa: 'நம்மில் • அடையாள முத்திரை',
        titleEn: 'Nammil • Brand Identity',
        descTa: 'தமிழ், ஆங்கிலம், மலையாள மொழிகளில் எல்வன் நவிலின் அதிகாரப்பூர்வ முத்திரை.',
        descEn: 'Official identity marks for Nammil across Tamil, English, and Malayalam typography.'
    }
];

const discoverMoreApps = [
    {
        name: 'நவில் (Navil) • Desktop Suite',
        tag: 'Free',
        category: 'Native Workspace',
        to: '/downloads',
        iconBg: '#00a884',
        iconText: 'ந',
        external: false
    },
    {
        name: 'ஒலிபெயர்ப்பி (Transliterator)',
        tag: 'Web App',
        category: 'Tamil Phonetic Tool',
        to: '/tools/transliterator',
        iconBg: 'linear-gradient(135deg, #e1306c, #833ab4)',
        iconText: 'ஒ',
        external: false
    },
    {
        name: 'அரிச்சுவடி (Arichuvadi)',
        tag: 'Web App',
        category: 'Alphabet & Linguistics',
        to: '/tools/arichuvadi',
        iconBg: '#0084ff',
        iconText: 'அ',
        external: false
    },
    {
        name: 'Nammil Source & Releases',
        tag: 'v1.2.9',
        category: 'GitHub Repository',
        to: 'https://github.com/ElvanParthasarathy/Nammil',
        iconBg: '#24292e',
        iconText: '⚡',
        external: true
    }
];

export default function NammilPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) nextSlide();
        if (distance < -50) prevSlide();
        setTouchStart(null);
        setTouchEnd(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <Helmet>
                <title>நம்மில் (Nammil) | Desktop App — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Nammil is a sleek, privacy-focused desktop companion for WhatsApp allowing up to 5 isolated sessions simultaneously on Windows." 
                />
            </Helmet>

            <MobileTopBar title="நம்மில்" />
            <FloatingBackButton to="/downloads" label="பதிவிறக்கங்கள்" />

            <div className="ms-store-page page-view fadeIn">
                {/* AMBIENT BRAND GLOW (MICROSOFT STORE ATMOSPHERE) */}
                <div className="ms-ambient-glow" aria-hidden="true" />

                <div className="ms-store-container">
                    {/* 1. APP HERO (MICROSOFT STORE HEADER) */}
                    <header className="ms-hero-card animate-entry">
                        {/* LARGE APP ICON */}
                        <div className="ms-app-icon-wrap">
                            <img 
                                src="/nammil_icon.png" 
                                alt="Nammil App Icon" 
                                className="ms-app-icon-img"
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                        </div>

                        {/* APP DETAILS & ACTIONS */}
                        <div className="ms-hero-meta">
                            <h1 className="ms-app-title">
                                <span className="ms-title-main" lang="ta">நம்மில்</span>
                                <span className="ms-title-sub">WhatsApp Companion</span>
                            </h1>

                            <div className="ms-developer-link">
                                <Link to="/about">Elvan Navil</Link>
                            </div>

                            {/* RATINGS & CATEGORY ROW */}
                            <div className="ms-rating-row">
                                <div className="ms-stars-group">
                                    <span className="ms-rating-score">5.0</span>
                                    <div className="ms-stars-icons" aria-label="5 out of 5 stars">
                                        <Star weight="fill" size={14} className="star-filled" />
                                        <Star weight="fill" size={14} className="star-filled" />
                                        <Star weight="fill" size={14} className="star-filled" />
                                        <Star weight="fill" size={14} className="star-filled" />
                                        <Star weight="fill" size={14} className="star-filled" />
                                    </div>
                                </div>
                                <span className="ms-meta-divider">•</span>
                                <span className="ms-ratings-count">128 ratings</span>
                                <span className="ms-meta-divider">•</span>
                                <span className="ms-category-tag">Social & Productivity</span>
                            </div>

                            {/* FEATURE PILLS */}
                            <div className="ms-chips-row">
                                <div className="ms-feature-chip">
                                    <Desktop weight="bold" size={14} />
                                    <span>Built for Windows 10 & 11</span>
                                </div>
                                <div className="ms-feature-chip">
                                    <ShieldCheck weight="bold" size={14} />
                                    <span>100% Local Privacy</span>
                                </div>
                                <div className="ms-feature-chip">
                                    <Sparkle weight="bold" size={14} />
                                    <span>Multi-Account Engine</span>
                                </div>
                            </div>

                            {/* SHORT TEASER DESCRIPTION */}
                            <p className="ms-hero-desc" lang="ta">
                                அதிகாரப்பூர்வ வாட்ஸ்அப் ஒரு கணக்கை மட்டுமே அனுமதிக்கும் தடையை உடைத்து, 5 கணக்குகள் வரை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக இயக்கும் எல்வன் நவிலின் கணினிச் செயலி.
                            </p>
                            <p className="ms-hero-desc ms-hero-desc-en">
                                Run up to 5 isolated WhatsApp sessions concurrently on Windows with automated file sorting, local cookie silos, and native chimes.
                            </p>

                            {/* ACTION BUTTON ROW */}
                            <div className="ms-action-row">
                                <a 
                                    href="https://github.com/ElvanParthasarathy/Nammil/releases/latest/download/Nammil-Setup.exe" 
                                    className="ms-btn-primary"
                                    download
                                >
                                    <DownloadSimple weight="bold" size={18} />
                                    <span>Download (.exe ~114MB)</span>
                                </a>

                                <a 
                                    href="https://github.com/ElvanParthasarathy/Nammil" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="ms-btn-icon"
                                    title="GitHub Repository"
                                    aria-label="GitHub Repository"
                                >
                                    <GithubLogo weight="regular" size={20} />
                                </a>

                                <button 
                                    className="ms-btn-icon"
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: 'நம்மில் (Nammil) - Multi-Account WhatsApp Companion',
                                                url: window.location.href
                                            }).catch(() => {});
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Link copied to clipboard!');
                                        }
                                    }}
                                    title="Share Nammil"
                                    aria-label="Share Nammil"
                                >
                                    <ShareNetwork weight="regular" size={20} />
                                </button>
                            </div>

                            {/* AGE / PRIVACY BADGE CARD */}
                            <div className="ms-rating-badge-card">
                                <div className="ms-age-box">
                                    <span className="ms-age-num">3+</span>
                                </div>
                                <div className="ms-age-meta">
                                    <div className="ms-age-title">Safe & Private</div>
                                    <div className="ms-age-sub">Zero Telemetry • Local Silos Only</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* 2. STORE BODY: 2-COLUMN SPLIT */}
                    <div className="ms-store-body">
                        {/* LEFT MAIN COLUMN: SCREENSHOTS + DESCRIPTION + FEATURES */}
                        <div className="ms-main-col">
                            {/* SCREENSHOTS CAROUSEL */}
                            <section className="ms-section ms-screenshots-section" aria-label="Screenshots">
                                <div className="ms-section-header-link" onClick={() => setIsFullscreen(true)}>
                                    <h2 className="ms-section-title">Screenshots</h2>
                                    <CaretRight size={18} weight="bold" className="ms-section-chevron" />
                                </div>

                                {/* VIEWPORT WITH PEEKING NEXT SLIDE */}
                                <div 
                                    className="ms-screenshot-viewport"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <button 
                                        className="ms-nav-arrow prev" 
                                        onClick={prevSlide}
                                        aria-label="Previous screenshot"
                                    >
                                        <CaretLeft size={20} weight="bold" />
                                    </button>

                                    <div className="ms-carousel-track">
                                        {/* ACTIVE SLIDE */}
                                        <div 
                                            className="ms-screenshot-card active"
                                            onClick={() => setIsFullscreen(true)}
                                            title="Click for fullscreen preview"
                                        >
                                            <img 
                                                src={slides[currentSlide].src} 
                                                alt={slides[currentSlide].titleEn} 
                                                className="ms-slide-img"
                                                loading="eager"
                                            />
                                            <div className="ms-slide-zoom-hint">
                                                <ArrowsOutSimple size={18} weight="bold" />
                                            </div>
                                        </div>

                                        {/* PEEKING NEXT SLIDE */}
                                        <div 
                                            className="ms-screenshot-card peek"
                                            onClick={nextSlide}
                                            title="Click to view next screenshot"
                                        >
                                            <img 
                                                src={slides[(currentSlide + 1) % slides.length].src} 
                                                alt={slides[(currentSlide + 1) % slides.length].titleEn} 
                                                className="ms-slide-img"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        className="ms-nav-arrow next" 
                                        onClick={nextSlide}
                                        aria-label="Next screenshot"
                                    >
                                        <CaretRight size={20} weight="bold" />
                                    </button>
                                </div>

                                {/* PILL NAVIGATION BAR */}
                                <div className="ms-slide-tabs-row" role="tablist">
                                    {slides.map((slide, idx) => (
                                        <button
                                            key={idx}
                                            role="tab"
                                            aria-selected={currentSlide === idx}
                                            className={`ms-slide-pill ${currentSlide === idx ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(idx)}
                                        >
                                            <span className="ms-pill-index">{idx + 1}</span>
                                            <span className="ms-pill-text">{slide.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* CAPTION CARD */}
                                <div className="ms-slide-caption-box">
                                    <div className="ms-caption-title-row">
                                        <h3 className="ms-caption-title-ta">{slides[currentSlide].titleTa}</h3>
                                        <span className="ms-caption-title-en">{slides[currentSlide].titleEn}</span>
                                    </div>
                                    <p className="ms-caption-desc-ta">{slides[currentSlide].descTa}</p>
                                    <p className="ms-caption-desc-en">{slides[currentSlide].descEn}</p>
                                </div>
                            </section>

                            {/* DESCRIPTION SECTION */}
                            <section className="ms-section ms-desc-section">
                                <h2 className="ms-section-title">Description</h2>
                                <div className="ms-desc-body">
                                    <p lang="ta">
                                        வாட்ஸ்அப் கணினிக்கான அதிகாரப்பூர்வ செயலி ஒரே நேரத்தில் ஒரு கணக்கை மட்டுமே அனுமதிக்கிறது. வணிகம், அலுவலகப் பணி, குடும்பம் மற்றும் தனிப்பட்ட உரையாடல்களுக்கு வெவ்வேறு கணக்குகளைப் பயன்படுத்துவோர் அடிக்கடி வெளியேறி உள்நுழையவோ அல்லது பிரவுசர்களில் மாற்றி மாற்றி இயக்கவோ வேண்டியுள்ளது.
                                    </p>
                                    <p lang="ta">
                                        <strong>நம்மில் (Nammil)</strong> இக்குறைபாட்டை முழுமையாகக் களைய உருவாக்கப்பட்டது. நவீன எலக்ட்ரான் தொழில்நுட்பத்தில் இயங்கும் இச்செயலி, 5 கணக்குகள் வரை ஒரே மேடையில் தனித்தனி சாளரங்களாகப் பிரித்து பாதுகாப்பாக இயக்குகிறது.
                                    </p>
                                    <p>
                                        Nammil breaks the single-account barrier of official desktop WhatsApp. With separate cookie silos, native Windows notification chimes, and automatic file classification, it offers the cleanest multi-session messaging environment for Windows.
                                    </p>
                                </div>
                            </section>

                            {/* FEATURES SECTION */}
                            <section className="ms-section ms-features-section">
                                <h2 className="ms-section-title">Features</h2>
                                <div className="ms-features-grid">
                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <Users size={22} weight="regular" />
                                        </div>
                                        <div>
                                            <h3 className="ms-feature-heading">5 Isolated Sessions</h3>
                                            <p className="ms-feature-copy">
                                                Simultaneously handle 5 WhatsApp accounts without credential collisions.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <FolderSimple size={22} weight="regular" />
                                        </div>
                                        <div>
                                            <h3 className="ms-feature-heading">Automated Media Sorter</h3>
                                            <p className="ms-feature-copy">
                                                Auto-classifies incoming WhatsApp downloads into dedicated Images, Audio, and Document directories.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <BellSimpleRinging size={22} weight="regular" />
                                        </div>
                                        <div>
                                            <h3 className="ms-feature-heading">Native Windows Chimes</h3>
                                            <p className="ms-feature-copy">
                                                Real-time notification audio with unread badge counter in the Windows taskbar.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <ShieldCheck size={22} weight="regular" />
                                        </div>
                                        <div>
                                            <h3 className="ms-feature-heading">100% Local Privacy</h3>
                                            <p className="ms-feature-copy">
                                                Zero cloud proxy, zero analytics, zero external logging. Your messages never touch third-party servers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT SIDEBAR COLUMN: DISCOVER MORE + DETAILS */}
                        <aside className="ms-sidebar-col">
                            {/* DISCOVER MORE SECTION (EXACTLY AS IN MICROSOFT STORE) */}
                            <div className="ms-sidebar-card">
                                <div className="ms-sidebar-header">
                                    <h2 className="ms-sidebar-title">Discover more</h2>
                                    <CaretRight size={16} weight="bold" className="ms-section-chevron" />
                                </div>

                                <div className="ms-discover-list">
                                    {discoverMoreApps.map((app, idx) => (
                                        app.external ? (
                                            <a 
                                                key={idx} 
                                                href={app.to} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="ms-discover-item"
                                            >
                                                <div className="ms-discover-icon" style={{ background: app.iconBg }}>
                                                    {app.iconText}
                                                </div>
                                                <div className="ms-discover-info">
                                                    <div className="ms-discover-name">{app.name}</div>
                                                    <div className="ms-discover-cat">{app.category}</div>
                                                </div>
                                                <div className="ms-discover-badge">
                                                    {app.tag}
                                                </div>
                                            </a>
                                        ) : (
                                            <Link 
                                                key={idx} 
                                                to={app.to} 
                                                className="ms-discover-item"
                                            >
                                                <div className="ms-discover-icon" style={{ background: app.iconBg }}>
                                                    {app.iconText}
                                                </div>
                                                <div className="ms-discover-info">
                                                    <div className="ms-discover-name">{app.name}</div>
                                                    <div className="ms-discover-cat">{app.category}</div>
                                                </div>
                                                <div className="ms-discover-badge">
                                                    {app.tag}
                                                </div>
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>

                            {/* ADDITIONAL INFORMATION PANEL */}
                            <div className="ms-sidebar-card ms-info-card">
                                <h3 className="ms-info-title">Additional information</h3>
                                <div className="ms-info-list">
                                    <div className="ms-info-row">
                                        <span className="ms-info-label">Published by</span>
                                        <span className="ms-info-val">Elvan Parthasarathy</span>
                                    </div>
                                    <div className="ms-info-row">
                                        <span className="ms-info-label">Release date</span>
                                        <span className="ms-info-val">2026</span>
                                    </div>
                                    <div className="ms-info-row">
                                        <span className="ms-info-label">Architecture</span>
                                        <span className="ms-info-val">x64 (Windows 10/11)</span>
                                    </div>
                                    <div className="ms-info-row">
                                        <span className="ms-info-label">Approximate size</span>
                                        <span className="ms-info-val">114.2 MB</span>
                                    </div>
                                    <div className="ms-info-row">
                                        <span className="ms-info-label">Category</span>
                                        <span className="ms-info-val">Social & Productivity</span>
                                    </div>
                                    <div className="ms-info-row">
                                        <span className="ms-info-label">License</span>
                                        <span className="ms-info-val">MIT Open Source</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* FULLSCREEN LIGHTBOX MODAL */}
                {isFullscreen && (
                    <div className="slide-lightbox-backdrop" onClick={() => setIsFullscreen(false)}>
                        <div className="slide-lightbox-content" onClick={(e) => e.stopPropagation()}>
                            <button 
                                className="lightbox-close-btn"
                                onClick={() => setIsFullscreen(false)}
                                aria-label="Close"
                            >
                                <X size={22} weight="bold" />
                            </button>
                            <img 
                                src={slides[currentSlide].src} 
                                alt={slides[currentSlide].titleEn} 
                                className="lightbox-image" 
                            />
                            <div className="lightbox-footer">
                                <button className="lightbox-nav-btn" onClick={prevSlide}>
                                    <CaretLeft size={18} weight="bold" /> Previous
                                </button>
                                <span className="lightbox-title">
                                    {slides[currentSlide].titleTa} • {currentSlide + 1} / {slides.length}
                                </span>
                                <button className="lightbox-nav-btn" onClick={nextSlide}>
                                    Next <CaretRight size={18} weight="bold" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
