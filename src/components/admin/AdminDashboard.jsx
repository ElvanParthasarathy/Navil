import React from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBookOpen, FiBook, FiSun, FiClock, FiTrendingUp, FiZap, FiArrowRight } from 'react-icons/fi';

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

    return (
        <div className="admin-dashboard">
            {/* Greeting */}
            <div className="admin-dash-greeting">
                <div>
                    <h1 className="admin-dash-hello">Welcome back, <span>{username}</span></h1>
                    <p className="admin-dash-sub">Here's what's happening with your content.</p>
                </div>
                <div className="admin-dash-total">
                    <span className="admin-dash-total-num">{totalItems}</span>
                    <span className="admin-dash-total-label">Total Items</span>
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
