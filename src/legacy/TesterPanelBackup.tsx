// @ts-nocheck
// @ts-nocheck
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CloudArrowUp, Trash } from '@phosphor-icons/react';

// ─── TESTER PANEL COMPONENT ───
export const TesterPanelBackup = ({ dataStore, setDataStore, setStatus, setMessage, autoThumbnails, setAutoThumbnails, onMasterSave }) => {
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
                    <button className="adm-btn danger" onClick={() => {
                        let totalCleaned = 0;
                        const newDataStore = { ...dataStore };
                        Object.keys(newDataStore).forEach(key => {
                            newDataStore[key] = newDataStore[key].map(item => {
                                if (item.cover_image && item.cover_image.includes('picsum.photos')) {
                                    const newItem = { ...item };
                                    delete newItem.cover_image;
                                    totalCleaned++;
                                    return newItem;
                                }
                                return item;
                            });
                        });
                        setDataStore(newDataStore);
                        setMessage(`Cleaned picsum thumbnails from ${totalCleaned} items. Click Save to commit.`);
                        setStatus('success');
                        setTimeout(() => setMessage(''), 5000);
                    }} style={{ background: '#f57c00', color: 'white', border: 'none' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Clean Picsum DB Thumbs
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
                        <CloudArrowUp weight="regular" size={16} /> Save All (Commit to Live)
                    </button>
                </div>
                
                <div className="adm-alert info" style={{ marginTop: '16px', background: 'color-mix(in srgb, var(--text-main) 10%, transparent)', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Note:</strong> Generating or clearing mocks only updates your local unsaved draft. You still need to click <strong style={{ color: 'var(--text-main)' }}>"Save All Changes"</strong> in the main dashboard to push these changes to Firebase.
                </div>
            </div>
        </div>
    );
};
