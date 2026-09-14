import './பதிவிறக்கங்கள்.css';
import React, { useState, useEffect, useRef } from 'react';
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
    GithubLogo,
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
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);
    const hasMoved = useRef(false);

    const checkScrollButtons = () => {
        if (!scrollerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
        setCanScrollLeft(scrollLeft > 12);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 12);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollerRef.current) return;
        const frame = scrollerRef.current.querySelector<HTMLElement>('.ms-shot-frame');
        const scrollAmount = frame ? frame.offsetWidth + 16 : 400;
        scrollerRef.current.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollerRef.current) return;
        isDragging.current = true;
        hasMoved.current = false;
        startX.current = e.pageX - scrollerRef.current.offsetLeft;
        scrollLeftStart.current = scrollerRef.current.scrollLeft;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollerRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.1;
        if (Math.abs(walk) > 4) {
            hasMoved.current = true;
        }
        scrollerRef.current.scrollLeft = scrollLeftStart.current - walk;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleSlideClick = (idx: number) => {
        if (hasMoved.current) return;
        setCurrentSlide(idx);
        setIsFullscreen(true);
    };

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    useEffect(() => {
        checkScrollButtons();
        const handleResize = () => checkScrollButtons();
        window.addEventListener('resize', handleResize);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
        };
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

            {/* Ensure .main-content outer layout padding is removed so brand glow is truly edge-to-edge */}
            <style>{`
                .main-content {
                    padding: 0 !important;
                }
            `}</style>

            <div className="ms-store-page page-view fadeIn">
                {/* AMBIENT BRAND GLOW (MICROSOFT STORE ATMOSPHERE) */}
                <div className="ms-ambient-glow" aria-hidden="true" />

                <div className="ms-store-container">
                    {/* 1. APP HERO (MICROSOFT STORE HEADER) */}
                    <header className="ms-hero-card animate-entry">
                        {/* TOP ROW: LOGO + TITLE & PUBLISHER */}
                        <div className="ms-hero-top-row">
                            <div className="ms-app-icon-wrap">
                                <img 
                                    src="/nammil_icon.png" 
                                    alt="Nammil App Icon" 
                                    className="ms-app-icon-img"
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                />
                            </div>

                            <div className="ms-hero-title-group">
                                <h1 className="ms-app-title">
                                    <span className="ms-title-main" lang="ta">நம்மில்</span>
                                    <span className="ms-title-sub">Nammil</span>
                                </h1>

                                <div className="ms-developer-link">
                                    <Link to="/about" className="ms-dev-item">Elvan Navil</Link>
                                </div>

                                <div className="ms-category-row">
                                    <span className="ms-category-tag">Social • சமூகம்</span>
                                </div>
                            </div>
                        </div>

                        {/* BELOW LOGO: TEASER DESCRIPTION (FULL-WIDTH, ALIGNED TO LEFT EDGE) */}
                        <div className="ms-hero-desc-wrap">
                            <p className="ms-hero-desc" lang="ta">
                                நம்மில் என்பது கணினியில் பல வாட்ஸ்அப் கணக்குகளை ஒரே நேரத்தில் எளிதாகவும் பாதுகாப்பாகவும் இயக்க உதவும் எல்வன் நவிலின் அதிகாரப்பூர்வமற்ற வாட்ஸ்அப் டெஸ்க்டாப் செயலி.
                            </p>
                            <p className="ms-hero-desc ms-hero-desc-en">
                                Nammil is an unofficial WhatsApp desktop client for Windows that lets you run and manage multiple WhatsApp accounts simultaneously in one fast, private workspace.
                            </p>
                        </div>

                        {/* ACTION BUTTON ROW (ALIGNED TO LEFT EDGE) */}
                        <div className="ms-action-row">
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil/releases/latest/download/Nammil-Setup.exe" 
                                className="ms-btn-primary"
                                download
                                title="Download Nammil (.exe ~114MB)"
                            >
                                <DownloadSimple weight="bold" size={18} />
                                <span>Download</span>
                            </a>
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil" 
                                target="_blank" 
                                rel="noreferrer"
                                className="ms-btn-secondary ms-btn-github"
                                title="View Source on GitHub"
                            >
                                <GithubLogo weight="bold" size={18} />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </header>

                    {/* 2. STORE BODY */}
                    <div className="ms-store-body">
                        {/* SCREENSHOTS SECTION (MICROSOFT STORE HORIZONTAL SCROLLER) */}
                        <section className="ms-section ms-screenshots-section" aria-label="Screenshots">
                            <div className="ms-section-header-link" onClick={() => setIsFullscreen(true)}>
                                <h2 className="ms-section-title">Screenshots</h2>
                                <CaretRight size={18} weight="bold" className="ms-section-chevron" />
                            </div>

                            {/* HORIZONTAL SCROLLER WITH NATIVE SWIPE, DRAG & ARROW CONTROLS */}
                            <div className="ms-screenshots-scroller-wrap">
                                {canScrollLeft && (
                                    <button 
                                        className="ms-scroll-nav-btn prev"
                                        onClick={() => scroll('left')}
                                        aria-label="Previous screenshots"
                                    >
                                        <CaretLeft size={22} weight="bold" />
                                    </button>
                                )}

                                <div 
                                    className="ms-screenshots-scroller"
                                    ref={scrollerRef}
                                    onScroll={checkScrollButtons}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    {slides.map((slide, idx) => (
                                        <div 
                                            key={idx}
                                            className="ms-shot-frame" 
                                            onClick={() => handleSlideClick(idx)}
                                            title="Click to view fullscreen"
                                        >
                                            <img 
                                                src={slide.src} 
                                                alt={slide.titleEn} 
                                                className="ms-shot-img"
                                                loading={idx < 2 ? "eager" : "lazy"}
                                            />
                                            <div className="ms-shot-zoom-hint">
                                                <ArrowsOutSimple size={18} weight="bold" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {canScrollRight && (
                                    <button 
                                        className="ms-scroll-nav-btn next"
                                        onClick={() => scroll('right')}
                                        aria-label="Next screenshots"
                                    >
                                        <CaretRight size={22} weight="bold" />
                                    </button>
                                )}
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
