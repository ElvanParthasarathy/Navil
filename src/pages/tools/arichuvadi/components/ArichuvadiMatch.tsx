import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { vowelsT, consonantsT, vowelSignsT, convertToBrahmi } from '../engine/brahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';
import { ArrowsClockwise } from '@phosphor-icons/react';

type ScriptType = 'brahmi' | 'vatteluttu';

export function ArichuvadiMatch() {
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [count, setCount] = useState(12);
  
  const [deck1, setDeck1] = useState<{ id: number, text: string, type: 'ancient' }[]>([]);
  const [deck2, setDeck2] = useState<{ id: number, text: string, type: 'tamil' }[]>([]);
  
  const [selected1, setSelected1] = useState<number | null>(null);
  const [selected2, setSelected2] = useState<number | null>(null);
  
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);

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
    const selectedPairs = [];
    
    for (let i = 0; i < count; i++) {
      if (poolCopy.length === 0) break;
      const rIndex = Math.floor(Math.random() * poolCopy.length);
      const target = poolCopy[rIndex];
      poolCopy.splice(rIndex, 1);
      
      selectedPairs.push({ id: i, tamil: target, ancient: getAncient(target) });
    }
    
    // Create shuffled deck 1 (ancient)
    const d1 = selectedPairs.map(p => ({ id: p.id, text: p.ancient, type: 'ancient' as const }));
    setDeck1(d1.sort(() => Math.random() - 0.5));
    
    // Create shuffled deck 2 (tamil)
    const d2 = selectedPairs.map(p => ({ id: p.id, text: p.tamil, type: 'tamil' as const }));
    setDeck2(d2.sort(() => Math.random() - 0.5));
    
    setSelected1(null);
    setSelected2(null);
    setMatchedPairs([]);
  };

  useEffect(() => {
    generateGame();
  }, [script, count]);

  // Handle matching logic
  useEffect(() => {
    if (selected1 !== null && selected2 !== null) {
      if (selected1 === selected2) {
        // Match!
        setMatchedPairs(prev => [...prev, selected1]);
        setSelected1(null);
        setSelected2(null);
      } else {
        // No match, clear after delay
        const timer = setTimeout(() => {
          setSelected1(null);
          setSelected2(null);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [selected1, selected2]);

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
            <option value="12">12</option>
            <option value="24">24</option>
          </select>
        </div>

        <button className="arichuvadi-btn" onClick={generateGame} style={{ marginLeft: '12px' }}>
          <ArrowsClockwise weight="bold" /> (Reset)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Deck 1 */}
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>தொகுதி 1</h4>
          <div className="arichuvadi-flashcard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {deck1.map((item) => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = selected1 === item.id;
              
              let style = {};
              if (isMatched) {
                style = { background: '#4CAF50', color: '#fff', opacity: 0.8, pointerEvents: 'none' };
              } else if (isSelected) {
                style = { borderColor: 'var(--text-main)', boxShadow: '0 0 0 2px var(--text-main)' };
              }

              return (
                <motion.div
                  key={`d1-${item.id}`}
                  className="arichuvadi-flashcard"
                  style={{ ...style, cursor: isMatched ? 'default' : 'pointer', minHeight: '120px' }}
                  whileHover={!isMatched && !isSelected ? { scale: 1.05 } : {}}
                  whileTap={!isMatched ? { scale: 0.95 } : {}}
                  onClick={() => !isMatched && setSelected1(isSelected ? null : item.id)}
                >
                  <div className={`flashcard-ancient ${getFontClass()}`}>{item.text}</div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deck 2 */}
        <div>
          <h4 style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-muted)' }}>தொகுதி 2</h4>
          <div className="arichuvadi-flashcard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {deck2.map((item) => {
              const isMatched = matchedPairs.includes(item.id);
              const isSelected = selected2 === item.id;
              
              let style = {};
              if (isMatched) {
                style = { background: '#4CAF50', color: '#fff', opacity: 0.8, pointerEvents: 'none' };
              } else if (isSelected) {
                style = { borderColor: 'var(--text-main)', boxShadow: '0 0 0 2px var(--text-main)' };
              }

              return (
                <motion.div
                  key={`d2-${item.id}`}
                  className="arichuvadi-flashcard"
                  style={{ ...style, cursor: isMatched ? 'default' : 'pointer', minHeight: '120px' }}
                  whileHover={!isMatched && !isSelected ? { scale: 1.05 } : {}}
                  whileTap={!isMatched ? { scale: 0.95 } : {}}
                  onClick={() => !isMatched && setSelected2(isSelected ? null : item.id)}
                >
                  <div className="flashcard-tamil" style={{ fontSize: '2.5rem' }}>{item.text}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {matchedPairs.length === count && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', marginTop: '32px', fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}
        >
          வாழ்த்துகள்! அனைத்தும் பொருந்திவிட்டன. (Congratulations!)
        </motion.div>
      )}
    </div>
  );
}
