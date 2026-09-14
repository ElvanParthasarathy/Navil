import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import MobileTopBar from '../../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { 
  Translate, 
  Copy, 
  Trash, 
  CheckCircle, 
  Lightning,
  Faders,
  ArrowsLeftRight,
  BookOpen,
  CaretDown
} from "@phosphor-icons/react";
import { transliterate, TransliterationMode, capitalizeWords } from "./பயன்பாடுகள்/மொழிமாற்றம்";
import { englishToTamil } from "./பயன்பாடுகள்/ஆங்கிலம்முதல்தமிழ்";
import { navilToTamil } from "./பயன்பாடுகள்/நவில்முதல்தமிழ்";
import '../../படைப்புகள்/படைப்புகள்.css';
import './மொழிமாற்றி.css';

type ViewMode = 'main' | 'rules';

const getTaEnModeLabel = (m: TransliterationMode) => {
  switch (m) {
    case 'extended++': return 'Navil Engine';
    case 'mode1': return 'Mode 1: ccha / ttha';
    case 'mode2': return 'Mode 2: chch / thth';
    case 'simplified': return 'Mode 3: ch / th';
    default: return 'Navil Engine';
  }
};

const getEnTaModeLabel = (m: 'anjal' | 'navil') => {
  return m === 'anjal' ? 'Anjal Layout' : 'Navil Mode (Beta)';
};

export default function TransliteratorTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [mode, setMode] = useState<TransliterationMode>("extended++");
  const [enTaMode, setEnTaMode] = useState<'anjal' | 'navil'>('navil');
  const [direction, setDirection] = useState<'ta-en' | 'en-ta'>('ta-en');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(raf);
  }, [viewMode]);

  const handleTransliterate = useCallback((text: string, dir: 'ta-en' | 'en-ta', currentMode: TransliterationMode, currentEnTaMode: 'anjal' | 'navil') => {
    if (!text.trim()) {
      setOutput("");
      return;
    }

    if (dir === 'ta-en') {
      const result = transliterate(text, currentMode);
      setOutput(result);
    } else {
      const result = currentEnTaMode === 'anjal' ? englishToTamil(text) : navilToTamil(text);
      setOutput(result);
    }
  }, []);

  useEffect(() => {
    handleTransliterate(input, direction, mode, enTaMode);
  }, [input, direction, mode, enTaMode, handleTransliterate]);

  const handleSwap = () => {
    const nextDir = direction === 'ta-en' ? 'en-ta' : 'ta-en';
    setDirection(nextDir);
    setInput(output);
  };

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
      <MobileTopBar 
        title={viewMode === 'main' ? 'நவில் மொழிமாற்றி|navil transliterator' : 'விதிகள்|rules'} 
        backUrl={viewMode === 'main' ? '/tools' : undefined} 
        onBack={viewMode === 'rules' ? () => setViewMode('main') : undefined}
        isBeta={true}
      />
      <Helmet>
        <title>நவில் மொழிமாற்றி | Navil Transliterator</title>
      </Helmet>
      <FloatingBackButton 
        to={viewMode === 'main' ? '/tools' : undefined} 
        onClick={viewMode === 'rules' ? () => setViewMode('main') : undefined}
      />
    <div className="writings-page page-view fadeIn">

      {viewMode === 'main' ? (
        <>
          {/* Header */}
          <header className="writings-header animate-entry">
            <div style={{ flex: 1 }}>
              <h1 className="writings-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                நவில் மொழிமாற்றி
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
              <div className="writings-title-sub">Navil Transliterator</div>
              <p className="writings-subtitle">
                தொல்காப்பிய இலக்கண நெறிப்படியான மெய்யொலி மாற்றி.
              </p>
              <p className="writings-subtitle writings-subtitle-en">
                Phonetic Latin-to-Tamil typing based on Tolkappiyam.
              </p>
            </div>
          </header>

          {/* Controls row */}
          <div className="translit-controls-row animate-entry">
            <button 
              onClick={() => setDirection(d => d === 'ta-en' ? 'en-ta' : 'ta-en')}
              className="translit-direction-btn"
            >
              <ArrowsLeftRight weight="bold" size={16} />
              {direction === 'ta-en' ? 'Tamil → Latin' : 'Latin → Tamil'}
            </button>
            <button 
              onClick={() => setViewMode('rules')}
              className="translit-direction-btn"
            >
              <BookOpen weight="bold" size={16} />
              விதிகள் / Rules
            </button>
          </div>

          {/* Main editor */}
          <section className="translit-grid animate-entry" style={{ animationDelay: '0.1s' }}>
            {/* Input */}
            <div className="translit-panel category-card static-card" style={{ cursor: 'default', margin: 0 }}>
              <div className="translit-panel-header">
                <div className="translit-panel-label">
                  <span className="translit-panel-dot" />
                  <h3 className="translit-panel-title">
                    {direction === 'ta-en' ? 'தமிழ் உள்ளீடு' : 'Latin உள்ளீடு'}
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
                    {direction === 'ta-en' ? 'Latin வெளியீடு' : 'தமிழ் வெளியீடு'}
                  </h3>
                </div>
                <div className="translit-output-controls">
                  {output && (
                    <button 
                      onClick={handleCopy}
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
                  )}
                  {direction === 'ta-en' ? (
                    <div className="translit-mode-select-wrap">
                      <div className="translit-mode-icon">
                        <Faders weight="bold" size={15} />
                      </div>
                      <span className="translit-mode-label">{getTaEnModeLabel(mode)}</span>
                      <div className="translit-mode-chevron">
                        <CaretDown weight="bold" size={12} />
                      </div>
                      <select 
                        value={mode}
                        onChange={(e) => setMode(e.target.value as TransliterationMode)}
                        className="translit-mode-select"
                        aria-label="Engine Mode"
                      >
                        <option value="extended++">Navil Engine</option>
                        <option value="mode1">Mode 1: ccha / ttha</option>
                        <option value="mode2">Mode 2: chch / thth</option>
                        <option value="simplified">Mode 3: ch / th (Simplified)</option>
                      </select>
                    </div>
                  ) : (
                    <div className="translit-mode-select-wrap">
                      <div className="translit-mode-icon">
                        <Faders weight="bold" size={15} />
                      </div>
                      <span className="translit-mode-label">{getEnTaModeLabel(enTaMode)}</span>
                      <div className="translit-mode-chevron">
                        <CaretDown weight="bold" size={12} />
                      </div>
                      <select 
                        value={enTaMode}
                        onChange={(e) => setEnTaMode(e.target.value as 'anjal' | 'navil')}
                        className="translit-mode-select"
                        aria-label="Typing Layout"
                      >
                        <option value="anjal">Anjal Layout</option>
                        <option value="navil">Navil Mode (Beta)</option>
                      </select>
                    </div>
                  )}
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
        </>
      ) : (
        /* Rules Sub-View */
        <div className="translit-rules-view animate-entry">
          <header className="writings-header">
            <div style={{ flex: 1 }}>
              <h1 className="writings-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                விதிகள்
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
              <div className="writings-title-sub">Rules</div>
              <p className="writings-subtitle">
                {direction === 'ta-en' 
                  ? 'தமிழ் → லத்தீன் ஒலிபெயர்ப்பு விதிகள்.'
                  : enTaMode === 'anjal' 
                    ? 'Anjal Layout விசைப்பலகை விதிகள்.'
                    : 'Navil Mode விசைப்பலகை விதிகள்.'
                }
              </p>
              <p className="writings-subtitle writings-subtitle-en">
                {direction === 'ta-en'
                  ? 'Tamil → Latin transliteration rules based on Tolkappiyam phonology.'
                  : enTaMode === 'anjal'
                    ? 'Anjal Key Layout mapping rules.'
                    : 'Navil Mode key mapping rules.'
                }
              </p>
            </div>
          </header>

          <div className="translit-rules-content category-card static-card" style={{ cursor: 'default', margin: 0 }}>
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
                <RuleItem label="1. ஆய்த எழுத்து (தொல். 38)" desc="ஃ பின் வல்லினம் கடினமாகும்: எஃகு (Ehku), அஃது (Ahthu), அஃறிணை (Ahtrinai), கஃசு (Kahchu)" />
                <RuleItem label="2. வல்லின மெய் (ட், ற்)" desc="கடின வல்லினம் மட்டும்: முயற்சி (Muyarchi), பொற்காசு (Porkaasu), வெட்கம் (Vetkam), நட்பு (Natpu)" />
                <RuleItem label="3. இணை எழுத்துகள்" desc="மெல்லினம்+வல்லினம் இயல்பாக மெலியும்: தங்கம் (ng), பஞ்சு (nj), வண்டு (nd), பந்து (ndh), கன்று (ndr)" />
                <RuleItem label="4. வேற்று மெல்லின மயக்கம்" desc="இணை அல்லாத மெல்லினம் கடினமாகும்: நான்கு (Naanku), கண்காணி (Kankaani); ஒற்றை 'ச' மட்டும் 's' ஆக ஒலிக்கும்: மின்சாரம் (Minsaaram), அம்சம் (Amsam)" />
                <RuleItem label="5. பகாப்பதம் vs தொகை" desc="வேர்ச்சொல் மெலியும்: அன்பு (b), முன்பு (b); தொகைச்சொல் கடினம்: முன்பக்கம் (p), பின்பக்கம் (p), என்பக்கம் (p)" />
                <RuleItem label="6. எண்கள் (-பது ஈறு)" desc="பத்து எண் ஈறு மெலியும்: எண்பது (Enbadhu), ஒன்பது (Onbadhu), பத்தொன்பது (Pathonbadhu), இருபது (b)" />
                <RuleItem label="7. உயிர் இடை மெலிதல்" desc="உயிர் நடுவே வல்லினம் மெலியும்: அகம் (g), படம் (d), மதம் (dh), இருபது (b), தொன்றுதொட்டு (Thondrudhottu)" />
                <RuleItem label="8. இடையின மெலிதல்" desc="ய், ர், ல், ழ் பின் வல்லினம் மெலியும்: பல்கலை (Palgalai), வாழ்க (Vaazhga), இயல்பு (b), மார்பு (b)" />
                <RuleItem label="9. பன்மை விகுதி (-கள்)" desc="மெல்லினம்/இடையினம் பின் gal (கண்கள், கால்கள்); வல்லின ஒற்றுப் பின் kal (கற்கள், நாட்கள்)" />
                <RuleItem label="10. வருமொழி முதனிலை" desc="வருமொழி முதல் வல்லினம் நிலைக்கும்: மறுபிறவி (Marupiravi), நிலைபெற்றுள்ள (p), கண்டுபிடி (p)" />
                <RuleItem label="11. இடைச்சொற்கள்" desc="கூட (kooda), தான் (avandhaan), போல் (thooralpoal), போது (வந்தபோது - vandhaboadhu)" />
                <RuleItem label="12. சொல் முதன்மை 'ச'" desc="சொல் தொடக்கத்தில் தூய 'ch' ஒலிப்பு: சென்னை (Chennai), சரி (Chari), சாப்பாடு (Chaappaadu)" />
                <RuleItem label="13. மிகை ஒற்று நீக்கம்" desc="ற், ட் பின் மிகை வல்லொற்று நீக்கப்படும்: பொற்க்காசு → Porkaasu, முயற்ச்சி → Muyarchi" />
                <RuleItem label="14. ரோமன் பேரெழுத்தாக்கம்" desc="வாசிப்புத் தெளிவிற்காக அனைத்துச் சொற்களின் முதல் எழுத்தும் பேரெழுத்தாக (Title Case) அமையும்" />
                <div className="translit-rules-note">
                  * தொல்காப்பிய எழுத்ததிகாரம் & சொல்லதிகாரத்தின் அக்மார்க் ஒலியியல் விதிகளை அடிப்படையாகக் கொண்ட தூய தமிழ் ஒலிபெயர்ப்பு எஞ்சின். Runs 100% offline inside your browser.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
