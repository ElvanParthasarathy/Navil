import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiPlus, FiUser, FiX, FiMenu, FiHome, FiGrid, FiChevronLeft, FiLogOut } from 'react-icons/fi';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

import { SCHEMAS, SharedDatalists } from '../components/admin/AdminShared';
import { ProfileEditor } from '../components/admin/ProfileEditor';
import { PoemEditor } from '../components/admin/PoemEditor';
import { QuoteEditor } from '../components/admin/QuoteEditor';
import { BlogEditor } from '../components/admin/BlogEditor';
import { ArticleEditor } from '../components/admin/ArticleEditor';
import { EssayEditor } from '../components/admin/EssayEditor';
import { StoryEditor } from '../components/admin/StoryEditor';
import { ThoughtEditor } from '../components/admin/ThoughtEditor';
import { DiaryEditor } from '../components/admin/DiaryEditor';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

import '../styles/admin.css';

// Import Data (Initial State)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';
import initialBlog from '../data/blog.json';
import initialArticles from '../data/articles.json';
import initialEssays from '../data/essays.json';
import initialStories from '../data/short_stories.json';
import initialPoems from '../data/poems.json';
import initialThoughts from '../data/thoughts.json';
import initialDiary from '../data/diary.json';


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
    const profileZoneRef = useRef(null);

    const [dataStore, setDataStore] = useState({
        quotes: initialQuotes,
        profile: initialProfile,
        blog: initialBlog,
        articles: initialArticles,
        essays: initialEssays,
        stories: initialStories,
        poems: initialPoems,
        thoughts: initialThoughts,
        diary: initialDiary
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

    const handleSignOut = () => {
        setIsLoggedIn(false);
        setUsername('');
        setIsProfilePopupOpen(false);
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

    // Login handler
    const handleLogin = (user, pass) => {
        setUsername(user);
        setIsLoggedIn(true);
    };

    // Load poems & quotes from Supabase on mount
    useEffect(() => {
        const loadFromSupabase = async () => {
            try {
                const { data: poems } = await supabase.from('poems')
                    .select('*')
                    .order('display_order', { ascending: true })
                    .order('date', { ascending: false });
                if (poems) {
                    const mapped = poems.map(p => ({
                        ...p,
                        isPinned: p.is_pinned,
                        pinExpiresAt: p.pin_expires_at,
                        pinType: p.pin_type || 'auto',
                        displayOrder: p.display_order || 0
                    }));
                    setDataStore(prev => ({ ...prev, poems: mapped }));
                }
                const { data: quotes } = await supabase.from('quotes')
                    .select('*')
                    .order('display_order', { ascending: true })
                    .order('date', { ascending: false });
                if (quotes) {
                    const mapped = quotes.map(q => ({
                        ...q,
                        isPinned: q.is_pinned,
                        pinExpiresAt: q.pin_expires_at,
                        pinType: q.pin_type || 'auto',
                        displayOrder: q.display_order || 0
                    }));
                    setDataStore(prev => ({ ...prev, quotes: mapped }));
                }
            } catch (err) {
                console.warn('Supabase load failed, using legacy JSON:', err.message);
            }
        };
        loadFromSupabase();
    }, []);

    // ── Save (explicit only — never auto-saves) ──
    const handleSaveCollection = async (collection) => {
        setStatus('loading');
        setMessage('');

        try {
            if (collection === 'poems' || collection === 'quotes') {
                const items = dataStore[collection];
                const rows = items.map((item, index) => ({
                    id: String(item.id),
                    variants: item.variants || [],
                    is_pinned: item.isPinned || false,
                    pin_expires_at: item.pinExpiresAt || null,
                    pin_type: item.pinType || 'auto',
                    urai: item.urai || '',
                    notes: item.notes || '',
                    title: item.title || '',
                    date: item.date || null,
                    style: item.style || '',
                    theme: item.theme || '',
                    meter: item.meter || '',
                    dedication: item.dedication || '',
                    classification: item.classification || null,
                    display_order: index,
                }));

                let { error } = await supabase.from(collection).upsert(rows, { onConflict: 'id' });

                if (error && error.message.includes('column')) {
                    console.warn('Retrying save without new columns:', error.message);
                    const fallbackRows = rows.map(({ pin_type, classification, style, meter, dedication, display_order, ...rest }) => rest);
                    const retry = await supabase.from(collection).upsert(fallbackRows, { onConflict: 'id' });
                    if (retry.error) throw new Error(retry.error.message);
                } else if (error) {
                    throw new Error(error.message);
                }

                const localIds = rows.map(r => r.id);
                const { data: dbRows } = await supabase.from(collection).select('id');
                const toDelete = (dbRows || []).filter(r => !localIds.includes(r.id)).map(r => r.id);
                if (toDelete.length > 0) {
                    await supabase.from(collection).delete().in('id', toDelete);
                }

                setStatus('success');
                setMessage('Saved to Supabase!');
            } else {
                const response = await fetch('/api/saveData', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        collection: collection === 'stories' ? 'short_stories' : collection,
                        data: dataStore[collection],
                        password
                    })
                });
                const resData = await response.json();
                if (response.ok) {
                    setStatus('success');
                    setMessage('Saved successfully!');
                    if (collection === 'profile') setIsProfileEditing(false);
                } else {
                    setStatus('error');
                    setMessage(resData.error || 'Failed to save.');
                }
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Network error.');
        } finally {
            setTimeout(() => { setStatus('idle'); setMessage(''); }, 4000);
        }
    };

    // ── CRUD helpers (local state only — never saves automatically) ──
    const addItem = (collection) => {
        const newId = Date.now().toString();
        let newItem;

        if (collection === 'quotes' || collection === 'poems') {
            newItem = {
                id: newId,
                title: '',
                date: new Date().toISOString().slice(0, 16),
                style: '',
                theme: '',
                meter: '',
                dedication: '',
                classification: '',
                urai: '',
                notes: '',
                variants: [{ label: '', title: '', text: '', author: '', lang: '', transliterations: {}, titleTransliterations: {} }]
            };
        } else {
            newItem = { id: newId, date: new Date().toISOString().slice(0, 16) };
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
                const hasTitle = item.title && item.title.trim();
                const hasVariantText = item.variants?.some(v => v.text && v.text.trim());
                const hasAnyContent = hasTitle || hasVariantText || item.body?.trim() || item.content?.trim();
                if (!hasAnyContent) {
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
            toggleTransliterationLang
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
            default: return null;
        }
    };

    // ── RENDER ──
    if (!isLoggedIn) {
        return <AdminLogin onLogin={handleLogin} />;
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
                    {Object.keys(SCHEMAS).map(key => (
                        <button key={key} className={`admin-nav-item ${activeTab === key ? 'active' : ''}`} onClick={() => { setActiveTab(key); setEditingId(null); setMobileMenuOpen(false); }}>
                            <div className="nav-icon">{SCHEMAS[key].icon}</div> <span>{SCHEMAS[key].label}</span>
                        </button>
                    ))}
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative' }}>

                {/* Mobile Header (Hamburger) */}
                <div className="admin-mobile-header">
                    <div className="mobile-header-left">
                        <button className="mobile-circle-btn" onClick={() => setMobileMenuOpen(true)}>
                            <FiMenu size={18} />
                        </button>
                        <h2 className="mobile-header-title">
                            {activeTab === 'dashboard' ? 'Dashboard'
                                : activeTab === 'profile' ? (isProfileEditing ? 'Edit Profile' : 'Profile')
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
                    />
                ) : activeTab === 'profile' ? (
                    <ProfileEditor
                        profileData={dataStore.profile}
                        isProfileEditing={isProfileEditing}
                        setIsProfileEditing={setIsProfileEditing}
                        onUpdateProfile={updateProfile}
                        onSave={() => handleSaveCollection('profile')}
                    />
                ) : renderEditor()}
            </div>
        </div>
    );
};

export default Admin;
