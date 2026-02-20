
import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit3, FiUser, FiMessageCircle, FiCheck, FiX, FiList, FiGlobe } from 'react-icons/fi';

// Import Data (Initial State)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('quotes');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');

    // Manage Data States
    const [dataStore, setDataStore] = useState({
        quotes: initialQuotes,
        profile: initialProfile
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
                    collection,
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
        let newItem = { id: newId };

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
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
                {Object.keys(dataStore).map(key => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '99px',
                            border: 'none',
                            background: activeTab === key ? 'var(--text-main)' : 'var(--bg-panel)',
                            color: activeTab === key ? 'var(--bg-app)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {key === 'profile' ? <FiUser /> : <FiMessageCircle />} {key.charAt(0).toUpperCase() + key.slice(1)}
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
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Manage {activeTab}</h2>
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

                {/* QUOTES EDITOR (MULTI-VARIANT) */}
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
                                            {/* Preview First Variant */}
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
            </div>
        </div>
    );
};

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
    width: '100%', fontSize: '0.95rem'
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

export default Admin;
