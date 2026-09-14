import './பதிவிறக்கங்கள்.css';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import {
    DownloadSimple,
    GithubLogo,
    ShieldCheck,
    FolderSimple,
    BellSimpleRinging,
    Users,
    Monitor,
    CheckCircle
} from '@phosphor-icons/react';

export default function NammilPage() {
    return (
        <>
            <Helmet>
                <title>நம்மில் (Nammil) | Desktop App — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Nammil is a sleek, privacy-focused desktop companion for WhatsApp allowing up to 5 isolated sessions simultaneously on Windows." 
                />
            </Helmet>

            <MobileTopBar title="நம்மில்" />
            <FloatingBackButton to="/downloads" label="பதிவிறக்கங்கள்" />

            <div className="downloads-page nammil-detail-page page-view fadeIn">
                {/* 1. APP HEADER & DOWNLOAD HERO */}
                <header className="nammil-hero animate-entry">
                    <div className="nammil-header-top">
                        <div className="nammil-icon-box">
                            <img 
                                src="/nammil_icon.png" 
                                alt="Nammil App Icon" 
                                className="nammil-icon-img"
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div className="nammil-header-meta">
                            <div className="nammil-badge-row">
                                <span className="badge-tag">DESKTOP APP</span>
                                <span className="badge-tag">v1.2.8</span>
                                <span className="badge-tag">Windows 10 / 11 (64-bit)</span>
                                <span className="badge-tag">MIT License</span>
                            </div>
                            <h1 className="nammil-title" lang="ta">நம்மில் (Nammil)</h1>
                            <div className="nammil-subtitle">
                                Sleek, Privacy-Focused Multi-Account WhatsApp Companion
                            </div>
                        </div>
                    </div>

                    <p className="nammil-desc" lang="ta">
                        அதிகாரப்பூர்வ வாட்ஸ்அப் ஒரு கணக்கை மட்டுமே அனுமதிக்கும் தடையை உடைத்து, 5 கணக்குகள் வரை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக இயக்கவும், பதிவிறக்கங்களைத் தானாக ஒழுங்கமைக்கவும் எல்வன் நவில் உருவாக்கிய நவீன கணினிச் செயலி.
                    </p>
                    <p className="nammil-desc nammil-desc-en">
                        An independent desktop application crafted by Elvan Navil to run up to 5 isolated WhatsApp sessions concurrently with automated file sorting and native Windows alerts.
                    </p>

                    <div className="nammil-action-row">
                        <a 
                            href="https://github.com/ElvanParthasarathy/Nammil/releases/download/v1.2.8/Nammil-Setup.exe" 
                            className="dl-btn primary"
                            download
                        >
                            <DownloadSimple weight="bold" size={18} />
                            <span>Download Nammil (.exe ~114MB)</span>
                        </a>
                        <a 
                            href="https://github.com/ElvanParthasarathy/Nammil" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="dl-btn secondary"
                        >
                            <GithubLogo weight="regular" size={18} />
                            <span>GitHub Source</span>
                        </a>
                    </div>
                </header>

                {/* 2. APP SCREENSHOT / INTERFACE SHOWCASE */}
                <section className="nammil-showcase-section animate-entry">
                    <div className="nammil-preview-frame">
                        <div className="nammil-frame-bar">
                            <div className="frame-dot" />
                            <div className="frame-dot" />
                            <div className="frame-dot" />
                            <span className="frame-title">Nammil • Multi-Account WhatsApp Desktop</span>
                        </div>
                        <img 
                            src="/nammil_outline.webp" 
                            alt="Nammil App Interface" 
                            className="nammil-preview-image"
                            loading="lazy"
                        />
                    </div>
                </section>

                {/* 3. CORE FEATURES (MONOCHROME CARDS) */}
                <section className="nammil-features-section animate-entry">
                    <h2 className="nammil-section-title" lang="ta">செயலியின் சிறப்பம்சங்கள்</h2>
                    <p className="nammil-section-desc">Key Capabilities & Architectural Highlights</p>

                    <div className="nammil-features-grid">
                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <Users weight="regular" size={24} />
                            </div>
                            <h3 className="nammil-feature-title">5 Isolated Sessions</h3>
                            <p className="nammil-feature-desc">
                                Run up to 5 WhatsApp accounts concurrently with zero cross-session credential collisions or state overlap.
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <FolderSimple weight="regular" size={24} />
                            </div>
                            <h3 className="nammil-feature-title">Automated Media Sorter</h3>
                            <p className="nammil-feature-desc">
                                Auto-sorts incoming media downloads into neatly segregated subdirectories by format (PDFs, Images, Audio, Documents).
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <BellSimpleRinging weight="regular" size={24} />
                            </div>
                            <h3 className="nammil-feature-title">Native Windows Chimes</h3>
                            <p className="nammil-feature-desc">
                                Real-time taskbar unread badge counters and native notification audio chimes that keep you informed without intrusion.
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <ShieldCheck weight="regular" size={24} />
                            </div>
                            <h3 className="nammil-feature-title">100% Local Privacy</h3>
                            <p className="nammil-feature-desc">
                                Direct connection through official web wrappers on your local PC. Zero telemetry, zero analytics tracking, and zero remote data storage.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. TECHNICAL SPECIFICATIONS */}
                <section className="nammil-specs-section animate-entry">
                    <h2 className="nammil-section-title">Technical Specifications</h2>
                    <div className="nammil-specs-grid">
                        <div className="spec-item">
                            <span className="spec-label">Version</span>
                            <span className="spec-value">1.2.8</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Platform</span>
                            <span className="spec-value">Windows 10 / 11 (64-bit)</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">Package</span>
                            <span className="spec-value">NSIS Setup Installer (~114 MB)</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">License</span>
                            <span className="spec-value">MIT Open Source License</span>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
