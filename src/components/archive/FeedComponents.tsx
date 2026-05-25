import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { stripHtml, formatArtDate } from './archiveUtils';

export                         position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#1a1a1a', color: '#666', gap: '8px',
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Media Unavailable
                        </span>
                    </div>
                )}

                {/* Media - hidden until ready */}
                {!error && isVideo ? (
                    <video
                        ref={ref}
                        src={src}
                        preload="auto"
                        className={className}
                        style={{
                            ...style,
                            display: ready ? 'block' : 'none',
                        }}
                        autoPlay={false}
                        muted={muted}
                        playsInline={playsInline}
                        controls={controls}
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        onLoadedData={handleLoad}
                        onError={handleError}
                        onEnded={() => {
                            // nextStory removed - stories handled by StoryViewer component
                        }}
                    />
                ) : !error ? (
                    <img
                        src={src}
                        alt=""
                        className={className}
                        loading="eager"
                        style={{
                            ...style,
                            display: ready ? 'block' : 'none',
                            userSelect: 'none',
                            WebkitUserDrag: 'none'
                        }}
                        onLoad={handleLoad}
                        onError={handleError}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                ) : null}

                {/* Protection Layer (blocks right-click and save as) */}
                <div
                    className="media-protection-layer"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        zIndex: 10,
                        backgroundColor: 'transparent',
                        userSelect: 'none',
                        WebkitTouchCallout: 'none'
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>
        );
    };
    const TruncatedCaption = ({ username, caption, date }) => {
        const [expanded, setExpanded] = useState(false);
        const plainText = stripHtml(caption || '');
        const shouldTruncate = plainText.length > 80;

        return (
            <div className="feed-caption-container" style={{ padding: '0 16px 16px' }}>
                <div className={`feed-caption ${expanded ? 'expanded' : ''}`} style={{ fontSize: 14, lineHeight: '1.4' }}>
                    <strong>{username}</strong>{' '}
                    {expanded ? (
                        <span dangerouslySetInnerHTML={{ __html: caption }} />
                    ) : shouldTruncate ? (
                        <>
                            <span dangerouslySetInnerHTML={{ __html: plainText.slice(0, 80) + '...' }} />
                            <button
                                className="caption-more-btn"
                                onClick={() => setExpanded(true)}
                                style={{
                                    color: '#8e8e8e',
                                    cursor: 'pointer',
                                    marginLeft: 4,
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    font: 'inherit',
                                }}
                            >
                                more
                            </button>
                        </>
                    ) : (
                        <span dangerouslySetInnerHTML={{ __html: caption }} />
                    )}
                </div>
                <div className="feed-date" style={{ fontSize: 10, color: '#8e8e8e', marginTop: 4, textTransform: 'uppercase' }}>
                    {formatArtDate(date)}
                </div>
            </div>
        );
    };

    const FeedItemMedia = ({ post }) => {
        const [currentIndex, setCurrentIndex] = useState(0);
        const scrollRef = useRef(null);

        const handleScroll = () => {
            if (scrollRef.current) {
                const width = scrollRef.current.offsetWidth;
                const newIndex = Math.round(scrollRef.current.scrollLeft / width);
                setCurrentIndex(newIndex);
            }
        };

        const scrollTo = (index) => {
            if (scrollRef.current) {
                const width = scrollRef.current.offsetWidth;
                scrollRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
            }
        };

        const mediaList = post.images || [post.image || post.url];

        return (
            <div className="feed-media-container" style={{ position: 'relative' }}>
                <div
                    className="feed-media-scroll"
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    {mediaList.map((m, idx) => (
                        <div key={idx} className="feed-media-slide">
                            <MediaLoader
                                src={m}
                                type={(post.type === 'video' || (typeof m === 'string' && m.endsWith('.mp4'))) ? 'video' : 'image'}
                                className="feed-media"
                                controls={true}
                                playsInline={true}
                                autoPlay={false} // Don't autoplay in feed to avoid noise
                            />
                        </div>
                    ))}
                </div>

                {mediaList.length > 1 && (
                    <>
                        {/* Semi-transparent Nav Buttons */}
                        {currentIndex > 0 && (

export                             <button
                                className="feed-nav-btn left"
                                onClick={() => scrollTo(currentIndex - 1)}
                            >
                                <FiChevronLeft size={20} />
                            </button>
                        )}
                        {currentIndex < mediaList.length - 1 && (
                            <button
                                className="feed-nav-btn right"
                                onClick={() => scrollTo(currentIndex + 1)}
                            >
                                <FiChevronRight size={20} />
                            </button>
                        )}

                        {/* Pagination Dots */}
                        <div className="feed-dots">
                            {mediaList.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`feed-dot ${idx === currentIndex ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        scrollTo(idx);
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const mobileFeedRef = useRef(null);
    // Scroll logic removed: selected post is now rendered first in the reordered list.

    // Keyboard Support

export         const handleKeyDown = (e) => {
            if (selectedPost) {
                if (e.key === 'ArrowRight') nextPost(e);
                if (e.key === 'ArrowLeft') prevPost(e);
                if (e.key === 'Escape') closePost();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPost]);

    if (isMounting) {
        return (
            <>
                <MobileTopBar title="காப்புகள்|archive" />
                <div className="page-view page-fade">
                    <div className="profile-header">
                        <div className="profile-avatar-container desktop-only-flex">
                            <div className="skel profile-avatar" style={{ borderRadius: '50%' }} />
                        </div>
                        <div className="mobile-username-header mobile-only-flex">
                            <div className="skel" style={{ width: 120, height: 20, borderRadius: 4 }} />
                        </div>
                        <div className="profile-mobile-top mobile-only-flex">
                            <div className="profile-avatar-container">
                                <div className="skel profile-avatar" style={{ borderRadius: '50%' }} />
                            </div>
                            <div className="mobile-stats-inline">
                                <div className="mobile-stat-item"><div className="skel" style={{ width: 40, height: 32, borderRadius: 4 }} /></div>
                                <div className="mobile-stat-item"><div className="skel" style={{ width: 40, height: 32, borderRadius: 4 }} /></div>
                                <div className="mobile-stat-item"><div className="skel" style={{ width: 40, height: 32, borderRadius: 4 }} /></div>
                            </div>
                        </div>
                        <div className="mobile-bio-section mobile-only">
                            <div className="skel" style={{ width: '60%', height: 16, marginBottom: 8, borderRadius: 4 }} />
                            <div className="skel" style={{ width: '80%', height: 14, marginBottom: 4, borderRadius: 4 }} />
                            <div className="skel" style={{ width: '50%', height: 14, borderRadius: 4 }} />
                        </div>
                        <div className="profile-info desktop-only-flex" style={{ minWidth: 0 }}>
                            <div className="profile-username-row" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div className="skel" style={{ width: 180, height: 28, borderRadius: 4 }} />
                                </div>
                            </div>
                            <div className="profile-stats-row">
                                <span className="stat-item"><div className="skel" style={{ width: 60, height: 18, borderRadius: 4 }} /></span>
                                <span className="stat-item"><div className="skel" style={{ width: 60, height: 18, borderRadius: 4 }} /></span>
                                <span className="stat-item"><div className="skel" style={{ width: 60, height: 18, borderRadius: 4 }} /></span>
                            </div>
                            <div className="profile-bio-row">
                                <div className="skel" style={{ width: '60%', height: 16, marginBottom: 8, borderRadius: 4 }} />
                                <div className="skel" style={{ width: '80%', height: 14, marginBottom: 4, borderRadius: 4 }} />
                                <div className="skel" style={{ width: '50%', height: 14, borderRadius: 4 }} />
                            </div>
                        </div>
                    </div>

                    <div className="highlight-bar-container">
                        <div className="highlights-scroll" style={{ overflow: 'hidden' }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-item">
                                    <div className="h-ring" style={{ background: 'transparent' }}>
                                        <div className="h-inner skel" style={{ borderRadius: '50%' }} />
                                    </div>
                                    <div className="skel" style={{ width: 50, height: 12, marginTop: 4, borderRadius: 4 }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="profile-tabs">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="tab-item">
                                <div className="skel" style={{ width: 60, height: 16, borderRadius: 4 }} />
                            </div>
                        ))}
                    </div>

                    <div className="archive-container">
                        <div className="archive-grid">
