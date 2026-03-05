import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin } from 'react-icons/fi';
import diaryData from '../../data/diary.json';

const Diary = () => {
    const posts = [...diaryData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ maxWidth: '700px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                <FiArrowLeft /> Back to Writings
            </Link>

            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', lineHeight: '1.1' }}>நாளேடு</h1>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Diary</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Personal logbook and journey.</p>
            </header>

            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                {/* Timeline Line */}
                <div style={{ position: 'absolute', left: '0', top: '20px', bottom: '0', width: '2px', background: 'var(--border-light)' }}></div>

                <div style={{ display: 'grid', gap: '40px' }}>
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <div key={post.id || index} style={{ position: 'relative', paddingLeft: '32px' }}>
                                {/* Timeline Dot */}
                                <div style={{
                                    position: 'absolute', left: '-25px', top: '24px',
                                    width: '12px', height: '12px',
                                    borderRadius: '50%', background: 'var(--text-main)',
                                    border: '3px solid var(--bg-app)'
                                }}></div>

                                <div style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    border: '1px solid var(--border-light)',
                                }}>
                                    <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>
                                            {new Date(post.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        {post.location && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <FiMapPin size={14} /> {post.location}
                                            </div>
                                        )}
                                    </div>

                                    {post.title && (
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px' }}>{post.title}</h3>
                                    )}

                                    <div style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                                        {post.content}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: '32px' }}>
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'var(--bg-panel)', borderRadius: '20px' }}>
                                <p>Dear Diary, today is the first day...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Diary;
