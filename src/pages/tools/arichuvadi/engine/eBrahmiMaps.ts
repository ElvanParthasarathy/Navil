/**
 * Tamil → e-Brahmi font mapping engine
 * Ported from Jinavani (BrahmiE.vue) by Vinodh Rajan
 * Uses e-Brahmi T font — maps Grantha consonants to Malayalam slots
 */

const consonantsT = ['ஜ', 'ஷ', 'ஸ', 'ஹ', 'ஶ'];
const consonantsB = ['ജ', 'ഷ', 'സ', 'ഹ', 'ശ'];

const vowelSignsT = ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', ''];
const vowelSignsB = ['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'േ', 'േ', 'ൈ', 'ോ', 'ോ', 'ൌ', ''];

export function convertToEBrahmi(text: string): string {
  let result = text;

  // Normalize Sri
  result = result.replace(/ஶ்ரீ/g, 'ശரീ');
  result = result.replace(/ஸ்ரீ/g, 'ശரீ');

  // Map Grantha consonants + vowel signs to Malayalam equivalents
  for (let i = 0; i < consonantsT.length; i++) {
    for (let j = 0; j < vowelSignsT.length; j++) {
      result = result.replace(
        new RegExp(consonantsT[i] + vowelSignsT[j], 'g'),
        consonantsB[i] + vowelSignsB[j]
      );
    }
  }

  // Remove virama (inherent middle style)
  result = result.replace(/்/g, '');

  return result;
}
