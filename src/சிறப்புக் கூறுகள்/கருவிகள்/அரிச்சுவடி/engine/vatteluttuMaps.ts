/**
 * Tamil → Vatteluttu font mapping engine
 * Ported from Jinavani (Vatteluttu.vue) by Vinodh Rajan
 * Uses e-Velvi font — maps Grantha/Pallava consonants to Malayalam slots
 */

const consonantsT = ['ஜ', 'ஷ', 'ஸ', 'ஹ', 'ஶ'];
const consonantsB = ['ജ', 'ഷ', 'സ', 'ഹ', 'ശ'];

const vowelSignsT = ['ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', '்', ''];
const vowelSignsB = ['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'േ', 'േ', 'ൈ', 'ോ', 'ோ', 'ൌ', '്', ''];

export function convertToVatteluttu(text: string): string {
  let result = text;

  // Normalize Sri
  result = result.replace(/ஶ்ரீ/g, 'ശ്രീ');
  result = result.replace(/ஸ்ரீ/g, 'ശ്രീ');

  // Map Grantha consonants + vowel signs to Malayalam equivalents
  for (let i = 0; i < consonantsT.length; i++) {
    for (let j = 0; j < vowelSignsT.length; j++) {
      result = result.replace(
        new RegExp(consonantsT[i] + vowelSignsT[j], 'g'),
        consonantsB[i] + vowelSignsB[j]
      );
    }
  }

  return result;
}
