import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../../components/ui/FloatingBackButton';
import { ArichuvadiEditor } from './components/ArichuvadiEditor';
import { ArichuvadiLearn } from './components/ArichuvadiLearn';
import { ArichuvadiPractice } from './components/ArichuvadiPractice';
import { ArichuvadiMatch } from './components/ArichuvadiMatch';
import { ArichuvadiMemorize } from './components/ArichuvadiMemorize';
import { ArichuvadiBooks } from './components/ArichuvadiBooks';
import { ArichuvadiDownloads } from './components/ArichuvadiDownloads';
import { ArichuvadiImage } from './components/ArichuvadiImage';
import { ArichuvadiAbout } from './components/ArichuvadiAbout';
import { PencilSimple, GridFour, Brain, PuzzlePiece, Swatches, BookOpen, DownloadSimple, Info, Image as ImageIcon } from '@phosphor-icons/react';
import '../../Writings.css';
import './arichuvadi.css';

export default function ArichuvadiTool() {
  const [viewMode, setViewMode] = useState<'editor' | 'learn' | 'practice' | 'match' | 'memorize' | 'books' | 'image' | 'downloads' | 'about'>('editor');

  return (
    <>
      <MobileTopBar title="அரிச்சுவடி|arichuvadi" />
      <Helmet>
          <title>நவில் அரிச்சுவடி | Navil Arichuvadi</title>
      </Helmet>

      <div className="writings-page page-view fadeIn">
        <FloatingBackButton to="/tools" />

        <header className="writings-header animate-entry" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div>
                <h1 className="writings-title" style={{ margin: 0 }}>நவில் அரிச்சுவடி</h1>
                <div className="writings-title-sub">Navil Arichuvadi — Tamil Epigraphic Editor</div>
                <p className="writings-subtitle">
                  பண்டைய தமிழ் எழுத்து வடிவமாற்றி — தமிழி மற்றும் வட்டெழுத்து.
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                  Convert modern Tamil into ancient Thamizhi and Vatteluttu scripts.
                </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', background: 'var(--bg-panel)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setViewMode('editor')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'editor' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'editor' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <PencilSimple weight={viewMode === 'editor' ? 'fill' : 'bold'} /> மாற்றி
              </button>
              <button 
                onClick={() => setViewMode('learn')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'learn' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'learn' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <GridFour weight={viewMode === 'learn' ? 'fill' : 'bold'} /> பயில்க
              </button>
              <button 
                onClick={() => setViewMode('practice')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'practice' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'practice' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Brain weight={viewMode === 'practice' ? 'fill' : 'bold'} /> நிரப்புக
              </button>
              <button 
                onClick={() => setViewMode('match')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'match' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'match' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <PuzzlePiece weight={viewMode === 'match' ? 'fill' : 'bold'} /> பொருத்துக
              </button>
              <button 
                onClick={() => setViewMode('memorize')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'memorize' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'memorize' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Swatches weight={viewMode === 'memorize' ? 'fill' : 'bold'} /> நினைவில் கொள்க
              </button>
              <button 
                onClick={() => setViewMode('books')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'books' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'books' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <BookOpen weight={viewMode === 'books' ? 'fill' : 'bold'} /> நூல்கள்
              </button>
              <button 
                onClick={() => setViewMode('image')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'image' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'image' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <ImageIcon weight={viewMode === 'image' ? 'fill' : 'bold'} /> பட உரை
              </button>
              <button 
                onClick={() => setViewMode('downloads')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'downloads' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'downloads' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <DownloadSimple weight={viewMode === 'downloads' ? 'fill' : 'bold'} /> தரவிறக்கம்
              </button>
              <button 
                onClick={() => setViewMode('about')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px',
                  background: viewMode === 'about' ? 'var(--text-main)' : 'transparent',
                  color: viewMode === 'about' ? 'var(--bg-main)' : 'var(--text-muted)',
                  border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Info weight={viewMode === 'about' ? 'fill' : 'bold'} /> பற்றி (About)
              </button>
            </div>
        </header>

        {viewMode === 'editor' && <ArichuvadiEditor />}
        {viewMode === 'learn' && <ArichuvadiLearn />}
        {viewMode === 'practice' && <ArichuvadiPractice />}
        {viewMode === 'match' && <ArichuvadiMatch />}
        {viewMode === 'memorize' && <ArichuvadiMemorize />}
        {viewMode === 'books' && <ArichuvadiBooks />}
        {viewMode === 'image' && <ArichuvadiImage />}
        {viewMode === 'downloads' && <ArichuvadiDownloads />}
        {viewMode === 'about' && <ArichuvadiAbout />}
      </div>
    </>
  );
}
