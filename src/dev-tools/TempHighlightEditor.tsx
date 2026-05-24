// @ts-nocheck
import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiPlus, FiTrash2, FiCheckSquare, FiSquare, FiArrowUp, FiArrowDown, FiPlay, FiImage, FiX } from 'react-icons/fi';

interface Story {
    id: string;
    url: string;
    type?: string;
    date?: string;
    timestamp?: number;
    group?: string;
    caption?: string;
    index?: number;
}

interface Highlight {
    id: string;
    title: string;
    cover: string;
    stories: Story[];
}

interface Props {
    initialHighlights: Highlight[];
}

const TempHighlightEditor: React.FC<Props> = ({ initialHighlights }) => {
    const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights || []);
    const [jsonOutput, setJsonOutput] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [draggedItem, setDraggedItem] = useState<{hIndex: number, sIndex: number} | null>(null);
    const [previewStory, setPreviewStory] = useState<Story | null>(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const moveHighlightUp = (index: number) => {
        if (index === 0) return;
        const newArr = [...highlights];
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
        setHighlights(newArr);
    };

    const moveHighlightDown = (index: number) => {
        if (index === highlights.length - 1) return;
        const newArr = [...highlights];
        [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
        setHighlights(newArr);
    };

    const updateHighlightTitle = (index: number, newTitle: string) => {
        const newArr = [...highlights];
        newArr[index] = { ...newArr[index], title: newTitle };
        setHighlights(newArr);
    };

    const sortStories = (hIndex: number, direction: 'asc' | 'desc') => {
        const newArr = [...highlights];
        let stories = [...newArr[hIndex].stories];
        
        // Remove duplicates by ID
        const seen = new Set();
        stories = stories.filter(s => {
            if (seen.has(s.id)) return false;
            seen.add(s.id);
            return true;
        });

        stories.sort((a, b) => {
            const timeA = a.timestamp || new Date(a.date).getTime() || 0;
            const timeB = b.timestamp || new Date(b.date).getTime() || 0;
            return direction === 'asc' ? timeA - timeB : timeB - timeA;
        });
        
        newArr[hIndex] = { ...newArr[hIndex], stories };
        setHighlights(newArr);
    };

    const createHighlight = () => {
        const title = prompt("Enter new highlight name:");
        if (!title) return;
        
        const newHighlight = {
            id: title.replace(/\s+/g, '_') + '_' + generateId(),
            title: title,
            cover: 'https://via.placeholder.com/150',
            stories: []
        };
        setHighlights([newHighlight, ...highlights]);
    };

    const deleteHighlight = (index: number) => {
        if (window.confirm("Delete this highlight? Stories inside will be lost unless moved.")) {
            const newArr = [...highlights];
            newArr.splice(index, 1);
            setHighlights(newArr);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const selectAllInHighlight = (hIndex: number) => {
        const hStoryIds = highlights[hIndex].stories.map(s => s.id);
        const allSelected = hStoryIds.every(id => selectedIds.includes(id));
        
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !hStoryIds.includes(id)));
        } else {
            const newIds = new Set([...selectedIds, ...hStoryIds]);
            setSelectedIds(Array.from(newIds));
        }
    };

    const bulkMove = (toHighlightId: string) => {
        if (!toHighlightId || selectedIds.length === 0) return;
        
        let newHighlights = JSON.parse(JSON.stringify(highlights));
        const toIndex = newHighlights.findIndex(h => h.id === toHighlightId);
        if (toIndex === -1) return;

        const storiesToMove: Story[] = [];
        
        newHighlights = newHighlights.map(hl => {
            const remaining = hl.stories.filter(s => !selectedIds.includes(s.id));
            const removed = hl.stories.filter(s => selectedIds.includes(s.id));
            storiesToMove.push(...removed);
            return { ...hl, stories: remaining };
        });

        storiesToMove.forEach(s => s.group = newHighlights[toIndex].title);
        newHighlights[toIndex].stories.unshift(...storiesToMove);
        
        if (newHighlights[toIndex].cover.includes('via.placeholder') && storiesToMove.length > 0) {
            newHighlights[toIndex].cover = storiesToMove[0].url;
        }

        setHighlights(newHighlights);
        setSelectedIds([]); 
    };

    const moveStory = (fromHighlightIndex: number, storyIndex: number, toHighlightId: string) => {
        if (!toHighlightId) return;

        const newHighlights = JSON.parse(JSON.stringify(highlights)); // deep copy
        
        const toHighlightIndex = newHighlights.findIndex(h => h.id === toHighlightId);
        if (toHighlightIndex === -1 || toHighlightIndex === fromHighlightIndex) return;

        const [story] = newHighlights[fromHighlightIndex].stories.splice(storyIndex, 1);
        story.group = newHighlights[toHighlightIndex].title;
        newHighlights[toHighlightIndex].stories.unshift(story);

        if (newHighlights[toHighlightIndex].stories.length === 1 || newHighlights[toHighlightIndex].cover.includes('via.placeholder')) {
             newHighlights[toHighlightIndex].cover = story.url;
        }

        setHighlights(newHighlights);
    };

    const setAsCover = (highlightIndex: number, storyUrl: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newArr = [...highlights];
        newArr[highlightIndex].cover = storyUrl;
        setHighlights(newArr);
    };

    // Drag & Drop
    const onDragStart = (e: React.DragEvent, hIndex: number, sIndex: number) => {
        setDraggedItem({ hIndex, sIndex });
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (e: React.DragEvent, dropHIndex: number, dropSIndex: number) => {
        e.preventDefault();
        if (!draggedItem) return;
        
        const { hIndex: dragHIndex, sIndex: dragSIndex } = draggedItem;
        if (dragHIndex === dropHIndex && dragSIndex === dropSIndex) {
            setDraggedItem(null);
            return;
        }
        
        const newHighlights = JSON.parse(JSON.stringify(highlights));
        const [moved] = newHighlights[dragHIndex].stories.splice(dragSIndex, 1);
        
        if (dragHIndex !== dropHIndex) {
            moved.group = newHighlights[dropHIndex].title;
        }
        
        newHighlights[dropHIndex].stories.splice(dropSIndex, 0, moved);
        setHighlights(newHighlights);
        setDraggedItem(null);
    };

    // Container drop (if dropping into an empty highlight or end of list)
    const onDropContainer = (e: React.DragEvent, dropHIndex: number) => {
        e.preventDefault();
        if (!draggedItem) return;
        
        const { hIndex: dragHIndex, sIndex: dragSIndex } = draggedItem;
        
        // Only handle if dropped directly on container background
        if ((e.target as HTMLElement).className.includes('stories-container')) {
            const newHighlights = JSON.parse(JSON.stringify(highlights));
            const [moved] = newHighlights[dragHIndex].stories.splice(dragSIndex, 1);
            
            if (dragHIndex !== dropHIndex) {
                moved.group = newHighlights[dropHIndex].title;
            }
            
            newHighlights[dropHIndex].stories.push(moved);
            setHighlights(newHighlights);
        }
        setDraggedItem(null);
    };

    const generateJSON = () => {
        const cleaned = highlights.map(h => {
            const finalH = { ...h, id: h.title.replace(/\s+/g, '_') };
            if (finalH.stories.length > 0 && finalH.cover.includes('via.placeholder')) {
                finalH.cover = finalH.stories[0].url;
            }
            return finalH;
        });
        setJsonOutput(JSON.stringify(cleaned, null, 4));
    };

    return (
        <div style={{ background: '#1c1a1f', padding: '20px', margin: '20px auto', maxWidth: '935px', borderRadius: '12px', border: '1px solid #49454f' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ color: '#e6e1e6', fontWeight: 600, margin: 0 }}>Advanced Highlights Manager (Dev Tool)</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    
                    {selectedIds.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3e3852', padding: '4px 8px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#e6e1e6', fontWeight: 'bold' }}>{selectedIds.length} Selected</span>
                            <select 
                                value=""
                                onChange={(e) => bulkMove(e.target.value)}
                                style={{ padding: '6px', fontSize: '13px', background: '#2a282e', color: '#e6e1e6', border: '1px solid #49454f', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                <option value="" disabled>Bulk Move to...</option>
                                {highlights.map(hl => <option key={hl.id} value={hl.id}>{hl.title}</option>)}
                            </select>
                            <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', color: '#ffb4ab', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Clear</button>
                        </div>
                    )}

                    <button onClick={createHighlight} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3e3852', color: '#e6e1e6', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        <FiPlus /> New Highlight
                    </button>
                    <button onClick={generateJSON} style={{ background: '#c9c5ff', color: '#1b1a4e', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                        Generate Final JSON
                    </button>
                </div>
            </div>

            {jsonOutput && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: '#81c995', marginBottom: '8px', fontWeight: 600 }}>Success! Copy the JSON below and paste it to me:</div>
                    <textarea 
                        value={jsonOutput} 
                        readOnly 
                        style={{ width: '100%', height: '200px', background: '#0f0d13', color: '#e6e1e6', padding: '12px', border: '1px solid #49454f', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px' }}
                    />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {highlights.map((hl, hIndex) => {
                    const hStoryIds = hl.stories.map(s => s.id);
                    const allSelected = hStoryIds.length > 0 && hStoryIds.every(id => selectedIds.includes(id));
                    const someSelected = hStoryIds.some(id => selectedIds.includes(id));

                    return (
                    <div key={hl.id} style={{ background: '#2a282e', padding: '16px', borderRadius: '12px', border: '1px solid #49454f' }}>
                        {/* Highlight Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #c9c5ff' }}>
                                {hl.cover.endsWith('.mp4') ? (
                                    <video src={hl.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                ) : (
                                    <img src={hl.cover} alt={hl.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) }
                            </div>
                            <input 
                                value={hl.title} 
                                onChange={(e) => updateHighlightTitle(hIndex, e.target.value)}
                                style={{ flex: 1, minWidth: '150px', background: '#0f0d13', border: '1px solid #49454f', color: '#e6e1e6', padding: '8px 12px', borderRadius: '6px', fontSize: '16px', fontWeight: 600 }}
                            />
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button onClick={() => sortStories(hIndex, 'asc')} title="Sort Date Ascending" style={{ padding: '6px', background: '#3e3852', color: '#e6e1e6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                    <FiArrowUp /> ASC
                                </button>
                                <button onClick={() => sortStories(hIndex, 'desc')} title="Sort Date Descending" style={{ padding: '6px', background: '#3e3852', color: '#e6e1e6', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                    <FiArrowDown /> DESC
                                </button>
                                <div style={{ width: '1px', height: '20px', background: '#49454f', margin: '0 4px' }}></div>
                                <button onClick={() => selectAllInHighlight(hIndex)} style={{ padding: '6px 10px', background: '#3e3852', color: '#e6e1e6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {allSelected ? <FiCheckSquare color="#c9c5ff" /> : someSelected ? <FiSquare fill="#49454f" /> : <FiSquare />} 
                                    Select All
                                </button>
                                <div style={{ width: '1px', height: '20px', background: '#49454f', margin: '0 4px' }}></div>
                                <button onClick={() => moveHighlightUp(hIndex)} disabled={hIndex === 0} style={{ padding: '8px', background: hIndex === 0 ? 'transparent' : '#3e3852', color: '#e6e1e6', border: 'none', borderRadius: '6px', cursor: hIndex === 0 ? 'not-allowed' : 'pointer', opacity: hIndex === 0 ? 0.3 : 1 }}>
                                    <FiChevronUp />
                                </button>
                                <button onClick={() => moveHighlightDown(hIndex)} disabled={hIndex === highlights.length - 1} style={{ padding: '8px', background: hIndex === highlights.length - 1 ? 'transparent' : '#3e3852', color: '#e6e1e6', border: 'none', borderRadius: '6px', cursor: hIndex === highlights.length - 1 ? 'not-allowed' : 'pointer', opacity: hIndex === highlights.length - 1 ? 0.3 : 1 }}>
                                    <FiChevronDown />
                                </button>
                                <button onClick={() => deleteHighlight(hIndex)} style={{ padding: '8px', background: '#93000a', color: '#ffb4ab', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>

                        {/* Stories Grid */}
                        <div 
                            className="stories-container"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDropContainer(e, hIndex)}
                            style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', minHeight: '180px', alignItems: 'flex-start' }}
                        >
                            {hl.stories.length === 0 ? (
                                <div className="stories-container" style={{ color: '#938f99', fontStyle: 'italic', padding: '20px', width: '100%', pointerEvents: 'none' }}>Drag stories here...</div>
                            ) : (
                                hl.stories.map((story, sIndex) => {
                                    const isSelected = selectedIds.includes(story.id);
                                    return (
                                        <div 
                                            key={story.id} 
                                            draggable
                                            onDragStart={(e) => onDragStart(e, hIndex, sIndex)}
                                            onDragOver={onDragOver}
                                            onDrop={(e) => onDrop(e, hIndex, sIndex)}
                                            onClick={() => toggleSelect(story.id)}
                                            style={{ 
                                                width: '120px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', 
                                                background: isSelected ? '#3e3852' : '#0f0d13', 
                                                padding: '8px', borderRadius: '8px', cursor: 'grab',
                                                border: isSelected ? '2px solid #c9c5ff' : '2px solid transparent',
                                                transition: 'all 0.1s'
                                            }}
                                        >
                                            <div style={{ width: '100%', height: '160px', borderRadius: '4px', overflow: 'hidden', background: '#1c1a1f', position: 'relative' }}>
                                                {story.url.endsWith('.mp4') ? (
                                                    <video src={story.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                                ) : (
                                                    <img src={story.url} alt="story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                )}
                                                <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '2px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleSelect(story.id); }}>
                                                    {isSelected ? <FiCheckSquare color="#c9c5ff" size={16} /> : <FiSquare color="#e6e1e6" size={16} />}
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setPreviewStory(story); }}
                                                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', opacity: 0.8 }}
                                                >
                                                    {story.url.endsWith('.mp4') ? <FiPlay size={18} style={{ marginLeft: '2px' }} /> : <FiImage size={18} />}
                                                </button>
                                            </div>
                                            <select 
                                                value=""
                                                onChange={(e) => { e.stopPropagation(); moveStory(hIndex, sIndex, e.target.value); }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{ width: '100%', padding: '4px', fontSize: '11px', background: '#3e3852', color: '#e6e1e6', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}
                                            >
                                                <option value="" disabled>Move to...</option>
                                                {highlights.map(targetHl => (
                                                    targetHl.id !== hl.id && (
                                                        <option key={targetHl.id} value={targetHl.id}>{targetHl.title}</option>
                                                    )
                                                ))}
                                            </select>
                                            <button 
                                                onClick={(e) => setAsCover(hIndex, story.url, e)}
                                                style={{ fontSize: '10px', background: 'transparent', color: '#c9c5ff', border: '1px solid #c9c5ff', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                                            >
                                                Set as Cover
                                            </button>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )})}
            </div>

            {/* PREVIEW MODAL */}
            {previewStory && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewStory(null)}>
                    <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px' }} onClick={() => setPreviewStory(null)}>
                        <FiX size={32} />
                    </button>
                    <div style={{ maxWidth: '90%', maxHeight: '90vh', background: '#000', borderRadius: '8px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                        {previewStory.url.endsWith('.mp4') ? (
                            <video src={previewStory.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />
                        ) : (
                            <img src={previewStory.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />
                        )}
                        <div style={{ padding: '12px', background: '#1c1a1f', color: '#e6e1e6', fontSize: '12px', textAlign: 'center' }}>
                            {previewStory.caption || 'No caption'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TempHighlightEditor;
