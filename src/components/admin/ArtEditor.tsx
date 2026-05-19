import React, { useState } from 'react';
import { StandardListEditor } from './StandardListEditor';
import { db } from '../../lib/firebaseClient';
import { ref, set, get } from 'firebase/database';
import artsJsonData from '../../data/arts.json';

export const ArtEditor = (props) => {
    const [seedStatus, setSeedStatus] = useState('');

    const seedFromJson = async () => {
        if (!confirm('This will add all items from arts.json to Firebase. Existing items with the same ID will be overwritten. Continue?')) return;
        
        setSeedStatus('Seeding...');
        try {
            const artsRef = ref(db, 'arts');
            const snapshot = await get(artsRef);
            const existing = snapshot.exists() ? snapshot.val() : {};

            const merged = { ...existing };
            (artsJsonData || []).forEach(item => {
                // Ensure images is always an array
                const images = Array.isArray(item.images) ? item.images : [item.image].filter(Boolean);
                merged[item.id] = {
                    ...item,
                    images,
                    image: item.image || images[0] || '',
                    type: item.type || 'image',
                    category: item.category || 'pencil',
                    timestamp: item.timestamp || Date.now(),
                };
            });

            await set(artsRef, merged);
            setSeedStatus(`✅ Seeded ${artsJsonData.length} items!`);
            setTimeout(() => setSeedStatus(''), 3000);
            
            // Trigger a re-fetch by reloading the page
            window.location.reload();
        } catch (err) {
            console.error('Seed error:', err);
            setSeedStatus(`❌ Error: ${err.message}`);
            setTimeout(() => setSeedStatus(''), 5000);
        }
    };

    return (
        <div>
            {/* Seed Banner */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'color-mix(in srgb, var(--text-main) 4%, transparent)',
                borderRadius: '12px',
                marginBottom: '16px',
                flexWrap: 'wrap',
            }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1 }}>
                    💡 First time? Seed existing arts.json data into Firebase.
                </span>
                <button
                    onClick={seedFromJson}
                    disabled={seedStatus === 'Seeding...'}
                    style={{
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: '1px solid var(--border-light)',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {seedStatus || '🌱 Seed from JSON'}
                </button>
            </div>
            
            <StandardListEditor {...props} collection={props.collection || "arts"} />
        </div>
    );
};
