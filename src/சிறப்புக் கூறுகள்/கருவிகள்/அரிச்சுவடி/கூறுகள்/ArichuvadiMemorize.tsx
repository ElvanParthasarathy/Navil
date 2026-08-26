import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { vowelsT, consonantsT, vowelSignsT, convertToBrahmi } from '../engine/brahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';
import { ArrowsClockwise } from '@phosphor-icons/react';

type ScriptType = 'brahmi' | 'vatteluttu';

type Card = {
  uniqueId: string;
  pairId: number;
  text: string;
  type: 'ancient' | 'tamil';
};

export function ArichuvadiMemorize() {
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [count, setCount] = useState(6); // Keep it small for memory game!
  
  const [cards, setCards] = useState<Card[]>([]);
  
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  
  const [isLocked, setIsLocked] = useState(false);

  // Generate the full pool of valid characters
  const charPool = useMemo(() => {
    let pool: string[] = [...vowelsT];
    pool = pool.concat(consonantsT.filter(c => !(script === 'vatteluttu' && c === 'த⁴')));
    for (const c of consonantsT) {
      if (script === 'vatteluttu' && c === 'த⁴') continue;
      for (const vs of vowelSignsT) {
        pool.push(c + vs);
      }
    }
    pool.push('ஶ்ரீ');
    return pool;
  }, [script]);

  const getAncient = (tamil: string) => {
    return script === 'brahmi' ? convertToBrahmi(tamil, 'late') : convertToVatteluttu(tamil);
  };

  const getFontClass = () => {
    return script === 'brahmi' ? 'arichuvadi-output-brahmi' : 'arichuvadi-output-vatteluttu';
  };

  const generateGame = () => {
    const poolCopy = [...charPool];
    const deck: Card[] = [];
    
    for (let i = 0; i < count; i++) {
      if (poolCopy.length === 0) break;
      const rIndex = Math.floor(Math.random() * poolCopy.length);
      const target = poolCopy[rIndex];
      poolCopy.splice(rIndex, 1);
      
      deck.push({ uniqueId: `a-${i}`, pairId: i, text: getAncient(target), type: 'ancient' });
      deck.push({ uniqueId: `t-${i}`, pairId: i, text: target, type: 'tamil' });
    }
    
    // Shuffle the deck
    setCards(deck.sort(() => Math.random() - 0.5));
    
    setFlippedIndices([]);
    setMatchedPairIds([]);
    setIsLocked(false);
  };

  useEffect(() => {
    generateGame();
  }, [script, count]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (flippedIndices.includes(index)) return;
    if (matchedPairIds.includes(cards[index].pairId)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];

      if (cards[idx1].pairId === cards[idx2].pairId) {
        // Match found!
        setTimeout(() => {
          setMatchedPairIds(prev => [...prev, cards[idx1].pairId]);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 500);
      } else {
        // Not a match
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="animate-entry" style={{ marginTop: '30px' }}>
      <div className="arichuvadi-controls" style={{ marginBottom: '24px', justifyContent: 'center' }}>
        <div className="arichuvadi-select-wrap">
          <label>எழுத்து:</label>
          <select className="arichuvadi-select" value={script} onChange={(e) => setScript(e.target.value as ScriptType)}>
            <option value="brahmi">தமிழி</option>
            <option value="vatteluttu">வட்டெழுத்து</option>
          </select>
        </div>
        
        <div className="arichuvadi-select-wrap">
          <label>எண்ணிக்கை:</label>
          <select className="arichuvadi-select" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="12">12</option>
          </select>
        </div>

        <button className="arichuvadi-btn" onClick={generateGame} style={{ marginLeft: '12px' }}>
          <ArrowsClockwise weight="bold" /> (Reset)
        </button>
      </div>

      <div className="arichuvadi-flashcard-grid" style={{ maxWidth: '800px', margin: '0 auto', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
        {cards.map((card, idx) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isFlipped = flippedIndices.includes(idx) || isMatched;

          return (
            <div 
              key={card.uniqueId} 
              className="arichuvadi-flashcard-container"
              onClick={() => handleCardClick(idx)}
              style={{ minHeight: '140px' }}
            >
              <motion.div
                className="arichuvadi-flashcard flip-mode"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={!isFlipped && !isLocked ? { scale: 1.05 } : {}}
                whileTap={!isFlipped && !isLocked ? { scale: 0.95 } : {}}
                style={{ 
                  cursor: isFlipped ? 'default' : 'pointer',
                  boxShadow: isMatched ? '0 0 15px rgba(76, 175, 80, 0.4)' : '' 
                }}
              >
                {/* Back of card (Hidden state) */}
                <div className="flashcard-face flashcard-front" style={{ opacity: isFlipped ? 0 : 1, background: 'var(--border-color)' }}>
                  <div style={{ fontSize: '2rem', color: 'var(--text-muted)', opacity: 0.5 }}>?</div>
                </div>

                {/* Front of card (Revealed state) */}
                <div className="flashcard-face flashcard-back" style={{ 
                  opacity: isFlipped ? 1 : 0, 
                  transform: 'rotateY(180deg)',
                  background: isMatched ? '#4CAF50' : 'var(--bg-panel)',
                  color: isMatched ? '#fff' : 'inherit'
                }}>
                  {card.type === 'ancient' ? (
                     <div className={`flashcard-ancient ${getFontClass()}`}>{card.text}</div>
                  ) : (
                     <div className="flashcard-tamil" style={{ fontSize: '2.5rem' }}>{card.text}</div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {matchedPairIds.length === count && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', marginTop: '32px', fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}
        >
          அற்புதம்! சிறந்த நினைவாற்றல். (Excellent Memory!)
        </motion.div>
      )}
    </div>
  );
}
