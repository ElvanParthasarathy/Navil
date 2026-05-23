import React, { useState } from 'react';
import { 
    MdComment, MdDraw, MdEditDocument, MdArticle, MdBook, MdWbSunny, 
    MdExpandLess, MdExpandMore, MdChevronRight, MdClose, MdSchedule, MdAnchor, 
    MdImage, MdEdit, MdTune, MdHistoryEdu, MdLock, MdLockOpen, MdAdd, MdDelete, MdFormatQuote, MdBrush, MdWallpaper, MdComputer
} from 'react-icons/md';
import { FiClock, FiAnchor, FiChevronUp, FiChevronDown, FiX, FiLock, FiUnlock, FiChevronRight, FiImage, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi';
import {
    Box, Typography, TextField, Autocomplete, Chip, IconButton, Button, 
    Select, MenuItem, FormControl, InputLabel, Switch, Collapse, Tooltip, Paper,
    ToggleButton, ToggleButtonGroup
} from '@mui/material';
import RichTextEditor from './RichTextEditor';
import { getOptimizedImage } from '../../lib/media';

// ─── SCHEMAS ───

export const DEFAULT_AUTHORS: Record<string, string> = {
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
        if (/^[A-Za-z]{3} \d{1,2}, \d{4}( \d{1,2}:\d{2} [ap]m)?$/i.test(dateString.trim())) return dateString.trim();
        const parsed = new Date(dateString);
        if (!isNaN(parsed.getTime())) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = months[parsed.getMonth()];
            const day = String(parsed.getDate()).padStart(2, '0');
            const year = parsed.getFullYear();
            if (!dateString.includes('T') && !dateString.includes(':')) return `${month} ${day}, ${year}`;
            let hours = parsed.getHours();
            const minutes = String(parsed.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
        }
    } catch (e) { /* Fallback */ }
    return dateString;
};

export const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
};

const getArtSchema = (label: string, categoryVal: string, icon: any) => ({
    label, icon, type: 'simple',
    fields: [
        { key: 'title', label: 'Admin Title (Only visible to admin)', type: 'text', placeholder: 'e.g. Tree sketch (not shown to users)' },
        { key: 'image', label: 'Cover Image URL', type: 'text', placeholder: 'https://drive.google.com/... or any direct image URL' },
        { key: 'images', label: 'Images', type: 'dynamic_list', fullWidth: true, isImageList: true },
        { key: 'caption', label: 'Caption / Description', type: 'richtext', placeholder: 'About this artwork...', fullWidth: true },
        { key: 'date', label: 'Date', type: 'datetime-local' },
    ],
    getItemTitle: (item: any) => {
        if (item.title) return item.title;
        const plain = stripHtml(item.caption || '');
        return plain.replace(/#\S+/g, '').trim().slice(0, 50) || label || 'Untitled Art';
    },
    getItemSubtitle: (item: any) => {
        const parts = [];
        if (item.date) parts.push(formatArtDate(item.date));
        const imgCount = Array.isArray(item.images) ? item.images.length : (item.images ? item.images.split('\n').filter(Boolean).length : 0);
        if (imgCount > 0) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`);
        return parts.join(' • ');
    },
});

export const SCHEMAS: Record<string, any> = {
    quotes: {
        label: 'Quotes', icon: <MdFormatQuote size={18} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Quote Title', type: 'text', placeholder: 'Enter quote title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'classification', label: 'Classification', type: 'combobox', options: ['அகம்', 'புறம்'], placeholder: 'அகம், புறம், or custom...' },
        ],
        row3Fields: [
            { key: 'tags', label: 'Tags / Themes', type: 'tags', placeholder: 'Add a tag (e.g. Philosophy, Love)', suggestions: ['Philosophy', 'Love', 'Hope', 'Nature', 'Life', 'Perspective', 'Strength', 'Longing', 'Admiration', 'Happiness', 'Cosmos', 'Identity', 'Loss', 'Spirituality', 'Journey', 'War'] },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'image_url', placeholder: 'https://...' },
            { key: 'urai', label: 'விளக்கம் / Meaning (Urai)', type: 'richtext', placeholder: 'Enter quote meaning/commentary here...' },
            { key: 'notes', label: 'குறிப்புகள் / Notes', type: 'richtext', placeholder: 'Enter additional notes here...' },
            { key: 'isUraiNotesLocked', label: 'Lock Urai & Notes with Password', type: 'checkbox' },
            { key: 'uraiNotesPassword', label: 'Urai & Notes Password', type: 'text', placeholder: 'Enter password to unlock' },
            { key: 'uraiNotesPasswordHint', label: 'Password Hint (Optional)', type: 'text', placeholder: 'e.g. My favorite color...' },
        ],
        getItemTitle: (item: any) => item.title || item.variants?.[0]?.title || 'Untitled Quote',
        getItemSubtitle: (item: any) => item.is_private ? '🔒 Private' : '',
    },
    poems: {
        label: 'Poems', icon: <MdHistoryEdu size={18} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Poem Title', type: 'text', placeholder: 'Enter poem title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'classification', label: 'Classification', type: 'combobox', options: ['அகம்', 'புறம்'], placeholder: 'அகம், புறம், or custom...' },
        ],
        row3Fields: [
            { key: 'tags', label: 'Tags / Themes', type: 'tags', placeholder: 'Add a tag', suggestions: ['Philosophy', 'Love', 'Hope', 'Nature', 'Life', 'Perspective', 'Strength', 'Longing', 'Admiration', 'Happiness', 'Cosmos', 'Identity', 'Loss', 'Spirituality', 'Journey', 'War'] },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'image_url', placeholder: 'https://...' },
            { key: 'urai', label: 'விளக்கம் / Meaning (Urai)', type: 'richtext', placeholder: 'Enter poem meaning/commentary here...' },
            { key: 'notes', label: 'குறிப்புகள் / Notes', type: 'richtext', placeholder: 'Enter additional notes here...' },
            { key: 'isUraiNotesLocked', label: 'Lock Urai & Notes with Password', type: 'checkbox' },
            { key: 'uraiNotesPassword', label: 'Urai & Notes Password', type: 'text', placeholder: 'Enter password to unlock' },
            { key: 'uraiNotesPasswordHint', label: 'Password Hint (Optional)', type: 'text', placeholder: 'e.g. My favorite color...' },
        ],
        getItemTitle: (item: any) => item.title || item.variants?.[0]?.title || 'Untitled Poem',
        getItemSubtitle: (item: any) => item.is_private ? '🔒 Private' : '',
    },
    blog: {
        label: 'Blog', icon: <MdEditDocument size={18} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Post Title', type: 'text', placeholder: 'Enter blog title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Life, Tech (comma separated)' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'image_url', placeholder: 'https://...' },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        getItemTitle: (item: any) => item.title || item.variants?.[0]?.title || 'Untitled Blog Post',
        getItemSubtitle: (item: any) => {
            const parts = [];
            if (item.is_private) parts.push('🔒 Private');
            if (item.tags) parts.push(item.tags);
            return parts.join(' • ');
        },
    },
    articles: {
        label: 'Articles', icon: <MdArticle size={18} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Article Title', type: 'text', placeholder: 'Enter article title', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Politics, Review' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'image_url', placeholder: 'https://...' },
        ],
        getItemTitle: (item: any) => item.title || item.variants?.[0]?.title || 'Untitled Article',
        getItemSubtitle: (item: any) => item.tags || '',
    },
    stories: {
        label: 'Stories', icon: <MdBook size={18} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Chapter Title', type: 'text', placeholder: 'Enter chapter title (e.g. The Awakening)', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Fantasy, Slice of Life' },
            { key: 'series_name', label: 'Main / Series Title', type: 'text', placeholder: 'e.g. My College Days' },
            { key: 'series_part', label: 'Part / Chapter Number', type: 'number', placeholder: '1' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Art URL', type: 'image_url', placeholder: 'https://...' },
        ],
        getItemTitle: (item: any) => item.title || item.variants?.[0]?.title || 'Untitled Story',
        getItemSubtitle: (item: any) => {
            const parts = [item.tags];
            if (item.series_name) parts.push(`${item.series_name} #${item.series_part || '?'}`);
            return parts.filter(Boolean).join(' • ');
        },
    },
    diary: {
        label: 'Diary', icon: <MdBook size={18} />, type: 'variant_based',
        itemFields: [
            { key: 'title', label: 'Entry Title', type: 'text', placeholder: 'Today I...', flex: 2 },
            { key: 'date', label: 'Date', type: 'datetime-local', flex: 1 },
        ],
        row2Fields: [
            { key: 'tags', label: 'Tags', type: 'text', placeholder: 'e.g. Travel, Thoughts' },
            { key: 'is_private', label: 'Private / Draft (only visible to admin)', type: 'checkbox' },
        ],
        extraFields: [
            { key: 'cover_image', label: 'Cover Image URL', type: 'image_url', placeholder: 'https://...' },
        ],
        getItemTitle: (item: any) => item.title || item.variants?.[0]?.title || 'Untitled Entry',
        getItemSubtitle: (item: any) => item.is_private ? '🔒 Private' : '',
    },
    art_pencil: getArtSchema('Pencil Drawings', 'pencil', <MdEdit size={18} />),
    art_editing: getArtSchema('Editings', 'editing', <MdTune size={18} />),
    art_poster: getArtSchema('Posters', 'poster', <MdArticle size={18} />),
    art_painting: getArtSchema('Paintings', 'painting', <MdBrush size={18} />),
    art_quotes: getArtSchema('Visual Quotes', 'quotes', <MdFormatQuote size={18} />),
    art_poems: getArtSchema('Visual Poems', 'poems', <MdHistoryEdu size={18} />),
    art_illustrations: getArtSchema('Illustrations', 'illustrations', <MdWallpaper size={18} />),
    art_digital_arts: getArtSchema('Digital Arts', 'digital_arts', <MdComputer size={18} />),
};

// ─── TAG INPUT COMPONENT ───
const TagInput = ({ value, onChange, placeholder, suggestions = [] }: any) => {
    const tags = Array.isArray(value) ? value : (value ? String(value).split(',').map(t => t.trim()).filter(Boolean) : []);
    
    return (
        <Autocomplete
            multiple
            freeSolo
            options={suggestions}
            value={tags}
            onChange={(_, newValue) => onChange(newValue)}
            renderInput={(params) => (
                <TextField {...params} variant="outlined" placeholder={tags.length === 0 ? placeholder : ''} />
            )}
        />
    );
};

// ─── FIELD INPUT ───
export const FieldInput = ({ field, value, onChange }: any) => {
    // Dynamic image URL list with add/remove
    if (field.isImageList) {
        let urls = typeof value === 'string' ? (value ? value.split('\n') : []) : (Array.isArray(value) ? value : []);
        if (urls.length === 0) urls = [''];

        const updateUrl = (index: number, newVal: string) => {
            const updated = [...urls];
            updated[index] = newVal;
            onChange(updated.join('\n'));
        };
        const removeUrl = (index: number) => {
            const updated = urls.filter((_, i) => i !== index);
            onChange(updated.join('\n'));
        };
        const addUrl = () => onChange([...urls, ''].join('\n'));
        const moveUrl = (index: number, direction: number) => {
            const updated = [...urls];
            const target = index + direction;
            if (target < 0 || target >= updated.length) return;
            [updated[index], updated[target]] = [updated[target], updated[index]];
            onChange(updated.join('\n'));
        };

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {urls.map((url: string, i: number) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}>
                            {url && <img src={getOptimizedImage(url, 'thumb')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                        </Box>
                        <TextField fullWidth value={url} onChange={(e) => updateUrl(i, e.target.value)} placeholder={`Image URL ${i + 1}`} />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <IconButton size="small" onClick={() => moveUrl(i, -1)} disabled={i === 0} sx={{ p: 0.25 }}><FiChevronUp size={16} /></IconButton>
                            <IconButton size="small" onClick={() => moveUrl(i, 1)} disabled={i === urls.length - 1} sx={{ p: 0.25 }}><FiChevronDown size={16} /></IconButton>
                        </Box>
                        <IconButton color="error" onClick={() => removeUrl(i)}><FiTrash2 size={18} /></IconButton>
                    </Box>
                ))}
                <Button variant="outlined" onClick={addUrl} startIcon={<FiPlus />} sx={{ mt: 1, borderStyle: 'dashed' }}>Add Image URL</Button>
            </Box>
        );
    }

    if (field.type === 'image_url') {
        return (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: 3, overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {value ? (
                        <img src={getOptimizedImage(value, 'thumb')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                        <FiImage size={24} color="var(--color-outline)" />
                    )}
                </Box>
                <TextField fullWidth value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />
            </Box>
        );
    }

    if (field.type === 'richtext') {
        return (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <RichTextEditor content={value || ''} onChange={onChange} placeholder={field.placeholder || ''} />
            </Box>
        );
    }

    if (field.type === 'textarea') {
        return <TextField fullWidth multiline minRows={field.rows || 3} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
    }

    if (field.type === 'select') {
        return (
            <Select fullWidth value={value || ''} onChange={(e) => onChange(e.target.value)} displayEmpty>
                <MenuItem value="" disabled>— Select —</MenuItem>
                {(field.options || []).map((opt: any) => {
                    const optVal = typeof opt === 'string' ? opt : opt.value;
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    return <MenuItem key={optVal} value={optVal}>{optLabel}</MenuItem>;
                })}
            </Select>
        );
    }

    if (field.type === 'tags') {
        return <TagInput value={value} onChange={onChange} placeholder={field.placeholder} suggestions={field.suggestions} />;
    }

    if (field.type === 'combobox') {
        return (
            <Autocomplete
                freeSolo
                options={field.options || []}
                value={value || ''}
                onChange={(_, newValue) => onChange(newValue || '')}
                onInputChange={(_, newInputValue) => onChange(newInputValue)}
                renderInput={(params) => <TextField {...params} placeholder={field.placeholder || ''} />}
            />
        );
    }

    if (field.type === 'datetime-local') {
        let inputValue = '';
        if (value) {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) inputValue = value;
            else {
                const parsed = new Date(value);
                if (!isNaN(parsed.getTime())) {
                    const tzOffset = parsed.getTimezoneOffset() * 60000;
                    inputValue = new Date(parsed.getTime() - tzOffset).toISOString().slice(0, 16);
                } else inputValue = value;
            }
        }
        return <TextField fullWidth type="datetime-local" value={inputValue} onChange={(e) => onChange(e.target.value)} />;
    }
    return <TextField fullWidth type={field.type || 'text'} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || ''} />;
};

// ─── FIELD ROW ───
export const renderFieldRow = (fields: any[], item: any, collection: string, index: number, updateItemField: any) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {fields.map((f: any) => {
            if (!item.isUraiNotesLocked && (f.key === 'uraiNotesPassword' || f.key === 'uraiNotesPasswordHint')) return null;
            return (
                <Box key={f.key} sx={{ width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>{f.label}</Typography>
                    <FieldInput field={f} value={item[f.key]} onChange={(val: any) => updateItemField(collection, index, f.key, val)} />
                </Box>
            );
        })}
    </Box>
);

// ─── PIN EDITOR ───
export const PinEditor = ({ item, onUpdate, idPrefix }: any) => (
    <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: item.isPinned ? 3 : 0 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Pin Content</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {!!item.isPinned && <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>✨ Pinned</Typography>}
                <Switch 
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
            </Box>
        </Box>
        <Collapse in={!!item.isPinned}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase' }}>Pin Mode</Typography>
                    <ToggleButtonGroup
                        value={item.pinType || 'auto'}
                        exclusive
                        onChange={(_, newMode) => {
                            if (!newMode) return;
                            onUpdate('pinType', newMode);
                            if (newMode === 'auto' && !item.pinExpiresAt) {
                                const d = new Date(); d.setDate(d.getDate() + 7);
                                onUpdate('pinExpiresAt', d.toISOString());
                            } else if (newMode === 'permanent') {
                                onUpdate('pinExpiresAt', null);
                            }
                        }}
                        fullWidth
                    >
                        <ToggleButton value="auto" sx={{ display: 'flex', gap: 1 }}><FiClock size={16} /> Auto</ToggleButton>
                        <ToggleButton value="permanent" sx={{ display: 'flex', gap: 1 }}><FiAnchor size={16} /> Permanent</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {(item.pinType || 'auto') === 'auto' && (
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase' }}>Expires At</Typography>
                        <TextField 
                            fullWidth 
                            type="datetime-local"
                            value={item.pinExpiresAt ? new Date(new Date(item.pinExpiresAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                            onChange={(e) => { const v = e.target.value; onUpdate('pinExpiresAt', v ? new Date(v).toISOString() : null); }}
                        />
                    </Box>
                )}
            </Box>
        </Collapse>
    </Box>
);

// ─── TRANSLITERATION EDITOR ───
export const TransliterationEditor = ({ variant, onUpdateTransl, onToggleLang, idPrefix, defaultAuthors }: any) => {
    const indicLangs = ['ta', 'ml', 'hi', 'sa'];
    if (!indicLangs.includes(variant.lang)) return null;
    
    const authors = defaultAuthors || DEFAULT_AUTHORS;
    const keys = variant.transliterations ? Object.keys(variant.transliterations) : [];
    const [unlockedLangs, setUnlockedLangs] = useState<Record<string, boolean>>({});
    const [newLang, setNewLang] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const resolveAuthor = (baseLang: string, tLang: string) => {
        if (baseLang === 'ta' && tLang === 'en') return { name: authors['ta_translit'] || authors['en'] || '', locked: true };
        if (baseLang === 'ta' && tLang === 'ml') return { name: authors['ml'] || '', locked: true };
        if (baseLang === 'ml' && tLang === 'en') return { name: authors['ml_translit'] || authors['en'] || '', locked: true };
        if (baseLang === 'ml' && tLang === 'ta') return { name: authors['ta'] || '', locked: true };
        if ((baseLang === 'hi' || baseLang === 'sa') && tLang === 'en') return { name: authors['en'] || '', locked: true };
        return { name: '', locked: false };
    };

    return (
        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isExpanded ? 2 : 0, cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Transliterations <Chip size="small" label={keys.length} sx={{ ml: 1, fontWeight: 700 }} /></Typography>
                <IconButton size="small" sx={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <FiChevronRight />
                </IconButton>
            </Box>
            
            <Collapse in={isExpanded}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    {keys.map(tLang => {
                        const resolved = resolveAuthor(variant.lang, tLang);
                        const currentAuthor = variant.authorTransliterations?.[tLang] || '';

                        return (
                            <Paper key={tLang} elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700,  fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                                        {tLang}
                                    </Typography>
                                    <Button size="small" color="error" onClick={() => onToggleLang(tLang)} startIcon={<FiX />}>Remove</Button>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>Title</Typography>
                                        <TextField fullWidth size="small" value={variant.titleTransliterations?.[tLang] || ''} onChange={(e) => onUpdateTransl('titleTransliterations', tLang, e.target.value)} placeholder={`Romanized title`} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>
                                            Author
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField 
                                                fullWidth size="small"
                                                value={currentAuthor} 
                                                onChange={(e) => onUpdateTransl('authorTransliterations', tLang, e.target.value)} 
                                                placeholder={resolved.name || 'Author'}
                                            />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>Text</Typography>
                                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
                                            <RichTextEditor content={variant.transliterations?.[tLang] || ''} onChange={(html: string) => onUpdateTransl('transliterations', tLang, html)} placeholder="Write transliteration here..." />
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        );
                    })}
                    <Box sx={{ display: 'flex', gap: 2, pb: 4, alignItems: 'center' }}>
                        <Autocomplete
                            freeSolo
                            forcePopupIcon={true}
                            options={['ta', 'en', 'ml'].filter(lang => !keys.includes(lang))}
                            value={newLang}
                            onChange={(_, val) => setNewLang(val || '')}
                            onInputChange={(_, val) => setNewLang(val || '')}
                            renderInput={(params) => <TextField {...params} size="small" placeholder="Language..." sx={{ width: 140 }} />}
                        />
                        <Button 
                            variant="outlined" 
                            startIcon={<FiPlus />}
                            onClick={() => {
                                if (newLang.trim()) {
                                    const val = newLang.trim().toLowerCase();
                                    
                                    // Block duplicates
                                    if (keys.includes(val)) {
                                        alert(`The transliteration for '${val}' already exists.`);
                                        return;
                                    }
                                    
                                    onUpdateTransl('transliterations', val, '');
                                    onUpdateTransl('titleTransliterations', val, '');
                                    const resolved = resolveAuthor(variant.lang, val);
                                    onUpdateTransl('authorTransliterations', val, resolved.name);
                                    setUnlockedLangs(prev => ({ ...prev, [val]: false }));
                                    setIsExpanded(true);
                                    setNewLang('');
                                }
                            }}
                            sx={{ borderRadius: 2 }}
                        >Add</Button>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};

// ─── VARIANT CARD ───
export const VariantCard = ({ collection, variant, vIndex, totalVariants, onUpdate, onUpdateTransl, onToggleLang, onRemove, onMove, idPrefix, defaultAuthors }: any) => {
    const authors = defaultAuthors || DEFAULT_AUTHORS;
    const knownLangs = ['ta', 'ml', 'en'];
    const isKnownLang = knownLangs.includes(variant.lang);
    const autoAuthor = authors[variant.lang] || '';
    const allDefaults = Object.values(authors);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 4, mb: 4, borderBottom: vIndex === totalVariants - 1 ? 'none' : '2px dashed', borderColor: 'divider' }}>
            {collection !== 'stories' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Variant {vIndex + 1}
                        {vIndex === 0 && <Chip label="Primary" size="small" color="primary" sx={{ ml: 1.5, fontWeight: 700 }} />}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => onMove('up')} disabled={vIndex === 0} startIcon={<FiChevronUp />} sx={{ borderRadius: 3, borderColor: 'divider' }}>Up</Button>
                        <Button size="small" variant="outlined" onClick={() => onMove('down')} disabled={vIndex === totalVariants - 1} startIcon={<FiChevronDown />} sx={{ borderRadius: 3, borderColor: 'divider' }}>Down</Button>
                        <Button size="small" variant="contained" color="error" onClick={() => onRemove()} startIcon={<FiX />} sx={{ borderRadius: 3, boxShadow: 'none' }}>Remove</Button>
                    </Box>
                </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {collection !== 'stories' && (
                        <Box sx={{ flex: 1, minWidth: 120 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>Label</Typography>
                            <TextField fullWidth value={variant.label || ''} onChange={(e) => onUpdate('label', e.target.value)} placeholder="Original" />
                        </Box>
                    )}
                    {collection !== 'stories' && vIndex !== 0 && (
                        <Box sx={{ flex: 2, minWidth: 200 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>
                                Variant Title
                            </Typography>
                            <TextField fullWidth value={variant.title || ''} onChange={(e) => onUpdate('title', e.target.value)} placeholder="Title" />
                        </Box>
                    )}
                    {collection !== 'stories' && (
                        <Box sx={{ width: 120 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>Lang</Typography>
                            <Autocomplete
                                freeSolo
                                forcePopupIcon={true}
                                options={['ta', 'en', 'ml']}
                                value={variant.lang || ''}
                                onChange={(_, newValue) => {
                                    const lang = newValue || '';
                                    onUpdate('lang', lang);
                                    const isDefault = !variant.author || allDefaults.includes(variant.author);
                                    if (isDefault && authors[lang]) onUpdate('author', authors[lang]);
                                }}
                                onInputChange={(_, newInputValue) => {
                                    const lang = newInputValue || '';
                                    onUpdate('lang', lang);
                                    const isDefault = !variant.author || allDefaults.includes(variant.author);
                                    if (isDefault && authors[lang]) onUpdate('author', authors[lang]);
                                }}
                                renderInput={(params) => <TextField {...params} placeholder="ta" />}
                            />
                        </Box>
                    )}
                </Box>

                {collection !== 'stories' && (
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>
                            Author
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField 
                                fullWidth 
                                value={variant.author || ''}
                                onChange={(e) => onUpdate('author', e.target.value)} 
                                placeholder={isKnownLang ? autoAuthor : "Author"}
                            />
                        </Box>
                    </Box>
                )}

                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600,  display: 'block', mb: 1, textTransform: 'uppercase' }}>Text</Typography>
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                        <RichTextEditor content={variant.text || ''} onChange={(html: string) => onUpdate('text', html)} placeholder="Write your content here..." />
                    </Box>
                </Box>

                {collection !== 'stories' && (
                    <TransliterationEditor variant={variant} onUpdateTransl={onUpdateTransl} onToggleLang={onToggleLang} idPrefix={idPrefix} defaultAuthors={authors} />
                )}
            </Box>
        </Box>
    );
};

// ─── SHARED DATALISTS (For Combobox autofill) ───
// We can omit this since we migrated to MUI Autocomplete!
// We'll leave an empty export just in case it is imported anywhere.
export const SharedDatalists = ({ defaultAuthors }: any) => null;
