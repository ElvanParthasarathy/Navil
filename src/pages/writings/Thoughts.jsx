import React from 'react';
import { Link } from 'react-router-dom';
import thoughtsData from '../../data/thoughts.json';

const Thoughts = () => {
    const posts = [...thoughtsData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ width: '100%', margin: 0, padding: '10px 0 100px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '10px', color: 'var(--text-main)' }}>எண்ணங்கள்</h1>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Thoughts</div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>என் உள்ளத்தின் தடையற்ற எண்ண ஓட்டங்கள்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px' }}>My unfiltered thoughts and quick ideas.</p>
                </div>
                <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', background: 'color-mix(in srgb, var(--text-main) 6%, transparent)', borderRadius: '100px', padding: '10px 20px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
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
                                {post.mood && <span>Mood: {post.mood}</span>}
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
