import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { PencilSimple, GridFour, Brain, PuzzlePiece, Swatches, BookOpen, DownloadSimple, Info, Image as ImageIcon, ArrowRight } from '@phosphor-icons/react';
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
  const { feature } = useParams<{ feature?: string }>();
  const activeFeature = features.find(f => f.key === feature);
  const viewMode: ViewMode = activeFeature ? activeFeature.key : 'home';

  // Ensure scroll is at the top when entering a sub-view, while preserving home grid scroll when returning
  useEffect(() => {
    if (viewMode !== 'home') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [viewMode]);

  return (
    <>
      <MobileTopBar 
        title={viewMode === 'home' ? 'நவில் அரிச்சுவடி|navil arichuvadi' : `${activeFeature?.title || 'அரிச்சுவடி'}|${activeFeature?.titleSub || 'arichuvadi'}`}
        backUrl={viewMode === 'home' ? '/tools' : '/tools/arichuvadi'}
        isBeta={true}
      />
      <Helmet>
        <title>{viewMode !== 'home' && activeFeature ? `${activeFeature.title} | நவில் அரிச்சுவடி` : 'நவில் அரிச்சுவடி | Navil Arichuvadi'}</title>
      </Helmet>

      <div className="writings-page page-view fadeIn">
        {viewMode !== 'books' && (
          <FloatingBackButton to={viewMode === 'home' ? '/tools' : '/tools/arichuvadi'} />
        )}

        {viewMode !== 'books' && (
          <header className="writings-header animate-entry">
            <div style={{ flex: 1 }}>
              <h1 className="writings-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {viewMode === 'home' ? 'நவில் அரிச்சுவடி' : activeFeature?.title}
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
              <div className="writings-title-sub">
                {viewMode === 'home' ? 'Navil Arichuvadi' : activeFeature?.titleSub}
              </div>
              <p className="writings-subtitle">
                {viewMode === 'home' 
                  ? 'பண்டைய தமிழ் எழுத்து வடிவமாற்றி — தமிழி & வட்டெழுத்து.' 
                  : activeFeature?.desc}
              </p>
              <p className="writings-subtitle writings-subtitle-en">
                {viewMode === 'home' 
                  ? 'Ancient Tamil Script Converter — Thamizhi & Vatteluttu' 
                  : activeFeature?.descSub}
              </p>
            </div>
          </header>
        )}

        {viewMode === 'home' ? (
          <div className="category-grid animate-entry">
            {features.map(f => (
              <Link key={f.key} to={`/tools/arichuvadi/${f.key}`} className="category-card">
                <div className="cat-icon-box">{f.icon}</div>
                <div className="cat-content">
                  <div className="cat-title">{f.title}</div>
                  <div className="cat-title-sub">{f.titleSub}</div>
                  <p className="cat-desc">{f.desc}</p>
                  <p className="cat-desc-sub">{f.descSub}</p>
                </div>
                <div className="cat-footer">திற <ArrowRight weight="regular" /></div>
              </Link>
            ))}
          </div>
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
