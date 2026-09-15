import './பதிவிறக்கங்கள்.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const filmstripRef = useRef<HTMLDivElement>(null);
    const isTransitioning = useRef(false);
    const containerDragX = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchStartTime = useRef(0);
    const isDraggingSlide = useRef(false);

    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);
    const hasMoved = useRef(false);

    // Preload all lightbox slides on open
    useEffect(() => {
        if (lightboxIdx !== null) {
            slides.forEach(s => {
                const img = new Image();
                img.src = s.src;
            });
        }
    }, [lightboxIdx]);

    // Keep filmstrip active thumbnail centered smoothly
    useEffect(() => {
        if (filmstripRef.current && lightboxIdx !== null) {
            const activeEl = filmstripRef.current.querySelector<HTMLElement>('.nammil-lb-fs-item.active');
            if (activeEl) {
                const container = filmstripRef.current;
                const scrollPos = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
                container.scrollTo({
                    left: scrollPos,
                    behavior: 'smooth'
                });
            }
        }
    }, [lightboxIdx]);

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

    const closeLightbox = useCallback(() => {
        if (window.history.state?.lightboxOpen) {
            window.history.back();
        } else {
            setLightboxIdx(null);
        }
    }, []);

    const openLightbox = useCallback((idx: number) => {
        setLightboxIdx(idx);
        window.history.pushState({ lightboxOpen: true }, '');
        requestAnimationFrame(() => {
            if (containerRef.current) {
                containerRef.current.style.transition = 'none';
                containerRef.current.style.transform = `translate3d(-${idx * 100}%, 0, 0)`;
            }
        });
    }, []);

    const handleSlideClick = (idx: number) => {
        if (hasMoved.current) return;
        openLightbox(idx);
    };

    const navigateTo = useCallback((targetIdx: number, animated = true) => {
        if (targetIdx < 0 || targetIdx >= slides.length) return;
        setLightboxIdx(targetIdx);

        if (containerRef.current) {
            if (animated) {
                isTransitioning.current = true;
                containerRef.current.style.transition = 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)';
                containerRef.current.style.transform = `translate3d(-${targetIdx * 100}%, 0, 0)`;
                setTimeout(() => {
                    isTransitioning.current = false;
                }, 380);
            } else {
                containerRef.current.style.transition = 'none';
                containerRef.current.style.transform = `translate3d(-${targetIdx * 100}%, 0, 0)`;
                isTransitioning.current = false;
            }
        }
    }, []);

    const goToNext = useCallback(() => {
        if (lightboxIdx === null || lightboxIdx >= slides.length - 1 || isTransitioning.current) return;
        navigateTo(lightboxIdx + 1, true);
    }, [lightboxIdx, navigateTo]);

    const goToPrev = useCallback(() => {
        if (lightboxIdx === null || lightboxIdx <= 0 || isTransitioning.current) return;
        navigateTo(lightboxIdx - 1, true);
    }, [lightboxIdx, navigateTo]);

    const jumpToSlide = useCallback((idx: number) => {
        if (lightboxIdx === null || lightboxIdx === idx || isTransitioning.current) return;
        navigateTo(idx, true);
    }, [lightboxIdx, navigateTo]);

    // Popstate, keyboard, body scroll lock
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (e.state?.lightboxOpen !== true) {
                setLightboxIdx(null);
            }
        };
        window.addEventListener('popstate', handlePopState);

        if (lightboxIdx !== null) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIdx === null) return;
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [lightboxIdx, goToNext, goToPrev, closeLightbox]);

    // Touch & swipe handling on wrapperRef
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || lightboxIdx === null) return;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 1) {
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
                touchStartTime.current = Date.now();
                containerDragX.current = 0;
                isDraggingSlide.current = true;
                if (containerRef.current) {
                    containerRef.current.style.transition = 'none';
                }
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDraggingSlide.current || lightboxIdx === null) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - touchStartX.current;
            const dy = currentY - touchStartY.current;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (e.cancelable) e.preventDefault();

                let finalDx = dx;
                if ((dx > 0 && lightboxIdx === 0) || (dx < 0 && lightboxIdx === slides.length - 1)) {
                    finalDx = dx * 0.3;
                }

                containerDragX.current = finalDx;
                if (containerRef.current) {
                    containerRef.current.style.transform = `translate3d(calc(-${lightboxIdx * 100}% + ${finalDx}px), 0, 0)`;
                }
            }
        };

        const handleTouchEnd = () => {
            if (!isDraggingSlide.current || lightboxIdx === null) return;
            isDraggingSlide.current = false;

            const dx = containerDragX.current;
            containerDragX.current = 0;

            if (Math.abs(dx) < 5) return;

            const dt = Date.now() - touchStartTime.current;
            const width = wrapperRef.current?.clientWidth || window.innerWidth;
            const swipeThreshold = width * 0.15;
            const isFlick = dt < 350 && Math.abs(dx) > 30;

            if (dx < 0 && lightboxIdx < slides.length - 1 && (Math.abs(dx) > swipeThreshold || isFlick)) {
                navigateTo(lightboxIdx + 1, true);
            } else if (dx > 0 && lightboxIdx > 0 && (Math.abs(dx) > swipeThreshold || isFlick)) {
                navigateTo(lightboxIdx - 1, true);
            } else {
                if (containerRef.current) {
                    containerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
                    containerRef.current.style.transform = `translate3d(-${lightboxIdx * 100}%, 0, 0)`;
                }
            }
        };

        wrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
        wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
        wrapper.addEventListener('touchend', handleTouchEnd);

        return () => {
            wrapper.removeEventListener('touchstart', handleTouchStart);
            wrapper.removeEventListener('touchmove', handleTouchMove);
            wrapper.removeEventListener('touchend', handleTouchEnd);
        };
    }, [lightboxIdx, navigateTo]);

    // Desktop mouse drag
    const handlePointerDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || isTransitioning.current || lightboxIdx === null) return;
        touchStartX.current = e.clientX;
        touchStartTime.current = Date.now();
        containerDragX.current = 0;
        isDraggingSlide.current = true;
        if (containerRef.current) {
            containerRef.current.style.transition = 'none';
        }
    };

    const handlePointerMove = (e: React.MouseEvent) => {
        if (!isDraggingSlide.current || lightboxIdx === null) return;
        e.preventDefault();
        const dx = e.clientX - touchStartX.current;
        let finalDx = dx;
        if ((dx > 0 && lightboxIdx === 0) || (dx < 0 && lightboxIdx === slides.length - 1)) {
            finalDx = dx * 0.3;
        }
        containerDragX.current = finalDx;
        if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(calc(-${lightboxIdx * 100}% + ${finalDx}px), 0, 0)`;
        }
    };

    const handlePointerEnd = () => {
        if (!isDraggingSlide.current || lightboxIdx === null) return;
        isDraggingSlide.current = false;

        const dx = containerDragX.current;
        containerDragX.current = 0;

        if (Math.abs(dx) < 5) return;

        const dt = Date.now() - touchStartTime.current;
        const width = wrapperRef.current?.clientWidth || window.innerWidth;
        const swipeThreshold = width * 0.15;
        const isFlick = dt < 350 && Math.abs(dx) > 30;

        if (dx < 0 && lightboxIdx < slides.length - 1 && (Math.abs(dx) > swipeThreshold || isFlick)) {
            navigateTo(lightboxIdx + 1, true);
        } else if (dx > 0 && lightboxIdx > 0 && (Math.abs(dx) > swipeThreshold || isFlick)) {
            navigateTo(lightboxIdx - 1, true);
        } else {
            if (containerRef.current) {
                containerRef.current.style.transition = 'transform 0.28s cubic-bezier(0.25, 1, 0.5, 1)';
                containerRef.current.style.transform = `translate3d(-${lightboxIdx * 100}%, 0, 0)`;
            }
        }
    };

    useEffect(() => {
        checkScrollButtons();
        const handleResize = () => checkScrollButtons();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <Helmet>
                <title>நம்மில் (Nammil) | Desktop App — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications." 
                />
            </Helmet>

            <MobileTopBar title="நம்மில்" />
            <FloatingBackButton to="/downloads" />

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
                                பல கணக்கு அமர்வுகள், தானியங்கி ஊடக ஒழுங்கமைப்பு மற்றும் விண்டோஸின் பிரத்யேக அறிவிப்புகளுடன் வாட்ஸ்அப்பிற்காக நேர்த்தியாக உருவாக்கப்பட்ட தனித்துவ தனியுரிமைக் கணினித் துணைச்செயலி.
                            </p>
                            <p className="ms-hero-desc ms-hero-desc-en">
                                A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications.
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
                                <DownloadSimple weight="bold" size={20} />
                                <div className="ms-btn-text">
                                    <span className="ms-btn-label">பதிவிறக்கு</span>
                                    <span className="ms-btn-sublabel">Download</span>
                                </div>
                            </a>
                            <a 
                                href="https://github.com/ElvanParthasarathy/Nammil" 
                                target="_blank" 
                                rel="noreferrer"
                                className="ms-btn-secondary ms-btn-github"
                                title="View Source on GitHub"
                            >
                                <GithubLogo weight="bold" size={20} />
                                <div className="ms-btn-text">
                                    <span className="ms-btn-label">கிட்ஹப்</span>
                                    <span className="ms-btn-sublabel">GitHub</span>
                                </div>
                            </a>
                        </div>
                    </header>

                    {/* 2. STORE BODY */}
                    <div className="ms-store-body">
                        {/* SCREENSHOTS SECTION (MICROSOFT STORE HORIZONTAL SCROLLER) */}
                        <section className="ms-section ms-screenshots-section" aria-label="Screenshots">
                            <div className="ms-section-header-link" onClick={() => openLightbox(0)}>
                                <h2 className="ms-section-title">திரைப்பிடிப்பு • Screenshots</h2>
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
                                <h2 className="ms-section-title">விளக்கம் • Description</h2>
                                <div className="ms-desc-body">
                                    <div className="ms-desc-block ms-desc-ta" lang="ta">
                                        <p>
                                            வாட்ஸ்அப் கணினிக்கான அதிகாரப்பூர்வ செயலியும் இணையப் பதிப்பும் கடுமையான ஒற்றைக் கணக்குக் கட்டுப்பாட்டைக் கொண்டுள்ளன. தனிப்பட்ட பயன்பாடு, அலுவலகப் பணி, வணிகம் மற்றும் வாடிக்கையாளர் கணக்குகளை நிர்வகிப்போர், பல உலாவி சாளரங்களையும், மறைமுக (incognito) தாவல்களையும், கணினி நினைவகத்தை (RAM) உறிஞ்சும் மூன்றாம் தரப்பு வழிகளையும் கையாள வேண்டிய கட்டாயத்திற்கு உள்ளாகின்றனர். மேலும், பெறப்படும் படங்கள், குரல் பதிவுகள், மீம்கள், ஆவணங்கள் அனைத்தும் பொதுவான Downloads கோப்புறையில் கலந்து ஒழுங்கின்மையை ஏற்படுத்துகின்றன. உலாவித் தாவல்கள் உறங்கும்போது அறிவிப்புகள் தவறிவிடுவதுடன், கணினிக்குரிய இயல்பான ஒருங்கிணைப்பும் அமைதியான புதுப்பிப்புகளும் இன்றி பயனர்கள் சிரமப்படுகின்றனர்.
                                        </p>
                                        <p>
                                            <strong>நம்மில் (Nammil)</strong> இக்குறைபாடுகளை முழுமையாகக் களைய எல்வன் பார்த்தசாரதியால் எல்வன் நவிலில் உருவாக்கப்பட்டது. நவீன எலக்ட்ரான் கட்டமைப்பில் இயங்கும் இச்செயலி, 5 சுயாதீன வாட்ஸ்அப் கணக்குகள் வரை தனித்தனி அமர்வுகளாகப் பிரித்து (<code>persist:whatsapp_&#123;id&#125;</code>) குக்கீ மற்றும் நற்சான்றிதழ் முரண்பாடின்றி ஒரே மேடையில் இயக்குகிறது.
                                        </p>
                                        <p>
                                            உள்வரும் கோப்புகளைத் தானாக வகைப்படுத்தி (<code>Documents\Nammil\Media</code>), உள்ளமைக்கப்பட்ட தேடல் மற்றும் Recycle Bin மீட்புடன் நிர்வகிக்கும் ஊடக உலாவி, 6 பிரத்யேக தமிழ்ப் பெயரிலான விண்டோஸ் ஒலி எச்சரிக்கைகள், 7 மொழி மற்றும் மாற்று-எழுத்துரு நுட்பங்கள், எல்வன் சான்ஸ் அச்சுக்கலை மற்றும் 100% உள்ளூர் தனியுரிமையுடன் விண்டோஸிற்கான மிக நேர்த்தியான கணினி வாட்ஸ்அப் அனுபவத்தை நம்மில் வழங்குகிறது.
                                        </p>
                                    </div>
                                    <div className="ms-desc-divider" />
                                    <div className="ms-desc-block ms-desc-en" lang="en">
                                        <p>
                                            Official WhatsApp Desktop and Web clients enforce a strict single-account lock. Users managing personal, business, client, or family accounts are forced to juggle multiple browser windows, incognito profiles, or memory-heavy workarounds that drain system resources. Standard web clients dump every received picture, meme, voice note, and document haphazardly into your generic Downloads folder, while browser notifications frequently fail when background tabs sleep, lack bespoke sound options, and fail to focus the correct chat session on click.
                                        </p>
                                        <p>
                                            <strong>Nammil</strong> was conceived and developed by Elvan Parthasarathy at Elvan Navil to provide a seamless, native desktop solution. Built on modern Electron technology, it lets you safely run up to 5 independent WhatsApp accounts side-by-side in isolated persistent sessions (<code>persist:whatsapp_&#123;id&#125;</code>) with zero cookie, session, or credential collisions.
                                        </p>
                                        <p>
                                            Featuring an automated media organizer (<code>Documents\Nammil\Media</code>) with fast search and safe Recycle Bin recovery, 6 bespoke Windows notification chimes, deep localization across 7 language variants powered by navil-engine, bespoke Elvan Sans typography, and 100% offline privacy with zero external telemetry, Nammil delivers the ultimate multi-session WhatsApp experience for Windows.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* FEATURES SECTION */}
                            <section className="ms-section ms-features-section">
                                <h2 className="ms-section-title">சிறப்பம்சங்கள் • Features</h2>
                                <div className="ms-features-grid">
                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <Users size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">5 தனித்தனி வாட்ஸ்அப் அமர்வுகள்</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">Multi-Account Sandboxing</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                5 சுயாதீன கணக்குகளை தனித்தனி எலக்ட்ரான் அமர்வுகளில் குக்கீ மற்றும் நற்சான்றிதழ் முரண்பாடின்றி ஒரே நேரத்தில் இயக்கும் வசதி.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Run up to 5 independent WhatsApp accounts simultaneously in isolated sessions with zero credential collision.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <FolderSimple size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">தானியங்கி ஊடக உலாவி & மீட்பு</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">Media Organizer & Recovery</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                கோப்புகளைத் தானாகப் படங்கள், ஆவணங்கள், ஒலிகளாகப் பிரித்து, தேடல், சிறுபடக் காட்சிகள் மற்றும் Recycle Bin மீட்புடன் நிர்வகிக்கும் வசதி.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Auto-indexes incoming media into clean folders with instant search, thumbnail previews, format filters, and safe Recycle Bin restore.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <BellSimpleRinging size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">6 தனித்துவ விண்டோஸ் ஒலி எச்சரிக்கைகள்</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">6 Bespoke Sound Chimes</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                குமிழி, மின்னல், அலை, தென்றல், துளி, துள்ளல் ஆகிய 6 பிரத்யேக ஒலிகள், கணக்கிற்கேற்ப தனித்தனி ஒலி அமைப்பு மற்றும் 1-கிளிக் நேரடி அரட்டை மீட்பு.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Six bespoke notification chimes (Kumizhi, Minnal, Alai, Thendral, Thuli, Thullal) with per-account sound assignment and 1-click chat focus.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <ArrowsClockwise size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">குரோம் பாணி பின்னணிப் புதுப்பிப்புகள்</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">Silent Background Updates</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                அரட்டைகளைத் தடை செய்யாமல் பின்னணியில் தானாகப் பதிவிறங்கி, டாப் பாரில் சதவீதக் காட்டியுடன் 1 நொடியில் புதுப்பிக்கும் வசதி.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Silent background update checks against GitHub Releases with real-time download progress and instant 1-click relaunch upgrades.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <Globe size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">7 மொழி & மாற்று-எழுத்துரு நுட்பம்</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">Deep Multilingual Localization</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                ஆங்கிலம், தமிழ், navil-engine இயக்கும் தமிழ் லத்தீன், மலையாள எழுத்தில் தமிழ், மலையாளம், மங்கிலிஷ், தமிழ் எழுத்தில் மலையாளம் என 7 வகைகள்.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Native localization across 7 language and cross-script transliteration variants (en, ta, ta_latn, ta_ml, ml, ml_latn, ml_tam) powered by navil-engine.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <Sparkle size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">எல்வன் சான்ஸ் தனித்துவ அச்சுக்கலை</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">Bespoke Elvan Sans Typography</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                ரியாக்ட் 19 + மெட்டீரியல் UI மற்றும் தமிழ்-ஆங்கில எழுத்துகளின் தடிமனைச் சமன் செய்து எல்வன் பார்த்தசாரதியால் செதுக்கப்பட்ட பிரத்யேக அச்சுக்கலை.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Distraction-free interface built with React 19 & MUI, typographically powered by the bespoke Elvan Sans font family with Light/Dark sync.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <DownloadSimple size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">நிர்வாகி அனுமதி தேவையில்லாத நிறுவல்</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">Zero-Admin Local Installation</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                விண்டோஸ் UAC நிர்வாகி அனுமதி எதுவும் கோராமல் %LOCALAPPDATA% கோப்புறையில் தூய்மையாக அமையும் இன்ஸ்டாலர்.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Installs cleanly into %LOCALAPPDATA%\Programs\Nammil without requiring Windows UAC administrator elevation, with a clean uninstaller.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ms-feature-item">
                                        <div className="ms-feature-icon-box">
                                            <ShieldCheck size={22} weight="regular" />
                                        </div>
                                        <div className="ms-feature-text">
                                            <h3 className="ms-feature-heading">
                                                <span className="ms-feature-title-ta">100% உள்ளூர் தனியுரிமை</span>
                                                <span className="ms-feature-title-sep">•</span>
                                                <span className="ms-feature-title-en">100% Offline Privacy</span>
                                            </h3>
                                            <p className="ms-feature-copy-ta" lang="ta">
                                                எந்தவொரு கிளவுட் இடைத்தரகரோ அல்லது வெளிப் பதிவுகளோ இன்றி உங்கள் தகவல்கள் உங்கள் கணினியிலேயே முழுமையாகப் பாதுகாக்கப்படும்.
                                            </p>
                                            <div className="ms-feature-divider" />
                                            <p className="ms-feature-copy-en" lang="en">
                                                Zero telemetry, zero analytics, zero intermediate cloud servers. All sessions and files remain strictly on your local PC.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ADDITIONAL INFORMATION SECTION (EXACTLY AS IN MICROSOFT STORE) */}
                            <section className="ms-additional-info-section">
                                <h2 className="ms-info-main-title">கூடுதல் விவரங்கள் • Additional information</h2>
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
                                                Get this app on Windows 10 and 11 devices (64-bit). Inno Setup per-user installer (Zero UAC prompts).
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
                                                <li>English (en)</li>
                                                <li>தமிழ் (ta)</li>
                                                <li>Thamizh Latin (ta_latn)</li>
                                                <li>Tamil in Malayalam (ta_ml)</li>
                                                <li>മലയാളം (ml)</li>
                                                <li>Malayalam Latin / Manglish (ml_latn)</li>
                                                <li>Malayalam in Tamil (ml_tam)</li>
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
                                                    <a href="https://jaiprakashpartha.vercel.app" target="_blank" rel="noreferrer">
                                                        Contact information
                                                    </a>
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
                                                <a 
                                                    href="https://jaiprakashpartha.vercel.app" 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    style={{ color: 'inherit', textDecoration: 'underline' }}
                                                >
                                                    Elvan Parthasarathy
                                                </a>
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

            {/* OPTIMIZED FULLSCREEN LIGHTBOX WITH CENTERED IMAGE & BOTTOM FILMSTRIP */}
            {lightboxIdx !== null && typeof document !== 'undefined' && createPortal(
                <div className="nammil-lightbox" onClick={closeLightbox}>
                    <div className="nammil-lb-header" onClick={(e) => e.stopPropagation()}>
                        <div className="nammil-lb-counter">
                            {lightboxIdx + 1} / {slides.length}
                        </div>
                        <button className="nammil-lb-close" onClick={closeLightbox} aria-label="Close">
                            <X weight="bold" size={20} />
                        </button>
                    </div>

                    <div className="nammil-lb-main-container" onClick={(e) => e.stopPropagation()}>
                        {lightboxIdx > 0 && (
                            <button className="nammil-lb-nav prev" onClick={goToPrev} aria-label="Previous screenshot">
                                <CaretLeft weight="bold" size={24} />
                            </button>
                        )}
                        {lightboxIdx < slides.length - 1 && (
                            <button className="nammil-lb-nav next" onClick={goToNext} aria-label="Next screenshot">
                                <CaretRight weight="bold" size={24} />
                            </button>
                        )}

                        <div
                            className="nammil-lb-img-wrapper"
                            ref={wrapperRef}
                            onMouseDown={handlePointerDown}
                            onMouseMove={handlePointerMove}
                            onMouseUp={handlePointerEnd}
                            onMouseLeave={handlePointerEnd}
                        >
                            <div
                                className="nammil-lb-img-container"
                                ref={containerRef}
                                style={{ transform: `translate3d(-${(lightboxIdx || 0) * 100}%, 0, 0)` }}
                            >
                                {slides.map((slide, idx) => (
                                    <div key={idx} className="nammil-lb-slide">
                                        <img
                                            src={slide.src}
                                            alt={slide.titleEn}
                                            className="nammil-lb-img"
                                            loading="eager"
                                            decoding="async"
                                            draggable={false}
                                            onDragStart={(e) => e.preventDefault()}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="nammil-lb-filmstrip" ref={filmstripRef} onClick={(e) => e.stopPropagation()}>
                        {slides.map((s, idx) => {
                            const isActive = lightboxIdx === idx;
                            return (
                                <div
                                    key={idx}
                                    className={`nammil-lb-fs-item ${isActive ? 'active' : ''}`}
                                    onClick={() => jumpToSlide(idx)}
                                    title={s.titleTa}
                                >
                                    <img src={s.src} alt={s.titleEn} draggable={false} />
                                </div>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
            </div>
        </>
    );
}
