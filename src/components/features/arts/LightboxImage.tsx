import React, { useState, useEffect, useCallback, useRef } from 'react';

const LOADED_IMAGES_CACHE = new Set<string>();

export const LightboxImage = React.memo(({ img, isCurrent, isMobile, isDragging, preventImageDrag, activeImgRef }: any) => {
    const [isLoaded, setIsLoaded] = useState(() => LOADED_IMAGES_CACHE.has(img.url));
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (LOADED_IMAGES_CACHE.has(img.url)) {
            setIsLoaded(true);
        } else if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
            LOADED_IMAGES_CACHE.add(img.url);
        } else {
            setIsLoaded(false);
        }
    }, [img.url]);

    const setRefs = useCallback((el: HTMLImageElement) => {
        imgRef.current = el;
        if (isCurrent && activeImgRef) {
            activeImgRef.current = el;
        }
    }, [isCurrent, activeImgRef]);

    return (
        <div className="arts-lb-slide">
            {!isLoaded && (
                <div className="arts-lb-loader">
                    <div className="arts-lb-spinner"></div>
                </div>
            )}
            <img
                ref={setRefs}
                src={img.url}
                alt="Artwork"
                className={`arts-lb-img ${isLoaded ? 'loaded' : ''}`}
                loading={isCurrent ? "eager" : "lazy"}
                decoding={isCurrent ? "sync" : "async"}
                onLoad={() => {
                    setIsLoaded(true);
                    LOADED_IMAGES_CACHE.add(img.url);
                }}
                onError={(e) => {
                    setIsLoaded(true);
                    // Add a default background or style if it breaks
                    e.currentTarget.style.backgroundColor = '#222';
                }}
                draggable={false}
                onDragStart={preventImageDrag}
                style={{
                    opacity: isLoaded ? 1 : 0,
                    transform: isLoaded ? 'scale(1)' : 'scale(0.98)',
                    transition: isDragging ? 'none' : 'opacity 0.2s ease-out, transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                }}
            />
        </div>
    );
});
