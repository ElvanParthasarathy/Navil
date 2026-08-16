import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../../components/ui/FloatingBackButton';
import { Piano } from './components/Piano';
import './piano.css';

export default function PianoTool() {
  return (
    <>
      <MobileTopBar title="பியானோ|piano" />
      <Helmet>
          <title>Elvan Piano | Tools</title>
      </Helmet>
      
      <main className="w-full min-h-screen bg-black" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 100 }}>
          <FloatingBackButton to="/tools" />
        </div>
        <Piano />
      </main>
    </>
  );
}
