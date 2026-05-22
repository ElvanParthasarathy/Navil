// @ts-nocheck
import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiChevronUp, FiChevronDown, FiCopy, FiMove, FiChevronRight } from 'react-icons/fi';
import { SCHEMAS, renderFieldRow, FieldInput, PinEditor, VariantCard } from './AdminShared';
import { ConfirmDialog } from './ConfirmDialog';
import RichTextEditor from './RichTextEditor';
import { getOptimizedImage } from '../../lib/media';

const getCoverImageUrl = (listItem: any) => {
    if (!listItem) return '';
    const raw = listItem.cover_image || listItem.image || '';
    return raw ? getOptimizedImage(raw, 'thumb') : '';
};

// Classification colors — preset for known types, auto-generated for custom
const CLASSIFICATION_COLORS = { 'அகம்': '#e8a0bf', 'புறம்': '#d4af37' };
const getClassColor = (name) => {
    if (!name) return '#888';
    if (CLASSIFICATION_COLORS[name]) return CLASSIFICATION_COLORS[name];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${((hash % 360) + 360) % 360}, 55%, 60%)`;
};

export const VariantListEditor = ({
    items,
    collection,
    editingId,
    setEditingId,
    handleCloseEditor,
    onAddItem,
    onSave,
    saveStatus,
    updateItemField,
    moveItem,
    deleteItem,
    addVariant,
    updateVariant,
    removeVariant,
    moveVariant,
    updateTransliteration,
    toggleTransliterationLang,
    defaultAuthors,
    onMoveItems,
    onCopyItems
}) => {
    const [confirmState, setConfirmState] = useState({ open: false, type: '', payload: null });
    const [selected, setSelected] = useState(new Set());
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ core: true, meta: false, variants: true });

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ── Selection helpers ──
    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = (e) => {
        if (e) e.stopPropagation();
        if (selected.size === items?.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(items?.map(i => i.id)));
        }
    };

    const clearSelection = () => setSelected(new Set());

    // ── Confirm dialogs ──
    const requestDelete = (e, index) => {
        e.stopPropagation();
        const title = SCHEMAS[collection].getItemTitle(items[index]);
        setConfirmState({
            open: true, type: 'item',
            title: 'Delete Entry',
            message: `Delete "${title}"? Save afterwards to commit.`,
            payload: { index }
        });
    };

    const requestRemoveVariant = (itemIndex, variantIndex) => {
        setConfirmState({
            open: true, type: 'variant',
            title: 'Remove Variant',
            message: `Remove variant ${variantIndex + 1}? Save afterwards to commit.`,
            payload: { itemIndex, variantIndex }
        });
    };

    const requestBulkDelete = () => {
        const count = selected.size;
        setConfirmState({
            open: true, type: 'bulk-delete',
            title: `Delete ${count} Item${count > 1 ? 's' : ''}`,
            message: `Delete ${count} selected item${count > 1 ? 's' : ''}? Save afterwards to commit.`,
            payload: { ids: [...selected] }
        });
    };

    const handleConfirm = () => {
        if (confirmState.type === 'item') {
            deleteItem(collection, confirmState.payload.index);
            if (editingId === items[confirmState.payload.index]?.id) setEditingId(null);
        } else if (confirmState.type === 'variant') {
            removeVariant(collection, confirmState.payload.itemIndex, confirmState.payload.variantIndex);
        } else if (confirmState.type === 'bulk-delete') {
            const ids = confirmState.payload.ids;
            const indices = ids.map(id => items.findIndex(i => i.id === id)).filter(i => i >= 0).sort((a, b) => b - a);
            indices.forEach(idx => deleteItem(collection, idx));
            clearSelection();
        }
        setConfirmState({ open: false, type: '', payload: null });
    };

    const editingIndex = items?.findIndex(item => item.id === editingId);
    const item = editingIndex >= 0 ? items[editingIndex] : null;

    const writingCollections = ['quotes', 'poems', 'blog', 'articles', 'stories', 'diary'];
    const artsCollections = [
        'art_pencil',
        'art_editing',
        'art_poster',
        'art_painting',
        'art_quotes',
        'art_poems',
        'art_illustrations',
        'art_digital_arts'
    ];

    const getTargetCollections = (currentColl) => {
        if (currentColl === 'quotes') return ['poems'];
        if (currentColl === 'poems') return ['quotes'];
        if (writingCollections.includes(currentColl)) return [];
        if (currentColl === 'arts') {
            return artsCollections;
        }
        if (artsCollections.includes(currentColl)) {
            return artsCollections.filter(c => c !== currentColl);
        }
        return [];
    };

    const targetCollections = getTargetCollections(collection);

    return (
        <div className="admin-content-area">
            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onCancel={() => setConfirmState({ open: false, type: '', payload: null })}
                onProceed={handleConfirm}
            />

            <style>{`
                .bulk-toolbar {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 8px 16px; gap: 12px;
                    background: color-mix(in srgb, var(--accent, #088370) 12%, transparent);
                    border-bottom: 1px solid color-mix(in srgb, var(--accent, #088370) 25%, transparent);
                    flex-wrap: wrap;
                }
                .bulk-toolbar-left {
                    display: flex; align-items: center; gap: 10px;
                }
                .bulk-toolbar-left input[type="checkbox"] {
                    width: 16px; height: 16px; accent-color: var(--accent, #088370); cursor: pointer;
                }
                .bulk-count {
                    font-size: 0.85rem; font-weight: 600; color: var(--text-main);
                }
                .bulk-toolbar-right {
                    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
                }
                .bulk-select {
                    padding: 5px 10px !important; font-size: 0.8rem !important;
                    border-radius: 8px !important; min-height: unset !important;
                    max-width: 140px; cursor: pointer;
                }
                .admin-file-row-checkbox {
                    display: flex; align-items: center; justify-content: center;
                    padding: 0 4px 0 0; flex-shrink: 0;
                }
                .admin-file-row-checkbox input[type="checkbox"] {
                    width: 16px; height: 16px; accent-color: var(--accent, #088370); cursor: pointer;
                }
                .admin-file-row.selected {
                    background: color-mix(in srgb, var(--accent, #088370) 8%, transparent) !important;
                }
                .admin-file-row-thumbnail {
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    overflow: hidden;
                    background: var(--bg-panel, #111);
                    border: 1px solid var(--border-light, #333);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .admin-file-row-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .select-all-hint {
                    display: flex; align-items: center; gap: 10px;
                    padding: 6px 16px; font-size: 0.8rem; color: var(--text-muted);
                    cursor: pointer; opacity: 0.5; transition: opacity 0.2s;
                }
                .select-all-hint:hover { opacity: 1; }
                .select-all-hint input[type="checkbox"] {
                    width: 14px; height: 14px; accent-color: var(--accent, #088370); cursor: pointer;
                }
                .admin-file-row-meta {
                    display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px;
                }
                .row-pin-badge {
                    font-size: 0.75rem;
                }
                .row-class-badge {
                    display: inline-flex; align-items: center;
                    font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
                    padding: 2px 8px; border-radius: 99px;
                    background: color-mix(in srgb, currentColor 15%, transparent);
                }
                .row-lang-dots {
                    display: inline-flex; align-items: center; gap: 3px;
                }
                .row-lang-dot {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 20px; height: 20px; border-radius: 50%;
                    font-size: 0.55rem; font-weight: 700;
                    background: color-mix(in srgb, var(--text-main, #eee) 8%, transparent);
                    color: var(--text-muted, #888);
                }
                .row-tag-pill {
                    display: inline-flex; align-items: center;
                    font-size: 0.65rem; font-weight: 600;
                    padding: 1px 7px; border-radius: 99px;
                    background: color-mix(in srgb, var(--accent, #088370) 12%, transparent);
                    color: var(--text-muted, #aaa);
                }
                .row-date {
                    font-size: 0.7rem; color: var(--text-muted, #666); font-weight: 500;
                    margin-left: 2px;
                }
                @media (max-width: 600px) {
                    .bulk-toolbar { flex-direction: column; align-items: flex-start; }
                    .bulk-toolbar-right { width: 100%; }
                    .bulk-select { max-width: 100%; flex: 1; }
                    .admin-file-row-meta { gap: 4px; }
                    .row-class-badge, .row-tag-pill { font-size: 0.6rem; }
                }
            `}</style>

            {/* Show EITHER the list OR the editor — file explorer pattern */}
            {!item ? (
                /* ── FILE LIST VIEW ── */
                <div className="admin-file-list">
                    <div className="admin-file-list-header">
                        <h2>{SCHEMAS[collection].label} ({items?.length || 0})</h2>
                        <div className="admin-file-list-actions">
                            <button className="adm-btn" onClick={onAddItem}><FiPlus size={16} /> Add New</button>
                            <button className="adm-btn primary" onClick={onSave}>
                                {saveStatus === 'loading' ? 'Saving...' : <><FiSave size={16} /> Save</>}
                            </button>
                        </div>
                    </div>

                    {/* Bulk Action Toolbar — appears when items selected */}
                    {selected.size > 0 && (
                        <div className="bulk-toolbar">
                            <div className="bulk-toolbar-left">
                                <input type="checkbox" checked={selected.size === items?.length} onChange={toggleSelectAll} title="Select All" />
                                <span className="bulk-count">{selected.size} selected</span>
                                <button className="adm-btn ghost small" onClick={clearSelection}>Clear</button>
                            </div>
                            <div className="bulk-toolbar-right">
                                {targetCollections.length > 0 && (
                                    <>
                                        <select className="adm-input bulk-select" defaultValue="" onChange={(e) => {
                                            if (e.target.value && onMoveItems) {
                                                onMoveItems([...selected], collection, e.target.value);
                                                clearSelection();
                                            }
                                            e.target.value = '';
                                        }}>
                                            <option value="" disabled>✂ Move to...</option>
                                            {targetCollections.map(c => (
                                                <option key={c} value={c}>{SCHEMAS[c].label}</option>
                                            ))}
                                        </select>
                                        <select className="adm-input bulk-select" defaultValue="" onChange={(e) => {
                                            if (e.target.value && onCopyItems) {
                                                onCopyItems([...selected], collection, e.target.value);
                                                clearSelection();
                                            }
                                            e.target.value = '';
                                        }}>
                                            <option value="" disabled>⎘ Copy to...</option>
                                            {targetCollections.map(c => (
                                                <option key={c} value={c}>{SCHEMAS[c].label}</option>
                                            ))}
                                        </select>
                                    </>
                                )}
                                <button className="adm-btn danger small" onClick={requestBulkDelete}>
                                    <FiTrash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="admin-file-list-scroll">
                        {items?.length === 0 ? (
                            <div className="admin-file-empty">No items yet. Click "Add New" to create one.</div>
                        ) : (
                            <>
                                {selected.size === 0 && items?.length > 0 && (
                                    <div className="select-all-hint" onClick={toggleSelectAll}>
                                        <input type="checkbox" checked={false} readOnly />
                                        <span>Select all</span>
                                    </div>
                                )}
                                {items?.map((listItem, index) => {
                                    const isSelected = selected.has(listItem.id);
                                    const itemTags = Array.isArray(listItem.tags) 
                                        ? listItem.tags 
                                        : (typeof listItem.tags === 'string' 
                                            ? listItem.tags.split(',').map(t => t.trim()).filter(Boolean) 
                                            : []);
                                    const coverUrl = getCoverImageUrl(listItem);
                                    return (
                                        <div
                                            key={listItem.id || index}
                                            className={`admin-file-row ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setEditingId(listItem.id)}
                                        >
                                            <div className="admin-file-row-checkbox" onClick={(e) => toggleSelect(listItem.id, e)}>
                                                <input type="checkbox" checked={isSelected} readOnly />
                                            </div>
                                            {coverUrl && (
                                                <div className="admin-file-row-thumbnail">
                                                    <img src={coverUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </div>
                                            )}
                                            <div className="admin-file-row-info">
                                                <h3>{SCHEMAS[collection].getItemTitle(listItem)}</h3>
                                                <div className="admin-file-row-meta">
                                                    {listItem.isPinned && <span className="row-pin-badge">✨</span>}
                                                    {listItem.classification && (
                                                        <span className="row-class-badge" style={{ color: getClassColor(listItem.classification) }}>{listItem.classification}</span>
                                                    )}
                                                    {listItem.variants?.length > 0 && (
                                                        <span className="row-lang-dots">
                                                            {listItem.variants.map((v, vi) => (
                                                                <span key={vi} className="row-lang-dot" title={v.lang}>
                                                                    {{ ta: 'த', ml: 'മ', en: 'Aa', hi: 'हि' }[v.lang] || v.lang}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    )}
                                                    {itemTags.slice(0, 2).map((tag, ti) => (
                                                        <span key={ti} className="row-tag-pill">{tag}</span>
                                                    ))}
                                                    {itemTags.length > 2 && (
                                                        <span className="row-tag-pill" style={{ opacity: 0.5 }}>+{itemTags.length - 2}</span>
                                                    )}
                                                    {(() => {
                                                        const dateStr = listItem.date || listItem.publish_date;
                                                        if (!dateStr) return null;
                                                        const parsed = new Date(dateStr);
                                                        if (isNaN(parsed.getTime())) {
                                                            return <span className="row-date">{dateStr}</span>;
                                                        }
                                                        return <span className="row-date">{parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>;
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="admin-file-row-actions">
                                                <div className="admin-move-controls">
                                                    <button
                                                        className="adm-btn icon-only"
                                                        onClick={(e) => { e.stopPropagation(); moveItem(collection, index, 'up'); }}
                                                        disabled={index === 0}
                                                        title="Move Up"
                                                    >
                                                        <FiChevronUp size={16} />
                                                    </button>
                                                    <button
                                                        className="adm-btn icon-only"
                                                        onClick={(e) => { e.stopPropagation(); moveItem(collection, index, 'down'); }}
                                                        disabled={index === items.length - 1}
                                                        title="Move Down"
                                                    >
                                                        <FiChevronDown size={16} />
                                                    </button>
                                                </div>
                                                <button className="adm-btn icon-only" onClick={(e) => { e.stopPropagation(); setEditingId(listItem.id); }} title="Edit">
                                                    <FiEdit3 size={14} />
                                                </button>
                                                <button className="adm-btn danger" onClick={(e) => requestDelete(e, index)} title="Delete">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                /* ── EDITOR VIEW (replaces list) ── */
                <div className="admin-editor-full">
                    <div className="admin-editor-toolbar">
                        <button className="adm-btn ghost" onClick={() => handleCloseEditor(editingId)}>
                            <FiArrowLeft size={16} /> Back
                        </button>
                        <h2>Edit {SCHEMAS[collection].label.slice(0, -1)}</h2>
                        <div className="admin-editor-toolbar-actions">
                            <button className="adm-btn ghost" onClick={() => handleCloseEditor(editingId)}>
                                Cancel
                            </button>
                            <button className="adm-btn primary" onClick={onSave}>
                                {saveStatus === 'loading' ? 'Saving...' : <><FiSave size={16} /> Save</>}
                            </button>
                        </div>
                    </div>
                    <div className="admin-editor-body">
                        <div className="adm-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Core Details */}
                            <div className="adm-section">
                                <div className="adm-section-header">
                                    <span className="adm-section-title">Core Details</span>
                                </div>
                                <div className="adm-section-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {renderFieldRow(SCHEMAS[collection].itemFields, item, collection, editingIndex, updateItemField)}
                                    <PinEditor item={item} onUpdate={(field, value) => updateItemField(collection, editingIndex, field, value)} idPrefix={`${collection}-${editingIndex}`} />
                                </div>
                            </div>

                            {/* Context & Metadata */}
                            <div className="adm-section">
                                <div className="adm-section-header">
                                    <span className="adm-section-title">Context &amp; Metadata</span>
                                </div>
                                <div className="adm-section-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[SCHEMAS[collection].row2Fields, SCHEMAS[collection].row3Fields].filter(Boolean).map((fieldGroup, gi) => {
                                            const inlineFields = fieldGroup.filter(f => f.type !== 'tags' && f.type !== 'checkbox');
                                            const fullWidthFields = fieldGroup.filter(f => f.type === 'tags' || f.type === 'checkbox');
                                            return (
                                                <React.Fragment key={gi}>
                                                    {inlineFields.length > 0 && renderFieldRow(inlineFields, item, collection, editingIndex, updateItemField)}
                                                    {fullWidthFields.map(f => (
                                                        <div key={f.key} className="adm-field" style={{ marginTop: '8px' }}>
                                                            <label className="adm-label">{f.label}</label>
                                                            {f.type === 'checkbox' ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`row-${f.key}`}
                                                                        checked={!!item[f.key]}
                                                                        onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.checked)}
                                                                    />
                                                                    <label htmlFor={`row-${f.key}`} style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{f.placeholder || 'Enable'}</label>
                                                                </div>
                                                            ) : (
                                                                <FieldInput field={f} value={item[f.key]} onChange={(val) => updateItemField(collection, editingIndex, f.key, val)} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })}

                                        {SCHEMAS[collection].extraFields?.filter(f => !['urai', 'notes', 'writtenFor', 'writtenForPassword'].includes(f.key)).map(f => {
                                            // Hide password and hint fields if lock toggle is not enabled
                                            if (!item.isUraiNotesLocked && (f.key === 'uraiNotesPassword' || f.key === 'uraiNotesPasswordHint')) {
                                                return null;
                                            }
                                            return (
                                            <div key={f.key} className="adm-field">
                                                <label className="adm-label">{f.label}</label>
                                                {f.type === 'richtext' ? (
                                                    <RichTextEditor
                                                        content={item[f.key] || ''}
                                                        onChange={(val) => updateItemField(collection, editingIndex, f.key, val)}
                                                        placeholder={f.placeholder || ''}
                                                    />
                                                ) : f.type === 'textarea' ? (
                                                    <textarea
                                                        className="adm-input"
                                                        style={{ minHeight: f.rows ? `${f.rows * 22}px` : '60px' }}
                                                        value={item[f.key] || ''}
                                                        onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.value)}
                                                        placeholder={f.placeholder || ''}
                                                    />
                                                ) : f.type === 'checkbox' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <input
                                                            type="checkbox"
                                                            id={`extra-${f.key}`}
                                                            checked={item[f.key] !== false}
                                                            onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.checked)}
                                                        />
                                                        <label htmlFor={`extra-${f.key}`} style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{f.placeholder || 'Enable'}</label>
                                                    </div>
                                                ) : (
                                                    <input
                                                        className="adm-input"
                                                        type={f.type || 'text'}
                                                        value={item[f.key] || ''}
                                                        onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.value)}
                                                        placeholder={f.placeholder || ''}
                                                    />
                                                )}
                                            </div>
                                            );
                                        })}
                                    </div>
                            </div>

                            {/* Meaning / Urai & Notes Sections */}
                            {SCHEMAS[collection].extraFields?.filter(f => ['urai', 'notes'].includes(f.key)).map(f => (
                                <div className="adm-section" key={f.key} style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                                    <div 
                                        className={`adm-section-header adm-section-header--collapsible`}
                                        onClick={() => toggleSection(f.key)}
                                        style={{ marginBottom: expandedSections[f.key] ? '16px' : '0' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className="adm-section-title">{f.label}</span>
                                            <div className={`adm-collapse-icon ${expandedSections[f.key] ? 'open' : ''}`}>
                                                <FiChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`adm-collapse-body ${expandedSections[f.key] ? 'open' : ''}`}>
                                        <div className="adm-collapse-body-inner">
                                            <RichTextEditor
                                                content={item[f.key] || ''}
                                                onChange={(val) => updateItemField(collection, editingIndex, f.key, val)}
                                                placeholder={f.placeholder || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Easter Egg / Written For Section */}
                            {SCHEMAS[collection].extraFields?.some(f => f.key === 'writtenFor') && (
                                <div className="adm-section" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                                    <div 
                                        className={`adm-section-header adm-section-header--collapsible`}
                                        onClick={() => toggleSection('writtenForGroup')}
                                        style={{ marginBottom: expandedSections.writtenForGroup ? '16px' : '0' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className="adm-section-title">Written For (Easter Egg)</span>
                                            <div className={`adm-collapse-icon ${expandedSections.writtenForGroup ? 'open' : ''}`}>
                                                <FiChevronRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`adm-collapse-body ${expandedSections.writtenForGroup ? 'open' : ''}`}>
                                        <div className="adm-collapse-body-inner" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div className="adm-field">
                                                <label className="adm-label">Written For (Name)</label>
                                                <input
                                                    className="adm-input"
                                                    type="text"
                                                    value={item.writtenFor || ''}
                                                    onChange={(e) => updateItemField(collection, editingIndex, 'writtenFor', e.target.value)}
                                                    placeholder="Enter name (e.g. Navil)"
                                                />
                                            </div>
                                            <div className="adm-field">
                                                <label className="adm-label">Unlock Password</label>
                                                <input
                                                    className="adm-input"
                                                    type="text"
                                                    value={item.writtenForPassword || ''}
                                                    onChange={(e) => updateItemField(collection, editingIndex, 'writtenForPassword', e.target.value)}
                                                    placeholder="Enter password to unlock name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Language Variants */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 16px 0' }}>
                                <span className="adm-section-title" style={{ fontSize: '1.1rem' }}>Language Variants</span>
                                <button className="adm-btn ghost small" onClick={(e) => { e.stopPropagation(); addVariant(collection, editingIndex); }}>
                                    <FiPlus size={13} /> Add Variant
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {item.variants?.map((variant, vIndex) => (
                                    <VariantCard
                                        key={vIndex}
                                        variant={variant}
                                        vIndex={vIndex}
                                        totalVariants={item.variants.length}
                                        onUpdate={(field, value) => updateVariant(collection, editingIndex, vIndex, field, value)}
                                        onUpdateTransl={(fieldObj, langKey, value) => updateTransliteration(collection, editingIndex, vIndex, fieldObj, langKey, value)}
                                        onToggleLang={(tLang) => toggleTransliterationLang(collection, editingIndex, vIndex, tLang)}
                                        onRemove={() => requestRemoveVariant(editingIndex, vIndex)}
                                        onMove={(direction) => moveVariant(collection, editingIndex, vIndex, direction)}
                                        idPrefix={`v-${item.id}-${vIndex}`}
                                        defaultAuthors={defaultAuthors}
                                    />
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

