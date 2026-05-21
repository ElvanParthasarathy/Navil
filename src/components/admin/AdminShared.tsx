import React, { useState } from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBookOpen, FiBook, FiSun, FiChevronUp, FiChevronDown, FiChevronRight, FiX, FiClock, FiAnchor, FiImage, FiEdit, FiSliders, FiFeather, FiLock, FiUnlock } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';

// ─── SCHEMAS ───

// Default author names per language — auto-filled when language is set
export const DEFAULT_AUTHORS = {
    ta: 'எலவன் பார்த்தசாரதி',
    ml: 'എൽവൻ പാർത്തചാരതി',
    en: 'Elvan Parthasarathy',
    ta_translit: 'Elvan Parthasarathy',
    ml_translit: 'Elvan Parthasarathy',
};

export const formatTimestampToLegacy = (ts: number | string | Date): string => {
    if (!ts) return '';
    const parsed = new Date(ts);
    if (isNaN(parsed.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parsed.getMonth()];
    const day = String(parsed.getDate()).padStart(2, '0');
    const year = parsed.getFullYear();
    let hours = parsed.getHours();
    const minutes = String(parsed.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
};

export const formatArtDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
        if (/^[A-Za-z]{3} \d{1,2}, \d{4}( \d{1,2}:\d{2} [ap]m)?$/i.test(dateString.trim())) {
            return dateString.trim();
        }
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[parsed.getMonth()];
            const day = String(parsed.getDate()).padStart(2, '0');
            const year = parsed.getFullYear();
            
            if (!dateString.includes('T') && !dateString.includes(':')) {
                return `${month} ${day}, ${year}`;
            }

            let hours = parsed.getHours();
            const minutes = String(parsed.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            
            return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
        }
    } catch (e) {
        // Fallback
    }
    return dateString;
};

export const stripHtml = (html: string): string => {
    if (!html) return '';
    const clean = html.replace(/<[^>]*>/g, '');
    return clean
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
};

const getArtSchema = (label, categoryVal, icon) => ({
    label, icon, type: 'simple',
    fields: [
        { key: 'title', label: 'Admin Title (Only visible to admin)', type: 'text', placeholder: 'e.g. Tree sketch (not shown to users)' },
        { key: 'image', label: 'Cover Image URL', type: 'text', placeholder: 'https://drive.google.com/... or any direct image URL' },
        { key: 'images', label: 'Images', type: 'dynamic_list', fullWidth: true, isImageList: true },
        { key: 'caption', label: 'Caption / Description', type: 'richtext', placeholder: 'About this artwork...', fullWidth: true },
        { key: 'date', label: 'Date', type: 'datetime-local' },
    ],
    getItemTitle: (item) => {
        if (item.title) return item.title;
        const plain = stripHtml(item.caption || '');
        return plain.replace(/#\S+/g, '').trim().slice(0, 50) || label || 'Untitled Art';
    },
    getItemSubtitle: (item) => {
        const parts = [];
        if (item.date) parts.push(formatArtDate(item.date));
        const imgCount = Array.isArray(item.images) ? item.images.length : (item.images ? item.images.split('\n').filter(Boolean).length : 0);
        if (imgCount > 0) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`);
        return parts.join(' • ');
    },
});

export const SCHEMAS = {
    quotes: {
        label: 'Quotes', icon: <FiMessageCircle size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Quote Title', type: 'text', placeholder: 'Enter quote title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'classification', label: 'Classification', type: 'combobox', options: ['அகம்', 'புறம்'], placeholder: 'அகம், புறம், or custom...' },
        ],
        row3Fields: [
            { key: 'tags', label: 'Tags / Themes', type: 'tags', placeholder: 'Add a tag (e.g. Philosophy, Love, Hope)', suggestions: ['Philosophy', 'Love', 'Hope', 'Nature', 'Life', 'Perspective', 'Strength', 'Longing', 'Admiration', 'Happiness', 'Cosmos', 'Identity', 'Loss', 'Spirituality', 'Journey', 'War'] },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
            { key: 'urai', label: 'விளக்கம் / Meaning (Urai)', type: 'richtext', placeholder: 'Enter quote meaning/commentary here...' },
            { key: 'notes', label: 'குறிப்புகள் / Notes', type: 'richtext', placeholder: 'Enter additional notes here...' },
            { key: 'isUraiNotesLocked', label: 'Lock Urai & Notes with Password', type: 'checkbox' },
            { key: 'uraiNotesPassword', label: 'Urai & Notes Password', type: 'text', placeholder: 'Enter password to unlock' },
            { key: 'uraiNotesPasswordHint', label: 'Password Hint (Optional)', type: 'text', placeholder: 'e.g. My favorite color...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Quote',
        getItemSubtitle: (item) => item.is_private ? '🔒 Private' : '',
    },
    poems: {
        label: 'Poems', icon: <FiPenTool size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Poem Title', type: 'text', placeholder: 'Enter poem title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'classification', label: 'Classification', type: 'combobox', options: ['அகம்', 'புறம்'], placeholder: 'அகம், புறம், or custom...' },
        ],
        row3Fields: [
            { key: 'tags', label: 'Tags / Themes', type: 'tags', placeholder: 'Add a tag (e.g. Philosophy, Love, Hope)', suggestions: ['Philosophy', 'Love', 'Hope', 'Nature', 'Life', 'Perspective', 'Strength', 'Longing', 'Admiration', 'Happiness', 'Cosmos', 'Identity', 'Loss', 'Spirituality', 'Journey', 'War'] },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
            { key: 'urai', label: 'விளக்கம் / Meaning (Urai)', type: 'richtext', placeholder: 'Enter poem meaning/commentary here...' },
            { key: 'notes', label: 'குறிப்புகள் / Notes', type: 'richtext', placeholder: 'Enter additional notes here...' },
            { key: 'isUraiNotesLocked', label: 'Lock Urai & Notes with Password', type: 'checkbox' },
            { key: 'uraiNotesPassword', label: 'Urai & Notes Password', type: 'text', placeholder: 'Enter password to unlock' },
            { key: 'uraiNotesPasswordHint', label: 'Password Hint (Optional)', type: 'text', placeholder: 'e.g. My favorite color...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Poem',
        getItemSubtitle: (item) => item.is_private ? '🔒 Private' : '',
    },
    blog: {
        label: 'Blog', icon: <FiEdit3 size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Post Title', type: 'text', placeholder: 'Enter blog title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Life, Tech (comma separated)' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Blog Post',
        getItemSubtitle: (item) => {
            const parts = [];
            if (item.is_private) parts.push('🔒 Private');
            if (item.tags) parts.push(item.tags);
            return parts.join(' • ');
        },
    },
    articles: {
        label: 'Articles', icon: <FiFileText size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Article Title', type: 'text', placeholder: 'Enter article title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Politics, Review' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Article',
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
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Story',
        getItemSubtitle: (item) => {
            const parts = [item.tags];
            if (item.series_name) parts.push(`${item.series_name} #${item.series_part || '?'}`);
            return parts.filter(Boolean).join(' • ');
        },
    },
    diary: {
        label: 'Diary', icon: <FiBook size={16} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Entry Title', type: 'text', placeholder: 'Today I...', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Travel, Thoughts' },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'text', placeholder: 'https://...' },
        ],
        getItemTitle: (item) => item.title || item.variants?.[0]?.title || 'Untitled Entry',
        getItemSubtitle: (item) => item.is_private ? '🔒 Private' : '',
    },
    art_pencil: getArtSchema('Pencil Drawings', 'pencil', <FiEdit size={16} />),
    art_editing: getArtSchema('Editings', 'editing', <FiSliders size={16} />),
    art_poster: getArtSchema('Posters', 'poster', <FiFileText size={16} />),
    art_painting: getArtSchema('Paintings', 'painting', <FiFeather size={16} />),
    art_quotes: getArtSchema('Visual Quotes', 'quotes', <FiMessageCircle size={16} />),
    art_poems: getArtSchema('Visual Poems', 'poems', <FiPenTool size={16} />),
    art_illustrations: getArtSchema('Illustrations', 'illustrations', <FiAnchor size={16} />),
    art_digital_arts: getArtSchema('Digital Arts', 'digital_arts', <FiImage size={16} />),
};

// ─── TAG INPUT COMPONENT ───
const TagInput = ({ value, onChange, placeholder, suggestions = [] }) => {
    const tags = Array.isArray(value) ? value : (value ? String(value).split(',').map(t => t.trim()).filter(Boolean) : []);
    const [input, setInput] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const addTag = (tag?: string) => {
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
    // Dynamic image URL list with add/remove
    if (field.isImageList) {
        let urls = typeof value === 'string'
            ? value.split('\n').filter(Boolean)
            : (Array.isArray(value) ? value : []);
        
        if (urls.length === 0) urls = [''];

        const updateUrl = (index, newVal) => {
            const updated = [...urls];
            updated[index] = newVal;
            onChange(updated.join('\n'));
        };
        const removeUrl = (index) => {
            const updated = urls.filter((_, i) => i !== index);
            onChange(updated.join('\n'));
        };
        const addUrl = () => {
            onChange([...urls, ''].join('\n'));
        };
        const moveUrl = (index, direction) => {
            const updated = [...urls];
            const target = index + direction;
            if (target < 0 || target >= updated.length) return;
            [updated[index], updated[target]] = [updated[target], updated[index]];
            onChange(updated.join('\n'));
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {urls.map((url, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Thumbnail preview */}
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
                            background: 'var(--bg-panel)', flexShrink: 0, border: '1px solid var(--border-light)',
                        }}>
                            {url && <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                        </div>
                        {/* URL input */}
                        <input
                            className="adm-input"
                            type="text"
                            value={url}
                            onChange={(e) => updateUrl(i, e.target.value)}
                            placeholder={`Image URL ${i + 1}`}
                            style={{ flex: 1 }}
                        />
                        {/* Reorder buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button type="button" onClick={() => moveUrl(i, -1)} disabled={i === 0}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-muted)',
                                    cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1,
                                    padding: '0', lineHeight: 1, fontSize: '14px',
                                }}>▲</button>
                            <button type="button" onClick={() => moveUrl(i, 1)} disabled={i === urls.length - 1}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-muted)',
                                    cursor: i === urls.length - 1 ? 'default' : 'pointer', opacity: i === urls.length - 1 ? 0.3 : 1,
                                    padding: '0', lineHeight: 1, fontSize: '14px',
                                }}>▼</button>
                        </div>
                        {/* Remove button */}
                        <button type="button" onClick={() => removeUrl(i)}
                            style={{
                                background: 'none', border: 'none', color: '#e53e3e',
                                cursor: 'pointer', padding: '4px', fontSize: '16px', lineHeight: 1,
                                opacity: 0.7, transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            title="Remove"
                        >✕</button>
                    </div>
                ))}
                <button type="button" onClick={addUrl}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px 16px', border: '1px dashed var(--border-light)', borderRadius: '10px',
                        background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                        fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-main)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                    + Add Image URL
                </button>
            </div>
        );
    }

    if (field.type === 'richtext') {
        return (
            <RichTextEditor
                content={value || ''}
                onChange={onChange}
                placeholder={field.placeholder || ''}
            />
        );
    }

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
                <option value="">— Select —</option>
                {(field.options || []).map(opt => {
                    const optVal = typeof opt === 'string' ? opt : opt.value;
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    return <option key={optVal} value={optVal}>{optLabel}</option>;
                })}
            </select>
        );
    }
    if (field.type === 'tags') {
        return <TagInput value={value} onChange={onChange} placeholder={field.placeholder} suggestions={field.suggestions} />;
    }
    if (field.datalist) {
        return <input className="adm-input" type="text" list={field.datalist} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
    }
    if (field.type === 'combobox') {
        return (
            <div style={{ position: 'relative' }}>
                <input
                    className="adm-input"
                    type="text"
                    list={field.datalist || `${field.key}-options`}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                />
                {field.options && (
                    <datalist id={`${field.key}-options`}>
                        {field.options.map(opt => (
                            <option key={opt} value={opt} />
                        ))}
                    </datalist>
                )}
            </div>
        );
    }
    if (field.type === 'datetime-local') {
        let inputValue = '';
        if (value) {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
                inputValue = value;
            } else {
                const parsed = new Date(value);
                if (!isNaN(parsed.getTime())) {
                    const tzOffset = parsed.getTimezoneOffset() * 60000;
                    inputValue = new Date(parsed.getTime() - tzOffset).toISOString().slice(0, 16);
                } else {
                    inputValue = value;
                }
            }
        }
        return (
            <input
                className="adm-input"
                type="datetime-local"
                value={inputValue}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }
    return <input className="adm-input" type={field.type || 'text'} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
};

// ─── FIELD ROW ───
export const renderFieldRow = (fields, item, collection, index, updateItemField) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
        {fields.map(f => {
            // Hide password and hint fields if lock toggle is not enabled
            if (!item.isUraiNotesLocked && (f.key === 'uraiNotesPassword' || f.key === 'uraiNotesPasswordHint')) {
                return null;
            }
            return (
                <div key={f.key} style={{ flex: f.flex || 1 }}>
                    <label className="adm-label">{f.label}</label>
                    <FieldInput field={f} value={item[f.key]} onChange={(val) => updateItemField(collection, index, f.key, val)} />
                </div>
            );
        })}
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
export const TransliterationEditor = ({ variant, onUpdateTransl, onToggleLang, idPrefix, defaultAuthors }) => {
    const indicLangs = ['ta', 'ml', 'hi', 'sa'];
    if (!indicLangs.includes(variant.lang)) return null;
    const keys = variant.transliterations ? Object.keys(variant.transliterations) : [];
    const authors = defaultAuthors || DEFAULT_AUTHORS;
    const [unlockedLangs, setUnlockedLangs] = useState<Record<string, boolean>>({});
    const [isExpanded, setIsExpanded] = useState(true);

    // Resolve the correct default author for a given base-lang → translit-lang pair.
    // Returns { name, locked } — locked means the field is auto-managed and read-only.
    const resolveAuthor = (baseLang: string, tLang: string) => {
        if (baseLang === 'ta' && tLang === 'en') return { name: authors['ta_translit'] || authors['en'] || '', locked: true };
        if (baseLang === 'ta' && tLang === 'ml') return { name: authors['ml'] || '', locked: true };
        if (baseLang === 'ml' && tLang === 'en') return { name: authors['ml_translit'] || authors['en'] || '', locked: true };
        if (baseLang === 'ml' && tLang === 'ta') return { name: authors['ta'] || '', locked: true };
        // Hindi / Sanskrit to English
        if ((baseLang === 'hi' || baseLang === 'sa') && tLang === 'en') return { name: authors['en'] || '', locked: true };
        return { name: '', locked: false };
    };

    return (
        <div className="adm-translit">
            <div 
                className={`adm-section-header ${isExpanded ? 'adm-section-header--expanded' : ''} adm-section-header--collapsible`}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ 
                    marginTop: '24px', 
                    marginBottom: isExpanded ? '16px' : '0',
                    borderTop: '1px solid var(--border-light)',
                    paddingTop: '24px',
                    paddingLeft: 0,
                    paddingRight: 0,
                    marginLeft: 0,
                    marginRight: 0
                }}
            >
                <h3>Transliterations ({keys.length})</h3>
                <div className={`adm-collapse-icon ${isExpanded ? 'open' : ''}`}>
                    <FiChevronRight size={18} />
                </div>
            </div>
            
            <div className={`adm-collapse-body ${isExpanded ? 'open' : ''}`}>
                <div className="adm-collapse-body-inner" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {keys.map(tLang => {
                const resolved = resolveAuthor(variant.lang, tLang);
                const isKnownPair = resolved.locked;
                const currentAuthor = variant.authorTransliterations?.[tLang] || '';
                const allDefaults = Object.values(authors);
                const isAutoFilled = isKnownPair && (!currentAuthor || allDefaults.includes(currentAuthor));
                const isUnlocked = unlockedLangs[tLang] === true;
                const authorLocked = isKnownPair && !isUnlocked && isAutoFilled;
                const displayValue = authorLocked ? resolved.name : currentAuthor;

                return (
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
                                <label className="adm-label" style={{ paddingLeft: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Author
                                    {authorLocked && (
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(auto)</span>
                                    )}
                                </label>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    <input
                                        className="adm-input"
                                        list={authorLocked ? undefined : "author-names"}
                                        value={displayValue}
                                        readOnly={authorLocked}
                                        onChange={authorLocked ? undefined : (e) => onUpdateTransl('authorTransliterations', tLang, e.target.value)}
                                        placeholder={`Author name in ${tLang.toUpperCase()}`}
                                        style={authorLocked ? { opacity: 0.7, cursor: 'not-allowed', flex: 1 } : { flex: 1 }}
                                        title={authorLocked ? 'Auto-resolved from Settings → Default Author Names' : undefined}
                                    />
                                    {isKnownPair && (
                                        <button
                                            className="adm-btn ghost"
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (authorLocked) {
                                                    setUnlockedLangs(prev => ({ ...prev, [tLang]: true }));
                                                } else {
                                                    onUpdateTransl('authorTransliterations', tLang, resolved.name);
                                                    setUnlockedLangs(prev => ({ ...prev, [tLang]: false }));
                                                }
                                            }}
                                            style={{ padding: '6px 8px', minWidth: 'unset', flexShrink: 0 }}
                                            title={authorLocked ? 'Unlock to edit transliterated author manually' : 'Lock to use default author'}
                                        >
                                            {authorLocked ? <FiLock size={14} /> : <FiUnlock size={14} />}
                                        </button>
                                    )}
                                </div>
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
                );
            })}
            <div className="adm-translit-add">
                <input id={`add-transl-${idPrefix}`} className="adm-input" list="lang-options" placeholder="e.g. ml" style={{ width: '80px', padding: '5px 8px' }} maxLength={3} />
                <button className="adm-btn" onClick={(e) => {
                    e.preventDefault();
                    const input = document.getElementById(`add-transl-${idPrefix}`) as HTMLInputElement | null;
                    if (input?.value.trim()) {
                        const val = input.value.trim().toLowerCase();
                        onUpdateTransl('transliterations', val, '');
                        onUpdateTransl('titleTransliterations', val, '');
                        const resolved = resolveAuthor(variant.lang, val);
                        onUpdateTransl('authorTransliterations', val, resolved.name);
                        // Reset unlocked state when adding a new one
                        setUnlockedLangs(prev => ({ ...prev, [val]: false }));
                        setIsExpanded(true); // Auto-expand when adding
                        input.value = '';
                    }
                }}>+ Add</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export interface VariantCardProps {
    variant: any;
    vIndex: number;
    totalVariants: number;
    onUpdate: (field: string, value: any) => void;
    onUpdateTransl: (fieldObj: string, langKey: string, value: any) => void;
    onToggleLang: (tLang: string) => void;
    onRemove: () => void;
    onMove: (direction: 'up' | 'down') => void;
    idPrefix: string;
    defaultAuthors?: Record<string, string>;
}

// ─── VARIANT CARD ───
export const VariantCard = ({ variant, vIndex, totalVariants, onUpdate, onUpdateTransl, onToggleLang, onRemove, onMove, idPrefix, defaultAuthors }: VariantCardProps) => {
    const authors = defaultAuthors || DEFAULT_AUTHORS;
    const knownLangs = ['ta', 'ml', 'en'];
    const isKnownLang = knownLangs.includes(variant.lang);
    const autoAuthor = authors[variant.lang] || '';
    // Auto-lock when language is known and the current author matches the default (or is empty)
    const allDefaults = Object.values(authors);
    const isAutoFilled = isKnownLang && (!variant.author || allDefaults.includes(variant.author));
    const [authorUnlocked, setAuthorUnlocked] = useState(false);
    const authorLocked = isKnownLang && !authorUnlocked && isAutoFilled;
    const [isExpanded, setIsExpanded] = useState(vIndex === 0);

    return (
    <div className="adm-variant">
        <div 
            className={`adm-section-header ${isExpanded ? 'adm-section-header--expanded' : ''} adm-section-header--collapsible`}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ paddingLeft: 0, paddingRight: 0, margin: 0 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Variant #{vIndex + 1} {variant.label ? `- ${variant.label}` : ''}</h3>
                <div className={`adm-collapse-icon ${isExpanded ? 'open' : ''}`}>
                    <FiChevronRight size={18} />
                </div>
            </div>
            
            <div className="adm-variant-controls" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="adm-btn ghost" onClick={(e) => { e.preventDefault(); onMove('up'); }} disabled={vIndex === 0}><FiChevronUp size={14} /> Move Up</button>
                <button className="adm-btn ghost" onClick={(e) => { e.preventDefault(); onMove('down'); }} disabled={vIndex === totalVariants - 1}><FiChevronDown size={14} /> Move Down</button>
                <button className="adm-btn danger" onClick={(e) => { e.preventDefault(); onRemove(); }}><FiX size={14} /> Remove</button>
            </div>
        </div>

        <div className={`adm-collapse-body ${isExpanded ? 'open' : ''}`}>
            <div className="adm-collapse-body-inner" style={{ padding: 0, display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
                        const isDefault = !variant.author || allDefaults.includes(variant.author);
                        if (isDefault && authors[lang]) {
                            onUpdate('author', authors[lang]);
                        }
                        // Re-lock when language changes
                        setAuthorUnlocked(false);
                    }} placeholder="ta" />
                </div>
            </div>
            <div className="adm-field">
                <label className="adm-label" style={{ paddingLeft: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Author
                    {isKnownLang && isAutoFilled && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(auto)</span>
                    )}
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                        className="adm-input"
                        list={authorLocked ? undefined : 'author-names'}
                        value={authorLocked ? autoAuthor : (variant.author || '')}
                        readOnly={authorLocked}
                        onChange={authorLocked ? undefined : (e) => onUpdate('author', e.target.value)}
                        placeholder="Author"
                        style={authorLocked ? { opacity: 0.7, cursor: 'not-allowed', flex: 1 } : { flex: 1 }}
                        title={authorLocked ? 'Auto-filled from Settings → Default Author Names' : undefined}
                    />
                    {isKnownLang && (
                        <button
                            className="adm-btn ghost"
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                if (authorLocked) {
                                    setAuthorUnlocked(true);
                                } else {
                                    // Re-lock: reset author to default
                                    onUpdate('author', autoAuthor);
                                    setAuthorUnlocked(false);
                                }
                            }}
                            style={{ padding: '6px 8px', minWidth: 'unset', flexShrink: 0 }}
                            title={authorLocked ? 'Unlock to edit author manually' : 'Lock to use default author'}
                        >
                            {authorLocked ? <FiLock size={14} /> : <FiUnlock size={14} />}
                        </button>
                    )}
                </div>
            </div>
            <div className="adm-field">
                <label className="adm-label" style={{ paddingLeft: '14px' }}>Text</label>
                <RichTextEditor
                    content={variant.text || ''}
                    onChange={(html) => onUpdate('text', html)}
                    placeholder="Write your content here..."
                />
            </div>
            <TransliterationEditor variant={variant} onUpdateTransl={onUpdateTransl} onToggleLang={onToggleLang} idPrefix={idPrefix} defaultAuthors={authors} />
            </div>
        </div>
    </div>
    );
};

// ─── SHARED DATALISTS (For Combobox autofill) ───
export const SharedDatalists = ({ defaultAuthors }: { defaultAuthors?: Record<string, string> }) => {
    const authors = defaultAuthors || DEFAULT_AUTHORS;
    const uniqueNames = Array.from(new Set(Object.values(authors).filter(Boolean)));

    return (
        <>
            <datalist id="author-names">
                {uniqueNames.map(name => (
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
};
