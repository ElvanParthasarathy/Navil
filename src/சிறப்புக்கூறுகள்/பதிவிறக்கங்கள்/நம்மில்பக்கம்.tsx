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
    ChatCircle,
    Plus,
    MagnifyingGlass,
    Gear,
    DotsThreeVertical,
    Smiley,
    Paperclip,
    Microphone,
    Checks
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

            {/* FLOATING TRANSLUCENT BACKGROUND GRAPHICS (FROM NAMMIL ENGINE) */}
            <div className="nammil-bg-shapes" aria-hidden="true">
                <div className="nammil-shape nammil-shape-1" />
                <div className="nammil-shape nammil-shape-2" />
                <div className="nammil-shape nammil-shape-3" />
                <div className="nammil-shape nammil-shape-4" />
            </div>

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

                {/* 2. AUTHENTIC CSS DESKTOP APP INTERFACE PREVIEW */}
                <section className="nammil-showcase-section animate-entry">
                    <div className="nammil-window-frame">
                        {/* WINDOW OS TITLEBAR */}
                        <div className="mockup-window-bar">
                            <div className="mockup-window-controls">
                                <span className="window-dot dot-red" />
                                <span className="window-dot dot-yellow" />
                                <span className="window-dot dot-green" />
                            </div>
                            <div className="mockup-window-caption">
                                <img src="/nammil_icon.png" alt="" className="mockup-caption-icon" />
                                <span>Nammil — Multi-Account WhatsApp Desktop</span>
                            </div>
                            <div className="mockup-window-right-actions">
                                <span className="win-ctrl win-min">—</span>
                                <span className="win-ctrl win-max">□</span>
                                <span className="win-ctrl win-close">✕</span>
                            </div>
                        </div>

                        {/* NAMMIL TOPBAR (ACCOUNT TABS & UTILITIES) */}
                        <div className="mockup-app-topbar">
                            <div className="mockup-brand-area">
                                <img src="/nammil_icon.png" alt="" className="mockup-brand-icon" />
                                <span className="mockup-brand-title" lang="ta">நம்மில்</span>
                            </div>

                            <div className="mockup-accounts-tabs">
                                <div className="mockup-tab active">
                                    <ChatCircle size={14} weight="fill" className="tab-wa-icon" />
                                    <span className="tab-name">முதன்மை (Personal)</span>
                                    <span className="tab-status-dot" />
                                </div>
                                <div className="mockup-tab">
                                    <ChatCircle size={14} weight="regular" className="tab-wa-icon" />
                                    <span className="tab-name">வணிகம் (Business)</span>
                                    <span className="tab-badge">2</span>
                                </div>
                                <div className="mockup-tab">
                                    <ChatCircle size={14} weight="regular" className="tab-wa-icon" />
                                    <span className="tab-name">பணி (Work)</span>
                                </div>
                                <div className="mockup-tab-add" title="Add Account">
                                    <Plus size={12} weight="bold" />
                                </div>
                            </div>

                            <div className="mockup-topbar-tools">
                                <span className="mockup-tool-btn" title="Search">
                                    <MagnifyingGlass size={14} />
                                </span>
                                <span className="mockup-tool-btn" title="Media Library">
                                    <FolderSimple size={14} />
                                </span>
                                <span className="mockup-tool-btn has-badge" title="Notifications">
                                    <BellSimpleRinging size={14} />
                                    <span className="tool-indicator" />
                                </span>
                                <span className="mockup-tool-btn" title="Settings">
                                    <Gear size={14} />
                                </span>
                            </div>
                        </div>

                        {/* APP MAIN BODY: CHAT SIDEBAR + ACTIVE DISCUSSION PANE */}
                        <div className="mockup-app-body">
                            {/* CHAT LIST SIDEBAR */}
                            <aside className="mockup-chat-sidebar">
                                <div className="mockup-search-box">
                                    <MagnifyingGlass size={13} className="mockup-search-icon" />
                                    <span className="mockup-search-placeholder">Search or start new chat</span>
                                </div>

                                <div className="mockup-chat-list">
                                    <div className="mockup-chat-item active">
                                        <div className="chat-avatar avatar-ep">EP</div>
                                        <div className="chat-info">
                                            <div className="chat-info-top">
                                                <span className="chat-name">Elvan Parthasarathy</span>
                                                <span className="chat-time">12:45 PM</span>
                                            </div>
                                            <div className="chat-info-bottom">
                                                <Checks size={14} weight="bold" className="chat-checks-read" />
                                                <span className="chat-snippet" lang="ta">நம்மில் v1.2.8 பதிவிறக்கத்திற்கு தயார்...</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mockup-chat-item">
                                        <div className="chat-avatar avatar-ns">NS</div>
                                        <div className="chat-info">
                                            <div className="chat-info-top">
                                                <span className="chat-name">Navil Studio Updates</span>
                                                <span className="chat-time">11:30 AM</span>
                                            </div>
                                            <div className="chat-info-bottom">
                                                <span className="chat-snippet" lang="ta">5 தனித்தனி வாட்ஸ்அப் கணக்குகள்...</span>
                                                <span className="chat-unread-count">1</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mockup-chat-item">
                                        <div className="chat-avatar avatar-tf">TF</div>
                                        <div className="chat-info">
                                            <div className="chat-info-top">
                                                <span className="chat-name">Tamil Typography Hub</span>
                                                <span className="chat-time">Yesterday</span>
                                            </div>
                                            <div className="chat-info-bottom">
                                                <span className="chat-snippet">Elvan Sans + Adinatha Brahmi</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mockup-chat-item">
                                        <div className="chat-avatar avatar-mo">MO</div>
                                        <div className="chat-info">
                                            <div className="chat-info-top">
                                                <span className="chat-name">Media Auto-Sorter</span>
                                                <span className="chat-time">Sunday</span>
                                            </div>
                                            <div className="chat-info-bottom">
                                                <span className="chat-snippet" lang="ta">14 கோப்புகள் வரிசைப்படுத்தப்பட்டன</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* MAIN ACTIVE CHAT VIEW */}
                            <main className="mockup-chat-main">
                                <div className="mockup-active-header">
                                    <div className="active-header-contact">
                                        <div className="chat-avatar avatar-ep sm">EP</div>
                                        <div>
                                            <div className="active-contact-name">Elvan Parthasarathy</div>
                                            <div className="active-contact-status">
                                                <span className="online-dot" /> online
                                            </div>
                                        </div>
                                    </div>
                                    <div className="active-header-actions">
                                        <MagnifyingGlass size={16} />
                                        <DotsThreeVertical size={16} />
                                    </div>
                                </div>

                                <div className="mockup-messages-viewport">
                                    <div className="mockup-date-divider">
                                        <span>இன்று • TODAY</span>
                                    </div>

                                    <div className="mockup-bubble incoming">
                                        <p className="bubble-text" lang="ta">
                                            நம்மில் (Nammil) கணினிச் செயலி 5 வாட்ஸ்அப் கணக்குகளை ஒரே நேரத்தில் தனித்தனிப் பெட்டகங்களாக (sandboxed sessions) இயக்க உதவுகிறது.
                                        </p>
                                        <span className="bubble-time">12:42 PM</span>
                                    </div>

                                    <div className="mockup-bubble outgoing">
                                        <p className="bubble-text" lang="ta">
                                            தானியங்கி மீடியா வரிசையாக்கம் (Documents / Media) மற்றும் விண்டோஸ் அறிவிப்புகளும் மிகச் சிறப்பாக இயங்குகின்றன!
                                        </p>
                                        <span className="bubble-time">
                                            12:45 PM
                                            <Checks size={13} weight="bold" className="chat-checks-read" />
                                        </span>
                                    </div>
                                </div>

                                <div className="mockup-compose-bar">
                                    <Smiley size={17} className="compose-icon" />
                                    <Paperclip size={17} className="compose-icon" />
                                    <div className="compose-input">Type a message...</div>
                                    <Microphone size={17} className="compose-icon" />
                                </div>
                            </main>
                        </div>
                    </div>
                </section>

                {/* 3. CORE FEATURES (CLEAN & PROFESSIONAL MONOCHROME CARDS) */}
                <section className="nammil-features-section animate-entry">
                    <h2 className="nammil-section-title" lang="ta">செயலியின் சிறப்பம்சங்கள்</h2>
                    <p className="nammil-section-desc">Key Capabilities & Architectural Highlights</p>

                    <div className="nammil-features-grid">
                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <Users weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">5 Isolated Sessions</h3>
                            <p className="nammil-feature-desc">
                                Run up to 5 WhatsApp accounts concurrently with zero cross-session credential collisions or state overlap.
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <FolderSimple weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">Automated Media Sorter</h3>
                            <p className="nammil-feature-desc">
                                Auto-sorts incoming media downloads into neatly segregated subdirectories by format (PDFs, Images, Audio, Documents).
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <BellSimpleRinging weight="regular" size={22} />
                            </div>
                            <h3 className="nammil-feature-title">Native Windows Chimes</h3>
                            <p className="nammil-feature-desc">
                                Real-time taskbar unread badge counters and native notification audio chimes that keep you informed without intrusion.
                            </p>
                        </div>

                        <div className="nammil-feature-card">
                            <div className="nammil-feature-icon">
                                <ShieldCheck weight="regular" size={22} />
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
