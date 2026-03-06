import React from 'react';
import { Link } from 'react-router-dom';
import essaysData from '../../data/essays.json';

const Essays = () => {
    const posts = [...essaysData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ width: '100%', margin: 0, padding: '10px 0 100px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '10px', color: 'var(--text-main)' }}>ஆய்வுரைகள்</h1>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Essays</div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>என் கருத்துரைகளும் திறனாய்வுகளும்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px' }}>My formal reviews and critical observations.</p>
                </div>
                <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', background: 'color-mix(in srgb, var(--text-main) 6%, transparent)', borderRadius: '100px', padding: '10px 20px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '40px', maxWidth: '800px' }}>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <article key={post.id || index} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '4px',
                            padding: '40px',
                            borderLeft: '4px solid var(--text-main)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                                    {post.subject || 'Essay'} • {new Date(post.date).toLocaleDateString()}
                                </span>
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '12px 0', lineHeight: '1.2', fontFamily: 'serif' }}>
                                    {post.title}
                                </h2>
                            </div>

                            <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontFamily: 'serif' }}>
                                {post.content}
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No essays archived yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Essays;
