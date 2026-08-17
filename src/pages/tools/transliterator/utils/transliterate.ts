/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Constants ---

export const VIRAMA = "்";

// Standard Vowels - Start/Middle
export const VOWELS_BASE: Record<string, string> = {
  "அ": "a", 
  "ஆ": "aa", 
  "இ": "i", 
  "ஈ": "ee", 
  "உ": "u", 
  "ஊ": "oo",
  "எ": "e", 
  "ஏ": "ae", 
  "ஐ": "ai", 
  "ஒ": "o", 
  "ஓ": "oa", 
  "ஔ": "au"
};

// Vowel Signs (Combinatorial)
export const VOWEL_SIGNS: Record<string, string> = {
  "ா": "aa", 
  "ி": "i", 
  "ீ": "ee", 
  "ு": "u", 
  "ூ": "oo",
  "ெ": "e", 
  "ே": "ae", 
  "ை": "ai", 
  "ொ": "o", 
  "ோ": "oa", 
  "ௌ": "au"
};

// Hard: word-start, geminate
export const HARD: Record<string, string> = { 
  "க": "k", 
  "ச": "ch", 
  "ட": "t", 
  "த": "th", 
  "ப": "p", 
  "ற": "r" 
};

// Soft: between vowels / middle of word
export const SOFT: Record<string, string> = { 
  "க": "g", 
  "ச": "s", 
  "ட": "d", 
  "த": "dh", 
  "ப": "b", 
  "ற": "r" 
};

// Geminated (doubled)
export const DOUBLED: Record<string, string> = {
  "க": "kk",
  "ச": "cch",
  "ட": "tt",
  "த": "tth",
  "ப": "pp",
  "ற": "tr"
};

// Nasals
export const NASAL_SOUND: Record<string, string> = { 
  "ங": "ng", 
  "ஞ": "ny", 
  "ண": "n", 
  "ந": "n", 
  "ம": "m", 
  "ன": "n" 
};

// Voiced stops (after its nasal)
export const VOICED_STOP: Record<string, string> = { 
  "க": "g", 
  "ச": "j", 
  "ட": "d", 
  "த": "dh", 
  "ப": "b", 
  "ற": "dr" 
};

export const OTHER: Record<string, string> = {
  "ய": "y", "ர": "r", "ல": "l", "வ": "v", "ழ": "zh", "ள": "l",
  "ஹ": "h", "ஜ": "j", "ஷ": "sh", "ஸ": "s", "ஶ": "sh", "ஃ": "k"
};

export const GRANTHA = new Set(["ஜ", "ஷ", "ஸ", "ஹ", "ஶ"]);

// After these (even with pulli / virama), the next stop softens
export const SEMIVOWELS = new Set(["ய", "ர", "ல", "வ", "ழ", "ள"]);

// --- Helpers ---

export function processFinalVowel(vowel: string, isStart: boolean, isEnd: boolean, mode: TransliterationMode, isBase: boolean = false): string {
  if (!vowel) return "";
  
  if (mode === "simplified") {
      // We removed 'aa' -> 'a' at start to prevent ஆசை (aasai) and அசை (asai) from being confused.
      if (vowel === "aa" && isEnd) return "a";
      if (vowel === "oa" && isStart && isEnd) return "oh";
      if (vowel === "oa" && isStart) return "o";
      if (vowel === "oa" && isEnd) return "o";
      if (vowel === "ae" && isEnd) return "ae";
      return vowel;
  }
  
  if (mode === "extended++") {
      // Keep exact phonetics everywhere, no stripping of 'a' from 'aa' or 'oa'.
      return vowel;
  }
  
  if (vowel === "aa" && isEnd) return "ah";
  if (vowel === "oa" && isEnd) return "oh";
  return vowel;
}

export function isVowelSign(ch: string | undefined): boolean {
  return ch !== undefined && VOWEL_SIGNS[ch] !== undefined;
}

export function isStop(ch: string | undefined): boolean {
  return ch !== undefined && HARD[ch] !== undefined;
}

export function isNasal(ch: string | undefined): boolean {
  return ch !== undefined && NASAL_SOUND[ch] !== undefined;
}

export function isConsonant(ch: string | undefined): boolean {
  return isStop(ch) || isNasal(ch) || (ch !== undefined && OTHER[ch] !== undefined);
}

export function isSpace(ch: string | undefined): boolean {
  return ch === undefined || /[\s\n\r]/.test(ch);
}

export function isPunct(ch: string | undefined): boolean {
  return ch !== undefined && /[.,!?;:)\]}\-—"']/.test(ch);
}

function isWordEnd(chars: string[], index: number): boolean {
  const nextChar = chars[index + 1];
  return isSpace(nextChar) || isPunct(nextChar) || nextChar === undefined;
}

function isWordStart(chars: string[], index: number): boolean {
  const prevChar = chars[index - 1];
  return isSpace(prevChar) || isPunct(prevChar) || prevChar === undefined;
}

// Nasal + stop fusion
export function getFusion(nasal: string, stop: string, stopHasVirama: boolean = false, vowelChar: string = "", isGrantha: boolean = false, wordStr: string = ""): string {
  if (stopHasVirama) {
    if (nasal === "ஞ" && stop === "ச") return "nch";
    if (nasal === "ன" && stop === "ற") return "ntr"; 
    if (nasal === "ந" && stop === "ற") return "ntr";
    if (nasal === "ங" && stop === "க") return "nk";
    return (NASAL_SOUND[nasal] || "n") + (HARD[stop] || stop);
  }

  // Grantha words usually keep stops hard
  if (isGrantha) {
    // Normal homorganic softens might still happen in some names, 
    // but the exclusion rule usually implies preserving Sanskrit phonetics.
    // However, common nasal-stop fusions like 'nj' or 'nd' often persist as expected.
    // To strictly follow "disable softening middle letters", we prefer HARD.
    return (NASAL_SOUND[nasal] || "n") + (HARD[stop] || stop);
  }
  
  // Homorganic pairs soften
  if (nasal === "ங" && stop === "க") return "ng";
  if (nasal === "ஞ" && stop === "ச") return "nj";
  if (nasal === "ண" && stop === "ட") return "nd";
  if (nasal === "ந" && stop === "த") return "ndh";
  if (nasal === "ம" && stop === "ப") return "mb";
  if (nasal === "ன" && stop === "ற") return "ndr"; 
  if (nasal === "ந" && stop === "ற") return "ndr";
  
  // Smart Heuristic for ன்/ண் + ப (anbu vs menporul)
  if ((nasal === "ன" || nasal === "ண") && stop === "ப") {
    // Detect known compound components that strictly preserve the hard 'p' (Noun + Noun phonetics)
    const hardCompoundSuffixes = ["பகுதி", "புறம்", "பொருள்", "பால்", "பார்வை", "பாண்டம்", "பகிர்"];
    const hasHardSuffix = hardCompoundSuffixes.some(suffix => wordStr.includes(suffix));
    
    if (hasHardSuffix) {
        return (NASAL_SOUND[nasal] || "n") + "p"; // Keep hard
    }

    // "o", "oa", "au", "ai" typically begin compound distinct words like `porul` (menporul), `pai`
    if (["o", "oa", "au", "ai"].includes(vowelChar)) {
        return (NASAL_SOUND[nasal] || "n") + "p"; // Keep hard
    }
    // "u", "a", "aa", "i", "e", "ae" typically are bound suffixes or single roots like அன்பு (bu), நண்பன் (ba), பண்பாடு (baa), அன்பே (bae)
    return (NASAL_SOUND[nasal] || "n") + "b"; // Soften
  }

  // Mismatched pairs stay HARD (e.g. ன்க -> nk)
  return (NASAL_SOUND[nasal] || "n") + (HARD[stop] || stop);
}

// --- Core Logic ---

export type TransliterationMode = "mode1" | "mode2" | "simplified" | "extended++";

export function transliterate(text: string, mode: TransliterationMode = "mode1"): string {
  if (!text) return "";
  
  const chars = Array.from(text);
  let out = "";
  let i = 0;
  let inWord = false;
  let wordBuffer: { char: string, type: 'vowel' | 'consonant' | 'other' }[] = [];

  // Helper to process a "word" unit
  const processWord = (startIdx: number, endIdx: number) => {
    let wordOut = "";
    let prevWasVowel = false;
    const wordStr = chars.slice(startIdx, endIdx + 1).join("");

    // Grantha Exclusion Rule check
    let isGranthaWord = false;
    for (let k = startIdx; k <= endIdx; k++) {
        if (GRANTHA.has(chars[k])) {
            isGranthaWord = true;
            break;
        }
    }

    for (let j = startIdx; j <= endIdx; j++) {
      const c = chars[j];
      const isStart = (j === startIdx);
      const isEnd = (j === endIdx);
      const isStandalone = (isStart && isEnd);

      const n1 = chars[j + 1], n2 = chars[j + 2], n3 = chars[j + 3];

      // Standalone/Alone Vowels
      if (VOWELS_BASE[c]) {
        let val = VOWELS_BASE[c];
        val = processFinalVowel(val, isStart, isEnd || isStandalone, mode, true);
        
        wordOut += val;
        prevWasVowel = true;
        continue;
      }

      if (c === VIRAMA) continue;

      // Special handling for Aaytham (ஃ)
      if (c === "ஃ") {
          wordOut += "h";
          // We intentionally do not change prevWasVowel here. 
          // Aaytham always follows a short vowel, so keeping prevWasVowel = true
          // correctly softens the following stop consonant (e.g., எஃகு -> ehgu).
          continue;
      }

      // Pattern 1: Nasal + virama + stop
      if (isNasal(c) && n1 === VIRAMA && isStop(n2)) {
        const stopHasVirama = (n3 === VIRAMA);
        const vowel = isVowelSign(n3) ? VOWEL_SIGNS[n3] : (n3 === VIRAMA ? "" : "a");
        const fusion = getFusion(c, n2, stopHasVirama, vowel, isGranthaWord, wordStr);
        
        let skip = isVowelSign(n3) ? 4 : (n3 === VIRAMA ? 4 : 3);
        
        let isFinalChar = (j + skip - 1 >= endIdx);
        let finalVowel = processFinalVowel(vowel, isStart, isFinalChar, mode, false);

        wordOut += fusion + finalVowel;
        j += skip - 1;
        prevWasVowel = (finalVowel !== "");
        continue;
      }

      // Pattern 2: Geminate
      if (isConsonant(c) && n1 === VIRAMA && n2 === c) {
        let baseSound = HARD[c] || NASAL_SOUND[c] || OTHER[c] || c;
        let gem = DOUBLED[c] || (baseSound + baseSound);
        
        // Mode overrides for Geminate ச and த
        if (mode === "mode2") {
            if (c === "ச") gem = "chch";
            if (c === "த") gem = "thth";
        } else if (mode === "simplified" || mode === "extended++") {
            if (c === "ச") gem = "ch";
            if (c === "த") gem = "th";
        }

        // 'ய' geminate mapping
        if (c === "ய") {
            gem = "iy";
        }

        const vowel = isVowelSign(n3) ? VOWEL_SIGNS[n3] : (n3 === VIRAMA ? "" : "a");
        
        let skip = isVowelSign(n3) ? 4 : (n3 === VIRAMA ? 4 : 3);

        let isFinalChar = (j + skip - 1 >= endIdx);
        let finalVowel = processFinalVowel(vowel, isStart, isFinalChar, mode, false);

        wordOut += gem + finalVowel;
        j += skip - 1;
        prevWasVowel = (finalVowel !== "");
        continue;
      }

      // Pattern 3: Regular Consonant
      if (isConsonant(c)) {
        let sound = "";
        if (isStop(c)) {
            const prevChar = j > startIdx ? chars[j - 1] : undefined;
            const prevPrevChar = j > startIdx + 1 ? chars[j - 2] : undefined;
            
            const afterSemivowelPulli = (prevChar === VIRAMA && prevPrevChar && SEMIVOWELS.has(prevPrevChar));
            const afterSemivowelDirect = (prevChar && SEMIVOWELS.has(prevChar) && !isVowelSign(prevChar) && prevChar !== VIRAMA);
            
            const isSoft = (!isStart) && n1 !== VIRAMA && (prevWasVowel || afterSemivowelPulli || afterSemivowelDirect);
            
            sound = (isSoft && !isGranthaWord) ? SOFT[c] : HARD[c];
        } else {
            sound = NASAL_SOUND[c] || OTHER[c] || c;
        }

        // Special check for doubled 'ny' -> nnya (user said nnyu, likely meant nnya)
        if (c === "ஞ" && isStart && n1 === VIRAMA && n2 === "ஞ") {
             // Handled by geminate pattern
        }

        const vowel = isVowelSign(n1) ? VOWEL_SIGNS[n1] : (n1 === VIRAMA ? "" : "a");
        let skip = isVowelSign(n1) ? 2 : (n1 === VIRAMA ? 2 : 1);
        
        // Vowel ending modifications
        let isFinalChar = (j + skip - 1 >= endIdx);
        let finalVowel = processFinalVowel(vowel, isStart, isFinalChar, mode, false);

        // ய் -> i (e.g., naay -> naai, thaay -> thaai, poy -> poi, paayndhadhu -> paaindhadhu)
        if (c === "ய" && n1 === VIRAMA) {
            sound = "i";
        }

        wordOut += sound + finalVowel;
        j += skip - 1;
        prevWasVowel = (vowel !== "");
        continue;
      }

      wordOut += c;
    }
    return wordOut;
  };

  while (i < chars.length) {
    if (isSpace(chars[i]) || isPunct(chars[i])) {
      out += chars[i];
      i++;
    } else {
      let start = i;
      while (i < chars.length && !isSpace(chars[i]) && !isPunct(chars[i])) {
        i++;
      }
      out += processWord(start, i - 1);
    }
  }

  return out;
}
