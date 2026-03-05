import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import articlesData from '../../data/articles.json';

const Articles = () => {
    const posts = [...articlesData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                <FiArrowLeft /> Back to Writings
            </Link>

            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.1' }}>கட்டுரைகள்</h1>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Articles</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>In-depth technical analysis and observations.</p>
            </header>

            <div style={{ display: 'grid', gap: '40px' }}>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <article key={post.id || index} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '20px',
                            padding: '32px',
                            border: '1px solid var(--border-light)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: "space-between", alignItems: 'flex-start', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '700', lineHeight: '1.3', flex: 1 }}>
                                    {post.title}
                                </h2>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiClock /> {new Date(post.date).toLocaleDateString()}
                                </span>
                            </div>

                            {post.tags && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                    {post.tags.split(',').map((tag, i) => (
                                        <span key={i} style={{
                                            background: 'var(--bg-panel)',
                                            color: 'var(--text-muted)',
                                            padding: '4px 12px',
                                            borderRadius: '99px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500'
                                        }}>
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {post.summary && (
                                <div style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic', borderLeft: '4px solid var(--border-color)', paddingLeft: '16px' }}>
                                    {post.summary}
                                </div>
                            )}

                            <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                                {post.content}
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                        <p>No articles published yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Articles;
