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
      <MobileTopBar title="கின்னரப்பெட்டி|piano" />
      <Helmet>
          <title>எல்வன் கின்னரப்பெட்டி | Elvan Piano</title>
      </Helmet>
      
      <div className="writings-page page-view fadeIn">
        <FloatingBackButton to="/tools" />
        
        <header className="writings-header animate-entry">
            <div style={{ flex: 1 }}>
                <h1 className="writings-title">எல்வன் கின்னரப்பெட்டி</h1>
                <div className="writings-title-sub">Elvan Piano</div>
                <p className="writings-subtitle">
                  மெய்நிகர் பியானோ மற்றும் இசையமைப்புக் கருவி.
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                  A fully functional virtual piano synthesizer with keyboard mapping.
                </p>
            </div>
        </header>
        
        <Piano />
      </div>
    </>
  );
}
