/**
 * Tamil → Tamil-Brahmi (Unicode) transliteration engine
 * Ported from Jinavani (Brahmi.vue) by Vinodh Rajan
 * Uses Adinatha Tamil Brahmi font for rendering
 */

export type SpellingMode = 'early' | 'middle' | 'late';

export const vowelsT = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'];
export const vowelsB = ['𑀅', '𑀆', '𑀇', '𑀈', '𑀉', '𑀊', '𑀏𑁆', '𑀏', '𑀐', '𑀑𑁆', '𑀑', '𑀒', '𑀂'];

export const consonantsT = [
  'த⁴', 'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ன',
  'ப', 'ம', 'ய', 'ர', 'ற', 'ல', 'ள', 'ழ', 'வ',
  'ஜ', 'ஷ', 'ஸ', 'ஹ', 'ஶ'
];
export const consonantsB = [
  '𑀥', '𑀓', '𑀗', '𑀘', '𑀜', '𑀝', '𑀡', '𑀢', '𑀦', '𑀷',
  '𑀧', '𑀫', '𑀬', '𑀭', '𑀶', '𑀮', '𑀴', '𑀵', '𑀯',
  '𑀚', '𑀱', '𑀲', '𑀳', '𑀰'
];

export const vowelSignsT = ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்'];
export const vowelSignsB = ['𑀸', '𑀺', '𑀻', '𑀼', '𑀽', '𑁂𑁆', '𑁂', '𑁃', '𑁄𑁆', '𑁄', '𑁅', '𑁆'];

export function convertToBrahmi(text: string, spelling: SpellingMode = 'late'): string {
  let result = text;

  // Normalize Sri
  result = result.replace(/ஸ்ரீ/g, 'ஶ்ரீ');

  // Map independent vowels
  for (let i = 0; i < vowelsT.length; i++) {
    result = result.replace(new RegExp(vowelsT[i], 'g'), vowelsB[i]);
  }

  // Map consonants
  for (let i = 0; i < consonantsT.length; i++) {
    result = result.replace(new RegExp(consonantsT[i], 'g'), consonantsB[i]);
  }

  // Map dependent vowel signs
  for (let i = 0; i < vowelSignsT.length; i++) {
    result = result.replace(new RegExp(vowelSignsT[i], 'g'), vowelSignsB[i]);
    result = result.replace(new RegExp('⁴' + vowelSignsT[i], 'g'), vowelSignsB[i]);
  }

  // Apply spelling system
  if (spelling === 'middle') {
    // System II: No pulli
    result = result.replace(/𑁆/g, '');
  }

  if (spelling === 'early') {
    // System I (Bhattiprolu): Inherent 'a' marked with -aa sign
    for (let i = 0; i < consonantsB.length; i++) {
      result = result.replace(new RegExp(consonantsB[i], 'g'), consonantsB[i] + '𑀸');
    }
    for (let i = 0; i < vowelSignsB.length; i++) {
      result = result.replace(new RegExp('𑀸' + vowelSignsB[i], 'g'), vowelSignsB[i]);
    }
    result = result.replace(/𑁆/g, '');
  }

  // System III (Late): Default — full virama kept
  return result;
}
