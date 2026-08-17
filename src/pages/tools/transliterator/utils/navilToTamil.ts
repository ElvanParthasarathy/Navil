/**
 * Navil Mode Transliteration Engine
 * 
 * Based on the Anjal keyboard layout (1993) with modern spelling modifications.
 * Key differences from standard Anjal:
 *   - ee/oo → ஈ/ஊ (instead of ஏ/ஓ)
 *   - ae → ஏ, oa → ஓ
 *   - s → ஸ் (strictly), c/ch → ச்
 *   - t/d → ட், th/dh → த்
 *   - rr → ற் (alternate), zh → ழ் (alternate)
 *   - S → ஶ் (not ஸ்)
 *   - ksh → க்ஷ் (instead of x)
 *   - sri/sree/shree/shri → ஶ்ரீ
 */

// Tamil Unicode
const VOWELS: Record<string, string> = {
  'a':  'அ',
  'aa': 'ஆ', 'A':  'ஆ',
  'i':  'இ',
  'ii': 'ஈ', 'I':  'ஈ', 'ee': 'ஈ',
  'u':  'உ',
  'uu': 'ஊ', 'U':  'ஊ', 'oo': 'ஊ',
  'e':  'எ',
  'ae': 'ஏ', 'E':  'ஏ',
  'ai': 'ஐ',
  'o':  'ஒ',
  'oa': 'ஓ', 'O':  'ஓ',
  'au': 'ஔ',
};

const VOWEL_SIGNS: Record<string, string> = {
  'a':  '',
  'aa': 'ா', 'A':  'ா',
  'i':  'ி',
  'ii': 'ீ', 'I':  'ீ', 'ee': 'ீ',
  'u':  'ு',
  'uu': 'ூ', 'U':  'ூ', 'oo': 'ூ',
  'e':  'ெ',
  'ae': 'ே', 'E':  'ே',
  'ai': 'ை',
  'o':  'ொ',
  'oa': 'ோ', 'O':  'ோ',
  'au': 'ௌ',
};

const ALL_VOWEL_SIGNS = new Set([
  'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ'
]);

const ALL_VOWELS = new Set([
  'அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'
]);

const VIRAMA = '்';

const CONSONANTS: Record<string, string> = {
  'k':  'க்',
  'c':  'ச்',
  'g':  'க்',     // Navil: g → க்
  'd':  'ட்',
  't':  'ட்',     // Navil: t → ட் (not த்)
  'p':  'ப்',
  'R':  'ற்',
  'y':  'ய்',
  'r':  'ர்',
  'l':  'ல்',
  'v':  'வ்',
  'z':  'ழ்',
  'L':  'ள்',
  's':  'ஸ்',     // Navil: s → ஸ் (strictly)
  'S':  'ஶ்',     // Navil: S → ஶ்
  'h':  'ஹ்',
  'j':  'ஜ்',
  'm':  'ம்',
  'n':  'ன்',
  'W':  'ன்',
  'w':  'ந்',
  'N':  'ண்',
  'q':  'ஃ',
};

// Multi-char compound consonants (longest first)
const COMPOUND_CONSONANTS: Record<string, string> = {
  'ng':  'ங்',
  'nj':  'ஞ்',
  'sh':  'ஷ்',
  'ch':  'ச்',     // Navil: ch → ச்
  'th':  'த்',     // Navil: th → த்
  'dh':  'த்',     // Navil: dh → த்
  'rr':  'ற்',     // Navil: rr → ற்
  'zh':  'ழ்',     // Navil: zh → ழ்
  'ksh': 'க்ஷ்',   // Navil: ksh (not x)
};

// ஶ்ரீ special sequences
const SRI_KEYS = ['shree', 'shri', 'sree', 'sri'];

// Special compound rules (same as Anjal)
const SPECIAL_COMPOUNDS: Record<string, string> = {
  'ndr': 'ன்ற்',
  'ntr': 'ன்ற்',   // Navil: ntr also works (since t=ட)
  'nd':  'ண்ட்',
  'nt':  'ந்த்',
  'njj': 'ஞ்ச்',
};

// Sorted keys for greedy matching
const SPECIAL_KEYS = Object.keys(SPECIAL_COMPOUNDS).sort((a, b) => b.length - a.length);
const COMPOUND_KEYS = Object.keys(COMPOUND_CONSONANTS).sort((a, b) => b.length - a.length);
const VOWEL_KEYS = Object.keys(VOWELS).sort((a, b) => b.length - a.length);

function isTamilConsonantBase(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x0B95 && code <= 0x0BB9;
}

function lastIsVowelContext(output: string): boolean {
  if (output.length === 0) return false;
  const last = output[output.length - 1];
  if (ALL_VOWEL_SIGNS.has(last)) return true;
  if (ALL_VOWELS.has(last)) return true;
  if (isTamilConsonantBase(last)) return true;
  return false;
}

function rotateVowel(output: string, newVowelKey: string): string {
  if (output.length === 0) return output;
  
  const last = output[output.length - 1];
  const sign = VOWEL_SIGNS[newVowelKey];
  
  if (ALL_VOWEL_SIGNS.has(last)) {
    const base = output.slice(0, -1);
    if (sign === '') return base;
    return base + sign;
  }
  
  if (isTamilConsonantBase(last)) {
    if (sign === '') return output;
    return output + sign;
  }
  
  if (ALL_VOWELS.has(last)) {
    return output.slice(0, -1) + VOWELS[newVowelKey];
  }
  
  return output;
}

function isNextVowel(text: string, index: number): boolean {
  if (index >= text.length) return false;
  for (const key of VOWEL_KEYS) {
    if (text.substr(index, key.length) === key) {
      return true;
    }
  }
  const ch = text[index];
  if (ch === 'A' || ch === 'I' || ch === 'U' || ch === 'E' || ch === 'O') {
    return true;
  }
  return false;
}

/**
 * Transliterate English text to Tamil using the Navil Mode layout.
 */
export function navilToTamil(text: string): string {
  let output = '';
  let i = 0;
  let lastWasConsonant = false;
  let isWordStart = true;
  let escaped = false;
  
  while (i < text.length) {
    const ch = text[i];
    
    // Non-alpha → pass through
    if (!/[a-zA-Z]/.test(ch)) {
      output += ch;
      lastWasConsonant = false;
      isWordStart = true;
      escaped = false;
      i++;
      continue;
    }
    
    // f-escape
    if (ch === 'f') {
      escaped = true;
      lastWasConsonant = false;
      i++;
      continue;
    }
    
    // Try special compounds first (longest match)
    if (!escaped) {
      let specialMatch: string | null = null;
      for (const key of SPECIAL_KEYS) {
        if (text.substr(i, key.length) === key) {
          specialMatch = key;
          break;
        }
      }
      if (specialMatch) {
        output += SPECIAL_COMPOUNDS[specialMatch];
        lastWasConsonant = true;
        isWordStart = false;
        i += specialMatch.length;
        continue;
      }
    }
    
    // Try ஶ்ரீ sequences
    if (!escaped) {
      let sriMatch: string | null = null;
      for (const key of SRI_KEYS) {
        if (text.substr(i, key.length).toLowerCase() === key) {
          sriMatch = key;
          break;
        }
      }
      if (sriMatch) {
        output += 'ஶ்ரீ';
        lastWasConsonant = false;
        isWordStart = false;
        i += sriMatch.length;
        continue;
      }
    }
    
    // Try custom contextual compounds first: ttr, tr, ng, nj, ch
    if (!escaped) {
      // 1. ttr
      if (text.substr(i, 3) === 'ttr') {
        output += 'ற்ற்';
        lastWasConsonant = true;
        isWordStart = false;
        i += 3;
        continue;
      }

      // 2. tr
      if (text.substr(i, 2) === 'tr') {
        if (isNextVowel(text, i + 2)) {
          output += 'ற்ற்';
        } else {
          output += 'ற்';
        }
        lastWasConsonant = true;
        isWordStart = false;
        i += 2;
        continue;
      }

      // 3. ng
      if (text.substr(i, 2) === 'ng') {
        if (isNextVowel(text, i + 2)) {
          output += 'ங்க்';
        } else {
          output += 'ங்';
        }
        lastWasConsonant = true;
        isWordStart = false;
        i += 2;
        continue;
      }

      // 4. nj
      if (text.substr(i, 2) === 'nj') {
        if (isNextVowel(text, i + 2)) {
          output += 'ஞ்ச்';
        } else {
          output += 'ஞ்';
        }
        lastWasConsonant = true;
        isWordStart = false;
        i += 2;
        continue;
      }

      // 5. ch
      if (text.substr(i, 2) === 'ch') {
        if (isNextVowel(text, i + 2)) {
          if (isWordStart) {
            output += 'ச்'; // single ச family at start (e.g. chithra -> சித்ரா)
          } else {
            output += 'ச்ச்'; // doubled ச்ச family in middle (e.g. magizhchi -> மகிழ்ச்சி)
          }
        } else {
          output += 'ச்';
        }
        lastWasConsonant = true;
        isWordStart = false;
        i += 2;
        continue;
      }
    }

    // Try multi-char compound consonants
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
    
    // Try vowels (longest first)
    let vowelMatch: string | null = null;
    for (const key of VOWEL_KEYS) {
      if (text.substr(i, key.length) === key) {
        vowelMatch = key;
        break;
      }
    }
    // Single uppercase vowels
    if (!vowelMatch && (ch === 'A' || ch === 'I' || ch === 'U' || ch === 'E' || ch === 'O')) {
      vowelMatch = ch;
    }
    
    if (vowelMatch) {
      if (escaped) {
        output += VOWELS[vowelMatch];
        lastWasConsonant = false;
        escaped = false;
      } else if (lastWasConsonant) {
        if (output.endsWith(VIRAMA)) {
          output = output.slice(0, -1);
          const sign = VOWEL_SIGNS[vowelMatch];
          if (sign !== undefined && sign !== '') {
            output += sign;
          }
        } else {
          output += VOWELS[vowelMatch];
        }
        lastWasConsonant = false;
      } else if (lastIsVowelContext(output)) {
        output = rotateVowel(output, vowelMatch);
        lastWasConsonant = false;
      } else {
        output += VOWELS[vowelMatch];
        lastWasConsonant = false;
      }
      
      isWordStart = false;
      i += vowelMatch.length;
      continue;
    }
    
    // Try single consonants
    if (CONSONANTS[ch]) {
      let tamilCons = CONSONANTS[ch];
      
      // Navil: Custom 's' lookahead rule
      if (ch === 's' && !escaped) {
        let hasFollowingVowel = false;
        for (const key of VOWEL_KEYS) {
          if (text.substr(i + 1, key.length) === key) {
            hasFollowingVowel = true;
            break;
          }
        }
        const nextChar = text[i + 1];
        if (!hasFollowingVowel && nextChar && (nextChar === 'A' || nextChar === 'I' || nextChar === 'U' || nextChar === 'E' || nextChar === 'O')) {
          hasFollowingVowel = true;
        }

        if (hasFollowingVowel) {
          tamilCons = 'ச்'; // Map 's' to ச் (combines with vowel to produce ச family)
        } else {
          tamilCons = 'ஸ்'; // Map 's' to ஸ்
        }
      }
      
      // Rule 8: n at word start → ந்
      if (ch === 'n' && isWordStart && !escaped) {
        tamilCons = 'ந்';
      }
      
      output += tamilCons;
      lastWasConsonant = true;
      isWordStart = false;
      escaped = false;
      i++;
      continue;
    }
    
    // Unrecognized → pass through
    output += ch;
    lastWasConsonant = false;
    isWordStart = false;
    escaped = false;
    i++;
  }
  
  return output;
}
