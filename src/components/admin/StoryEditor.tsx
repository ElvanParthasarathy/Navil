import React, { useState, useMemo } from 'react';
import { VariantListEditor } from './VariantListEditor';
import { FiFolder, FiArrowLeft } from 'react-icons/fi';

export const StoryEditor = (props) => {
    const { items, editingId } = props;
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);

    const folders = useMemo(() => {
        const f = new Map();
        items?.forEach(item => {
            const seriesName = item.series_name?.trim() || 'Standalone Stories';
            if (!f.has(seriesName)) {
                f.set(seriesName, { name: seriesName, count: 0, latestDate: item.date || item.publish_date || new Date().toISOString() });
            }
            f.get(seriesName).count++;
            const currentDate = new Date(item.date || item.publish_date || new Date().toISOString());
            const latestDate = new Date(f.get(seriesName).latestDate);
            if (currentDate > latestDate) {
                f.get(seriesName).latestDate = currentDate.toISOString();
            }
        });
        return Array.from(f.values()).sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
    }, [items]);

    const filteredItems = useMemo(() => {
        if (!currentFolder) return [];
        return items?.filter(item => {
            const seriesName = item.series_name?.trim() || 'Standalone Stories';
            return seriesName === currentFolder;
        }) || [];
    }, [items, currentFolder]);

    if (editingId) {
        return <VariantListEditor {...props} collection="stories" />;
    }

    if (currentFolder) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <button className="adm-btn ghost" onClick={() => setCurrentFolder(null)}>
                        <FiArrowLeft size={16} /> Back to Folders
                    </button>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{currentFolder}</h2>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <VariantListEditor 
                        {...props} 
                        collection="stories" 
                        items={filteredItems}
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Story Folders</h2>
                <button className="adm-btn primary" onClick={() => props.onAddItem('stories')}>+ New Story</button>
            </div>
            {folders.length === 0 ? (
                <div className="admin-file-empty">No stories found. Click "New Story" to create one.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {folders.map(folder => (
                        <div 
                            key={folder.name} 
                            onClick={() => setCurrentFolder(folder.name)}
                            style={{
                                background: 'var(--bg-panel)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ 
                                    width: '56px', height: '56px', 
                                    background: 'color-mix(in srgb, var(--accent) 15%, transparent)', 
                                    borderRadius: '12px', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: 'var(--accent)',
                                    flexShrink: 0
                                }}>
                                    <FiFolder size={28} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>{folder.name}</h3>
                                    <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {folder.count} episode{folder.count !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
