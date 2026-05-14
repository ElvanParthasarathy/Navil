// @ts-nocheck
import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiChevronUp, FiChevronDown, FiCopy, FiMove } from 'react-icons/fi';
import { SCHEMAS, renderFieldRow, PinEditor, VariantCard } from './AdminShared';
import { ConfirmDialog } from './ConfirmDialog';

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

    // Available target collections for move/copy
    const otherCollections = Object.keys(SCHEMAS).filter(c => c !== collection);

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
                                <select className="adm-input bulk-select" defaultValue="" onChange={(e) => {
                                    if (e.target.value && onMoveItems) {
                                        onMoveItems([...selected], collection, e.target.value);
                                        clearSelection();
                                    }
                                    e.target.value = '';
                                }}>
                                    <option value="" disabled>✂ Move to...</option>
                                    {otherCollections.map(c => (
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
                                    {otherCollections.map(c => (
                                        <option key={c} value={c}>{SCHEMAS[c].label}</option>
                                    ))}
                                </select>
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
                                    return (
                                        <div
                                            key={listItem.id || index}
                                            className={`admin-file-row ${isSelected ? 'selected' : ''}`}
                                            onClick={() => setEditingId(listItem.id)}
                                        >
                                            <div className="admin-file-row-checkbox" onClick={(e) => toggleSelect(listItem.id, e)}>
                                                <input type="checkbox" checked={isSelected} readOnly />
                                            </div>
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
                                                    {(listItem.tags || []).slice(0, 2).map((tag, ti) => (
                                                        <span key={ti} className="row-tag-pill">{tag}</span>
                                                    ))}
                                                    {(listItem.tags || []).length > 2 && (
                                                        <span className="row-tag-pill" style={{ opacity: 0.5 }}>+{listItem.tags.length - 2}</span>
                                                    )}
                                                    {listItem.date && (
                                                        <span className="row-date">{new Date(listItem.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                    )}
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
                        <div className="adm-form side-by-side">

                            {/* LEFT SIDEBAR: Metadata & Settings */}
                            <div className="adm-form-sidebar">
                                <div className="adm-section">
                                    <div className="adm-section-header">
                                        <span className="adm-section-title">Core Details</span>
                                    </div>
                                    {renderFieldRow(SCHEMAS[collection].itemFields, item, collection, editingIndex, updateItemField)}
                                    <PinEditor item={item} onUpdate={(field, value) => updateItemField(collection, editingIndex, field, value)} idPrefix={`${collection}-${editingIndex}`} />
                                </div>

                                <hr className="adm-divider" style={{ margin: '16px 0' }} />

                                <div className="adm-section">
                                    <div className="adm-section-header">
                                        <span className="adm-section-title">Context & Metadata</span>
                                    </div>
                                    {SCHEMAS[collection].row2Fields && renderFieldRow(SCHEMAS[collection].row2Fields, item, collection, editingIndex, updateItemField)}
                                    {SCHEMAS[collection].row3Fields && renderFieldRow(SCHEMAS[collection].row3Fields, item, collection, editingIndex, updateItemField)}

                                    {SCHEMAS[collection].extraFields?.map(f => (
                                        <div key={f.key} className="adm-field">
                                            <label className="adm-label">{f.label}</label>
                                            <textarea
                                                className="adm-input"
                                                style={{ minHeight: f.rows ? `${f.rows * 22}px` : '60px' }}
                                                value={item[f.key] || ''}
                                                onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.value)}
                                                placeholder={f.placeholder || ''}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT MAIN: Writing Canvas (Variants) */}
                            <div className="adm-form-main">
                                <div className="adm-section" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                                    <div className="adm-section-header">
                                        <span className="adm-section-title">Language Variants</span>
                                        <button className="adm-btn ghost small" onClick={() => addVariant(collection, editingIndex)}>
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
                    </div>
                </div>
            )}
        </div>
    );
};

