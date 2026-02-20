
import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit3, FiUser, FiMessageCircle, FiCheck, FiX, FiEye } from 'react-icons/fi';

// Import Data (Initial State)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';

// --- DATA SCHEMAS ---
const SCHEMAS = {
    quotes: {
        fields: [
            { key: 'text', label: 'Quote Text', type: 'textarea', rows: 3, fullWidth: true },
            { key: 'translation', label: 'Translation', type: 'textarea', rows: 2, fullWidth: true },
            { key: 'author', label: 'Author', type: 'text', default: 'Elvan Parthasarathy' },
            { key: 'tag', label: 'Tag', type: 'text', default: 'Philosophy' },
            { key: 'lang', label: 'Language', type: 'select', options: ['ta', 'en'] }
        ],
        icon: <FiMessageCircle />
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
        const newItem = { id: newId };
        if (SCHEMAS[collection]) {
            SCHEMAS[collection].fields.forEach(f => {
                newItem[f.key] = f.default || '';
            });
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

    const updateItem = (collection, index, field, value) => {
        const newData = [...dataStore[collection]];
        newData[index] = { ...newData[index], [field]: value };
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const updateProfile = (field, value) => {
        setDataStore(prev => ({
            ...prev,
            profile: { ...prev.profile, [field]: value }
        }));
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
                                        <label style={labelStyle}>Profile Pic URL</label>
                                        <input style={inputStyle} value={dataStore.profile.profilePic || ''} onChange={(e) => updateProfile('profilePic', e.target.value)} />
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

                {/* LIST EDITOR (QUOTES) */}
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
                                            <p style={{ fontStyle: 'italic', fontSize: '1rem', fontWeight: '500' }}>"{item.text || 'Empty Quote'}"</p>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <span><FiUser size={12} /> {item.author}</span>
                                                <span style={{ background: 'var(--bg-panel)', padding: '2px 8px', borderRadius: '4px' }}>{item.tag}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditingId(item.id)} style={{ ...btnStyle, padding: '6px 12px' }}><FiEdit3 /> Edit</button>
                                            <button onClick={() => deleteItem('quotes', index)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                            {SCHEMAS.quotes.fields.map(field => (
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
                                                            style={{ ...inputStyle, minHeight: field.rows ? `${field.rows * 24}px` : 'auto' }}
                                                            value={item[field.key] || ''}
                                                            onChange={(e) => updateItem('quotes', index, field.key, e.target.value)}
                                                        />
                                                    ) : field.type === 'select' ? (
                                                        <select
                                                            style={inputStyle}
                                                            value={item[field.key] || ''}
                                                            onChange={(e) => updateItem('quotes', index, field.key, e.target.value)}
                                                        >
                                                            {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            style={inputStyle}
                                                            value={item[field.key] || ''}
                                                            onChange={(e) => updateItem('quotes', index, field.key, e.target.value)}
                                                        />
                                                    )}
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
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
};

export default Admin;
