
import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit3, FiUser, FiMessageCircle, FiCheck, FiX, FiList, FiGlobe, FiFileText, FiBookOpen, FiPenTool, FiSun, FiBook } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';

// Import Data (Initial State)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';
import initialBlog from '../data/blog.json';
import initialArticles from '../data/articles.json';
import initialEssays from '../data/essays.json';
import initialStories from '../data/short_stories.json';
import initialPoems from '../data/poems.json';
import initialThoughts from '../data/thoughts.json';
import initialDiary from '../data/diary.json';

// --- DATA SCHEMAS ---
const SCHEMAS = {
    quotes: {
        label: 'Quotes',
        icon: <FiMessageCircle />,
        type: 'custom_quotes' // Handled by specific renderer
    },
    blog: {
        label: 'Blog',
        icon: <FiEdit3 />,
        type: 'standard_post',
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
        label: 'Articles',
        icon: <FiFileText />,
        type: 'standard_post',
        fields: [
            { key: 'title', label: 'Article Title', type: 'text', required: true },
            { key: 'slug', label: 'Slug', type: 'text' },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'tags', label: 'Tags', type: 'text' },
            { key: 'cover', label: 'Cover Image URL', type: 'text' },
            { key: 'summary', label: 'Summary/Abstract', type: 'textarea', rows: 3, fullWidth: true },
            { key: 'content', label: 'Article Body', type: 'textarea', rows: 20, fullWidth: true }
        ]
    },
    essays: {
        label: 'Essays',
        icon: <FiBookOpen />,
        type: 'standard_post',
        fields: [
            { key: 'title', label: 'Essay Title', type: 'text', required: true },
            { key: 'slug', label: 'Slug', type: 'text' },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'subject', label: 'Subject/Topic', type: 'text' },
            { key: 'content', label: 'Essay Content', type: 'textarea', rows: 25, fullWidth: true }
        ]
    },
    stories: {
        label: 'Short Stories',
        icon: <FiBook />,
        type: 'standard_post',
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
    poems: {
        label: 'Poems',
        icon: <FiPenTool />,
        type: 'custom_poems' // Handled by specific renderer like quotes
    },
    thoughts: {
        label: 'Thoughts',
        icon: <FiSun />,
        type: 'standard_post',
        fields: [
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'mood', label: 'Current Mood', type: 'text' },
            { key: 'content', label: 'Though Stream', type: 'textarea', rows: 6, fullWidth: true }
        ]
    },
    diary: {
        label: 'Diary',
        icon: <FiBook />,
        type: 'standard_post',
        fields: [
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'title', label: 'Entry Title (Optional)', type: 'text' },
            { key: 'location', label: 'Location', type: 'text' },
            { key: 'content', label: 'Dear Diary...', type: 'textarea', rows: 15, fullWidth: true }
        ]
    }
};

const Admin = () => {
    const [activeTab, setActiveTab] = useState('quotes');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');

    // Manage Data States
    const [dataStore, setDataStore] = useState({
        quotes: initialQuotes,
        profile: initialProfile,
        blog: initialBlog,
        articles: initialArticles,
        essays: initialEssays,
        stories: initialStories,
        poems: initialPoems,
        thoughts: initialThoughts,
        diary: initialDiary
    });

    // Load poems & quotes from Supabase on mount
    useEffect(() => {
        const loadFromSupabase = async () => {
            try {
                const { data: poems } = await supabase.from('poems').select('*').order('date', { ascending: false });
                if (poems) {
                    const mapped = poems.map(p => ({ ...p, isPinned: p.is_pinned, pinExpiresAt: p.pin_expires_at }));
                    setDataStore(prev => ({ ...prev, poems: mapped }));
                }
                const { data: quotes } = await supabase.from('quotes').select('*').order('date', { ascending: false });
                if (quotes) {
                    const mapped = quotes.map(q => ({ ...q, isPinned: q.is_pinned, pinExpiresAt: q.pin_expires_at }));
                    setDataStore(prev => ({ ...prev, quotes: mapped }));
                }
            } catch (err) {
                console.warn('Supabase load failed, using legacy JSON:', err.message);
            }
        };
        loadFromSupabase();
    }, []);

    // Toggle States
    const [editingId, setEditingId] = useState(null); // Quotes: item.id
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [savingIndex, setSavingIndex] = useState(null);

    const handleSaveCollection = async (collection, specificIndex = null) => {
        if (specificIndex !== null) setSavingIndex(specificIndex);
        else setStatus('loading');

        setMessage('');

        try {
            // Poems & Quotes → Supabase
            if (collection === 'poems' || collection === 'quotes') {
                const items = dataStore[collection];
                const tableName = collection;

                // Upsert all items
                const rows = items.map(item => {
                    const row = {
                        id: String(item.id),
                        variants: item.variants || [],
                        is_pinned: item.isPinned || false,
                        pin_expires_at: item.pinExpiresAt || null,
                        urai: item.urai || '',
                        notes: item.notes || '',
                    };
                    if (collection === 'poems') {
                        row.title = item.title || '';
                        row.date = item.date || null;
                        row.style = item.style || '';
                        row.theme = item.theme || '';
                        row.meter = item.meter || '';
                        row.dedication = item.dedication || '';
                        row.classification = item.classification || null;
                    } else {
                        row.tag = item.tag || '';
                        row.date = item.date || null;
                    }
                    return row;
                });

                const { error } = await supabase.from(tableName).upsert(rows, { onConflict: 'id' });
                if (error) throw new Error(error.message);

                // Delete rows that no longer exist locally
                const localIds = rows.map(r => r.id);
                const { data: dbRows } = await supabase.from(tableName).select('id');
                const toDelete = (dbRows || []).filter(r => !localIds.includes(r.id)).map(r => r.id);
                if (toDelete.length > 0) {
                    await supabase.from(tableName).delete().in('id', toDelete);
                }

                if (specificIndex !== null) {
                    setMessage('Saved to Supabase!');
                    setEditingId(null);
                    setTimeout(() => setMessage(''), 3000);
                } else {
                    setStatus('success');
                    setMessage('Saved to Supabase!');
                    setEditingId(null);
                }
            } else {
                // Everything else → GitHub API (legacy path)
                const response = await fetch('/api/saveData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        collection: collection === 'stories' ? 'short_stories' : collection,
                        data: dataStore[collection],
                        password
                    })
                });

                const resData = await response.json();

                if (response.ok) {
                    if (specificIndex !== null) {
                        setMessage(`Saved!`);
                        setEditingId(null);
                        if (collection === 'profile') setIsProfileEditing(false);
                        setTimeout(() => setMessage(''), 3000);
                    } else {
                        setStatus('success');
                        setMessage('Collection saved successfully!');
                        setEditingId(null);
                        setIsProfileEditing(false);
                    }
                } else {
                    setStatus('error');
                    setMessage(resData.error || 'Failed to save.');
                }
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Network error.');
        } finally {
            setSavingIndex(null);
            if (specificIndex === null) setStatus('idle');
        }
    };

    // Generic Add Item
    const addItem = (collection) => {
        const newId = Date.now().toString();
        let newItem = { id: newId, date: new Date().toISOString().slice(0, 16) }; // Default current date

        if (collection === 'quotes') {
            newItem = {
                id: newId,
                tag: '',
                date: new Date().toISOString().slice(0, 16),
                urai: '',
                notes: '',
                variants: [
                    { label: 'Original', text: '', author: 'Elvan Parthasarathy', lang: 'en' }
                ]
            };
        } else if (collection === 'poems') {
            newItem = {
                id: newId,
                title: '',
                date: new Date().toISOString().slice(0, 16),
                style: '',
                theme: '',
                meter: '',
                dedication: '',
                urai: '',
                notes: '',
                variants: [
                    { label: 'Original', text: '', transliteration: '', author: 'Elvan Parthasarathy', lang: 'en' }
                ]
            };
        }

        setDataStore(prev => ({
            ...prev,
            [collection]: [newItem, ...prev[collection]]
        }));
        setEditingId(newId);
        setMessage('New entry added. Click save to commit.');
    };

    const deleteItem = (collection, index) => {
        if (!window.confirm("Delete this item? Click 'Save All' afterwards to commit deletion.")) return;
        const newData = [...dataStore[collection]];
        newData.splice(index, 1);
        setDataStore(prev => ({ ...prev, [collection]: newData }));
        setMessage('Removed from draft. Click "Save All" to commit deletions.');
    };

    const updateProfile = (field, value) => {
        setDataStore(prev => ({
            ...prev,
            profile: { ...prev.profile, [field]: value }
        }));
    };

    // --- VARIANT-BASED UPDATES (for quotes & poems) ---
    const updateItemField = (collection, index, field, value) => {
        const newData = [...dataStore[collection]];
        newData[index] = { ...newData[index], [field]: value };
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const updateVariant = (collection, itemIndex, variantIndex, field, value) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        newVariants[variantIndex] = { ...newVariants[variantIndex], [field]: value };
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const updateTransliteration = (collection, itemIndex, variantIndex, fieldObj, langKey, value) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        const v = newVariants[variantIndex];
        v[fieldObj] = { ...(v[fieldObj] || {}), [langKey]: value };
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const addVariant = (collection, itemIndex) => {
        const newData = [...dataStore[collection]];
        newData[itemIndex].variants.push({
            label: 'Translation', text: '', transliterations: {}, titleTransliterations: {}, author: 'Elvan Parthasarathy', lang: 'en'
        });
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const removeVariant = (collection, itemIndex, variantIndex) => {
        if (!window.confirm("Remove this variant?")) return;
        const newData = [...dataStore[collection]];
        newData[itemIndex].variants.splice(variantIndex, 1);
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    // --- GENERIC FIELD UPDATE ---
    const updateGenericItem = (collection, index, field, value) => {
        const newData = [...dataStore[collection]];
        newData[index] = { ...newData[index], [field]: value };
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', minHeight: '100vh', color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Admin Dashboard</h1>
                <input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', color: 'var(--text-main)' }}
                />
            </div>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', scrollbarWidth: 'none' }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={getTabStyle(activeTab === 'profile')}
                >
                    <FiUser /> Profile
                </button>
                {Object.keys(SCHEMAS).map(key => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={getTabStyle(activeTab === key)}
                    >
                        {SCHEMAS[key].icon} {SCHEMAS[key].label}
                    </button>
                ))}
            </div>

            {/* MESSAGE ALERT */}
            {message && (
                <div style={{
                    padding: '12px', borderRadius: '8px', marginBottom: '20px',
                    background: status === 'error' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 0, 0.1)',
                    color: status === 'error' ? '#EF4444' : '#10B981',
                    display: 'flex', justifyContent: 'space-between'
                }}>
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><FiX /></button>
                </div>
            )}

            {/* HEADER ACTIONS */}
            <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Manage {activeTab === 'profile' ? 'Profile' : SCHEMAS[activeTab]?.label}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {activeTab !== 'profile' && (
                            <button onClick={() => addItem(activeTab)} style={btnStyle}>
                                <FiPlus /> Add New
                            </button>
                        )}
                        <button
                            onClick={() => handleSaveCollection(activeTab)}
                            style={{ ...btnStyle, background: 'var(--text-main)', color: 'var(--bg-app)' }}
                        >
                            <FiSave /> {status === 'loading' ? 'Saving All...' : 'Save All Changes'}
                        </button>
                    </div>
                </div>

                {/* PROFILE EDITOR */}
                {activeTab === 'profile' && (
                    <div style={{ position: 'relative' }}>
                        {!isProfileEditing ? (
                            <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '15px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{dataStore.profile.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>{dataStore.profile.bio}</p>
                                </div>
                                <button onClick={() => setIsProfileEditing(true)} style={btnStyle}><FiEdit3 /> Edit Profile</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '15px', border: '2px solid var(--text-main)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={labelStyle}>Full Name</label>
                                        <input style={inputStyle} value={dataStore.profile.name || ''} onChange={(e) => updateProfile('name', e.target.value)} />
                                        <label style={labelStyle}>Bio</label>
                                        <textarea style={inputStyle} rows={4} value={dataStore.profile.bio || ''} onChange={(e) => updateProfile('bio', e.target.value)} />

                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Instagram Stats</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div><label style={labelStyle}>Followers</label><input type="number" style={inputStyle} value={dataStore.profile.followers || 0} onChange={(e) => updateProfile('followers', parseInt(e.target.value))} /></div>
                                            <div><label style={labelStyle}>Following</label><input type="number" style={inputStyle} value={dataStore.profile.following || 0} onChange={(e) => updateProfile('following', parseInt(e.target.value))} /></div>
                                            <div><label style={labelStyle}>Posts</label><input type="number" style={inputStyle} value={dataStore.profile.postsCount || 0} onChange={(e) => updateProfile('postsCount', parseInt(e.target.value))} /></div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                    <button onClick={() => setIsProfileEditing(false)} style={{ ...btnStyle, background: 'transparent' }}><FiX /> Cancel</button>
                                    <button onClick={() => handleSaveCollection('profile', 0)} style={{ ...btnStyle, background: 'var(--text-main)', color: 'var(--bg-app)' }}><FiCheck /> Save Profile</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CUSTOM QUOTES EDITOR */}
                {activeTab === 'quotes' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {dataStore.quotes.map((item, index) => (
                            <div key={item.id || index} style={{
                                padding: '20px',
                                background: 'var(--bg-card)',
                                borderRadius: '15px',
                                border: editingId === item.id ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}>
                                {editingId !== item.id ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{item.tag || 'Untagged Quote'}</h3>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <span>{item.variants?.[0]?.author || 'Unknown'}</span>
                                                {item.variants?.length > 0 && <span style={{ background: 'var(--nav-hover)', padding: '2px 8px', borderRadius: '4px' }}>{item.variants.length} variant{item.variants.length > 1 ? 's' : ''}</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditingId(item.id)} style={{ ...btnStyle, padding: '6px 12px' }}><FiEdit3 /> Edit</button>
                                            <button onClick={() => deleteItem('quotes', index)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {/* Global Fields - Row 1 */}
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 2, minWidth: '200px' }}>
                                                <label style={labelStyle}>Tag / Category</label>
                                                <input
                                                    list="quote-tags"
                                                    style={inputStyle}
                                                    value={item.tag || ''}
                                                    onChange={(e) => updateItemField('quotes', index, 'tag', e.target.value)}
                                                    placeholder="e.g. Philosophy, Love, Hope"
                                                />
                                                <datalist id="quote-tags">
                                                    <option value="Philosophy" /><option value="Love" /><option value="Hope" />
                                                    <option value="Life" /><option value="Strength" /><option value="Perspective" />
                                                    <option value="Journey" /><option value="Happiness" /><option value="Nature" />
                                                </datalist>
                                            </div>
                                            <div style={{ flex: 1, minWidth: '150px' }}>
                                                <label style={labelStyle}>Date</label>
                                                <input
                                                    type="datetime-local"
                                                    style={inputStyle}
                                                    value={item.date || ''}
                                                    onChange={(e) => updateItemField('quotes', index, 'date', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Pin / Feature Settings */}
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(212, 175, 55, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`pin-quote-${index}`}
                                                    checked={!!item.isPinned}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        updateItemField('quotes', index, 'isPinned', isChecked);
                                                        if (isChecked && !item.pinExpiresAt) {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() + 7);
                                                            updateItemField('quotes', index, 'pinExpiresAt', d.toISOString());
                                                        }
                                                    }}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <label htmlFor={`pin-quote-${index}`} style={{ ...labelStyle, marginBottom: 0, color: '#d4af37', cursor: 'pointer' }}>✨ Feature / Pop to Top</label>
                                            </div>
                                            {!!item.isPinned && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Auto-Unpin At:</label>
                                                    <input
                                                        type="datetime-local"
                                                        style={{ ...inputStyle, width: 'auto', padding: '6px 12px' }}
                                                        value={item.pinExpiresAt ? new Date(new Date(item.pinExpiresAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            updateItemField('quotes', index, 'pinExpiresAt', val ? new Date(val).toISOString() : null);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); updateItemField('quotes', index, 'pinExpiresAt', null); }}
                                                        style={{ ...btnStyle, background: 'transparent', padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Optional: Urai & Notes */}
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div>
                                                <label style={labelStyle}>Urai / Meaning (Optional)</label>
                                                <textarea
                                                    style={{ ...inputStyle, minHeight: '60px' }}
                                                    value={item.urai || ''}
                                                    onChange={(e) => updateItemField('quotes', index, 'urai', e.target.value)}
                                                    placeholder="Prose meaning or commentary..."
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Notes / Context (Optional)</label>
                                                <textarea
                                                    style={{ ...inputStyle, minHeight: '50px' }}
                                                    value={item.notes || ''}
                                                    onChange={(e) => updateItemField('quotes', index, 'notes', e.target.value)}
                                                    placeholder="Background, inspiration, context..."
                                                />
                                            </div>
                                        </div>

                                        {/* Variants List */}
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={labelStyle}>Quote Variants (Languages)</label>
                                                <button onClick={() => addVariant('quotes', index)} style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'none', border: '1px dashed var(--border-color)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>+ Add Variant</button>
                                            </div>

                                            {item.variants?.map((variant, vIndex) => (
                                                <div key={vIndex} style={{ padding: '15px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative' }}>
                                                    <button
                                                        onClick={() => removeVariant('quotes', index, vIndex)}
                                                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        title="Remove Variant"
                                                    >
                                                        <FiX />
                                                    </button>

                                                    <div style={{ display: 'grid', gap: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={labelStyle}>Header Label</label>
                                                                <input
                                                                    list="variant-labels"
                                                                    style={inputStyle}
                                                                    value={variant.label || ''}
                                                                    onChange={(e) => updateVariant('quotes', index, vIndex, 'label', e.target.value)}
                                                                    placeholder="e.g. Original, Translation"
                                                                />
                                                            </div>
                                                            <div style={{ width: '150px' }}>
                                                                <label style={labelStyle}>Language</label>
                                                                <input
                                                                    list="lang-options"
                                                                    style={inputStyle}
                                                                    value={variant.lang || ''}
                                                                    onChange={(e) => updateVariant('quotes', index, vIndex, 'lang', e.target.value)}
                                                                    placeholder="e.g. ta, en"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={labelStyle}>Quote Text</label>
                                                            <textarea
                                                                style={{ ...inputStyle, minHeight: '80px', whiteSpace: 'pre', fontFamily: 'monospace' }}
                                                                value={variant.text || ''}
                                                                onChange={(e) => updateVariant('quotes', index, vIndex, 'text', e.target.value)}
                                                            />
                                                        </div>

                                                        {(() => {
                                                            const indicLangs = ['ta', 'ml', 'hi', 'sa'];
                                                            const isIndic = indicLangs.includes(variant.lang);
                                                            if (!isIndic) return null;

                                                            const requiredKeys = variant.lang === 'ml' ? ['en', 'ta'] : ['en'];
                                                            const existingKeys = variant.transliterations ? Object.keys(variant.transliterations) : [];
                                                            const allTranslKeys = [...new Set([...requiredKeys, ...existingKeys])];

                                                            return (
                                                                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-light)', marginTop: '10px' }}>
                                                                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Transliteration Targets</div>
                                                                    {allTranslKeys.map(tLang => (
                                                                        <div key={tLang} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Language: <code>{tLang}</code></span>
                                                                            </div>
                                                                            <div style={{ marginBottom: '8px' }}>
                                                                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Text Transliteration</label>
                                                                                <textarea
                                                                                    style={{ ...inputStyle, minHeight: '60px', whiteSpace: 'pre', fontFamily: 'monospace' }}
                                                                                    value={variant.transliterations?.[tLang] || ''}
                                                                                    onChange={(e) => updateTransliteration('quotes', index, vIndex, 'transliterations', tLang, e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Title Transliteration</label>
                                                                                <input
                                                                                    style={inputStyle}
                                                                                    value={variant.titleTransliterations?.[tLang] || ''}
                                                                                    onChange={(e) => updateTransliteration('quotes', index, vIndex, 'titleTransliterations', tLang, e.target.value)}
                                                                                    placeholder={`Romanized title for ${tLang}`}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <input id={`new-transl-quote-${index}-${vIndex}`} placeholder="Lang code (e.g. ml)" style={{ ...inputStyle, width: '120px', padding: '4px 8px' }} maxLength="3" />
                                                                        <button onClick={(e) => {
                                                                            e.preventDefault();
                                                                            const input = document.getElementById(`new-transl-quote-${index}-${vIndex}`);
                                                                            if (input.value.trim()) {
                                                                                updateTransliteration('quotes', index, vIndex, 'transliterations', input.value.trim().toLowerCase(), '');
                                                                                input.value = '';
                                                                            }
                                                                        }} style={{ ...btnStyle, padding: '4px 8px', fontSize: '0.75rem', background: 'var(--border-light)' }}>+ Add Optional Target</button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        <div>
                                                            <label style={labelStyle}>Author Name (in this language)</label>
                                                            <input
                                                                style={inputStyle}
                                                                value={variant.author || ''}
                                                                onChange={(e) => updateVariant('quotes', index, vIndex, 'author', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                                            <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: 'transparent' }}><FiX /> Cancel</button>
                                            <button
                                                onClick={() => handleSaveCollection('quotes', index)}
                                                disabled={savingIndex === index}
                                                style={{ ...btnStyle, background: 'var(--text-main)', color: 'var(--bg-app)' }}
                                            >
                                                {savingIndex === index ? 'Saving...' : <><FiCheck /> Save Item</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Shared datalists */}
                        <datalist id="variant-labels">
                            <option value="Original" /><option value="Translation" />
                            <option value="Variant" />
                        </datalist>
                        <datalist id="lang-options">
                            <option value="en">English</option><option value="ta">Tamil</option>
                            <option value="ml">Malayalam</option><option value="hi">Hindi</option>
                            <option value="sa">Sanskrit</option><option value="fr">French</option>
                        </datalist>
                    </div>
                )}

                {/* CUSTOM POEMS EDITOR */}
                {activeTab === 'poems' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {dataStore.poems.map((item, index) => (
                            <div key={item.id || index} style={{
                                padding: '20px',
                                background: 'var(--bg-card)',
                                borderRadius: '15px',
                                border: editingId === item.id ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}>
                                {editingId !== item.id ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{item.title || 'Untitled Poem'}</h3>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                                                {item.style && <span>{item.style}</span>}
                                                {item.theme && <span style={{ background: 'var(--bg-panel)', padding: '2px 8px', borderRadius: '4px' }}>{item.theme}</span>}
                                                {item.variants?.length > 0 && <span style={{ background: 'var(--nav-hover)', padding: '2px 8px', borderRadius: '4px' }}>{item.variants.length} variant{item.variants.length > 1 ? 's' : ''}</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditingId(item.id)} style={{ ...btnStyle, padding: '6px 12px' }}><FiEdit3 /> Edit</button>
                                            <button onClick={() => deleteItem('poems', index)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {/* Row 1: Title, Date */}
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 2, minWidth: '200px' }}>
                                                <label style={labelStyle}>Poem Title</label>
                                                <input
                                                    style={inputStyle}
                                                    value={item.title || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'title', e.target.value)}
                                                    placeholder="Enter poem title"
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: '150px' }}>
                                                <label style={labelStyle}>Date</label>
                                                <input
                                                    type="datetime-local"
                                                    style={inputStyle}
                                                    value={item.date || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'date', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Pin / Feature Settings */}
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(212, 175, 55, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`pin-poem-${index}`}
                                                    checked={!!item.isPinned}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        updateItemField('poems', index, 'isPinned', isChecked);
                                                        if (isChecked && !item.pinExpiresAt) {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() + 7);
                                                            updateItemField('poems', index, 'pinExpiresAt', d.toISOString());
                                                        }
                                                    }}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <label htmlFor={`pin-poem-${index}`} style={{ ...labelStyle, marginBottom: 0, color: '#d4af37', cursor: 'pointer' }}>✨ Feature / Pop to Top</label>
                                            </div>
                                            {!!item.isPinned && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                    <label style={{ ...labelStyle, marginBottom: 0 }}>Auto-Unpin At:</label>
                                                    <input
                                                        type="datetime-local"
                                                        style={{ ...inputStyle, width: 'auto', padding: '6px 12px' }}
                                                        value={item.pinExpiresAt ? new Date(new Date(item.pinExpiresAt).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            updateItemField('poems', index, 'pinExpiresAt', val ? new Date(val).toISOString() : null);
                                                        }}
                                                    />
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); updateItemField('poems', index, 'pinExpiresAt', null); }}
                                                        style={{ ...btnStyle, background: 'transparent', padding: '4px 8px', fontSize: '0.8rem' }}
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Row 2: Style, Theme, Meter */}
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '140px' }}>
                                                <label style={labelStyle}>Style / Form</label>
                                                <input
                                                    list="poem-styles"
                                                    style={inputStyle}
                                                    value={item.style || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'style', e.target.value)}
                                                    placeholder="e.g. Sonnet, Haiku"
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: '140px' }}>
                                                <label style={labelStyle}>Theme</label>
                                                <input
                                                    list="poem-themes"
                                                    style={inputStyle}
                                                    value={item.theme || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'theme', e.target.value)}
                                                    placeholder="e.g. Love, Nature"
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: '140px' }}>
                                                <label style={labelStyle}>Meter / Rhythm</label>
                                                <input
                                                    list="poem-meters"
                                                    style={inputStyle}
                                                    value={item.meter || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'meter', e.target.value)}
                                                    placeholder="e.g. Akaval, Venba"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2b: Classification */}
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '200px' }}>
                                                <label style={labelStyle}>Classification (Optional)</label>
                                                <select
                                                    style={inputStyle}
                                                    value={item.classification || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'classification', e.target.value || null)}
                                                >
                                                    <option value="">— None —</option>
                                                    <option value="அகம்">அகம் (Akam) — Love / Interior</option>
                                                    <option value="புறம்">புறம் (Puram) — War / Exterior</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Row 3: Dedication */}
                                        <div>
                                            <label style={labelStyle}>Dedication (Optional)</label>
                                            <input
                                                style={inputStyle}
                                                value={item.dedication || ''}
                                                onChange={(e) => updateItemField('poems', index, 'dedication', e.target.value)}
                                                placeholder="e.g. For someone special..."
                                            />
                                        </div>

                                        {/* Row 4: Urai & Notes */}
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div>
                                                <label style={labelStyle}>Urai / Meaning / Commentary (Optional)</label>
                                                <textarea
                                                    style={{ ...inputStyle, minHeight: '80px' }}
                                                    value={item.urai || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'urai', e.target.value)}
                                                    placeholder="Prose explanation or meaning of the poem..."
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Notes / Context (Optional)</label>
                                                <textarea
                                                    style={{ ...inputStyle, minHeight: '50px' }}
                                                    value={item.notes || ''}
                                                    onChange={(e) => updateItemField('poems', index, 'notes', e.target.value)}
                                                    placeholder="Background, inspiration, context..."
                                                />
                                            </div>
                                        </div>

                                        {/* Variants List */}
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={labelStyle}>Poem Variants (Languages)</label>
                                                <button onClick={() => addVariant('poems', index)} style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'none', border: '1px dashed var(--border-color)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>+ Add Variant</button>
                                            </div>

                                            {item.variants?.map((variant, vIndex) => (
                                                <div key={vIndex} style={{ padding: '15px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative' }}>
                                                    <button
                                                        onClick={() => removeVariant('poems', index, vIndex)}
                                                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        title="Remove Variant"
                                                    >
                                                        <FiX />
                                                    </button>

                                                    <div style={{ display: 'grid', gap: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={labelStyle}>Header Label</label>
                                                                <input
                                                                    list="variant-labels-poems"
                                                                    style={inputStyle}
                                                                    value={variant.label || ''}
                                                                    onChange={(e) => updateVariant('poems', index, vIndex, 'label', e.target.value)}
                                                                    placeholder="e.g. Original, Translation"
                                                                />
                                                            </div>
                                                            <div style={{ width: '150px' }}>
                                                                <label style={labelStyle}>Language</label>
                                                                <input
                                                                    list="lang-options-poems"
                                                                    style={inputStyle}
                                                                    value={variant.lang || ''}
                                                                    onChange={(e) => updateVariant('poems', index, vIndex, 'lang', e.target.value)}
                                                                    placeholder="e.g. ta, en"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={labelStyle}>Poem Text (Whitespace Preserved)</label>
                                                            <textarea
                                                                style={{ ...inputStyle, minHeight: '180px', whiteSpace: 'pre', fontFamily: 'monospace' }}
                                                                value={variant.text || ''}
                                                                onChange={(e) => updateVariant('poems', index, vIndex, 'text', e.target.value)}
                                                            />
                                                        </div>

                                                        {(() => {
                                                            const indicLangs = ['ta', 'ml', 'hi', 'sa'];
                                                            const isIndic = indicLangs.includes(variant.lang);
                                                            if (!isIndic) return null;

                                                            const requiredKeys = variant.lang === 'ml' ? ['en', 'ta'] : ['en'];
                                                            const existingKeys = variant.transliterations ? Object.keys(variant.transliterations) : [];
                                                            const allTranslKeys = [...new Set([...requiredKeys, ...existingKeys])];

                                                            return (
                                                                <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-light)', marginTop: '10px' }}>
                                                                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Transliteration Targets</div>
                                                                    {allTranslKeys.map(tLang => (
                                                                        <div key={tLang} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Language: <code>{tLang}</code></span>
                                                                            </div>
                                                                            <div style={{ marginBottom: '8px' }}>
                                                                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Text Transliteration</label>
                                                                                <textarea
                                                                                    style={{ ...inputStyle, minHeight: '120px', whiteSpace: 'pre', fontFamily: 'monospace' }}
                                                                                    value={variant.transliterations?.[tLang] || ''}
                                                                                    onChange={(e) => updateTransliteration('poems', index, vIndex, 'transliterations', tLang, e.target.value)}
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Title Transliteration</label>
                                                                                <input
                                                                                    style={inputStyle}
                                                                                    value={variant.titleTransliterations?.[tLang] || ''}
                                                                                    onChange={(e) => updateTransliteration('poems', index, vIndex, 'titleTransliterations', tLang, e.target.value)}
                                                                                    placeholder={`Romanized title for ${tLang}`}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                        <input id={`new-transl-poem-${index}-${vIndex}`} placeholder="Lang code (e.g. ml)" style={{ ...inputStyle, width: '120px', padding: '4px 8px' }} maxLength="3" />
                                                                        <button onClick={(e) => {
                                                                            e.preventDefault();
                                                                            const input = document.getElementById(`new-transl-poem-${index}-${vIndex}`);
                                                                            if (input.value.trim()) {
                                                                                updateTransliteration('poems', index, vIndex, 'transliterations', input.value.trim().toLowerCase(), '');
                                                                                input.value = '';
                                                                            }
                                                                        }} style={{ ...btnStyle, padding: '4px 8px', fontSize: '0.75rem', background: 'var(--border-light)' }}>+ Add Optional Target</button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        <div>
                                                            <label style={labelStyle}>Author Name (in this language)</label>
                                                            <input
                                                                style={inputStyle}
                                                                value={variant.author || ''}
                                                                onChange={(e) => updateVariant('poems', index, vIndex, 'author', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                                            <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: 'transparent' }}><FiX /> Cancel</button>
                                            <button
                                                onClick={() => handleSaveCollection('poems', index)}
                                                disabled={savingIndex === index}
                                                style={{ ...btnStyle, background: 'var(--text-main)', color: 'var(--bg-app)' }}
                                            >
                                                {savingIndex === index ? 'Saving...' : <><FiCheck /> Save Item</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Shared datalists for poems */}
                        <datalist id="poem-styles">
                            {/* Tamil Classical */}
                            <option value="வெண்பா" /><option value="ஆசிரியப்பா" /><option value="கலிப்பா" />
                            <option value="வஞ்சிப்பா" /><option value="மருட்பா" /><option value="குறள் வெண்பா" />
                            <option value="சிந்து" /><option value="புதுக்கவிதை" /><option value="சங்கம்" /><option value="ஹைக்கூ" />
                            {/* English / Western */}
                            <option value="Sonnet" /><option value="Epic" /><option value="Ballad" /><option value="Ode" />
                            <option value="Elegy" /><option value="Limerick" /><option value="Haiku" /><option value="Free Verse" />
                            <option value="Lyric" /><option value="Rhyming Verse" /><option value="Slam" />
                        </datalist>
                        <datalist id="poem-themes">
                            <option value="Love" /><option value="Nature" /><option value="Philosophy" />
                            <option value="Spirituality" /><option value="Loss" /><option value="Hope" />
                            <option value="Identity" /><option value="War" /><option value="Life" />
                            <option value="காதல்" /><option value="இயற்கை" /><option value="தத்துவம்" />
                        </datalist>
                        <datalist id="poem-meters">
                            <option value="Akaval (அகவல்)" /><option value="Venba (வெண்பா)" />
                            <option value="Kalippa (கலிப்பா)" /><option value="Iambic Pentameter" />
                            <option value="Trochaic" /><option value="Free" />
                        </datalist>
                        <datalist id="variant-labels-poems">
                            <option value="Original" /><option value="Translation" />
                            <option value="Variant" />
                        </datalist>
                        <datalist id="lang-options-poems">
                            <option value="en">English</option><option value="ta">Tamil</option>
                            <option value="ml">Malayalam</option><option value="hi">Hindi</option>
                            <option value="sa">Sanskrit</option><option value="fr">French</option>
                        </datalist>
                    </div>
                )}

                {/* GENERIC STANDARD POST EDITOR (Blog, Articles, Essays, etc.) */}
                {SCHEMAS[activeTab]?.type === 'standard_post' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {dataStore[activeTab].map((item, index) => (
                            <div key={item.id || index} style={{
                                padding: '20px',
                                background: 'var(--bg-card)',
                                borderRadius: '15px',
                                border: editingId === item.id ? '2px solid var(--text-main)' : '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}>
                                {editingId !== item.id ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{item.title || item.date || 'Untitled'}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {new Date(item.date).toLocaleDateString()}
                                                {item.tags && ` • ${item.tags}`}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditingId(item.id)} style={{ ...btnStyle, padding: '6px 12px' }}><FiEdit3 /> Edit</button>
                                            <button onClick={() => deleteItem(activeTab, index)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                            {SCHEMAS[activeTab].fields.map(field => (
                                                <div
                                                    key={field.key}
                                                    style={{
                                                        display: 'flex', flexDirection: 'column', gap: '6px',
                                                        gridColumn: field.fullWidth ? '1 / -1' : 'auto'
                                                    }}
                                                >
                                                    <label style={labelStyle}>{field.label}</label>
                                                    {field.type === 'textarea' ? (
                                                        <textarea
                                                            style={{
                                                                ...inputStyle,
                                                                minHeight: field.rows ? `${field.rows * 24}px` : 'auto',
                                                                ...(field.style || {})
                                                            }}
                                                            value={item[field.key] || ''}
                                                            onChange={(e) => updateGenericItem(activeTab, index, field.key, e.target.value)}
                                                        />
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            style={inputStyle}
                                                            value={item[field.key] || ''}
                                                            onChange={(e) => updateGenericItem(activeTab, index, field.key, e.target.value)}
                                                            placeholder={field.placeholder || ''}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '15px' }}>
                                            <button onClick={() => setEditingId(null)} style={{ ...btnStyle, background: 'transparent' }}><FiX /> Cancel</button>
                                            <button
                                                onClick={() => handleSaveCollection(activeTab, index)}
                                                disabled={savingIndex === index}
                                                style={{ ...btnStyle, background: 'var(--text-main)', color: 'var(--bg-app)' }}
                                            >
                                                {savingIndex === index ? 'Saving...' : <><FiCheck /> Save Item</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {dataStore[activeTab].length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '15px' }}>
                                No items yet. Click "Add New" to start writing.
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

// -- STYLES --
const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)', color: 'var(--text-main)',
    cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem'
};

const inputStyle = {
    padding: '10px', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-app)', color: 'var(--text-main)',
    width: '100%', fontSize: '0.95rem',
    fontFamily: 'inherit'
};

const labelStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    display: 'block'
};

const getTabStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px',
    borderRadius: '99px',
    border: 'none',
    background: isActive ? 'var(--text-main)' : 'var(--bg-panel)',
    color: isActive ? 'var(--bg-app)' : 'var(--text-muted)',
    cursor: 'pointer',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease'
});

export default Admin;
