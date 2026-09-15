import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import '../படைப்புகள்/படைப்புகள்.css';
import { ArrowRight } from '@phosphor-icons/react';

export default function DownloadsPage() {
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

                <div className="category-grid tools-category-grid animate-entry">
                    <Link to="/downloads/nammil" className="category-card">
                        <div className="cat-icon-box">
                            <img 
                                src="/nammil_icon.png" 
                                alt="Nammil App Icon" 
                                style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover' }}
                                onError={(e: any) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div className="cat-content">
                            <div className="cat-title">
                                நம்மில்
                                <span className="cat-beta-badge">DESKTOP</span>
                            </div>
                            <div className="cat-title-sub">Nammil — Multi-Account WhatsApp Companion</div>
                            <p className="cat-desc">பல கணக்கு அமர்வுகள், தானியங்கி ஊடக ஒழுங்கமைப்பு மற்றும் விண்டோஸ் அறிவிப்புகளுடன் கூடிய தனியுரிமைக் கணினித் துணைச்செயலி.</p>
                            <p className="cat-desc-sub">A beautifully crafted, privacy-focused desktop companion for WhatsApp featuring multi-account sessions, automated media organization, and native notifications.</p>
                        </div>
                        <div className="cat-footer">
                            செயலியைப் பற்றி அறிய / பதிவிறக்க <ArrowRight weight="regular" />
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
