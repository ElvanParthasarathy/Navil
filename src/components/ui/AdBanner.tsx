import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

/**
 * AdBanner — Fully integrated Google AdSense component.
 * 
 * Strategy: Start COLLAPSED (zero space). Only expand when AdSense confirms
 * an ad is filled. This means:
 *   - No blank space ever on any page
 *   - No layout shift when ads fail to load
 *   - No visible jump when navigating between pages
 *   - Ad blocker / localhost / script error = zero visual impact
 */
const PREVIEW_MODE = false; // ← Toggle this to switch between sample and real ads

const AdBanner = ({ variant = 'inline', slot = '1749945992', className = '', wrapperStyle = {}, wrapperClass = '' }) => {
    const adRef = useRef(null);
    const pushed = useRef(false);
    // Start as false — container is hidden until a real ad fills
    const [isFilled, setIsFilled] = useState(PREVIEW_MODE);

    useEffect(() => {
        if (PREVIEW_MODE || pushed.current) return;
        const timer = setTimeout(() => {
            try {
                if (adRef.current && window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    pushed.current = true;
                }
            } catch (e) { }
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Watch for ad fill status
    useEffect(() => {
        if (PREVIEW_MODE) return;
        const insEl = adRef.current;
        if (!insEl) return;

        const checkFilled = () => {
            const status = insEl.getAttribute('data-ad-status');
            if (status === 'filled') {
                setIsFilled(true);
            }
        };

        // Check immediately
        checkFilled();

        // Observe for changes
        const observer = new MutationObserver(checkFilled);
        observer.observe(insEl, { attributes: true, attributeFilter: ['data-ad-status'] });
        return () => observer.disconnect();
    }, []);

    // ── SAMPLE PLACEHOLDER (for visual testing) ──
    const sampleAd = (
        <div style={{
            width: '100%',
            minHeight: variant === 'card' ? '120px' : '90px',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--text-main) 3%, transparent), color-mix(in srgb, var(--text-main) 6%, transparent))',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '20px',
            border: '1px dashed color-mix(in srgb, var(--text-main) 10%, transparent)',
            boxSizing: 'border-box',
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', opacity: 0.4, marginBottom: '6px' }}>
                    Ad · Sponsored
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.5 }}>
                    Google AdSense will appear here
                </div>
            </div>
        </div>
    );

    // Real AdSense element
    const adInsert = (
        <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client="ca-pub-5392072917035799"
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );

    const content = PREVIEW_MODE ? sampleAd : adInsert;

    // When NOT filled: zero height, zero margin, zero padding — truly invisible
    // When filled: smoothly expand with the caller's intended wrapper styles
    const computedStyle: React.CSSProperties = isFilled
        ? {
            ...wrapperStyle,
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), margin 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        } as React.CSSProperties
        : {
            maxHeight: 0,
            margin: 0,
            padding: 0,
            opacity: 0,
            overflow: 'hidden',
            border: 'none',
            pointerEvents: 'none',
        };

    return (
        <div
            className={`elvan-ad-container ${wrapperClass}`}
            style={computedStyle}
            aria-hidden={!isFilled}
        >
            <div className={`elvan-ad elvan-ad--inline ${className}`} style={{
                width: '100%',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
            }}>
                {content}
            </div>
        </div>
    );
};

export default AdBanner;
