import React, { useEffect, useRef } from 'react';

/**
 * AdBanner — Fully integrated Google AdSense component.
 * 
 * Set PREVIEW_MODE = true to show sample placeholder ads for visual testing.
 * Set PREVIEW_MODE = false for real AdSense ads in production.
 */
const PREVIEW_MODE = true; // ← Toggle this to switch between sample and real ads

const AdBanner = ({ variant = 'inline', slot = '', className = '' }) => {
    const adRef = useRef(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (PREVIEW_MODE || pushed.current) return;
        const timer = setTimeout(() => {
            try {
                if (adRef.current && window.adsbygoogle) {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    pushed.current = true;
                }
            } catch (e) {}
        }, 300);
        return () => clearTimeout(timer);
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

    // ── INLINE VARIANT (default) — zero chrome ──
    return (
        <div className={`elvan-ad elvan-ad--inline ${className}`} style={{
            width: '100%',
            margin: '40px 0',
            padding: 0,
            overflow: 'hidden',
        }}>
            {content}
        </div>
    );
};

export default AdBanner;
