import { UI_TA, UI_EN, UI_TANGLISH, lookupUiKey } from '../i18n';

export type LangMode = 'bilingual' | 'tanglish-en';

const VALID_MODES: ReadonlyArray<LangMode> = ['bilingual', 'tanglish-en'];
const STORAGE_KEY = 'langMode';

const UI_ATTR_SELECTOR = '[data-ui-ta], [data-ui-en], [data-ui-pair], [data-ui-placeholder], [data-ui-title], [data-ui-tip]';

let activeObserver: MutationObserver | null = null;
let pendingMutationFlush = false;
let isApplying = false;

function usesTanglishScript(mode: LangMode): boolean {
  return mode === 'tanglish-en';
}

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

/**
 * Resolves declarative locale UI keys (`data-ui-ta`, `data-ui-en`,
 * `data-ui-pair`, `data-ui-placeholder`, `data-ui-tip`, `data-ui-title`)
 * strictly from `UI_TA`, `UI_EN`, and Navil-derived `UI_TANGLISH`.
 * Never mutates or hides literary, art, or biographical content.
 */
function applyLocaleUiKeys(rootBody: HTMLElement, mode: LangMode): void {
  const taOrRomTree = usesTanglishScript(mode) ? UI_TANGLISH : UI_TA;

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

    const nextVal =
      taPart && enPart && taPart !== enPart
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
    const nextTip = enCombined ? `${taPart} (${enCombined})` : taPart;
    if (nextTip && el.getAttribute('data-tip') !== nextTip) {
      el.setAttribute('data-tip', nextTip);
    }
  });
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
    applyLocaleUiKeys(rootBody, mode);
    syncLangSwitcherControls(rootDoc, mode);
  } finally {
    isApplying = false;
  }
}

export function syncLangSwitcherControls(rootDoc: Document = document, mode?: LangMode): void {
  const activeMode = mode || getSavedLangMode();
  const idx = activeMode === 'bilingual' ? 0 : 1;

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
    const descKey = activeMode === 'bilingual' ? 'modeBilingualDesc' : 'modeTanglishEnDesc';
    const taSrc = usesTanglishScript(activeMode) ? UI_TANGLISH : UI_TA;
    if (settingsDescTa) settingsDescTa.textContent = taSrc.settingsPage[descKey];
    if (settingsDescEn) settingsDescEn.textContent = UI_EN.settingsPage[descKey];
  }

  const settingsPreviewSample = rootDoc.getElementById('settings-lang-preview-sample');
  if (settingsPreviewSample) {
    const taSrc = usesTanglishScript(activeMode) ? UI_TANGLISH : UI_TA;
    settingsPreviewSample.textContent = taSrc.settingsPage.previewSample;
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

function hasAddedUiKeyNodes(mutations: MutationRecord[]): boolean {
  for (const m of mutations) {
    if (m.type !== 'childList' || m.addedNodes.length === 0) continue;
    for (const node of m.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      if (el.matches(UI_ATTR_SELECTOR) || el.querySelector(UI_ATTR_SELECTOR)) {
        return true;
      }
    }
  }
  return false;
}

function startMutationObserver(): void {
  if (typeof MutationObserver === 'undefined' || !document.body) return;
  if (activeObserver) {
    activeObserver.disconnect();
  }

  activeObserver = new MutationObserver((mutations) => {
    if (isApplying) return;
    if (getSavedLangMode() === 'bilingual') return;
    if (!hasAddedUiKeyNodes(mutations)) return;

    if (!pendingMutationFlush) {
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
