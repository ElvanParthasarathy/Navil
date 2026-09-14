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
                            இசை, மொழி மற்றும் பயன்பாடுகளுக்கான பிரத்யேகக் கருவிகள்.
                        </p>
                        <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                            A collection of custom-built tools, engines, and experiments.
                        </p>
                    </div>
                </header>

                <div className="category-grid animate-entry">
                    <Link to="/tools/piano" className="category-card">
                        <div className="cat-icon-box"><PianoKeys weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">எல்வன் கின்னரப்பெட்டி</div>
                            <div className="cat-title-sub">Elvan Piano</div>
                            <p className="cat-desc">மெய்நிகர் பியானோ மற்றும் இசையமைப்புக் கருவி.</p>
                            <p className="cat-desc-sub">A fully functional virtual piano synthesizer with keyboard mapping.</p>
                        </div>
                        <div className="cat-footer">பியானோவைத் தொடங்க <ArrowRight weight="regular" /></div>
                    </Link>
                    <Link to="/tools/transliterator" className="category-card">
                        <div className="cat-icon-box"><Translate weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">தொல்காப்பிய மொழிமாற்றி</div>
                            <div className="cat-title-sub">Tolkappiyam Transliterator</div>
                            <p className="cat-desc">தொல்காப்பிய இலக்கண நெறிப்படியான ஒலிபெயர்ப்பு முறைமை.</p>
                            <p className="cat-desc-sub">Authentic English phonetics based on Tolkappiyam.</p>
                        </div>
                        <div className="cat-footer">மொழிமாற்றியைத் தொடங்க <ArrowRight weight="regular" /></div>
                    </Link>
                    <Link to="/tools/arichuvadi" className="category-card">
                        <div className="cat-icon-box"><Scroll weight="regular" /></div>
                        <div className="cat-content">
                            <div className="cat-title">நவில் அரிச்சுவடி</div>
                            <div className="cat-title-sub">Arichuvadi Engine</div>
                            <p className="cat-desc">பண்டைய தமிழ் எழுத்து வடிவமாற்றி — தமிழி மற்றும் வட்டெழுத்து.</p>
                            <p className="cat-desc-sub">Convert modern Tamil into ancient Thamizhi and Vatteluttu scripts.</p>
                        </div>
                        <div className="cat-footer">அரிச்சுவடியைத் திறக்க <ArrowRight weight="regular" /></div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default ToolsView;
