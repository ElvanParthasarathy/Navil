import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { ArichuvadiEditor } from './கூறுகள்/அரிச்சுவடிதொகுப்பான்';
import { ArichuvadiLearn } from './கூறுகள்/அரிச்சுவடிகற்றல்';
import { ArichuvadiPractice } from './கூறுகள்/அரிச்சுவடிபயிற்சி';
import { ArichuvadiMatch } from './கூறுகள்/அரிச்சுவடிபொருத்து';
import { ArichuvadiMemorize } from './கூறுகள்/அரிச்சுவடிநினைவூட்டு';
import { ArichuvadiBooks } from './கூறுகள்/அரிச்சுவடிநூல்கள்';
import { ArichuvadiDownloads } from './கூறுகள்/அரிச்சுவடிபதிவிறக்கங்கள்';
import { ArichuvadiImage } from './கூறுகள்/அரிச்சுவடிபடம்';
import { ArichuvadiAbout } from './கூறுகள்/அரிச்சுவடிபற்றி';
import { PencilSimple, GridFour, Brain, PuzzlePiece, Swatches, BookOpen, DownloadSimple, Info, Image as ImageIcon, ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import '../../படைப்புகள்/படைப்புகள்.css';
import './அரிச்சுவடி.css';

type ViewMode = 'home' | 'editor' | 'learn' | 'practice' | 'match' | 'memorize' | 'books' | 'image' | 'downloads' | 'about';

const features: { key: ViewMode; icon: React.ReactNode; title: string; titleSub: string; desc: string; descSub: string }[] = [
  { key: 'editor', icon: <PencilSimple weight="regular" />, title: 'மாற்றி', titleSub: 'Editor', desc: 'தமிழ் உரையை பண்டைய எழுத்துக்களாக மாற்றுக.', descSub: 'Convert modern Tamil to ancient scripts instantly.' },
  { key: 'learn', icon: <GridFour weight="regular" />, title: 'பயில்க', titleSub: 'Learn', desc: 'அனைத்து எழுத்துக்களின் அட்டைகள்.', descSub: 'Interactive flashcards for every letter combination.' },
  { key: 'practice', icon: <Brain weight="regular" />, title: 'நிரப்புக', titleSub: 'Fill Quiz', desc: 'எழுத்துக்களை நிரப்பி சரிபார்க்க.', descSub: 'Type or choose the correct modern Tamil for each letter.' },
  { key: 'match', icon: <PuzzlePiece weight="regular" />, title: 'பொருத்துக', titleSub: 'Match', desc: 'இரு தொகுதிகளை பொருத்துக.', descSub: 'Match ancient letters with their modern Tamil equivalents.' },
  { key: 'memorize', icon: <Swatches weight="regular" />, title: 'நினைவில் கொள்க', titleSub: 'Memorize', desc: 'நினைவாற்றல் விளையாட்டு.', descSub: 'Classic memory card game to test your recall.' },
  { key: 'books', icon: <BookOpen weight="regular" />, title: 'நூல்கள்', titleSub: 'Books', desc: 'திருக்குறள், தொல்காப்பியம் படிக்க.', descSub: 'Read classic Tamil literature in ancient scripts.' },
  { key: 'image', icon: <ImageIcon weight="regular" />, title: 'பட உரை', titleSub: 'Image Overlay', desc: 'படத்தில் பண்டைய உரை சேர்க்க.', descSub: 'Overlay ancient text on any image and download.' },
  { key: 'downloads', icon: <DownloadSimple weight="regular" />, title: 'தரவிறக்கம்', titleSub: 'Downloads', desc: 'எழுத்துருக்கள் மற்றும் கையேடுகள்.', descSub: 'Download fonts, manuals, and printable flashcards.' },
  { key: 'about', icon: <Info weight="regular" />, title: 'பற்றி', titleSub: 'About', desc: 'இத்திட்டம் பற்றிய தகவல்கள்.', descSub: 'Attribution, license, and project information.' },
];

export default function ArichuvadiTool() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  const activeFeature = features.find(f => f.key === viewMode);

  return (
    <>
      <MobileTopBar 
        title={viewMode === 'home' ? 'நவில் அரிச்சுவடி|navil arichuvadi' : `${activeFeature?.title || 'அரிச்சுவடி'}|${activeFeature?.titleSub || 'arichuvadi'}`}
        onBack={viewMode !== 'home' ? () => setViewMode('home') : undefined}
        backUrl="/tools"
      />
      <Helmet>
          <title>{activeFeature ? `${activeFeature.title} | நவில் அரிச்சுவடி` : 'நவில் அரிச்சுவடி | Navil Arichuvadi'}</title>
      </Helmet>

      <div className="writings-page page-view fadeIn">
        {viewMode === 'home' ? (
          <FloatingBackButton to="/tools" />
        ) : (
          <button 
            className="back-pill bp-fixed"
            onClick={() => setViewMode('home')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>அரிச்சுவடி</span>
          </button>
        )}

        {viewMode === 'home' ? (
          <>
            <header className="writings-header animate-entry">
                <div style={{ flex: 1 }}>
                    <h1 className="writings-title">நவில் அரிச்சுவடி</h1>
                    <div className="writings-title-sub">Navil Arichuvadi</div>
                    <p className="writings-subtitle">பண்டைய தமிழ் எழுத்து வடிவமாற்றி — தமிழி &amp; வட்டெழுத்து.</p>
                    <p className="writings-subtitle writings-subtitle-en">
                      Ancient Tamil Script Converter — Thamizhi &amp; Vatteluttu
                    </p>
                </div>
            </header>

            <div className="category-grid animate-entry">
              {features.map(f => (
                <div key={f.key} className="category-card" onClick={() => setViewMode(f.key)} style={{ cursor: 'pointer' }}>
                  <div className="cat-icon-box">{f.icon}</div>
                  <div className="cat-content">
                    <div className="cat-title">{f.title}</div>
                    <div className="cat-title-sub">{f.titleSub}</div>
                    <p className="cat-desc">{f.desc}</p>
                    <p className="cat-desc-sub">{f.descSub}</p>
                  </div>
                  <div className="cat-footer">திற <ArrowRight weight="regular" /></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="arichuvadi-subview-container animate-entry">
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
        )}
      </div>
    </>
  );
}
