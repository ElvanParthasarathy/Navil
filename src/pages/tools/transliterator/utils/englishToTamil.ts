/**
 * Anjal Key Layout Transliteration Engine
 * 
 * Based on the Anjal keyboard layout created by Muthu Nedumaran (1993).
 * Implements the original phonetic mapping plus the March 2015 extensions
 * (vowel rotation and f-escape).
 * 
 * Reference: https://sellinam.com/archives/406
 */

// Tamil Unicode code points
const VOWELS: Record<string, string> = {
  'a':  'அ',
  'aa': 'ஆ', 'A':  'ஆ',
  'i':  'இ',
  'ii': 'ஈ', 'I':  'ஈ',
  'u':  'உ',
  'uu': 'ஊ', 'U':  'ஊ',
  'e':  'எ',
  'ee': 'ஏ', 'E':  'ஏ',
  'ai': 'ஐ',
  'o':  'ஒ',
  'oo': 'ஓ', 'O':  'ஓ',
  'au': 'ஔ',
};

const VOWEL_SIGNS: Record<string, string> = {
  'a':  '',     // inherent vowel, no sign
  'aa': 'ா', 'A':  'ா',
  'i':  'ி',
  'ii': 'ீ', 'I':  'ீ',
  'u':  'ு',
  'uu': 'ூ', 'U':  'ூ',
  'e':  'ெ',
  'ee': 'ே', 'E':  'ே',
  'ai': 'ை',
  'o':  'ொ',
  'oo': 'ோ', 'O':  'ோ',
  'au': 'ௌ',
};

// All Tamil vowel signs for rotation detection
const ALL_VOWEL_SIGNS = new Set([
  'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ'
]);

// All Tamil vowels (standalone) for rotation detection
const ALL_VOWELS = new Set([
  'அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'
]);

const VIRAMA = '்';

// Consonants: base letter + virama
const CONSONANTS: Record<string, string> = {
  'k':  'க்',
  'c':  'ச்',
  's':  'ச்',
  'd':  'ட்',
  't':  'த்',
  'p':  'ப்',
  'b':  'ப்',     // Standard Anjal: b → ப்
  'g':  'க்',     // Standard Anjal: g → க்
  'R':  'ற்',
  'y':  'ய்',
  'r':  'ர்',
  'l':  'ல்',
  'v':  'வ்',
  'z':  'ழ்',
  'L':  'ள்',
  'h':  'ஹ்',
  'S':  'ஸ்',
  'j':  'ஜ்',
  'm':  'ம்',
  'n':  'ன்',
  'W':  'ன்',
  'w':  'ந்',
  'N':  'ண்',
  'q':  'ஃ',
};

// Multi-char consonant combos (processed before singles)
const COMPOUND_CONSONANTS: Record<string, string> = {
  'ng':  'ங்',
  'nj':  'ஞ்',
  'sh':  'ஷ்',
  'sri': 'ஶ்ரீ',
  'x':   'க்ஷ்',
  'n-':  'ந்',     // Standard Anjal: n- → ந்
};

// Special compound rules (Anjal rules 3-8)
const SPECIAL_COMPOUNDS: Record<string, string> = {
  'ndr': 'ன்ற்',    // Rule 3: ன்ற் 
  'tr':  'ற்ற்',    // Rule 4: ற்ற்
  'nd':  'ண்ட்',    // Rule 5: ண்ட்
  'nt':  'ந்த்',    // Rule 6: ந்த்
  'njj': 'ஞ்ச்',    // Rule 7: ஞ்ச்
};

// Sorted keys for greedy matching: longest first
const SPECIAL_KEYS = Object.keys(SPECIAL_COMPOUNDS).sort((a, b) => b.length - a.length);
const COMPOUND_KEYS = Object.keys(COMPOUND_CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);

/**
 * Check if a character is a Tamil consonant base (without virama).
 * Tamil consonants range: க(0x0B95) to ஹ(0x0BB9)
 */
function isTamilConsonantBase(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x0B95 && code <= 0x0BB9;
}

/**
 * Strip the trailing virama from a consonant+virama string to get the base consonant.
 * e.g., 'க்' → 'க'
 */
function stripVirama(consWithVirama: string): string {
  if (consWithVirama.endsWith(VIRAMA)) {
    return consWithVirama.slice(0, -1);
  }
  return consWithVirama;
}

/**
 * Check if the last character in the output is a vowel sign, standalone vowel,
 * or inherent-vowel consonant (consonant base without virama at end).
 */
function lastIsVowelContext(output: string): boolean {
  if (output.length === 0) return false;
  const last = output[output.length - 1];
  
  // Last char is a vowel sign
  if (ALL_VOWEL_SIGNS.has(last)) return true;
  
  // Last char is a standalone vowel
  if (ALL_VOWELS.has(last)) return true;
  
  // Last char is a Tamil consonant base (inherent 'a' vowel, no virama)
  if (isTamilConsonantBase(last)) return true;
  
  return false;
}

/**
 * Replace the current vowel context at the end of output with a new vowel sign.
 * Handles vowel rotation (Anjal 2015 feature, Rule 9).
 */
function rotateVowel(output: string, newVowelKey: string): string {
  if (output.length === 0) return output;
  
  const last = output[output.length - 1];
  const sign = VOWEL_SIGNS[newVowelKey];
  
  // Case 1: last char is a vowel sign → replace it
  if (ALL_VOWEL_SIGNS.has(last)) {
    const base = output.slice(0, -1);
    if (sign === '') {
      // 'a' sign is empty, just return the base consonant
      return base;
    }
    return base + sign;
  }
  
  // Case 2: last char is a consonant base with inherent 'a' (no virama)
  if (isTamilConsonantBase(last)) {
    if (sign === '') {
      // Already has inherent 'a', no change
      return output;
    }
    return output + sign;
  }
  
  // Case 3: last char is a standalone vowel → replace it
  if (ALL_VOWELS.has(last)) {
    return output.slice(0, -1) + VOWELS[newVowelKey];
  }
  
  return output;
}

/**
 * Transliterate English text to Tamil using the Anjal Key Layout.
 */
export function englishToTamil(text: string): string {
  let output = '';
  let i = 0;
  let lastWasConsonant = false; // tracks if the last emitted char was a consonant with virama
  let isWordStart = true;       // tracks word boundaries for ந் rule
  let escaped = false;          // tracks f-escape state
  
  while (i < text.length) {
    const ch = text[i];
    
    // Non-ASCII or non-alpha → pass through as-is, reset word state
    if (!/[a-zA-Z]/.test(ch)) {
      output += ch;
      lastWasConsonant = false;
      isWordStart = true;
      escaped = false;
      i++;
      continue;
    }
    
    // Rule 10: f-escape
    if (ch === 'f') {
      escaped = true;
      lastWasConsonant = false;
      i++;
      continue;
    }
    
    // Try matching special compound consonants first (longest match)
    // Only if not escaped
    if (!escaped) {
      let specialMatch: string | null = null;
      for (const key of SPECIAL_KEYS) {
        if (text.substr(i, key.length) === key) {
          specialMatch = key;
          break;
        }
      }
      
      if (specialMatch) {
        const tamilCompound = SPECIAL_COMPOUNDS[specialMatch];
        
        // If the last output was a consonant with virama, strip virama first
        // so the compound connects properly
        // Actually for Anjal, these compounds stand alone - they include their own structure
        
        output += tamilCompound;
        lastWasConsonant = true; // ends with virama
        isWordStart = false;
        i += specialMatch.length;
        continue;
      }
    }
    
    // Try matching 'sri' special
    if (!escaped && text.substr(i, 3) === 'sri') {
      output += 'ஶ்ரீ';
      lastWasConsonant = false;
      isWordStart = false;
      i += 3;
      continue;
    }
    
    // Try matching multi-char compound consonants (ng, nj, sh, x)
    if (!escaped) {
      let compoundMatch: string | null = null;
      for (const key of COMPOUND_KEYS) {
        if (text.substr(i, key.length) === key) {
          compoundMatch = key;
          break;
        }
      }
      
      if (compoundMatch) {
        output += COMPOUND_CONSONANTS[compoundMatch];
        lastWasConsonant = true;
        isWordStart = false;
        i += compoundMatch.length;
        continue;
      }
    }
    
    // Try matching vowels (longest first: aa, ai, au, ee, ii, oo, uu before singles)
    let vowelMatch: string | null = null;
    for (const key of VOWEL_KEYS) {
      if (text.substr(i, key.length) === key) {
        vowelMatch = key;
        break;
      }
    }
    // Also check single uppercase vowels: A, I, U, E, O
    if (!vowelMatch && (ch === 'A' || ch === 'I' || ch === 'U' || ch === 'E' || ch === 'O')) {
      vowelMatch = ch;
    }
    
    if (vowelMatch) {
      if (escaped) {
        // After f-escape: always emit standalone vowel, no rotation or combining
        output += VOWELS[vowelMatch];
        lastWasConsonant = false;
        escaped = false;
      } else if (lastWasConsonant) {
        // Consonant + vowel → compound letter
        // Strip the virama from the last consonant and add the vowel sign
        if (output.endsWith(VIRAMA)) {
          output = output.slice(0, -1);
          const sign = VOWEL_SIGNS[vowelMatch];
          if (sign !== undefined && sign !== '') {
            output += sign;
          }
          // if sign is '' (for 'a'), the consonant base alone represents ka, cha, etc.
        } else {
          output += VOWELS[vowelMatch];
        }
        lastWasConsonant = false;
      } else if (lastIsVowelContext(output)) {
        // Rule 9: Vowel rotation — replace the previous vowel/sign
        output = rotateVowel(output, vowelMatch);
        lastWasConsonant = false;
      } else {
        // Standalone vowel at word start or after non-Tamil
        output += VOWELS[vowelMatch];
        lastWasConsonant = false;
      }
      
      isWordStart = false;
      i += vowelMatch.length;
      continue;
    }
    
    // Try matching single consonants
    let consKey: string | null = null;
    
    // Check case-sensitive keys first (R, L, N, S, W)
    if (CONSONANTS[ch]) {
      consKey = ch;
    }
    
    if (consKey) {
      let tamilCons = CONSONANTS[consKey];
      
      // Rule 8: 'n' at word start produces ந் instead of ன்
      if ((consKey === 'n') && isWordStart && !escaped) {
        tamilCons = 'ந்';
      }
      
      output += tamilCons;
      lastWasConsonant = true;
      isWordStart = false;
      escaped = false;
      i++;
      continue;
    }
    
    // Unrecognized letter → pass through
    output += ch;
    lastWasConsonant = false;
    isWordStart = false;
    escaped = false;
    i++;
  }
  
  return output;
}
