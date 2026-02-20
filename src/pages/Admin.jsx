
import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiEdit3, FiUser, FiMessageCircle } from 'react-icons/fi';

// Import Data (Initial State)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';

// --- DATA SCHEMAS ---
const SCHEMAS = {
    quotes: {
        fields: [
            { key: 'text', label: 'Quote Text', type: 'textarea', rows: 3 },
            { key: 'translation', label: 'Translation', type: 'textarea', rows: 2 },
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

    const currentSchema = SCHEMAS[activeTab];

    const handleSave = async (collection) => {
        setStatus('loading');
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
                setStatus('success');
                setMessage('Saved successfully! Changes will appear in ~1-2 mins.');
            } else {
                setStatus('error');
                setMessage(resData.error || 'Failed to save.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error.');
        }
    };

    // Generic Add Item
    const addItem = (collection) => {
        const newItem = { id: Date.now().toString() };
        // Pre-fill defaults
        if (SCHEMAS[collection]) {
            SCHEMAS[collection].fields.forEach(f => {
                newItem[f.key] = f.default || '';
            });
            // Add date if needed
            if (SCHEMAS[collection].fields.some(f => f.key === 'date')) {
                newItem.date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            }
        }

        setDataStore(prev => ({
            ...prev,
            [collection]: [newItem, ...prev[collection]]
        }));
    };

    // Generic Delete
    const deleteItem = (collection, index) => {
        if (!window.confirm("Are you sure?")) return;
        const newData = [...dataStore[collection]];
        newData.splice(index, 1);
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    // Generic Update
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
                    background: status === 'success' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                    color: status === 'success' ? '#10B981' : '#EF4444'
                }}>
                    {message}
                </div>
            )}

            {/* CONTENT EDITOR */}
            <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Manage {activeTab}</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {activeTab !== 'profile' && (
                            <button onClick={() => addItem(activeTab)} style={btnStyle}>
                                <FiPlus /> Add New
                            </button>
                        )}
                        <button onClick={() => handleSave(activeTab)} style={{ ...btnStyle, background: 'var(--text-main)', color: 'var(--bg-app)' }}>
                            {status === 'loading' ? 'Saving...' : <><FiSave /> Save Changes</>}
                        </button>
                    </div>
                </div>

                {/* PROFILE EDITOR */}
                {activeTab === 'profile' && (
                    <div style={{ display: 'grid', gap: '20px' }}>
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
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '10px' }}>Instagram Stats</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={labelStyle}>Followers</label>
                                        <input type="number" style={inputStyle} value={dataStore.profile.followers || 0} onChange={(e) => updateProfile('followers', parseInt(e.target.value))} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={labelStyle}>Following</label>
                                        <input type="number" style={inputStyle} value={dataStore.profile.following || 0} onChange={(e) => updateProfile('following', parseInt(e.target.value))} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={labelStyle}>Posts Count</label>
                                        <input type="number" style={inputStyle} value={dataStore.profile.postsCount || 0} onChange={(e) => updateProfile('postsCount', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LIST EDITOR */}
                {currentSchema && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {dataStore[activeTab].map((item, index) => (
                            <div key={index} style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
                                <button
                                    onClick={() => deleteItem(activeTab, index)}
                                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                                >
                                    <FiTrash2 size={18} />
                                </button>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', paddingRight: '40px' }}>
                                    {currentSchema.fields.map(field => (
                                        <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{field.label}</label>

                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    style={{ ...inputStyle, minHeight: field.rows ? `${field.rows * 24}px` : 'auto' }}
                                                    value={item[field.key] || ''}
                                                    onChange={(e) => updateItem(activeTab, index, field.key, e.target.value)}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    style={inputStyle}
                                                    value={item[field.key] || ''}
                                                    onChange={(e) => updateItem(activeTab, index, field.key, e.target.value)}
                                                >
                                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    style={inputStyle}
                                                    value={item[field.key] || ''}
                                                    onChange={(e) => updateItem(activeTab, index, field.key, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
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
    cursor: 'pointer', fontWeight: '600'
};

const inputStyle = {
    padding: '10px', borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-app)', color: 'var(--text-main)',
    width: '100%', fontSize: '0.95rem'
};

const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
};

export default Admin;
