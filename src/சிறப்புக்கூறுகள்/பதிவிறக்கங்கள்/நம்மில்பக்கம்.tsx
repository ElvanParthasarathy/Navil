import './பதிவிறக்கங்கள்.css';
import React, { useState, useEffect } from 'react';
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
    X
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

            {/* FLOATING TRANSLUCENT BACKGROUND GRAPHICS (FROM NAMMIL ENGINE) */}
            <div className="nammil-bg-shapes" aria-hidden="true">
                <div className="nammil-shape nammil-shape-1" />
                <div className="nammil-shape nammil-shape-2" />
                <div className="nammil-shape nammil-shape-3" />
                <div className="nammil-shape nammil-shape-4" />
            </div>

            <div className="downloads-page nammil-detail-page page-view fadeIn">
                {/* 1. APP HEADER & DOWNLOAD HERO */}
                <header className="nammil-hero animate-entry">
                    <div className="nammil-header-top">
                        <div className="nammil-icon-box">
                            <img 
                                src="/nammil_icon.png" 
                                alt="Nammil App Icon" 
                                className="nammil-icon-img"
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div className="nammil-header-meta">
                            <div className="nammil-badge-row">
                                <span className="badge-tag">DESKTOP APP</span>
                                <span className="badge-tag">v1.2.9</span>
                                <span className="badge-tag">Windows 10 / 11 (64-bit)</span>
                                <span className="badge-tag">MIT License</span>
                            </div>
                            <h1 className="nammil-title" lang="ta">நம்மில் (Nammil)</h1>
                            <div className="nammil-subtitle">
                                Sleek, Privacy-Focused Multi-Account WhatsApp Companion
                            </div>
                        </div>
                    </div>

                    <p className="nammil-desc" lang="ta">
                        அதிகாரப்பூர்வ வாட்ஸ்அப் ஒரு கணக்கை மட்டுமே அனுமதிக்கும் தடையை உடைத்து, 5 கணக்குகள் வரை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக இயக்கவும், பதிவிறக்கங்களைத் தானாக ஒழுங்கமைக்கவும் எல்வன் நவில் உருவாக்கிய நவீன கணினிச் செயலி.
                    </p>
                    <p className="nammil-desc nammil-desc-en">
                        An independent desktop application crafted by Elvan Navil to run up to 5 isolated WhatsApp sessions concurrently with automated file sorting and native Windows alerts.
                    </p>

                    <div className="nammil-action-row">
                        <a 
                            href="https://github.com/ElvanParthasarathy/Nammil/releases/latest/download/Nammil-Setup.exe" 
                            className="dl-btn primary"
                            download
                        >
                            <DownloadSimple weight="bold" size={18} />
                            <span>Download Nammil (.exe ~114MB)</span>
                        </a>
                        <a 
                            href="https://github.com/ElvanParthasarathy/Nammil" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="dl-btn secondary"
                        >
                            <GithubLogo weight="regular" size={18} />
                            <span>GitHub Source</span>
                        </a>
                    </div>
                </header>

                {/* 2. INTERACTIVE SCREENSHOT SLIDESHOW */}
                <section className="nammil-slideshow-section animate-entry" aria-label="Nammil App Screenshots">
                    <div className="slideshow-header-row">
                        <div>
                            <h2 className="nammil-section-title" lang="ta">செயலி திரைக்காட்சிகள்</h2>
                            <p className="nammil-section-desc">Official Application Screenshots & Feature Walkthrough</p>
                        </div>
                        <div className="slide-counter-badge">
                            <span>{currentSlide + 1}</span> / <span>{slides.length}</span>
                        </div>
                    </div>

                    {/* NAVIGATION TABS / PILLS */}
                    <div className="slide-tabs-nav" role="tablist">
                        {slides.map((slide, idx) => (
                            <button
                                key={idx}
                                role="tab"
                                aria-selected={currentSlide === idx}
                                className={`slide-tab-pill ${currentSlide === idx ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(idx)}
                            >
                                <span className="pill-num">{idx + 1}</span>
                                <span className="pill-label">{slide.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* MAIN SLIDE VIEWER FRAME */}
                    <div 
                        className="slide-display-frame"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <button 
                            className="slide-arrow-btn prev" 
                            onClick={prevSlide}
                            aria-label="முந்தைய திரைக்காட்சி (Previous screenshot)"
                        >
                            <CaretLeft size={22} weight="bold" />
                        </button>

                        <div className="slide-image-wrapper">
                            <img 
                                src={slides[currentSlide].src} 
                                alt={slides[currentSlide].titleEn}
                                className="slide-main-image"
                                loading={currentSlide === 0 ? 'eager' : 'lazy'}
                                key={currentSlide}
                            />
                            <button 
                                className="slide-expand-btn"
                                onClick={() => setIsFullscreen(true)}
                                title="முழுத்திரை பார்வை (View Fullscreen)"
                            >
                                <ArrowsOutSimple size={18} weight="bold" />
                            </button>
                        </div>

                        <button 
                            className="slide-arrow-btn next" 
                            onClick={nextSlide}
                            aria-label="அடுத்த திரைக்காட்சி (Next screenshot)"
                        >
                            <CaretRight size={22} weight="bold" />
                        </button>
                    </div>

                    {/* ACTIVE SLIDE CAPTION CARD */}
                    <div className="slide-caption-card">
                        <div className="slide-caption-top">
                            <h3 className="slide-caption-title-ta" lang="ta">
                                {slides[currentSlide].titleTa}
                            </h3>
                            <span className="slide-caption-title-en">
                                {slides[currentSlide].titleEn}
                            </span>
                        </div>
                        <p className="slide-caption-desc-ta" lang="ta">
                            {slides[currentSlide].descTa}
                        </p>
                        <p className="slide-caption-desc-en">
                            {slides[currentSlide].descEn}
                        </p>
                    </div>

                    {/* FULLSCREEN LIGHTBOX MODAL */}
                    {isFullscreen && (
                        <div className="slide-lightbox-backdrop" onClick={() => setIsFullscreen(false)}>
                            <div className="slide-lightbox-content" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    className="lightbox-close-btn"
                                    onClick={() => setIsFullscreen(false)}
                                    aria-label="மூடு (Close)"
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
                                        <CaretLeft size={18} weight="bold" /> முந்தையது
                                    </button>
                                    <span className="lightbox-title">
                                        {slides[currentSlide].titleTa} • {currentSlide + 1} / {slides.length}
                                    </span>
                                    <button className="lightbox-nav-btn" onClick={nextSlide}>
                                        அடுத்தது <CaretRight size={18} weight="bold" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 3. CORE FEATURES (CLEAN & PROFESSIONAL MONOCHROME CARDS) */}
                <section className="nammil-features-section animate-entry">
                    <h2 className="nammil-section-title" lang="ta">செயலியின் சிறப்பம்சங்கள்</h2>
                    <p className="nammil-section-desc">Key Capabilities & Architectural Highlights</p>

                    <div className="nammil-features-grid">
                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <Users weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">5 Isolated Sessions</h3>
                            <p className="nammil-feature-desc">
                                Run up to 5 WhatsApp accounts concurrently with zero cross-session credential collisions or state overlap.
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <FolderSimple weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">Automated Media Sorter</h3>
                            <p className="nammil-feature-desc">
                                Auto-sorts incoming media downloads into neatly segregated subdirectories by format (PDFs, Images, Audio, Documents).
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <BellSimpleRinging weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">Native Windows Chimes</h3>
                            <p className="nammil-feature-desc">
                                Real-time taskbar unread badge counters and native notification audio chimes that keep you informed without intrusion.
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <ShieldCheck weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">100% Local Privacy</h3>
                            <p className="nammil-feature-desc">
                                Direct connection through official web wrappers on your local PC. Zero telemetry, zero analytics tracking, and zero remote data storage.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. TECHNICAL SPECIFICATIONS */}
                <section className="nammil-specs-section animate-entry">
                    <h2 className="nammil-section-title">Technical Specifications</h2>
                    <div className="nammil-specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Version</span>
                            <span className="spec-value">1.2.9</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Platform</span>
                            <span className="spec-value">Windows 10 / 11 (64-bit)</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Package</span>
                            <span className="spec-value">NSIS Setup Installer (~114 MB)</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">License</span>
                            <span className="spec-value">MIT Open Source License</span>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
