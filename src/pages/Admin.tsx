// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { MdSave, MdAdd, MdPerson, MdClose, MdMenu, MdHome, MdDashboard, MdChevronLeft, MdLogout, MdSettings, MdArticle, MdComputer, MdCloudUpload, MdComment, MdFavorite, MdExpandMore, MdChevronRight, MdMenuOpen, MdDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography, IconButton, Divider, Popover, CircularProgress, Avatar,
    AppBar, Toolbar, useMediaQuery, useTheme, MenuItem, Collapse,
    ListSubheader, Breadcrumbs, Snackbar, Alert, Tooltip, Fab,
    Card, TextField, Button
} from '@mui/material';
import { db, auth } from '../lib/firebaseClient';
import { ref, get, set, onValue } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

import { SCHEMAS, SharedDatalists, DEFAULT_AUTHORS, formatTimestampToLegacy } from '../components/admin/AdminShared';
import { ProfileEditor } from '../components/admin/ProfileEditor';
import { AboutEditor } from '../components/admin/AboutEditor';
import { PoemEditor } from '../components/admin/PoemEditor';
import { QuoteEditor } from '../components/admin/QuoteEditor';
import { BlogEditor } from '../components/admin/BlogEditor';
import { ArticleEditor } from '../components/admin/ArticleEditor';
import { StoryEditor } from '../components/admin/StoryEditor';
import { DiaryEditor } from '../components/admin/DiaryEditor';
import { ArtEditor } from '../components/admin/ArtEditor';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import BookMakerView from '../components/admin/BookMakerView';
import { addComment } from '../lib/engagement';

import '../styles/admin-tailwind.css';

// Import Data (Initial State for non-Supabase data)
import initialProfile from '../data/profile.json';

import { remove } from 'firebase/database';

// ─── COMMENTS MANAGER COMPONENT ───
const CommentsManager = ({ username, profilePic }) => {
    const [allComments, setAllComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
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

    if (loading) return (
        <Box className="flex items-center justify-center p-16">
            <CircularProgress size={32} />
        </Box>
    );

    const postsWithEngagement = Object.entries(allComments);

    return (
        <Box sx={{ p: { xs: 3, md: 4, lg: 6 }, overflowY: 'auto', flex: 1 }}>
            <Typography variant="h4" className="mb-2" sx={{ fontWeight: 700 }}>Engagement</Typography>
            <Typography variant="body2" color="text.secondary" className="mb-8">
                Manage comments and monitor likes across all posts.
            </Typography>

            <Box className="flex flex-col gap-6">
                {postsWithEngagement.length === 0 ? (
                    <Box className="text-center py-16 opacity-50">
                        <Typography>No comments or likes found.</Typography>
                    </Box>
                ) : (
                    postsWithEngagement.map(([postId, data]) => (
                        <Card key={postId} elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                            <Box className="flex items-center justify-between mb-4 pb-3" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">பதிவு</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{postId}</Typography>
                                </Box>
                                <Box className="flex items-center gap-1" sx={{ color: 'error.main' }}>
                                    <MdFavorite size={16} />
                                    <Typography sx={{ fontWeight: 700 }}>{data.likes}</Typography>
                                </Box>
                            </Box>

                            <Box className="flex flex-col gap-4">
                                {data.comments.filter(c => !c.parentId).map(comment => (
                                    <Box key={comment.id} className="mb-4">
                                        <Box className="flex items-start gap-3">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: comment.isAdmin ? 'primary.dark' : 'action.selected', fontSize: '0.8rem' }}>
                                                {comment.isAdmin && profilePic ? (
                                                    <img src={profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : comment.name[0]}
                                            </Avatar>
                                            <Box className="flex-1 min-w-0">
                                                <Box className="flex items-center gap-2 mb-1">
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {comment.isAdmin ? 'Author' : comment.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">{comment.text}</Typography>
                                                <Box className="flex gap-2 mt-2">
                                                    <IconButton size="small" onClick={() => setReplyingTo(replyingTo?.commentId === comment.id ? null : { postId, commentId: comment.id })}>
                                                        <MdComment size={14} />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(postId, comment.id)}>
                                                        <MdDelete size={14} />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Replies */}
                                        <Box className="ml-10 mt-3 flex flex-col gap-3">
                                            {data.comments.filter(r => r.parentId === comment.id).map(reply => (
                                                <Box key={reply.id} className="flex items-start gap-3">
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: reply.isAdmin ? 'primary.dark' : 'action.selected' }}>
                                                        {reply.isAdmin && profilePic ? (
                                                            <img src={profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : reply.name[0]}
                                                    </Avatar>
                                                    <Box className="flex-1 min-w-0">
                                                        <Box className="flex items-center gap-2 mb-0.5">
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{reply.isAdmin ? 'Author' : reply.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{reply.timestamp ? new Date(reply.timestamp).toLocaleString() : ''}</Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{reply.text}</Typography>
                                                    </Box>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(postId, reply.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                                        <MdDelete size={12} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>

                                        {/* Reply Input */}
                                        {replyingTo?.commentId === comment.id && (
                                            <Box className="ml-10 mt-3" sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'primary.main', bgcolor: 'background.paper' }}>
                                                <textarea
                                                    className="w-full bg-transparent text-(--color-on-surface) outline-none resize-y min-h-[60px] text-sm"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your admin reply..."
                                                    autoFocus
                                                />
                                                <Box className="flex justify-end gap-2 mt-2">
                                                    <button className="text-xs px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-white/5 transition-colors" onClick={() => setReplyingTo(null)}>Cancel</button>
                                                    <button
                                                        className="text-xs px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                                        onClick={() => handleReply(postId, comment.id, username)}
                                                        disabled={!replyText.trim() || isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Sending...' : 'Reply'}
                                                    </button>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
};

// Allowed administrator email addresses
const ALLOWED_ADMIN_EMAILS = ['jaiprakashpartha@gmail.com', 'jaiprakashvp2006@gmail.com'];

const getSynchronizedItemFields = (field, value) => {
    const updates = { [field]: value };
    if (field === 'date' || field === 'publish_date') {
        const cleanVal = typeof value === 'string' ? value.trim() : '';
        if (cleanVal) {
            const parsed = new Date(cleanVal);
            if (!isNaN(parsed.getTime())) {
                updates.timestamp = parsed.getTime();
            }
        }
        if (field === 'date') updates.publish_date = value;
        else updates.date = value;
    }
    return updates;
};

// ─── NAV SECTION WITH COLLAPSE ───
const NavSection = ({ label, children, defaultOpen = true, isCollapsed: sidebarCollapsed }) => {
    const [open, setOpen] = useState(defaultOpen);

    if (sidebarCollapsed) {
        return <>{children}</>;
    }

    return (
        <>
            <ListItemButton
                onClick={() => setOpen(!open)}
                sx={{ borderRadius: '24px', mx: 1, py: 0.5, px: 2, minHeight: 32, mb: 0.5, '&:hover': { bgcolor: 'action.hover' } }}
            >
                <ListItemText
                    primary={
                        <Typography variant="overline" sx={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'text.secondary' }}>
                            {label}
                        </Typography>
                    }
                />
                {open ? <MdExpandMore size={14} style={{ opacity: 0.5 }} /> : <MdChevronRight size={14} style={{ opacity: 0.5 }} />}
            </ListItemButton>
            <Collapse in={open} timeout={300}>
                {children}
            </Collapse>
        </>
    );
};

// ─── MAIN ADMIN COMPONENT ───
const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isProfileEditing, setIsProfileEditing] = useState(false);

    // Theme state to sync with main app
    const [appThemeMode, setAppThemeMode] = useState(() => localStorage.getItem('theme') || 'auto');

    // Login gate
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');



    // Sidebar state
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('admin_sidebar_collapsed') === 'true');
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(null);
    const [autoThumbnails, setAutoThumbnails] = useState(() => localStorage.getItem('autoThumbnails') === 'true');
    
    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        localStorage.setItem('autoThumbnails', autoThumbnails);
    }, [autoThumbnails]);

    const prevStateRef = useRef({ activeTab, editingId, isProfileEditing });
    useEffect(() => {
        prevStateRef.current = { activeTab, editingId, isProfileEditing };
    }, [activeTab, editingId, isProfileEditing]);

    const [dataStore, setDataStore] = useState({
        quotes: [],
        profile: initialProfile,
        poems: [],
        blog: [],
        articles: [],
        stories: [],
        diary: [],
        art_pencil: [],
        art_editing: [],
        art_poster: [],
        art_painting: [],
        art_quotes: [],
        art_poems: [],
        art_illustrations: [],
        art_digital_arts: [],
        series: [],
        defaultAuthors: { ...DEFAULT_AUTHORS },
    });

    // Apply admin theme
    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('theme', appThemeMode);
        const apply = () => {
            if (appThemeMode === 'auto') {
                const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.setAttribute('data-theme', sys);
            } else {
                root.setAttribute('data-theme', appThemeMode);
            }
        };
        apply();
        if (appThemeMode === 'auto') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => apply();
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [appThemeMode]);

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('admin_sidebar_collapsed', String(next));
            return next;
        });
    };

    // Show message helper
    const showMessage = (msg: string, severity: 'success' | 'error' = 'success') => {
        setMessage(msg);
        setStatus(severity === 'error' ? 'error' : 'success');
        setSnackbar({ open: true, message: msg, severity });
    };

    // ── Auth Handling ──
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const email = user.email ? user.email.toLowerCase() : '';
                if (ALLOWED_ADMIN_EMAILS.includes(email)) {
                    setIsLoggedIn(true);
                    setUsername(user.displayName || email.split('@')[0] || 'Admin');
                } else {
                    await signOut(auth);
                    setIsLoggedIn(false);
                    setUsername('');
                    alert('Access Denied: You are not authorized to access this Admin Panel.');
                }
            } else {
                setIsLoggedIn(false);
                setUsername('');
            }
            setIsAuthChecking(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        setIsLoggedIn(false);
        setUsername('');
        setIsProfilePopupOpen(null);
    };

    const handleLogin = async (email, password) => {
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
            return { success: false, error: 'Access Denied: Unauthorized admin email.' };
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'An unexpected error occurred.' };
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const userEmail = userCredential.user?.email ? userCredential.user.email.toLowerCase() : '';
            if (!ALLOWED_ADMIN_EMAILS.includes(userEmail)) {
                await signOut(auth);
                return { success: false, error: 'Access Denied: Unauthorized admin email.' };
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message || 'An unexpected error occurred.' };
        }
    };

    const [isMigrating, setIsMigrating] = useState(false);

    // ── Migration Helpers ──
    const generateSlug = (text) => {
        let slug = String(text).replace(/<[^>]+>/g, '').trim().toLowerCase()
            .replace(/[.#$\[\]\/]/g, '').replace(/[\s\n\r]+/g, '-').substring(0, 50).replace(/^-+|-+$/g, '');
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

    const resolveAuthorForPair = (baseLang: string, tLang: string, authors: Record<string, string>) => {
        if (baseLang === 'ta' && tLang === 'en') return { name: authors['ta_translit'] || authors['en'] || '', locked: true };
        if (baseLang === 'ta' && tLang === 'ml') return { name: authors['ml'] || '', locked: true };
        if (baseLang === 'ml' && tLang === 'en') return { name: authors['ml_translit'] || authors['en'] || '', locked: true };
        if (baseLang === 'ml' && tLang === 'ta') return { name: authors['ta'] || '', locked: true };
        if ((baseLang === 'hi' || baseLang === 'sa') && tLang === 'en') return { name: authors['en'] || '', locked: true };
        return { name: '', locked: false };
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
            const da = dataStore.defaultAuthors || DEFAULT_AUTHORS;
            clean.variants.forEach(v => {
                if (v.transliterations?._empty) delete v.transliterations._empty;
                if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                if (v.authorTransliterations?._empty) delete v.authorTransliterations._empty;
                if (v.text) v.text = textToHtml(v.text);
                if (v.transliterations) {
                    Object.keys(v.transliterations).forEach(lang => {
                        if (v.transliterations[lang]) v.transliterations[lang] = textToHtml(v.transliterations[lang]);
                        const resolved = resolveAuthorForPair(v.lang, lang, da);
                        if (resolved.locked && v.authorTransliterations) {
                            const current = v.authorTransliterations[lang] || '';
                            const allDefaults = Object.values(da);
                            const isAutoFilled = !current || allDefaults.includes(current);
                            if (isAutoFilled) v.authorTransliterations[lang] = resolved.name;
                        }
                    });
                }
                if (v.transliterations && Object.keys(v.transliterations).length === 0) delete v.transliterations;
                if (v.titleTransliterations && Object.keys(v.titleTransliterations).length === 0) delete v.titleTransliterations;
                if (v.authorTransliterations && Object.keys(v.authorTransliterations).length === 0) delete v.authorTransliterations;
            });
        }
        if (clean.category && (clean.images || clean.image)) {
            if (clean.images && typeof clean.images === 'string') clean.images = clean.images.split('\n').map(u => u.trim()).filter(Boolean);
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
            const collectionsToWipe = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary', 'arts'];
            for (const coll of collectionsToWipe) await set(ref(db, coll), null);
            await set(ref(db, 'config/profile'), dataStore.profile);
            let count = 0;
            const promises = [];
            const snapshot = await get(ref(db));
            const liveData = snapshot.exists() ? snapshot.val() : {};
            const artsCollectionData = {};
            const artsUsedKeys = new Set();
            if (liveData.arts) {
                Object.entries(liveData.arts).forEach(([key, val]) => {
                    if (!(val as any).is_mock) { artsCollectionData[key] = val; artsUsedKeys.add(key); }
                });
            }
            Object.entries(dataStore).forEach(([collection, items]) => {
                if (collection === 'profile' || collection === 'defaultAuthors') return;
                if (!Array.isArray(items)) return;
                const isArtCollection = collection.startsWith('art_');
                if (isArtCollection) {
                    items.forEach((item, index) => {
                        if (!item.id) return;
                        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(item.id));
                        let finalKey = isUUID ? `art_${Date.now()}_${index}` : String(item.id);
                        if (item.is_mock && !finalKey.startsWith('mock_')) finalKey = `mock_${finalKey}`;
                        let baseKey = finalKey; let suffix = 1;
                        while (artsUsedKeys.has(finalKey)) { finalKey = `${baseKey}-${suffix}`; suffix++; }
                        artsUsedKeys.add(finalKey);
                        const row = cleanForStorage(item, index);
                        row.category = collection.replace('art_', '');
                        artsCollectionData[finalKey] = row;
                        count++;
                    });
                } else {
                    if (collection === 'arts') return;
                    const usedKeys = new Set();
                    const collectionData = {};
                    if (liveData[collection]) {
                        Object.entries(liveData[collection]).forEach(([key, val]) => {
                            if (!(val as any).is_mock) { collectionData[key] = val; usedKeys.add(key); }
                        });
                    }
                    items.forEach((item, index) => {
                        if (!item.id) return;
                        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(item.id));
                        let finalKey = isUUID ? generateSlug(getBestTitle(item)) : String(item.id);
                        if (item.is_mock && !finalKey.startsWith('mock_')) finalKey = `mock_${finalKey}`;
                        let baseKey = finalKey; let suffix = 1;
                        if (isUUID) { while (usedKeys.has(finalKey)) { finalKey = `${baseKey}-${suffix}`; suffix++; } }
                        usedKeys.add(finalKey);
                        collectionData[finalKey] = cleanForStorage(item, index);
                        count++;
                    });
                    promises.push(set(ref(db, collection), collectionData));
                }
            });
            promises.push(set(ref(db, 'arts'), artsCollectionData));
            await Promise.all(promises);
            showMessage(`Successfully committed ${count} items to live site!`);
        } catch (error) {
            showMessage("Failed to save: " + error.message, 'error');
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
                    const categories = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary', 'arts', 'series'];
                    categories.forEach(key => {
                        if (allData[key]) {
                            const itemsArray = Object.entries(allData[key]).map(([slug, val]) => {
                                const item = { ...val, id: slug };
                                if (item.variants) {
                                    (Array.isArray(item.variants) ? item.variants : Object.values(item.variants)).forEach(v => {
                                        if (v.transliterations?._empty) delete v.transliterations._empty;
                                        if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                                        if (v.authorTransliterations?._empty) delete v.authorTransliterations._empty;
                                        if (!v.transliterations) v.transliterations = {};
                                        if (!v.titleTransliterations) v.titleTransliterations = {};
                                        if (!v.authorTransliterations) v.authorTransliterations = {};
                                    });
                                    if (!Array.isArray(item.variants)) item.variants = Object.values(item.variants);
                                }
                                if (key === 'arts' && Array.isArray(item.images)) item.images = item.images.join('\n');
                                if (item.tags && typeof item.tags === 'string') item.tags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
                                if (item.tags && !Array.isArray(item.tags)) item.tags = Object.values(item.tags);
                                return item;
                            });
                            itemsArray.sort((a, b) => {
                                const isAPinned = (a.isPinned || a.is_pinned) && (a.pinType === 'permanent' || a.pin_type === 'permanent');
                                const isBPinned = (b.isPinned || b.is_pinned) && (b.pinType === 'permanent' || b.pin_type === 'permanent');
                                if (isAPinned && !isBPinned) return -1;
                                if (!isAPinned && isBPinned) return 1;
                                if (a.display_order !== b.display_order) return (a.display_order || 0) - (b.display_order || 0);
                                if (key === 'stories') {
                                    const seriesA = a.series_name || '';
                                    const seriesB = b.series_name || '';
                                    if (seriesA !== seriesB) return seriesA.localeCompare(seriesB);
                                    const partA = parseInt(a.series_part) || 0;
                                    const partB = parseInt(b.series_part) || 0;
                                    return partA - partB; // Ascending order
                                }
                                const dateA = new Date(a.publish_date || a.date || 0).getTime();
                                const dateB = new Date(b.publish_date || b.date || 0).getTime();
                                return dateB - dateA;
                            });
                            newDataStore[key] = itemsArray;
                            if (key === 'arts') {
                                const subcategories = ['pencil', 'editing', 'poster', 'painting', 'quotes', 'poems', 'illustrations', 'digital_arts'];
                                subcategories.forEach(sub => {
                                    newDataStore[`art_${sub}`] = itemsArray.filter(item => item.category === sub);
                                });
                            }
                        }
                    });
                    if (allData.config?.profile) newDataStore.profile = allData.config.profile;
                    if (allData.config?.defaultAuthors) newDataStore.defaultAuthors = { ...DEFAULT_AUTHORS, ...allData.config.defaultAuthors };
                    setDataStore(newDataStore);
                }
            } catch (err) {
                console.warn('Firebase load failed:', err.message);
            }
        };
        if (isLoggedIn) loadFromFirebase();
    }, [isLoggedIn]);

    // ── Save ──
    const handleSaveCollection = async (collection) => {
        setStatus('loading');
        setMessage('');
        const generateSlug = (text) => {
            let slug = String(text).replace(/<[^>]+>/g, '').trim().toLowerCase()
                .replace(/[.#$\[\]\/]/g, '').replace(/[\s\n\r]+/g, '-').substring(0, 50).replace(/^-+|-+$/g, '');
            return slug || 'untitled';
        };
        try {
            if (collection === 'profile') {
                await set(ref(db, 'config/profile'), dataStore.profile);
                showMessage('Profile saved successfully!');
                setIsProfileEditing(false);
                return;
            }
            const isArtCollection = collection.startsWith('art_');
            if (isArtCollection) {
                const subcategories = ['pencil', 'editing', 'poster', 'painting', 'quotes', 'poems', 'illustrations', 'digital_arts'];
                const usedKeys = new Set();
                const updateObj = {};
                const localUpdates = {};
                subcategories.forEach(sub => {
                    const storeKey = `art_${sub}`;
                    const items = dataStore[storeKey] || [];
                    const updatedItems = [...items];
                    items.forEach((item, index) => {
                        let key = String(item.id);
                        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(key);
                        if (isUUID) key = `art_${Date.now()}_${index}`;
                        let finalKey = key; let suffix = 1;
                        while (usedKeys.has(finalKey)) { finalKey = `${key}-${suffix}`; suffix++; }
                        usedKeys.add(finalKey);
                        const row = cleanForStorage(item, index);
                        row.category = sub;
                        updateObj[finalKey] = row;
                        updatedItems[index] = { ...item, id: finalKey };
                    });
                    localUpdates[storeKey] = updatedItems;
                });
                await set(ref(db, 'arts'), updateObj);
                setDataStore(prev => ({ ...prev, ...localUpdates }));
                showMessage('Saved all Arts to Firebase!');
            } else {
                const items = dataStore[collection];
                const usedKeys = new Set();
                const updateObj = {};
                const updatedItems = [...items];
                items.forEach((item, index) => {
                    let key = String(item.id);
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(key);
                    if (isUUID) {
                        const firstVariant = item.variants?.[0];
                        const titleTransl = firstVariant?.titleTransliterations || {};
                        const bestTitle = item.title || titleTransl.en || item.variants?.find(v => v.lang === 'en')?.title || firstVariant?.title || 'untitled';
                        key = generateSlug(bestTitle);
                    }
                    let finalKey = key; let suffix = 1;
                    while (usedKeys.has(finalKey)) { finalKey = `${key}-${suffix}`; suffix++; }
                    usedKeys.add(finalKey);
                    const row = cleanForStorage(item, index);
                    updateObj[finalKey] = row;
                    updatedItems[index] = { ...item, id: finalKey };
                });
                await set(ref(db, collection), updateObj);
                setDataStore(prev => ({ ...prev, [collection]: updatedItems }));

                // If saving stories, also sync series data since they are managed together
                if (collection === 'stories') {
                    const seriesItems = dataStore['series'] || [];
                    const seriesUpdateObj = {};
                    seriesItems.forEach((sItem, sIndex) => {
                        let key = String(sItem.id);
                        if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(key)) {
                            key = generateSlug(sItem.title || 'untitled-series');
                        }
                        const row = cleanForStorage(sItem, sIndex);
                        seriesUpdateObj[key] = row;
                        seriesItems[sIndex] = { ...sItem, id: key };
                    });
                    
                    if (Object.keys(seriesUpdateObj).length === 0) {
                        console.warn("SERIES UPDATE OBJ IS EMPTY! Skipping save to prevent permission denied.", dataStore['series']);
                    } else {
                        console.log("Saving seriesUpdateObj:", seriesUpdateObj);
                        await set(ref(db, 'series'), seriesUpdateObj);
                    }
                    setDataStore(prev => ({ ...prev, series: seriesItems }));
                }

                showMessage('Saved to Firebase!');
            }
        } catch (error) {
            showMessage(error.message || 'Network error.', 'error');
        } finally {
            setTimeout(() => { setStatus('idle'); setMessage(''); }, 4000);
        }
    };

    // ── CRUD helpers ──
    const addItem = (collection, initialData = {}) => {
        const newId = uuidv4();
        let newItem;
        const schema = SCHEMAS[collection];
        const now = new Date();
        const legacyDateStr = formatTimestampToLegacy(now);
        const currentTimestamp = now.getTime();
        if (schema?.type === 'simple') {
            newItem = { id: newId, date: legacyDateStr, timestamp: currentTimestamp };
            (schema.fields || []).forEach(f => { if (f.key !== 'date' && f.key !== 'timestamp') newItem[f.key] = ''; });
            if (collection.startsWith('art_')) newItem.category = collection.replace('art_', '');
        } else if (collection === 'quotes' || collection === 'poems') {
            newItem = {
                id: newId, title: '', date: legacyDateStr, publish_date: legacyDateStr, timestamp: currentTimestamp,
                style: '', theme: '', meter: '', dedication: '', classification: '', urai: '', notes: '',
                variants: [{ label: '', title: '', text: '', author: '', lang: '', transliterations: {}, titleTransliterations: {}, authorTransliterations: {} }]
            };
        } else if (collection === 'series') {
            newItem = {
                id: newId, title: '', coverImage: '', description: '', date: legacyDateStr, publish_date: legacyDateStr, timestamp: currentTimestamp
            };
        } else {
            newItem = {
                id: newId, date: legacyDateStr, publish_date: legacyDateStr, timestamp: currentTimestamp,
                variants: [{ label: '', title: '', text: '', author: '', lang: 'ta', transliterations: {}, titleTransliterations: {}, authorTransliterations: {} }]
            };
        }
        newItem = { ...newItem, ...initialData };
        setDataStore(prev => ({ ...prev, [collection]: [newItem, ...(prev[collection] || [])] }));
        setEditingId(newId);
    };

    const handleCloseEditor = (id) => {
        if (id && activeTab !== 'profile') {
            const items = dataStore[activeTab];
            const item = items?.find(i => i.id === id);
            if (item) {
                const schema = SCHEMAS[activeTab];
                const isSimple = schema?.type === 'simple';
                let isEmpty = false;
                if (isSimple) {
                    const hasAnyContent = (schema.fields || []).some(f => { const val = item[f.key]; return val && String(val).trim(); });
                    isEmpty = !hasAnyContent;
                } else {
                    const hasLegacyTitle = item.title && item.title.trim();
                    const hasVariantText = item.variants?.some(v => (v.text && v.text.trim()) || (v.title && v.title.trim()));
                    isEmpty = !hasLegacyTitle && !hasVariantText;
                }
                if (isEmpty) {
                    setDataStore(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(i => i.id !== id) }));
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
            if (direction === 'up' && index > 0) [items[index - 1], items[index]] = [items[index], items[index - 1]];
            else if (direction === 'down' && index < items.length - 1) [items[index + 1], items[index]] = [items[index], items[index + 1]];
            return { ...prev, [collection]: items };
        });
    };

    const reorderItem = (collection, oldIndex, newIndex) => {
        setDataStore(prev => {
            const items = [...prev[collection]];
            const [movedItem] = items.splice(oldIndex, 1);
            items.splice(newIndex, 0, movedItem);
            return { ...prev, [collection]: items };
        });
    };

    const updateItemField = (collection, index, field, value) => {
        setDataStore(prev => {
            const newData = [...prev[collection]];
            const synchronized = getSynchronizedItemFields(field, value);
            newData[index] = { ...newData[index], ...synchronized };
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
            const newTransl = { ...v.transliterations }; delete newTransl[tLang]; v.transliterations = newTransl;
            if (v.titleTransliterations) { const n = { ...v.titleTransliterations }; delete n[tLang]; v.titleTransliterations = n; }
            if (v.authorTransliterations) { const n = { ...v.authorTransliterations }; delete n[tLang]; v.authorTransliterations = n; }
        } else {
            v.transliterations = { ...(v.transliterations || {}), [tLang]: '' };
            v.titleTransliterations = { ...(v.titleTransliterations || {}), [tLang]: '' };
            const da = dataStore.defaultAuthors || DEFAULT_AUTHORS;
            const resolved = resolveAuthorForPair(v.lang, tLang, da);
            v.authorTransliterations = { ...(v.authorTransliterations || {}), [tLang]: resolved.name };
        }
        newVariants[variantIndex] = v;
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const addVariant = (collection, itemIndex) => {
        const newData = [...dataStore[collection]];
        newData[itemIndex].variants.push({ label: '', title: '', text: '', author: '', lang: '', transliterations: {}, titleTransliterations: {}, authorTransliterations: {} });
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
        if (direction === 'up' && variantIndex > 0) [newVariants[variantIndex - 1], newVariants[variantIndex]] = [newVariants[variantIndex], newVariants[variantIndex - 1]];
        else if (direction === 'down' && variantIndex < newVariants.length - 1) [newVariants[variantIndex + 1], newVariants[variantIndex]] = [newVariants[variantIndex], newVariants[variantIndex + 1]];
        newData[itemIndex].variants = newVariants;
        setDataStore(prev => ({ ...prev, [collection]: newData }));
    };

    const updateProfile = (field, value) => {
        setDataStore(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    };

    const updateGenericItem = (collection, index, field, value) => {
        const synchronized = getSynchronizedItemFields(field, value);
        setDataStore(prev => {
            const newData = [...(prev[collection] || [])];
            if (newData[index]) {
                newData[index] = { ...newData[index], ...synchronized };
            }
            return { ...prev, [collection]: newData };
        });
    };

    const updateSeriesNameAndChapters = (seriesIndex, newName) => {
        setDataStore(prev => {
            const seriesList = [...(prev.series || [])];
            const oldName = seriesList[seriesIndex].title;
            seriesList[seriesIndex] = { ...seriesList[seriesIndex], title: newName };

            const storiesList = [...(prev.stories || [])];
            const updatedStories = storiesList.map(story => {
                if (story.series_name === oldName || (!story.series_name && oldName === 'Standalone Stories')) {
                    return { ...story, series_name: newName };
                }
                return story;
            });

            return { ...prev, series: seriesList, stories: updatedStories };
        });
    };

    const renameSeriesForStories = (oldName, newName) => {
        setDataStore(prev => {
            const storiesList = [...(prev.stories || [])];
            let changed = false;
            const updatedStories = storiesList.map(story => {
                if (story.series_name === oldName || (!story.series_name && oldName === 'Standalone Stories')) {
                    changed = true;
                    return { ...story, series_name: newName };
                }
                return story;
            });
            if (!changed) return prev;
            return { ...prev, stories: updatedStories };
        });
    };

    // ── Bulk move/copy/duplicate ──
    const handleMoveItems = (ids, fromCollection, toCollection) => {
        const sourceItems = dataStore[fromCollection] || [];
        const moving = sourceItems.filter(i => ids.includes(i.id)).map(item => {
            const newItem = { ...item };
            if (toCollection.startsWith('art_')) newItem.category = toCollection.replace('art_', '');
            return newItem;
        });
        const remaining = sourceItems.filter(i => !ids.includes(i.id));
        setDataStore(prev => ({ ...prev, [fromCollection]: remaining, [toCollection]: [...(prev[toCollection] || []), ...moving] }));
        showMessage(`Moved ${moving.length} item${moving.length > 1 ? 's' : ''} to ${SCHEMAS[toCollection]?.label || toCollection}. Save both to commit.`);
    };

    const handleCopyItems = (ids, fromCollection, toCollection) => {
        const sourceItems = dataStore[fromCollection] || [];
        const copying = sourceItems.filter(i => ids.includes(i.id)).map(item => {
            const newItem = { ...JSON.parse(JSON.stringify(item)), id: uuidv4() };
            if (toCollection.startsWith('art_')) newItem.category = toCollection.replace('art_', '');
            return newItem;
        });
        setDataStore(prev => ({ ...prev, [toCollection]: [...(prev[toCollection] || []), ...copying] }));
        showMessage(`Copied ${copying.length} item${copying.length > 1 ? 's' : ''} to ${SCHEMAS[toCollection]?.label || toCollection}. Save to commit.`);
    };

    const handleDuplicateItems = (ids, collection) => {
        if (!ids || ids.length === 0) return;
        const now = new Date();
        const legacyDateStr = formatTimestampToLegacy(now);
        const currentTimestamp = now.getTime();
        setDataStore(prev => {
            const originalItems = prev[collection] || [];
            const newItems = [];
            originalItems.forEach(item => {
                newItems.push(item);
                if (ids.includes(item.id)) {
                    const clone = JSON.parse(JSON.stringify(item));
                    clone.id = uuidv4();
                    clone.timestamp = currentTimestamp;
                    if (clone.date !== undefined) clone.date = legacyDateStr;
                    if (clone.publish_date !== undefined) clone.publish_date = legacyDateStr;
                    if (clone.title) clone.title = `${clone.title} (Copy)`;
                    if (clone.name) clone.name = `${clone.name} (Copy)`;
                    if (Array.isArray(clone.variants)) {
                        clone.variants.forEach(variant => {
                            if (variant.title) variant.title = `${variant.title} (Copy)`;
                            if (variant.titleTransliterations) {
                                Object.keys(variant.titleTransliterations).forEach(lang => {
                                    if (variant.titleTransliterations[lang]) variant.titleTransliterations[lang] = `${variant.titleTransliterations[lang]} (Copy)`;
                                });
                            }
                        });
                    }
                    newItems.push(clone);
                }
            });
            return { ...prev, [collection]: newItems };
        });
        showMessage(`Duplicated ${ids.length} item${ids.length > 1 ? 's' : ''} locally! Click 'Save' to commit.`);
    };

    const renderEditor = () => {
        const commonProps = {
            items: dataStore[activeTab], collection: activeTab, editingId, setEditingId,
            handleCloseEditor, onAddItem: (initialData) => addItem(activeTab, initialData),
            addSeries: (initialData) => {
                const newId = uuidv4();
                const now = new Date();
                const legacyDateStr = formatTimestampToLegacy(now);
                const currentTimestamp = now.getTime();
                const newItem = {
                    id: newId, title: '', coverImage: '', description: '', date: legacyDateStr, publish_date: legacyDateStr, timestamp: currentTimestamp,
                    ...initialData
                };
                setDataStore(prev => ({ ...prev, series: [newItem, ...(prev.series || [])] }));
            },
            updateGenericItem,
            updateSeriesNameAndChapters,
            renameSeriesForStories,
            seriesData: dataStore['series'] || [], onSave: () => handleSaveCollection(activeTab), saveStatus: status,
            updateItemField, moveItem, deleteItem, reorderItem,
            addVariant, updateVariant, removeVariant, moveVariant,
            updateTransliteration, toggleTransliterationLang,
            defaultAuthors: dataStore.defaultAuthors || DEFAULT_AUTHORS,
            onMoveItems: handleMoveItems, onCopyItems: handleCopyItems,
            onDuplicateItems: (ids) => handleDuplicateItems(ids, activeTab)
        };
        if (activeTab.startsWith('art_')) return <ArtEditor {...commonProps} collection={activeTab} />;
        switch (activeTab) {
            case 'poems': return <PoemEditor {...commonProps} />;
            case 'quotes': return <QuoteEditor {...commonProps} />;
            case 'blog': return <BlogEditor {...commonProps} />;
            case 'articles': return <ArticleEditor {...commonProps} />;
            case 'stories': return <StoryEditor {...commonProps} />;
            case 'diary': return <DiaryEditor {...commonProps} />;
            case 'arts': return <ArtEditor {...commonProps} />;
            case 'comments': return <CommentsManager username={username} profilePic={dataStore.profile?.profilePic || dataStore.profile?.avatar} />;
            case 'bookmaker': return <BookMakerView />;
            default: return null;
        }
    };

    // ── RENDER ──
    if (isAuthChecking) {
        return (
            <Box className="flex h-screen w-screen items-center justify-center" sx={{ bgcolor: 'background.default' }}>
                <Box className="flex flex-col items-center gap-4">
                    <CircularProgress size={36} thickness={3} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Checking session...</Typography>
                </Box>
            </Box>
        );
    }

    if (!isLoggedIn) {
        return <AdminLogin onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />;
    }

    const drawerWidth = isCollapsed ? 72 : 280;

    // ── Navigation Items (Grouped) ──
    const writingItems = [
        { id: 'poems', label: 'Poems', icon: SCHEMAS.poems.icon },
        { id: 'quotes', label: 'Quotes', icon: SCHEMAS.quotes.icon },
        { id: 'blog', label: 'Blog', icon: SCHEMAS.blog.icon },
        { id: 'articles', label: 'Articles', icon: SCHEMAS.articles.icon },
        { id: 'stories', label: 'Stories', icon: SCHEMAS.stories.icon },
        { id: 'diary', label: 'Diary', icon: SCHEMAS.diary.icon },
    ];

    const artItems = Object.keys(SCHEMAS)
        .filter(k => k.startsWith('art_'))
        .map(key => ({ id: key, label: SCHEMAS[key].label, icon: SCHEMAS[key].icon }));

    const NavItem = ({ item }) => (
        <ListItem disablePadding sx={{ mb: 0.25 }}>
            <Tooltip title={isCollapsed ? item.label : ''} placement="right" arrow>
                <ListItemButton
                    selected={activeTab === item.id}
                    onClick={() => { setActiveTab(item.id); setEditingId(null); setMobileMenuOpen(false); }}
                    sx={{
                        borderRadius: '24px',
                        mx: 1,
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        px: isCollapsed ? 1.5 : 2,
                        py: 1,
                        minHeight: 40,
                    }}
                >
                    <ListItemIcon sx={{ mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                        {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                        <ListItemText
                            primary={<Typography variant="body2" fontWeight={activeTab === item.id ? 700 : 500}>{item.label}</Typography>}
                        />
                    )}
                </ListItemButton>
            </Tooltip>
        </ListItem>
    );

    const drawerContent = (
        <Box className="flex flex-col h-full">
            {/* Header */}
            <Box className="flex items-center h-16 shrink-0" sx={{ px: 3, justifyContent: isCollapsed ? 'center' : 'space-between' }}>
                {!isCollapsed && (
                    <Typography variant="h6" className="select-none" sx={{ letterSpacing: '-0.02em',  fontWeight: 800 }}>
                        Admin
                    </Typography>
                )}
                <IconButton onClick={toggleCollapse} size="small" sx={{ color: 'text.secondary' }}>
                    {isCollapsed ? <MdMenu size={18} /> : <MdMenuOpen size={18} />}
                </IconButton>
            </Box>

            <Divider />

            {/* Nav */}
            <List className="flex-1 overflow-y-auto px-2 py-2" sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                {/* Dashboard */}
                <NavItem item={{ id: 'dashboard', label: 'Dashboard', icon: <MdDashboard size={18} /> }} />

                <Box className="h-2" />

                {/* Content */}
                <NavItem item={{ id: 'profile', label: 'Profile', icon: <MdPerson size={18} /> }} />
                <NavItem item={{ id: 'about', label: 'About Page', icon: <MdArticle size={18} /> }} />

                <Box className="h-2" />

                {/* Writings Group */}
                <NavSection label="Writings" isCollapsed={isCollapsed}>
                    {writingItems.map(item => <NavItem key={item.id} item={item} />)}
                </NavSection>

                <Box className="h-1" />

                {/* Arts Group */}
                <NavSection label="Arts" defaultOpen={false} isCollapsed={isCollapsed}>
                    {artItems.map(item => <NavItem key={item.id} item={item} />)}
                </NavSection>

                <Box className="h-2" />

                {/* Engagement */}
                {!isCollapsed && (
                    <ListSubheader disableSticky>Engagement</ListSubheader>
                )}
                <NavItem item={{ id: 'comments', label: 'Comments', icon: <MdComment size={18} /> }} />

                <Box className="h-2" />

                {/* Tools */}
                {!isCollapsed && (
                    <ListSubheader disableSticky>Tools</ListSubheader>
                )}
                <NavItem item={{ id: 'bookmaker', label: 'Book Maker', icon: <MdArticle size={18} /> }} />

                <Box className="h-2" />

                {/* System */}
                {!isCollapsed && (
                    <ListSubheader disableSticky>System</ListSubheader>
                )}
                <NavItem item={{ id: 'settings', label: 'Settings', icon: <MdSettings size={18} /> }} />
            </List>

            <Divider />

            {/* Profile Zone */}
            <Box className="p-2 pb-3">
                <ListItemButton
                    onClick={(e) => setIsProfilePopupOpen(e.currentTarget)}
                    sx={{ borderRadius: '24px', mx: 1, justifyContent: isCollapsed ? 'center' : 'flex-start', px: isCollapsed ? 1.5 : 2 }}
                >
                    <Avatar
                        sx={{
                            width: 32, height: 32,
                            bgcolor: 'primary.dark',
                            color: 'primary.main',
                            mr: isCollapsed ? 0 : 1.5,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                        }}
                    >
                        {username ? username.charAt(0).toUpperCase() : 'A'}
                    </Avatar>
                    {!isCollapsed && (
                        <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{username || 'Admin'}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">Administrator</Typography>}
                        />
                    )}
                </ListItemButton>
                <Popover
                    open={Boolean(isProfilePopupOpen)}
                    anchorEl={isProfilePopupOpen}
                    onClose={() => setIsProfilePopupOpen(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    slotProps={{ 
                        paper: { 
                            sx: { 
                                width: 264, 
                                p: 1.5, 
                                mb: 1, 
                                borderRadius: 4, 
                                bgcolor: 'background.paper', 
                                backgroundImage: 'none', 
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)' 
                            } 
                        } 
                    }}
                >
                    <Box className="px-3 py-2 flex items-center gap-3">
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.dark', color: 'primary.main', fontWeight: 700, fontSize: '1rem' }}>
                            {username ? username.charAt(0).toUpperCase() : 'A'}
                        </Avatar>
                        <Box className="flex-1 min-w-0">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username || 'Administrator'}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Admin Account</Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                    <Box className="px-3 mb-3">
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600, letterSpacing: '0.05em' }}>APPEARANCE</Typography>
                        <div className="theme-slider-container" style={{ width: '100%', margin: 0 }}>
                            <div
                                className="slider-thumb"
                                style={{ transform: `translateX(${appThemeMode === 'light' ? '0%' : appThemeMode === 'auto' ? '100%' : '200%'})` }}
                            />
                            <div className={`slider-option ${appThemeMode === 'light' ? 'active' : ''}`} onClick={() => setAppThemeMode('light')} title="Light">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                            </div>
                            <div className={`slider-option ${appThemeMode === 'auto' ? 'active' : ''}`} onClick={() => setAppThemeMode('auto')} title="Auto">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" /></svg>
                            </div>
                            <div className={`slider-option ${appThemeMode === 'dark' ? 'active' : ''}`} onClick={() => setAppThemeMode('dark')} title="Dark">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            </div>
                        </div>
                    </Box>

                    <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                    <ListItemButton onClick={() => setIsProfilePopupOpen(null)} component={Link} to="/" sx={{ borderRadius: 3, mx: 0.5, py: 1, mb: 0.5 }}>
                        <MdHome size={18} style={{ marginRight: 12, opacity: 0.7 }} /> 
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Go to main site</Typography>
                    </ListItemButton>
                    <ListItemButton onClick={handleSignOut} sx={{ borderRadius: 3, mx: 0.5, py: 1, color: 'error.main' }}>
                        <MdLogout size={18} style={{ marginRight: 12 }} /> 
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Sign Out</Typography>
                    </ListItemButton>
                </Popover>
            </Box>
        </Box>
    );

    return (
        <Box className="flex h-screen overflow-hidden" sx={{ bgcolor: 'background.default' }}>
            <SharedDatalists defaultAuthors={dataStore.defaultAuthors || DEFAULT_AUTHORS} />

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: { md: drawerWidth },
                    flexShrink: { md: 0 },
                    transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        transition: 'width 0.3s cubic-bezier(0.2, 0, 0, 1)',
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>

            {/* Main Content */}
            <Box component="main" className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <AppBar position="static" elevation={0} sx={{ display: { xs: 'flex', md: 'none' } }}>
                    <Toolbar sx={{ minHeight: '56px !important', px: 2 }}>
                        <IconButton edge="start" onClick={() => setMobileMenuOpen(true)} sx={{ mr: 1, color: 'text.primary' }}>
                            <MdMenu size={20} />
                        </IconButton>
                        <Typography variant="h6" color="text.primary" className="flex-1 text-sm" sx={{ fontWeight: 600 }}>
                            {activeTab === 'dashboard' ? 'Dashboard'
                                : activeTab === 'profile' ? (isProfileEditing ? 'Edit Profile' : 'Profile')
                                    : activeTab === 'settings' ? 'Settings'
                                        : editingId ? `Edit ${SCHEMAS[activeTab]?.label.slice(0, -1) || 'Item'}`
                                            : (SCHEMAS[activeTab]?.label || '')}
                        </Typography>
                        {activeTab !== 'dashboard' && (
                            <IconButton onClick={() => {
                                if (isProfileEditing) setIsProfileEditing(false);
                                else if (editingId) setEditingId(null);
                                else setActiveTab('dashboard');
                            }} sx={{ color: 'text.primary' }}>
                                <MdChevronLeft size={22} />
                            </IconButton>
                        )}
                    </Toolbar>
                </AppBar>

                {/* Content */}
                <Box className="flex-1 overflow-y-auto relative">
                    {activeTab === 'dashboard' ? (
                        <AdminDashboard dataStore={dataStore} username={username} onNavigate={(tab) => { setActiveTab(tab); setEditingId(null); }} />
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
                        <Box sx={{ p: { xs: 3, md: 4, lg: 6 } }}>
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <MdSettings size={32} color="var(--mui-palette-primary-main)" />
                                    System Settings
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Configure global application settings and defaults.
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                    <MdPerson size={24} color="var(--mui-palette-text-secondary)" />
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Default Author Names</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    These names will auto-fill when you create or set a language on a variant. Edit them here to change the defaults globally.
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
                                    {[
                                        { code: 'ta', name: 'தமிழ் (Tamil)' },
                                        { code: 'ml', name: 'മലയാളം (Malayalam)' },
                                        { code: 'en', name: 'English' },
                                        { code: 'ta_translit', name: 'Tamil Transliteration' },
                                        { code: 'ml_translit', name: 'Malayalam Transliteration' },
                                    ].map(({ code, name }) => (
                                        <TextField
                                            key={code}
                                            label={name}
                                            variant="outlined"
                                            fullWidth
                                            value={dataStore.defaultAuthors?.[code] || ''}
                                            onChange={(e) => setDataStore(prev => ({
                                                ...prev, defaultAuthors: { ...prev.defaultAuthors, [code]: e.target.value }
                                            }))}
                                            placeholder={`Author name in ${name}`}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 3,
                                                    bgcolor: 'background.paper',
                                                    '& fieldset': { borderColor: 'divider', borderWidth: 1 },
                                                    '&:hover fieldset': { borderColor: 'text.secondary' },
                                                    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                                                },
                                                '& .MuiInputLabel-root': {
                                                    transform: 'translate(14px, -9px) scale(0.85)',
                                                    bgcolor: 'background.default',
                                                    px: 1,
                                                    borderRadius: 1
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>

                                <Box sx={{ mt: 5 }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<MdSave size={20} />}
                                        onClick={async () => {
                                            try {
                                                await set(ref(db, 'config/defaultAuthors'), dataStore.defaultAuthors);
                                                showMessage('Default authors saved successfully!');
                                            } catch (err) {
                                                showMessage('Error saving defaults: ' + err.message, 'error');
                                            }
                                        }}
                                        sx={{ borderRadius: 8, px: 4, py: 1.5, boxShadow: '0 4px 12px rgba(var(--mui-palette-primary-mainChannel), 0.3)' }}
                                    >
                                        Save Defaults
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    ) : renderEditor()}
                </Box>
            </Box>

            {/* Snackbar Toast */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 4, fontWeight: 600, minWidth: 300 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Admin;
