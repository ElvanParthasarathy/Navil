
import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit3, FiUser, FiMessageCircle, FiCheck, FiX, FiList, FiGlobe, FiFileText, FiBookOpen, FiPenTool, FiSun, FiBook } from 'react-icons/fi';

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
        type: 'standard_post',
        fields: [
            { key: 'title', label: 'Poem Title', type: 'text', required: true },
            { key: 'date', label: 'Date', type: 'datetime-local' },
            { key: 'style', label: 'Style/Form', type: 'text' },
            { key: 'content', label: 'Poem (Whitespace Preserved)', type: 'textarea', rows: 15, fullWidth: true, style: { whiteSpace: 'pre', fontFamily: 'monospace' } }
        ]
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

    // Toggle States
    const [editingId, setEditingId] = useState(null); // Quotes: item.id
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [savingIndex, setSavingIndex] = useState(null);

    const handleSaveCollection = async (collection, specificIndex = null) => {
        if (specificIndex !== null) setSavingIndex(specificIndex);
        else setStatus('loading');

        setMessage('');

        try {
            const response = await fetch('/api/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: collection === 'stories' ? 'short_stories' : collection, // Map stories to short_stories.json
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
        } catch (error) {
            setStatus('error');
            setMessage('Network error.');
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
                tag: 'Philosophy',
                variants: [
                    { label: 'Original', text: '', author: 'Elvan Parthasarathy', lang: 'en' }
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

    // --- QUOTE SPECIFIC UPDATES ---
    const updateQuoteField = (index, field, value) => {
        const newQuotes = [...dataStore.quotes];
        newQuotes[index] = { ...newQuotes[index], [field]: value };
        setDataStore(prev => ({ ...prev, quotes: newQuotes }));
    };

    const updateVariant = (quoteIndex, variantIndex, field, value) => {
        const newQuotes = [...dataStore.quotes];
        const newVariants = [...newQuotes[quoteIndex].variants];
        newVariants[variantIndex] = { ...newVariants[variantIndex], [field]: value };
        newQuotes[quoteIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, quotes: newQuotes }));
    };

    const addVariant = (quoteIndex) => {
        const newQuotes = [...dataStore.quotes];
        newQuotes[quoteIndex].variants.push({
            label: 'Translation', text: '', author: 'Elvan Parthasarathy', lang: 'en'
        });
        setDataStore(prev => ({ ...prev, quotes: newQuotes }));
    };

    const removeVariant = (quoteIndex, variantIndex) => {
        if (!window.confirm("Remove this variant?")) return;
        const newQuotes = [...dataStore.quotes];
        newQuotes[quoteIndex].variants.splice(variantIndex, 1);
        setDataStore(prev => ({ ...prev, quotes: newQuotes }));
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
                                            <p style={{ fontStyle: 'italic', fontSize: '1rem', fontWeight: '500' }}>"{item.variants?.[0]?.text || 'Empty Quote'}"</p>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <span><FiUser size={12} /> {item.variants?.[0]?.author || 'Unknown'}</span>
                                                <span style={{ background: 'var(--bg-panel)', padding: '2px 8px', borderRadius: '4px' }}>{item.tag}</span>
                                                {item.variants?.length > 1 && <span style={{ background: 'var(--nav-hover)', padding: '2px 8px', borderRadius: '4px' }}>+{item.variants.length - 1} more</span>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditingId(item.id)} style={{ ...btnStyle, padding: '6px 12px' }}><FiEdit3 /> Edit</button>
                                            <button onClick={() => deleteItem('quotes', index)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {/* Global Fields */}
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={labelStyle}>Tag / Category</label>
                                                <input
                                                    style={inputStyle}
                                                    value={item.tag || ''}
                                                    onChange={(e) => updateQuoteField(index, 'tag', e.target.value)}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={labelStyle}>ID</label>
                                                <input style={{ ...inputStyle, background: 'var(--bg-panel)', color: 'var(--text-muted)' }} value={item.id} disabled />
                                            </div>
                                        </div>

                                        {/* Variants List */}
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label style={labelStyle}>Quote Variants (Languages)</label>
                                                <button onClick={() => addVariant(index)} style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'none', border: '1px dashed var(--border-color)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>+ Add Variant</button>
                                            </div>

                                            {item.variants?.map((variant, vIndex) => (
                                                <div key={vIndex} style={{ padding: '15px', background: 'var(--bg-panel)', borderRadius: '12px', border: '1px solid var(--border-light)', position: 'relative' }}>
                                                    <button
                                                        onClick={() => removeVariant(index, vIndex)}
                                                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        title="Remove Variant"
                                                    >
                                                        <FiX />
                                                    </button>

                                                    <div style={{ display: 'grid', gap: '12px' }}>
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <div style={{ flex: 1 }}>
                                                                <label style={labelStyle}>Header Label (e.g. Original, Translation)</label>
                                                                <input
                                                                    style={inputStyle}
                                                                    value={variant.label || ''}
                                                                    onChange={(e) => updateVariant(index, vIndex, 'label', e.target.value)}
                                                                    placeholder="e.g. Original Tamil"
                                                                />
                                                            </div>
                                                            <div style={{ width: '120px' }}>
                                                                <label style={labelStyle}>Language</label>
                                                                <select
                                                                    style={inputStyle}
                                                                    value={variant.lang || 'en'}
                                                                    onChange={(e) => updateVariant(index, vIndex, 'lang', e.target.value)}
                                                                >
                                                                    <option value="en">English (en)</option>
                                                                    <option value="ta">Tamil (ta)</option>
                                                                    <option value="ml">Malayalam (ml)</option>
                                                                    <option value="hi">Hindi (hi)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label style={labelStyle}>Quote Text</label>
                                                            <textarea
                                                                style={{ ...inputStyle, minHeight: '80px' }}
                                                                value={variant.text || ''}
                                                                onChange={(e) => updateVariant(index, vIndex, 'text', e.target.value)}
                                                            />
                                                        </div>

                                                        <div>
                                                            <label style={labelStyle}>Author Name (in this language)</label>
                                                            <input
                                                                style={inputStyle}
                                                                value={variant.author || ''}
                                                                onChange={(e) => updateVariant(index, vIndex, 'author', e.target.value)}
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
