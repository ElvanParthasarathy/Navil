import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import '../படைப்புகள்/படைப்புகள்.css';
import './பதிவிறக்கங்கள்.css';

export default function DownloadsPage() {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleCardMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { x, y, id: Date.now() + Math.random() };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 650);
    };

    return (
        <>
            <Helmet>
                <title>பதிவிறக்கங்கள் | Downloads — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Official desktop applications by Elvan Navil." 
                />
            </Helmet>

            <MobileTopBar title="பதிவிறக்கங்கள்" />
            <FloatingBackButton to="/" />

            <div className="writings-page page-view fadeIn">
                <header className="writings-header animate-entry">
                    <div style={{ flex: 1 }}>
                        <h1 className="writings-title">பதிவிறக்கங்கள்</h1>
                        <div className="writings-title-sub">Downloads</div>
                        <p className="writings-subtitle">
                            கணினி மென்பொருட்கள் & பயன்பாடுகள்
                        </p>
                        <p className="writings-subtitle writings-subtitle-en">
                            Desktop Applications & Productivity Tools
                        </p>
                    </div>
                </header>

                <div className="store-app-grid animate-entry">
                    <Link 
                        to="/downloads/nammil" 
                        className="store-app-card" 
                        title="Nammil — Multi-Account WhatsApp Companion"
                        onMouseDown={handleCardMouseDown}
                    >
                        {ripples.map(ripple => (
                            <span 
                                key={ripple.id} 
                                className="store-card-ripple" 
                                style={{ left: ripple.x, top: ripple.y }} 
                            />
                        ))}
                        {/* TOP ROW: ICON + TITLE + FREE PILL */}
                        <div className="store-card-header">
                            <div className="store-card-identity">
                                <img 
                                    src="/nammil_icon.png" 
                                    alt="Nammil App Icon" 
                                    className="store-card-icon"
                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                />
                                <div className="store-card-title-wrap">
                                    <h2 className="store-card-title">
                                        <span className="store-card-name-ta" lang="ta">நம்மில்</span>
                                        <span className="store-card-name-en">Nammil</span>
                                    </h2>
                                    <div className="store-card-meta">
                                        <span>Social & Productivity • சமூகம்</span>
                                    </div>
                                </div>
                            </div>
                            <div className="store-card-pill">Free</div>
                        </div>

                        {/* TEASER DESCRIPTION */}
                        <div className="store-card-desc-wrap">
                            <p className="store-card-desc store-card-desc-ta" lang="ta">
                                பல கணக்கு அமர்வுகள், தானியங்கி ஊடக ஒழுங்கமைப்பு மற்றும் விண்டோஸ் அறிவிப்புகளுடன் வாட்ஸ்அப்பிற்கான நவீன கணினித் துணைச்செயலி.
                            </p>
                            <p className="store-card-desc store-card-desc-en">
                                A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions and media organization.
                            </p>
                        </div>

                        {/* SCREENSHOT PREVIEW BANNER */}
                        <div className="store-card-banner-frame">
                            <img 
                                src="/nammil/slide_1.webp" 
                                alt="Nammil Desktop Screenshot Preview" 
                                className="store-card-banner-img"
                                loading="eager"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
