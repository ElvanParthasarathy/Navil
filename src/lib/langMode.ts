import {
  UI_TA,
  UI_EN,
  UI_TANGLISH,
  transliterateInlineTamil,
  lookupUiKey,
} from '../i18n';

export type LangMode = 'bilingual' | 'tamil' | 'tanglish-en' | 'tanglish';

const VALID_MODES: ReadonlyArray<LangMode> = ['bilingual', 'tamil', 'tanglish-en', 'tanglish'];
const STORAGE_KEY = 'langMode';

function usesTanglishScript(mode: LangMode): boolean {
  return mode === 'tanglish-en' || mode === 'tanglish';
}

function isPureSingleScript(mode: LangMode): boolean {
  return mode === 'tamil' || mode === 'tanglish';
}

const TAMIL_CHAR_RE = /[\u0B80-\u0BFF]/;

// Original content text & non-key attributes preserved losslessly per node identity
const origTextMap = new WeakMap<Text, string>();
const origAttrMap = new WeakMap<Element, Record<string, string>>();

const SKIP_SELECTOR = [
  'script',
  'style',
  'noscript',
  'template',
  'textarea',
  'input',
  'code',
  'pre',
  'svg',
  'canvas',
  '[contenteditable="true"]',
  '[data-no-translit]',
  '[data-ui-ta]',
  '[data-ui-en]',
  '[data-ui-pair]',
  '.translit-grid',
  '.translit-controls-row',
  '.arichuvadi-subview-container',
  '[class*="arichuvadi-output"]',
  '.font-specimen-box',
].join(',');

const CONTENT_TITLE_CASE_SELECTOR = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  '.blog-title',
  '.blog-classification-badge',
  '.blog-featured-badge',
  '.classification-badge',
  '.series-badge',
  '.tv-series-title',
  '.tv-ep-title',
  '.art-archive-body h3',
  '.variant-badge',
  'th',
  'option',
].join(',');

const TRANSLIT_ATTRS = ['placeholder', 'data-tip', 'title'] as const;

let activeObserver: MutationObserver | null = null;
let pendingMutationFlush = false;
let isApplying = false;

export function normalizeLangMode(raw: string | null | undefined): LangMode {
  if (raw && (VALID_MODES as readonly string[]).includes(raw)) {
    return raw as LangMode;
  }
  return 'bilingual';
}

export function getSavedLangMode(): LangMode {
  try {
    return normalizeLangMode(localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'bilingual';
  }
}

function shouldSkipContentElement(el: Element | null): boolean {
  if (!el) return true;
  return Boolean(el.closest(SKIP_SELECTOR));
}

function formatContentText(original: string, parentEl: Element | null, mode: LangMode): string {
  if (!usesTanglishScript(mode)) return original;
  if (!TAMIL_CHAR_RE.test(original)) return original;
  const isTitle = Boolean(parentEl && parentEl.closest(CONTENT_TITLE_CASE_SELECTOR));
  return transliterateInlineTamil(original, isTitle ? 'title' : 'sentence');
}

/**
 * Resolves all declarative locale UI keys (`data-ui-ta`, `data-ui-en`,
 * `data-ui-pair`, `data-ui-placeholder`, `data-ui-tip`, `data-ui-title`)
 * cleanly from `UI_TA`, `UI_EN`, and Navil-derived `UI_TANGLISH`.
 */
function applyLocaleUiKeys(rootBody: HTMLElement, mode: LangMode): void {
  const taOrRomTree = usesTanglishScript(mode) ? UI_TANGLISH : UI_TA;
  const pureSingleScript = isPureSingleScript(mode);

  rootBody.querySelectorAll('[data-ui-ta]').forEach((el) => {
    const key = el.getAttribute('data-ui-ta');
    if (!key) return;
    const nextVal = lookupUiKey(taOrRomTree, key);
    if (nextVal && el.textContent !== nextVal) {
      el.textContent = nextVal;
    }
  });

  rootBody.querySelectorAll('[data-ui-en]').forEach((el) => {
    const key = el.getAttribute('data-ui-en');
    if (!key) return;
    const nextVal = lookupUiKey(UI_EN, key);
    if (nextVal && el.textContent !== nextVal) {
      el.textContent = nextVal;
    }
  });

  rootBody.querySelectorAll('[data-ui-pair]').forEach((el) => {
    const key = el.getAttribute('data-ui-pair');
    if (!key) return;
    const sep = el.getAttribute('data-ui-sep') ?? ' • ';
    const taPart = lookupUiKey(taOrRomTree, key);
    const enPart = lookupUiKey(UI_EN, key);
    if (!taPart && !enPart) return;

    const nextVal = pureSingleScript
      ? taPart || enPart
      : taPart && enPart && taPart !== enPart
        ? `${taPart}${sep}${enPart}`
        : taPart || enPart;

    if (el.textContent !== nextVal) {
      el.textContent = nextVal;
    }
  });

  rootBody.querySelectorAll('[data-ui-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-ui-placeholder');
    if (!key) return;
    const nextVal = lookupUiKey(taOrRomTree, key);
    if (nextVal && el.getAttribute('placeholder') !== nextVal) {
      el.setAttribute('placeholder', nextVal);
    }
  });

  rootBody.querySelectorAll('[data-ui-title]').forEach((el) => {
    const key = el.getAttribute('data-ui-title');
    if (!key) return;
    const nextVal = lookupUiKey(taOrRomTree, key);
    if (nextVal && el.getAttribute('title') !== nextVal) {
      el.setAttribute('title', nextVal);
    }
  });

  rootBody.querySelectorAll('[data-ui-tip]').forEach((el) => {
    const key = el.getAttribute('data-ui-tip');
    if (!key) return;
    const taPart = lookupUiKey(taOrRomTree, key);
    const enPart = lookupUiKey(UI_EN, key);
    const badge = el.getAttribute('data-ui-tip-badge') || '';
    const enCombined = badge ? `${enPart} • ${badge}` : enPart;
    const nextTip = pureSingleScript
      ? badge
        ? `${taPart} (${badge})`
        : taPart
      : enCombined
        ? `${taPart} (${enCombined})`
        : taPart;
    if (nextTip && el.getAttribute('data-tip') !== nextTip) {
      el.setAttribute('data-tip', nextTip);
    }
  });
}

function processContentAttributes(el: Element, mode: LangMode): void {
  if (
    el.hasAttribute('data-ui-placeholder') ||
    el.hasAttribute('data-ui-tip') ||
    el.hasAttribute('data-ui-title') ||
    shouldSkipContentElement(el)
  ) {
    return;
  }

  let cached = origAttrMap.get(el);
  if (!cached) {
    const snapshot: Record<string, string> = {};
    let hasRelevant = false;
    for (const attr of TRANSLIT_ATTRS) {
      const val = el.getAttribute(attr);
      if (val && TAMIL_CHAR_RE.test(val)) {
        snapshot[attr] = val;
        hasRelevant = true;
      }
    }
    if (!hasRelevant) return;
    origAttrMap.set(el, snapshot);
    cached = snapshot;
  }

  for (const attr of Object.keys(cached)) {
    const orig = cached[attr];
    if (!usesTanglishScript(mode)) {
      if (el.getAttribute(attr) !== orig) {
        el.setAttribute(attr, orig);
      }
      continue;
    }
    const formatted = transliterateInlineTamil(orig, attr === 'placeholder' ? 'sentence' : 'title');
    if (el.getAttribute(attr) !== formatted) {
      el.setAttribute(attr, formatted);
    }
  }
}

function normalizeCmpPrefix(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16);
}

function syncPlayerDuplicateSubWraps(rootDoc: Document, mode: LangMode): void {
  const pairs: Array<[string, string, string]> = [
    ['poem-main-text', 'poem-sub-text', 'poem-sub-wrap'],
    ['quote-main-text', 'quote-sub-text', 'quote-sub-wrap'],
    ['nav-poem-main', 'nav-poem-sub', 'nav-poem-sub-wrap'],
    ['nav-quote-main', 'nav-quote-sub', 'nav-quote-sub-wrap'],
  ];

  const pureSingleScript = isPureSingleScript(mode);

  for (const [mainId, subId, wrapId] of pairs) {
    const mainEl = rootDoc.getElementById(mainId);
    const subEl = rootDoc.getElementById(subId);
    const wrapEl = rootDoc.getElementById(wrapId);
    if (!wrapEl || !mainEl || !subEl) continue;

    if (mode === 'bilingual') {
      wrapEl.removeAttribute('data-dup-tanglish');
      continue;
    }

    const origMain =
      (mainEl.firstChild ? origTextMap.get(mainEl.firstChild as Text) : undefined) ||
      mainEl.textContent ||
      '';
    const subLang = subEl.getAttribute('lang') || '';
    const subText = subEl.textContent || '';
    const mainHasTamil = TAMIL_CHAR_RE.test(origMain);
    const subHasTamil = TAMIL_CHAR_RE.test(subText);

    const subIsAlreadyTranslit =
      subLang === 'en' &&
      !subHasTamil &&
      mainHasTamil &&
      normalizeCmpPrefix(transliterateInlineTamil(origMain, 'sentence')) === normalizeCmpPrefix(subText);

    const hideInPureMode = pureSingleScript && mainHasTamil && !subHasTamil;

    if (subIsAlreadyTranslit || hideInPureMode) {
      wrapEl.setAttribute('data-dup-tanglish', 'true');
    } else {
      wrapEl.removeAttribute('data-dup-tanglish');
    }
  }
}

export function applyLangModeToRoot(rootDoc: Document = document, forcedMode?: LangMode): void {
  const mode = forcedMode || getSavedLangMode();
  const rootEl = rootDoc.documentElement;
  if (rootEl) {
    rootEl.setAttribute('data-lang-mode', mode);
  }

  const rootBody = rootDoc.body;
  if (!rootBody) return;

  isApplying = true;
  try {
    // 1. Update structured UI keys cleanly from src/i18n/ta.ts + en.ts + Navil-derived UI_TANGLISH
    applyLocaleUiKeys(rootBody, mode);

    // 2. Dynamically transliterate dynamic Tamil content (poems, quotes, articles, stories, captions)
    const walker = rootDoc.createTreeWalker(rootBody, NodeFilter.SHOW_TEXT, {
      acceptNode(node: Node) {
        const textNode = node as Text;
        const parent = textNode.parentElement;
        if (!parent || shouldSkipContentElement(parent)) return NodeFilter.FILTER_REJECT;
        if (origTextMap.has(textNode)) return NodeFilter.FILTER_ACCEPT;
        const val = textNode.nodeValue || '';
        if (!val.trim() || !TAMIL_CHAR_RE.test(val)) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes: Text[] = [];
    let current: Node | null;
    while ((current = walker.nextNode())) {
      nodes.push(current as Text);
    }

    for (const textNode of nodes) {
      let orig = origTextMap.get(textNode);
      if (orig === undefined) {
        orig = textNode.nodeValue || '';
        origTextMap.set(textNode, orig);
      }

      const nextVal = formatContentText(orig, textNode.parentElement, mode);
      if (textNode.nodeValue !== nextVal) {
        textNode.nodeValue = nextVal;
      }
    }

    rootBody.querySelectorAll('[placeholder], [data-tip], [title]').forEach((el) => {
      processContentAttributes(el, mode);
    });

    syncPlayerDuplicateSubWraps(rootDoc, mode);
    syncLangSwitcherControls(rootDoc, mode);
  } finally {
    isApplying = false;
  }
}

export function syncLangSwitcherControls(rootDoc: Document = document, mode?: LangMode): void {
  const activeMode = mode || getSavedLangMode();
  const idx =
    activeMode === 'tamil'
      ? 0
      : activeMode === 'bilingual'
        ? 1
        : activeMode === 'tanglish-en'
          ? 2
          : 3;

  const desktopThumb = rootDoc.getElementById('desktop-lang-thumb');
  if (desktopThumb) {
    desktopThumb.style.transform = `translateX(${idx * 100}%)`;
  }

  const settingsIndicator = rootDoc.getElementById('settings-lang-slider-indicator');
  if (settingsIndicator) {
    settingsIndicator.style.transform = `translateX(${idx * 100}%)`;
  }

  const settingsDescTa = rootDoc.getElementById('settings-lang-desc-ta');
  const settingsDescEn = rootDoc.getElementById('settings-lang-desc-en');
  if (settingsDescTa || settingsDescEn) {
    const descKey =
      activeMode === 'tamil'
        ? 'modeTamilDesc'
        : activeMode === 'bilingual'
          ? 'modeBilingualDesc'
          : activeMode === 'tanglish-en'
            ? 'modeTanglishEnDesc'
            : 'modeTanglishDesc';
    const taSrc = usesTanglishScript(activeMode) ? UI_TANGLISH : UI_TA;
    if (settingsDescTa) settingsDescTa.textContent = taSrc.settingsPage[descKey];
    if (settingsDescEn) settingsDescEn.textContent = UI_EN.settingsPage[descKey];
  }

  const settingsPreviewSample = rootDoc.getElementById('settings-lang-preview-sample');
  if (settingsPreviewSample) {
    settingsPreviewSample.textContent =
      activeMode === 'tamil'
        ? UI_TA.settingsPage.previewSample
        : activeMode === 'bilingual'
          ? `${UI_TA.settingsPage.previewSample} • ${UI_EN.settingsPage.previewSample}`
          : activeMode === 'tanglish-en'
            ? `${UI_TANGLISH.settingsPage.previewSample} • ${UI_EN.settingsPage.previewSample}`
            : UI_TANGLISH.settingsPage.previewSample;
  }

  rootDoc.querySelectorAll('[data-lang-choice]').forEach((el) => {
    const choice = el.getAttribute('data-lang-choice');
    const isMatch = choice === activeMode;
    el.classList.toggle('active', isMatch);
    el.classList.toggle('selected', isMatch);
    el.setAttribute('aria-pressed', String(isMatch));
  });
}

export function setLangMode(next: LangMode): void {
  const normalized = normalizeLangMode(next);
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // Ignore storage failures
  }
  applyLangModeToRoot(document, normalized);
}

function bindLangChoiceButtons(): void {
  document.querySelectorAll('[data-lang-choice]').forEach((btn) => {
    const el = btn as HTMLElement;
    if (el.dataset.langBound) return;
    el.dataset.langBound = '1';
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const choice = el.getAttribute('data-lang-choice');
      if (choice) {
        setLangMode(normalizeLangMode(choice));
      }
    });
  });
}

function startMutationObserver(): void {
  if (typeof MutationObserver === 'undefined' || !document.body) return;
  if (activeObserver) {
    activeObserver.disconnect();
  }

  activeObserver = new MutationObserver((mutations) => {
    if (isApplying) return;
    const mode = getSavedLangMode();
    if (mode === 'bilingual') return;

    let hasAddedOrTamil = false;
    for (const m of mutations) {
      if (m.type === 'childList' && m.addedNodes.length > 0) {
        hasAddedOrTamil = true;
        break;
      }
      if (m.type === 'characterData') {
        const txt = m.target as Text;
        const val = txt.nodeValue || '';
        if (TAMIL_CHAR_RE.test(val)) {
          origTextMap.set(txt, val);
          hasAddedOrTamil = true;
          break;
        }
      }
    }

    if (hasAddedOrTamil && !pendingMutationFlush) {
      pendingMutationFlush = true;
      queueMicrotask(() => {
        pendingMutationFlush = false;
        applyLangModeToRoot(document);
      });
    }
  });

  activeObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export function initDynamicLangMode(): void {
  const win = window as any;
  win.__elvanSetLangMode = setLangMode;
  win.__elvanGetLangMode = getSavedLangMode;
  win.__elvanApplyLangMode = applyLangModeToRoot;

  if (win.__elvanLangInit) return;
  win.__elvanLangInit = true;

  const runPageSync = () => {
    bindLangChoiceButtons();
    applyLangModeToRoot(document);
    startMutationObserver();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPageSync, { once: true });
  } else {
    runPageSync();
  }

  document.addEventListener('astro:before-swap', (ev: any) => {
    if (ev && ev.newDocument) {
      applyLangModeToRoot(ev.newDocument, getSavedLangMode());
    }
  });

  document.addEventListener('astro:page-load', () => {
    runPageSync();
  });
}
