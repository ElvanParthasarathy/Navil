import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen } from 'react-icons/fi';
import essaysData from '../../data/essays.json';

const Essays = () => {
    const posts = [...essaysData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                <FiArrowLeft /> Back to Writings
            </Link>

            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.1' }}>கருத்துரைகள்</h1>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Essays</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Formal arguments and critical reviews.</p>
            </header>

            <div style={{ display: 'grid', gap: '40px' }}>
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
