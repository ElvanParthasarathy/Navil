/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tolkappiyam Phonetic Transliteration Engine
 * (Elvan Navil Engine - Extended++)
 * 
 * Grounded in classical Tamil grammar:
 * - தொல்காப்பியம் எழுத்ததிகாரம் (நூன்மரபு, புள்ளிமயங்கியல், பிறப்பியல்)
 * - தொல்காப்பியம் சொல்லதிகாரம் (எச்சவியல் - நூற்பா 410, 412, 416, 420)
 * - யாப்பிலக்கணம் (அசை பிரித்தல் - Onset, Nucleus, Coda)
 * - துணைவினை & கூட்டுச்சொல் எல்லை முறைமை (Auxiliary Verb & Morpheme-Initial Stop Rule)
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

// Hard: word-start, geminate, after Vallina Mei (ற், ட்)
// Authentic initial ச is "ch" (Chennai, Chidambaram, chiriya, chey)
export const HARD: Record<string, string> = { 
  "க": "k", 
  "ச": "ch", 
  "ட": "t", 
  "த": "th", 
  "ப": "p", 
  "ற": "r" 
};

// Soft: between vowels / middle of word / after semivowels
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
  "ச": "ch",
  "ட": "tt",
  "த": "th",
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

// Voiced stops (after homorganic nasal)
export const VOICED_STOP: Record<string, string> = { 
  "க": "g", 
  "ச": "j", 
  "ட": "d", 
  "த": "dh", 
  "ப": "b", 
  "ற": "dr" 
};

// Homorganic pairs (இணை எழுத்துகள்)
export const INAI_EZHUTHUGAL: Record<string, string> = {
  "ங": "க",
  "ஞ": "ச",
  "ண": "ட",
  "ந": "த",
  "ம": "ப",
  "ன": "ற"
};

export const OTHER: Record<string, string> = {
  "ய": "y", "ர": "r", "ல": "l", "வ": "v", "ழ": "zh", "ள": "l",
  "ஹ": "h", "ஜ": "j", "ஷ": "sh", "ஸ": "s", "ஶ": "sh", "ஃ": "k"
};

export const GRANTHA = new Set(["ஜ", "ஷ", "ஸ", "ஹ", "ஶ"]);

// After these (even with pulli / virama), the next stop softens
export const SEMIVOWELS = new Set(["ய", "ர", "ல", "வ", "ழ", "ள"]);
export const VALLINA_MEI = new Set(["ட்", "ற்", "க்", "ச்", "த்", "ப்"]);

// --- Grammatical Root & Morpheme Classification ---

export function isVoicedNbWord(word: string): boolean {
  // 1. Time words with -பு (must be munbu / pinbu, not munpakkam or pinpaattu)
  if (/^(?:முன்ப|பின்ப)/.test(word) && !/^(?:முன்பக்க|பின்பக்க|பின்பாட்டு|முன்பகுதி|பின்பகுதி|முன்பல்|பின்பல்|முன்பார்வை|பின்பார்வை)/.test(word)) return true;
  if (word.includes("முன்ப") || word.includes("பின்ப")) {
    if (!word.includes("முன்பக்க") && !word.includes("பின்பக்க") && !word.includes("பின்பாட்டு") && !word.includes("முன்பகுதி") && !word.includes("பின்பகுதி") && !word.includes("முன்பல்") && !word.includes("பின்பல்") && !word.includes("முன்பார்வை") && !word.includes("பின்பார்வை")) return true;
  }

  // 2. Noun roots (anbu, panbu, nanban, inbam, thunbam, enbu)
  if (word.includes("அன்ப")) return true;
  if (word.includes("பண்ப")) return true;
  if (word.includes("நண்பன்") || word.includes("நண்பர்") || word.includes("நண்பா")) return true;
  if (word.includes("இன்ப")) return true;
  if (word.includes("துன்ப")) return true;
  if ((word.includes("என்பு") || word.includes("என்பி")) && !word.includes("என்பின்")) return true;
  if (word.includes("மன்பதை") || word.includes("தென்படு")) return true;

  // 3. Numbers with -பது (enbadhu, onbadhu, pathonbadhu, enbaan, onbaan)
  if (word.includes("எண்பத") || word.includes("ஒன்பத") || word.includes("தொன்பத") || word.includes("எண்பா") || word.includes("ஒன்பா")) return true;

  // 4. Verbs with future tense -ப- (unbaan, kaanbaan, thinbaan, poonbaan)
  if (word.includes("உண்ப") || word.includes("காண்ப") || word.includes("திண்ப") || word.includes("பூண்ப")) return true;

  // 5. Verb: enbaan, enbaar, enbadhu (to say) vs noun என் (my: enpakkam, enpadi, enpoal)
  if (word.includes("என்பத") || word.includes("என்பா") || word.includes("என்பர்") || word.includes("என்பன")) {
    if (!word.includes("என்பார்வை") && !word.includes("என்பாடம்") && !word.includes("என்பாடு") && !word.includes("என்பொருள்")) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a stop consonant at position j is the onset of an auxiliary verb (துணைவினை)
 * or a compound word head (வருமொழி முதனிலை), which preserves its initial unvoiced stop.
 * (e.g. நிலைபெற்றுள்ள -> nilaipetrulla, நடைபெறும் -> nadaiperum, தொன்றுதொட்டு -> thondruthottu)
 */
export function isMorphemeInitialStop(chars: string[], j: number, wordStr: string, startIdx: number = 0): boolean {
  const c = chars[j];
  const remaining = chars.slice(j).join("");
  const prefix = chars.slice(startIdx, j).join("");

  // 1. Numerical Prefixes (எண்ணடை முன்னொட்டுகள்: ஒரு, இரு, அறு)
  // Stops after numerical prefixes carry junctural fortis/onset (iruperum, orupozhudhum, irupakkam)
  // Exception: the tens suffix -பது (as in இருபது -> irubadhu)
  if (prefix === "இரு" || prefix === "ஒரு" || prefix === "அறு" || 
      prefix.endsWith("இரு") || prefix.endsWith("ஒரு") || prefix.endsWith("அறு")) {
    if (c === "ப" && remaining.startsWith("பது")) {
      return false; // இருபது -> irubadhu
    }
    return true;
  }

  // 2. Auxiliary Verbs & Compound Heads starting with 'க'
  if (c === "க") {
    // கூட particle (அவள்கூட, நான்கூட -> kooda)
    if (/^கூட/.test(remaining)) return true;
  }

  // 3. Auxiliary Verbs & Compound Heads starting with 'ப'
  if (c === "ப") {
    // பெறு stem (பெற்ற, பெற்று, பெற, பெறும், பெறு...)
    if (/^பெ(?:ற்ற|ற்று|ற|று)/.test(remaining)) return true;
    // படு stem (பட்ட, பட்டு, பட, படும், படு...)
    if (/^ப(?:ட்ட|ட்டு|ட|டு)/.test(remaining)) return true;
    // பிடி stem (பிடித்த, பிடித்து, பிடி...)
    if (/^பிடி/.test(remaining)) return true;
    // பார் stem (பார்த்த, பார்த்து, பார்வை, பார்...)
    if (/^பார்/.test(remaining)) return true;
    // போடு stem (போட்ட, போட்டு, போடு...)
    if (/^போ(?:ட்ட|ட்டு|ட|டு)/.test(remaining)) return true;
    // உவம உருபு (போல், போல, போன்ற, போன்று)
    if (/^போ(?:ல|ல்|ன்ற|ன்று)/.test(remaining)) return true;
    // Compound noun heads (பொருள், புகழ், படை, பகுதி, பக்கம், பாட்டு, பால், பாண்டம்)
    if (/^(?:பொரு|புக|படை|பகுதி|பக்கம்|பாட்டு|பால்|பாண்ட)/.test(remaining)) return true;
  }

  return false;
}

// --- Syllable Splitter (அசை பிரித்தல்) ---

export interface Syllable {
  onset: string;
  nucleus: string;
  coda: string;
  raw: string;
}

export function splitSyllables(word: string): Syllable[] {
  const chars = Array.from(word);
  const syllables: Syllable[] = [];
  let i = 0;

  while (i < chars.length) {
    let onset = "";
    let nucleus = "";
    let coda = "";
    let raw = "";

    if (VOWELS_BASE[chars[i]]) {
      nucleus = chars[i];
      raw += chars[i];
      i++;
    } else if (isConsonant(chars[i])) {
      onset = chars[i];
      raw += chars[i];
      i++;

      if (chars[i] === VIRAMA) {
        coda = onset;
        onset = "";
        raw += chars[i];
        i++;
        syllables.push({ onset: "", nucleus: "", coda, raw });
        continue;
      }

      if (isVowelSign(chars[i])) {
        nucleus = chars[i];
        raw += chars[i];
        i++;
      } else {
        nucleus = "அ";
      }
    } else {
      raw += chars[i];
      i++;
      syllables.push({ onset: "", nucleus: "", coda: "", raw });
      continue;
    }

    if (isConsonant(chars[i]) && chars[i + 1] === VIRAMA) {
      coda = chars[i];
      raw += chars[i] + chars[i + 1];
      i += 2;
    }

    syllables.push({ onset, nucleus, coda, raw });
  }

  return syllables;
}

// --- Helpers ---

export type TransliterationMode = "mode1" | "mode2" | "simplified" | "extended++";

export function processFinalVowel(
  vowel: string, 
  isStart: boolean, 
  isEnd: boolean, 
  mode: TransliterationMode = "extended++",
  isBase: boolean = false
): string {
  if (!vowel) return "";
  
  if (mode === "simplified") {
      if (vowel === "aa" && isEnd) return "a";
      if (vowel === "oa" && isStart && isEnd) return "oh";
      if (vowel === "oa" && isStart) return "o";
      if (vowel === "oa" && isEnd) return "o";
      if (vowel === "ae" && isEnd) return "ae";
      return vowel;
  }
  
  if (mode === "extended++") {
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

export function getFusion(
  nasal: string, 
  stop: string, 
  stopHasVirama: boolean = false, 
  vowelChar: string = "", 
  isGrantha: boolean = false, 
  wordStr: string = ""
): string {
  if (stopHasVirama) {
    if (nasal === "ஞ" && stop === "ச") return "nch";
    if (nasal === "ன" && stop === "ற") return "ntr"; 
    if (nasal === "ந" && stop === "ற") return "ntr";
    if (nasal === "ங" && stop === "க") return "nk";
    return (NASAL_SOUND[nasal] || "n") + (HARD[stop] || stop);
  }

  if (isGrantha) {
    return (NASAL_SOUND[nasal] || "n") + (HARD[stop] || stop);
  }
  
  // 1. Homorganic pairs voice (இணை எழுத்துகள்: ங்க, ஞ்ச, ண்ட, ந்த, ம்ப, ன்ற)
  if (nasal === "ங" && stop === "க") return "ng";
  if (nasal === "ஞ" && stop === "ச") return "nj";
  if (nasal === "ண" && stop === "ட") return "nd";
  if (nasal === "ந" && stop === "த") return "ndh";
  if (nasal === "ம" && stop === "ப") return "mb";
  if (nasal === "ன" && stop === "ற") return "ndr"; 
  if (nasal === "ந" && stop === "ற") return "ndr";
  
  // 2. Non-Homorganic ன்/ண் + ப
  if ((nasal === "ன" || nasal === "ண") && stop === "ப") {
    if (isVoicedNbWord(wordStr)) {
      return (NASAL_SOUND[nasal] || "n") + "b";
    }
    return (NASAL_SOUND[nasal] || "n") + "p";
  }

  // Emphatic suffix -தான் / -தானே after ன் (அவன்தான், நான்தான், இவன்தான் -> ndhaan)
  if (nasal === "ன" && stop === "த") {
    if (wordStr.endsWith("தான்") || wordStr.endsWith("தானே") || wordStr.includes("தான்") || wordStr.includes("தானே")) {
      return (NASAL_SOUND[nasal] || "n") + "dh";
    }
  }

  // 3. Plural suffix -கள் after ண்/ன் (கண்கள் -> kangal, பெண்கள் -> pengal, எண்கள் -> engal)
  if ((nasal === "ண" || nasal === "ன") && stop === "க") {
    const isPluralSuffix = wordStr.endsWith("கள்") || wordStr.includes("கள");
    if (isPluralSuffix) {
      return (NASAL_SOUND[nasal] || "n") + "g";
    }
  }

  return (NASAL_SOUND[nasal] || "n") + (HARD[stop] || stop);
}

export function sanitizeRedundantVallinaMei(text: string): string {
  if (!text) return "";
  const chars = Array.from(text);
  const sanitized: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    sanitized.push(chars[i]);

    if (i >= 1 && chars[i] === VIRAMA && (chars[i - 1] === "ற" || chars[i - 1] === "ட")) {
      const nextChar = chars[i + 1];
      const nextNext = chars[i + 2];
      if (nextChar && nextNext === VIRAMA && isStop(nextChar)) {
        i += 2;
      }
    }
  }

  return sanitized.join("");
}

// --- Main Transliteration Function ---

export function transliterate(text: string, mode: TransliterationMode = "extended++"): string {
  if (!text) return "";

  const cleanText = sanitizeRedundantVallinaMei(text);
  const chars = Array.from(cleanText);
  let out = "";
  let i = 0;

  const processWord = (startIdx: number, endIdx: number): string => {
    let wordOut = "";
    let prevWasVowel = false;
    const wordStr = chars.slice(startIdx, endIdx + 1).join("");

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

      // Independent Vowels
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
        continue;
      }

      // Pattern 1: Nasal + virama + stop
      if (isNasal(c) && n1 === VIRAMA && isStop(n2)) {
        const stopHasVirama = (n3 === VIRAMA);
        const vowel = isVowelSign(n3) ? VOWEL_SIGNS[n3] : (n3 === VIRAMA ? "" : "a");
        const fusion = getFusion(c, n2, stopHasVirama, vowel, isGranthaWord, wordStr);
        
        const skip = isVowelSign(n3) ? 4 : (n3 === VIRAMA ? 4 : 3);
        const isFinalChar = (j + skip - 1 >= endIdx);
        const finalVowel = processFinalVowel(vowel, isStart, isFinalChar, mode, false);

        wordOut += fusion + finalVowel;
        j += skip - 1;
        prevWasVowel = (finalVowel !== "");
        continue;
      }

      // Pattern 2: Geminate
      if (isConsonant(c) && n1 === VIRAMA && n2 === c) {
        let baseSound = HARD[c] || NASAL_SOUND[c] || OTHER[c] || c;
        let gem = DOUBLED[c] || (baseSound + baseSound);
        
        if (mode === "mode1") {
          if (c === "ச") gem = "ccha";
          if (c === "த") gem = "ttha";
        } else if (mode === "mode2") {
          if (c === "ச") gem = "chch";
          if (c === "த") gem = "thth";
        } else if (mode === "simplified" || mode === "extended++") {
          if (c === "ச") gem = "ch";
          if (c === "த") gem = "th";
        }

        if (c === "ய") gem = "iy";

        const vowel = isVowelSign(n3) ? VOWEL_SIGNS[n3] : (n3 === VIRAMA ? "" : "a");
        const skip = isVowelSign(n3) ? 4 : (n3 === VIRAMA ? 4 : 3);
        const isFinalChar = (j + skip - 1 >= endIdx);
        const finalVowel = processFinalVowel(vowel, isStart, isFinalChar, mode, false);

        wordOut += gem + finalVowel;
        j += skip - 1;
        prevWasVowel = (finalVowel !== "");
        continue;
      }

      // Pattern 3: Regular Consonants & Stops
      if (isConsonant(c)) {
        let sound = "";

        if (isStop(c)) {
          const prevChar = j > startIdx ? chars[j - 1] : undefined;
          const prevPrevChar = j > startIdx + 1 ? chars[j - 2] : undefined;
          
          const afterVallinaMei = (prevChar === VIRAMA && prevPrevChar && (prevPrevChar === "ற" || prevPrevChar === "ட"));
          const afterSemivowelPulli = (prevChar === VIRAMA && prevPrevChar && SEMIVOWELS.has(prevPrevChar));
          const afterSemivowelDirect = (prevChar && SEMIVOWELS.has(prevChar) && !isVowelSign(prevChar) && prevChar !== VIRAMA);
          
          // Tolkappiyam Morpheme-Initial Stop check (துணைவினைகள் & வருமொழி முதனிலை)
          const isMorphemeInitial = isMorphemeInitialStop(chars, j, wordStr, startIdx);

          if (afterVallinaMei) {
            sound = HARD[c]; // Strictly HARD after ற் and ட்
          } else if (isStart || isMorphemeInitial) {
            sound = HARD[c]; // Strictly HARD at word-start or auxiliary/compound boundary
          } else if (n1 === VIRAMA) {
            sound = HARD[c];
          } else if ((prevWasVowel || afterSemivowelPulli || afterSemivowelDirect) && !isGranthaWord) {
            sound = SOFT[c];
          } else {
            sound = HARD[c];
          }
        } else {
          sound = NASAL_SOUND[c] || OTHER[c] || c;
        }

        const vowel = isVowelSign(n1) ? VOWEL_SIGNS[n1] : (n1 === VIRAMA ? "" : "a");
        const skip = isVowelSign(n1) ? 2 : (n1 === VIRAMA ? 2 : 1);
        const isFinalChar = (j + skip - 1 >= endIdx);
        const finalVowel = processFinalVowel(vowel, isStart, isFinalChar, mode, false);

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

/**
 * Capitalizes the first alphabetical character of a string, preserving any leading quotes/brackets.
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  return text.replace(/^([\s"'“”‘’(«\[]*)([a-z])/i, (_m, prefix, letter) => prefix + letter.toUpperCase());
}

/**
 * Standard English/Latin sentence-case capitalizer (வாக்கியத் தொடக்கப் பேரெழுத்து).
 * Capitalizes:
 * 1. The first letter of the text.
 * 2. The first letter after sentence-ending punctuation (., ?, !) followed by whitespace.
 * 3. The first letter after newlines / paragraph breaks.
 * 4. Preserves any leading punctuation or quotation marks.
 */
export function capitalizeSentences(text: string): string {
  if (!text) return '';
  return text.replace(
    /(^|[.?!]\s+|\r?\n\s*)([\s"'“”‘’(«\[]*)([a-z])/gi,
    (_match, boundary, punct, letter) => boundary + punct + letter.toUpperCase()
  );
}

/**
 * Capitalizes HTML rich-text in standard sentence-case, keeping all HTML tags intact.
 */
export function capitalizeSentencesHtml(html: string): string {
  if (!html) return '';
  let isSentenceStart = true;

  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
    if (tag) {
      if (/<(?:br|\/p|div|\/div|h[1-6]|\/h[1-6]|li|\/li)\b/i.test(tag)) {
        isSentenceStart = true;
      }
      return tag;
    }

    let result = '';
    let i = 0;
    while (i < text.length) {
      if (isSentenceStart && /[a-zA-Z]/.test(text[i])) {
        result += text[i].toUpperCase();
        isSentenceStart = false;
        i++;
      } else {
        result += text[i];
        if (/[.?!]/.test(text[i])) {
          isSentenceStart = true;
        } else if (/\n/.test(text[i])) {
          isSentenceStart = true;
        }
        i++;
      }
    }
    return result;
  });
}

/**
 * Applies Latin poetic line-initial capitalization to HTML/plain-text poem content.
 * Capitalizes the first letter of each verse line (after newlines, <br>, </p>, etc.)
 */
export function capitalizePoemHtml(html: string): string {
  if (!html) return '';
  let isLineStart = true;

  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
    if (tag) {
      if (/<(?:br|\/p|div|\/div|h[1-6]|\/h[1-6]|li|\/li)\b/i.test(tag)) {
        isLineStart = true;
      }
      return tag;
    }

    let result = '';
    const parts = text.split(/(\r?\n)/);
    for (const part of parts) {
      if (part === '\n' || part === '\r\n') {
        result += part;
        isLineStart = true;
      } else {
        if (isLineStart && /[a-zA-Z]/.test(part)) {
          const replaced = part.replace(/^([\s"'“”‘’(«\[]*)([a-z])/i, (_m, prefix, letter) => {
            return prefix + letter.toUpperCase();
          });
          isLineStart = false;
          result += replaced;
        } else {
          result += part;
        }
      }
    }
    return result;
  });
}

/**
 * Capitalizes every word in the text (Title Case / சொல் தொடக்கப் பேரெழுத்து).
 * Facilitates Romanized Tamil visual word segmentation for optimal readability.
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text.replace(/\b([a-z])/g, c => c.toUpperCase());
}

/**
 * Capitalizes every word in HTML text while preserving HTML tags.
 */
export function capitalizeWordsHtml(html: string): string {
  if (!html) return '';
  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag, text) => {
    if (tag) return tag;
    return capitalizeWords(text);
  });
}

export default transliterate;

