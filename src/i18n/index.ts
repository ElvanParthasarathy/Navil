import { UI_TA } from './ta';
import { UI_EN } from './en';
import type { UITranslations } from './schema';
import { transliterate, capitalizeWords } from '../சிறப்புக்கூறுகள்/கருவிகள்/மொழிமாற்றி/பயன்பாடுகள்/மொழிமாற்றம்';

export type { UITranslations } from './schema';
export { UI_TA } from './ta';
export { UI_EN } from './en';

const TAMIL_CHAR_RE = /[\u0B80-\u0BFF]/;
const TAMIL_WORD_RE = /[\u0B80-\u0BFF]+/g;

export type UiCasing = 'title' | 'sentence';

/**
 * Transliterates Tamil segments via the Navil Tolkappiyam engine while keeping
 * inline English words, acronyms, punctuation, and whitespace untouched.
 */
export function transliterateInlineTamil(raw: string, casing: UiCasing = 'sentence'): string {
  if (!raw || !TAMIL_CHAR_RE.test(raw)) return raw;

  if (casing === 'title') {
    return raw.replace(TAMIL_WORD_RE, (word) => capitalizeWords(transliterate(word, 'extended++')));
  }

  let out = '';
  let lastIdx = 0;
  let capitalizeNextWord = true;
  TAMIL_WORD_RE.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = TAMIL_WORD_RE.exec(raw)) !== null) {
    const gap = raw.slice(lastIdx, m.index);
    out += gap;

    if (/[.?!:\r\n]/.test(gap)) {
      capitalizeNextWord = true;
    } else if (/[a-zA-Z0-9]/.test(gap)) {
      capitalizeNextWord = false;
    }

    const rom = transliterate(m[0], 'extended++');
    if (capitalizeNextWord && rom.length > 0) {
      out += rom.replace(/^([a-z])/, (_, ch: string) => ch.toUpperCase());
      capitalizeNextWord = false;
    } else {
      out += rom;
    }

    lastIdx = m.index + m[0].length;
  }

  out += raw.slice(lastIdx);
  return out;
}

const SENTENCE_KEYS = new Set(['studioTagline', 'navilDef', 'welcomeSubtitle', 'shortDesc', 'desc', 'subtitle', 'editorial', 'heroDesc', 'lockedPrompt', 'subtext', 'comingSoonDesc', 'comingDesc', 'sendMsgDesc', 'modeBilingualDesc', 'modeTanglishEnDesc', 'modeTanglishDesc', 'themeAutoDesc', 'themeDarkDesc', 'themeLightDesc']);

function buildTanglishTree(node: unknown, keyName = ''): unknown {
  if (typeof node === 'string') {
    const useSentence =
      node.length > 60 ||
      node.includes('...') ||
      SENTENCE_KEYS.has(keyName) ||
      keyName.endsWith('Desc') ||
      keyName.endsWith('Subtitle') ||
      keyName.endsWith('Hint');
    return transliterateInlineTamil(node, useSentence ? 'sentence' : 'title');
  }
  if (Array.isArray(node)) {
    return node.map((item) => buildTanglishTree(item, keyName));
  }
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = buildTanglishTree(v, k);
    }
    return out;
  }
  return node;
}

/**
 * Dynamically generated Tanglish UI locale derived cleanly from `UI_TA` using
 * Navil Transliterator — zero hardcoded Tanglish UI copy.
 */
export const UI_TANGLISH: UITranslations = buildTanglishTree(UI_TA) as UITranslations;

export function lookupUiKey(tree: UITranslations, keyPath: string): string {
  const parts = keyPath.split('.');
  let cur: unknown = tree;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object') return '';
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : '';
}
