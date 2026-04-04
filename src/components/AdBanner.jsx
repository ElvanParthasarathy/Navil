import React, { useEffect, useRef } from 'react';

/**
 * AdBanner — Fully integrated Google AdSense component.
 * Designed to feel like native site content, not a foreign element.
 * 
 * Variants:
 *   'inline'   — Flows between content sections (default)
 *   'card'     — Matches category-card grid items on Writings page
 *   'feed'     — Instagram-feed style between items
 */
const AdBanner = ({ variant = 'inline', slot = '', className = '' }) => {
    const adRef = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        // Small delay to let the DOM settle before pushing ad
        const timer = setTimeout(() => {
            try {
                if (adRef.current && window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    pushed.current = true;
                }
            } catch (e) {
                // AdSense not loaded or blocked — fail silently
            }
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Common ad insert element
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

    // ── CARD VARIANT ──
    // Looks exactly like a category-card in the Writings grid
    if (variant === 'card') {
        return (
            <div className={`elvan-ad elvan-ad--card ${className}`}>
                <style>{`
                    .elvan-ad--card {
                        background: var(--bg-card);
                        border: 1px solid var(--border-light);
                        border-radius: 20px;
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        position: relative;
                        overflow: hidden;
                        min-height: 220px;
                        transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
                    }
                    .elvan-ad--card::after {
                        content: '';
                        position: absolute;
                        bottom: -20px;
                        right: -20px;
                        width: 100px;
                        height: 100px;
                        background: var(--text-main);
                        opacity: 0.03;
                        border-radius: 50%;
                    }
                    .elvan-ad__card-header {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .elvan-ad__card-icon {
                        width: 56px;
                        height: 56px;
                        background: var(--bg-panel);
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.4rem;
                        color: var(--text-muted);
                        opacity: 0.5;
                        flex-shrink: 0;
                    }
                    .elvan-ad__card-label {
                        font-size: 0.7rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--text-muted);
                        opacity: 0.4;
                    }
                    .elvan-ad__card-body {
                        flex: 1;
                        border-radius: 12px;
                        overflow: hidden;
                        min-height: 90px;
                    }
                `}</style>
                <div className="elvan-ad__card-header">
                    <div className="elvan-ad__card-icon">📌</div>
                    <span className="elvan-ad__card-label">Promoted</span>
                </div>
                <div className="elvan-ad__card-body">
                    {adInsert}
                </div>
            </div>
        );
    }

    // ── FEED VARIANT ──
    // Looks like a natural content block in a feed/list (like IG sponsored)
    if (variant === 'feed') {
        return (
            <div className={`elvan-ad elvan-ad--feed ${className}`}>
                <style>{`
                    .elvan-ad--feed {
                        width: 100%;
                        padding: 0;
                        margin: 0;
                        border-top: 1px solid var(--border-light);
                        border-bottom: 1px solid var(--border-light);
                        background: var(--bg-card);
                        overflow: hidden;
                    }
                    .elvan-ad__feed-label {
                        padding: 10px 20px 6px;
                        font-size: 0.7rem;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        color: var(--text-muted);
                        opacity: 0.4;
                    }
                    .elvan-ad__feed-body {
                        padding: 0 20px 14px;
                        min-height: 60px;
                    }
                `}</style>
                <div className="elvan-ad__feed-label">Sponsored</div>
                <div className="elvan-ad__feed-body">
                    {adInsert}
                </div>
            </div>
        );
    }

    // ── INLINE VARIANT (default) ──
    // Zero-chrome: no border, no background — just flows with content
    return (
        <div className={`elvan-ad elvan-ad--inline ${className}`}>
            <style>{`
                .elvan-ad--inline {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    border-radius: 0;
                    background: transparent;
                    min-height: 50px;
                }
                .elvan-ad--inline ins {
                    background: transparent !important;
                }
            `}</style>
            {adInsert}
        </div>
    );
};

export default AdBanner;
