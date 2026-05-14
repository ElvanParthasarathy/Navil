import React from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBookOpen, FiBook, FiSun, FiChevronUp, FiChevronDown, FiX, FiClock, FiAnchor } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';

// ─── SCHEMAS ───

// Default author names per language — auto-filled when language is set
export const DEFAULT_AUTHORS = {
    ta: 'எலவன் பார்த்தசாரதி',
    ml: 'എൽവൻ പാർത്തചാരതി',
    en: 'Elvan Parthasarathy',
};

export const SCHEMAS = {
    quotes: {
        label: 'Quotes', icon: <FiMessageCircle size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Quote Title', type: 'text', placeholder: 'Enter quote title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'classification', label: 'Classification', type: 'text', placeholder: 'அகம், புறம், etc.', datalist: 'poem-class' },
            { key: 'dedication', label: 'Dedication', type: 'text', placeholder: 'For someone special...' },
        ],
        row3Fields: [
            { key: 'tags', label: 'Tags / Style', type: 'tags', placeholder: 'e.g. சங்கம், தமிழாளம், Free Verse', suggestions: ['சங்கம்', 'தமிழாளம்', 'Modern', 'Free Verse', 'Haiku', 'Sonnet', 'Couplet'] },
        ],
        extraFields: [
            { key: 'urai', label: 'Urai / Meaning', type: 'textarea', rows: 2, placeholder: 'Prose meaning or commentary...' },
            { key: 'notes', label: 'Notes / Context', type: 'textarea', rows: 2, placeholder: 'Background, inspiration...' },
        ],
        getItemTitle: (item) => item.title || 'Untitled Quote',
        getItemSubtitle: (item) => [item.classification, ...(item.tags || [])].filter(Boolean).join(' • '),
    },
    poems: {
        label: 'Poems', icon: <FiPenTool size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Poem Title', type: 'text', placeholder: 'Enter poem title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'classification', label: 'Classification', type: 'text', placeholder: 'அகம், புறம், etc.', datalist: 'poem-class' },
            { key: 'dedication', label: 'Dedication', type: 'text', placeholder: 'For someone special...' },
        ],
        row3Fields: [
            { key: 'tags', label: 'Tags / Style', type: 'tags', placeholder: 'e.g. சங்கம், தமிழாளம், Free Verse', suggestions: ['சங்கம்', 'தமிழாளம்', 'Modern', 'Free Verse', 'Haiku', 'Sonnet', 'Venba', 'Akaval'] },
        ],
        extraFields: [
            { key: 'urai', label: 'Urai / Commentary', type: 'textarea', rows: 3, placeholder: 'Prose explanation or meaning...' },
            { key: 'notes', label: 'Notes / Context', type: 'textarea', rows: 2, placeholder: 'Background, inspiration...' },
        ],
        getItemTitle: (item) => item.title || 'Untitled Poem',
        getItemSubtitle: (item) => [item.classification, ...(item.tags || [])].filter(Boolean).join(' • '),
    },
    blog: {
        label: 'Blog', icon: <FiEdit3 size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Post Title', type: 'text', placeholder: 'Enter post title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Life, Tech, Tamil' },
            { key: 'classification', label: 'Classification', type: 'text', datalist: 'poem-class' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Blog',
        getItemSubtitle: (item) => item.tags || '',
    },
    articles: {
        label: 'Articles', icon: <FiFileText size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Article Title', type: 'text', placeholder: 'Enter article title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Politics, Review' },
            { key: 'classification', label: 'Classification', type: 'text', datalist: 'poem-class' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Article',
        getItemSubtitle: (item) => item.tags || '',
    },
    essays: {
        label: 'Essays', icon: <FiBookOpen size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Essay Title', type: 'text', placeholder: 'Enter essay title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Philosophy, Science' },
            { key: 'classification', label: 'Classification', type: 'text', datalist: 'poem-class' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Essay',
        getItemSubtitle: (item) => item.tags || '',
    },
    stories: {
        label: 'Stories', icon: <FiBook size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Story Title', type: 'text', placeholder: 'Enter story title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Fantasy, Slice of Life' },
            { key: 'series_name', label: 'Series', type: 'text', placeholder: 'My College Days' },
            { key: 'series_part', label: 'Part / Chapter', type: 'number', placeholder: '1' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Art URL', type: 'text', placeholder: 'https://...' },
            { key: 'classification', label: 'Classification', type: 'text', datalist: 'poem-class' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Story',
        getItemSubtitle: (item) => {
            const parts = [item.tags];
            if (item.series_name) parts.push(`${item.series_name} #${item.series_part || '?'}`);
            return parts.filter(Boolean).join(' • ');
        },
    },
    thoughts: {
        label: 'Thoughts', icon: <FiSun size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Title', type: 'text', placeholder: 'A quick thought...', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Reflection, Daily' },
            { key: 'classification', label: 'Classification', type: 'text', datalist: 'poem-class' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.text?.replace(/<[^>]+>/g, '').slice(0, 50) || 'Untitled Thought',
        getItemSubtitle: (item) => item.tags || '',
    },
    diary: {
        label: 'Diary', icon: <FiBook size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Entry Title', type: 'text', placeholder: 'Today...', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'is_private', label: 'Private Entry', type: 'toggle' },
            { key: 'classification', label: 'Classification', type: 'text', datalist: 'poem-class' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Entry',
        getItemSubtitle: (item) => item.is_private ? '🔒 Private' : '',
    }
};

// ─── TAG INPUT COMPONENT ───
const TagInput = ({ value, onChange, placeholder, suggestions = [] }) => {
    const tags = Array.isArray(value) ? value : (value ? String(value).split(',').map(t => t.trim()).filter(Boolean) : []);
    const [input, setInput] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const addTag = (tag) => {
        const trimmed = (tag || input).trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const removeTag = (idx) => {
        onChange(tags.filter((_, i) => i !== idx));
    };

    const updateTag = (idx, newValue) => {
        const newTags = [...tags];
        newTags[idx] = newValue;
        onChange(newTags);
    };

    const filteredSuggestions = suggestions.filter(s => 
        !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            {/* Existing tags as a list */}
            {tags.length > 0 && (
                <div className="adm-tag-list">
                    {tags.map((tag, i) => (
                        <div key={i} className="adm-tag-row">
                            <input
                                className="adm-tag-row-input"
                                value={tag}
                                onChange={(e) => updateTag(i, e.target.value)}
                            />
                            <button type="button" onClick={() => removeTag(i)} className="adm-tag-row-remove" title="Remove">×</button>
                        </div>
                    ))}
                </div>
            )}
            {/* Add new tag */}
            <div className="adm-tag-add-row">
                <input
                    className="adm-input"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && input.trim()) {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    placeholder={placeholder || 'Type to add...'}
                    style={{ flex: 1 }}
                />
                <button
                    type="button"
                    className="adm-btn"
                    onClick={() => addTag()}
                    disabled={!input.trim()}
                    style={{ flexShrink: 0 }}
                >+ Add</button>
            </div>
            {showSuggestions && input && filteredSuggestions.length > 0 && (
                <div className="adm-tag-suggestions">
                    {filteredSuggestions.map(s => (
                        <button key={s} type="button" className="adm-tag-suggestion-item" onMouseDown={() => addTag(s)}>{s}</button>
                    ))}
                </div>
            )}
            <style>{`
                .adm-tag-list {
                    display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;
                }
                .adm-tag-row {
                    display: flex; align-items: center; gap: 8px;
                    padding: 5px 12px; border-radius: 8px;
                    background: color-mix(in srgb, var(--accent, #088370) 12%, transparent);
                    border: 1px solid transparent;
                    transition: border-color 0.2s;
                }
                .adm-tag-row:focus-within {
                    border-color: color-mix(in srgb, var(--accent, #088370) 40%, transparent);
                }
                .adm-tag-row-input {
                    flex: 1; font-size: 0.85rem; font-weight: 600; color: var(--text-main, #eee);
                    background: transparent; border: none; outline: none; padding: 2px 0;
                }
                .adm-tag-row-remove {
                    background: none; border: none; color: var(--text-muted, #888); cursor: pointer;
                    font-size: 1.1rem; line-height: 1; padding: 2px 4px; opacity: 0.5; transition: all 0.2s;
                    border-radius: 4px;
                }
                .adm-tag-row-remove:hover { opacity: 1; color: #ff6b6b; background: rgba(255,107,107,0.1); }
                .adm-tag-add-row {
                    display: flex; gap: 6px; align-items: center;
                }
                .adm-tag-suggestions {
                    position: absolute; bottom: 0; transform: translateY(100%); left: 0; right: 0; z-index: 10;
                    background: var(--bg-card, #1a1a2e); border: 1px solid var(--border-light, #333);
                    border-radius: 10px; margin-top: 4px; padding: 4px; max-height: 150px; overflow-y: auto;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                }
                .adm-tag-suggestion-item {
                    display: block; width: 100%; text-align: left; padding: 6px 12px;
                    background: none; border: none; color: var(--text-main, #eee); cursor: pointer;
                    font-size: 0.85rem; border-radius: 6px; transition: background 0.15s;
                }
                .adm-tag-suggestion-item:hover { background: color-mix(in srgb, var(--accent, #088370) 15%, transparent); }
            `}</style>
        </div>
    );
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
    if (field.type === 'select') {
        return (
            <select className="adm-input" value={value || ''} onChange={(e) => onChange(e.target.value)}>
                {(field.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt || '— Select —'}</option>
                ))}
            </select>
        );
    }
    if (field.type === 'tags') {
        return <TagInput value={value} onChange={onChange} placeholder={field.placeholder} suggestions={field.suggestions} />;
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: item.isPinned ? '24px' : '0' }}>
        <div className="adm-field" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="adm-label" style={{ margin: 0 }}>Pin</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!!item.isPinned && <span className="adm-pin-status" style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>✨ Pinned</span>}
                    <div className="adm-pin-toggle" style={{ margin: 0 }}>
                        <label className="adm-toggle" style={{ margin: 0 }}>
                            <input
                                type="checkbox" id={`pin - ${idPrefix} `}
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
                    </div>
                </div>
            </div>
        </div>
        {!!item.isPinned && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="adm-field" style={{ margin: 0 }}>
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
                    <div className="adm-field" style={{ margin: 0 }}>
                        <label className="adm-label">Expires At</label>
                        <input className="adm-input" type="datetime-local"
                            value={item.pinExpiresAt ? new Date(new Date(item.pinExpiresAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                            onChange={(e) => { const v = e.target.value; onUpdate('pinExpiresAt', v ? new Date(v).toISOString() : null); }}
                        />
                    </div>
                )}
            </div>
        )}
    </div>
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
                            <RichTextEditor
                                content={variant.transliterations?.[tLang] || ''}
                                onChange={(html) => onUpdateTransl('transliterations', tLang, html)}
                                placeholder="Write transliteration here..."
                            />
                        </div>
                    </div>
                </div>
            ))}
            <div className="adm-translit-add">
                <input id={`add - transl - ${idPrefix} `} className="adm-input" list="lang-options" placeholder="e.g. ml" style={{ width: '80px', padding: '5px 8px' }} maxLength="3" />
                <button className="adm-btn" onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById(`add - transl - ${idPrefix} `);
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
export const VariantCard = ({ variant, vIndex, totalVariants, onUpdate, onUpdateTransl, onToggleLang, onRemove, onMove, idPrefix, defaultAuthors }) => {
    const authors = defaultAuthors || DEFAULT_AUTHORS;
    return (
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
                    <input className="adm-input" list="lang-options" value={variant.lang || ''} onChange={(e) => {
                        const lang = e.target.value;
                        onUpdate('lang', lang);
                        // Auto-fill author if empty or if it was a default name
                        const allDefaults = Object.values(authors);
                        const isDefault = !variant.author || allDefaults.includes(variant.author);
                        if (isDefault && authors[lang]) {
                            onUpdate('author', authors[lang]);
                        }
                    }} placeholder="ta" />
                </div>
            </div>
            <div className="adm-field">
                <label className="adm-label" style={{ paddingLeft: '14px' }}>Author</label>
                <input className="adm-input" list="author-names" value={variant.author || ''} onChange={(e) => onUpdate('author', e.target.value)} placeholder="Author" />
            </div>
            <div className="adm-field">
                <label className="adm-label" style={{ paddingLeft: '14px' }}>Text</label>
                <RichTextEditor
                    content={variant.text || ''}
                    onChange={(html) => onUpdate('text', html)}
                    placeholder="Write your content here..."
                />
            </div>
            <TransliterationEditor variant={variant} onUpdateTransl={onUpdateTransl} onToggleLang={onToggleLang} idPrefix={idPrefix} />
        </div>
    </div>
    );
};

// ─── SHARED DATALISTS (For Combobox autofill) ───
export const SharedDatalists = () => (
    <>
        <datalist id="author-names">
            {Object.values(DEFAULT_AUTHORS).map(name => (
                <option key={name} value={name} />
            ))}
        </datalist>
        <datalist id="poem-class">
            <option value="அகம்" />
            <option value="புறம்" />
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
