import './பதிவிறக்கங்கள்.css';
import React, { useState } from 'react';
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
    UsersThree,
    ChatCircle,
    Plus,
    MagnifyingGlass,
    Gear,
    DotsThreeVertical,
    Smiley,
    Paperclip,
    Microphone,
    Checks,
    Check,
    Phone,
    CircleDashed,
    Star,
    Archive,
    VideoCamera,
    PushPin,
    SpeakerSlash,
    Camera,
    ArrowBendUpRight,
    CheckCircle
} from '@phosphor-icons/react';

export default function NammilPage() {
    const [mobileView, setMobileView] = useState<'chat' | 'list'>('chat');
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
                                <span className="badge-tag">v1.2.9</span>
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
                            href="https://github.com/ElvanParthasarathy/Nammil/releases/latest/download/Nammil-Setup.exe" 
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

                {/* 2. AUTHENTIC PIXEL-PERFECT DESKTOP APP INTERFACE PREVIEW */}
                <section className="nammil-showcase-section animate-entry">
                    {/* MOBILE TOGGLE TABS (ONLY VISIBLE ON PHONES) */}
                    <div className="wa-mobile-toggle-row">
                        <button 
                            className={`wa-mobile-tab-btn ${mobileView === 'chat' ? 'active' : ''}`}
                            onClick={() => setMobileView('chat')}
                        >
                            உரையாடல் (Chat)
                        </button>
                        <button 
                            className={`wa-mobile-tab-btn ${mobileView === 'list' ? 'active' : ''}`}
                            onClick={() => setMobileView('list')}
                        >
                            பட்டியல் (Chat List)
                        </button>
                    </div>

                    <div className="nammil-window-frame">
                        {/* 1. TOP NAMMIL APP TITLEBAR */}
                        <div className="mockup-window-bar">
                            <div className="nammil-titlebar-brand">
                                <img src="/nammil_icon.png" alt="Nammil" className="titlebar-app-icon" />
                                <span className="titlebar-app-title">Nammil</span>
                            </div>

                            <div className="nammil-titlebar-tabs">
                                <div className="nammil-titlebar-tab active" title="Account 1">
                                    <ChatCircle size={15} weight="fill" />
                                    <span className="tab-unread-counter">6</span>
                                </div>
                                <div className="nammil-titlebar-tab" title="Account 2">
                                    <ChatCircle size={15} weight="regular" />
                                </div>
                            </div>

                            <div className="nammil-titlebar-actions">
                                <div className="titlebar-tool-btn has-badge" title="Notifications">
                                    <BellSimpleRinging size={15} />
                                    <span className="bell-badge-count">4</span>
                                </div>
                                <div className="titlebar-tool-btn" title="Downloads Folder">
                                    <FolderSimple size={15} />
                                </div>
                                <div className="titlebar-tool-btn" title="Settings">
                                    <Gear size={15} />
                                </div>
                                <div className="titlebar-win-controls">
                                    <button className="win-ctrl-btn" aria-label="Minimize">—</button>
                                    <button className="win-ctrl-btn" aria-label="Maximize">□</button>
                                    <button className="win-ctrl-btn win-close" aria-label="Close">✕</button>
                                </div>
                            </div>
                        </div>

                        {/* 2. APP 3-COLUMN BODY */}
                        <div className={`mockup-desktop-body view-${mobileView}`}>
                            {/* FAR LEFT: WHATSAPP ICON RAIL */}
                            <aside className="wa-icon-rail" aria-label="WhatsApp Navigation Rail">
                                <div className="wa-rail-top">
                                    <button className="wa-rail-btn active" title="Chats">
                                        <span className="wa-rail-active-bar" />
                                        <ChatCircle size={20} weight="fill" />
                                        <span className="wa-rail-badge">2</span>
                                    </button>
                                    <button className="wa-rail-btn" title="Calls">
                                        <Phone size={20} />
                                    </button>
                                    <button className="wa-rail-btn" title="Status">
                                        <CircleDashed size={20} weight="bold" />
                                    </button>
                                    <button className="wa-rail-btn" title="Communities">
                                        <UsersThree size={20} />
                                    </button>
                                    <button className="wa-rail-btn wa-rail-meta-ai" title="Meta AI">
                                        <div className="meta-ai-swirl" />
                                    </button>
                                </div>

                                <div className="wa-rail-bottom">
                                    <button className="wa-rail-btn" title="Starred Messages">
                                        <Star size={20} />
                                    </button>
                                    <button className="wa-rail-btn" title="Settings">
                                        <Gear size={20} />
                                    </button>
                                    <div className="wa-beta-pill">BETA</div>
                                    <div className="wa-rail-avatar" title="Profile">
                                        <div className="avatar-circle avatar-rail-user">EP</div>
                                    </div>
                                </div>
                            </aside>

                            {/* COLUMN 2: WHATSAPP CHAT LIST SIDEBAR */}
                            <section className="wa-sidebar" aria-label="Chat List">
                                <div className="wa-sidebar-header">
                                    <h2 className="wa-sidebar-title">WhatsApp</h2>
                                    <div className="wa-sidebar-header-actions">
                                        <button className="wa-header-icon-btn" title="Menu">
                                            <DotsThreeVertical size={19} weight="bold" />
                                        </button>
                                        <button className="wa-new-chat-btn" title="New Chat">
                                            <Plus size={16} weight="bold" />
                                        </button>
                                    </div>
                                </div>

                                <div className="wa-search-container">
                                    <div className="wa-search-box">
                                        <MagnifyingGlass size={15} className="wa-search-icon" />
                                        <span className="wa-search-placeholder">Search or start new chat</span>
                                    </div>
                                </div>

                                <div className="wa-filter-row">
                                    <button className="wa-filter-chip active">All</button>
                                    <button className="wa-filter-chip">RMD STAFF</button>
                                    <button className="wa-filter-chip">Unread 3</button>
                                </div>

                                <div className="wa-archived-row">
                                    <div className="wa-archived-left">
                                        <Archive size={16} weight="bold" className="wa-archived-icon" />
                                        <span className="wa-archived-label">Archived</span>
                                    </div>
                                </div>

                                <div className="wa-chat-scroll-list">
                                    {/* Contact 1 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-elvan">EP</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name">@ElvanParthasarathy (You)</span>
                                                <span className="wa-row-time">4:05 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <Checks size={15} weight="bold" className="wa-checks-read" />
                                                    <span className="wa-snippet-text">if i refresh the nammil the top abr icosn s...</span>
                                                </div>
                                                <PushPin size={14} weight="fill" className="wa-pin-icon" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 2: ACTIVE CONTACT (MATCHING SCREENSHOT) */}
                                    <div className="wa-chat-row active">
                                        <div className="avatar-circle avatar-jeshwanth">🎓</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name">ச. ஜெஷ்வந்த் 🎓</span>
                                                <span className="wa-row-time">10:03 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <Checks size={15} weight="bold" className="wa-checks-read" />
                                                    <span className="wa-snippet-text">mm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 3 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-jey">ஜே</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name">ஜேய்</span>
                                                <span className="wa-row-time active-time">9:59 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <Phone size={13} weight="fill" className="wa-call-icon" />
                                                    <span className="wa-snippet-text" lang="ta">வாய்ஸ் கால்</span>
                                                </div>
                                                <span className="wa-unread-badge">5</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 4 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-manosundar">செ</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name">செ. மனோசுந்தர் 🎓</span>
                                                <span className="wa-row-time">9:51 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <Check size={14} className="wa-check-single" />
                                                    <span className="wa-snippet-text">Uav</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 5 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-krishna">சு</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name">சு.பா. கிருஷ்ண விஷ்வா 🎓</span>
                                                <span className="wa-row-time">9:12 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <Checks size={15} weight="bold" className="wa-checks-read" />
                                                    <span className="wa-snippet-text">mm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 6 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-veetargal">💫</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name" lang="ta">அன்பு வீட்டார்கள் 💫</span>
                                                <span className="wa-row-time active-time">7:44 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <span className="wa-snippet-text" lang="ta">பாப்பா: </span>
                                                    <Camera size={13} weight="fill" className="wa-camera-icon" />
                                                    <span className="wa-snippet-text" lang="ta"> போட்டோ</span>
                                                </div>
                                                <div className="wa-row-badges">
                                                    <SpeakerSlash size={14} className="wa-mute-icon" />
                                                    <span className="wa-unread-badge">1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 7 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-santhoshini">VS</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name">சந்தோஷினி ஆசிரியர் 👩‍🏫</span>
                                                <span className="wa-row-time">7:25 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <Checks size={15} weight="bold" className="wa-checks-read" />
                                                    <span className="wa-snippet-text">mam reference papers</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 8 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-periyamma">பெ</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name" lang="ta">பெரியம்மா</span>
                                                <span className="wa-row-time">4:10 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <span className="wa-snippet-text" lang="ta">@ நீங்கள் பெரியம்மா என்பவரை...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact 9 */}
                                    <div className="wa-chat-row">
                                        <div className="avatar-circle avatar-amma">அ</div>
                                        <div className="wa-chat-row-details">
                                            <div className="wa-row-top">
                                                <span className="wa-contact-name" lang="ta">அம்மா</span>
                                                <span className="wa-row-time">1:47 PM</span>
                                            </div>
                                            <div className="wa-row-bottom">
                                                <div className="wa-snippet-wrap">
                                                    <span className="wa-snippet-text" lang="ta">சரிப்பா, பத்திரமா இரு</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* COLUMN 3: WHATSAPP MAIN CONVERSATION PANE */}
                            <main className="wa-main-canvas" aria-label="Conversation">
                                {/* CHAT HEADER */}
                                <div className="wa-chat-header">
                                    <div className="wa-chat-header-user">
                                        <div className="avatar-circle avatar-jeshwanth sm">🎓</div>
                                        <div className="wa-chat-header-name">ச. ஜெஷ்வந்த் 🎓</div>
                                    </div>
                                    <div className="wa-chat-header-tools">
                                        <button className="wa-header-tool-btn" title="Video Call">
                                            <VideoCamera size={19} weight="bold" />
                                        </button>
                                        <button className="wa-header-tool-btn" title="Voice Call">
                                            <Phone size={19} weight="bold" />
                                        </button>
                                        <button className="wa-header-tool-btn" title="Search">
                                            <MagnifyingGlass size={19} weight="bold" />
                                        </button>
                                        <button className="wa-header-tool-btn" title="Menu">
                                            <DotsThreeVertical size={19} weight="bold" />
                                        </button>
                                    </div>
                                </div>

                                {/* MESSAGES VIEWPORT WITH WHATSAPP DOODLE PATTERN */}
                                <div className="wa-messages-viewport mockup-canvas-doodle">
                                    {/* Outgoing Message 1 */}
                                    <div className="wa-msg-bubble outgoing">
                                        <p className="wa-msg-text">
                                            whatsapp web or whatsapp hang aaguthu la ithu aagathu
                                        </p>
                                        <div className="wa-msg-meta">
                                            <span className="wa-msg-timestamp">10:02 PM</span>
                                            <Checks size={15} weight="bold" className="wa-checks-blue" />
                                        </div>
                                    </div>

                                    {/* Outgoing Message 2 */}
                                    <div className="wa-msg-bubble outgoing">
                                        <p className="wa-msg-text">
                                            and custom folders for downloading downloads la documents images nu download pannradhu auto arrange aagum
                                        </p>
                                        <div className="wa-msg-meta">
                                            <span className="wa-msg-timestamp">10:02 PM</span>
                                            <Checks size={15} weight="bold" className="wa-checks-blue" />
                                        </div>
                                    </div>

                                    {/* Outgoing Message 3 */}
                                    <div className="wa-msg-bubble outgoing">
                                        <p className="wa-msg-text">
                                            and we can use multi whatsapp accounts
                                        </p>
                                        <div className="wa-msg-meta">
                                            <span className="wa-msg-timestamp">10:02 PM</span>
                                            <Checks size={15} weight="bold" className="wa-checks-blue" />
                                        </div>
                                    </div>

                                    {/* Outgoing Message 4 */}
                                    <div className="wa-msg-bubble outgoing">
                                        <p className="wa-msg-text">
                                            use pannitiu sollu
                                        </p>
                                        <div className="wa-msg-meta">
                                            <span className="wa-msg-timestamp">10:03 PM</span>
                                            <Checks size={15} weight="bold" className="wa-checks-blue" />
                                        </div>
                                    </div>

                                    {/* OUTGOING SCREENSHOT ATTACHMENT 1: NAMMIL NOTIFICATIONS SETTINGS */}
                                    <div className="wa-media-row outgoing">
                                        <button className="wa-forward-btn" title="Forward Message">
                                            <ArrowBendUpRight size={15} weight="bold" />
                                        </button>
                                        <div className="wa-media-card">
                                            <div className="media-preview-header">
                                                <div className="media-header-left">
                                                    <img src="/nammil_icon.png" alt="" className="media-app-icon" />
                                                    <span className="media-header-title">Nammil • Notification Manager</span>
                                                </div>
                                                <div className="media-window-dots">
                                                    <span className="mini-win-dot" />
                                                    <span className="mini-win-dot" />
                                                    <span className="mini-win-dot" />
                                                </div>
                                            </div>

                                            <div className="media-card-body">
                                                <div className="media-settings-tabs">
                                                    <span className="media-tab active">Account 1 (Primary)</span>
                                                    <span className="media-tab">Account 2 (Work)</span>
                                                </div>

                                                <div className="media-toggles-list">
                                                    <div className="media-toggle-item">
                                                        <div className="toggle-label-wrap">
                                                            <CheckCircle size={14} weight="fill" className="toggle-ok-icon" />
                                                            <span>Windows Notification Audio Chimes</span>
                                                        </div>
                                                        <span className="media-switch on" />
                                                    </div>
                                                    <div className="media-toggle-item">
                                                        <div className="toggle-label-wrap">
                                                            <CheckCircle size={14} weight="fill" className="toggle-ok-icon" />
                                                            <span>Taskbar Unread Badge Counters (Green)</span>
                                                        </div>
                                                        <span className="media-switch on" />
                                                    </div>
                                                    <div className="media-toggle-item">
                                                        <div className="toggle-label-wrap">
                                                            <CheckCircle size={14} weight="fill" className="toggle-ok-icon" />
                                                            <span>100% Local Sandbox Isolation</span>
                                                        </div>
                                                        <span className="media-switch on" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="wa-media-meta">
                                                <span className="wa-msg-timestamp">10:03 PM</span>
                                                <Checks size={15} weight="bold" className="wa-checks-blue" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* OUTGOING SCREENSHOT ATTACHMENT 2: NAMMIL MULTI-ACCOUNT & STORAGE */}
                                    <div className="wa-media-row outgoing">
                                        <button className="wa-forward-btn" title="Forward Message">
                                            <ArrowBendUpRight size={15} weight="bold" />
                                        </button>
                                        <div className="wa-media-card">
                                            <div className="media-preview-header">
                                                <div className="media-header-left">
                                                    <img src="/nammil_icon.png" alt="" className="media-app-icon" />
                                                    <span className="media-header-title">Nammil • Multi-Session Workspace</span>
                                                </div>
                                                <div className="media-window-dots">
                                                    <span className="mini-win-dot" />
                                                    <span className="mini-win-dot" />
                                                    <span className="mini-win-dot" />
                                                </div>
                                            </div>

                                            <div className="media-card-body">
                                                <div className="media-accounts-grid">
                                                    <div className="media-acc-card active">
                                                        <span className="acc-name">Account 1</span>
                                                        <span className="acc-status">Active • 4 unread</span>
                                                    </div>
                                                    <div className="media-acc-card active">
                                                        <span className="acc-name">Account 2</span>
                                                        <span className="acc-status">Active • 1 unread</span>
                                                    </div>
                                                    <div className="media-acc-card add">
                                                        <Plus size={14} weight="bold" />
                                                        <span>Add Account</span>
                                                    </div>
                                                </div>

                                                <div className="media-folders-box">
                                                    <div className="folders-header">
                                                        <FolderSimple size={13} weight="bold" />
                                                        <span>Automated File Sorting Destination</span>
                                                    </div>
                                                    <div className="folders-path">
                                                        Downloads &gt; Nammil &gt; [Documents | Images | Audio]
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="wa-media-meta">
                                                <span className="wa-msg-timestamp">10:03 PM</span>
                                                <Checks size={15} weight="bold" className="wa-checks-blue" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Incoming Message from Contact */}
                                    <div className="wa-msg-bubble incoming">
                                        <p className="wa-msg-text">
                                            pantu soldren
                                        </p>
                                        <div className="wa-msg-meta">
                                            <span className="wa-msg-timestamp">10:03 PM</span>
                                        </div>
                                    </div>

                                    {/* Outgoing Reply */}
                                    <div className="wa-msg-bubble outgoing">
                                        <p className="wa-msg-text">
                                            mm
                                        </p>
                                        <div className="wa-msg-meta">
                                            <span className="wa-msg-timestamp">10:03 PM</span>
                                            <Checks size={15} weight="bold" className="wa-checks-blue" />
                                        </div>
                                    </div>
                                </div>

                                {/* BOTTOM COMPOSE BAR */}
                                <div className="wa-compose-bar">
                                    <button className="wa-compose-tool-btn" title="Attach Document / Media">
                                        <Paperclip size={20} />
                                    </button>
                                    <button className="wa-compose-tool-btn" title="Emoji">
                                        <Smiley size={20} />
                                    </button>
                                    <div className="wa-compose-input-wrapper">
                                        <span className="wa-compose-placeholder">Type a message</span>
                                    </div>
                                    <button className="wa-compose-tool-btn mic" title="Voice Note">
                                        <Microphone size={20} weight="fill" />
                                    </button>
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
                            <span className="spec-value">1.2.9</span>
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
