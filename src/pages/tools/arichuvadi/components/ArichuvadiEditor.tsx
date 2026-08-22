import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Copy, Trash, CheckCircle, Lightning, MagnifyingGlassPlus, MagnifyingGlassMinus,
  Faders, DownloadSimple
} from '@phosphor-icons/react';
import { convertToBrahmi, SpellingMode } from '../engine/brahmiMaps';
import { convertToEBrahmi } from '../engine/eBrahmiMaps';
import { convertToVatteluttu } from '../engine/vatteluttuMaps';

type ScriptType = 'brahmi' | 'vatteluttu';
type FontType = 'adinatha' | 'ebrahmi';

export function ArichuvadiEditor() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [script, setScript] = useState<ScriptType>('brahmi');
  const [font, setFont] = useState<FontType>('adinatha');
  const [spelling, setSpelling] = useState<SpellingMode>('late');
  const [fontSize, setFontSize] = useState(100);
  const outputRef = useRef<HTMLDivElement>(null);

  // Convert on input/settings change
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      return;
    }

    if (script === 'brahmi') {
      if (font === 'adinatha') {
        setOutput(convertToBrahmi(input, spelling));
      } else {
        setOutput(convertToEBrahmi(input));
      }
    } else {
      setOutput(convertToVatteluttu(input));
    }
  }, [input, script, font, spelling]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  }, [output]);

  const handleClear = () => setInput('');

  const handleDownload = useCallback(async () => {
    if (!outputRef.current || !output) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(outputRef.current, { backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `arichuvadi-${script}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [output, script]);

  const getOutputClass = () => {
    if (script === 'vatteluttu') return 'arichuvadi-output-vatteluttu';
    if (font === 'ebrahmi') return 'arichuvadi-output-ebrahmi';
    return 'arichuvadi-output-brahmi';
  };

  return (
    <div className="animate-entry">
      {/* Controls Bar */}
      <div className="arichuvadi-controls">
        <div className="arichuvadi-select-wrap">
          <Faders weight="bold" size={14} />
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

        {script === 'brahmi' && (
          <div className="arichuvadi-select-wrap">
            <label>எழுத்துரு:</label>
            <select
              className="arichuvadi-select"
              value={font}
              onChange={(e) => setFont(e.target.value as FontType)}
            >
              <option value="adinatha">அதிநாத</option>
              <option value="ebrahmi">இ-தமிழி</option>
            </select>
          </div>
        )}

        {script === 'brahmi' && font === 'adinatha' && (
          <div className="arichuvadi-select-wrap">
            <label>எழுத்துமுறை:</label>
            <select
              className="arichuvadi-select"
              value={spelling}
              onChange={(e) => setSpelling(e.target.value as SpellingMode)}
            >
              <option value="early">ஆரம்ப காலம்</option>
              <option value="middle">இடைக்காலம்</option>
              <option value="late">பிற்காலம்</option>
            </select>
          </div>
        )}

        <div className="arichuvadi-zoom-controls">
          <button
            className="arichuvadi-zoom-btn"
            onClick={() => setFontSize(prev => prev + 15)}
            title="பெரிதாக்கு"
          >
            <MagnifyingGlassPlus weight="bold" size={16} />
          </button>
          <button
            className="arichuvadi-zoom-btn"
            onClick={() => setFontSize(prev => Math.max(prev - 15, 50))}
            title="சிறிதாக்கு"
          >
            <MagnifyingGlassMinus weight="bold" size={16} />
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <section className="arichuvadi-grid">
        {/* Input Panel */}
        <div className="category-card static-card" style={{ cursor: 'default', margin: 0 }}>
          <div className="arichuvadi-panel-header">
            <div className="arichuvadi-panel-label">
              <span className="arichuvadi-panel-dot" />
              <h3 className="arichuvadi-panel-title">தமிழ் உள்ளீடு</h3>
            </div>
            <button
              onClick={handleClear}
              disabled={!input}
              className="arichuvadi-btn"
              title="அழி"
            >
              <Trash weight="bold" size={14} />
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="தமிழில் உள்ளிடுக..."
            className="arichuvadi-textarea"
            spellCheck={false}
            lang="ta"
          />
        </div>

        {/* Output Panel */}
        <div className="category-card static-card" style={{ cursor: 'default', margin: 0 }}>
          <div className="arichuvadi-panel-header">
            <div className="arichuvadi-panel-label">
              <span className="arichuvadi-panel-dot active" />
              <h3 className="arichuvadi-panel-title">
                {script === 'brahmi' ? 'தமிழி வெளியீடு' : 'வட்டெழுத்து வெளியீடு'}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="arichuvadi-btn"
                title="படமாக பதிவிறக்கு"
              >
                <DownloadSimple weight="bold" size={14} />
                <span>பதிவிறக்கு</span>
              </button>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={`arichuvadi-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? (
                  <><CheckCircle weight="bold" size={14} /><span>நகலெடுத்தது</span></>
                ) : (
                  <><Copy weight="bold" size={14} /><span>நகலெடு</span></>
                )}
              </button>
            </div>
          </div>

          <div className="arichuvadi-output-display">
            <AnimatePresence mode="wait">
              {output ? (
                <div style={{ fontSize: `${fontSize}%` }} ref={outputRef}>
                  <motion.div
                    key="output"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={getOutputClass()}
                  >
                    {output}
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="arichuvadi-output-placeholder"
                >
                  <Lightning weight="bold" />
                  <p>பண்டைய எழுத்து இங்கே தோன்றும்</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
