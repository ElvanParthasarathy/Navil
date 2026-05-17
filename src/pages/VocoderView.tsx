import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobileTopBar from '../components/MobileTopBar';
import Presentation from '../components/vocoder/Presentation';
import Interactive from '../components/vocoder/Interactive';
import '../components/vocoder/vocoder-global.css';

const VocoderView = () => {
    const [activeTab, setActiveTab] = useState('presentation');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const totalSlides = 22;
    const stageDomRef = React.useRef(null);




    const toggleFullscreen = () => {
        if (!document.fullscreenElement && stageDomRef.current) {
            stageDomRef.current.requestFullscreen().catch(err => console.log(err));
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    return (
        <>
            <MobileTopBar title={activeTab === 'presentation' ? 'Vocoder' : 'Interactive Story'} showBack={true} backUrl="/teaching" />
            <div className="page-view animate-entry vocoder-page-container" style={{ width: '100%', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', background: 'var(--bg-app)', color: 'var(--text-main)' }}>

            <style>{`
                /* Lock scrolling only for the main content area while this component is active */
                .main-content {
                    overflow: hidden !important;
                }
                .main-content {
                    padding: 0 !important;
                }
                @media (max-width: 768px) {
                    .vocoder-page-container {
                        padding-top: 60px !important;
                        padding-bottom: 74px !important;
                    }
                }

                .vocoder-workspace-theme {
                    --topbar-bg: #18191B;
                    --workspace-bg: #0F0F11;
                    --slide-bg: #1A1A2E;
                    --bottombar-bg: #18191B;
                    --workspace-border: color-mix(in srgb, var(--border-light) 40%, transparent);
                }

                .vocoder-topbar {
                    display: grid; 
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center; 
                    padding: 20px 24px;
                    background: transparent;
                    flex-shrink: 0;
                    z-index: 50;
                }
                .vocoder-topbar .back-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-decoration: none;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 100px;
                    padding: 8px 20px;
                    flex-shrink: 0;
                    white-space: nowrap;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    justify-self: end;
                }
                .vocoder-topbar .back-pill:hover {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    color: var(--text-main);
                }
                .vocoder-topbar .back-pill:active {
                    transform: scale(0.95);
                    background: color-mix(in srgb, var(--text-main) 18%, transparent);
                }
                .vocoder-tab-switcher {
                    display: flex; gap: 4px;
                    background: color-mix(in srgb, var(--text-main) 4%, transparent);
                    padding: 4px;
                    border-radius: 100px;
                    justify-self: start;
                }
                .vocoder-tab-btn {
                    padding: 6px 16px; border-radius: 100px; border: none;
                    font-size: 0.8rem; font-weight: 600; cursor: pointer;
                    transition: all 0.2s; font-family: inherit;
                }
                .vocoder-tab-btn.active {
                    background: color-mix(in srgb, var(--text-main) 10%, transparent); color: var(--text-main);
                }
                .vocoder-tab-btn:not(.active) {
                    background: transparent; color: var(--text-muted);
                }
                .vocoder-tab-btn:hover:not(.active) {
                    background: color-mix(in srgb, var(--text-main) 6%, transparent); color: var(--text-main);
                }

                /* 16:9 Slide Stage */
                .slide-stage {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0; /* Zero padding to maximize space utilization */
                    overflow: hidden;
                    background: var(--workspace-bg);
                    position: relative;
                    min-height: 0; /* CRITICAL: allows flex child to shrink and prevents vertical scrollbar */
                    min-width: 0;
                }
                .slide-frame {
                    width: 100%;
                    height: 100%;
                    max-width: 100%;
                    max-height: 100%;
                    aspect-ratio: 16 / 9;
                    margin: auto; /* Perfectly center it inside the flex container */
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px color-mix(in srgb, var(--border-light) 30%, transparent);
                    position: relative;
                    background: var(--slide-bg);
                }
                /* Internal scaling container — renders at 1280x720 then scales to fit */
                .slide-scale-container {
                    width: 1280px;
                    height: 720px;
                    transform-origin: center;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                }

                /* Bottom Page Thumbnails Bar */
                .thumbs-scroll-wrapper {
                    display: flex;
                    align-items: center;
                    background: var(--bottombar-bg);
                    border-top: 1px solid var(--workspace-border);
                    padding: 0 0 0 12px;
                    flex-shrink: 0;
                    position: relative;
                }
                .slide-thumbs-bar {
                    flex: 1;
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    overflow-x: auto; /* Enable native swipe/trackpad scrolling */
                    scrollbar-width: none; /* Firefox */
                }
                .slide-thumbs-bar::-webkit-scrollbar {
                    display: none; /* Chrome/Safari */
                }
                
                /* Fullscreen Overlays */
                .fs-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0, 0, 0, 0.4);
                    color: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 1000;
                    transition: background 0.2s, opacity 0.3s;
                    opacity: 0;
                    pointer-events: auto;
                }
                .slide-stage:hover .fs-nav-btn {
                    opacity: 1;
                }
                .fs-nav-btn:hover {
                    background: rgba(0, 0, 0, 0.8) !important;
                }
                .fs-nav-btn:disabled {
                    opacity: 0.1 !important;
                    cursor: not-allowed;
                }
                .fs-nav-btn.left { left: 32px; }
                .fs-nav-btn.right { right: 32px; }

                .fs-indicator {
                    position: absolute;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    z-index: 1000;
                    transition: opacity 0.3s;
                    opacity: 0;
                    pointer-events: none;
                }
                .slide-stage:hover .fs-indicator {
                    opacity: 1;
                }
                
                .track-scroll-btn {
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    border: none;
                    color: var(--text-muted);
                    width: 36px;
                    height: 36px;
                    flex-shrink: 0;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                    z-index: 10;
                    border-radius: 50%;
                    margin: 0 4px;
                }
                .track-scroll-btn:hover { background: color-mix(in srgb, var(--text-main) 15%, transparent); color: var(--text-main); }
                .track-scroll-btn:active { background: color-mix(in srgb, var(--text-main) 22%, transparent); }
                .slide-thumb {
                    flex-shrink: 0;
                    width: 110px;
                    aspect-ratio: 16/9;
                    border-radius: 4px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                    background: #15152a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.6;
                }
                .slide-thumb:hover {
                    opacity: 1;
                    transform: translateY(-2px);
                }
                .slide-thumb.active {
                    opacity: 1;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 2px #8b5cf6;
                }
                .slide-thumb-inner {
                    font-size: 0.5rem;
                    color: #fff;
                    text-align: center;
                    padding: 4px;
                    line-height: 1.2;
                    font-weight: 600;
                    font-family: 'Poppins', sans-serif;
                    pointer-events: none;
                }
                .thumb-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                }

                /* Nav controls */
                .slide-nav-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: auto;
                    flex-shrink: 0;
                    background: var(--workspace-ui);
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid var(--workspace-border);
                }
                .slide-nav-btn {
                    width: 28px; height: 28px;
                    border-radius: 4px;
                    border: none;
                    background: transparent;
                    color: #fff;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .slide-nav-btn:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.1);
                }
                .slide-nav-btn:disabled {
                    opacity: 0.2; cursor: not-allowed;
                }
                .slide-counter {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #aaa;
                    font-variant-numeric: tabular-nums;
                    min-width: 50px;
                    text-align: center;
                    letter-spacing: 1px;
                }

                @media (max-width: 768px) {
                    .slide-stage { padding: 10px; }
                    .slide-frame { border-radius: 4px; }
                    .slide-thumbs-bar { padding: 16px 12px; gap: 10px; }
                    .slide-thumb { width: 80px; }
                    .vocoder-topbar { 
                        display: flex; 
                        flex-wrap: wrap; 
                        justify-content: space-between;
                        gap: 12px;
                        padding: 16px 16px 12px 16px; 
                    }
                    .vocoder-topbar-title { display: none !important; }
                    .vocoder-tab-btn { padding: 6px 12px; font-size: 0.75rem; }
                    .vocoder-topbar .back-pill { padding: 6px 14px; font-size: 0.8rem; }
                }
            `}</style>

            {/* Top Bar */}
            {/* Top Bar */}
            <div className="vocoder-topbar vocoder-workspace-theme">
                <div className="vocoder-tab-switcher">
                    <button className={`vocoder-tab-btn ${activeTab === 'presentation' ? 'active' : ''}`} onClick={() => setActiveTab('presentation')}>Presentation</button>
                    <button className={`vocoder-tab-btn ${activeTab === 'interactive' ? 'active' : ''}`} onClick={() => setActiveTab('interactive')}>Interactive Story</button>
                </div>

                <span className="vocoder-topbar-title" style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '-0.3px', justifySelf: 'center' }}>
                    🎤 Vocoder
                </span>

                <div className="vocoder-topbar-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'end' }}>
                    {activeTab === 'presentation' && (
                        <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: '42px', textAlign: 'center' }}>
                                {currentSlide + 1}/{totalSlides}
                            </span>
                            <button
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                                className="vocoder-fs-btn"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 3 21 3 21 9" />
                                    <polyline points="9 21 3 21 3 15" />
                                    <line x1="21" y1="3" x2="14" y2="10" />
                                    <line x1="3" y1="21" x2="10" y2="14" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <Link to="/teaching" className="back-pill desktop-only">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                    </Link>
                </div>
            </div>


            {/* Slide Stage */}
            {activeTab === 'presentation' ? (
                <PresentationStage 
                    currentSlide={currentSlide} 
                    setCurrentSlide={setCurrentSlide}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={toggleFullscreen}
                    totalSlides={totalSlides}
                    stageDomRef={stageDomRef}
                />
            ) : (
                <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="mobile-only" style={{ 
                        background: 'color-mix(in srgb, var(--text-main) 5%, transparent)', 
                        padding: '40px 24px', 
                        borderRadius: '24px', 
                        textAlign: 'center',
                        border: '1px solid var(--border-light)',
                        margin: '24px',
                        maxWidth: '320px'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💻</div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.25rem', fontWeight: 700 }}>Desktop Experience</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                            The Interactive Story requires a larger workspace to display complex models. Please switch to a desktop to explore.
                        </p>
                    </div>
                    <div className="desktop-only" style={{ width: '100%', height: '100%' }}>
                        <Interactive />
                    </div>
                </div>
            )}


        </div>
        </>
    );
};

/* ── Presentation with Google Slides-style layout ── */
const SLIDE_TITLES = [
    'VOCODER — Title',
    'Why Do We Need This?',
    'What is a Vocoder?',
    'Problem & Solution',
    'What Gets Sent?',
    'Speech Model',
    'Two Main Parts',
    'Mathematical Model',
    'The System Model',
    'Vocoder Equation',
    'Excitation Types',
    'LPC Analysis',
    'Simple Meaning',
    'Block Diagram',
    'Encoder (Analysis)',
    'Decoder (Synthesis)',
    'Advantages',
    'Tradeoffs',
    'Applications',
    'Memory Trick',
    'Key Takeaways',
    'நன்றி — Thank You'
];

const PresentationStage = ({ currentSlide, setCurrentSlide, isFullscreen, toggleFullscreen, totalSlides, stageDomRef }) => {
    const [scale, setScale] = useState(1);
    
    const thumbsRef = React.useRef(null);
    const frameRef = React.useRef(null);

    const goToSlide = (i) => {
        if (i >= 0 && i < totalSlides) setCurrentSlide(i);
    };

    // Calculate explicit 16:9 bounds relative to the parent stage to guarantee zero structural gaps
    const measureRef = React.useRef(null);
    useEffect(() => {
        const calcLayout = () => {
            if (!measureRef.current || !frameRef.current) return;
            
            // 1. Measure the available absolute space (this prevents flexbox pushback)
            const stageRect = measureRef.current.getBoundingClientRect();
            
            // 2. Mathematically compute the biggest 16:9 box that fits
            let targetW, targetH;
            if (stageRect.width / stageRect.height > 16 / 9) {
                targetH = stageRect.height;
                targetW = targetH * (16 / 9);
            } else {
                targetW = stageRect.width;
                targetH = targetW * (9 / 16);
            }
            
            // 3. Force the frame to these exact pixel dimensions
            frameRef.current.style.width = `${Math.floor(targetW)}px`;
            frameRef.current.style.height = `${Math.floor(targetH)}px`;
            
            // 4. Calculate the specific scale required for the 1280x720 inner canvas
            setScale(targetW / 1280);
        };
        
        calcLayout();
        const ro = new ResizeObserver(calcLayout);
        if (measureRef.current) ro.observe(measureRef.current);
        window.addEventListener('resize', calcLayout);
        return () => { ro.disconnect(); window.removeEventListener('resize', calcLayout); };
    }, []);

    // Scroll active thumb into view
    useEffect(() => {
        const active = thumbsRef.current?.querySelector('.slide-thumb.active');
        // Ensure scroll into view targets the center so user sees context
        if (active) {
            const container = thumbsRef.current;
            const scrollLeftPos = active.offsetLeft - (container.clientWidth / 2) + (active.clientWidth / 2);
            container.scrollTo({ left: scrollLeftPos, behavior: 'smooth' });
        }
    }, [currentSlide]);

    const scrollTrack = (dir) => {
        if (thumbsRef.current) {
            thumbsRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
        }
    };

    // Enable vertical mouse wheels to scroll the horizontal thumb track natively and fast
    const handleThumbWheel = (e) => {
        if (thumbsRef.current && e.deltaY !== 0) {
            // translate vertical wheel movement to horizontal track movement - fast but smoothly animated
            thumbsRef.current.scrollBy({ left: e.deltaY * 3, behavior: 'smooth' });
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goToSlide(currentSlide + 1); }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goToSlide(currentSlide - 1); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [currentSlide]);

    return (
        <>
            {/* Slide Stage — 16:9 centered */}
            <div className="slide-stage" style={{ position: 'relative' }} ref={stageDomRef}>
                
                {/* Floating Navigation Overlays (Only visible in Fullscreen) */}
                {isFullscreen && (
                    <>
                        <button className="fs-nav-btn left" onClick={(e) => { e.stopPropagation(); goToSlide(currentSlide - 1); }} disabled={currentSlide === 0}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                        <button className="fs-nav-btn right" onClick={(e) => { e.stopPropagation(); goToSlide(currentSlide + 1); }} disabled={currentSlide === totalSlides - 1}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                        <div className="fs-indicator">{currentSlide + 1} / {totalSlides}</div>
                    </>
                )}

                {/* Measuring Box — padding is 0 in fullscreen to touch monitor edges natively */}
                <div ref={measureRef} style={{ position: 'absolute', top: isFullscreen ? 0 : 32, left: isFullscreen ? 0 : 32, right: isFullscreen ? 0 : 32, bottom: isFullscreen ? 0 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="slide-frame" ref={frameRef} style={{ position: 'relative' }}>
                        <div className="slide-scale-container" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
                            <div className="vocoder-wrapper" style={{ width: '1280px', height: '720px', overflow: 'hidden' }}>
                                <Presentation externalSlide={currentSlide} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Thumbnails + Controls Wrapper */}
            <div className="thumbs-scroll-wrapper" onWheel={handleThumbWheel}>
                <button className="track-scroll-btn" onClick={() => scrollTrack(-1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                <div className="slide-thumbs-bar" ref={thumbsRef}>
                    {SLIDE_TITLES.map((title, i) => (
                        <div className="thumb-container" key={i}>
                            <div
                                className={`slide-thumb ${currentSlide === i ? 'active' : ''}`}
                                onClick={() => goToSlide(i)}
                            >
                                <div className="slide-thumb-inner">
                                    <div style={{ fontSize: '0.85rem', marginBottom: '2px' }}>
                                        {['🎤','📡','🔬','❌✅','🎵⚡📊','🗣️','🔥📈','📐','⚙️','💎','🎵','📈','⏳','📦','⚙️','🏗️','✅','⚠️','🌍','🧠','🏁','🙌'][i]}
                                    </div>
                                    <div style={{ fontSize: '0.4rem', opacity: 0.8, lineHeight: 1.3 }}>{title.slice(0, 20)}</div>
                                </div>
                            </div>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</span>
                        </div>
                    ))}
                </div>

                <button className="track-scroll-btn" onClick={() => scrollTrack(1)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>

                {/* Right-side controls: counter + fullscreen — Canva toolbar style (Desktop Only) */}
                <div className="desktop-only" style={{ marginRight: '16px', flexShrink: 0, paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', minWidth: '42px', textAlign: 'center' }}>
                        {currentSlide + 1}/{totalSlides}
                    </span>
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--text-main) 10%, transparent)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        {/* Diagonal expand arrows icon — matches Canva's fullscreen button */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
};

export default VocoderView;
