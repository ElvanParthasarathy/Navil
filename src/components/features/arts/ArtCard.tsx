import React, { useState } from 'react';
import { getOptimizedImage } from '../../../lib/media';
import { stripHtml } from './artsUtils';

export const ArtCard = React.memo(({ item, onOpen, caption }: any) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Normalize images: ensure we have a valid array of strings
    const imgs = Array.isArray(item.images)
        ? item.images.filter((img: any) => typeof img === 'string')
        : (typeof item.images === 'string' ? [item.images] : (item.image ? [item.image] : []));

    const thumbUrl = imgs.length > 0 ? getOptimizedImage(imgs[0], 'thumb') : '';

    return (
        <div
            className="arts-grid-item"
            onClick={() => onOpen(item)}
            role="button"
            tabIndex={0}
            aria-label={stripHtml(caption) || 'View artwork'}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
            style={{
                aspectRatio: item.aspectRatio || 'auto'
            }}
        >
            {!isLoaded && <div className="arts-img-shimmer" />}
            {thumbUrl && (
                <img
                    src={thumbUrl}
                    alt={stripHtml(caption) || 'Artwork'}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                    draggable={false}
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        visibility: isLoaded ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s ease-in, transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                />
            )}
            {imgs.length > 1 && (
                <div className="arts-multi-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M8 1v2M16 1v2M1 8h2M1 16h2" />
                    </svg>
                    {imgs.length}
                </div>
            )}
            <div className="arts-grid-overlay">
                {caption && <div className="arts-grid-overlay-text">{stripHtml(caption)}</div>}
            </div>
        </div>
    );
});
