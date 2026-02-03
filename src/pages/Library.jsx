import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import instagramData, { storyHighlights as initialHighlights, profileData } from '../data/instagramData';
import { FiHeart, FiMessageCircle, FiX, FiChevronLeft, FiChevronRight, FiPlay, FiLayers, FiGrid, FiFilm, FiArchive, FiVolume2, FiVolumeX, FiPause } from 'react-icons/fi';
import HighlightBar from '../components/HighlightBar';
import StoryViewer from '../components/StoryViewer';
import ReelsViewer from '../components/ReelsViewer';

const Library = () => {
    // Destructure Data
    const { posts: rawPosts, reels: rawReels, arts: rawArts, archivedPosts: rawArchived } = instagramData || {};

    // Memoized Lists to prevent re-calculations and reference changes on every render
    const posts = React.useMemo(() => [...(rawPosts || [])].sort((a, b) => b.timestamp - a.timestamp), [rawPosts]);
    const reels = React.useMemo(() => [...(rawReels || [])].sort((a, b) => b.timestamp - a.timestamp), [rawReels]);
    const arts = React.useMemo(() => [...(rawArts || [])].sort((a, b) => b.timestamp - a.timestamp), [rawArts]);
    const archivedPosts = React.useMemo(() => [...(rawArchived || [])].sort((a, b) => b.timestamp - a.timestamp), [rawArchived]);

    // Highlights Data (Sort: Newest Group First, Oldest Story inside Group First)
    const highlights = React.useMemo(() => (initialHighlights || []), [initialHighlights]);

    // --- SEARCH PARAMS (HISTORY SYNC) ---
    const [searchParams, setSearchParams] = useSearchParams();

    // --- STATES ---
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'arts', 'reels', 'archive'
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedReel, setSelectedReel] = useState(null);
    const [postImageIndex, setPostImageIndex] = useState(0);

    const [viewingHighlight, setViewingHighlight] = useState(null); // The highlight group being viewed
    const [isMobileFeed, setIsMobileFeed] = useState(false);

    // --- USER LIST MODAL ---
    const [userListModal, setUserListModal] = useState({ open: false, title: '', users: [] });
    const [userSearchQuery, setUserSearchQuery] = useState('');

    // --- EFFECT: SYNC MODALS WITH URL ---
    useEffect(() => {
        const postId = searchParams.get('post');
        const storyId = searchParams.get('story');
        const reelId = searchParams.get('reel');
        const listType = searchParams.get('list');

        const isMobile = window.innerWidth <= 768;

        // Handle Post
        if (postId) {
            const allContent = [...posts, ...reels, ...arts, ...archivedPosts];
            const foundPost = allContent.find(p => p.id === postId);
            if (foundPost) {
                if (isMobile) {
                    setIsMobileFeed(true);
                    setSelectedPost(foundPost);
                } else {
                    setSelectedPost(foundPost);
                    setPostImageIndex(0);
                }
                document.body.style.overflow = 'hidden';
            }
        } else {
            setSelectedPost(null);
            setIsMobileFeed(false);
            // Only reset overflow if no other modals are open
            if (!storyId && !reelId && !listType) document.body.style.overflow = 'auto';
        }

        // Handle Reel
        if (reelId) {
            const allContent = [...reels, ...arts, ...posts, ...archivedPosts]; // Reels first for priority
            const foundReel = allContent.find(r => r.id === reelId);
            if (foundReel) {
                setSelectedReel(foundReel);
                document.body.style.overflow = 'hidden';
            }
        } else {
            setSelectedReel(null);
            // Only reset overflow if no other modals are open
            if (!postId && !storyId && !listType) document.body.style.overflow = 'auto';
        }

        // Handle Story
        if (storyId) {
            const foundHighlight = highlights.find(h => h.id === storyId);
            if (foundHighlight) {
                setViewingHighlight(foundHighlight);
                document.body.style.overflow = 'hidden';
            }
        } else {
            setViewingHighlight(null);
            // Only reset overflow if no other modals are open
            if (!postId && !reelId && !listType) document.body.style.overflow = 'auto';
        }

        // Handle List
        if (listType) {
            if (listType === 'followers') {
                setUserListModal({ open: true, title: 'Followers', users: profileData.followersList || [] });
                document.body.style.overflow = 'hidden';
            } else if (listType === 'following') {
                setUserListModal({ open: true, title: 'Following', users: profileData.followingList || [] });
                document.body.style.overflow = 'hidden';
            }
        } else {
            setUserListModal(prev => ({ ...prev, open: false }));
            // Only reset overflow if no other modals are open
            if (!postId && !storyId && !reelId) document.body.style.overflow = 'auto';
        }
    }, [searchParams, posts, reels, archivedPosts, highlights]);

    // Filtered users based on search
    const filteredUsers = userListModal.users.filter(user =>
        user.username.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    // --- POST MODAL LOGIC ---
    const openPost = (post) => {
        // Switch logic for Reels vs Standard Posts
        if (post.type === 'video' || (post.image && post.image.endsWith('.mp4')) || activeTab === 'reels') {
            setSearchParams({ reel: post.id }, { replace: false });
        } else {
            setSearchParams({ post: post.id }, { replace: false });
        }
    };

    const closePost = () => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('post');
            next.delete('reel');
            return next;
        }, { replace: true });

        // Ensure fullscreen is exited if it was active (for Reels too)
        try {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        } catch (e) { }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (selectedPost && postImageIndex < (selectedPost.images?.length || 1) - 1) {
            setPostImageIndex(prev => prev + 1);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (postImageIndex > 0) {
            setPostImageIndex(prev => prev - 1);
        }
    };

    const nextPost = (e) => {
        e.stopPropagation();
        const currentData = activeTab === 'posts' ? posts :
            activeTab === 'arts' ? arts :
                activeTab === 'reels' ? reels : archivedPosts;
        const currentIndex = currentData.findIndex(p => p.id === selectedPost.id);
        if (currentIndex < currentData.length - 1) {
            setSearchParams({ post: currentData[currentIndex + 1].id }, { replace: true });
            setPostImageIndex(0);
        }
    };

    const prevPost = (e) => {
        e.stopPropagation();
        const currentData = activeTab === 'posts' ? posts :
            activeTab === 'arts' ? arts :
                activeTab === 'reels' ? reels : archivedPosts;
        const currentIndex = currentData.findIndex(p => p.id === selectedPost.id);
        if (currentIndex > 0) {
            setSearchParams({ post: currentData[currentIndex - 1].id }, { replace: true });
            setPostImageIndex(0);
        }
    };

    // --- STORY VIEWER LOGIC ---
    const openHighlight = (highlight) => {
        setSearchParams({ story: highlight.id }, { replace: false });
        // Enable fullscreen on mobile for immersive experience
        if (window.innerWidth <= 768) {
            try {
                const docElm = document.documentElement;
                if (docElm.requestFullscreen) docElm.requestFullscreen();
                else if (docElm.mozRequestFullScreen) docElm.mozRequestFullScreen();
                else if (docElm.webkitRequestFullScreen) docElm.webkitRequestFullScreen();
                else if (docElm.msRequestFullscreen) docElm.msRequestFullscreen();
            } catch (e) { console.warn("Fullscreen request failed", e); }
        }
    };

    const closeStory = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('story');
        setSearchParams(newParams);
        // Exit fullscreen if active
        try {
            if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
            }
        } catch (e) { console.warn("Exit fullscreen failed", e); }
    };

    const switchHighlight = (highlight) => {
        setSearchParams({ story: highlight.id }, { replace: true });
    };

    const switchReel = (reel) => {
        setSearchParams({ reel: reel.id }, { replace: true });
    };



    const MediaLoader = ({ src, type, className, style, autoPlay, muted, playsInline, controls, onLoaded, onError, mediaRef: externalRef }) => {
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(false);
        const [ready, setReady] = useState(false); // Tracks if media is ready to show
        const localRef = useRef(null);
        const ref = externalRef || localRef;
        const mountedRef = useRef(false);
        const loadStartTime = useRef(Date.now());

        const isVideo = type === 'video' || (typeof src === 'string' && src.endsWith('.mp4'));
        const isStory = className && className.includes('story');

        // Reset loading state when src changes
        useEffect(() => {
            mountedRef.current = true;
            setError(false);
            loadStartTime.current = Date.now();

            // Instant check for cached images
            if (src && !isVideo) {
                const img = new Image();
                img.src = src;
                if (img.complete) {
                    setLoading(false);
                    setReady(true);
                } else {
                    setLoading(true);
                    setReady(false);
                }
            } else {
                setLoading(true);
                setReady(false);
            }

            // Pause and reset video immediately when source changes
            if (ref.current && isVideo) {
                try {
                    ref.current.pause();
                    ref.current.currentTime = 0;
                } catch (e) { }
            }

            return () => { mountedRef.current = false; };
        }, [src]);

        // Handle Autoplay after loading (for videos)
        useEffect(() => {
            if (ready && autoPlay && ref.current && isVideo) {
                const playPromise = ref.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.log("Autoplay prevented:", err);
                    });
                }
            }
        }, [ready, autoPlay, isVideo]);

        const handleLoad = () => {
            if (!mountedRef.current) return;
            setLoading(false);
            setReady(true);
            if (onLoaded) onLoaded();
        };

        const handleError = () => {
            if (!mountedRef.current) return;
            setLoading(false);
            setError(true);
            if (onError) onError();
        };

        return (
            <div className={className} style={{ ...style, position: 'relative', overflow: 'hidden', background: isStory ? '#000' : '#f0f0f0' }}>
                {/* Loader - shows until ready */}
                {loading && !error && (
                    <div className="shimmer-loader" style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isStory ? '#121212' : '#f8f8f8'
                    }}>
                        <div className="loader-spinner"></div>
                    </div>
                )}

                {/* Media - hidden until ready */}
                {isVideo ? (
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
                ) : (
                    <img
                        src={error ? "https://via.placeholder.com/600x800?text=Error+Loading+Media" : src}
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
                )}

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
        const shouldTruncate = caption && caption.length > 80;

        return (
            <div className="feed-caption-container" style={{ padding: '0 16px 16px' }}>
                <div className={`feed-caption ${expanded ? 'expanded' : ''}`} style={{ fontSize: 14, lineHeight: '1.4' }}>
                    <strong>{username}</strong> {expanded ? caption : (shouldTruncate ? `${caption.slice(0, 80)}...` : caption)}
                    {!expanded && shouldTruncate && (
                        <span
                            className="caption-more-btn"
                            onClick={() => setExpanded(true)}
                            style={{ color: '#8e8e8e', cursor: 'pointer', marginLeft: 4 }}
                        >
                            more
                        </span>
                    )}
                </div>
                <div className="feed-date" style={{ fontSize: 10, color: '#8e8e8e', marginTop: 4, textTransform: 'uppercase' }}>{date}</div>
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
                            <button
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
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const mobileFeedRef = useRef(null);
    useEffect(() => {
        if (isMobileFeed && selectedPost && mobileFeedRef.current) {
            const element = document.getElementById(`feed-post-${selectedPost.id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, [isMobileFeed, selectedPost]);

    // Keyboard Support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedPost) {
                if (e.key === 'ArrowRight') nextPost(e);
                if (e.key === 'ArrowLeft') prevPost(e);
                if (e.key === 'Escape') closePost();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPost]);

    return (
        <div className="page-view page-fade">
            <style>{`
                /* --- PROFILE HEADER STYLES --- */
                .profile-header {
                    display: flex;
                    max-width: 935px;
                    margin: 0 auto 44px;
                    padding: 30px 20px 0;
                    align-items: flex-start;
                    color: #262626;
                }
                .profile-avatar-container {
                    flex-grow: 1;
                    margin-right: 30px;
                    display: flex;
                    justify-content: center;
                    max-width: 290px; /* Standard IG width for avatar col */
                }
                .profile-avatar {
                    width: 150px; height: 150px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid #dbdbdb;
                    padding: 2px; /* Ring gap */
                }
                .profile-info {
                    flex-grow: 2;
                    display: flex;
                    flex-direction: column;
                }
                .profile-username-row {
                    display: flex; align-items: center;
                    margin-bottom: 20px;
                }
                .username-text {
                    font-size: 28px;
                    font-weight: 300;
                    margin-right: 20px;
                    line-height: 32px;
                }
                .edit-profile-btn {
                    background-color: transparent;
                    border: 1px solid #dbdbdb;
                    color: #262626;
                    border-radius: 4px;
                    padding: 5px 9px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                }
                .profile-stats-row {
                    display: flex;
                    margin-bottom: 20px;
                    font-size: 16px;
                }
                .stat-item { margin-right: 40px; }
                .stat-value { font-weight: 600; color: #262626; }
                
                .profile-bio-row {
                    font-size: 16px;
                    line-height: 24px;
                }
                .full-name { font-weight: 600; color: #262626; }
                
                /* Mobile Layout */
                @media (max-width: 735px) {
                    .profile-header {
                        flex-direction: column;
                        margin-bottom: 24px;
                        padding: 16px 16px 24px;
                        border-bottom: 1px solid #dbdbdb;
                    }
                    .profile-mobile-top {
                        display: flex;
                        width: 100%;
                        margin-bottom: 24px;
                        align-items: center;
                    }
                    .profile-avatar-container {
                        margin-right: 28px;
                        width: 77px; height: 77px;
                        flex-grow: 0;
                        max-width: auto;
                        display: block; /* Override flex center */
                    }
                    .profile-avatar { width: 77px; height: 77px; }
                    
                    .profile-info { width: 100%; }
                    
                    /* Hide Desktop Rows on Mobile */
                    .profile-username-row { display: none; } 
                    .profile-stats-row { display: none; }
                    
                    /* Mobile Specific Stats */
                    .mobile-stats-row {
                        display: flex;
                        justify-content: space-around;
                        border-top: 1px solid #dbdbdb;
                        padding: 12px 0;
                        font-size: 14px;
                        color: #8e8e8e;
                    }
                    .mobile-stat-col {
                        display: flex; flex-direction: column; align-items: center;
                    }
                    .mobile-stat-value {
                        font-weight: 600;
                        color: #262626;
                    }
                    
                    /* Mobile Username Header */
                    .mobile-username {
                        font-size: 28px;
                        font-weight: 300;
                        margin-bottom: 12px;
                        display: block;
                    }

                    /* Remove side padding for full-width highlights/grid */
                    .library-container {
                        padding-left: 0;
                        padding-right: 0;
                    }
                }
                @media (min-width: 736px) {
                    .mobile-username-block { display: none; }
                    .mobile-stats-bar { display: none; }
                }

                /* --- CLICKABLE STATS --- */
                .stat-clickable {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .stat-clickable:hover {
                    color: #0095f6;
                }

                /* --- USER LIST MODAL --- */
                .user-list-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.65);
                    z-index: 3000;
                    display: flex; align-items: center; justify-content: center;
                }
                .user-list-modal {
                    background: #fff;
                    border-radius: 12px;
                    width: 400px;
                    max-width: 90vw;
                    max-height: 70vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .user-list-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid #dbdbdb;
                    font-weight: 600;
                }
                .user-list-header h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                .user-list-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }
                .user-list-item {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    gap: 12px;
                }
                .user-list-item:hover {
                    background: #fafafa;
                }
                .user-avatar-placeholder {
                    width: 44px; height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
                    flex-shrink: 0;
                }
                .user-details {
                    flex: 1;
                    min-width: 0;
                }
                .user-name {
                    font-weight: 600;
                    color: #262626;
                    text-decoration: none;
                    font-size: 14px;
                    display: block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .user-name:hover {
                    text-decoration: underline;
                }
                .user-date {
                    font-size: 12px;
                    color: #8e8e8e;
                }
                .user-action-btn {
                    background: transparent;
                    border: 1px solid #dbdbdb;
                    border-radius: 8px;
                    padding: 7px 16px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    color: #262626;
                    transition: background 0.2s;
                }
                .user-action-btn:hover {
                    background: #fafafa;
                }
                .user-list-search {
                    padding: 8px 16px;
                    border-bottom: 1px solid #dbdbdb;
                }
                .user-search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    border-radius: 8px;
                    background: #efefef;
                    font-size: 14px;
                    outline: none;
                }
                .user-search-input:focus {
                    background: #e0e0e0;
                }

                /* --- TABS --- */
                .profile-tabs {
                    display: flex;
                    justify-content: center;
                    border-top: 1px solid #dbdbdb;
                    margin-bottom: 5px;
                }
                .tab-item {
                    display: flex;
                    align-items: center;
                    height: 52px;
                    margin-right: 60px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    color: #8e8e8e;
                    transition: color 0.1s;
                }
                .tab-item:last-child { margin-right: 0; }
                .tab-item.active {
                    color: #262626;
                    border-top: 1px solid #262626;
                    margin-top: -1px;
                }
                .tab-item:hover { color: #262626; }

                /* --- GRID STYLES --- */
                .library-container {
                    max-width: 935px;
                    margin: 0 auto;
                    padding: 20px 20px 0;
                }
                .library-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 4px; /* Instagram style tight gap */
                    padding-bottom: 40px;
                }
                .post-thumbnail {
                    position: relative;
                    width: 100%;
                    padding-top: 100%; /* 1:1 Aspect Ratio */
                    background: #f0f0f0;
                    cursor: pointer;
                    overflow: hidden;
                }
                .post-image {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                .post-thumbnail:hover .post-image { transform: scale(1.05); }
                .multi-icon {
                    position: absolute; top: 10px; right: 10px;
                    color: white; filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
                }

                /* --- HIGHLIGHTS BAR --- */
                .highlights-bar {
                    display: flex;
                    gap: 15px;
                    overflow-x: auto;
                    padding-bottom: 30px;
                    margin-bottom: 10px;
                    scrollbar-width: none; /* Hide scrollbar Firefox */
                    -ms-overflow-style: none;  /* Hide scrollbar IE 10+ */
                }
                .highlights-bar::-webkit-scrollbar { display: none; }
                
                .highlight-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    cursor: pointer;
                    min-width: 70px;
                }
                .highlight-circle {
                    width: 70px; /* Reduced specific size from 77 */
                    height: 70px;
                    border-radius: 50%;
                    padding: 3px;
                    background: #dbdbdb; /* Default grey border */
                    /* border: 2px solid #fff; */
                    position: relative;
                }
                .highlight-item:hover .highlight-circle {
                    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                }
                .highlight-img-container {
                    width: 100%; height: 100%;
                    border-radius: 50%;
                    border: 2px solid #fff; /* Inner white border */
                    overflow: hidden;
                    background: #000;
                }
                .highlight-img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .highlight-title {
                    margin-top: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #262626;
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 74px;
                }
                
                /* Highlights Navigation Arrows */
                .highlights-nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-70%);
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid #dbdbdb;
                    border-radius: 50%;
                    width: 26px;
                    height: 26px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    color: #262626;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    transition: all 0.2s;
                }
                .highlights-nav-btn:hover {
                    background: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .highlights-nav-left { left: 0; }
                .highlights-nav-right { right: 0; }

                /* --- STORY VIEWER --- */
                .story-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: #1a1a1a;
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .story-carousel-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    gap: 40px; /* Space between active and next */
                    perspective: 1000px; /* For 3D feel if we wanted, mostly flat usage here */
                }

                .story-container {
                    width: 100%; height: 100%;
                    /* Web Aspect Ratio 9:16 approx fixed max height */
                    width: 380px; /* Specific IG Web width approx */
                    height: 675px; 
                    max-height: 95vh;
                    max-width: 95vw;
                    position: relative;
                    background: #000;
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex; flex-direction: column;
                    flex-shrink: 0; /* Don't shrink active */
                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                }

                /* Mobile overrides */
                @media (max-width: 768px) {
                    .story-container { width: 100%; height: 100%; border-radius: 0; }
                    .story-peer { display: none !important; } /* Hide peers on mobile, it's too tight */
                }

                /* Peer (Next/Prev) Styling */
                .story-peer {
                    width: 200px;
                    height: 355px; /* Smaller preview */
                    background: #222;
                    border-radius: 8px;
                    cursor: pointer;
                    flex-shrink: 0;
                    position: relative;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                    display: flex; /* Center alignment */
                    align-items: center; justify-content: center;
                }
                .story-peer:hover {
                    opacity: 0.8;
                    transform: scale(1.05);
                }
                .peer-content {
                    width: 100%; height: 100%;
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .peer-media {
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .peer-overlay {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center; justify-content: center;
                }
                .peer-info {
                    text-align: center;
                    display: flex; flex-direction: column; align-items: center;
                }
                .peer-avatar {
                    width: 44px; height: 44px;
                    border-radius: 50%;
                    border: 2px solid #e1306c; /* Brand color ring */
                    background: #333;
                    margin-bottom: 8px;
                }
                .peer-name {
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                }

                .story-header {
                    position: absolute; top: 20px; left: 0; right: 0;
                    padding: 0 15px;
                    z-index: 20;
                    display: flex; flex-direction: column; gap: 8px;
                }
                
                .progress-bars {
                    display: flex; gap: 4px;
                    width: 100%;
                }
                .progress-bar-bg {
                    flex: 1; height: 2px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%; background: #fff;
                    width: 0%;
                }
                .progress-bar-fill.completed { width: 100%; }

                .story-user-info { display: flex; align-items: center; gap: 10px; }
                .story-avatar { width: 32px; height: 32px; border-radius: 50%; background: #dbdbdb; border: 1px solid #fff; flex-shrink: 0; }
                .story-meta { display: flex; flex-direction: column; color: #fff; font-size: 14px; font-weight: 600; }
                .story-time { font-size: 12px; font-weight: 400; color: #dbdbdb; margin-top: 2px; }

                /* Story Controls Header */
                .story-controls-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    width: 100%;
                }
                .story-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    color: white;
                }
                .story-action-btn {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s;
                }
                .story-action-btn:hover { opacity: 0.7; }
                
                .story-media-view {
                    flex: 1;
                    position: relative;
                    display: flex; align-items: center; justify-content: center;
                    background: #000;
                }
                .story-media-content {
                    width: 100%; height: 100%;
                    object-fit: contain;
                }
                .story-caption {
                    position: absolute; bottom: 40px;
                    left: 0; right: 0;
                    text-align: center;
                    color: white;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                }

                .story-nav-area {
                    position: absolute; top: 0; bottom: 0; width: 40%;
                    z-index: 10;
                    /* background: rgba(255,0,0,0.1); Debug tap area */
                    cursor: pointer;
                }
                .story-nav-left { left: 0; }
                .story-nav-right { right: 0; }
                
                /* Arrows */
                .story-arrow-btn {
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.8);
                    border: none;
                    display: flex; align-items: center; justify-content: center;
                    color: black;
                    cursor: pointer;
                    margin: 0 10px; /* Space from container/peers */
                    flex-shrink: 0;
                    z-index: 30;
                    transition: transform 0.2s;
                }
                .story-arrow-btn:hover {
                    box-shadow: 0 0 8px rgba(255,255,255,0.5);
                    transform: scale(1.1);
                }
                
                @media (max-width: 768px) {
                    .story-arrow-btn { display: none; } /* Mobile uses tap */
                }
                
                .story-close {
                    position: absolute; top: 20px; right: 20px;
                    color: #fff; z-index: 3001; font-size: 28px;
                    cursor: pointer;
                }

                /* --- POST MODAL --- */
                .post-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.85);
                    z-index: 2000;
                    display: flex; align-items: center; justify-content: center;
                    padding: 20px;
                }
                .post-modal-content {
                    background: #fff; max-width: 935px; width: 100%; max-height: 90vh;
                    display: flex; flex-direction: row; position: relative;
                    border-radius: 4px; overflow: hidden;
                    box-shadow: 0 0 20px rgba(0,0,0,0.2);
                }
                .modal-image-container { flex: 1.2; background: #000; position: relative; display: flex; align-items: center; justify-content: center; min-height: 450px; }
                .modal-image { max-width: 100%; max-height: 90vh; object-fit: contain; }
                .modal-info { flex: 1; padding: 20px; display: flex; flex-direction: column; border-left: 1px solid #efefef; overflow-y: auto; background: white; }
                
                /* Modal Navigation Buttons (Desktop) */
                .post-nav-btn {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    background: none; border: none; color: #fff;
                    cursor: pointer; padding: 0; z-index: 2200;
                    display: flex; align-items: center; justify-content: center;
                    width: 60px; height: 60px;
                    transition: all 0.2s ease;
                }
                .post-nav-btn:hover {
                    opacity: 0.7;
                    transform: translateY(-50%) scale(1.1);
                }
                .post-nav-btn.prev-post { left: 20px; }
                .post-nav-btn.next-post { right: 20px; }
                
                /* Large Chevron Styling for Post Nav */
                .post-nav-icon {
                    filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));
                }
                
                /* Carousel Buttons */
                .carousel-btn {
                    position: absolute; top: 50%; transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.8); border: none;
                    border-radius: 50%; width: 30px; height: 30px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; z-index: 25; color: #000;
                }
                .carousel-btn.left { left: 10px; }
                .carousel-btn.right { right: 10px; }

                .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
                .modal-avatar { width: 32px; height: 32px; border-radius: 50%; background: #dbdbdb; overflow: hidden; display: flex; align-items: center; justify-content: center; }
                .modal-avatar-img { width: 100%; height: 100%; object-fit: cover; }
                .modal-username { font-weight: 600; font-size: 14px; }
                
                /* Visibility Helpers */
                .mobile-only { display: none !important; }
                .mobile-only-flex { display: none !important; }
                .desktop-only { display: none !important; }
                .desktop-only-flex { display: none !important; }
                .desktop-only-block { display: none !important; }
                
                @media (min-width: 769px) {
                  .desktop-only { display: block !important; }
                  .desktop-only-flex { display: flex !important; }
                  .desktop-only-block { display: block !important; }
                }
                
                @media (max-width: 768px) {
                  .mobile-only { display: block !important; }
                  .mobile-only-flex { display: flex !important; }
                  
                  /* Mobile Profile Layout */
                  .profile-header { flex-direction: column; padding: 16px; margin-bottom: 0; }
                  .profile-mobile-top { display: flex; align-items: center; width: 100%; gap: 28px; }
                  .profile-mobile-top .profile-avatar-container { margin-right: 0; flex-shrink: 0; }
                  .profile-mobile-top .profile-avatar { width: 77px; height: 77px; }
                  
                  .mobile-stats-inline { display: flex; flex: 1; justify-content: space-around; }
                  .mobile-stat-item { text-align: center; }
                  .mobile-stat-item .stat-number { font-weight: 600; font-size: 16px; }
                  .mobile-stat-item .stat-label { font-size: 13px; color: #262626; }
                  
                  .mobile-bio-section { padding: 12px 16px 0; }
                  .mobile-name { font-weight: 600; font-size: 14px; }
                  .mobile-bio { font-size: 14px; white-space: pre-wrap; line-height: 1.4; }
                  
                  .mobile-edit-btn-container { padding: 12px 16px; }
                  .mobile-edit-btn-container .edit-profile-btn { width: 100%; }
                  
                  .mobile-username-header { padding: 0 0 12px; }
                  .mobile-username { font-size: 20px; font-weight: 400; margin: 0; }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .library-container { padding: 10px 0 0; } 
                    .library-grid { gap: 2px; }
                    .post-modal-overlay { padding: 0; background: #fff; }
                    .post-modal-content { flex-direction: column; max-height: 100vh; height: 100vh; width: 100vw; max-width: none; border-radius: 0; border: none; }
                    .modal-image-container { height: 50vh; flex: none; background: #000; border-radius: 0; }
                    .modal-image { max-height: 50vh; }
                    .post-nav-btn { display: none; }
                    .modal-info { border-left: none; padding: 12px 16px; flex: 1; overflow-y: auto; }
                    
                    .mobile-only { display: block !important; }
                    .mobile-only-flex { display: flex !important; }
                    .desktop-only { display: none !important; }

                    .modal-header.mobile-only {
                        padding: 12px 16px;
                        border-bottom: 1px solid #efefef;
                        background: #fff;
                    }
                    .modal-actions.mobile-only {
                        padding: 12px 16px 8px;
                        display: flex;
                        gap: 16px;
                    }
                    .modal-caption.mobile-only {
                        padding: 0 16px 12px;
                        font-size: 14px;
                        line-height: 1.4;
                    }
                    .modal-date.mobile-only {
                        padding: 0 16px 20px;
                        font-size: 10px;
                        color: #8e8e8e;
                        text-transform: uppercase;
                    }

                    /* Mobile Feed Viewer */
                    .mobile-feed-overlay {
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: #fff; z-index: 4000;
                        display: flex; flex-direction: column;
                    }
                    .mobile-feed-header {
                        height: 44px; display: flex; align-items: center; justify-content: space-between;
                        padding: 0 16px; border-bottom: 1px solid #efefef;
                        position: sticky; top: 0; background: #fff; z-index: 10;
                    }
                    .mobile-feed-title { font-weight: 600; font-size: 16px; }
                    .mobile-feed-content { flex: 1; overflow-y: auto; background: #fff; }
                    .mobile-feed-item { border-bottom: 1px solid #efefef; padding-bottom: 10px; }
                    .feed-media-container { width: 100vw; background: #000; line-height: 0; position: relative; }
                    .feed-media { width: 100%; max-height: 80vh; object-fit: contain; }
                    .feed-media-scroll {
                        display: flex; 
                        overflow-x: auto; 
                        scroll-snap-type: x mandatory;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .feed-media-scroll::-webkit-scrollbar { display: none; }
                    .feed-media-slide { flex-shrink: 0; width: 100vw; scroll-snap-align: start; }
                    .feed-dots { 
                        position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);
                        display: flex; gap: 4px; pointer-events: none; z-index: 5;
                    }
                    .feed-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); transition: all 0.2s; }
                    .feed-dot.active { background: #fff; transform: scale(1.1); }
                    
                    .feed-nav-btn {
                        position: absolute; top: 50%; transform: translateY(-50%);
                        background: rgba(255, 255, 255, 0.7); border: none;
                        border-radius: 50%; width: 26px; height: 26px;
                        display: flex; align-items: center; justify-content: center;
                        cursor: pointer; z-index: 25; color: #000;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .feed-nav-btn.left { left: 10px; }
                    .feed-nav-btn.right { right: 10px; }

                    /* Allow swipe on mobile by letting touch events pass through shield if needed */
                    @media (max-width: 768px) {
                        .media-protection-layer {
                            pointer-events: none;
                        }
                    }
                }
            `}</style>

            {/* --- HERO SECTION --- */}
            {/* --- PROFILE HEADER --- */}
            <div className="profile-header">
                {/* Desktop Avatar Container */}
                <div className="profile-avatar-container desktop-only-flex">
                    <img
                        src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"}
                        alt={profileData?.username}
                        className="profile-avatar"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                    />
                </div>

                {/* Mobile Username Header */}
                <div className="mobile-username-header mobile-only-flex">
                    <h2 className="mobile-username">{profileData?.username}</h2>
                </div>

                <div className="profile-mobile-top mobile-only-flex">
                    <div className="profile-avatar-container">
                        <img
                            src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"}
                            alt={profileData?.username}
                            className="profile-avatar"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150' }}
                        />
                    </div>

                    {/* Mobile Stats - Right of Avatar */}
                    <div className="mobile-stats-inline">
                        <div className="mobile-stat-item">
                            <div className="stat-number">{posts.length}</div>
                            <div className="stat-label">posts</div>
                        </div>
                        <div className="mobile-stat-item stat-clickable" onClick={() => setUserListModal({ open: true, title: 'Followers', users: profileData?.followersList || [] })}>
                            <div className="stat-number">{profileData?.followers || 0}</div>
                            <div className="stat-label">followers</div>
                        </div>
                        <div className="mobile-stat-item stat-clickable" onClick={() => setUserListModal({ open: true, title: 'Following', users: profileData?.followingList || [] })}>
                            <div className="stat-number">{profileData?.following || 0}</div>
                            <div className="stat-label">following</div>
                        </div>
                    </div>
                </div>

                {/* Mobile Name & Bio */}
                <div className="mobile-bio-section mobile-only">
                    <div className="mobile-name">{profileData?.name}</div>
                    <div className="mobile-bio">{profileData?.bio}</div>
                    <div className="mobile-tagline" style={{ fontSize: '13px', color: '#8e8e8e', marginTop: '8px' }}>
                        2021–2025 · What lived on Instagram now lives here.
                    </div>
                </div>

                {/* Mobile Edit Profile Button */}
                <div className="mobile-edit-btn-container mobile-only">
                    <button className="edit-profile-btn">Edit Profile</button>
                </div>

                {/* Desktop Profile Info */}
                <div className="profile-info desktop-only-flex">
                    <div className="profile-username-row">
                        <h2 className="username-text">{profileData?.username}</h2>
                        <button className="edit-profile-btn">Edit Profile</button>
                        <FiHeart size={24} style={{ marginLeft: 10, cursor: 'pointer' }} />
                    </div>
                    <div className="profile-stats-row">
                        <span className="stat-item stat-clickable" onClick={() => setSearchParams({ list: 'followers' })}>
                            <span className="stat-value">{profileData?.followers || 0}</span> followers
                        </span>
                        <span className="stat-item stat-clickable" onClick={() => setSearchParams({ list: 'following' })}>
                            <span className="stat-value">{profileData?.following || 0}</span> following
                        </span>
                    </div>
                    <div className="profile-bio-row">
                        <div className="full-name">{profileData?.name}</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{profileData?.bio}</div>
                        <div className="tagline" style={{ fontSize: '14px', color: '#8e8e8e', marginTop: '12px' }}>
                            2021–2025 · What lived on Instagram now lives here.
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW HIGHLIGHTS BAR --- */}
            <HighlightBar
                highlights={highlights}
                onOpenHighlight={openHighlight}
            />

            {/* Removed explicit "X posts" row under highlights */}

            {/* --- MAIN GRID --- */}
            {/* --- TABS --- */}
            <div className="profile-tabs">
                <div
                    className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    <FiGrid size={12} style={{ marginRight: 6 }} /> POSTS
                </div>
                <div
                    className={`tab-item ${activeTab === 'arts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('arts')}
                >
                    <FiLayers size={12} style={{ marginRight: 6 }} /> ARTS
                </div>
                <div
                    className={`tab-item ${activeTab === 'reels' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reels')}
                >
                    <FiFilm size={12} style={{ marginRight: 6 }} /> REELS
                </div>
                <div
                    className={`tab-item ${activeTab === 'archive' ? 'active' : ''}`}
                    onClick={() => setActiveTab('archive')}
                >
                    <FiArchive size={12} style={{ marginRight: 6 }} /> ARCHIVE
                </div>
            </div>

            {/* --- MAIN GRID --- */}
            <div className="library-container">
                <div className="library-grid animate-entry">
                    {(activeTab === 'posts' ? posts : activeTab === 'arts' ? arts : activeTab === 'reels' ? reels : archivedPosts).map(post => {
                        const isVideo = post.type === 'video' || (post.image && post.image.endsWith('.mp4'));
                        const hasMultiple = post.images && post.images.length > 1;

                        return (
                            <div
                                key={post.id}
                                className="post-thumbnail"
                                onClick={() => openPost(post)}
                                onMouseEnter={() => {
                                    // Proactive Preloading: Load full-res image on hover
                                    const media = post.images ? post.images[0] : (post.image || post.url);
                                    if (media && !media.endsWith('.mp4')) {
                                        const img = new Image();
                                        img.src = media;
                                    }
                                }}
                            >
                                {isVideo ? (
                                    <video
                                        src={post.image}
                                        className="post-image"
                                        muted
                                        preload="metadata"
                                        playsInline
                                        onMouseOver={e => e.target.play().catch(() => { })}
                                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                                    />
                                ) : (
                                    <img src={post.image} alt="Post" className="post-image" loading="eager" />
                                )}

                                {isVideo && (
                                    <div className="multi-icon">
                                        <FiPlay size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                                    </div>
                                )}
                                {hasMultiple && !isVideo && (
                                    <div className="multi-icon">
                                        <FiLayers size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- NEW STORY VIEWER --- */}
            {viewingHighlight && (
                <StoryViewer
                    activeHighlight={viewingHighlight}
                    highlights={highlights}
                    onClose={closeStory}
                    onSwitchHighlight={switchHighlight}
                    profileData={profileData}
                />
            )}

            {/* --- REELS VIEWER MODAL --- */}
            {selectedReel && (
                <ReelsViewer
                    reel={selectedReel}
                    reels={reels}
                    onClose={closePost}
                    onSwitchReel={switchReel}
                    profileData={profileData}
                />
            )}

            {/* --- POST VIEWER MODAL --- */}
            {
                selectedPost && !isMobileFeed && (
                    <div className="post-modal-overlay" onClick={closePost}>
                        {/* Desktop Close Btn (Outside content) */}
                        <div className="desktop-only-block" style={{ position: 'absolute', top: 20, right: 20, color: 'white', cursor: 'pointer', zIndex: 2100 }} onClick={closePost}><FiX size={30} /></div>

                        {/* Prev Post Btn (Desktop) */}
                        {(() => {
                            const currentList = activeTab === 'posts' ? posts :
                                activeTab === 'arts' ? arts :
                                    activeTab === 'reels' ? reels : archivedPosts;
                            const idx = currentList.findIndex(p => p.id === selectedPost.id);

                            return (
                                <>
                                    {idx > 0 && (
                                        <button
                                            className="post-nav-btn prev-post desktop-only-block"
                                            onClick={prevPost}
                                        >
                                            <FiChevronLeft size={44} className="post-nav-icon" />
                                        </button>
                                    )}
                                    {idx < currentList.length - 1 && (
                                        <button
                                            className="post-nav-btn next-post desktop-only-block"
                                            onClick={nextPost}
                                        >
                                            <FiChevronRight size={44} className="post-nav-icon" />
                                        </button>
                                    )}
                                </>
                            );
                        })()}

                        <div className="post-modal-content" onClick={e => e.stopPropagation()}>
                            {/* Mobile Header (Top) */}
                            <div className="modal-header mobile-only">
                                <div className="modal-avatar">
                                    <img src={profileData?.profilePic} className="modal-avatar-img" alt="" loading="eager" />
                                </div>
                                <div className="modal-username">elvanparthasarathy</div>
                                <FiX
                                    size={24}
                                    style={{ marginLeft: 'auto', cursor: 'pointer' }}
                                    onClick={closePost}
                                />
                            </div>

                            <div className="modal-image-container">
                                {/* Post Navigation Buttons (Mobile) */}
                                <button className="post-nav-btn left mobile-only" onClick={prevPost}>
                                    <FiChevronLeft size={32} />
                                </button>
                                <button className="post-nav-btn right mobile-only" onClick={nextPost}>
                                    <FiChevronRight size={32} />
                                </button>

                                {selectedPost.images && selectedPost.images.length > 1 && (
                                    <>
                                        {/* Carousel Navigation Buttons */}
                                        {postImageIndex > 0 && (
                                            <button className="carousel-btn left" onClick={prevImage}>
                                                <FiChevronLeft size={24} />
                                            </button>
                                        )}
                                        {postImageIndex < selectedPost.images.length - 1 && (
                                            <button className="carousel-btn right" onClick={nextImage}>
                                                <FiChevronRight size={24} />
                                            </button>
                                        )}
                                    </>
                                )}

                                {(() => {
                                    const currentMediaCallback = selectedPost.images ? selectedPost.images[postImageIndex] : selectedPost.image;
                                    const isVideoCallback = selectedPost.type === 'video' || (currentMediaCallback && currentMediaCallback.endsWith('.mp4'));

                                    // Preload next image if in a carousel
                                    if (selectedPost.images && postImageIndex < selectedPost.images.length - 1) {
                                        const nextImg = new Image();
                                        nextImg.src = selectedPost.images[postImageIndex + 1];
                                    }

                                    return (
                                        <MediaLoader
                                            src={currentMediaCallback}
                                            type={isVideoCallback ? 'video' : 'image'}
                                            className="modal-image"
                                            controls={isVideoCallback}
                                            autoPlay={isVideoCallback}
                                            playsInline={isVideoCallback}
                                            style={{ maxHeight: '90vh', maxWidth: '100%' }}
                                        />
                                    );
                                })()}

                                {/* Dots */}
                                {selectedPost.images && selectedPost.images.length > 1 && (
                                    <div style={{ position: 'absolute', bottom: 15, display: 'flex', gap: 6 }}>
                                        {selectedPost.images.map((_, idx) => (
                                            <div key={idx} style={{ width: 6, height: 6, borderRadius: '50%', background: idx === postImageIndex ? '#fff' : 'rgba(255,255,255,0.4)' }}></div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Actions (Below Image) */}
                            <div className="modal-actions mobile-only">
                                <FiHeart size={24} />
                                <FiMessageCircle size={24} />
                            </div>

                            {/* Mobile Caption (Below Actions) */}
                            <div className="modal-caption mobile-only">
                                <strong>elvanparthasarathy</strong> {selectedPost.caption}
                            </div>
                            <div className="modal-date mobile-only">{selectedPost.date}</div>

                            {/* Desktop Info (Right Sidebar) */}
                            <div className="modal-info desktop-only-flex">
                                <div className="modal-header">
                                    <div className="modal-avatar">
                                        <img src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"} className="modal-avatar-img" alt="" />
                                    </div>
                                    <div className="modal-username">elvanparthasarathy</div>
                                    <FiX
                                        size={24}
                                        style={{ marginLeft: 'auto', cursor: 'pointer' }}
                                        onClick={closePost}
                                    />
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto' }}>
                                    <div className="modal-caption">
                                        {selectedPost.caption}
                                    </div>
                                    <div className="modal-date">{selectedPost.date}</div>
                                </div>
                                <div style={{ marginTop: 15, borderTop: '1px solid #efefef', paddingTop: 10, display: 'flex', gap: 15 }}>
                                    <FiHeart size={24} />
                                    <FiMessageCircle size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- MOBILE FEED OVERLAY --- */}
            {
                isMobileFeed && (
                    <div className="mobile-feed-overlay" ref={mobileFeedRef}>
                        <div className="mobile-feed-header">
                            <FiChevronLeft size={28} onClick={closePost} />
                            <div className="mobile-feed-title">Posts</div>
                            <div style={{ width: 28 }}></div> {/* Spacer */}
                        </div>
                        <div className="mobile-feed-content">
                            {(activeTab === 'posts' ? posts : activeTab === 'arts' ? arts : activeTab === 'reels' ? reels : archivedPosts).map((post) => (
                                <div key={post.id} id={`feed-post-${post.id}`} className="mobile-feed-item">
                                    <div className="modal-header">
                                        <div className="modal-avatar">
                                            <img src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"} className="modal-avatar-img" alt="" />
                                        </div>
                                        <div className="modal-username">elvanparthasarathy</div>
                                    </div>
                                    <FeedItemMedia post={post} />
                                    <div className="modal-actions" style={{ padding: '8px 16px 4px', display: 'flex', gap: 16 }}>
                                        <FiHeart size={26} />
                                        <FiMessageCircle size={26} />
                                    </div>
                                    <TruncatedCaption username="elvanparthasarathy" caption={post.caption} date={post.date} />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* --- USER LIST MODAL --- */}
            {userListModal.open && (
                <div className="user-list-overlay" onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('list');
                    setSearchParams(newParams);
                }}>
                    <div className="user-list-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="user-list-header">
                            <h2>{userListModal.title}</h2>
                            <FiX size={22} style={{ cursor: 'pointer' }} onClick={() => {
                                const newParams = new URLSearchParams(searchParams);
                                newParams.delete('list');
                                setSearchParams(newParams, { replace: false });
                                setUserSearchQuery('');
                            }} />
                        </div>
                        <div className="user-list-search">
                            <input
                                type="text"
                                placeholder="Search"
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="user-search-input"
                            />
                        </div>
                        <div className="user-list-body">
                            {filteredUsers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 40, color: '#8e8e8e' }}>
                                    {userSearchQuery ? 'No results found' : 'No users found'}
                                </div>
                            ) : (
                                filteredUsers.map((user, idx) => (
                                    <div key={idx} className="user-list-item">
                                        <div className="user-avatar-placeholder"></div>
                                        <div className="user-details">
                                            <a href={user.url} target="_blank" rel="noopener noreferrer" className="user-name">{user.username}</a>
                                        </div>
                                        <button className="user-action-btn">Remove</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;
