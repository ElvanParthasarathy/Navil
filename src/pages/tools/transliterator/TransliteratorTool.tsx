import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import MobileTopBar from '../../../components/ui/MobileTopBar';
import { FloatingBackButton } from '../../../components/ui/FloatingBackButton';
import { 
  Translate, 
  Copy, 
  Trash, 
  Info, 
  CheckCircle, 
  Lightning,
  Faders,
  ArrowsLeftRight
} from "@phosphor-icons/react";
import { transliterate, TransliterationMode } from "./utils/transliterate";
import { englishToTamil } from "./utils/englishToTamil";
import { navilToTamil } from "./utils/navilToTamil";
import '../../Writings.css';
import './transliterator.css';

export default function TransliteratorTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [mode, setMode] = useState<TransliterationMode>("extended++");
  const [enTaMode, setEnTaMode] = useState<'anjal' | 'navil'>('navil');
  const [direction, setDirection] = useState<'ta-en' | 'en-ta'>('ta-en');

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    
    if (direction === 'ta-en') {
      setOutput(transliterate(input, mode));
    } else {
      if (enTaMode === 'anjal') {
        setOutput(englishToTamil(input));
      } else {
        setOutput(navilToTamil(input));
      }
    }
  }, [input, mode, direction, enTaMode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }, [output]);

  const handleClear = () => {
    setInput("");
  };

  return (
    <>
      <MobileTopBar title="உருமாற்றி|transliterator" />
      <Helmet>
        <title>Navil Transliterator | Elvan Navil</title>
      </Helmet>
      <FloatingBackButton to="/tools" />
      <style>{`
        .main-content {
          overflow: visible !important;
        }
      `}</style>
    <div className="writings-page page-view fadeIn">
      
      {/* Header matching Writings page */}
      <header className="writings-header animate-entry" style={{ marginBottom: '32px' }}>
          <div style={{ flex: 1 }}>
              <h1 className="writings-title">Navil Transliterator</h1>
              <div className="writings-title-sub">Phonetic Engine</div>
              <p className="writings-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                A fully offline phonetic transliteration engine.
                <button 
                  onClick={() => setDirection(d => d === 'ta-en' ? 'en-ta' : 'ta-en')}
                  className="translit-direction-btn"
                  style={{ margin: 0 }}
                >
                  <ArrowsLeftRight weight="bold" size={16} />
                  {direction === 'ta-en' ? 'Tamil to English' : 'English to Tamil'}
                </button>
                <button 
                  onClick={() => setShowInfo(!showInfo)}
                  className={`translit-info-btn ${showInfo ? 'active' : ''}`}
                  style={{ padding: '8px', background: 'var(--bg-panel)', borderRadius: '50%', margin: 0, display: 'flex' }}
                  title="Show rules and info"
                >
                  <Info weight="bold" size={20} />
                </button>
              </p>
          </div>
      </header>

        {/* Main editor */}
        <section className="translit-grid animate-entry" style={{ animationDelay: '0.1s' }}>
          {/* Input */}
          <div className="translit-panel category-card static-card" style={{ cursor: 'default', margin: 0 }}>
            <div className="translit-panel-header">
              <div className="translit-panel-label">
                <span className="translit-panel-dot" />
                <h3 className="translit-panel-title">
                  {direction === 'ta-en' ? 'Input Tamil' : 'Input English (Anjal)'}
                </h3>
              </div>
              <button 
                onClick={handleClear}
                disabled={!input}
                className="translit-clear-btn"
                title="Clear all"
              >
                <Trash weight="bold" size={16} />
              </button>
            </div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === 'ta-en' ? "செந்தமிழ்..." : (enTaMode === 'anjal' ? "type in anjal layout..." : "type in navil mode...")}
              className="translit-textarea"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="translit-panel category-card static-card" style={{ cursor: 'default', margin: 0 }}>
            <div className="translit-panel-header">
              <div className="translit-panel-label">
                <span className="translit-panel-dot active" />
                <h3 className="translit-panel-title">
                  {direction === 'ta-en' ? 'Phonetic Reference' : 'தமிழ் Output'}
                </h3>
              </div>
              <div className="translit-output-controls">
                {direction === 'ta-en' ? (
                  <div className="translit-mode-select-wrap">
                    <div className="translit-mode-icon">
                      <Faders weight="bold" size={14} />
                    </div>
                    <select 
                      value={mode}
                      onChange={(e) => setMode(e.target.value as TransliterationMode)}
                      className="translit-mode-select"
                    >
                      <option value="extended++">Elvan Navil Engine</option>
                      <option value="mode1">Mode 1: ccha / ttha</option>
                      <option value="mode2">Mode 2: chch / thth</option>
                      <option value="simplified">Mode 3: ch / th (Simplified)</option>
                    </select>
                  </div>
                ) : (
                  <div className="translit-mode-select-wrap">
                    <div className="translit-mode-icon">
                      <Faders weight="bold" size={14} />
                    </div>
                    <select 
                      value={enTaMode}
                      onChange={(e) => setEnTaMode(e.target.value as 'anjal' | 'navil')}
                      className="translit-mode-select"
                    >
                      <option value="anjal">Anjal Layout</option>
                      <option value="navil">Navil Mode</option>
                    </select>
                  </div>
                )}
                <button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={`translit-copy-btn ${copied ? 'copied' : ''}`}
                >
                  {copied ? (
                    <>
                      <CheckCircle weight="bold" size={14} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy weight="bold" size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="translit-output-display">
              <AnimatePresence mode="wait">
                {output ? (
                  <motion.div
                    key="output-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`translit-output-text ${direction === 'ta-en' ? 'mono' : ''}`}
                  >
                    {output}
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="translit-output-placeholder"
                  >
                    <Lightning weight="bold" />
                    <p>Awaiting Script Input</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

          {/* Rules & Info */}
          <AnimatePresence>
            {showInfo && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="translit-rules category-card static-card"
                style={{ overflow: 'hidden', cursor: 'default' }}
              >
                {direction === 'en-ta' ? (
                  enTaMode === 'anjal' ? (
                    <div className="translit-rules-grid">
                      <RuleItem label="Vowels" desc="a அ, aa/A ஆ, i இ, ii/I ஈ, u உ, uu/U ஊ" />
                      <RuleItem label="Vowels 2" desc="e எ, ee/E ஏ, ai ஐ, o ஒ, oo/O ஓ, au ஔ" />
                      <RuleItem label="Consonants" desc="k க, c/s ச, d ட, t த, p ப, R ற" />
                      <RuleItem label="Nasals" desc="ng ங, nj ஞ, N ண, w/n- ந, m ம, n/W ன" />
                      <RuleItem label="Others" desc="y ய, r ர, l ல, v வ, z ழ, L ள" />
                      <RuleItem label="Grantha" desc="h ஹ, S ஸ, j ஜ, sh ஷ, x க்ஷ, sri ஶ்ரீ" />
                      <RuleItem label="ndr → ன்ற்" desc="mandram → மன்றம்" />
                      <RuleItem label="tr → ற்ற்" desc="patru → பற்று" />
                      <RuleItem label="nd → ண்ட்" desc="kandu → கண்டு" />
                      <RuleItem label="nt → ந்த்" desc="vantu → வந்து" />
                      <RuleItem label="njj → ஞ்ச்" desc="manjjaL → மஞ்சள்" />
                      <RuleItem label="f = Escape" desc="afa → அஅ, eenfdaa → ஏன்டா" />
                      <div className="translit-rules-note">
                        Anjal Key Layout by Muthu Nedumaran (1993). Runs completely offline.
                      </div>
                    </div>
                  ) : (
                    <div className="translit-rules-grid">
                      <RuleItem label="Vowels" desc="a அ, aa/A/ee/ii/I ஈ, u உ, uu/U/oo ஊ" />
                      <RuleItem label="Vowels 2" desc="e எ, ae/E ஏ, ai ஐ, o ஒ, oa/O ஓ, au ஔ" />
                      <RuleItem label="Consonants" desc="k க, c/ch ச, d/t ட, th/dh த, p ப, R/rr ற" />
                      <RuleItem label="Nasals" desc="ng ங, nj ஞ, N ண, w ந, m ம, n ன" />
                      <RuleItem label="Others" desc="y ய, r ர, l ல, v வ, z/zh ழ, L ள" />
                      <RuleItem label="Grantha" desc="h ஹ, s/S(ஶ்) ஸ்/ஶ், j ஜ, sh ஷ, ksh க்ஷ, sri/sree ஶ்ரீ" />
                      <RuleItem label="ndr/ntr → ன்ற்" desc="mandram/mantram → மன்றம்" />
                      <RuleItem label="tr → ற்ற்" desc="patru → பற்று" />
                      <RuleItem label="nd → ண்ட்" desc="kandu → கண்டு" />
                      <RuleItem label="nt → ந்த்" desc="vantu → வந்து" />
                      <RuleItem label="njj → ஞ்ச்" desc="manjjaL → மஞ்சள்" />
                      <RuleItem label="f = Escape" desc="afa → அஅ, eenfdaa → ஏன்டா" />
                      <div className="translit-rules-note">
                        Navil Mode: Modernized Anjal layout modifications. Runs completely offline.
                      </div>
                    </div>
                  )
                ) : (
                  <div className="translit-rules-grid">
                    <RuleItem label="Vowels (ஆ/ஓ)" desc="End variants: Ah, oh" />
                    <RuleItem label="Stops (க/ச/ட)" desc="Softens in middle: ga, sa, da" />
                    <RuleItem label="Stops (த/ப/ற)" desc="Softens: dha, ba, ra" />
                    <RuleItem label="Geminate" desc="Hard Doubled: kka, ccha, ppa" />
                    <RuleItem label="Nasal Fusions" desc="anbu(b), nandri(ndr)" />
                    <RuleItem label="Grantha Rule" desc="ஜ/ஷ words: No softening" />
                    <RuleItem label="Special: ற" desc="vetri(tr), kaatru(tr)" />
                    <div className="translit-rules-note">
                      * Note: This engine runs completely offline inside your browser. No data leaves your device.
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

      <footer className="translit-footer">
        <div className="translit-footer-label">
          <span className="translit-footer-dot" />
          <span className="translit-footer-text">Engine v1.0 Production Mode</span>
        </div>
        <span className="translit-footer-text">Crafted for Tamil precision</span>
      </footer>
    </div>
    </>
  );
}

function RuleItem({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="translit-rule-item">
      <h3 className="translit-rule-label">{label}</h3>
      <p className="translit-rule-desc">{desc}</p>
    </div>
  );
}
