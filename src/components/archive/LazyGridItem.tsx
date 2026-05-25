import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiLayers } from 'react-icons/fi';

// Move getThumbnailUrl here or import it if shared
const getThumbnailUrl = (url) => {
    if (!url || typeof url !== 'string') return url;
    if (url.endsWith('.mp4')) return url;
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&output=webp&q=60`;
};

export default function LazyGridItem ({ post, onClick }) => {
    const isVideo = post.type === 'video' || (post.image && post.image.endsWith('.mp4'));
    const hasMultiple = post.images && post.images.length > 1;
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="post-thumbnail"
            onClick={() => onClick(post)}
            style={{ position: 'relative' }}
        >
            {!isLoaded && (
                <div className="skel" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
            )}

            {isVisible && (
                isVideo ? (
                    <video
                        src={post.image}
                        className="post-image"
                        muted
                        preload="none"
                        playsInline
                        onLoadedData={() => setIsLoaded(true)}
                        onMouseOver={e => e.target.play().catch(() => { })}
                        onMouseOut={e => { e.target.pause(); e.target.currentTime = 0; }}
                        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 2 }}
                    />
                ) : (
                    <img 
                        src={getThumbnailUrl(post.image)} 
                        alt="Post" 
                        className="post-image" 
                        loading="lazy" 
                        onLoad={() => setIsLoaded(true)}
                        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease', zIndex: 2 }}
                    />
                )
            )}

            {isVideo && (
                <div className="multi-icon" style={{ zIndex: 3 }}>
                    <FiPlay size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                </div>
            )}
            {hasMultiple && !isVideo && (
                <div className="multi-icon" style={{ zIndex: 3 }}>
                    <FiLayers size={22} style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} />
                </div>
            )}
        </div>
    );
};
