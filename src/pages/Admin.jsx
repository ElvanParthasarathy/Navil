import React, { useState } from 'react';

const Admin = () => {
    const [formData, setFormData] = useState({
        text: '',
        translation: '',
        author: 'Elvan Parthasarathy',
        tag: 'Philosophy',
        lang: 'ta'
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch('/api/addQuote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Quote added successfully! It will appear after the next deployment (approx 1 min).');
                setFormData({ ...formData, text: '', translation: '' }); // Clear text fields
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to add quote.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-primary)' }}>
            <h1 style={{ marginBottom: '2rem' }}>Add New Quote</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Text (Quote)</label>
                    <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleChange}
                        required
                        rows="4"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Translation (Optional)</label>
                    <textarea
                        name="translation"
                        value={formData.translation}
                        onChange={handleChange}
                        rows="2"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Language</label>
                        <select
                            name="lang"
                            value={formData.lang}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                            <option value="ta">Tamil</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tag</label>
                        <input
                            type="text"
                            name="tag"
                            value={formData.tag}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Author</label>
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    style={{
                        padding: '1rem',
                        background: status === 'loading' ? 'var(--text-secondary)' : 'var(--accent-color, #0070f3)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginTop: '1rem'
                    }}
                >
                    {status === 'loading' ? 'Posting...' : 'Add Quote'}
                </button>

                {status === 'success' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 255, 0, 0.1)', color: 'green', borderRadius: '8px' }}>
                        {message}
                    </div>
                )}

                {status === 'error' && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 0, 0, 0.1)', color: 'red', borderRadius: '8px' }}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Admin;
