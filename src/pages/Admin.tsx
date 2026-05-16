// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiPlus, FiUser, FiX, FiMenu, FiHome, FiGrid, FiChevronLeft, FiLogOut, FiSettings, FiFileText, FiMonitor, FiUploadCloud, FiMessageCircle, FiHeart } from 'react-icons/fi';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebaseClient';
import { ref, get, set, onValue } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

import { SCHEMAS, SharedDatalists, DEFAULT_AUTHORS } from '../components/admin/AdminShared';
import { ProfileEditor } from '../components/admin/ProfileEditor';
import { AboutEditor } from '../components/admin/AboutEditor';
import { PoemEditor } from '../components/admin/PoemEditor';
import { QuoteEditor } from '../components/admin/QuoteEditor';
import { BlogEditor } from '../components/admin/BlogEditor';
import { ArticleEditor } from '../components/admin/ArticleEditor';
import { EssayEditor } from '../components/admin/EssayEditor';
import { StoryEditor } from '../components/admin/StoryEditor';
import { ThoughtEditor } from '../components/admin/ThoughtEditor';
import { DiaryEditor } from '../components/admin/DiaryEditor';
import { ArtEditor } from '../components/admin/ArtEditor';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import { addComment } from '../lib/engagement';

import '../styles/admin.css';

// Import Data (Initial State for non-Supabase data)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';
import initialPoems from '../data/poems.json';

// We now load all 6 writing categories from Supabase!


// ─── TESTER PANEL COMPONENT ───
const TesterPanel = ({ dataStore, setDataStore, setStatus, setMessage, autoThumbnails, setAutoThumbnails, onMasterSave }) => {
    const [selectedCollections, setSelectedCollections] = useState(['poems']);
    const [count, setCount] = useState(25);

    const WRITINGS_OPTIONS = [
        { id: 'poems', label: 'Poems' },
        { id: 'quotes', label: 'Quotes' },
        { id: 'blog', label: 'Blog' },
        { id: 'articles', label: 'Articles' },
        { id: 'stories', label: 'Stories' },
        { id: 'diary', label: 'Diary' }
    ];

    const ARTS_OPTIONS = [
        { id: 'arts_pencil', label: 'Pencil Drawings', cat: 'pencil' },
        { id: 'arts_editing', label: 'Editings', cat: 'editing' },
        { id: 'arts_poster', label: 'Posters', cat: 'poster' },
        { id: 'arts_painting', label: 'Paintings', cat: 'painting' },
        { id: 'arts_quotes', label: 'Quote Cards', cat: 'quotes' },
        { id: 'arts_poems', label: 'Poem Cards', cat: 'poems' },
        { id: 'arts_illustrations', label: 'Illustrations', cat: 'illustrations' },
        { id: 'arts_digital_arts', label: 'Digital Arts', cat: 'digital_arts' }
    ];

    const toggleCollection = (key) => {
        setSelectedCollections(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const generateMocks = (forceCollections = null, forceCount = null) => {
        const collectionsToUse = forceCollections || selectedCollections;
        const itemsToGenerate = forceCount || count;

        if (collectionsToUse.length === 0) {
            setMessage('Please select at least one collection.');
            setStatus('error');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const newDataStore = { ...dataStore };

        collectionsToUse.forEach(selId => {
            const isArt = selId.startsWith('arts_');
            const targetCol = isArt ? 'arts' : selId;
            const artCat = isArt ? selId.replace('arts_', '') : null;

            const mocks = Array.from({ length: itemsToGenerate }).map((_, i) => {
                const id = uuidv4();
                const num = Math.floor(Math.random() * 1000);
                
                if (isArt) {
                    return {
                        id,
                        title: `Mock Art ${num}`,
                        category: artCat,
                        image: `https://picsum.photos/seed/${id}/600/600`,
                        images: [`https://picsum.photos/seed/${id}/600/600`, `https://picsum.photos/seed/${id}-2/600/600`],
                        caption: `Mock Art ${num} - randomly generated mock post.`,
                        timestamp: Date.now() - (i * 100000),
                        is_mock: true
                    };
                }

                const needsCoverImage = targetCol !== 'arts';

                return {
                    id,
                    ...((targetCol === 'poems' || targetCol === 'quotes') && { 
                        classification: ['அகம்', 'புறம்'][Math.floor(Math.random() * 2)] 
                    }),
                    is_pinned: false,
                    display_order: 999,
                    date: new Date(Date.now() - (i * 10000000)).toISOString().split('T')[0],
                    publish_date: new Date(Date.now() - (i * 10000000)).toISOString(),
                    is_mock: true,
                    ...(needsCoverImage && { cover_image: `https://picsum.photos/seed/${id}/800/400` }),
                    variants: [
                        {
                            lang: 'ta',
                            title: `மாதிரிப் பதிவு ${num}`,
                            text: `<p>இது ஒரு சோதனைப் பதிவு ${num}. நீண்ட உரைகளைச் சோதிக்க இது உதவுகிறது.</p><p>இரண்டாவது பத்தி.</p>`,
                            author: 'எழுத்தாளர்'
                        },
                        {
                            lang: 'en',
                            title: `Mock Post ${num}`,
                            text: `<p>This is a test post ${num}. It is used to test UI pagination and layout wrapping.</p><p>Second paragraph here.</p>`,
                            author: 'Author'
                        }
                    ]
                };
            });

            newDataStore[targetCol] = [...(newDataStore[targetCol] || []), ...mocks];
        });

        setDataStore(newDataStore);
        if (forceCollections) {
            setMessage(`MASTER MODE: Auto-populated ${itemsToGenerate} posts per category! Click Save.`);
        } else {
            setMessage(`Added ${itemsToGenerate} mock items per selection. Don't forget to click Save!`);
        }
        setStatus('success');
        setTimeout(() => setMessage(''), 5000);
    };

    const clearMocks = (isMasterPurge = false) => {
        if (!isMasterPurge && selectedCollections.length === 0) {
            setMessage('Please select at least one collection.');
            setStatus('error');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const newDataStore = { ...dataStore };
        let totalRemoved = 0;

        // If it's a master purge, we clear everything. Otherwise, just selected.
        const collectionsToClear = isMasterPurge 
            ? ['poems', 'quotes', 'blog', 'articles', 'essays', 'stories', 'thoughts', 'diary', 'arts']
            : selectedCollections;

        collectionsToClear.forEach(selId => {
            const isArt = selId.startsWith('arts_');
            const targetCol = isArt ? 'arts' : (selId === 'arts' ? 'arts' : selId);
            
            if (targetCol === 'arts') {
                const originalLength = newDataStore.arts?.length || 0;
                // If master purge, clear ALL mocks in arts. If specific, clear by category.
                if (isMasterPurge) {
                    newDataStore.arts = (newDataStore.arts || []).filter(item => !item.is_mock);
                } else if (isArt) {
                    const cat = selId.replace('arts_', '');
                    newDataStore.arts = (newDataStore.arts || []).filter(item => !(item.is_mock && item.category === cat));
                }
                totalRemoved += (originalLength - (newDataStore.arts?.length || 0));
            } else {
                if (newDataStore[targetCol]) {
                    const originalLength = newDataStore[targetCol].length;
                    newDataStore[targetCol] = newDataStore[targetCol].filter(item => !item.is_mock);
                    totalRemoved += (originalLength - newDataStore[targetCol].length);
                }
            }
        });

        setDataStore(newDataStore);
        if (isMasterPurge) {
            setMessage(`MASTER PURGE: Removed ${totalRemoved} mock items from ALL collections. Click Save to commit.`);
        } else {
            setMessage(`Cleared ${totalRemoved} mock items from selections. Click Save to commit.`);
        }
        setStatus('success');
        setTimeout(() => setMessage(''), 5000);
    };

    const handleMasterToggle = () => {
        const newVal = !autoThumbnails;
        
        if (!newVal) {
            // Turning OFF: Ask for confirmation and purge data
            if (window.confirm('Master Control OFF: This will disable auto-thumbnails and REMOVE ALL populated tester data from your draft. Proceed?')) {
                setAutoThumbnails(false);
                clearMocks(true); // Master purge
            }
        } else {
            // Turning ON: Enable thumbnails AND auto-populate ALL categories
            setAutoThumbnails(true);
            
            // Collect ALL category IDs
            const allWritings = WRITINGS_OPTIONS.map(o => o.id);
            const allArts = ARTS_OPTIONS.map(o => o.id);
            const allCategories = [...allWritings, ...allArts];
            
            generateMocks(allCategories, 25);
            
            setMessage('Master Tester Mode: ON (Auto-populated all categories + Thumbnails active).');
            setStatus('success');
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="adm-panel animate-entry" style={{ padding: '24px' }}>
            <div className="adm-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Testing Tools</h2>
                <p style={{ color: 'var(--text-muted)' }}>Generate mock data to test pagination and UI.</p>
            </div>
            <div className="adm-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div className="adm-field">
                        <label className="adm-label">Writings Categories (6)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            {WRITINGS_OPTIONS.map(opt => (
                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCollections.includes(opt.id)} 
                                        onChange={() => toggleCollection(opt.id)} 
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--text-main)' }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    <div className="adm-field">
                        <label className="adm-label">Arts Categories (8)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            {ARTS_OPTIONS.map(opt => (
                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedCollections.includes(opt.id)} 
                                        onChange={() => toggleCollection(opt.id)} 
                                        style={{ width: '16px', height: '16px', accentColor: 'var(--text-main)' }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="adm-field" style={{ maxWidth: '300px' }}>
                    <label className="adm-label">Number of Posts per Selection</label>
                    <input className="adm-input" type="number" min="1" max="100" value={count} onChange={e => setCount(parseInt(e.target.value) || 25)} />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <button className="adm-btn primary" onClick={generateMocks}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Generate Mocks
                    </button>
                    <button className="adm-btn danger" onClick={clearMocks} style={{ background: '#d32f2f', color: 'white', border: 'none' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Clear Mocks
                    </button>
                </div>
                
                <div className="adm-field" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                            <label className="adm-label" style={{ color: 'var(--link-color)', fontSize: '1.1rem', marginBottom: '4px' }}>MASTER TESTER CONTROL</label>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Global switch for development tools and mock data.
                            </p>
                        </div>
                        <button 
                            className={`adm-btn ${autoThumbnails ? 'primary' : ''}`}
                            onClick={handleMasterToggle}
                            style={{ 
                                minWidth: '140px',
                                background: autoThumbnails ? 'var(--link-color)' : 'var(--bg-panel)', 
                                color: autoThumbnails ? 'white' : 'var(--text-main)', 
                                border: `1px solid ${autoThumbnails ? 'var(--link-color)' : 'var(--border-light)'}`,
                                fontWeight: '700'
                            }}
                        >
                            {autoThumbnails ? 'MASTER: ON' : 'MASTER: OFF'}
                        </button>
                    </div>
                    
                    <div style={{ background: 'color-mix(in srgb, var(--text-main) 5%, transparent)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-muted)' }}>
                            <li><strong>ON:</strong> Auto-populates all categories + enables thumbnails.</li>
                            <li><strong>OFF:</strong> Clears all mock data from your draft.</li>
                        </ul>
                    </div>

                    <button 
                        className="adm-btn primary" 
                        onClick={onMasterSave}
                        style={{ width: '100%', marginTop: '8px', background: '#FFCA28', color: '#333' }}
                    >
                        <FiUploadCloud size={16} /> Save All (Commit to Live)
                    </button>
                </div>
                
                <div className="adm-alert info" style={{ marginTop: '16px', background: 'color-mix(in srgb, var(--text-main) 10%, transparent)', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Note:</strong> Generating or clearing mocks only updates your local unsaved draft. You still need to click <strong style={{ color: 'var(--text-main)' }}>"Save All Changes"</strong> in the main dashboard to push these changes to Firebase.
                </div>
            </div>
        </div>
    );
};

import { FiTrash2 } from 'react-icons/fi';
import { remove } from 'firebase/database';

// ─── COMMENTS MANAGER COMPONENT ───
const CommentsManager = ({ username, profilePic }) => {
    const [allComments, setAllComments] = useState({}); // { postId: { comments: [], likes: 0 } }
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null); // { postId, commentId }
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const engRef = ref(db, 'engagement');
        const unsubscribe = onValue(engRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const processed = {};
                const likes = data.likes || {};
                const commentsMap = data.comments || {};

                const allPostIds = new Set([...Object.keys(likes), ...Object.keys(commentsMap)]);

                allPostIds.forEach(id => {
                    const postComments = commentsMap[id] ? Object.entries(commentsMap[id]).map(([cId, val]) => ({ ...val, id: cId })) : [];
                    const likeData = likes[id];
                    const likeCount = typeof likeData === 'object' ? Object.keys(likeData).length : (likeData || 0);
                    
                    processed[id] = {
                        likes: likeCount,
                        comments: postComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    };
                });
                setAllComments(processed);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (postId, commentId) => {
        if (window.confirm('Delete this comment permanently?')) {
            await remove(ref(db, `engagement/comments/${postId}/${commentId}`));
        }
    };

    const handleReply = async (postId, parentId, adminName) => {
        if (!replyText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await addComment(postId, {
                name: 'Author',
                text: replyText.trim(),
                userId: auth.currentUser?.uid || 'admin',
                isAdmin: true,
                parentId: parentId
            });
            setReplyText('');
            setReplyingTo(null);
        } catch (err) {
            console.error("Reply failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="adm-panel">Loading engagement data...</div>;

    const postsWithEngagement = Object.entries(allComments);

    return (
        <div className="adm-panel animate-entry" style={{ padding: '24px' }}>
            <div className="adm-header" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Engagement Manager</h2>
                <p style={{ color: 'var(--text-muted)' }}>Manage comments and monitor likes across all posts.</p>
            </div>

            <div className="adm-content" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {postsWithEngagement.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No comments or likes found.</div>
                ) : (
                    postsWithEngagement.map(([postId, data]) => (
                        <div key={postId} className="engagement-container" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
                            <div className="discussion-header" style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                                <div className="discussion-title">
                                    <span className="title-ta">பதிவு</span>
                                    <span className="title-en">{postId}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff4757', fontWeight: '700' }}>
                                    <FiHeart /> {data.likes}
                                </div>
                            </div>

                            <div className="comments-thread">
                                {data.comments.filter(c => !c.parentId).map(comment => (
                                    <div key={comment.id} className="comment-group" style={{ marginBottom: '24px' }}>
                                        <article className="comment-article">
                                            <footer className="comment-footer" style={{ border: 'none', padding: 0 }}>
                                                <div className="author-meta">
                                                    <div className="author-avatar">
                                                        {comment.isAdmin && profilePic ? (
                                                            <img src={profilePic} alt="Author" className="admin-pfp" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div className="guest-avatar">{comment.name[0]}</div>
                                                        )}
                                                    </div>
                                                    <div className="author-info">
                                                        <p className="author-name">
                                                            {comment.isAdmin ? 'Author' : comment.name}
                                                        </p>
                                                        <p className="comment-date">{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}</p>
                                                    </div>
                                                </div>

                                                <div className="comment-actions">
                                                    <button 
                                                        className="comment-reply-btn" 
                                                        onClick={() => setReplyingTo(replyingTo?.commentId === comment.id ? null : { postId, commentId: comment.id })}
                                                    >
                                                        <FiMessageCircle className="reply-icon" />
                                                        <div className="action-text-stack">
                                                            <span className="action-ta">பதில்</span>
                                                            <span className="action-en">reply</span>
                                                        </div>
                                                    </button>
                                                    <button 
                                                        className="adm-btn icon-only danger" 
                                                        onClick={() => handleDelete(postId, comment.id)}
                                                        style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', opacity: 0.6 }}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </footer>
                                            <p className="comment-body" style={{ marginTop: '12px' }}>{comment.text}</p>
                                        </article>

                                        {/* Replies */}
                                        <div className="replies-container" style={{ marginLeft: '32px', marginTop: '16px' }}>
                                            {data.comments.filter(r => r.parentId === comment.id).map(reply => (
                                                <article key={reply.id} className="comment-article reply-article" style={{ marginBottom: '12px' }}>
                                                    <footer className="comment-footer" style={{ border: 'none', padding: 0 }}>
                                                        <div className="author-meta">
                                                            <div className="author-avatar mini">
                                                                {reply.isAdmin && profilePic ? (
                                                                    <img src={profilePic} alt="Author" className="admin-pfp" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <div className="guest-avatar">{reply.name[0]}</div>
                                                                )}
                                                            </div>
                                                            <div className="author-info">
                                                                <p className="author-name">
                                                                    {reply.isAdmin ? 'Author' : reply.name}
                                                                </p>
                                                                <p className="comment-date">{reply.timestamp ? new Date(reply.timestamp).toLocaleString() : ''}</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="adm-btn icon-only danger" 
                                                            onClick={() => handleDelete(postId, reply.id)}
                                                            style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', opacity: 0.6 }}
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    </footer>
                                                    <p className="comment-body" style={{ marginTop: '8px' }}>{reply.text}</p>
                                                </article>
                                            ))}
                                        </div>

                                        {/* Reply Input */}
                                        {replyingTo?.commentId === comment.id && (
                                            <div className="discussion-form-flat" style={{ marginLeft: '32px', marginTop: '16px', border: '1px solid var(--link-color)' }}>
                                                <textarea 
                                                    className="flat-text-input"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your admin reply..."
                                                    style={{ minHeight: '80px', marginBottom: '12px' }}
                                                    autoFocus
                                                />
                                                <div className="flat-form-footer" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                                                    <button className="flat-cancel-btn" onClick={() => setReplyingTo(null)}>Cancel</button>
                                                    <button 
                                                        className="flat-submit-btn" 
                                                        onClick={() => handleReply(postId, comment.id, username)}
                                                        disabled={!replyText.trim() || isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Sending...' : 'Send Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ─── MAIN ADMIN COMPONENT ───
const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isProfileEditing, setIsProfileEditing] = useState(false);

    // Login gate
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    // Theme state (light / dark / auto)
    const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('theme') || 'auto');

    // Sidebar state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('admin_sidebar_collapsed') === 'true');
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [autoThumbnails, setAutoThumbnails] = useState(() => localStorage.getItem('autoThumbnails') !== 'false');
    const profileZoneRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('autoThumbnails', autoThumbnails);
    }, [autoThumbnails]);

    const prevStateRef = useRef({ activeTab, editingId, isProfileEditing });

    useEffect(() => {
        prevStateRef.current = { activeTab, editingId, isProfileEditing };
    }, [activeTab, editingId, isProfileEditing]);

    const [dataStore, setDataStore] = useState({
        quotes: initialQuotes,
        profile: initialProfile,
        poems: initialPoems,
        blog: [],
        articles: [],
        essays: [],
        stories: [],
        thoughts: [],
        diary: [],
        arts: [],
        defaultAuthors: { ...DEFAULT_AUTHORS },
    });

    // Apply admin theme
    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('theme', adminTheme);
        const apply = () => {
            if (adminTheme === 'auto') {
                const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.setAttribute('data-theme', sys);
            } else {
                root.setAttribute('data-theme', adminTheme);
            }
        };
        apply();
        if (adminTheme === 'auto') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => apply();
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [adminTheme]);

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('admin_sidebar_collapsed', String(next));
            return next;
        });
    };



    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileZoneRef.current && !profileZoneRef.current.contains(e.target)) {
                setIsProfilePopupOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Auth Handling ──
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                setUsername(user.displayName || user.email?.split('@')[0] || 'Admin');
            } else {
                setIsLoggedIn(false);
                setUsername('');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        setIsLoggedIn(false);
        setUsername('');
        setIsProfilePopupOpen(false);
    };

    // Login handler
    const handleLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (err) {
            console.error('Login error:', err.message);
            return { success: false, error: err.message || 'An unexpected error occurred.' };
        }
    };

    // Google Login handler
    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            return { success: true };
        } catch (err) {
            console.error('Google login error:', err.message);
            return { success: false, error: err.message || 'An unexpected error occurred.' };
        }
    };

    const [isMigrating, setIsMigrating] = useState(false);

    // ── Migration Helpers ──
    const generateSlug = (text) => {
        let slug = String(text)
            .replace(/<[^>]+>/g, '')
            .trim().toLowerCase()
            .replace(/[.#$\[\]\/]/g, '')
            .replace(/[\s\n\r]+/g, '-')
            .substring(0, 50)
            .replace(/^-+|-+$/g, '');
        return slug || 'untitled';
    };

    const getBestTitle = (item) => {
        const firstVariant = item.variants?.[0];
        const englishVariant = item.variants?.find(v => v.lang === 'en' && v.title);
        const titleTransl = firstVariant?.titleTransliterations || {};
        const bestTitleTransl = titleTransl.en || Object.values(titleTransl).filter(v => v && v !== true)[0];
        return item.title || bestTitleTransl || englishVariant?.title || firstVariant?.title || firstVariant?.text || 'untitled';
    };

    const textToHtml = (raw) => {
        if (!raw) return '';
        if (/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) return raw;
        return raw.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>').join('');
    };

    const cleanForStorage = (item, displayOrder) => {
        const clean = JSON.parse(JSON.stringify(item));
        delete clean.id;
        delete clean.style; delete clean.theme; delete clean.meter; delete clean.slug;
        clean.display_order = displayOrder;
        if (clean.tags && typeof clean.tags === 'string') {
            clean.tags = clean.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (clean.variants) {
            clean.variants.forEach(v => {
                if (v.transliterations?._empty) delete v.transliterations._empty;
                if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                if (v.text) v.text = textToHtml(v.text);
                if (v.transliterations) {
                    Object.keys(v.transliterations).forEach(lang => {
                        if (v.transliterations[lang]) v.transliterations[lang] = textToHtml(v.transliterations[lang]);
                    });
                }
                if (v.transliterations && Object.keys(v.transliterations).length === 0) delete v.transliterations;
                if (v.titleTransliterations && Object.keys(v.titleTransliterations).length === 0) delete v.titleTransliterations;
            });
        }

        // Arts-specific normalization (Moved here to cover both Single Save and Master Save)
        if (clean.category && (clean.images || clean.image)) {
            if (clean.images && typeof clean.images === 'string') {
                clean.images = clean.images.split('\n').map(u => u.trim()).filter(Boolean);
            }
            if (!Array.isArray(clean.images)) clean.images = [];
            if (!clean.image && clean.images.length > 0) clean.image = clean.images[0];
            if (clean.timestamp && typeof clean.timestamp === 'string') clean.timestamp = parseInt(clean.timestamp, 10) || Date.now();
            if (!clean.timestamp) clean.timestamp = Date.now();
            if (!clean.type) clean.type = 'image';
        }

        return clean;
    };

    const handleMigrateToFirebase = async () => {
        if (!window.confirm("MASTER SAVE: This will sync your current draft (including any Mock Test Data) to the live site. Real poems will be PRESERVED, but mock items will be added/updated. Proceed?")) return;
        setIsMigrating(true);
        try {
            const collectionsToWipe = ['poems', 'quotes', 'blog', 'articles', 'essays', 'stories', 'thoughts', 'diary', 'arts'];
            for (const coll of collectionsToWipe) {
                await set(ref(db, coll), null);
            }
            await set(ref(db, 'config/profile'), dataStore.profile);

            let count = 0;
            const promises = [];

            // Fetch existing data to ensure we don't accidentally wipe real items not in current local state
            const snapshot = await get(ref(db));
            const liveData = snapshot.exists() ? snapshot.val() : {};

            Object.entries(dataStore).forEach(([collection, items]) => {
                if (collection === 'profile' || collection === 'defaultAuthors') return;
                if (!Array.isArray(items)) return;

                const usedKeys = new Set();
                // Start with existing live data for this collection, but ONLY keep non-mock items
                const collectionData = {};
                if (liveData[collection]) {
                    Object.entries(liveData[collection]).forEach(([key, val]) => {
                        if (!val.is_mock) {
                            collectionData[key] = val;
                            usedKeys.add(key);
                        }
                    });
                }

                // Now add/overwrite with current local items (Real + Mocks)
                items.forEach((item, index) => {
                    if (!item.id) return;
                    
                    // If it's an existing item with a slug ID, use it
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(item.id));
                    let finalKey = isUUID ? generateSlug(getBestTitle(item)) : String(item.id);

                    // IDENTIFIER KEY: Prefix mock data IDs to ensure they NEVER collide with real content
                    if (item.is_mock && !finalKey.startsWith('mock_')) {
                        finalKey = `mock_${finalKey}`;
                    }
                    
                    // Handle duplicates
                    let baseKey = finalKey;
                    let suffix = 1;
                    
                    if (isUUID) {
                        while (usedKeys.has(finalKey)) {
                            finalKey = `${baseKey}-${suffix}`;
                            suffix++;
                        }
                    }

                    usedKeys.add(finalKey);
                    collectionData[finalKey] = cleanForStorage(item, index);
                    count++;
                });
                promises.push(set(ref(db, collection), collectionData));
            });

            await Promise.all(promises);
            setMessage(`Successfully committed ${count} items to live site!`);
            setStatus('success');
        } catch (error) {
            console.error("Migration error:", error);
            setMessage("Failed to save: " + error.message);
            setStatus('error');
        } finally {
            setIsMigrating(false);
            setTimeout(() => { setStatus('idle'); setMessage(''); }, 4000);
        }
    };

    // Load data from Firebase on mount
    useEffect(() => {
        const loadFromFirebase = async () => {
            try {
                const snapshot = await get(ref(db));
                if (snapshot.exists()) {
                    const allData = snapshot.val();
                    const newDataStore = { ...dataStore };
                    
                    const categories = ['poems', 'quotes', 'blog', 'articles', 'essays', 'stories', 'thoughts', 'diary', 'arts'];
                    
                    categories.forEach(key => {
                        if (allData[key]) {
                            const itemsArray = Object.entries(allData[key]).map(([slug, val]) => {
                                const item = { ...val, id: slug };
                                
                                // Clean up _empty placeholders from old migrations
                                if (item.variants) {
                                    (Array.isArray(item.variants) ? item.variants : Object.values(item.variants)).forEach(v => {
                                        if (v.transliterations?._empty) delete v.transliterations._empty;
                                        if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                                        // Default missing transliterations to empty objects
                                        if (!v.transliterations) v.transliterations = {};
                                        if (!v.titleTransliterations) v.titleTransliterations = {};
                                    });
                                    // Firebase stores arrays as objects with numeric keys — normalize back
                                    if (!Array.isArray(item.variants)) {
                                        item.variants = Object.values(item.variants);
                                    }
                                }
                                
                                // Arts: convert images array to newline string for textarea editing
                                if (key === 'arts' && Array.isArray(item.images)) {
                                    item.images = item.images.join('\n');
                                }

                                // Normalize tags: string → array
                                if (item.tags && typeof item.tags === 'string') {
                                    item.tags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
                                }
                                if (item.tags && !Array.isArray(item.tags)) {
                                    item.tags = Object.values(item.tags); // Firebase may store arrays as objects
                                }
                                
                                return item;
                            });
                            
                            // Sort
                            itemsArray.sort((a, b) => {
                                if (a.display_order !== b.display_order) return (a.display_order || 0) - (b.display_order || 0);
                                const dateA = new Date(a.publish_date || a.date || 0);
                                const dateB = new Date(b.publish_date || b.date || 0);
                                return dateB - dateA;
                            });
                            
                            newDataStore[key] = itemsArray;
                        }
                    });
                    
                    if (allData.config && allData.config.profile) {
                        newDataStore.profile = allData.config.profile;
                    }
                    if (allData.config && allData.config.defaultAuthors) {
                        newDataStore.defaultAuthors = { ...DEFAULT_AUTHORS, ...allData.config.defaultAuthors };
                    }
                    
                    setDataStore(newDataStore);
                }
            } catch (err) {
                console.warn('Firebase load failed:', err.message);
            }
        };
        if (isLoggedIn) {
            loadFromFirebase();
        }
    }, [isLoggedIn]);

    // ── Save (explicit only — never auto-saves) ──
    const handleSaveCollection = async (collection) => {
        setStatus('loading');
        setMessage('');

        // Slug generator
        const generateSlug = (text) => {
            let slug = String(text)
                .replace(/<[^>]+>/g, '').trim().toLowerCase()
                .replace(/[.#$\[\]\/]/g, '')
                .replace(/[\s\n\r]+/g, '-')
                .substring(0, 50)
                .replace(/^-+|-+$/g, '');
            return slug || 'untitled';
        };

        try {
            if (collection === 'profile') {
                await set(ref(db, 'config/profile'), dataStore.profile);
                setStatus('success');
                setMessage('Profile saved successfully!');
                setIsProfileEditing(false);
                return;
            }

            const items = dataStore[collection];
            const usedKeys = new Set();
            const updateObj = {};
            const updatedItems = [...items]; // Track id changes for local state

            items.forEach((item, index) => {
                // Determine the key
                let key = String(item.id);
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(key);

                if (isUUID && collection === 'arts') {
                    // Arts: generate art_timestamp key
                    key = `art_${Date.now()}_${index}`;
                } else if (isUUID) {
                    // New item with temp UUID — generate a proper slug
                    const firstVariant = item.variants?.[0];
                    const titleTransl = firstVariant?.titleTransliterations || {};
                    const bestTitle = item.title
                        || titleTransl.en
                        || item.variants?.find(v => v.lang === 'en')?.title
                        || firstVariant?.title
                        || 'untitled';
                    key = generateSlug(bestTitle);
                }

                // Handle duplicate keys
                let finalKey = key;
                let suffix = 1;
                while (usedKeys.has(finalKey)) {
                    finalKey = `${key}-${suffix}`;
                    suffix++;
                }
                usedKeys.add(finalKey);

                // Build clean record (no id inside, no _empty, no legacy fields)
                const row = { ...item, display_order: index };
                delete row.id; // Firebase key IS the id
                delete row.style;
                delete row.theme;
                delete row.meter;
                delete row.slug;

                if (!row.publish_date && !row.date) row.publish_date = new Date().toISOString();

                // Normalize tags to array
                if (row.tags && typeof row.tags === 'string') {
                    row.tags = row.tags.split(',').map(t => t.trim()).filter(Boolean);
                }

                // Arts-specific: handled by cleanForStorage
                if (collection === 'arts') {
                    // Handled centrally now
                }

                // Clean up variants
                if (row.variants) {
                    row.variants.forEach(v => {
                        if (v.transliterations?._empty) delete v.transliterations._empty;
                        if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                        if (v.transliterations && Object.keys(v.transliterations).length === 0) delete v.transliterations;
                        if (v.titleTransliterations && Object.keys(v.titleTransliterations).length === 0) delete v.titleTransliterations;
                    });
                }

                updateObj[finalKey] = row;

                // Update local state id to match the new key
                updatedItems[index] = { ...item, id: finalKey };
            });

            // Atomic write of entire collection
            await set(ref(db, collection), updateObj);

            // Update local state with the new clean IDs
            setDataStore(prev => ({ ...prev, [collection]: updatedItems }));

            setStatus('success');
            setMessage('Saved to Firebase!');
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Network error.');
        } finally {
            setTimeout(() => { setStatus('idle'); setMessage(''); }, 4000);
        }
    };

    // ── CRUD helpers (local state only — never saves automatically) ──
    const addItem = (collection) => {
        const newId = uuidv4();
        let newItem;
        const schema = SCHEMAS[collection];

        if (schema?.type === 'simple') {
            // Simple schema (e.g. arts) — flat fields, no variants
            newItem = { id: newId };
            (schema.fields || []).forEach(f => {
                newItem[f.key] = f.type === 'datetime-local' ? new Date().toISOString().slice(0, 16) : '';
            });
        } else if (collection === 'quotes' || collection === 'poems') {
            newItem = {
                id: newId, title: '', date: new Date().toISOString().slice(0, 16),
                style: '', theme: '', meter: '', dedication: '', classification: '', urai: '', notes: '',
                variants: [{ label: '', title: '', text: '', author: '', lang: '', transliterations: {}, titleTransliterations: {} }]
            };
        } else {
            // New unified bilingual schema — uses same variants model as poems
            newItem = {
                id: newId,
                publish_date: new Date().toISOString().slice(0, 16),
                variants: [{ label: '', title: '', text: '', author: '', lang: 'ta', transliterations: {}, titleTransliterations: {} }]
            };
        }

        setDataStore(prev => ({ ...prev, [collection]: [newItem, ...prev[collection]] }));
        setEditingId(newId);
    };

    // Remove blank items when closing the editor (prevents orphaned entries)
    const handleCloseEditor = (id) => {
        if (id && activeTab !== 'profile') {
            const items = dataStore[activeTab];
            const item = items?.find(i => i.id === id);
            if (item) {
                const schema = SCHEMAS[activeTab];
                const isSimple = schema?.type === 'simple';

                let isEmpty = false;
                if (isSimple) {
                    // Simple schema (arts): check if any meaningful field has content
                    const hasAnyContent = (schema.fields || []).some(f => {
                        const val = item[f.key];
                        return val && String(val).trim();
                    });
                    isEmpty = !hasAnyContent;
                } else {
                    const hasLegacyTitle = item.title && item.title.trim();
                    const hasVariantText = item.variants?.some(v => (v.text && v.text.trim()) || (v.title && v.title.trim()));
                    isEmpty = !hasLegacyTitle && !hasVariantText;
                }

                if (isEmpty) {
                    // Item is blank — remove it
                    setDataStore(prev => ({
                        ...prev,
                        [activeTab]: prev[activeTab].filter(i => i.id !== id)
                    }));
                }
            }
        }
        setEditingId(null);
    };

    const deleteItem = (collection, index) => {
        const newData = [...dataStore[collection]];
        newData.splice(index, 1);
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const moveItem = (collection, index, direction) => {
        setDataStore(prev => {
            const items = [...prev[collection]];
            if (direction === 'up' && index > 0) {
                [items[index - 1], items[index]] = [items[index], items[index - 1]];
            } else if (direction === 'down' && index < items.length - 1) {
                [items[index + 1], items[index]] = [items[index], items[index + 1]];
            }
            return { ...prev, [collection]: items };
        });
    };

    const updateItemField = (collection, index, field, value) => {
        setDataStore(prev => {
            const newData = [...prev[collection]];
            newData[index] = { ...newData[index], [field]: value };
            return { ...prev, [collection]: newData };
        });
    };

    const updateVariant = (collection, itemIndex, variantIndex, field, value) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        newVariants[variantIndex] = { ...newVariants[variantIndex], [field]: value };
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const updateTransliteration = (collection, itemIndex, variantIndex, fieldObj, langKey, value) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        const v = { ...newVariants[variantIndex] };
        v[fieldObj] = { ...(v[fieldObj] || {}), [langKey]: value };
        newVariants[variantIndex] = v;
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const toggleTransliterationLang = (collection, itemIndex, variantIndex, tLang) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        const v = { ...newVariants[variantIndex] };

        const hasLang = v.transliterations && v.transliterations[tLang] !== undefined;
        if (hasLang) {
            const newTransl = { ...v.transliterations };
            delete newTransl[tLang];
            v.transliterations = newTransl;
            if (v.titleTransliterations) {
                const newTitleTransl = { ...v.titleTransliterations };
                delete newTitleTransl[tLang];
                v.titleTransliterations = newTitleTransl;
            }
        } else {
            v.transliterations = { ...(v.transliterations || {}), [tLang]: '' };
            v.titleTransliterations = { ...(v.titleTransliterations || {}), [tLang]: '' };
        }

        newVariants[variantIndex] = v;
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const addVariant = (collection, itemIndex) => {
        const newData = [...dataStore[collection]];
        newData[itemIndex].variants.push({
            label: '', title: '', text: '', author: '', lang: '',
            transliterations: {}, titleTransliterations: {}
        });
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const removeVariant = (collection, itemIndex, variantIndex) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        newVariants.splice(variantIndex, 1);
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const moveVariant = (collection, itemIndex, variantIndex, direction) => {
        const newData = [...dataStore[collection]];
        const newVariants = [...newData[itemIndex].variants];
        if (direction === 'up' && variantIndex > 0) {
            [newVariants[variantIndex - 1], newVariants[variantIndex]] = [newVariants[variantIndex], newVariants[variantIndex - 1]];
        } else if (direction === 'down' && variantIndex < newVariants.length - 1) {
            [newVariants[variantIndex + 1], newVariants[variantIndex]] = [newVariants[variantIndex], newVariants[variantIndex + 1]];
        }
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const updateProfile = (field, value) => {
        setDataStore(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    };

    const updateGenericItem = (collection, index, field, value) => {
        const newData = [...dataStore[collection]];
        newData[index] = { ...newData[index], [field]: value };
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    // ── Bulk move/copy between collections ──
    const handleMoveItems = (ids, fromCollection, toCollection) => {
        const sourceItems = dataStore[fromCollection] || [];
        const moving = sourceItems.filter(i => ids.includes(i.id));
        const remaining = sourceItems.filter(i => !ids.includes(i.id));

        setDataStore(prev => ({
            ...prev,
            [fromCollection]: remaining,
            [toCollection]: [...(prev[toCollection] || []), ...moving]
        }));
        setMessage(`Moved ${moving.length} item${moving.length > 1 ? 's' : ''} to ${SCHEMAS[toCollection]?.label || toCollection}. Save both to commit.`);
        setStatus('success');
        setTimeout(() => setMessage(''), 4000);
    };

    const handleCopyItems = (ids, fromCollection, toCollection) => {
        const sourceItems = dataStore[fromCollection] || [];
        const copying = sourceItems.filter(i => ids.includes(i.id)).map(item => ({
            ...JSON.parse(JSON.stringify(item)),
            id: uuidv4() // New ID for the copy
        }));

        setDataStore(prev => ({
            ...prev,
            [toCollection]: [...(prev[toCollection] || []), ...copying]
        }));
        setMessage(`Copied ${copying.length} item${copying.length > 1 ? 's' : ''} to ${SCHEMAS[toCollection]?.label || toCollection}. Save to commit.`);
        setStatus('success');
        setTimeout(() => setMessage(''), 4000);
    };

    const renderEditor = () => {
        const commonProps = {
            items: dataStore[activeTab],
            collection: activeTab,
            editingId,
            setEditingId,
            handleCloseEditor,
            onAddItem: () => addItem(activeTab),
            onSave: () => handleSaveCollection(activeTab),
            saveStatus: status,
            updateItemField,
            updateGenericItem,
            moveItem,
            deleteItem,
            addVariant,
            updateVariant,
            removeVariant,
            moveVariant,
            updateTransliteration,
            toggleTransliterationLang,
            defaultAuthors: dataStore.defaultAuthors || DEFAULT_AUTHORS,
            onMoveItems: handleMoveItems,
            onCopyItems: handleCopyItems
        };

        switch (activeTab) {
            case 'poems': return <PoemEditor {...commonProps} />;
            case 'quotes': return <QuoteEditor {...commonProps} />;
            case 'blog': return <BlogEditor {...commonProps} />;
            case 'articles': return <ArticleEditor {...commonProps} />;
            case 'essays': return <EssayEditor {...commonProps} />;
            case 'stories': return <StoryEditor {...commonProps} />;
            case 'thoughts': return <ThoughtEditor {...commonProps} />;
            case 'diary': return <DiaryEditor {...commonProps} />;
            case 'arts': return <ArtEditor {...commonProps} />;
            case 'comments': return <CommentsManager username={username} profilePic={dataStore.profile?.profilePic || dataStore.profile?.avatar} />;
            case 'tester': return <TesterPanel dataStore={dataStore} setDataStore={setDataStore} setStatus={setStatus} setMessage={setMessage} schemas={SCHEMAS} autoThumbnails={autoThumbnails} setAutoThumbnails={setAutoThumbnails} />;
            default: return null;
        }
    };

    // ── RENDER ──
    if (!isLoggedIn) {
        return <AdminLogin onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />;
    }

    return (
        <div className="admin-shell">
            <SharedDatalists />
            {/* Desktop & Mobile Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="admin-sidebar-header">
                    <h1>Admin</h1>
                    <button className="sidebar-collapse-btn" onClick={toggleCollapse} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                        {isCollapsed ? <RiMenuUnfoldLine size={16} /> : <RiMenuFoldLine size={16} />}
                    </button>
                    {/* Close button only visible on mobile */}
                    <button className="adm-btn icon-only admin-mobile-close" onClick={() => setMobileMenuOpen(false)}>
                        <FiX size={18} />
                    </button>
                </div>
                <nav className="admin-sidebar-nav">
                    <button className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiGrid size={16} /></div> <span>Dashboard</span>
                    </button>
                    <div className="nav-group-label">Content</div>
                    <button className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiUser size={16} /></div> <span>Profile</span>
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'about' ? 'active' : ''}`} onClick={() => { setActiveTab('about'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiFileText size={16} /></div> <span>About Page</span>
                    </button>
                    {Object.keys(SCHEMAS).map(key => (
                        <button key={key} className={`admin-nav-item ${activeTab === key ? 'active' : ''}`} onClick={() => { setActiveTab(key); setEditingId(null); setMobileMenuOpen(false); }}>
                            <div className="nav-icon">{SCHEMAS[key].icon}</div> <span>{SCHEMAS[key].label}</span>
                        </button>
                    ))}
                    <div className="nav-group-label">Engagement</div>
                    <button className={`admin-nav-item ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => { setActiveTab('comments'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiMessageCircle size={16} /></div> <span>Comments</span>
                    </button>
                    <div className="nav-group-label">System</div>
                    <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiSettings size={16} /></div> <span>Settings</span>
                    </button>
                    <button className={`admin-nav-item ${activeTab === 'tester' ? 'active' : ''}`} onClick={() => { setActiveTab('tester'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiMonitor size={16} /></div> <span>Testing Tools</span>
                    </button>
                </nav>

                {/* Profile Trigger & Popup */}
                <div className="user-auth-zone" ref={profileZoneRef}>
                    <div className="profile-container">
                        <div
                            className={`profile-trigger ${isProfilePopupOpen ? 'active-trigger' : ''}`}
                            onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                        >
                            <div className="user-avatar-circle">
                                {username ? username.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="trigger-text">
                                <span className="first-name">{username || 'Admin'}</span>
                                <p className="role-subtext">Administrator</p>
                            </div>
                        </div>

                        {isProfilePopupOpen && (
                            <div className="logout-popup-solid">
                                <div className="dropdown-info">
                                    <h3>Hi, {username || 'Admin'}</h3>
                                </div>

                                <div className="dropdown-divider"></div>

                                <div className="popup-actions">
                                    <div className="popup-theme-section" onClick={(e) => e.stopPropagation()}>
                                        <span className="popup-theme-label">Appearance</span>
                                        <div className="theme-slider-container">
                                            <div
                                                className="slider-thumb"
                                                style={{ transform: `translateX(${adminTheme === 'light' ? '0%' : adminTheme === 'auto' ? '100%' : '200%'})` }}
                                            />
                                            <div className={`slider-option ${adminTheme === 'light' ? 'active' : ''}`} onClick={() => setAdminTheme('light')} title="Light">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                                            </div>
                                            <div className={`slider-option ${adminTheme === 'auto' ? 'active' : ''}`} onClick={() => setAdminTheme('auto')} title="Auto">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /></svg>
                                            </div>
                                            <div className={`slider-option ${adminTheme === 'dark' ? 'active' : ''}`} onClick={() => setAdminTheme('dark')} title="Dark">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="popup-theme-section" style={{ marginTop: '24px' }} onClick={(e) => e.stopPropagation()}>
                                        <span className="popup-theme-label">Preferences</span>
                                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', cursor: 'pointer' }}>
                                            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>Auto Thumbnails</span>
                                            <input 
                                                type="checkbox" 
                                                checked={autoThumbnails} 
                                                onChange={(e) => setAutoThumbnails(e.target.checked)} 
                                                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--link-color)' }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="dropdown-divider"></div>

                                <Link to="/" className="popup-item" onClick={() => setIsProfilePopupOpen(false)}>
                                    <FiHome size={15} /> <span>Go Home</span>
                                </Link>

                                <button onClick={handleSignOut} className="popup-logout-btn">
                                    <FiLogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div className="admin-mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Content Area — fills remaining space */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

                {/* Mobile Header (Hamburger) */}
                <div className="admin-mobile-header">
                    <div className="mobile-header-left">
                        <button className="mobile-circle-btn" onClick={() => setMobileMenuOpen(true)}>
                            <FiMenu size={18} />
                        </button>
                        <h2 className="mobile-header-title">
                            {activeTab === 'dashboard' ? 'Dashboard'
                                : activeTab === 'profile' ? (isProfileEditing ? 'Edit Profile' : 'Profile')
                                    : activeTab === 'settings' ? 'Settings'
                                        : editingId ? `Edit ${SCHEMAS[activeTab]?.label.slice(0, -1) || 'Item'}`
                                            : (SCHEMAS[activeTab]?.label || '')}
                        </h2>
                    </div>
                    {/* Back Chevron handles backing out of editors before leaving the tab */}
                    {activeTab !== 'dashboard' && (
                        <button className="mobile-circle-btn" onClick={() => {
                            if (isProfileEditing) { setIsProfileEditing(false); }
                            else if (editingId) { setEditingId(null); }
                            else { setActiveTab('dashboard'); }
                        }}>
                            <FiChevronLeft size={20} />
                        </button>
                    )}
                </div>

                {/* Status Toast */}
                {message && (
                    <div className={`adm-toast ${status === 'error' ? 'error' : 'success'}`}>
                        <span>{message}</span>
                        <button onClick={() => setMessage('')}><FiX size={14} /></button>
                    </div>
                )}

                {activeTab === 'dashboard' ? (
                    <AdminDashboard
                        dataStore={dataStore}
                        username={username}
                        onNavigate={(tab) => { setActiveTab(tab); setEditingId(null); }}
                        onMasterSave={handleMigrateToFirebase}
                    />
                ) : activeTab === 'profile' ? (
                    <ProfileEditor
                        profileData={dataStore.profile}
                        isProfileEditing={isProfileEditing}
                        setIsProfileEditing={setIsProfileEditing}
                        onUpdateProfile={updateProfile}
                        onSave={() => handleSaveCollection('profile')}
                    />
                ) : activeTab === 'about' ? (
                    <AboutEditor />
                ) : activeTab === 'settings' ? (
                    <div className="admin-content-area" style={{ padding: '32px', maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>Default Author Names</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            These names auto-fill when you set a language on a variant. Edit them here to change the defaults.
                        </p>
                        {[
                            { code: 'ta', name: 'தமிழ் (Tamil)' },
                            { code: 'ml', name: 'മലയാളம் (Malayalam)' },
                            { code: 'en', name: 'English' },
                        ].map(({ code, name }) => (
                            <div key={code} className="adm-field" style={{ marginBottom: '16px' }}>
                                <label className="adm-label">{name}</label>
                                <input
                                    className="adm-input"
                                    value={dataStore.defaultAuthors?.[code] || ''}
                                    onChange={(e) => setDataStore(prev => ({
                                        ...prev,
                                        defaultAuthors: { ...prev.defaultAuthors, [code]: e.target.value }
                                    }))}
                                    placeholder={`Author name in ${name}`}
                                />
                            </div>
                        ))}
                        <button
                            className="adm-btn primary"
                            style={{ marginTop: '16px' }}
                            onClick={async () => {
                                try {
                                    await set(ref(db, 'config/defaultAuthors'), dataStore.defaultAuthors);
                                    setMessage('Default authors saved!');
                                    setStatus('success');
                                    setTimeout(() => setMessage(''), 3000);
                                } catch (err) {
                                    setMessage('Error saving: ' + err.message);
                                    setStatus('error');
                                }
                            }}
                        >
                            <FiSave size={16} /> Save Author Defaults
                        </button>
                    </div>
                ) : activeTab === 'tester' ? (
                    <TesterPanel 
                        dataStore={dataStore}
                        setDataStore={setDataStore}
                        setStatus={setStatus}
                        setMessage={setMessage}
                        autoThumbnails={autoThumbnails}
                        setAutoThumbnails={setAutoThumbnails}
                        onMasterSave={handleMigrateToFirebase}
                    />
                ) : renderEditor()}
            </div>
        </div>
    );
};

export default Admin;

