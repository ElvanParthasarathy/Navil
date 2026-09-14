import React, { useState, useEffect } from 'react';

export const BrandTuner: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const defaultValues = {
        tracking: 2.6,
        weight: 600,
        gap: 3,
        size: 0.62,
        paddingLeft: 20,
        opacity: 0.7,
        titleSize: 1.35,
        titleWeight: 800
    };

    const [settings, setSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('brand_tuner_settings');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            // ignore
        }
        return defaultValues;
    });

    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--brand-subtitle-tracking', `${settings.tracking}px`);
        root.style.setProperty('--brand-subtitle-weight', `${settings.weight}`);
        root.style.setProperty('--brand-gap', `${settings.gap}px`);
        root.style.setProperty('--brand-subtitle-size', `${settings.size}rem`);
        root.style.setProperty('--brand-padding-left', `${settings.paddingLeft}px`);
        root.style.setProperty('--brand-subtitle-opacity', `${settings.opacity}`);
        root.style.setProperty('--brand-title-size', `${settings.titleSize}rem`);
        root.style.setProperty('--brand-title-weight', `${settings.titleWeight}`);

        try {
            localStorage.setItem('brand_tuner_settings', JSON.stringify(settings));
        } catch (e) {
            // ignore
        }
    }, [settings]);

    const update = (key: string, value: number) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setSettings(defaultValues);
    };

    const copyCss = () => {
        const css = `.brand {
  padding-left: ${settings.paddingLeft}px;
  gap: ${settings.gap}px;
}

.brand-title {
  font-size: ${settings.titleSize}rem;
  font-weight: ${settings.titleWeight};
}

.brand-subtitle {
  font-size: ${settings.size}rem;
  font-weight: ${settings.weight};
  letter-spacing: ${settings.tracking}px;
  opacity: ${settings.opacity};
  text-transform: uppercase;
}`;
        navigator.clipboard.writeText(css);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'var(--text-main, #111)',
                        color: 'var(--bg-app, #fff)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '8px 16px',
                        borderRadius: '99px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>⚙️</span> Brand Arranger
                </button>
            ) : (
                <div
                    style={{
                        width: '320px',
                        background: 'var(--bg-panel, #18181b)',
                        color: 'var(--text-main, #fff)',
                        border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
                        borderRadius: '16px',
                        padding: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(16px)',
                        fontSize: '12px'
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--border-light, rgba(255,255,255,0.1))', paddingBottom: '10px' }}>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>⚙️ Brand Arranger</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #a1a1aa)' }}>Adjust live header in real time</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={handleReset}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted, #a1a1aa)', borderRadius: '6px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer' }}
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main, #fff)', fontSize: '16px', cursor: 'pointer', padding: '0 4px' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                        
                        {/* Letter Spacing */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>Letter Spacing</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{settings.tracking}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="8"
                                step="0.2"
                                value={settings.tracking}
                                onChange={(e) => update('tracking', parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Boldness / Font Weight */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>Boldness (Weight)</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{settings.weight}</span>
                            </div>
                            <input
                                type="range"
                                min="300"
                                max="900"
                                step="100"
                                value={settings.weight}
                                onChange={(e) => update('weight', parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Vertical Gap */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>Vertical Gap</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{settings.gap}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="14"
                                step="1"
                                value={settings.gap}
                                onChange={(e) => update('gap', parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                        </div>

                        {/* English Font Size */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>English Font Size</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{settings.size}rem</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="0.85"
                                step="0.02"
                                value={settings.size}
                                onChange={(e) => update('size', parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Padding Left */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>Padding Left (Indent)</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{settings.paddingLeft}px</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="32"
                                step="1"
                                value={settings.paddingLeft}
                                onChange={(e) => update('paddingLeft', parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                        </div>

                        {/* Opacity */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>English Opacity</span>
                                <span style={{ color: '#3b82f6', fontWeight: 700 }}>{Math.round(settings.opacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.3"
                                max="1"
                                step="0.05"
                                value={settings.opacity}
                                onChange={(e) => update('opacity', parseFloat(e.target.value))}
                                style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
                            />
                        </div>

                    </div>

                    {/* Copy Button */}
                    <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light, rgba(255,255,255,0.1))' }}>
                        <button
                            onClick={copyCss}
                            style={{
                                width: '100%',
                                background: copied ? '#10b981' : '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                padding: '7px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {copied ? '✓ Copied CSS to Clipboard!' : '📋 Copy Chosen CSS'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
