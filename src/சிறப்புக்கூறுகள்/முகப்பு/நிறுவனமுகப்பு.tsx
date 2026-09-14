import './முகப்பு.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { 
    BookOpen, 
    Wrench, 
    DownloadSimple, 
    User 
} from '@phosphor-icons/react';

export default function CompanyHome() {
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>எல்வன் நவில் | Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Elvan Navil is an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/" />
            </Helmet>
            <MobileTopBar title="எல்வன் நவில்" />
            
            <div className="home-page company-home-page page-view fadeIn">
                {/* 1. STUDIO HERO HEADER (MINIMAL BRAND ESSENTIALS, NO PHOTO, PURE TYPOGRAPHY) */}
                <header className="company-hero-card animate-entry" style={{ cursor: 'default' }}>
                    <div className="company-hero-text">
                        <h1 className="company-hero-title" lang="ta">எல்வன் நவில்</h1>
                        <h2 className="company-hero-subtitle">Elvan Navil</h2>
                        <p className="company-hero-desc-ta" lang="ta">
                            நல்வரவு. இது எல்வன் நவில் — சிந்தனைகளை உரைக்க, எழுத்துகளைப் பகிர, தன்னுரிமை மென்பொருட்கள், தனித்துவ அச்சுக்கலை மற்றும் எண்மப் படைப்புகளைக் காட்சிப்படுத்தும் படைப்பரங்கு.
                        </p>
                        <p className="company-hero-desc-en">
                            Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.
                        </p>
                        <div className="company-quick-actions">
                            <button onClick={() => navigate('/navilgal')} className="company-pill-btn">
                                <BookOpen weight="regular" size={16} />
                                <span lang="ta">நவில்கள் (Archive)</span>
                            </button>
                            <button onClick={() => navigate('/tools')} className="company-pill-btn">
                                <Wrench weight="regular" size={16} />
                                <span lang="ta">கருவிகள் (Tools)</span>
                            </button>
                            <button onClick={() => navigate('/downloads')} className="company-pill-btn">
                                <DownloadSimple weight="regular" size={16} />
                                <span lang="ta">பதிவிறக்கங்கள் (Downloads)</span>
                            </button>
                            <button onClick={() => navigate('/about')} className="company-pill-btn">
                                <User weight="regular" size={16} />
                                <span>பற்றி (About)</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* 2. BRAND DEFINITION & ETYMOLOGY */}
                <div className="dictionary-container animate-entry">
                    <div className="dict-card">
                        <div className="dict-word-header">
                            <span className="dict-word" lang="ta">நவில்</span>
                            <span className="dict-meta">வினைச்சொல்</span>
                        </div>
                        <p className="dict-definition" lang="ta">
                            தமிழ் வேர்ச்சொல் "நவிலுதல்" — உரைத்தல், பேசுதல், பாடுதல், அல்லது வார்த்தைகள் வழி எண்ணங்களை வெளிப்படுத்துதல்.
                        </p>
                    </div>

                    <div className="dict-card">
                        <div className="dict-word-header">
                            <span className="dict-word">Navil</span>
                            <span className="dict-meta">/nʌvɪl/ • verb</span>
                        </div>
                        <p className="dict-definition">
                            Derived from Tamil “Naviluthal” — meaning to speak, utter, narrate, or express core reflections through lyrical words.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
