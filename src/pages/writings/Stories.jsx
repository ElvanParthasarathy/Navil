import React from 'react';
import { Link } from 'react-router-dom';
import storiesData from '../../data/short_stories.json';

const Stories = () => {
    const posts = [...storiesData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ width: '100%', margin: 0, padding: '10px 0 100px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '10px', color: 'var(--text-main)' }}>சிறுகதைகள்</h1>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Short Stories</div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>என் கற்பனையில் உருவான சிறு புனைவுகள்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px' }}>My original fiction and short narratives.</p>
                </div>
                <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', background: 'color-mix(in srgb, var(--text-main) 6%, transparent)', borderRadius: '100px', padding: '10px 20px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </div>

            <div style={{ display: 'grid', gap: '60px', maxWidth: '800px' }}>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <article key={post.id || index} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        }}>
                            {post.cover && (
                                <div style={{ height: '240px', overflow: 'hidden' }}>
                                    <img src={post.cover} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}

                            <div style={{ padding: '32px 40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                                    <h2 style={{ fontSize: '2.2rem', fontWeight: '800', fontFamily: 'serif', lineHeight: '1.1' }}>
                                        {post.title}
                                    </h2>
                                    {post.genre && (
                                        <span style={{
                                            background: 'var(--text-main)',
                                            color: 'var(--bg-app)',
                                            padding: '4px 12px',
                                            borderRadius: '99px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase'
                                        }}>
                                            {post.genre}
                                        </span>
                                    )}
                                </div>

                                {post.synopsis && (
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.1rem' }}>
                                        {post.synopsis}
                                    </p>
                                )}

                                <div style={{ fontSize: '1.15rem', lineHeight: '1.9', color: 'var(--text-main)', whiteSpace: 'pre-wrap', fontFamily: 'serif' }}>
                                    {post.content}
                                </div>

                                <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '2rem', color: 'var(--border-color)' }}>***</span>
                                </div>
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No stories written yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Stories;
