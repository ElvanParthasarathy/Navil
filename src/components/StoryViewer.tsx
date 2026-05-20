// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';
import profilePic from '../assets/instagram/profile.jpg';

const StoryViewer = ({
    activeHighlight,
    highlights,
    onClose,
    onSwitchHighlight,
    profileData
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const videoRef = useRef(null);
    const progressTimer = useRef(null);
    const [storyDuration, setStoryDuration] = useState(5000); // Default 5 seconds
    const DEFAULT_DURATION = 5000;
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const pendingStartIndex = useRef(null); // Track intended start index when switching highlights

    const currentStories = activeHighlight?.stories || [];
    const currentIndexSafe = Math.min(currentIndex, currentStories.length > 0 ? currentStories.length - 1 : 0);
    const currentStory = currentStories[currentIndexSafe];

    // Early return if we have no valid story to prevent crashes during transitions
    if (!activeHighlight || !currentStory) {
        return null;
    }

    // Navigation logic
    const nextStory = useCallback(() => {
        if (currentIndex < currentStories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
            setIsLoaded(false);
        } else {
            // End of this highlight, move to next highlight group
            const nextGroupIdx = highlights.findIndex(h => h.id === activeHighlight.id) + 1;
            if (nextGroupIdx < highlights.length) {
                onSwitchHighlight(highlights[nextGroupIdx]);
            } else {
                onClose();
            }
        }
    }, [currentIndex, currentStories.length, activeHighlight, highlights, onSwitchHighlight, onClose]);

    const prevStory = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
            setIsLoaded(false);
        } else {
            // Start of this highlight, move to prev highlight group
            const prevGroupIdx = highlights.findIndex(h => h.id === activeHighlight.id) - 1;
            if (prevGroupIdx >= 0) {
                const prevGroup = highlights[prevGroupIdx];
                // Store the intended start index (last story of prev group) before switching
                pendingStartIndex.current = prevGroup.stories.length - 1;
                onSwitchHighlight(prevGroup);
            } else {
                onClose();
            }
        }
    }, [currentIndex, activeHighlight, highlights, onSwitchHighlight, onClose]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextStory();
            if (e.key === 'ArrowLeft') prevStory();
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                setIsPaused(prev => !prev);
            }
            if (e.key === 'm' || e.key === 'M') setIsMuted(prev => !prev);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextStory, prevStory, onClose]);

    // Swipe & Hold Logic
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        setIsPaused(true);
    };

    const handleTouchEnd = (e) => {
        if (!touchStartX.current || !touchStartY.current) return;

        setIsPaused(false);
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchStartX.current - touchEndX;
        const deltaY = touchStartY.current - touchEndY;

        // Horizontal swipe detection (min 50px)
        if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                // Swipe Left -> Next Highlight
                const nextGroupIdx = highlights.findIndex(h => h.id === activeHighlight.id) + 1;
                if (nextGroupIdx < highlights.length) {
                    onSwitchHighlight(highlights[nextGroupIdx]);
                } else {
                    onClose();
                }
            } else {
                // Swipe Right -> Prev Highlight
                const prevGroupIdx = highlights.findIndex(h => h.id === activeHighlight.id) - 1;
                if (prevGroupIdx >= 0) {
                    onSwitchHighlight(highlights[prevGroupIdx]);
                } else {
                    const prevGroup = highlights[0]; // Loop back or close? We'll close for consistency
                    onClose();
                }
            }
        }

        touchStartX.current = null;
        touchStartY.current = null;
    };

    // Timer logic
    useEffect(() => {
        if (!isLoaded || isPaused) {
            if (progressTimer.current) clearInterval(progressTimer.current);
            return;
        }

        const interval = 50; // ms
        const increment = (interval / storyDuration) * 100;

        progressTimer.current = setInterval(() => {
            setProgress(prev => {
                const next = prev + increment;
                if (next >= 100) {
                    nextStory();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => {
            if (progressTimer.current) clearInterval(progressTimer.current);
        };
    }, [isLoaded, isPaused, nextStory, storyDuration]);

    // Reset when highlight changes
    useEffect(() => {
        // Use pending start index if set (for backward navigation), otherwise start from 0
        const startIdx = pendingStartIndex.current ?? 0;
        pendingStartIndex.current = null; // Clear after use
        setCurrentIndex(startIdx);
        setProgress(0);
        setIsLoaded(false);
        setStoryDuration(DEFAULT_DURATION);
    }, [activeHighlight?.id]);

    // Also reset when story index changes within the same highlight
    useEffect(() => {
        setProgress(0);
        setIsLoaded(false);
        setStoryDuration(DEFAULT_DURATION);
    }, [currentIndex]);

    // Imperative Video Pause/Play Control
    useEffect(() => {
        if (videoRef.current) {
            if (isPaused) {
                videoRef.current.pause();
            } else {
                // Only play if it's already loaded/ready to avoid race conditions
                if (isLoaded) {
                    videoRef.current.play().catch(e => console.log("Play failed:", e));
                }
            }
        }
    }, [isPaused, isLoaded]);

    const handleVideoLoaded = () => {
        if (videoRef.current && videoRef.current.duration) {
            setStoryDuration(videoRef.current.duration * 1000);
        }
        setIsLoaded(true);
    };

    const handleImageLoaded = () => {
        setStoryDuration(DEFAULT_DURATION);
        setIsLoaded(true);
    };

    if (!activeHighlight) return null;

    const currentHighlightIdx = highlights.findIndex(h => h.id === activeHighlight.id);
    const prevHighlight = highlights[currentHighlightIdx - 1];
    const nextHighlight = highlights[currentHighlightIdx + 1];

    return (
        <div className="sv-overlay">
            {/* Background Blur */}
            <div className="sv-blur-bg" style={{
                backgroundImage: `url(${activeHighlight.cover})`
            }} />

            <div className="sv-carousel">
                {/* Previous Card Preview (3D-ish) */}
                {prevHighlight && (
                    <div key={prevHighlight.id} className="sv-card peer prev" onClick={() => onSwitchHighlight(prevHighlight)}>
                        <div className="card-media-wrapper">
                            {prevHighlight.cover.endsWith('.mp4') ? (
                                <video src={prevHighlight.cover} muted />
                            ) : (
                                <img src={prevHighlight.cover} alt="" />
                            )}
                            <div className="card-info">
                                <div className="card-avatar-mini" />
                                <span className="card-name">{prevHighlight.title}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Card */}
                <div
                    key={activeHighlight.id}
                    className="sv-card active"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Header: Progress Bars & Meta */}
                    <div className="sv-header">
                        <div className="sv-progress-container">
                            {currentStories.map((_, idx) => (
                                <div key={idx} className="sv-progress-track">
                                    <div
                                        className="sv-progress-filler"
                                        style={{
                                            width: idx === currentIndex ? `${progress}%` : (idx < currentIndex ? '100%' : '0%'),
                                            transition: idx === currentIndex && progress === 0 ? 'none' : 'width 0.1s linear'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="sv-meta-row">
                            <div className="sv-user">
                                <img src={profilePic} className="sv-p-pic" alt="" />
                                <div className="sv-p-text">
                                    <span className="sv-username">{profileData?.username || 'elvanparthasarathy'}</span>
                                    <span className="sv-time">{currentStory?.date}</span>
                                </div>
                            </div>

                            <div className="sv-controls-group" onMouseDown={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}>
                                <button className="sv-btn" onClick={() => setIsPaused(!isPaused)} aria-label={isPaused ? "Play" : "Pause"}>
                                    {isPaused ? <FiPlay size={18} /> : <FiPause size={18} />}
                                </button>
                                <button className="sv-btn" onClick={() => setIsMuted(!isMuted)} aria-label={isMuted ? "Unmute" : "Mute"}>
                                    {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                                </button>
                                <button className="sv-btn close" onClick={onClose} aria-label="Close">
                                    <FiX size={22} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Areas */}
                    <div className="sv-nav-tap left" onClick={prevStory} />
                    <div className="sv-nav-tap right" onClick={nextStory} />

                    {/* Media Content */}
                    <div className="sv-media-wrapper">
                        {!isLoaded && (
                            <div className="sv-shimmer">
                                <div className="loader-dots">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        {(currentStory?.type === 'video' || currentStory?.url?.endsWith('.mp4')) ? (
                            <video
                                src={currentStory?.url}
                                ref={videoRef}
                                autoPlay={!isPaused}
                                muted={isMuted}
                                playsInline
                                onLoadedData={handleVideoLoaded}
                                onEnded={nextStory}
                                controlsList="nodownload"
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ) : (
                            <img
                                src={currentStory?.url}
                                alt=""
                                onLoad={handleImageLoaded}
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
                            />
                        )}

                        {/* Protection Overlay (blocks right-click and save) */}
                        <div
                            className="story-protection-layer"
                            style={{
                                position: 'absolute',
                                top: 0, left: 0, width: '100%', height: '100%',
                                zIndex: 10,
                                backgroundColor: 'transparent'
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </div>
                </div>

                {/* Next Card Preview (3D-ish) */}
                {nextHighlight && (
                    <div key={nextHighlight.id} className="sv-card peer next" onClick={() => onSwitchHighlight(nextHighlight)}>
                        <div className="card-media-wrapper">
                            {nextHighlight.cover.endsWith('.mp4') ? (
                                <video src={nextHighlight.cover} muted />
                            ) : (
                                <img src={nextHighlight.cover} alt="" />
                            )}
                            <div className="card-info">
                                <div className="card-avatar-mini" />
                                <span className="card-name">{nextHighlight.title}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .sv-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #1a1a1a;
                    z-index: 5000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Inter', sans-serif;
                    /* Prevent scrolling */
                    touch-action: none;
                    overscroll-behavior: none;
                }

                .sv-blur-bg {
                    position: absolute;
                    top: -20px; left: -20px; right: -20px; bottom: -20px;
                    background-size: cover;
                    background-position: center;
                    filter: blur(50px) brightness(0.4);
                    opacity: 0.8;
                    z-index: 0;
                }

                .sv-controls-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .sv-btn {
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0.8;
                    transition: all 0.2s;
                    padding: 6px;
                }
                .sv-btn:hover { 
                    opacity: 1;
                    transform: scale(1.1);
                }
                .sv-btn.close {
                    margin-left: 8px;
                }

                .sv-carousel {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    height: 100dvh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5100;
                    perspective: 1500px;
                    touch-action: none; /* Critical for swipe */
                }

                /* 3D Cards */
                .sv-card {
                    position: absolute;
                    width: 420px;
                    height: 750px;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1), 
                                filter 0.7s cubic-bezier(0.23, 1, 0.32, 1),
                                opacity 0.7s linear;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                }

                .sv-card.active {
                    z-index: 100;
                    transform: translateZ(0) scale(1.05);
                }

                .sv-card.peer {
                    cursor: pointer;
                    filter: brightness(0.4);
                    z-index: 50;
                }

                .sv-card.peer.prev {
                    transform: translateX(-500px) scale(0.7) rotateY(30deg);
                }

                .sv-card.peer.next {
                    transform: translateX(500px) scale(0.7) rotateY(-30deg);
                }

                .sv-card.peer:hover {
                    filter: brightness(0.6);
                }

                /* Media Styling */
                .sv-media-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }

                .sv-media-wrapper img,
                .sv-media-wrapper video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                /* Header & Progress */
                .sv-header {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    padding: 12px 12px 30px;
                    padding-top: max(12px, env(safe-area-inset-top));
                    background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
                    z-index: 150;
                }

                .sv-progress-container {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 12px;
                }

                .sv-progress-track {
                    flex: 1;
                    height: 2px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 99px;
                    overflow: hidden;
                }

                .sv-progress-filler {
                    height: 100%;
                    background: #fff;
                    border-radius: 99px;
                }

                .sv-meta-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sv-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .sv-p-pic {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #eee;
                    border: 1.5px solid #fff;
                }

                .sv-p-text {
                    display: flex;
                    flex-direction: column;
                }

                .sv-username {
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                }

                .sv-time {
                    color: rgba(255,255,255,0.6);
                    font-size: 11px;
                }

                .sv-actions {
                    display: flex;
                    gap: 12px;
                }

                /* Navigation Taps */
                .sv-nav-tap {
                    position: absolute;
                    top: 100px; bottom: 100px;
                    width: 30%;
                    z-index: 151;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                }
                .sv-nav-tap.left { left: 0; }
                .sv-nav-tap.right { right: 0; width: 30%; }

                /* Shimmer Loader */
                .sv-shimmer {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    z-index: 140;
                }

                .loader-dots { display: flex; gap: 4px; }
                .loader-dots span {
                    width: 6px; height: 6px;
                    background: #fff;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }
                .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
                .loader-dots span:nth-child(3) { animation-delay: 0.4s; }

                @keyframes pulse {
                    0%, 100% { transform: scale(0.8); opacity: 0.4; }
                    50% { transform: scale(1.2); opacity: 1; }
                }

                /* Footer */
                .sv-footer {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    padding: 20px 20px 30px;
                    padding-bottom: max(30px, env(safe-area-inset-bottom));
                    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                    z-index: 150;
                }

                .sv-caption {
                    color: #fff;
                    font-size: 13px;
                    line-height: 1.4;
                    text-align: center;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                }

                /* Peer info info overlays */
                .card-media-wrapper {
                    position: relative;
                    width: 100%; height: 100%;
                }
                .card-media-wrapper img, 
                .card-media-wrapper video {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .card-info {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.3);
                }
                .card-avatar-mini {
                    width: 48px; height: 48px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    background: rgba(255,255,255,0.2);
                    margin-bottom: 8px;
                }
                .card-name {
                    color: #fff;
                    font-weight: 600;
                    font-size: 14px;
                }

                /* Mobile Optimization */
                @media (max-width: 768px) {
                    .sv-overlay { 
                        background: #000;
                        height: 100dvh; 
                    }
                    .sv-blur-bg { display: none; }
                    
                    /* Base styles for ALL cards on mobile (active + peers) */
                    .sv-card {
                        width: 100% !important; /* Force full width */
                        height: 100dvh !important; /* Force full height */
                        border-radius: 0;
                        background: #000;
                        max-width: 100vw;
                        /* Ensure transition is active */
                        transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
                        box-shadow: none;
                    }

                    /* State specific transforms */
                    .sv-card.active {
                        transform: translate3d(0, 0, 0);
                        z-index: 100;
                        opacity: 1;
                    }

                    .sv-card.peer {
                        display: block !important; /* Enable rendering for animation */
                        z-index: 90;
                        filter: brightness(0.5); /* Slight dim for peers */
                    }

                    .sv-card.peer.prev {
                        transform: translate3d(-100%, 0, 0); /* Slide to left */
                    }

                    .sv-card.peer.next {
                        transform: translate3d(100%, 0, 0); /* Slide to right */
                    }
                    
                    .sv-media-wrapper img,
                    .sv-media-wrapper video {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        background: #000;
                    }

                    .sv-controls-group { 
                        gap: 10px;
                    }
                    .sv-btn { padding: 8px; }
                    .sv-header { 
                        padding-top: max(16px, env(safe-area-inset-top)); 
                        top: 0;
                    }
                }
            `}</style>
        </div >
    );
};

export default StoryViewer;

