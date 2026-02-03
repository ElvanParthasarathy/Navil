import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiHeart, FiMessageCircle, FiSend, FiMoreHorizontal, FiMusic, FiVolume2, FiVolumeX, FiPlay, FiPause } from 'react-icons/fi';

const ReelsViewer = ({ reel, reels, onClose, onSwitchReel, profileData }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const videoRef = useRef(null);
    const touchStartY = useRef(null);
    const lastScrollTime = useRef(0);

    const currentIndex = reels.findIndex(r => r.id === reel.id);

    const nextReel = () => {
        if (currentIndex < reels.length - 1) {
            onSwitchReel(reels[currentIndex + 1]);
        }
    };

    const prevReel = () => {
        if (currentIndex > 0) {
            onSwitchReel(reels[currentIndex - 1]);
        }
    };

    useEffect(() => {
        // Auto-play when reel changes
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay might be blocked, start muted
                setIsMuted(true);
            });
        }
    }, [reel]);

    // Keyboard & Scroll Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') nextReel();
            if (e.key === 'ArrowUp') prevReel();
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            }
        };

        const handleWheel = (e) => {
            const now = Date.now();
            if (now - lastScrollTime.current < 1000) return; // Debounce 1s

            if (e.deltaY > 50) {
                nextReel();
                lastScrollTime.current = now;
            } else if (e.deltaY < -50) {
                prevReel();
                lastScrollTime.current = now;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [currentIndex]);

    // Touch Support
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current === null) return;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchStartY.current - touchEndY;

        if (deltaY > 50) nextReel();
        else if (deltaY < -50) prevReel();

        touchStartY.current = null;
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

    if (!reel) return null;

    return (
        <div
            className="reels-overlay"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <button className="reels-close-btn" onClick={onClose}>
                <FiX size={28} />
            </button>

            <div className="reels-content-wrapper">
                <div className="reels-video-container" onClick={togglePlay}>
                    <video
                        ref={videoRef}
                        src={reel.image || (reel.images && reel.images[0])}
                        loop
                        playsInline
                        muted={isMuted}
                        className="reel-video"
                    />

                    {isPaused && (
                        <div className="reels-pause-indicator">
                            <FiPlay size={60} fill="white" />
                        </div>
                    )}

                    {/* Overlaid Info (Bottom Left) */}
                    <div className="reels-info-overlay">
                        <div className="reels-user-row">
                            <img src={profileData?.profilePic} alt="" className="reels-p-pic" />
                            <span className="reels-username">{profileData?.username}</span>
                            <button className="reels-follow-btn">Follow</button>
                        </div>
                        <div className="reels-caption">
                            {reel.caption || "No caption"}
                        </div>
                        <div className="reels-audio-info">
                            <FiMusic size={12} />
                            <marquee scrollamount="3">Original audio • {profileData?.username}</marquee>
                        </div>
                    </div>

                    {/* Action Buttons (Floating Right) */}
                    <div className="reels-actions">
                        <div className="action-item" onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}>
                            <div className={`action-icon ${isLiked ? 'liked' : ''}`}>
                                <FiHeart size={24} fill={isLiked ? "#ed4956" : "none"} color={isLiked ? "#ed4956" : "white"} />
                            </div>
                            <span>1.2K</span>
                        </div>
                        <div className="action-item" onClick={(e) => e.stopPropagation()}>
                            <div className="action-icon">
                                <FiMessageCircle size={24} color="white" />
                            </div>
                            <span>42</span>
                        </div>
                        <div className="action-item" onClick={(e) => e.stopPropagation()}>
                            <div className="action-icon">
                                <FiSend size={24} color="white" />
                            </div>
                        </div>
                        <div className="action-item" onClick={(e) => e.stopPropagation()}>
                            <div className="action-icon">
                                <FiMoreHorizontal size={24} color="white" />
                            </div>
                        </div>
                        <div className="action-item" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                            <div className="action-icon">
                                {isMuted ? <FiVolumeX size={20} color="white" /> : <FiVolume2 size={20} color="white" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .reels-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #000;
                    z-index: 6000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                }

                .reels-content-wrapper {
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                }

                .reels-video-container {
                    position: relative;
                    height: 90vh;
                    aspect-ratio: 9/16;
                    background: #111;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }

                .reel-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .reels-pause-indicator {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.8;
                    pointer-events: none;
                }

                /* Info Overlay */
                .reels-info-overlay {
                    position: absolute;
                    bottom: 0; left: 0; right: 60px;
                    padding: 20px 16px;
                    background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    color: white;
                }

                .reels-user-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .reels-p-pic {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    border: 1.5px solid white;
                }

                .reels-username {
                    font-weight: 600;
                    font-size: 14px;
                }

                .reels-follow-btn {
                    background: none;
                    border: 1px solid white;
                    color: white;
                    padding: 2px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .reels-caption {
                    font-size: 14px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .reels-audio-info {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    width: 150px;
                    overflow: hidden;
                }

                /* Actions */
                .reels-actions {
                    position: absolute;
                    right: 0; bottom: 0;
                    width: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    padding-bottom: 20px;
                    z-index: 10;
                }

                .action-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                }

                .action-icon {
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                    transition: transform 0.1s;
                }

                .action-item:active .action-icon {
                    transform: scale(0.9);
                }

                .action-item span {
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .reels-video-container {
                        height: 100vh;
                        height: 100dvh;
                        width: 100vw;
                        border-radius: 0;
                        aspect-ratio: auto;
                    }
                    
                    .reels-close-btn {
                        top: max(20px, env(safe-area-inset-top));
                        left: 15px;
                    }

                    .reels-info-overlay {
                        padding-bottom: max(20px, env(safe-area-inset-bottom));
                    }

                    .reels-actions {
                        padding-bottom: max(20px, env(safe-area-inset-bottom) + 20px);
                    }
                }
            `}</style>
        </div>
    );
};

export default ReelsViewer;
