import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSun } from 'react-icons/fi';
import thoughtsData from '../../data/thoughts.json';

const Thoughts = () => {
    const posts = [...thoughtsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                <FiArrowLeft /> Back to Writings
            </Link>

            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.1' }}>எண்ணங்கள்</h1>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Thoughts</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Fleeting ideas and stream of consciousness.</p>
            </header>

            <div style={{ display: 'grid', gap: '24px' }}>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div key={post.id || index} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '16px',
                            padding: '24px',
                            border: '1px solid var(--border-light)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span>{new Date(post.date).toLocaleDateString()}</span>
                                {post.mood && <span>Model: {post.mood}</span>}
                            </div>

                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                                {post.content}
                            </p>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No thoughts recorded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Thoughts;
