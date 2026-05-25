export const LANG_LABELS = { ta: 'தமிழ்', en: 'English', ml: 'മലയാളം', hi: 'Hindi', te: 'Telugu', sa: 'Sanskrit' };

export const analyzePostVersions = (variants: any[]) => {
    if (!variants || variants.length === 0) return null;

    const variantEntries: { lang: string; label: string }[] = [];
    const translitLangs = new Set<string>();
    const translationEntries: { lang: string }[] = [];

    variants.forEach(v => {
        const lang = v.lang || '';
        if (v.label === 'Translation') {
            translationEntries.push({ lang });
        } else {
            variantEntries.push({ lang, label: v.label || 'Original' });
        }
        const translits = v.transliterations || {};
        Object.keys(translits).forEach(tl => translitLangs.add(tl));
    });

    return {
        variants: variantEntries,
        transliterations: [...translitLangs],
        translations: translationEntries,
    };
};
