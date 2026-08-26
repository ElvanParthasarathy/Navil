export const generateSlug = (text: string) => {
    let slug = String(text).replace(/<[^>]+>/g, '').trim().toLowerCase()
        .replace(/[.#$\[\]\/]/g, '').replace(/[\s\n\r]+/g, '-').substring(0, 50).replace(/^-+|-+$/g, '');
    return slug || 'untitled';
};

export const getBestTitle = (item: any) => {
    const firstVariant = item.variants?.[0];
    const englishVariant = item.variants?.find((v: any) => v.lang === 'en' && v.title);
    const titleTransl = firstVariant?.titleTransliterations || {};
    const bestTitleTransl = titleTransl.en || Object.values(titleTransl).filter(v => v && v !== true)[0];
    return item.title || bestTitleTransl || englishVariant?.title || firstVariant?.title || firstVariant?.text || 'untitled';
};

export const textToHtml = (raw: string) => {
    if (!raw) return '';
    if (/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) return raw;
    return raw.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>').join('');
};

export const resolveAuthorForPair = (baseLang: string, tLang: string, authors: Record<string, string>) => {
    if (baseLang === 'ta' && tLang === 'en') return { name: authors['ta_translit'] || authors['en'] || '', locked: true };
    if (baseLang === 'ta' && tLang === 'ml') return { name: authors['ml'] || '', locked: true };
    if (baseLang === 'ml' && tLang === 'en') return { name: authors['ml_translit'] || authors['en'] || '', locked: true };
    if (baseLang === 'ml' && tLang === 'ta') return { name: authors['ta'] || '', locked: true };
    if ((baseLang === 'hi' || baseLang === 'sa') && tLang === 'en') return { name: authors['en'] || '', locked: true };
    return { name: '', locked: false };
};

export const cleanForStorage = (item: any, displayOrder: number, defaultAuthors: Record<string, string>) => {
    const clean = JSON.parse(JSON.stringify(item));
    delete clean.id;
    delete clean.style; delete clean.theme; delete clean.meter; delete clean.slug;
    clean.display_order = displayOrder;
    if (clean.tags && typeof clean.tags === 'string') {
        clean.tags = clean.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (clean.variants) {
        clean.variants.forEach((v: any) => {
            if (v.transliterations?._empty) delete v.transliterations._empty;
            if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
            if (v.authorTransliterations?._empty) delete v.authorTransliterations._empty;
            if (v.text) v.text = textToHtml(v.text);
            if (v.transliterations) {
                Object.keys(v.transliterations).forEach(lang => {
                    if (v.transliterations[lang]) v.transliterations[lang] = textToHtml(v.transliterations[lang]);
                    const resolved = resolveAuthorForPair(v.lang, lang, defaultAuthors);
                    if (resolved.locked && v.authorTransliterations) {
                        const current = v.authorTransliterations[lang] || '';
                        const allDefaults = Object.values(defaultAuthors);
                        const isAutoFilled = !current || allDefaults.includes(current);
                        if (isAutoFilled) v.authorTransliterations[lang] = resolved.name;
                    }
                });
            }
            if (v.transliterations && Object.keys(v.transliterations).length === 0) delete v.transliterations;
            if (v.titleTransliterations && Object.keys(v.titleTransliterations).length === 0) delete v.titleTransliterations;
            if (v.authorTransliterations && Object.keys(v.authorTransliterations).length === 0) delete v.authorTransliterations;
        });
    }
    return clean;
};
