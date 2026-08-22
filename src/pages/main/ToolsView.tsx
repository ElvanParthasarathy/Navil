import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../components/ui/FloatingBackButton';
import '../Writings.css';
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
                        <h1 className="writings-title">கருவிகள்</h1>
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
                            <div className="cat-title">Navil Transliterator</div>
                            <div className="cat-title-sub">Transliterator Engine</div>
                            <p className="cat-desc">A fully offline phonetic transliteration engine.</p>
                            <p className="cat-desc-sub">Convert Tanglish to Tamil instantly without internet.</p>
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
