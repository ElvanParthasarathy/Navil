/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NoteInfo {
  note: string;
  isBlack: boolean;
  keyboardKey?: string;
  label: string;
}

const SWARAS = [
  { isBlack: false, label: 'ஸ (Sa)' },
  { isBlack: true, label: 'ரி₁ (Ri₁)' },
  { isBlack: false, label: 'ரி₂ (Ri₂)' },
  { isBlack: true, label: 'க₁ (Ga₁)' },
  { isBlack: false, label: 'க₂ (Ga₂)' },
  { isBlack: false, label: 'ம₁ (Ma₁)' },
  { isBlack: true, label: 'ம₂ (Ma₂)' },
  { isBlack: false, label: 'ப (Pa)' },
  { isBlack: true, label: 'த₁ (Dha₁)' },
  { isBlack: false, label: 'த₂ (Dha₂)' },
  { isBlack: true, label: 'நி₁ (Ni₁)' },
  { isBlack: false, label: 'நி₂ (Ni₂)' }
];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function generateKeyboard(startOctave: number = 2, endOctave: number = 6): NoteInfo[] {
  const notes: NoteInfo[] = [];
  
  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (let i = 0; i < 12; i++) {
      if (oct === endOctave && i > 0) break; 
      
      notes.push({
        note: `${NOTE_NAMES[i]}${oct}`,
        isBlack: SWARAS[i].isBlack,
        label: SWARAS[i].label
      });
    }
  }
  return notes;
}

// Complete 61-Key Workstation Array
export const BASE_KEYBOARD: NoteInfo[] = generateKeyboard(2, 7);

// Hardware Layout Definitions
export const LAYOUTS = {
  REALISTIC: {
    name: 'Realistic (Dual Row)',
    startNote: 'C3',
    keys: ['z', 's', 'x', 'd', 'c', 'v', 'g', 'b', 'h', 'n', 'j', 'm', ',', 'l', '.', ';', '/', 'q', '2', 'w', '3', 'e', '4', 'r', 't', '6', 'y', '7', 'u', 'i', '9', 'o', '0', 'p', '-', '[']
  },
  FL_STUDIO: {
    name: 'FL Studio (2-Row)',
    startNote: 'C3',
    keys: ['z','s','x','d','c','v','g','b','h','n','j','m', 'q','2','w','3','e','r','5','t','6','y','7','u', 'i','9','o','0','p','[','=',']']
  },
  LOGIC: {
    name: 'GarageBand / Logic',
    startNote: 'C4',
    keys: ['a','w','s','e','d','f','t','g','y','h','u','j','k','o','l','p',';']
  },
  ABLETON: {
    name: 'Ableton Live',
    startNote: 'C3',
    keys: ['a','w','s','e','d','f','t','g','y','h','u','j','k']
  }
};

export function buildMapFromLayout(layoutKeys: string[], startNote: string): Record<string, string> {
  const map: Record<string, string> = {};
  const startIndex = BASE_KEYBOARD.findIndex(n => n.note === startNote);
  if (startIndex === -1) return map;
  
  for (let i = 0; i < layoutKeys.length; i++) {
    if (startIndex + i < BASE_KEYBOARD.length) {
      map[layoutKeys[i]] = BASE_KEYBOARD[startIndex + i].note;
    }
  }
  return map;
}

