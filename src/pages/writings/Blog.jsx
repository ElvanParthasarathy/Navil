import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiArrowLeft } from 'react-icons/fi';
import blogData from '../../data/blog.json';

const Blog = () => {
    // Sort by date desc
    const posts = [...blogData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                <FiArrowLeft /> Back to Writings
            </Link>

            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>Blog</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Personal reflections and updates.</p>
            </header>

            <div style={{ display: 'grid', gap: '40px' }}>
                {posts.length > 0 ? (
                    posts.map((post, index) => (
                        <article key={post.id || index} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '20px',
                            padding: '32px',
                            border: '1px solid var(--border-light)',
                            transition: 'transform 0.2s',
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

                            {/* For now, displaying full content if no excerpt, or just letting user read more if we had a detailed view. 
                                Since we don't have a detail view yet, let's show the content with a simple expansion or just show it if it's short?
                                Actually, standard blog usually has a detail page. For MVP, I'll render the content here but maybe truncated if it's very long?
                                Let's render the content directly for now.
                            */}
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
