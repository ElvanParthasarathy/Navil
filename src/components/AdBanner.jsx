import React, { useEffect, useRef } from 'react';

/**
 * AdBanner — A subtle, non-intrusive Google AdSense banner.
 * Designed to blend with content like Android TV banner ads.
 * 
 * Props:
 *   format  — 'auto' (default), 'horizontal', 'rectangle'
 *   slot    — AdSense ad slot ID (optional, uses default)
 *   style   — additional CSS overrides
 */
const AdBanner = ({ format = 'auto', slot = '', style = {} }) => {
    const adRef = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        // Only push once per component mount
        if (pushed.current) return;
        try {
            if (window.adsbygoogle && adRef.current) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                pushed.current = true;
            }
        } catch (e) {
            // AdSense not loaded or ad blocked — fail silently
        }
    }, []);

    return (
        <div className="ad-banner-wrapper" style={style}>
            <style>{`
                .ad-banner-wrapper {
                    width: 100%;
                    max-width: 100%;
                    display: flex;
                    justify-content: center;
                    margin: 32px auto;
                    padding: 0 20px;
                    box-sizing: border-box;
                    opacity: 0;
                    animation: adFadeIn 0.8s ease 0.5s forwards;
                }

                @keyframes adFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .ad-banner-inner {
                    width: 100%;
                    max-width: 728px;
                    min-height: 50px;
                    background: color-mix(in srgb, var(--bg-panel) 60%, transparent);
                    border: 1px solid var(--border-light);
                    border-radius: 16px;
                    overflow: hidden;
                    position: relative;
                    padding: 4px;
                }

                /* Subtle "Sponsored" label */
                .ad-banner-label {
                    position: absolute;
                    top: 6px;
                    right: 10px;
                    font-size: 0.6rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    color: var(--text-muted);
                    opacity: 0.35;
                    z-index: 2;
                    pointer-events: none;
                }

                .ad-banner-inner ins {
                    border-radius: 12px;
                    overflow: hidden;
                }

                /* On mobile, make it edge-to-edge but still rounded */
                @media (max-width: 768px) {
                    .ad-banner-wrapper {
                        margin: 24px auto;
                        padding: 0 16px;
                    }
                    .ad-banner-inner {
                        border-radius: 12px;
                        min-height: 50px;
                    }
                }
            `}</style>

            <div className="ad-banner-inner">
                <span className="ad-banner-label">Sponsored</span>
                <ins
                    ref={adRef}
                    className="adsbygoogle"
                    style={{
                        display: 'block',
                        width: '100%',
                        minHeight: '50px',
                    }}
                    data-ad-client="ca-pub-5392072917035799"
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive="true"
                />
            </div>
        </div>
    );
};

export default AdBanner;
