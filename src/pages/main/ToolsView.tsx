import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';
import '../Writings.css';
import { PianoKeys, ArrowRight } from '@phosphor-icons/react';

const ToolsView = () => {
    const navigate = useNavigate();

    return (
        <>
            <MobileTopBar title="கருவிகள்|tools" />
            <Helmet>
                <title>கருவிகள் | Tools</title>
            </Helmet>
            <div className="writings-page page-view fadeIn">
                
                <FloatingBackButton to="/" />
                
                <header className="writings-header animate-entry">
                    <div style={{ flex: 1 }}>
                        <h1 className="writings-title">கருவிகள்</h1>
                        <div className="writings-title-sub">Tools & Utilities</div>
                        <p className="writings-subtitle">
                            பயன்பாட்டுக்கு தேவையான சிறு மென்பொருள்கள்
                        </p>
                        <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                            Small applications and utilities for daily usage.
                        </p>
                    </div>
                </header>

                <div className="category-grid animate-entry">
                    <Link to="/tools/piano" className="category-card">
                        <div className="cat-icon-box"><PianoKeys weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">Elvan Piano</div>
                            <div className="cat-title-sub">Piano Tool</div>
                            <p className="cat-desc">A fully functional virtual piano synthesizer.</p>
                            <p className="cat-desc-sub">Play and map keyboard keys to musical notes.</p>
                        </div>
                        <div className="cat-footer">Launch Piano <ArrowRight weight="regular" /></div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default ToolsView;
