import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePiano, SYNTH_PRESETS, KeyLayoutMode } from '../hooks/usePiano';
import { PianoKeys } from '@phosphor-icons/react';

export function Piano() {
  const { 
    playNote, stopNote, activeNotes, isReady, changeInstrument, 
    currentPatch, octaveShift, setOctaveShift, midiIn, pitchBend, setPitchBend,
    mappedKeyboard, layoutMode, setLayoutMode,
    isAssigning, setIsAssigning, assignTargetNote, setAssignTargetNote, setCustomMap
  } = usePiano();

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Keyboard Chassis */}
      <div className="hw-panel w-full rounded-xl flex flex-col relative" style={{ height: '520px' }}>
        
        {/* Mapping Mode Overlay Banner */}
        {isAssigning && (
           <div className="absolute top-0 left-0 w-full h-[60px] bg-red-600/90 z-50 rounded-t-xl flex items-center justify-center text-white px-6 shadow-lg backdrop-blur-sm border-b border-white/20">
             <PianoKeys weight="regular" className="w-5 h-5 mr-2 text-white" />
             {assignTargetNote ? (
                <span className="font-bold text-sm md:text-lg">விசையை அழுத்தவும் - ஒலிக்குறிப்பு: {assignTargetNote}</span>
             ) : (
                <span className="font-bold text-sm md:text-lg">கீழே உள்ள விசையைத் தேர்ந்தெடுத்து மேப் செய்யவும். ரத்து செய்ய ESC அழுத்தவும்.</span>
             )}
             <button 
               onClick={() => { setIsAssigning(false); setAssignTargetNote(null); }}
               className="ml-auto bg-black/40 hover:bg-black/60 px-4 py-2 rounded text-sm font-bold uppercase transition-colors"
             >
               முடிந்தது
             </button>
           </div>
        )}

        {/* Top Control Panel */}
        <div className="h-48 md:h-56 shrink-0 flex flex-col justify-between p-4 md:p-6 relative z-10 border-b-[3px] border-[#0d0d0f]">
          
          {/* Top Edge Brand + Speaker Grill */}
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col items-center opacity-40">
              <div className="flex gap-1.5">
                {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1.5 h-10 bg-black rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)]" />)}
              </div>
            </div>
            
            <div className="text-center absolute left-1/2 -translate-x-1/2 top-4">
              <div className="font-sans font-black tracking-[0.1em] text-2xl text-white/90 drop-shadow-md italic pr-2">
                விசைப்பாய்வு
              </div>
              <div className="text-[10px] tracking-widest text-[var(--color-red-accent)] font-bold mt-1 uppercase">மின்னணு இசைத்தொகுப்பி</div>
            </div>

            <div className="flex flex-col items-center opacity-40 hidden md:flex">
              <div className="flex gap-1.5">
                {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1.5 h-10 bg-black rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)]" />)}
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex justify-between items-end w-full px-2 mt-4 space-x-4">
            
            {/* Left Controls (Wheels & Octave) */}
            <div className="flex gap-6 items-end">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold">சுருதி வளைவு</span>
                <div className="w-8 h-24 bg-black rounded-sm relative shadow-inner overflow-hidden flex items-center justify-center">
                   <div 
                    className="w-8 h-8 bg-[#1a1b1f] border-t border-[#4a4d55] border-b-4 border-black rounded shadow-md absolute" 
                    style={{ transform: `translateY(${pitchBend * -24}px)` }}
                   />
                   <div className="absolute inset-0 shadow-[inset_0_5px_10px_rgba(0,0,0,0.9)] pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <span className="text-[9px] uppercase tracking-wider text-white/50 font-bold">அடுக்கம் (↓/↑)</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setOctaveShift(prev => Math.max(prev - 1, -2))}
                    className="hw-button w-10 h-8 rounded text-white/80 font-bold flex items-center justify-center text-xs cursor-pointer"
                  >-1</button>
                  <button 
                    onClick={() => setOctaveShift(prev => Math.min(prev + 1, 2))}
                    className="hw-button w-10 h-8 rounded text-white/80 font-bold flex items-center justify-center text-xs cursor-pointer"
                  >+1</button>
                </div>
              </div>
            </div>

            {/* Central LCD Display & Mapping Box */}
            <div className="flex-1 flex flex-col items-center gap-2 max-w-[280px]">
              <div className="lcd-screen w-full h-[80px] p-2 flex flex-col justify-between cursor-pointer relative" onClick={() => !isReady && changeInstrument('001')}>
                <div className="flex justify-between items-start">
                  <div className="uppercase text-[10px] opacity-80 font-bold tracking-widest">
                    {midiIn ? `மிடி: ${midiIn.substring(0,10)}` : 'மிடி: முடக்கம்'}
                  </div>
                  <div className="uppercase text-[10px] opacity-80 font-bold tracking-widest">
                    {isReady ? 'இணைப்பில்' : 'துவங்க அழுத்துக'}
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                   <div className="text-2xl font-bold tracking-widest pl-1 uppercase flex gap-2 items-end">
                     <span>{SYNTH_PRESETS.find(p => p.id === currentPatch)?.id || '000'}</span>
                     <span className="text-[12px] opacity-80 mb-[4px] truncate max-w-[100px]">{SYNTH_PRESETS.find(p => p.id === currentPatch)?.name.substring(0,10)}</span>
                   </div>
                   <div className="text-right">
                     <div className="text-[9px] opacity-80 mb-0.5 font-bold tracking-widest">அடு</div>
                     <div className="font-bold text-sm">{(octaveShift > 0 ? '+' : '') + octaveShift}</div>
                   </div>
                </div>
                {!isReady && <div className="absolute inset-0 bg-var(--color-lcd-bg) bg-opacity-50 flex items-center justify-center animate-pulse"><span className="bg-[#809c80] text-[#1a2c1a] px-2 py-1 border border-[#1a2c1a]">துவங்க அழுத்துக</span></div>}
              </div>

              {/* Layout Mapping controls situated right below the LCD screen cleanly */}
              <div className="w-full flex justify-between items-center bg-black/20 rounded-md p-1 border border-white/5">
                <span className="text-[9px] text-white/40 tracking-widest pl-1">விசை அமைப்பு:</span>
                <select 
                   className="bg-transparent text-white/70 text-[10px] uppercase font-bold outline-none cursor-pointer"
                   value={layoutMode}
                   onChange={(e) => setLayoutMode(e.target.value as KeyLayoutMode)}
                 >
                   <option value="REALISTIC" className="text-black">மெய்யான (இரட்டை)</option>
                   <option value="FL_STUDIO" className="text-black">FL ஸ்டுடியோ</option>
                   <option value="LOGIC" className="text-black">லாஜிக் / கேரேஜ்பேண்ட்</option>
                   <option value="ABLETON" className="text-black">அபிள்டன் லைவ்</option>
                   <option value="CUSTOM" className="text-black">தனிப்பயன்...</option>
                 </select>
                 {layoutMode === 'CUSTOM' && (
                    <button 
                      onClick={() => setIsAssigning(!isAssigning)}
                      className={`text-[9px] px-2 py-0.5 ml-1 rounded font-bold transition-all ${isAssigning ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'}`}
                    >
                      {isAssigning ? 'நிறுத்து' : 'மேப்'}
                    </button>
                 )}
              </div>
            </div>

            {/* Right Controls (Tone Matrix) */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className="text-[9px] uppercase tracking-wider text-white/50 font-bold mb-1 border-b border-white/10 pb-1">தொனித் தெரிவு</div>
              <div className="grid grid-cols-3 gap-2">
                {SYNTH_PRESETS.map((preset) => (
                  <div key={preset.id} className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={() => changeInstrument(preset.id)}>
                    <div className={`led ${currentPatch === preset.id ? 'active' : ''}`} />
                    <button className={`hw-button w-full h-7 rounded-sm flex items-center justify-center text-[9px] text-white/70 font-bold px-1 overflow-hidden whitespace-nowrap group-active:translate-y-px ${currentPatch === preset.id ? 'active' : ''} cursor-pointer`}>
                      {preset.name.split(' ')[0]}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Keybed Area */}
        <div 
          className="flex-1 bg-[#1a1b1f] rounded-b-xl overflow-x-auto overflow-y-hidden relative flex pb-2 px-2 border-t border-black/50 shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] custom-scroll scroll-smooth"
          ref={(el) => {
             // Quick hack to default scroll position to roughly the middle of the keyboard (C4) on mount
             if (el && el.scrollLeft === 0) {
               el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2 - 100;
             }
          }}
        >
          
          <div className="flex h-full min-w-[2000px] w-full mt-2 relative mr-2">
            {/* White Keys mapped out flex-1 */}
            {mappedKeyboard.map((noteInfo, index) => {
              if (noteInfo.isBlack) return null;
              const isActive = activeNotes.has(noteInfo.note);
              const isTargeting = assignTargetNote === noteInfo.note;
              return (
                <div key={index} className="flex-1 relative h-full">
                  <div 
                    onMouseDown={() => isAssigning ? setAssignTargetNote(noteInfo.note) : playNote(noteInfo.note)}
                    onMouseUp={() => !isAssigning && stopNote(noteInfo.note)}
                    onMouseLeave={() => !isAssigning && stopNote(noteInfo.note)}
                    onTouchStart={(e) => { e.preventDefault(); if(isAssigning) setAssignTargetNote(noteInfo.note); else playNote(noteInfo.note); }}
                    onTouchEnd={(e) => { e.preventDefault(); !isAssigning && stopNote(noteInfo.note); }}
                    className={`key-white w-full h-full flex flex-col justify-end pb-4 items-center cursor-pointer select-none ${isActive ? 'active' : ''} ${isTargeting ? 'shadow-[inset_0_0_0_3px_red]' : ''}`}
                  >
                    <span className="text-[12px] font-black text-black/40 mb-1 pointer-events-none">{noteInfo.keyboardKey?.toUpperCase() || ''}</span>
                    <span className="text-[11px] font-bold text-black/70 pointer-events-none">{noteInfo.label.split(' ')[0]}</span>
                    <span className="text-[9px] font-bold text-black/40 pointer-events-none">{noteInfo.label.split(' ')[1]?.replace(/[()]/g, '')}</span>
                  </div>
                </div>
              );
            })}

            {/* Black Keys Absolutely Positioned */}
            {mappedKeyboard.map((noteInfo, index) => {
              if (!noteInfo.isBlack) return null;
              const isActive = activeNotes.has(noteInfo.note);
              const isTargeting = assignTargetNote === noteInfo.note;
              
              const totalWhiteKeys = mappedKeyboard.filter(n => !n.isBlack).length;
              const whiteKeyWidthPct = 100 / totalWhiteKeys;
              
              let whitesBefore = 0;
              for(let i=0; i<index; i++) { if(!mappedKeyboard[i].isBlack) whitesBefore++; }
              
              const bkWidth = whiteKeyWidthPct * 0.65;
              const leftPct = (whitesBefore * whiteKeyWidthPct) - (bkWidth / 2);

              return (
                <div 
                  key={index}
                  onMouseDown={() => isAssigning ? setAssignTargetNote(noteInfo.note) : playNote(noteInfo.note)}
                  onMouseUp={() => !isAssigning && stopNote(noteInfo.note)}
                  onMouseLeave={() => !isAssigning && stopNote(noteInfo.note)}
                  onTouchStart={(e) => { e.preventDefault(); if(isAssigning) setAssignTargetNote(noteInfo.note); else playNote(noteInfo.note); }}
                  onTouchEnd={(e) => { e.preventDefault(); !isAssigning && stopNote(noteInfo.note); }}
                  className={`key-black absolute top-0 h-[65%] cursor-pointer select-none flex flex-col justify-end pb-3 items-center ${isActive ? 'active' : ''} ${isTargeting ? 'shadow-[inset_0_0_0_3px_red] z-20' : ''}`}
                  style={{ left: `${leftPct}%`, width: `${bkWidth}%` }}
                >
                  <span className="text-[11px] font-black text-white/30 mb-1 pointer-events-none">{noteInfo.keyboardKey?.toUpperCase() || ''}</span>
                  <span className="text-[10px] font-bold text-white/70 pointer-events-none">{noteInfo.label.split(' ')[0]}</span>
                  <span className="text-[8px] font-bold text-white/30 pointer-events-none">{noteInfo.label.split(' ')[1]?.replace(/[()]/g, '')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
