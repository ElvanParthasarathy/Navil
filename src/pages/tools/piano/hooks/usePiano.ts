import { useEffect, useRef, useState, useMemo } from 'react';
import * as Tone from 'tone';
import { BASE_KEYBOARD, LAYOUTS, buildMapFromLayout, NoteInfo } from '../constants';

export const SYNTH_PRESETS = [
  { id: '001', name: 'Grand Piano (SAMPLED)' },
  { id: '002', name: 'DX7 E.Piano (FM)' },
  { id: '003', name: 'Tonewheel Organ' },
  { id: '004', name: 'Lush Analog Pad' },
  { id: '005', name: 'CS-80 Brass' },
  { id: '006', name: 'Moog Lead' }
];

export type KeyLayoutMode = 'REALISTIC' | 'FL_STUDIO' | 'LOGIC' | 'ABLETON' | 'CUSTOM';

export function usePiano() {
  const activeInstrumentRef = useRef<Tone.PolySynth | Tone.Sampler | null>(null);
  
  // Effects Chain
  const reverbRef = useRef<Tone.Freeverb | null>(null);
  const chorusRef = useRef<Tone.Chorus | null>(null);
  const delayRef = useRef<Tone.FeedbackDelay | null>(null);
  const eqRef = useRef<Tone.EQ3 | null>(null);
  
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [octaveShift, setOctaveShift] = useState(0);
  const [midiIn, setMidiIn] = useState<string | null>(null);
  const [currentPatch, setCurrentPatch] = useState('001');
  const [pitchBend, setPitchBend] = useState(0);

  // Mapping State
  const [layoutMode, setLayoutMode] = useState<KeyLayoutMode>('REALISTIC');
  const [customMap, setCustomMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('keyboard_custom_map');
    return saved ? JSON.parse(saved) : {};
  });
  const [assignTargetNote, setAssignTargetNote] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (layoutMode === 'CUSTOM') {
      localStorage.setItem('keyboard_custom_map', JSON.stringify(customMap));
    }
  }, [customMap, layoutMode]);

  const activeKeyMap = useMemo(() => {
    if (layoutMode === 'CUSTOM') return customMap;
    const layoutDef = LAYOUTS[layoutMode as keyof typeof LAYOUTS];
    return buildMapFromLayout(layoutDef.keys, layoutDef.startNote);
  }, [layoutMode, customMap]);

  const mappedKeyboard = useMemo<NoteInfo[]>(() => {
    return BASE_KEYBOARD.map(noteInfo => {
      const physicalKey = Object.keys(activeKeyMap).find(k => activeKeyMap[k] === noteInfo.note);
      return { ...noteInfo, keyboardKey: physicalKey };
    });
  }, [activeKeyMap]);

  useEffect(() => {
    // Professional Audio Chain: Instrument -> EQ -> Chorus -> Delay -> Reverb -> Destination
    reverbRef.current = new Tone.Freeverb({ roomSize: 0.8, dampening: 4000, wet: 0.3 }).toDestination();
    delayRef.current = new Tone.FeedbackDelay("8n", 0.4).connect(reverbRef.current);
    delayRef.current.wet.value = 0; // default off
    chorusRef.current = new Tone.Chorus({ frequency: 2.5, delayTime: 3.5, depth: 0.8, wet: 0 }).connect(delayRef.current);
    eqRef.current = new Tone.EQ3({ low: 2, mid: -1, high: 2 }).connect(chorusRef.current);

    // Default start off with piano
    changeInstrument('001');

    return () => {
      activeInstrumentRef.current?.dispose();
      reverbRef.current?.dispose();
      chorusRef.current?.dispose();
      delayRef.current?.dispose();
      eqRef.current?.dispose();
    };
  }, []);

  const changeInstrument = async (patchId: string) => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    
    setIsLoading(true);
    setCurrentPatch(patchId);
    
    // Cleanup previous synth/sampler
    if (activeInstrumentRef.current) {
      activeInstrumentRef.current.dispose();
      activeInstrumentRef.current = null;
    }

    // Configure effects per patch
    if (chorusRef.current && delayRef.current && reverbRef.current) {
      chorusRef.current.wet.value = 0;
      delayRef.current.wet.value = 0;
      reverbRef.current.wet.value = 0.2; // default
    }

    try {
      if (patchId === '001') {
        const sampler = new Tone.Sampler({
          urls: {
            A0: "A0.mp3", C1: "C1.mp3", "D#1": "Ds1.mp3", "F#1": "Fs1.mp3",
            A1: "A1.mp3", C2: "C2.mp3", "D#2": "Ds2.mp3", "F#2": "Fs2.mp3",
            A2: "A2.mp3", C3: "C3.mp3", "D#3": "Ds3.mp3", "F#3": "Fs3.mp3",
            A3: "A3.mp3", C4: "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3",
            A4: "A4.mp3", C5: "C5.mp3", "D#5": "Ds5.mp3", "F#5": "Fs5.mp3",
            A5: "A5.mp3", C6: "C6.mp3", "D#6": "Ds6.mp3", "F#6": "Fs6.mp3",
            A6: "A6.mp3", C7: "C7.mp3", "D#7": "Ds7.mp3", "F#7": "Fs7.mp3",
            A7: "A7.mp3", C8: "C8.mp3"
          },
          release: 1.2,
          baseUrl: "https://tonejs.github.io/audio/salamander/",
          onload: () => {
            setIsReady(true);
            setIsLoading(false);
          }
        }).connect(eqRef.current!);
        if(reverbRef.current) reverbRef.current.wet.value = 0.35;
        activeInstrumentRef.current = sampler;
        
      } else {
        let synth: Tone.PolySynth;
        
        switch(patchId) {
          case '002':
            synth = new Tone.PolySynth(Tone.FMSynth, {
              harmonicity: 1.0,
              modulationIndex: 3.5,
              oscillator: { type: "sine" },
              envelope: { attack: 0.01, decay: 2.0, sustain: 0.2, release: 1.5 },
              modulation: { type: "sine" },
              modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.5 }
            });
            if(chorusRef.current) chorusRef.current.wet.value = 0.6;
            break;
            
          case '003':
            synth = new Tone.PolySynth(Tone.FMSynth, {
              harmonicity: 2.01,
              modulationIndex: 1.2,
              oscillator: { type: "sine" },
              envelope: { attack: 0.01, decay: 0.1, sustain: 1.0, release: 0.1 },
              modulation: { type: "square" }
            });
            if(chorusRef.current) {
              chorusRef.current.frequency.value = 6;
              chorusRef.current.depth.value = 1;
              chorusRef.current.wet.value = 0.5;
            }
            break;
            
          case '004':
            synth = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "fatsawtooth", count: 4, spread: 40 } as any,
              envelope: { attack: 1.5, decay: 1.0, sustain: 0.8, release: 3.0 }
            });
            if(chorusRef.current) chorusRef.current.wet.value = 0.8;
            if(reverbRef.current) reverbRef.current.wet.value = 0.7;
            break;
            
          case '005':
            synth = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "fatsawtooth", count: 3, spread: 20 } as any,
              envelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 0.8 }
            });
            if(delayRef.current) delayRef.current.wet.value = 0.2;
            if(reverbRef.current) reverbRef.current.wet.value = 0.4;
            break;
            
          case '006':
            synth = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "fatsquare", count: 2, spread: 10 } as any,
              envelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.1 }
            });
            if(delayRef.current) delayRef.current.wet.value = 0.4;
            break;
            
          default:
            synth = new Tone.PolySynth();
        }
        
        synth.connect(eqRef.current!);
        activeInstrumentRef.current = synth;
        setIsReady(true);
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const playNote = async (note: string, velocity: number = 0.8) => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    if (activeInstrumentRef.current && isReady) {
      const shiftedNote = shiftNote(note, octaveShift);
      const freq = Tone.Frequency(shiftedNote).toFrequency();
      const bendedFreq = freq * Math.pow(2, (pitchBend * 2) / 12); 
      
      if (activeInstrumentRef.current.name === 'Sampler') {
         if (pitchBend !== 0) {
           (activeInstrumentRef.current as Tone.Sampler).triggerAttack(String(bendedFreq), Tone.now(), velocity);
         } else {
           (activeInstrumentRef.current as Tone.Sampler).triggerAttack(shiftedNote, Tone.now(), velocity);
         }
      } else {
         (activeInstrumentRef.current as Tone.PolySynth).triggerAttack(String(bendedFreq), Tone.now(), velocity);
      }
      
      setActiveNotes((prev) => new Set(prev).add(note));
    }
  };

  const stopNote = (note: string) => {
    if (activeInstrumentRef.current && isReady) {
      const shiftedNote = shiftNote(note, octaveShift);
      const freq = Tone.Frequency(shiftedNote).toFrequency();
      const bendedFreq = freq * Math.pow(2, (pitchBend * 2) / 12);
      
      if (activeInstrumentRef.current.name === 'Sampler') {
          if (pitchBend !== 0) {
            (activeInstrumentRef.current as Tone.Sampler).triggerRelease(String(bendedFreq));
          } else {
            (activeInstrumentRef.current as Tone.Sampler).triggerRelease(shiftedNote);
          }
      } else {
          (activeInstrumentRef.current as Tone.PolySynth).triggerRelease(String(bendedFreq));
      }
      
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  useEffect(() => {
    if (activeInstrumentRef.current && activeInstrumentRef.current.name !== 'Sampler') {
       (activeInstrumentRef.current as Tone.PolySynth).set({ detune: pitchBend * 200 });
    }
  }, [pitchBend]);

  const shiftNote = (note: string, shift: number) => {
    if (shift === 0) return note;
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return note;
    const [_, pitch, octave] = match;
    const newOctave = parseInt(octave) + shift;
    return `${pitch}${newOctave}`;
  };

  // MIDI Support
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then((access) => {
        const inputs = access.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
          setMidiIn(input.value.name);
          input.value.onmidimessage = (message: any) => {
            const [command, noteNum, velocity] = message.data;
            if (command === 144 && velocity > 0) {
              const octave = Math.floor(noteNum / 12) - 1;
              const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
              const pitch = noteNames[noteNum % 12];
              const noteName = `${pitch}${octave}`;
              playNote(noteName, velocity / 127);
            } else if (command === 128 || (command === 144 && velocity === 0)) {
              const octave = Math.floor(noteNum / 12) - 1;
              const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
              const pitch = noteNames[noteNum % 12];
              const noteName = `${pitch}${octave}`;
              stopNote(noteName);
            } else if (command === 224) {
              const lsb = noteNum;
              const msb = velocity;
              const val = (msb << 7) | lsb;
              const normalized = (val - 8192) / 8192;
              setPitchBend(normalized);
            }
          };
        }
      });
    }
  }, [octaveShift, currentPatch, pitchBend, isReady]);

  // Keyboard Mapping Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      
      // Handle mapping assignment interception
      if (isAssigning && assignTargetNote) {
        e.preventDefault();
        if (key === 'escape') {
          setAssignTargetNote(null);
          return;
        }
        setCustomMap(prev => {
          const newMap = { ...prev };
          // Remove if this key is mapped elsewhere
          if (newMap[key]) delete newMap[key];
          newMap[key] = assignTargetNote;
          return newMap;
        });
        setAssignTargetNote(null);
        return;
      }
      
      // Use Arrow keys to guarantee shift doesn't crash with custom maps
      if (e.key === 'ArrowDown') setOctaveShift(prev => Math.max(prev - 1, -2));
      if (e.key === 'ArrowUp') setOctaveShift(prev => Math.min(prev + 1, 2));

      // Note check from current mapped keys
      const note = activeKeyMap[key];
      if (note && !isAssigning) {
        playNote(note);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const note = activeKeyMap[key];
      if (note && !isAssigning) {
        stopNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [octaveShift, activeKeyMap, isReady, pitchBend, isAssigning, assignTargetNote]);

  return {
    playNote,
    stopNote,
    activeNotes,
    isReady,
    isLoading,
    changeInstrument,
    currentPatch,
    octaveShift,
    setOctaveShift,
    midiIn,
    pitchBend,
    setPitchBend,
    mappedKeyboard,
    layoutMode,
    setLayoutMode,
    isAssigning,
    setIsAssigning,
    assignTargetNote,
    setAssignTargetNote,
    setCustomMap
  };
}
