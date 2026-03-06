import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import diaryData from '../../data/diary.json';

const Diary = () => {
    const posts = [...diaryData].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="page-view fadeIn" style={{ width: '100%', margin: 0, padding: '10px 0 100px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '10px', color: 'var(--text-main)' }}>நாளேடு</h1>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: '#888888', marginBottom: '16px', letterSpacing: '0.5px' }}>Diary</div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>என் தனிப்பட்ட குறிப்புகளும் காலச்சுவடுகளும்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px' }}>My private logs and personal milestones.</p>
                </div>
                <Link to="/writings" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none', background: 'color-mix(in srgb, var(--text-main) 6%, transparent)', borderRadius: '100px', padding: '10px 20px', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '8px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </div>

            <div style={{ position: 'relative', paddingLeft: '20px', maxWidth: '700px' }}>
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
