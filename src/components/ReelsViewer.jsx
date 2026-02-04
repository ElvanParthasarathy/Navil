import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiHeart, FiMessageCircle, FiSend, FiMoreHorizontal, FiMusic, FiVolume2, FiVolumeX, FiPlay, FiPause, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const ReelsViewer = ({ reel, reels, onClose, onSwitchReel, profileData }) => {
    const [isMuted, setIsMuted] = useState(false);
    const containerRef = useRef(null);
    const observerRef = useRef(null);
    const [activeReelId, setActiveReelId] = useState(reel.id);
    const reelRefs = useRef({});

    // Create a stable map of refs for each reel
    const setReelRef = useCallback((id, el) => {
        if (el) reelRefs.current[id] = el;
    }, []);

    // Initial Scroll to specific reel
    useEffect(() => {
        const target = reelRefs.current[reel.id];
        if (target && containerRef.current) {
            target.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }, []);

    // Intersection Observer to detect active reel
    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.dataset.id;
                    // Only switch if it's actually different to avoid cycles
                    setActiveReelId(prev => {
                        if (prev !== id) {
                            onSwitchReel(reels.find(r => r.id === id));
                            return id;
                        }
                        return prev;
                    });
                }
            });
        }, {
            threshold: 0.7 // Must be 70% visible
        });

        reels.forEach(r => {
            const el = reelRefs.current[r.id];
            if (el) observerRef.current.observe(el);
        });

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [reels, onSwitchReel]);

    const scrollToPrev = () => {
        const idx = reels.findIndex(r => r.id === activeReelId);
        if (idx > 0) {
            reelRefs.current[reels[idx - 1].id].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const scrollToNext = () => {
        const idx = reels.findIndex(r => r.id === activeReelId);
        if (idx < reels.length - 1) {
            reelRefs.current[reels[idx + 1].id].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); scrollToPrev(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); scrollToNext(); }
            if (e.key === 'Escape') onClose();
            if (e.key === 'm' || e.key === 'M') setIsMuted(prev => !prev);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeReelId, reels]);

    return (
        <div className="reels-mega-overlay">
            {/* Top Controls */}
            <div className="reels-top-bar">
                <button className="reels-close-btn" onClick={onClose} title="Close (Esc)">
                    <FiX size={28} />
                </button>
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="desktop-nav-arrows desktop-only-flex">
                <button
                    className={`reels-nav-arrow up ${activeReelId === reels[0]?.id ? 'hidden' : ''}`}
                    onClick={scrollToPrev}
                >
                    <FiChevronUp size={32} />
                </button>
                <button
                    className={`reels-nav-arrow down ${activeReelId === reels[reels.length - 1]?.id ? 'hidden' : ''}`}
                    onClick={scrollToNext}
                >
                    <FiChevronDown size={32} />
                </button>
            </div>

            <div className="reels-feed-container" ref={containerRef}>
                {reels.map((r) => (
                    <ReelItem
                        key={r.id}
                        reel={r}
                        isActive={activeReelId === r.id}
                        isMuted={isMuted}
                        onToggleMute={() => setIsMuted(!isMuted)}
                        profileData={profileData}
                        setRef={(el) => setReelRef(r.id, el)}
                    />
                ))}
            </div>

            <style jsx>{`
                .reels-mega-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #000;
                    z-index: 6000;
                    overflow: hidden;
                }

                .reels-top-bar {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 60px;
                    z-index: 6200;
                    pointer-events: none;
                }

                .reels-close-btn {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    z-index: 6100;
                    pointer-events: auto;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                    transition: transform 0.2s;
                }
                .reels-close-btn:hover { transform: scale(1.1); }

                .reels-feed-container {
                    height: 100vh;
                    height: 100dvh;
                    overflow-y: scroll;
                    scroll-snap-type: y mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .reels-feed-container::-webkit-scrollbar { display: none; }

                /* Desktop Navigation Arrows */
                .desktop-nav-arrows {
                    position: absolute;
                    left: calc(50% + 30vh);
                    top: 50%;
                    transform: translateY(-50%);
                    flex-direction: column;
                    gap: 16px;
                    z-index: 6150;
                    display: flex;
                }
                
                .reels-nav-arrow {
                    width: 50px; height: 50px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    backdrop-filter: blur(10px);
                }
                .reels-nav-arrow:hover { 
                    background: rgba(255,255,255,0.25); 
                    transform: scale(1.1);
                    border-color: rgba(255,255,255,0.4);
                }
                .reels-nav-arrow.hidden { opacity: 0; pointer-events: none; }

                @media (max-width: 1000px) {
                    .desktop-nav-arrows { 
                        left: auto;
                        right: 20px; 
                    }
                }

                @media (max-width: 768px) {
                    .desktop-nav-arrows { display: none; }
                    .reels-close-btn { 
                        top: max(20px, env(safe-area-inset-top)); 
                    }
                }
            `}</style>
        </div>
    );
};

// Individual Reel Component
const ReelItem = ({ reel, isActive, isMuted, onToggleMute, profileData, setRef }) => {
    const videoRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
            setIsPaused(false);
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isActive]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const dur = videoRef.current.duration;
            if (dur > 0) {
                setProgress((current / dur) * 100);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const seekTime = (parseFloat(e.target.value) / 100) * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = seekTime;
            setProgress(e.target.value);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPaused(false);
            } else {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    return (
        <div
            className="reels-snap-item"
            ref={setRef}
            data-id={reel.id}
        >
            <div className="reels-main-content">
                <div className="reels-video-box" onClick={togglePlay}>
                    <video
                        ref={videoRef}
                        src={reel.image || (reel.images && reel.images[0])}
                        loop
                        playsInline
                        muted={isMuted}
                        className="v-media"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                    />

                    {/* Protection Overlay (blocks right-click and save) */}
                    <div
                        className="reels-protection-layer"
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, width: '100%', height: '100%',
                            zIndex: 10,
                            backgroundColor: 'transparent'
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                    />

                    {isPaused && (
                        <div className="v-pause-ui">
                            <FiPlay size={60} fill="white" />
                        </div>
                    )}

                    {/* Bottom Info Overlay */}
                    <div className="v-info-card">
                        <div className="v-user-row">
                            <img src={profileData?.profilePic} alt="" className="v-avatar" />
                            <span className="v-username">{profileData?.username}</span>
                            <button className="v-follow">Follow</button>
                        </div>
                        <div className="v-caption">
                            {reel.caption || "Instagram Reel"}
                        </div>
                        <div className="v-audio">
                            <FiMusic size={12} />
                            <div className="audio-marquee">
                                <span>Original audio • {profileData?.username}</span>
                            </div>
                        </div>
                    </div>

                    {/* Video Scrubber / Slider */}
                    <div className="v-progress-container" onClick={(e) => e.stopPropagation()}>
                        <div className="v-progress-bar" style={{ width: `${progress}%` }}></div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.1"
                            value={progress}
                            onChange={handleSeek}
                            className="v-scrubber"
                            aria-label="Seek Video"
                        />
                    </div>

                    {/* Side Action Buttons */}
                    <div className="v-actions-list">
                        <div className="v-action-btn" onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}>
                            <div className={`v-icon-circle ${isLiked ? 'liked' : ''}`}>
                                <FiHeart size={24} fill={isLiked ? "#ed4956" : "none"} color={isLiked ? "#ed4956" : "white"} />
                            </div>
                            <span className="v-label">1.2K</span>
                        </div>
                        <div className="v-action-btn" onClick={(e) => e.stopPropagation()}>
                            <div className="v-icon-circle">
                                <FiMessageCircle size={24} color="white" />
                            </div>
                            <span className="v-label">42</span>
                        </div>
                        <div className="v-action-btn" onClick={(e) => e.stopPropagation()}>
                            <div className="v-icon-circle">
                                <FiSend size={24} color="white" />
                            </div>
                        </div>
                        <div className="v-action-btn" onClick={(e) => e.stopPropagation()}>
                            <div className="v-icon-circle">
                                <FiMoreHorizontal size={24} color="white" />
                            </div>
                        </div>
                        <div className="v-action-btn" onClick={(e) => { e.stopPropagation(); onToggleMute(); }}>
                            <div className="v-icon-circle">
                                {isMuted ? <FiVolumeX size={20} color="white" /> : <FiVolume2 size={20} color="white" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .reels-snap-item {
                    height: 100vh;
                    height: 100dvh;
                    width: 100%;
                    scroll-snap-align: start;
                    scroll-snap-stop: always; /* Prevent scrolling past multiple reels on one flick */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }

                .reels-main-content {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .reels-video-box {
                    position: relative;
                    height: 94%;
                    aspect-ratio: 9/16;
                    background: #111;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }

                .v-media {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .v-pause-ui {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.7;
                    pointer-events: none;
                }

                /* Info Card */
                .v-info-card {
                    position: absolute;
                    bottom: 0; left: 0; right: 60px;
                    padding: 24px 16px 32px; /* Extra bottom padding for slider room */
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
                    color: white;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    z-index: 15;
                    pointer-events: none;
                }
                .v-info-card > * { pointer-events: auto; }

                /* Progress / Scrubber Styles */
                .v-progress-container {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 12px;
                    z-index: 30;
                    display: flex;
                    align-items: flex-end;
                    padding-bottom: 2px;
                    cursor: pointer;
                }

                .v-progress-bar {
                    position: absolute;
                    bottom: 0; left: 0;
                    height: 2px;
                    background: rgba(255,255,255,0.8);
                    z-index: 31;
                    pointer-events: none;
                    transition: height 0.1s;
                }

                .v-scrubber {
                    width: 100%;
                    margin: 0;
                    -webkit-appearance: none;
                    background: transparent;
                    height: 10px;
                    z-index: 32;
                    cursor: pointer;
                }

                .v-progress-container:hover .v-progress-bar { height: 4px; }
                .v-progress-container:hover .v-scrubber::-webkit-slider-thumb { opacity: 1; transform: scale(1.2); }

                .v-scrubber::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s, transform 0.2s;
                }

                .v-scrubber::-moz-range-thumb {
                    width: 12px; height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: none;
                    opacity: 0;
                }

                .v-scrubber:focus { outline: none; }

                .v-user-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .v-avatar {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    border: 2px solid white;
                }

                .v-username {
                    font-weight: 600; font-size: 14px;
                }

                .v-follow {
                    background: none; border: 1px solid white;
                    color: white; padding: 3px 12px;
                    border-radius: 6px; font-size: 12px;
                    font-weight: 600; cursor: pointer;
                }

                .v-caption {
                    font-size: 14px; line-height: 1.4;
                    display: -webkit-box; -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical; overflow: hidden;
                }

                .v-audio {
                    display: flex; align-items: center; gap: 8px; font-size: 12px;
                }
                
                .audio-marquee {
                    width: 150px; overflow: hidden; white-space: nowrap;
                }
                .audio-marquee span {
                    display: inline-block;
                    animation: m-scroll 10s linear infinite;
                }
                @keyframes m-scroll {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }

                /* Side Actions */
                .v-actions-list {
                    position: absolute;
                    right: 0; bottom: 0;
                    width: 65px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    padding-bottom: 32px;
                    z-index: 20;
                }

                .v-action-btn {
                    display: flex; flex-direction: column;
                    align-items: center; gap: 6px; cursor: pointer;
                }

                .v-icon-circle {
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                    transition: transform 0.1s;
                }
                .v-action-btn:active .v-icon-circle { transform: scale(0.9); }
                .v-label { font-size: 12px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

                @media (max-width: 768px) {
                    .reels-video-box {
                        height: 100%;
                        width: 100%;
                        border-radius: 0;
                        aspect-ratio: auto;
                    }
                    .v-info-card {
                        padding-bottom: max(40px, env(safe-area-inset-bottom) + 20px);
                    }
                    .v-actions-list {
                        padding-bottom: max(40px, env(safe-area-inset-bottom) + 20px);
                    }
                    .v-progress-container {
                        bottom: env(safe-area-inset-bottom);
                        padding-bottom: 4px;
                        height: 20px;
                    }
                    /* On mobile, make scrubber thumb always visible for easier seeking */
                    .v-scrubber::-webkit-slider-thumb { opacity: 1; width: 8px; height: 8px; }
                }
            `}</style>
        </div>
    );
};

export default ReelsViewer;
