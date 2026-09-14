import './பதிவிறக்கங்கள்.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import {
    DownloadSimple,
    ShieldCheck,
    FolderSimple,
    BellSimpleRinging,
    Users,
    CaretLeft,
    CaretRight,
    ArrowsOutSimple,
    X,
    Star,
    Sparkle,
    Package,
    ArrowsClockwise,
    CalendarBlank,
    BookmarkSimple,
    HardDrive,
    Globe,
    Buildings,
    FileText,
    Flag,
    Code,
    Info
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
                                <span className="ms-dev-item">Published by <Link to="/about">Elvan Navil</Link></span>
                                <span className="ms-meta-divider">•</span>
                                <span className="ms-dev-item">Designed by <Link to="/portfolio">Elvan Parthasarathy</Link></span>
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
                            </div>
                        </div>
                    </header>

                    {/* 2. STORE BODY */}
                    <div className="ms-store-body">
                        {/* SCREENSHOTS SECTION (MICROSOFT STORE TWO-PANE CONTAINED) */}
                        <section className="ms-section ms-screenshots-section" aria-label="Screenshots">
                            <div className="ms-section-header-link" onClick={() => setIsFullscreen(true)}>
                                <h2 className="ms-section-title">Screenshots</h2>
                                <CaretRight size={18} weight="bold" className="ms-section-chevron" />
                            </div>

                            {/* CONTAINED SCREENSHOTS (2-PANE DESKTOP / 1-PANE MOBILE) */}
                            <div 
                                className="ms-screenshots-container"
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <div 
                                    className="ms-shot-frame" 
                                    onClick={() => { setCurrentSlide(currentSlide); setIsFullscreen(true); }}
                                    title="Click to view fullscreen"
                                >
                                    <img 
                                        src={slides[currentSlide].src} 
                                        alt={slides[currentSlide].titleEn} 
                                        className="ms-shot-img"
                                        loading="eager"
                                    />
                                    <button 
                                        className="ms-shot-nav-btn prev"
                                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                        aria-label="Previous screenshot"
                                    >
                                        <CaretLeft size={20} weight="bold" />
                                    </button>
                                    <button 
                                        className="ms-shot-nav-btn next mobile-only"
                                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                        aria-label="Next screenshot"
                                    >
                                        <CaretRight size={20} weight="bold" />
                                    </button>
                                    <div className="ms-shot-zoom-hint">
                                        <ArrowsOutSimple size={18} weight="bold" />
                                    </div>
                                </div>

                                <div 
                                    className="ms-shot-frame ms-shot-frame-second" 
                                    onClick={() => { setCurrentSlide((currentSlide + 1) % slides.length); setIsFullscreen(true); }}
                                    title="Click to view fullscreen"
                                >
                                    <img 
                                        src={slides[(currentSlide + 1) % slides.length].src} 
                                        alt={slides[(currentSlide + 1) % slides.length].titleEn} 
                                        className="ms-shot-img"
                                        loading="lazy"
                                    />
                                    <button 
                                        className="ms-shot-nav-btn next"
                                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                        aria-label="Next screenshot"
                                    >
                                        <CaretRight size={20} weight="bold" />
                                    </button>
                                    <div className="ms-shot-zoom-hint">
                                        <ArrowsOutSimple size={18} weight="bold" />
                                    </div>
                                </div>
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

                            {/* ADDITIONAL INFORMATION SECTION (EXACTLY AS IN MICROSOFT STORE) */}
                            <section className="ms-additional-info-section">
                                <h2 className="ms-info-main-title">Additional information</h2>
                                <div className="ms-info-grid">
                                    {/* ROW 1 */}
                                    <div className="ms-info-cell">
                                        <Package size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Published by</div>
                                            <div className="ms-cell-val">Elvan Navil</div>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <ArrowsClockwise size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Last updated date</div>
                                            <div className="ms-cell-val">9/15/2026</div>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <CalendarBlank size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Release date</div>
                                            <div className="ms-cell-val">9/1/2026</div>
                                        </div>
                                    </div>

                                    {/* ROW 2 */}
                                    <div className="ms-info-cell">
                                        <BookmarkSimple size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Category</div>
                                            <div className="ms-cell-val">Social & Productivity</div>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <HardDrive size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Approximate size</div>
                                            <div className="ms-cell-val">114.2 MB</div>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <DownloadSimple size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Installation</div>
                                            <div className="ms-cell-val">
                                                Get this app on Windows 10 and 11 devices (64-bit). Offline NSIS installer.
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROW 3 */}
                                    <div className="ms-info-cell">
                                        <ShieldCheck size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">This app can</div>
                                            <ul className="ms-cell-list">
                                                <li>Runs 100% locally on your PC</li>
                                                <li>Uses isolated session partitions</li>
                                                <li>Zero telemetry, zero cloud logging</li>
                                                <li>Access your Internet connection</li>
                                                <li>Permissions info</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <Globe size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Supported languages</div>
                                            <ul className="ms-cell-list">
                                                <li>English</li>
                                                <li>தமிழ் (Tamil)</li>
                                                <li>മലയാളം (Malayalam)</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <Buildings size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Publisher Info</div>
                                            <ul className="ms-cell-list">
                                                <li>
                                                    <a href="https://github.com/ElvanParthasarathy/Nammil" target="_blank" rel="noreferrer">
                                                        Nammil GitHub support
                                                    </a>
                                                </li>
                                                <li>
                                                    <Link to="/about">Elvan Navil website</Link>
                                                </li>
                                                <li>
                                                    <Link to="/portfolio">Contact information</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* ROW 4 */}
                                    <div className="ms-info-cell">
                                        <FileText size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Additional terms</div>
                                            <ul className="ms-cell-list">
                                                <li>Nammil privacy policy</li>
                                                <li>Terms of transaction / MIT License</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <Flag size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Report this product</div>
                                            <ul className="ms-cell-list">
                                                <li>
                                                    <a href="https://github.com/ElvanParthasarathy/Nammil/issues" target="_blank" rel="noreferrer">
                                                        Report this product for bugs
                                                    </a>
                                                </li>
                                                <li>Report security vulnerability</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="ms-info-cell">
                                        <Code size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Installed version</div>
                                            <div className="ms-cell-val">1.2.9</div>
                                        </div>
                                    </div>

                                    {/* ROW 5 */}
                                    <div className="ms-info-cell">
                                        <Sparkle size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Designed & Developed by</div>
                                            <div className="ms-cell-val">
                                                <Link to="/portfolio" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                                    Elvan Parthasarathy
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROW 5: LEGAL DISCLAIMERS */}
                                    <div className="ms-info-cell ms-cell-disclaimer">
                                        <Info size={20} weight="regular" className="ms-cell-icon" />
                                        <div className="ms-cell-content">
                                            <div className="ms-cell-label">Legal disclaimers</div>
                                            <div className="ms-cell-val">
                                                This software is an independent open-source application crafted by Elvan Parthasarathy under MIT License and is not affiliated with, endorsed by, or sponsored by WhatsApp Inc. or Meta Platforms, Inc.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
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
