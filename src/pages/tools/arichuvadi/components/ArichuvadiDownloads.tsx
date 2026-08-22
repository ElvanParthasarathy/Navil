import React, { useState } from 'react';
import { DownloadSimple, Book, Cards, TextAUnderline, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export function ArichuvadiDownloads() {
  const [selectedPdf, setSelectedPdf] = useState<{ name: string, file: string } | null>(null);

  const handleItemClick = (e: React.MouseEvent, item: { name: string, file: string, desc: string }) => {
    // If it's a PDF, intercept and open in the internal viewer
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
            className="arichuvadi-flashcard"
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              padding: '16px', textDecoration: 'none', color: 'inherit',
              background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
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
    <div className="animate-entry" style={{ marginTop: '30px', padding: '0 16px', position: 'relative' }}>
      
      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', top: '10vh', left: '10vw', right: '10vw', bottom: '10vh',
              background: 'var(--bg-main)', border: '1px solid var(--border-color)',
              borderRadius: '12px', zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-panel)' }}>
              <div style={{ fontWeight: 'bold' }}>{selectedPdf.name}</div>
              <button 
                onClick={() => setSelectedPdf(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} weight="bold" />
              </button>
            </div>
            <iframe 
              src={`/downloads/${selectedPdf.file}`} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
              title={selectedPdf.name}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dimmed Background Overlay */}
      <AnimatePresence>
        {selectedPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPdf(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', zIndex: 99
            }}
          />
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
