import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../../components/ui/FloatingBackButton';
import { Piano } from './components/Piano';
import '../../Writings.css';
import './piano.css';

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
