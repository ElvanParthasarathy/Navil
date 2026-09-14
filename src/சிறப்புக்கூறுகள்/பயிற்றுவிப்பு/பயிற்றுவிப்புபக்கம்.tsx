import React from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AdBanner from '../../கூறுகள்/ஊடகம்/விளம்பரம்';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import '../படைப்புகள்/படைப்புகள்.css';
import { Monitor, ArrowRight } from '@phosphor-icons/react';

const Teaching = () => {
    const navigate = useNavigate();

    return (
        <>
            <MobileTopBar title="பயிற்றுவிப்பு|teaching" backUrl="/tools" />
            <Helmet>
                <title>பயிற்றுவிப்பு | Teaching</title>
            </Helmet>
            <div className="writings-page page-view fadeIn">
            <FloatingBackButton to="/tools" />

            <header className="writings-header animate-entry">
                <div style={{ flex: 1 }}>
                    <h1 className="writings-title">பயிற்றுவிப்பு</h1>
                    <div className="writings-title-sub">Teaching & Presentations</div>
                    <p className="writings-subtitle">
                        கற்றல் கற்பித்தல் மற்றும் தொழில்நுட்ப விளக்கக்காட்சிகள்.
                    </p>
                    <p className="writings-subtitle writings-subtitle-en">
                        Interactive teaching materials, slides, and educational resources.
                    </p>
                </div>
            </header>

            <div className="category-grid animate-entry">
                <Link to="/teaching/vocoder" className="category-card">
                    <div className="cat-icon-box"><Monitor weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">நவில் குரல்மாற்றி</div>
                        <div className="cat-title-sub">Navil Vocoder • Interactive Presentation</div>
                        <p className="cat-desc">எனது படைப்பு மற்றும் தொழில் நுட்ப விளக்கக்காட்சி.</p>
                        <p className="cat-desc-sub">Modern presentation for Vocoder engine concepts.</p>
                    </div>
                    <div className="cat-footer">விளக்கக்காட்சியைக் காண <ArrowRight weight="regular" /></div>
                </Link>
            </div>

            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />
        </div>
        </>
    );
};

export default Teaching;
