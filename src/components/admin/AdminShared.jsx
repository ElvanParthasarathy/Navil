import React from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBookOpen, FiBook, FiSun, FiChevronUp, FiChevronDown, FiX, FiClock, FiAnchor } from 'react-icons/fi';

// ─── SCHEMAS ───
export const SCHEMAS = {
    quotes: {
        label: 'Quotes', icon: <FiMessageCircle size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Quote Title', type: 'text', placeholder: 'Enter quote title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'style', label: 'Style / Form', type: 'text', placeholder: 'e.g. Couplet, Proverb', datalist: 'poem-styles' },
            { key: 'theme', label: 'Theme', type: 'text', placeholder: 'e.g. Philosophy, Love', datalist: 'poem-themes' },
            { key: 'meter', label: 'Meter / Rhythm', type: 'text', placeholder: 'e.g. Akaval, Venba', datalist: 'poem-meters' },
        ],
        row3Fields: [
            { key: 'classification', label: 'Classification', type: 'text', placeholder: 'e.g. அகம், புறம்', datalist: 'poem-class' },
            { key: 'dedication', label: 'Dedication', type: 'text', placeholder: 'For someone special...' },
        ],
        extraFields: [
            { key: 'urai', label: 'Urai / Meaning', type: 'textarea', rows: 2, placeholder: 'Prose meaning or commentary...' },
            { key: 'notes', label: 'Notes / Context', type: 'textarea', rows: 2, placeholder: 'Background, inspiration...' },
        ],
        getItemTitle: (item) => item.title || 'Untitled Quote',
        getItemSubtitle: (item) => [item.style, item.theme].filter(Boolean).join(' • '),
    },
    poems: {
        label: 'Poems', icon: <FiPenTool size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Poem Title', type: 'text', placeholder: 'Enter poem title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'style', label: 'Style / Form', type: 'text', placeholder: 'e.g. Sonnet, Haiku', datalist: 'poem-styles' },
            { key: 'theme', label: 'Theme', type: 'text', placeholder: 'e.g. Love, Nature', datalist: 'poem-themes' },
            { key: 'meter', label: 'Meter / Rhythm', type: 'text', placeholder: 'e.g. Akaval, Venba', datalist: 'poem-meters' },
        ],
        row3Fields: [
            { key: 'classification', label: 'Classification', type: 'text', placeholder: 'e.g. அகம், புறம்', datalist: 'poem-class' },
            { key: 'dedication', label: 'Dedication', type: 'text', placeholder: 'For someone special...' },
        ],
        extraFields: [
            { key: 'urai', label: 'Urai / Commentary', type: 'textarea', rows: 3, placeholder: 'Prose explanation or meaning...' },
            { key: 'notes', label: 'Notes / Context', type: 'textarea', rows: 2, placeholder: 'Background, inspiration...' },
        ],
        getItemTitle: (item) => item.title || 'Untitled Poem',
        getItemSubtitle: (item) => [item.style, item.theme].filter(Boolean).join(' • '),
    },
    blog: {
        label: 'Blog', icon: <FiEdit3 size={16} />, type: 'standard_post',
        fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'slug', label: 'Slug (URL)', type: 'text', placeholder: 'my-blog-post' },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'tags', label: 'Tags (comma separated)', type: 'text' },
            { key: 'cover', label: 'Cover Image URL', type: 'text' },
            { key: 'excerpt', label: 'Short Excerpt', type: 'textarea', rows: 2 },
            { key: 'content', label: 'Content (Markdown/HTML)', type: 'textarea', rows: 15, fullWidth: true }
        ]
    },
    articles: {
        label: 'Articles', icon: <FiFileText size={16} />, type: 'standard_post',
        fields: [
            { key: 'title', label: 'Article Title', type: 'text', required: true },
            { key: 'slug', label: 'Slug', type: 'text' },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'tags', label: 'Tags', type: 'text' },
            { key: 'cover', label: 'Cover Image URL', type: 'text' },
            { key: 'summary', label: 'Summary', type: 'textarea', rows: 3, fullWidth: true },
            { key: 'content', label: 'Article Body', type: 'textarea', rows: 20, fullWidth: true }
        ]
    },
    essays: {
        label: 'Essays', icon: <FiBookOpen size={16} />, type: 'standard_post',
        fields: [
            { key: 'title', label: 'Essay Title', type: 'text', required: true },
            { key: 'slug', label: 'Slug', type: 'text' },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'subject', label: 'Subject/Topic', type: 'text' },
            { key: 'content', label: 'Essay Content', type: 'textarea', rows: 25, fullWidth: true }
        ]
    },
    stories: {
        label: 'Stories', icon: <FiBook size={16} />, type: 'standard_post',
        fields: [
            { key: 'title', label: 'Story Title', type: 'text', required: true },
            { key: 'slug', label: 'Slug', type: 'text' },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'genre', label: 'Genre', type: 'text' },
            { key: 'cover', label: 'Cover Art URL', type: 'text' },
            { key: 'synopsis', label: 'Synopsis', type: 'textarea', rows: 3 },
            { key: 'content', label: 'Story Content', type: 'textarea', rows: 25, fullWidth: true }
        ]
    },
    thoughts: {
        label: 'Thoughts', icon: <FiSun size={16} />, type: 'standard_post',
        fields: [
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'mood', label: 'Mood', type: 'text' },
            { key: 'content', label: 'Thought Stream', type: 'textarea', rows: 6, fullWidth: true }
        ]
    },
    diary: {
        label: 'Diary', icon: <FiBook size={16} />, type: 'standard_post',
        fields: [
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'title', label: 'Entry Title', type: 'text' },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'content', label: 'Dear Diary...', type: 'textarea', rows: 15, fullWidth: true }
        ]
    }
};

// ─── FIELD INPUT ───
export const FieldInput = ({ field, value, onChange }) => {
    if (field.type === 'textarea') {
        return (
            <textarea
                className="adm-input"
                style={{ minHeight: field.rows ? `${field.rows * 22}px` : '60px' }}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder || ''}
            />
        );
    }
    if (field.datalist) {
        return <input className="adm-input" type="text" list={field.datalist} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
    }
    return <input className="adm-input" type={field.type || 'text'} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
};

// ─── FIELD ROW ───
export const renderFieldRow = (fields, item, collection, index, updateItemField) => (
    <div className="adm-row">
        {fields.map(f => (
            <div key={f.key} style={{ flex: f.flex || 1 }}>
                <label className="adm-label">{f.label}</label>
                <FieldInput field={f} value={item[f.key]} onChange={(val) => updateItemField(collection, index, f.key, val)} />
            </div>
        ))}
    </div>
);


// ─── PIN EDITOR ───
export const PinEditor = ({ item, onUpdate, idPrefix }) => (
    <>
        <div className="adm-field">
            <label className="adm-label">Pin</label>
            <div className="adm-pin-toggle">
                <label className="adm-toggle">
                    <input
                        type="checkbox" id={`pin-${idPrefix}`}
                        checked={!!item.isPinned}
                        onChange={(e) => {
                            const c = e.target.checked;
                            onUpdate('isPinned', c);
                            if (c) {
                                if (!item.pinType) onUpdate('pinType', 'auto');
                                if (!item.pinExpiresAt && (!item.pinType || item.pinType === 'auto')) {
                                    const d = new Date(); d.setDate(d.getDate() + 7);
                                    onUpdate('pinExpiresAt', d.toISOString());
                                }
                            }
                        }}
                    />
                    <span className="adm-toggle-slider"></span>
                </label>
                <span className="adm-pin-status">{item.isPinned ? '✨ Pinned' : 'Off'}</span>
            </div>
        </div>
        {!!item.isPinned && (
            <>
                <div className="adm-field">
                    <label className="adm-label">Pin Mode</label>
                    <div className="adm-pill-group" data-active={(item.pinType || 'auto') === 'auto' ? '0' : '1'}>
                        <button className={`adm-pill-btn ${(item.pinType || 'auto') === 'auto' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); onUpdate('pinType', 'auto'); if (!item.pinExpiresAt) { const d = new Date(); d.setDate(d.getDate() + 7); onUpdate('pinExpiresAt', d.toISOString()); } }}
                        ><FiClock size={12} /> Auto</button>
                        <button className={`adm-pill-btn ${item.pinType === 'permanent' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); onUpdate('pinType', 'permanent'); onUpdate('pinExpiresAt', null); }}
                        ><FiAnchor size={12} /> Permanent</button>
                    </div>
                </div>
                {(item.pinType || 'auto') === 'auto' && (
                    <div className="adm-field">
                        <label className="adm-label">Expires At</label>
                        <input className="adm-input" type="datetime-local"
                            value={item.pinExpiresAt ? new Date(new Date(item.pinExpiresAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                            onChange={(e) => { const v = e.target.value; onUpdate('pinExpiresAt', v ? new Date(v).toISOString() : null); }}
                        />
                    </div>
                )}
            </>
        )}
    </>
);

// ─── TRANSLITERATION EDITOR ───
export const TransliterationEditor = ({ variant, onUpdateTransl, onToggleLang, idPrefix }) => {
    const indicLangs = ['ta', 'ml', 'hi', 'sa'];
    if (!indicLangs.includes(variant.lang)) return null;
    const keys = variant.transliterations ? Object.keys(variant.transliterations) : [];

    return (
        <div className="adm-translit">
            <div className="adm-translit-header">Transliterations</div>
            {keys.map(tLang => (
                <div key={tLang} className="adm-translit-lang">
                    <div className="adm-translit-lang-top">
                        <span>Lang: <code>{tLang}</code></span>
                        <button className="adm-btn danger small" onClick={(e) => { e.preventDefault(); onToggleLang(tLang); }}><FiX size={12} /> Remove</button>
                    </div>
                    <div className="adm-form">
                        <div className="adm-field">
                            <label className="adm-label" style={{ paddingLeft: '14px' }}>Title</label>
                            <input className="adm-input" value={variant.titleTransliterations?.[tLang] || ''} onChange={(e) => onUpdateTransl('titleTransliterations', tLang, e.target.value)} placeholder={`Romanized title`} />
                        </div>
                        <div className="adm-field">
                            <label className="adm-label" style={{ paddingLeft: '14px' }}>Text</label>
                            <textarea
                                className="adm-input"
                                style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '1.05rem', lineHeight: '1.6' }}
                                value={variant.transliterations?.[tLang] || ''}
                                onChange={(e) => onUpdateTransl('transliterations', tLang, e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            ))}
            <div className="adm-translit-add">
                <input id={`add-transl-${idPrefix}`} className="adm-input" list="lang-options" placeholder="e.g. ml" style={{ width: '80px', padding: '5px 8px' }} maxLength="3" />
                <button className="adm-btn" onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById(`add-transl-${idPrefix}`);
                    if (input?.value.trim()) {
                        onUpdateTransl('transliterations', input.value.trim().toLowerCase(), '');
                        onUpdateTransl('titleTransliterations', input.value.trim().toLowerCase(), '');
                        input.value = '';
                    }
                }}>+ Add</button>
            </div>
        </div>
    );
};

// ─── VARIANT CARD ───
export const VariantCard = ({ variant, vIndex, totalVariants, onUpdate, onUpdateTransl, onToggleLang, onRemove, onMove, idPrefix }) => (
    <div className="adm-variant">
        <div className="adm-variant-number">
            #{vIndex + 1}
        </div>
        <div className="adm-variant-controls">
            <button className="adm-btn ghost" onClick={() => onMove('up')} disabled={vIndex === 0}><FiChevronUp size={14} /> Move Up</button>
            <button className="adm-btn ghost" onClick={() => onMove('down')} disabled={vIndex === totalVariants - 1}><FiChevronDown size={14} /> Move Down</button>
            <button className="adm-btn danger" onClick={onRemove}><FiX size={14} /> Remove</button>
        </div>
        <div className="adm-form">
            <div className="adm-row">
                <div style={{ maxWidth: '120px' }}>
                    <label className="adm-label" style={{ paddingLeft: '14px' }}>Label</label>
                    <input className="adm-input" list="variant-labels" value={variant.label || ''} onChange={(e) => onUpdate('label', e.target.value)} placeholder="Original" />
                </div>
                {vIndex !== 0 && (
                    <div>
                        <label className="adm-label" style={{ paddingLeft: '14px' }}>Variant Title</label>
                        <input className="adm-input" value={variant.title || ''} onChange={(e) => onUpdate('title', e.target.value)} placeholder="Title" />
                    </div>
                )}
                <div style={{ maxWidth: '80px' }}>
                    <label className="adm-label" style={{ paddingLeft: '14px' }}>Lang</label>
                    <input className="adm-input" list="lang-options" value={variant.lang || ''} onChange={(e) => onUpdate('lang', e.target.value)} placeholder="ta" />
                </div>
            </div>
            <div className="adm-field">
                <label className="adm-label" style={{ paddingLeft: '14px' }}>Author</label>
                <input className="adm-input" value={variant.author || ''} onChange={(e) => onUpdate('author', e.target.value)} placeholder="Author" />
            </div>
            <div className="adm-field">
                <label className="adm-label" style={{ paddingLeft: '14px' }}>Text</label>
                <textarea className="adm-input adm-typer" style={{ minHeight: '360px', fontSize: '1.2rem', lineHeight: '1.8' }} value={variant.text || ''} onChange={(e) => onUpdate('text', e.target.value)} placeholder="Write your content here..." />
            </div>
            <TransliterationEditor variant={variant} onUpdateTransl={onUpdateTransl} onToggleLang={onToggleLang} idPrefix={idPrefix} />
        </div>
    </div>
);

// ─── SHARED DATALISTS (For Combobox autofill) ───
export const SharedDatalists = () => (
    <>
        <datalist id="poem-styles">
            <option value="Free Verse" />
            <option value="Sonnet" />
            <option value="Haiku" />
            <option value="Couplet" />
            <option value="Proverb" />
            <option value="Limerick" />
        </datalist>
        <datalist id="poem-themes">
            <option value="Love" />
            <option value="Nature" />
            <option value="Philosophy" />
            <option value="Life" />
            <option value="Death" />
            <option value="Admiration" />
            <option value="Satire" />
        </datalist>
        <datalist id="poem-meters">
            <option value="Venba" />
            <option value="Akaval" />
            <option value="Kalippa" />
            <option value="Vanchi" />
            <option value="Santham" />
        </datalist>
        <datalist id="poem-class">
            <option value="அகம் (Agam) - Inner/Love" />
            <option value="புறம் (Puram) - Outer/War/Public" />
            <option value="Modern" />
            <option value="Devotional" />
        </datalist>
        <datalist id="variant-labels">
            <option value="Original" />
            <option value="Translation" />
            <option value="Adaptation" />
            <option value="Commentary" />
        </datalist>
        <datalist id="lang-options">
            <option value="ta" label="Tamil" />
            <option value="ml" label="Malayalam" />
            <option value="en" label="English" />
            <option value="hi" label="Hindi" />
            <option value="sa" label="Sanskrit" />
        </datalist>
    </>
);
