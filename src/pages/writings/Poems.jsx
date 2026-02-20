import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiPenTool } from 'react-icons/fi';
import poemsData from '../../data/poems.json';

const Poems = () => {
    const posts = [...(poemsData || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                <FiArrowLeft /> Back to Writings
            </Link>

            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>Poems</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Verses, rhythms, and lyrical expressions.</p>
            </header>

            <div style={{ display: 'grid', gap: '40px' }}>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <article key={post.id || index} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '24px',
                            padding: '40px',
                            border: '1px solid var(--border-light)',
                            textAlign: 'center'
                        }}>
                            <div style={{ marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>
                                    {post.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {post.author || 'Elvan Parthasarathy'} • {new Date(post.date).toLocaleDateString()}
                                </p>
                            </div>

                            <div style={{
                                fontSize: '1.1rem',
                                lineHeight: '2',
                                color: 'var(--text-main)',
                                whiteSpace: 'pre',
                                fontFamily: '"Courier New", Courier, monospace',
                                display: 'inline-block',
                                textAlign: 'left'
                            }}>
                                {post.content}
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No poems yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Poems;
