import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import '../படைப்புகள்/படைப்புகள்.css';
import { PianoKeys, ArrowRight, Translate, Scroll } from '@phosphor-icons/react';

const ToolsView = () => {
    const navigate = useNavigate();

    return (
        <>
            <MobileTopBar title="கருவிகள்|tools" isBeta={true} />
            <Helmet>
                <title>கருவிகள் | Tools</title>
            </Helmet>
            <div className="writings-page page-view fadeIn">
                
                <FloatingBackButton to="/" />
                
                <header className="writings-header animate-entry">
                    <div style={{ flex: 1 }}>
                        <h1 className="writings-title">
                            கருவிகள்
                            <span 
                                style={{ 
                                    fontSize: '0.75rem', 
                                    background: 'color-mix(in srgb, var(--text-main) 12%, transparent)', 
                                    color: 'var(--text-main)', 
                                    padding: '3px 9px', 
                                    borderRadius: '100px', 
                                    fontWeight: 700, 
                                    letterSpacing: '0.5px',
                                    lineHeight: 1
                                }}
                            >
                                BETA
                            </span>
                        </h1>
                        <div className="writings-title-sub">tools</div>
                        <p className="writings-subtitle">A collection of custom-built tools and experiments.</p>
                        <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>Apps for music, language, and productivity.</p>
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
                    <Link to="/tools/transliterator" className="category-card">
                        <div className="cat-icon-box"><Translate weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">Tolkappiyam Tamil Transliterator</div>
                            <div className="cat-title-sub">தொல்காப்பியம் ஒலியியல் முறைமை</div>
                            <p className="cat-desc">Authentic English Phonetics based on Tolkappiyam.</p>
                            <p className="cat-desc-sub">Based on Tolkappiyam Ezhuthathikaram & Sollathikaram.</p>
                        </div>
                        <div className="cat-footer">Launch Transliterator <ArrowRight weight="regular" /></div>
                    </Link>
                    <Link to="/tools/arichuvadi" className="category-card">
                        <div className="cat-icon-box"><Scroll weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">நவில் அரிச்சுவடி</div>
                            <div className="cat-title-sub">Arichuvadi Engine</div>
                            <p className="cat-desc">பண்டைய தமிழ் எழுத்து வடிவமாற்றி.</p>
                            <p className="cat-desc-sub">Convert modern Tamil into ancient Thamizhi and Vatteluttu scripts.</p>
                        </div>
                        <div className="cat-footer">Launch Arichuvadi <ArrowRight weight="regular" /></div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default ToolsView;
