import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { Piano } from './கூறுகள்/கின்னரப்பெட்டி';
import '../../படைப்புகள்/படைப்புகள்.css';
import './கின்னரப்பெட்டி.css';

export default function PianoTool() {
  return (
    <>
      <MobileTopBar title="கின்னரப்பெட்டி|navil piano" backUrl="/tools" isBeta={true} />
      <Helmet>
          <title>கின்னரப்பெட்டி | Navil Piano</title>
      </Helmet>
      
      <div className="writings-page page-view fadeIn">
        <FloatingBackButton to="/tools" />
        
        <header className="writings-header animate-entry">
            <div style={{ flex: 1 }}>
                <h1 className="writings-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    கின்னரப்பெட்டி
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
                <div className="writings-title-sub">Navil Piano</div>
                <p className="writings-subtitle">
                  மெய்நிகர் கின்னரப்பெட்டி மற்றும் இசையமைப்புக் கருவி.
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
      </div>
    </>
  );
}
