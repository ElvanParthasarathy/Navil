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
                        <div className="writings-title-sub">Tools</div>
                        <p className="writings-subtitle">
                            இசை, மொழி & பயன்பாடுகள்
                        </p>
                        <p className="writings-subtitle writings-subtitle-en">
                            Music, Language & Productivity
                        </p>
                    </div>
                </header>

                <div className="category-grid animate-entry">
                    <Link to="/tools/piano" className="category-card">
                        <div className="cat-icon-box"><PianoKeys weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">
                                நவில் பியானோ
                                <span className="cat-count-badge" style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '100px', marginLeft: '8px' }}>கணினி மட்டும்</span>
                            </div>
                            <div className="cat-title-sub">Navil Piano • Desktop Only</div>
                            <p className="cat-desc">மெய்நிகர் பியானோ மற்றும் இசையமைப்புக் கருவி.</p>
                            <p className="cat-desc-sub">Virtual piano synthesizer with keyboard mapping.</p>
                        </div>
                        <div className="cat-footer">பியானோவைத் தொடங்க <ArrowRight weight="regular" /></div>
                    </Link>
                    <Link to="/tools/transliterator" className="category-card">
                        <div className="cat-icon-box"><Translate weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">நவில் மொழிமாற்றி</div>
                            <div className="cat-title-sub">Navil Transliterator</div>
                            <p className="cat-desc">தொல்காப்பிய இலக்கண ஒலிபெயர்ப்பு முறைமை.</p>
                            <p className="cat-desc-sub">Phonetic English-to-Tamil typing engine.</p>
                        </div>
                        <div className="cat-footer">மொழிமாற்றியைத் தொடங்க <ArrowRight weight="regular" /></div>
                    </Link>
                    <Link to="/tools/arichuvadi" className="category-card">
                        <div className="cat-icon-box"><Scroll weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">நவில் அரிச்சுவடி</div>
                            <div className="cat-title-sub">Navil Arichuvadi</div>
                            <p className="cat-desc">பண்டைய தமிழ் எழுத்து வடிவமாற்றி.</p>
                            <p className="cat-desc-sub">Convert modern Tamil into ancient Thamizhi and Vatteluttu.</p>
                        </div>
                        <div className="cat-footer">அரிச்சுவடியைத் திறக்க <ArrowRight weight="regular" /></div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default ToolsView;
