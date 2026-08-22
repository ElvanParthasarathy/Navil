import React, { useState, useEffect } from 'react';
import { convertToBrahmi } from '../engine/brahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';

type ScriptType = 'brahmi' | 'vatteluttu' | 'tamil';
type BookType = 'thirukkural' | 'tholkaappiyam';

export function ArichuvadiBooks() {
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [book, setBook] = useState<BookType>('thirukkural');
  const [rawText, setRawText] = useState<string>('Loading literature...');
  const [convertedHtml, setConvertedHtml] = useState<string>('');
  
  // Fetch the selected book HTML
  useEffect(() => {
    setRawText('நூலை ஏற்றுகிறது... (Loading...)');
    
    fetch(`/${book}.html`)
      .then(res => res.text())
      .then(html => {
        setRawText(html);
      })
      .catch(err => {
        console.error(err);
        setRawText('<div style="color:red; text-align:center;">Failed to load book.</div>');
      });
  }, [book]);

  // Convert whenever text or script changes
  useEffect(() => {
    if (!rawText) return;
    
    let html = rawText;
    if (script === 'brahmi') {
      html = convertToBrahmi(rawText, 'late');
    } else if (script === 'vatteluttu') {
      html = convertToVatteluttu(rawText);
    }
    // If script === 'tamil', it just stays as rawText (modern Tamil)
      
    setConvertedHtml(html);
  }, [rawText, script]);

  const getFontClass = () => {
    if (script === 'tamil') return '';
    return script === 'brahmi' ? 'arichuvadi-output-brahmi' : 'arichuvadi-output-vatteluttu';
  };

  return (
    <div className="animate-entry" style={{ marginTop: '30px' }}>
      <div className="arichuvadi-controls" style={{ marginBottom: '24px', justifyContent: 'center' }}>
        <div className="arichuvadi-select-wrap">
          <label>நூல் (Book):</label>
          <select 
            className="arichuvadi-select" 
            value={book} 
            onChange={(e) => setBook(e.target.value as BookType)}
            style={{ minWidth: '150px' }}
          >
            <option value="thirukkural">திருக்குறள் (Thirukkural)</option>
            <option value="tholkaappiyam">தொல்காப்பியம் (Tholkaappiyam)</option>
          </select>
        </div>
        
        <div className="arichuvadi-select-wrap">
          <label>எழுத்து (Script):</label>
          <select 
            className="arichuvadi-select" 
            value={script} 
            onChange={(e) => setScript(e.target.value as ScriptType)}
          >
            <option value="tamil">தமிழ் (Modern Tamil)</option>
            <option value="brahmi">தமிழி (Thamizhi)</option>
            <option value="vatteluttu">வட்டெழுத்து (Vatteluttu)</option>
          </select>
        </div>
      </div>

      <div 
        className={`arichuvadi-editor-output ${getFontClass()}`}
        style={{ 
          background: 'var(--bg-panel)',
          padding: '24px 32px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          minHeight: '400px',
          lineHeight: '2.4', // Books need a lot of line height for legibility
          fontSize: '110%'   // Slightly bump up the font size compared to the editor
        }}
        dangerouslySetInnerHTML={{ __html: convertedHtml }}
      />
    </div>
  );
}
