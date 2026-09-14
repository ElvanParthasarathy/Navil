import './முகப்பு.css';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { Wrench } from '@phosphor-icons/react';

export default function CompanyHome() {
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
                {/* 1. STUDIO HEADER (DIRECT ON PAGE, SAME PADDING AS OTHER PAGES, NO CARD, NO CHIPS) */}
                <header className="home-brand-header animate-entry">
                    <h1 className="home-brand-title" lang="ta">
                        எல்வன் நவில்
                    </h1>
                    <div className="home-brand-title-sub">Elvan Navil</div>
                    <p className="home-brand-subtitle" lang="ta">
                        நல்வரவு. இது எல்வன் நவில் — சிந்தனைகளை உரைக்க, எழுத்துகளைப் பகிர, தன்னுரிமை மென்பொருட்கள், தனித்துவ அச்சுக்கலை மற்றும் எண்மப் படைப்புகளைக் காட்சிப்படுத்தும் படைப்பரங்கு.
                    </p>
                    <p className="home-brand-subtitle home-brand-subtitle-en">
                        Welcome to Elvan Navil — an independent digital creation studio crafting thoughtful desktop software, bespoke typography, and bilingual literature.
                    </p>
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

                {/* 3. RECONSTRUCTION CARDS (DUAL TAMIL & ENGLISH WITH SYMBOL) */}
                <div className="dictionary-container reconstruction-container animate-entry">
                    <div className="dict-card reconstruction-card">
                        <div className="dict-word-header">
                            <span className="dict-word reconstruction-word" lang="ta">
                                <Wrench size={20} weight="regular" className="reconstruction-symbol" />
                                வலைத்தளம் மறுசீரமைப்பில் உள்ளது
                            </span>
                            <span className="dict-meta">அறிவிப்பு</span>
                        </div>
                        <p className="dict-definition" lang="ta">
                            தளத்தின் பக்கங்களும் படைப்புகளும் புதிய வடிவமைப்புடன் மறுசீரமைக்கப்பட்டு வருகின்றன. புதிய அம்சங்கள் மற்றும் தொகுப்புகள் விரைவில் இணைக்கப்படும்.
                        </p>
                    </div>

                    <div className="dict-card reconstruction-card">
                        <div className="dict-word-header">
                            <span className="dict-word reconstruction-word">
                                <Wrench size={20} weight="regular" className="reconstruction-symbol" />
                                Under Reconstruction
                            </span>
                            <span className="dict-meta">Notice</span>
                        </div>
                        <p className="dict-definition">
                            The studio platform is currently undergoing active redesign and structural curation. Refined experiences and new releases will be available soon.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
