import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../கூறுகள்/கட்டமைப்பு/மொபைல்_மேல்பட்டை';
import { FloatingBackButton } from '../../../கூறுகள்/கட்டமைப்பு/மிதக்கும்_பின்பொத்தான்';
import { Piano } from './கூறுகள்/கின்னரப்பெட்டி';
import '../../படைப்புகள்/படைப்புகள்.css';
import './கின்னரப்பெட்டி.css';

export default function PianoTool() {
  return (
    <>
      <MobileTopBar title="பியானோ|piano" />
      <Helmet>
          <title>Elvan Piano | Tools</title>
      </Helmet>
      
      <div className="writings-page page-view fadeIn">
        <FloatingBackButton to="/tools" />
        
        <header className="writings-header animate-entry">
            <div style={{ flex: 1 }}>
                <h1 className="writings-title">Elvan Piano</h1>
                <div className="writings-title-sub">Synthesizer Tool</div>
                <p className="writings-subtitle">
                  A fully functional virtual piano synthesizer.
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                  Play and map keyboard keys to musical notes.
                </p>
            </div>
        </header>
        
        <Piano />
      </div>
    </>
  );
}
