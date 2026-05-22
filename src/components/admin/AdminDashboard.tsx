import React, { useState } from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBook, FiImage, FiClock, FiTrendingUp, FiZap, FiArrowRight, FiDownload, FiUploadCloud, FiSliders, FiFeather, FiAnchor } from 'react-icons/fi';
import { db } from '../../lib/firebaseClient';
import { ref, get } from 'firebase/database';

const COLLECTION_META = {
    quotes: { label: 'Quotes', icon: <FiMessageCircle size={20} />, color: '#d4af37' },
    poems: { label: 'Poems', icon: <FiPenTool size={20} />, color: '#7C5CFC' },
    blog: { label: 'Blog', icon: <FiEdit3 size={20} />, color: '#FF6B6B' },
    articles: { label: 'Articles', icon: <FiFileText size={20} />, color: '#4ECDC4' },
    stories: { label: 'Stories', icon: <FiBook size={20} />, color: '#96CEB4' },
    diary: { label: 'Diary', icon: <FiBook size={20} />, color: '#DDA0DD' },
    art_pencil: { label: 'Pencil Drawings', icon: <FiEdit3 size={20} />, color: '#B0C4DE' },
    art_editing: { label: 'Editings', icon: <FiSliders size={20} />, color: '#87CEFA' },
    art_poster: { label: 'Posters', icon: <FiFileText size={20} />, color: '#FFA07A' },
    art_painting: { label: 'Paintings', icon: <FiFeather size={20} />, color: '#FFD700' },
    art_quotes: { label: 'Visual Quotes', icon: <FiMessageCircle size={20} />, color: '#FFE4E1' },
    art_poems: { label: 'Visual Poems', icon: <FiPenTool size={20} />, color: '#D8BFD8' },
    art_illustrations: { label: 'Illustrations', icon: <FiAnchor size={20} />, color: '#7FFFD4' },
    art_digital_arts: { label: 'Digital Arts', icon: <FiImage size={20} />, color: '#FF85A2' },
};

interface DashboardItem {
    id?: string;
    title?: string;
    date?: string;
    _collection: string;
    variants?: any[];
}

const AdminDashboard = ({ dataStore, username, onNavigate }: { 
    dataStore: any, 
    username: string, 
    onNavigate: (tab: string) => void
}) => {

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
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
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
    const recentItems = (Object.values(latestPerCollection) as DashboardItem[]).sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    // Items added in last 7 days (also limited to 1 per collection)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newItems: DashboardItem[] = [];
    (Object.values(latestPerCollection) as DashboardItem[]).forEach(item => {
        if (item.date && new Date(item.date).getTime() >= sevenDaysAgo.getTime()) {
            newItems.push(item);
        }
    });

    // Sort new items by date as well
    newItems.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    const totalItems = allItems.length;

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadBackup = async () => {
        try {
            setIsDownloading(true);
            const snapshot = await get(ref(db));
            const rawData = snapshot.val() || {};
            
            const dataStr = JSON.stringify(rawData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `elvan_firebase_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Backup failed:", error);
            alert("Failed to generate backup: " + error.message);
        } finally {
            setIsDownloading(false);
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
                        onClick={handleDownloadBackup}
                        disabled={isDownloading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: isDownloading ? 'wait' : 'pointer', fontWeight: '500', opacity: isDownloading ? 0.7 : 1 }}
                        title="Download a full backup of all database content"
                    >
                        <FiDownload size={16} /> {isDownloading ? 'Fetching Data...' : 'Export Backup'}
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
