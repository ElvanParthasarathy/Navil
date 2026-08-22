import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { vowelsT, consonantsT, vowelSignsT, convertToBrahmi } from '../engine/brahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';
import { ArrowsClockwise, CheckCircle } from '@phosphor-icons/react';

type ScriptType = 'brahmi' | 'vatteluttu';

export function ArichuvadiPractice() {
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [count, setCount] = useState(12);
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  const [quizItems, setQuizItems] = useState<{ target: string, ancient: string, options: string[] }[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [hasVerified, setHasVerified] = useState(false);

  // Generate the full pool of valid characters
  const charPool = useMemo(() => {
    let pool: string[] = [...vowelsT];
    
    // Add all consonants
    pool = pool.concat(consonantsT.filter(c => !(script === 'vatteluttu' && c === 'த⁴')));
    
    // Add all combinations
    for (const c of consonantsT) {
      if (script === 'vatteluttu' && c === 'த⁴') continue;
      for (const vs of vowelSignsT) {
        pool.push(c + vs);
      }
    }
    
    // Add Sri
    pool.push('ஶ்ரீ');
    
    return pool;
  }, [script]);

  const getAncient = (tamil: string) => {
    return script === 'brahmi' ? convertToBrahmi(tamil, 'late') : convertToVatteluttu(tamil);
  };

  const getFontClass = () => {
    return script === 'brahmi' ? 'arichuvadi-output-brahmi' : 'arichuvadi-output-vatteluttu';
  };

  const generateQuiz = () => {
    const items = [];
    const poolCopy = [...charPool];
    
    for (let i = 0; i < count; i++) {
      if (poolCopy.length === 0) break;
      const rIndex = Math.floor(Math.random() * poolCopy.length);
      const target = poolCopy[rIndex];
      poolCopy.splice(rIndex, 1);
      
      // Generate 3 random options including correct answer
      let options = [target];
      while (options.length < 3) {
        const randOpt = charPool[Math.floor(Math.random() * charPool.length)];
        if (!options.includes(randOpt)) options.push(randOpt);
      }
      // Shuffle options
      options = options.sort(() => Math.random() - 0.5);
      
      items.push({
        target,
        ancient: getAncient(target),
        options
      });
    }
    
    setQuizItems(items);
    setAnswers({});
    setResults({});
    setHasVerified(false);
  };

  // Generate on mount or when settings change
  useEffect(() => {
    generateQuiz();
  }, [script, count]);

  const handleVerify = () => {
    const newResults: Record<number, boolean> = {};
    quizItems.forEach((item, idx) => {
      newResults[idx] = (answers[idx] || '').trim() === item.target;
    });
    setResults(newResults);
    setHasVerified(true);
  };

  const handleShowAnswers = () => {
    const newAnswers: Record<number, string> = {};
    quizItems.forEach((item, idx) => {
      newAnswers[idx] = item.target;
    });
    setAnswers(newAnswers);
    setResults({});
    setHasVerified(true);
  };

  const score = Object.values(results).filter(Boolean).length;

  return (
    <div className="animate-entry" style={{ marginTop: '30px' }}>
      <div className="arichuvadi-controls" style={{ marginBottom: '24px', justifyContent: 'center' }}>
        <div className="arichuvadi-select-wrap">
          <label>எழுத்து:</label>
          <select
            className="arichuvadi-select"
            value={script}
            onChange={(e) => setScript(e.target.value as ScriptType)}
          >
            <option value="brahmi">தமிழி</option>
            <option value="vatteluttu">வட்டெழுத்து</option>
          </select>
        </div>
        
        <div className="arichuvadi-select-wrap">
          <label>எண்ணிக்கை:</label>
          <select
            className="arichuvadi-select"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>தெரிவுகள் (Multiple Choice)</label>
          <button 
            onClick={() => setShowMultipleChoice(!showMultipleChoice)}
            style={{
              width: '40px', height: '22px', borderRadius: '12px',
              background: showMultipleChoice ? 'var(--text-main)' : 'var(--border-color)',
              border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s'
            }}
          >
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%', background: 'var(--bg-main)',
              position: 'absolute', top: '2px', left: showMultipleChoice ? '20px' : '2px', transition: '0.3s'
            }}/>
          </button>
        </div>
      </div>

      <div className="arichuvadi-flashcard-grid">
        {quizItems.map((item, idx) => {
          let cardStyle = {};
          if (hasVerified && results[idx] !== undefined) {
            cardStyle = {
              borderColor: results[idx] ? '#4CAF50' : '#F44336',
              boxShadow: results[idx] ? '0 0 0 1px #4CAF50' : '0 0 0 1px #F44336'
            };
          }

          return (
            <motion.div
              key={idx}
              className="arichuvadi-flashcard"
              style={{ ...cardStyle, minHeight: '160px', padding: '16px 12px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`flashcard-ancient ${getFontClass()}`} style={{ marginBottom: '16px' }}>
                {item.ancient}
              </div>
              
              {!showMultipleChoice ? (
                <input 
                  type="text" 
                  value={answers[idx] || ''}
                  onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                  placeholder="விடை..."
                  style={{
                    width: '100%', padding: '6px', textAlign: 'center', borderRadius: '6px',
                    border: '1px solid var(--border-color)', background: 'var(--bg-main)',
                    color: 'var(--text-main)', fontFamily: 'inherit'
                  }}
                />
              ) : (
                <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                  {item.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setAnswers({ ...answers, [idx]: opt })}
                      style={{
                        flex: 1, padding: '4px 0', fontSize: '0.8rem', borderRadius: '4px',
                        border: '1px solid var(--border-color)', cursor: 'pointer',
                        background: answers[idx] === opt ? 'var(--text-main)' : 'var(--bg-main)',
                        color: answers[idx] === opt ? 'var(--bg-main)' : 'var(--text-main)',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
        <button className="arichuvadi-btn" onClick={generateQuiz}>
          <ArrowsClockwise weight="bold" /> புதியவை (Reset)
        </button>
        <button className="arichuvadi-btn" onClick={handleShowAnswers}>
          விடைகள் (Show Answers)
        </button>
        <button className="arichuvadi-btn copied" onClick={handleVerify}>
          <CheckCircle weight="bold" /> சரிபார் (Verify)
        </button>
      </div>

      {hasVerified && Object.keys(results).length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          மதிப்பெண்: <span style={{ color: score === count ? '#4CAF50' : 'var(--text-main)' }}>{score} / {count}</span>
        </div>
      )}
    </div>
  );
}
