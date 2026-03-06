import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar } from 'react-icons/fi';
import blogData from '../../data/blog.json';

const Blog = () => {
    const posts = [...blogData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ width: '100%', margin: 0, padding: '10px 0 100px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '10px', color: 'var(--text-main)' }}>வலைப்பதிவுகள்</h1>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Blog Posts</div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>என் அன்றாடத் தேடல்களும் வாழ்வியல் பகிர்வுகளும்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px' }}>My daily reflections and personal updates.</p>
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
                            borderRadius: '20px',
                            padding: '32px',
                            border: '1px solid var(--border-light)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
                                <FiCalendar />
                                {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                {post.tags && <span>• {post.tags}</span>}
                            </div>

                            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '16px', lineHeight: '1.3' }}>
                                {post.title}
                            </h2>

                            {post.cover && (
                                <img src={post.cover} alt={post.title} style={{ width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '20px', objectFit: 'cover', maxHeight: '400px' }} />
                            )}

                            {post.excerpt && (
                                <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                    {post.excerpt}
                                </p>
                            )}

                            <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                                {post.content}
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No blog posts yet. Stay tuned!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
