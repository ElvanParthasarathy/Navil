// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { FiSave, FiEdit2, FiX } from 'react-icons/fi';
import { db } from '../../lib/firebaseClient';
import RichTextEditor from './RichTextEditor';
import { ref, onValue, set } from 'firebase/database';

const getInitialAbout = () => {
    try {
        const cached = localStorage.getItem('elvan_about_cache');
        if (cached) return JSON.parse(cached);
    } catch (e) { console.error(e); }
    return null;
};

export const AboutEditor = () => {
    const [data, setData] = useState(getInitialAbout());
    const [isEditing, setIsEditing] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [message, setMessage] = useState('');

    // Real-time listener
    useEffect(() => {
        const aboutRef = ref(db, 'config/about_page');
        const unsub = onValue(aboutRef, (snap) => {
            if (snap.exists()) {
                const val = snap.val();
                setData(val);
                localStorage.setItem('elvan_about_cache', JSON.stringify(val));
            }
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        setSaveStatus('loading');
        try {
            await set(ref(db, 'config/about_page'), data);
            setSaveStatus('success');
            setMessage('About page saved!');
            setIsEditing(false);
        } catch (err) {
            setSaveStatus('error');
            setMessage('Error: ' + err.message);
        }
        setTimeout(() => { setSaveStatus('idle'); setMessage(''); }, 3000);
    };

    const updateField = (key, val) => {
        setData(prev => ({ ...prev, [key]: val }));
    };

    if (!data) {
        return (
            <div className="admin-content-area" style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading editor...</p>
            </div>
        );
    }

    // View mode
    if (!isEditing) {
        return (
            <div className="admin-content-area adm-custom-scroll" style={{ overflowY: 'auto' }}>
                <div style={{ padding: '32px', maxWidth: '800px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>About Page</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                            Manage the content displayed on your About page.
                        </p>
                    </div>
                    <button className="adm-btn primary" onClick={() => setIsEditing(true)}>
                        <FiEdit2 size={16} /> Edit Content
                    </button>
                </div>

                {/* Preview Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <PreviewCard label="Hero Title" value={data.hero_title} />
                    <PreviewCard label="Hero Subtitle" value={data.hero_subtitle} />
                    <PreviewCard label="Identity" value={data.identity_text} isHtml />
                    <PreviewCard label="Education" value={data.education_text} isHtml />
                    <PreviewCard label="Social Presence" value={data.social_text} isHtml />
                    <PreviewCard label="Philosophy" value={data.philosophy_lines} isHtml />
                    <PreviewCard label="Contact Title (Tamil)" value={data.contact_tamil} />
                    <PreviewCard label="Contact Title (English)" value={data.contact_english} />
                    <PreviewCard label="Contact Desc (Tamil)" value={data.contact_desc_tamil} />
                    <PreviewCard label="Contact Desc (English)" value={data.contact_desc_english} />
                    <PreviewCard label="Location" value={data.location} />
                    <PreviewCard label="Portfolio URL" value={data.portfolio_url} />
                </div>
            </div>
        </div>
    );
    }

    // Edit mode
    return (
        <div className="admin-content-area adm-custom-scroll" style={{ overflowY: 'auto' }}>
            <div style={{ padding: '32px', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Edit About Page</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="adm-btn" onClick={() => setIsEditing(false)}>
                        <FiX size={16} /> Cancel
                    </button>
                    <button className="adm-btn primary" onClick={handleSave} disabled={saveStatus === 'loading'}>
                        <FiSave size={16} /> {saveStatus === 'loading' ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {message && (
                <div style={{
                    padding: '12px 16px', borderRadius: '12px', marginBottom: '24px',
                    background: saveStatus === 'error' ? '#fee2e2' : '#dcfce7',
                    color: saveStatus === 'error' ? '#b91c1c' : '#166534',
                    fontSize: '0.9rem', fontWeight: 600
                }}>
                    {message}
                </div>
            )}

            <SectionLabel>Hero Section</SectionLabel>
            <FieldRow>
                <Field label="Hero Title" value={data.hero_title} onChange={v => updateField('hero_title', v)} />
                <Field label="Hero Subtitle" value={data.hero_subtitle} onChange={v => updateField('hero_subtitle', v)} />
            </FieldRow>

            <SectionLabel>Content Cards</SectionLabel>
            <div className="adm-field" style={{ marginBottom: '16px' }}>
                <label className="adm-label">Identity</label>
                <RichTextEditor content={data.identity_text} onChange={v => updateField('identity_text', v)} placeholder="Write about your identity..." />
            </div>
            <div className="adm-field" style={{ marginBottom: '16px' }}>
                <label className="adm-label">Education</label>
                <RichTextEditor content={data.education_text} onChange={v => updateField('education_text', v)} placeholder="Write about your education..." />
            </div>
            <div className="adm-field" style={{ marginBottom: '16px' }}>
                <label className="adm-label">Social Presence</label>
                <RichTextEditor content={data.social_text} onChange={v => updateField('social_text', v)} placeholder="Write about your social presence..." />
            </div>
            <div className="adm-field" style={{ marginBottom: '16px' }}>
                <label className="adm-label">Philosophy</label>
                <RichTextEditor content={data.philosophy_lines} onChange={v => updateField('philosophy_lines', v)} placeholder="Write your philosophy..." />
            </div>

            <SectionLabel>Contact Section</SectionLabel>
            <FieldRow>
                <Field label="Contact Title (Tamil)" value={data.contact_tamil} onChange={v => updateField('contact_tamil', v)} />
                <Field label="Contact Title (English)" value={data.contact_english} onChange={v => updateField('contact_english', v)} />
            </FieldRow>
            <FieldRow>
                <Field label="Contact Desc (Tamil)" value={data.contact_desc_tamil} onChange={v => updateField('contact_desc_tamil', v)} />
                <Field label="Contact Desc (English)" value={data.contact_desc_english} onChange={v => updateField('contact_desc_english', v)} />
            </FieldRow>

            <SectionLabel>Other</SectionLabel>
            <Field label="Location" value={data.location} onChange={v => updateField('location', v)} />
            <Field label="Portfolio URL" value={data.portfolio_url} onChange={v => updateField('portfolio_url', v)} />
        </div>
    </div>
    );
};

// ── Shared sub-components ──

const SectionLabel = ({ children }) => (
    <div style={{
        fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px',
        color: 'var(--text-muted)', marginTop: '32px', marginBottom: '16px', paddingBottom: '8px',
        borderBottom: '1px solid var(--border-light)'
    }}>{children}</div>
);

const FieldRow = ({ children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {children}
    </div>
);

const Field = ({ label, value, onChange, multiline, rows = 2, hint }) => (
    <div className="adm-field" style={{ marginBottom: '16px' }}>
        <label className="adm-label">{label}</label>
        {multiline ? (
            <textarea
                className="adm-input"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                rows={rows}
                style={{ resize: 'vertical', minHeight: '60px' }}
            />
        ) : (
            <input
                className="adm-input"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            />
        )}
        {hint && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{hint}</span>}
    </div>
);

const PreviewCard = ({ label, value, isHtml }) => (
    <div style={{
        background: 'var(--bg-panel)', borderRadius: '16px', padding: '20px',
        border: '1px solid var(--border-light)'
    }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {label}
        </div>
        {isHtml ? (
            <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: value || '' }} />
        ) : (
            <div style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty</span>}
            </div>
        )}
    </div>
);

export default AboutEditor;
