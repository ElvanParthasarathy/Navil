import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { Piano } from './கூறுகள்/கின்னரப்பெட்டி';
import { Desktop, ArrowLeft } from '@phosphor-icons/react';
import '../../படைப்புகள்/படைப்புகள்.css';
import './கின்னரப்பெட்டி.css';

export default function PianoTool() {
  const navigate = useNavigate();

  return (
    <>
      <MobileTopBar title="நவில் பியானோ|navil piano" backUrl="/tools" />
      <Helmet>
          <title>நவில் பியானோ | Navil Piano</title>
      </Helmet>
      
      <div className="writings-page page-view fadeIn">
        <FloatingBackButton to="/tools" />
        
        <header className="writings-header animate-entry">
            <div style={{ flex: 1 }}>
                <h1 className="writings-title">நவில் பியானோ</h1>
                <div className="writings-title-sub">Navil Piano</div>
                <p className="writings-subtitle">
                  மெய்நிகர் பியானோ மற்றும் இசையமைப்புக் கருவி.
                </p>
                <p className="writings-subtitle writings-subtitle-en">
                  Virtual Piano Synthesizer with Keyboard Mapping
                </p>
            </div>
        </header>
        
        {/* Desktop Experience */}
        <div className="piano-desktop-wrap">
          <Piano />
        </div>

        {/* Mobile View - Desktop Only Notice */}
        <div className="piano-mobile-notice category-card static-card animate-entry">
          <div className="piano-notice-icon">
            <Desktop size={48} weight="regular" />
          </div>
          <h2 className="piano-notice-title">கணினிக்கு மட்டுமே உகந்தது</h2>
          <div className="piano-notice-sub">Desktop Only Experience</div>
          <p className="piano-notice-desc">
            நவில் பியானோ இயங்குதளம் விசைப்பலகையுடன் (Physical Keyboard) இணைந்து இசைக்க மட்டுமே பிரத்யேகமாக வடிவமைக்கப்பட்டுள்ளது.
          </p>
          <p className="piano-notice-desc-sub">
            Navil Piano is designed exclusively for desktop screens with a physical keyboard. Please open on a desktop computer or laptop to play.
          </p>
          <button onClick={() => navigate('/tools')} className="piano-notice-btn">
            <ArrowLeft size={16} weight="bold" /> பிற கருவிகளுக்குச் செல்க
          </button>
        </div>
      </div>
    </>
  );
}
