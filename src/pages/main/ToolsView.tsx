import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';
import '../Writings.css';

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

                <div className="category-grid animate-entry" style={{ display: 'flex', justifyContent: 'center', opacity: 0.5, marginTop: '80px', gridTemplateColumns: '1fr' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>தற்போது எந்த கருவிகளும் இல்லை. விரைவில் சேர்க்கப்படும்.</p>
                </div>
            </div>
        </>
    );
};

export default ToolsView;
