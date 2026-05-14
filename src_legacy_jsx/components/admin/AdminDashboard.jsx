import React, { useState } from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBookOpen, FiBook, FiSun, FiClock, FiTrendingUp, FiZap, FiArrowRight, FiDownload, FiUploadCloud } from 'react-icons/fi';
import { db } from '../../lib/firebaseClient';
import { ref, set } from 'firebase/database';

const COLLECTION_META = {
    quotes: { label: 'Quotes', icon: <FiMessageCircle size={20} />, color: '#d4af37' },
    poems: { label: 'Poems', icon: <FiPenTool size={20} />, color: '#7C5CFC' },
    blog: { label: 'Blog', icon: <FiEdit3 size={20} />, color: '#FF6B6B' },
    articles: { label: 'Articles', icon: <FiFileText size={20} />, color: '#4ECDC4' },
    essays: { label: 'Essays', icon: <FiBookOpen size={20} />, color: '#45B7D1' },
    stories: { label: 'Stories', icon: <FiBook size={20} />, color: '#96CEB4' },
    thoughts: { label: 'Thoughts', icon: <FiSun size={20} />, color: '#FFEAA7' },
    diary: { label: 'Diary', icon: <FiBook size={20} />, color: '#DDA0DD' },
};

const AdminDashboard = ({ dataStore, username, onNavigate }) => {
    const [isMigrating, setIsMigrating] = useState(false);

    // Collect all items with dates for "recent" / "new" computation
    const allItems = [];
    Object.entries(dataStore).forEach(([key, items]) => {
        if (key === 'profile' || !Array.isArray(items)) return;
        items.forEach(item => {
            allItems.push({ ...item, _collection: key });
        });
    });

    // Sort by date descending
    const sorted = [...allItems].sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da;
    });

    // Keep only the latest item for each collection
    const latestPerCollection = {};
    sorted.forEach(item => {
        if (!latestPerCollection[item._collection]) {
            latestPerCollection[item._collection] = item;
        }
    });

    // Sort these latest items by date
    const recentItems = Object.values(latestPerCollection).sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da;
    });

    // Items added in last 7 days (also limited to 1 per collection)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newItems = [];
    Object.values(latestPerCollection).forEach(item => {
        if (item.date && new Date(item.date) >= sevenDaysAgo) {
            newItems.push(item);
        }
    });

    // Sort new items by date as well
    newItems.sort((a, b) => {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return db - da;
    });

    const totalItems = allItems.length;

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleDownloadBackup = () => {
        const dataStr = JSON.stringify(dataStore, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `elvan_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Generate a clean, readable slug from a title string
    const generateSlug = (text) => {
        let slug = String(text)
            .replace(/<[^>]+>/g, '')          // strip HTML
            .trim()
            .toLowerCase()
            .replace(/[.#$\[\]\/]/g, '')      // remove Firebase-forbidden chars
            .replace(/[\s\n\r]+/g, '-')       // spaces/newlines → hyphens
            .substring(0, 50)
            .replace(/^-+|-+$/g, '');         // trim leading/trailing hyphens
        return slug || 'untitled';
    };

    // Determine the best readable title for a poem/item's database key
    const getBestTitle = (item) => {
        // Priority: transliterated title → English variant title → original title → body snippet
        const firstVariant = item.variants?.[0];
        const englishVariant = item.variants?.find(v => v.lang === 'en' && v.title);

        const titleTransl = firstVariant?.titleTransliterations || {};
        const bestTitleTransl = titleTransl.en || Object.values(titleTransl).filter(v => v && v !== true)[0];

        return item.title
            || bestTitleTransl
            || englishVariant?.title
            || firstVariant?.title
            || firstVariant?.text
            || 'untitled';
    };

    // Convert plain text (with \n) to HTML. Skips if already contains HTML tags.
    const textToHtml = (raw) => {
        if (!raw) return '';
        if (/<(p|h[1-6]|ul|ol|li|div|pre|blockquote|br)[> \/]/i.test(raw)) return raw;
        return raw.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>').join('');
    };

    // Clean an item for storage: remove redundant id, strip _empty placeholders, remove legacy fields
    const cleanForStorage = (item, displayOrder) => {
        const clean = JSON.parse(JSON.stringify(item));

        // Remove the local-only `id` — the Firebase key IS the id
        delete clean.id;

        // Remove legacy Supabase fields that are no longer used
        delete clean.style;
        delete clean.theme;
        delete clean.meter;
        delete clean.slug;

        // Set display order
        clean.display_order = displayOrder;

        // Normalize tags: if string, convert to array
        if (clean.tags && typeof clean.tags === 'string') {
            clean.tags = clean.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        // Clean up variants: remove _empty placeholders, convert plain text to HTML
        if (clean.variants) {
            clean.variants.forEach(v => {
                // Remove _empty hack from any prior migration
                if (v.transliterations?._empty) delete v.transliterations._empty;
                if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;

                // Convert plain text newlines to HTML
                if (v.text) v.text = textToHtml(v.text);
                if (v.transliterations) {
                    Object.keys(v.transliterations).forEach(lang => {
                        if (v.transliterations[lang]) v.transliterations[lang] = textToHtml(v.transliterations[lang]);
                    });
                }

                // If the object is now empty, just delete the key — Firebase would drop it anyway
                if (v.transliterations && Object.keys(v.transliterations).length === 0) delete v.transliterations;
                if (v.titleTransliterations && Object.keys(v.titleTransliterations).length === 0) delete v.titleTransliterations;
            });
        }

        return clean;
    };

    const handleMigrateToFirebase = async () => {
        if (!window.confirm("Are you sure you want to migrate? This will OVERWRITE existing data in Firebase Realtime Database with a clean structure.")) return;
        setIsMigrating(true);
        try {
            // First, wipe existing collections to remove old UUID-keyed entries
            const collectionsToWipe = Object.keys(dataStore);
            for (const coll of collectionsToWipe) {
                if (coll === 'profile') {
                    await set(ref(db, 'config/profile'), null);
                } else if (Array.isArray(dataStore[coll])) {
                    await set(ref(db, coll), null);
                }
            }

            let count = 0;
            const promises = [];

            Object.entries(dataStore).forEach(([collection, items]) => {
                if (collection === 'profile') {
                    promises.push(set(ref(db, 'config/profile'), items));
                    count++;
                    return;
                }
                if (!Array.isArray(items)) return;

                const usedKeys = new Set();
                const collectionData = {};

                items.forEach((item, index) => {
                    if (!item.id) return;

                    // Generate a readable slug
                    const baseKey = generateSlug(getBestTitle(item));

                    // Handle duplicates with -1, -2, etc.
                    let finalKey = baseKey;
                    let suffix = 1;
                    while (usedKeys.has(finalKey)) {
                        finalKey = `${baseKey}-${suffix}`;
                        suffix++;
                    }
                    usedKeys.add(finalKey);

                    // Clean and store
                    collectionData[finalKey] = cleanForStorage(item, index);
                    count++;
                });

                // Write entire collection at once (atomic, clean)
                promises.push(set(ref(db, collection), collectionData));
            });

            await Promise.all(promises);
            alert(`Successfully migrated ${count} items with clean, readable keys!`);
        } catch (error) {
            console.error("Migration error:", error);
            alert("Failed to migrate: " + error.message);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Greeting */}
            <div className="admin-dash-greeting">
                <div>
                    <h1 className="admin-dash-hello">Welcome back, <span>{username}</span></h1>
                    <p className="admin-dash-sub">Here's what's happening with your content.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <button 
                        className="adm-btn primary" 
                        onClick={handleMigrateToFirebase}
                        disabled={isMigrating}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFCA28', color: '#333', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: isMigrating ? 'wait' : 'pointer', fontWeight: '600' }}
                        title="Migrate all data to Firebase Firestore"
                    >
                        <FiUploadCloud size={16} /> {isMigrating ? 'Migrating...' : 'Migrate to Firebase'}
                    </button>
                    <button 
                        className="adm-btn primary" 
                        onClick={handleDownloadBackup}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                        title="Download a full backup of all database content"
                    >
                        <FiDownload size={16} /> Export Backup
                    </button>
                    <div className="admin-dash-total">
                        <span className="admin-dash-total-num">{totalItems}</span>
                        <span className="admin-dash-total-label">Total Items</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="admin-dash-stats-grid">
                {Object.entries(COLLECTION_META).map(([key, meta]) => {
                    const count = Array.isArray(dataStore[key]) ? dataStore[key].length : 0;
                    return (
                        <button
                            key={key}
                            className="admin-dash-stat-card"
                            onClick={() => onNavigate(key)}
                            id={`dash-stat-${key}`}
                        >
                            <div className="admin-dash-stat-icon" style={{ background: `${meta.color}18`, color: meta.color }}>
                                {meta.icon}
                            </div>
                            <div className="admin-dash-stat-info">
                                <span className="admin-dash-stat-count">{count}</span>
                                <span className="admin-dash-stat-label">{meta.label}</span>
                            </div>
                            <div className="admin-dash-stat-footer">
                                Manage {meta.label.toLowerCase()} <FiArrowRight />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Two-column: Recent + What's New */}
            <div className="admin-dash-columns">
                {/* Recently Updated */}
                <div className="admin-dash-panel">
                    <div className="admin-dash-panel-header">
                        <FiClock size={16} />
                        <h3>Recently Updated</h3>
                    </div>
                    <div className="admin-dash-panel-list">
                        {recentItems.length === 0 ? (
                            <p className="admin-dash-empty">No items yet. Start creating!</p>
                        ) : recentItems.map((item, i) => {
                            const meta = COLLECTION_META[item._collection] || {};
                            return (
                                <div key={item.id || i} className="admin-dash-activity-row" onClick={() => onNavigate(item._collection)}>
                                    <div className="admin-dash-activity-dot" style={{ background: meta.color || 'var(--text-muted)' }} />
                                    <div className="admin-dash-activity-info">
                                        <span className="admin-dash-activity-title">{item.title || item.variants?.[0]?.text?.slice(0, 40) || 'Untitled'}</span>
                                        <span className="admin-dash-activity-meta">{meta.label} · {formatDate(item.date)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* What's New (Last 7 days) */}
                <div className="admin-dash-panel">
                    <div className="admin-dash-panel-header">
                        <FiZap size={16} />
                        <h3>What's New</h3>
                        <span className="admin-dash-badge">{newItems.length}</span>
                    </div>
                    <div className="admin-dash-panel-list">
                        {newItems.length === 0 ? (
                            <p className="admin-dash-empty">Nothing new in the last 7 days.</p>
                        ) : newItems.slice(0, 8).map((item, i) => {
                            const meta = COLLECTION_META[item._collection] || {};
                            return (
                                <div key={item.id || i} className="admin-dash-activity-row" onClick={() => onNavigate(item._collection)}>
                                    <div className="admin-dash-activity-dot" style={{ background: meta.color || 'var(--text-muted)' }} />
                                    <div className="admin-dash-activity-info">
                                        <span className="admin-dash-activity-title">{item.title || item.variants?.[0]?.text?.slice(0, 40) || 'Untitled'}</span>
                                        <span className="admin-dash-activity-meta">{meta.label} · {formatDate(item.date)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
