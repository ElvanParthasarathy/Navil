import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vowelsT, vowelsB, consonantsT, consonantsB, vowelSignsT, convertToBrahmi } from '../engine/brahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';

type ScriptType = 'brahmi' | 'vatteluttu';

export function ArichuvadiLearn() {
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [isFlipMode, setIsFlipMode] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Helper to get the correct display text based on selected script
  const getDisplayChar = (tamilText: string, type: 'vowel' | 'consonant' | 'combo', index?: number) => {
    if (script === 'brahmi') {
      if (type === 'vowel' && index !== undefined) return vowelsB[index];
      if (type === 'consonant' && index !== undefined) return consonantsB[index];
      // For combos, we must run the conversion engine because of ligatures
      return convertToBrahmi(tamilText, 'late');
    } else {
      return convertToVatteluttu(tamilText);
    }
  };

  const getFontClass = () => {
    return script === 'brahmi' ? 'arichuvadi-output-brahmi' : 'arichuvadi-output-vatteluttu';
  };

  const toggleFlip = (id: string) => {
    if (!isFlipMode) return;
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCard = (tamil: string, cardId: string, ancientText: string) => {
    const isFlipped = flippedCards[cardId];

    return (
      <div 
        key={cardId} 
        className="arichuvadi-flashcard-container"
        onClick={() => toggleFlip(cardId)}
      >
        <motion.div
          className={`arichuvadi-flashcard ${isFlipMode ? 'flip-mode' : ''}`}
          animate={{ rotateY: isFlipMode && isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
          whileHover={!isFlipMode ? { scale: 1.05 } : {}}
          whileTap={!isFlipMode ? { scale: 0.95 } : {}}
        >
          {/* Front of card */}
          <div className="flashcard-face flashcard-front" style={{ opacity: isFlipMode && isFlipped ? 0 : 1 }}>
            <div className={isFlipMode ? "flashcard-center-tamil" : "flashcard-tamil"}>
              {tamil}
            </div>
            {!isFlipMode && (
              <div className={`flashcard-ancient ${getFontClass()}`}>{ancientText}</div>
            )}
          </div>

          {/* Back of card */}
          {isFlipMode && (
            <div className="flashcard-face flashcard-back" style={{ opacity: isFlipMode && isFlipped ? 1 : 0, transform: 'rotateY(180deg)' }}>
              <div className={`flashcard-ancient ${getFontClass()}`}>{ancientText}</div>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <div className="animate-entry" style={{ marginTop: '30px' }}>
      <div className="jinavani-controls" style={{ marginBottom: '20px', justifyContent: 'center', gap: '24px' }}>
        <div className="jinavani-select-wrap">
          <label>எழுத்து:</label>
          <select
            className="jinavani-select"
            value={script}
            onChange={(e) => {
              setScript(e.target.value as ScriptType);
              setFlippedCards({});
            }}
          >
            <option value="brahmi">தமிழி</option>
            <option value="vatteluttu">வட்டெழுத்து</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>திருப்பு அட்டை (Flipcards)</label>
          <button 
            onClick={() => {
              setIsFlipMode(!isFlipMode);
              setFlippedCards({});
            }}
            style={{
              width: '40px', height: '22px', borderRadius: '12px',
              background: isFlipMode ? 'var(--text-main)' : 'var(--border-color)',
              border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-main)',
              position: 'absolute', top: '2px', left: isFlipMode ? '20px' : '2px', transition: '0.3s'
            }}/>
          </button>
        </div>
      </div>

      <div className="arichuvadi-learn-section">
        <h3 className="arichuvadi-section-title">உயிரெழுத்துகள்</h3>
        <div className="arichuvadi-flashcard-grid">
          {vowelsT.map((v, i) => renderCard(v, `vowel-${i}`, getDisplayChar(v, 'vowel', i)))}
        </div>
      </div>

      <div className="arichuvadi-learn-section" style={{ marginTop: '40px' }}>
        <h3 className="arichuvadi-section-title">மெய்யெழுத்துகள்</h3>
        <div className="arichuvadi-flashcard-grid">
          {consonantsT.slice(0, 18).map((c, i) => renderCard(c, `consonant-${i}`, getDisplayChar(c, 'consonant', i)))}
          {/* Extended Brahmi letter த⁴ (index 23) - Only show in Brahmi mode */}
          {script === 'brahmi' && renderCard(consonantsT[23], `consonant-23`, getDisplayChar(consonantsT[23], 'consonant', 23))}
        </div>
      </div>

      <div className="arichuvadi-learn-section" style={{ marginTop: '40px' }}>
        <h3 className="arichuvadi-section-title">கிரந்த எழுத்துகள்</h3>
        <div className="arichuvadi-flashcard-grid">
          {/* Grantha letters: ஜ, ஷ, ஸ, ஹ, ஶ (indices 18 to 22) */}
          {consonantsT.slice(18, 23).map((c, i) => {
            const actualIndex = i + 18;
            return (
              <div key={`grantha-${actualIndex}`} className={script === 'vatteluttu' ? "grantha-faded" : ""}>
                {renderCard(c, `consonant-${actualIndex}`, getDisplayChar(c, 'consonant', actualIndex))}
              </div>
            );
          })}
        </div>
        
        {script === 'vatteluttu' && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', opacity: 0.9 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>பல்லவ எழுத்துக்கள் (Pallava Letters)</div>
            <div style={{ fontSize: '0.85rem' }}>Vatteluttu frequently adopted Pallava letters to denote such sounds.</div>
          </div>
        )}
      </div>

      <div className="arichuvadi-learn-section" style={{ marginTop: '40px' }}>
        <h3 className="arichuvadi-section-title">உயிர்மெய் எழுத்துகள்</h3>
        
        {/* We map through consonants, then for each consonant we map through all vowel signs */}
        {consonantsT.map((c, i) => {
           if (script === 'vatteluttu' && c === 'த⁴') return null;
           
           return (
             <div key={`uyirmei-row-${i}`} style={{ marginBottom: '24px' }}>
               <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{c} வரிசை</h4>
               <div className="arichuvadi-flashcard-grid">
                 {vowelSignsT.map((vs, j) => {
                   const tamil = c + vs;
                   const cardId = `combo-${i}-${j}`;
                   const ancient = getDisplayChar(tamil, 'combo');
                   return renderCard(tamil, cardId, ancient);
                 })}
               </div>
             </div>
           );
        })}

        {/* Special Character: Sri */}
        <div style={{ marginBottom: '24px', marginTop: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>சிறப்பு எழுத்து</h4>
          <div className="arichuvadi-flashcard-grid">
            {renderCard('ஶ்ரீ', 'combo-sri', getDisplayChar('ஶ்ரீ', 'combo'))}
          </div>
        </div>
      </div>
    </div>
  );
}
