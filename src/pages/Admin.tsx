// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiPlus, FiUser, FiX, FiMenu, FiHome, FiGrid, FiChevronLeft, FiLogOut, FiSettings, FiFileText } from 'react-icons/fi';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebaseClient';
import { ref, get, set } from 'firebase/database';
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

import '../styles/admin.css';

// Import Data (Initial State for non-Supabase data)
import initialQuotes from '../data/quotes.json';
import initialProfile from '../data/profile.json';
import initialPoems from '../data/poems.json';

// We now load all 6 writing categories from Supabase!


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

    // Internal sub-view scroll restoration state
    const savedScrollsRef = useRef({});
    const prevStateRef = useRef({ activeTab, editingId, isProfileEditing });

    useEffect(() => {
        const prev = prevStateRef.current;

        // 1. Save current scroll before entering details/editors
        if (!prev.editingId && editingId) {
            savedScrollsRef.current[`${activeTab}_list`] = window.scrollY;
        }
        if (!prev.isProfileEditing && isProfileEditing) {
            savedScrollsRef.current[`profile_view`] = window.scrollY;
        }

        // 2. Save/Restore scroll positions when toggling root tabs
        if (prev.activeTab !== activeTab) {
            savedScrollsRef.current[prev.activeTab] = window.scrollY;
            const targetScroll = savedScrollsRef.current[activeTab] || 0;
            requestAnimationFrame(() => {
                window.scrollTo(0, targetScroll);
            });
        }

        // 3. Restore scroll when backing out of an editor to the list
        if (prev.editingId && !editingId) {
            const targetScroll = savedScrollsRef.current[`${activeTab}_list`] || 0;
            setTimeout(() => {
                window.scrollTo(0, targetScroll);
            }, 25);
        }
        if (prev.isProfileEditing && !isProfileEditing) {
            const targetScroll = savedScrollsRef.current[`profile_view`] || 0;
            setTimeout(() => {
                window.scrollTo(0, targetScroll);
            }, 25);
        }

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

                // Arts-specific: normalize images field and auto-set cover
                if (collection === 'arts') {
                    if (row.images && typeof row.images === 'string') {
                        row.images = row.images.split('\n').map(u => u.trim()).filter(Boolean);
                    }
                    if (!Array.isArray(row.images)) row.images = [];
                    if (!row.image && row.images.length > 0) row.image = row.images[0];
                    if (row.timestamp && typeof row.timestamp === 'string') row.timestamp = parseInt(row.timestamp, 10) || Date.now();
                    if (!row.timestamp) row.timestamp = Date.now();
                    if (!row.type) row.type = 'image';
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
                    <div className="nav-group-label">System</div>
                    <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setEditingId(null); setMobileMenuOpen(false); }}>
                        <div className="nav-icon"><FiSettings size={16} /></div> <span>Settings</span>
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
                            { code: 'ml', name: 'മലയാളം (Malayalam)' },
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
                ) : renderEditor()}
            </div>
        </div>
    );
};

export default Admin;

