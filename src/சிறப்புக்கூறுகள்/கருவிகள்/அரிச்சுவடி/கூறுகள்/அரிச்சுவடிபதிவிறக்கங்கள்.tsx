import React, { useState } from 'react';
import { DownloadSimple, Book, Cards, TextAUnderline, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export function ArichuvadiDownloads() {
  const [selectedPdf, setSelectedPdf] = useState<{ name: string, file: string } | null>(null);

  // Hide floating back button ("பின்செல்") when full-screen PDF view is active
  useEffect(() => {
    if (selectedPdf) {
      document.body.classList.add('hide-floating-back');
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedPdf(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.classList.remove('hide-floating-back');
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.classList.remove('hide-floating-back');
    }
  }, [selectedPdf]);

  const handleItemClick = (e: React.MouseEvent, item: { name: string, file: string, desc: string }) => {
    // If it's a PDF, intercept and open in the full-screen internal viewer
    if (item.file.endsWith('.pdf')) {
      e.preventDefault();
      setSelectedPdf(item);
    }
  };

  const downloadSection = (title: string, icon: React.ReactNode, items: { name: string, file: string, desc: string }[]) => (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
        {icon} {title}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {items.map(item => (
          <a 
            key={item.file}
            href={`/downloads/${item.file}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleItemClick(e, item)}
            className="category-card"
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '20px', textDecoration: 'none', color: 'inherit',
              minHeight: 'auto'
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{item.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{item.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, marginTop: 'auto' }}>
              <DownloadSimple weight="bold" /> {item.file.endsWith('.pdf') ? 'View PDF' : 'Download'}
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-entry" style={{ padding: '0 16px', position: 'relative' }}>
      
      {/* Full-Screen PDF Viewer */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="arichuvadi-fullscreen-pdf-overlay"
          >
            <div className="arichuvadi-pdf-topbar">
              <div className="arichuvadi-pdf-title-wrap">
                <Book weight="duotone" size={22} />
                <span className="arichuvadi-pdf-title">{selectedPdf.name}</span>
              </div>
              <div className="arichuvadi-pdf-actions">
                <a
                  href={`/downloads/${selectedPdf.file}`}
                  download
                  className="arichuvadi-pill-btn active"
                  style={{ textDecoration: 'none', padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  <DownloadSimple size={15} weight="bold" />
                  <span>Download PDF</span>
                </a>
                <button 
                  onClick={() => setSelectedPdf(null)}
                  className="arichuvadi-pdf-close-btn"
                  title="மூடுக (Close - Esc)"
                >
                  <X size={24} weight="bold" />
                </button>
              </div>
            </div>
            <div className="arichuvadi-pdf-body">
              <iframe 
                src={`/downloads/${selectedPdf.file}`} 
                className="arichuvadi-pdf-frame"
                title={selectedPdf.name}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {downloadSection(
        'எழுத்துருக்கள் (Fonts)', 
        <TextAUnderline weight="fill" color="var(--text-main)" />,
        [
          { name: 'Adinatha Tamil-Brahmi', file: 'Adinatha-Tamil-Brahmi.otf', desc: 'Standard Thamizhi font used in the editor.' },
          { name: 'e-Brahmi T', file: 'e-Brahmi-T.ttf', desc: 'Alternative Thamizhi font with different styling.' },
          { name: 'e-Velvi', file: 'e-Velvi.ttf', desc: 'Vatteluttu font with Pallava Grantha support.' }
        ]
      )}

      {downloadSection(
        'கையேடுகள் (Manuals)', 
        <Book weight="fill" color="var(--text-main)" />,
        [
          { name: 'Adinatha Manual', file: 'adinatha-manual.pdf', desc: 'Complete guide for the Adinatha Thamizhi font typing rules.' },
          { name: 'e-Brahmi Manual', file: 'e-brahmi-manual.pdf', desc: 'Guide for the e-Brahmi font typing rules.' },
          { name: 'e-Velvi Manual', file: 'e-velvi-manual.pdf', desc: 'Guide for the e-Velvi Vatteluttu font typing rules.' },
          { name: 'Jinavani Documentation 1', file: 'Jinavani-1.pdf', desc: 'Original documentation on Jinavani\'s design.' },
          { name: 'Jinavani Documentation (Rest)', file: 'Jinavani-rest.pdf', desc: 'Further documentation on Jinavani.' }
        ]
      )}

      {downloadSection(
        'அச்சு அட்டைகள் (Printable Cards)', 
        <Cards weight="fill" color="var(--text-main)" />,
        [
          { name: 'Tamil-Brahmi Flashcards', file: 'tamil-brahmi-cards.pdf', desc: 'Printable PDF of all Thamizhi flashcards.' },
          { name: 'Vatteluttu Flashcards', file: 'vatteluttu-cards.pdf', desc: 'Printable PDF of all Vatteluttu flashcards.' },
          { name: 'Thirukkural in Brahmi PDF', file: 'brahmi-thirukkural.pdf', desc: 'The entire Thirukkural rendered in Thamizhi.' },
          { name: 'Tholkaappiyam in Brahmi PDF', file: 'brahmi-tholkaappiyam.pdf', desc: 'The entire Tholkaappiyam rendered in Thamizhi.' },
          { name: 'Thirukkural in Vatteluttu PDF', file: 'vatteluttu-thirukkural.pdf', desc: 'The entire Thirukkural rendered in Vatteluttu.' },
          { name: 'Tholkaappiyam in Vatteluttu PDF', file: 'vatteluttu-tholkaappiyam.pdf', desc: 'The entire Tholkaappiyam rendered in Vatteluttu.' }
        ]
      )}
    </div>
  );
}
