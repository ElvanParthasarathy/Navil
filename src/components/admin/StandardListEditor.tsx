import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiArrowLeft, FiPlus, FiSave, FiChevronUp, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { SCHEMAS, renderFieldRow, FieldInput, VariantCard } from './AdminShared';
import { ConfirmDialog } from './ConfirmDialog';
import { getOptimizedImage } from '../../lib/media';

const getCoverImageUrl = (listItem: any) => {
    if (!listItem) return '';
    let raw = '';
    if (listItem.image) raw = listItem.image;
    else if (listItem.images) {
        if (Array.isArray(listItem.images)) {
            if (listItem.images.length > 0) raw = listItem.images[0];
        } else if (typeof listItem.images === 'string') {
            const urls = listItem.images.split('\n').filter(Boolean);
            if (urls.length > 0) raw = urls[0];
        }
    }
    return raw ? getOptimizedImage(raw, 'thumb') : '';
};

export const StandardListEditor = ({
    items,
    collection,
    editingId,
    setEditingId,
    handleCloseEditor,
    onAddItem,
    onSave,
    saveStatus,
    updateGenericItem,
    updateItemField,
    moveItem,
    deleteItem,
    addVariant,
    updateVariant,
    removeVariant,
    moveVariant,
    updateTransliteration,
    toggleTransliterationLang,
    onMoveItems,
    onCopyItems
}) => {
    interface ConfirmState {
        open: boolean;
        type: string;
        title?: string;
        message?: string;
        payload: any;
    }
    const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, type: '', payload: null });
    const [selected, setSelected] = useState(new Set());
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ settings: true, variants: true });
    const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    const schema = SCHEMAS[collection];
    const isBilingual = schema.type === 'bilingual_post';

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

    const requestDelete = (e, index) => {
        e.stopPropagation();
        const title = schema.getItemTitle
            ? schema.getItemTitle(items[index])
            : (items[index]?.title || items[index]?.date || 'Untitled');

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
                .admin-move-controls {
                    display: inline-flex; align-items: center; gap: 4px; margin-right: 8px;
                }
                .admin-move-controls .adm-btn.icon-only {
                    padding: 4px !important; min-width: unset !important; width: 28px; height: 28px;
                }
                @media (max-width: 600px) {
                    .bulk-toolbar { flex-direction: column; align-items: flex-start; }
                    .bulk-toolbar-right { width: 100%; }
                    .bulk-select { max-width: 100%; flex: 1; }
                }
            `}</style>

            {/* ── FILE LIST VIEW ── */}
            {!item ? (
                <div className="admin-file-list">
                    <div className="admin-file-list-header">
                        <h2>{schema.label} ({items?.length || 0})</h2>
                        <div className="admin-file-list-actions">
                            <button className="adm-btn" onClick={onAddItem}><FiPlus size={14} /> Add New</button>
                            <button className="adm-btn primary" onClick={onSave}>
                                {saveStatus === 'loading' ? 'Saving...' : <><FiSave size={14} /> Save</>}
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
                                    const title = schema.getItemTitle ? schema.getItemTitle(listItem) : (listItem.title || listItem.date || 'Untitled');
                                    const dateVal = listItem.date || listItem.publish_date;
                                    const dateParsed = dateVal ? new Date(dateVal) : null;
                                    const formattedDate = dateParsed && !isNaN(dateParsed.getTime()) ? dateParsed.toLocaleDateString() : (dateVal || '');
                                    const sub = schema.getItemSubtitle ? schema.getItemSubtitle(listItem) : formattedDate;
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
                                                <h3>{title}</h3>
                                                <span className="admin-file-row-sub">
                                                    {sub}
                                                    {listItem.variants?.length > 0 && ` • ${listItem.variants.length} lang${listItem.variants.length > 1 ? 's' : ''}`}
                                                </span>
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
                /* ── EDITOR VIEW ── */
                <div className="admin-editor-full">
                    <div className="admin-editor-toolbar">
                        <button className="adm-btn ghost" onClick={() => handleCloseEditor(editingId)}>
                            <FiArrowLeft size={16} /> Back
                        </button>
                        <h2>Edit {schema.label.slice(0, -1) || 'Entry'}</h2>
                        <div className="admin-editor-toolbar-actions">
                            <button className="adm-btn ghost" onClick={() => handleCloseEditor(editingId)}>Cancel</button>
                            <button className="adm-btn primary" onClick={onSave}>
                                {saveStatus === 'loading' ? 'Saving...' : <><FiSave size={14} /> Save</>}
                            </button>
                        </div>
                    </div>

                    <div className="admin-editor-body">
                        <div className="adm-form side-by-side">
                            {/* LEFT SIDEBAR: Meta Fields */}
                            <div className="adm-form-sidebar">
                                <div className="adm-section">
                                    <div className="adm-section-header adm-section-header--collapsible" onClick={() => toggleSection('settings')}>
                                        <span className="adm-section-title">Post Settings</span>
                                        <div className={`adm-collapse-icon ${expandedSections.settings ? 'open' : ''}`}>
                                            <FiChevronRight size={16} />
                                        </div>
                                    </div>
                                    <div className={`adm-collapse-body ${expandedSections.settings ? 'open' : ''}`}>
                                        <div className="adm-collapse-body-inner">
                                            {isBilingual ? (
                                                <div className="adm-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                    {schema.metaFields.map(field => (
                                                        <div key={field.key} className="adm-field">
                                                            <label className="adm-label">{field.label}</label>
                                                            <FieldInput
                                                                field={field}
                                                                value={item[field.key]}
                                                                onChange={(val) => updateGenericItem(collection, editingIndex, field.key, val)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="adm-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                                                    {schema.fields?.filter(f => !f.fullWidth).map(field => (
                                                        <div key={field.key} className="adm-field">
                                                            <label className="adm-label">{field.label}</label>
                                                            <FieldInput
                                                                field={field}
                                                                value={item[field.key]}
                                                                onChange={(val) => updateGenericItem(collection, editingIndex, field.key, val)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT MAIN: Language Variants (same as poem editor) */}
                            <div className="adm-form-main">
                                {isBilingual ? (
                                    <div className="adm-section" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
                                        <div className="adm-section-header adm-section-header--collapsible" onClick={() => toggleSection('variants')}>
                                            <span className="adm-section-title">Language Variants</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button className="adm-btn ghost small" onClick={(e) => { e.stopPropagation(); addVariant(collection, editingIndex); }}>
                                                    <FiPlus size={13} /> Add Variant
                                                </button>
                                                <div className={`adm-collapse-icon ${expandedSections.variants ? 'open' : ''}`}>
                                                    <FiChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`adm-collapse-body ${expandedSections.variants ? 'open' : ''}`}>
                                            <div className="adm-collapse-body-inner">
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
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="adm-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                                        {schema.fields?.filter(f => f.fullWidth).map(field => (
                                            <div key={field.key} className="adm-field">
                                                <label className="adm-label">{field.label}</label>
                                                <FieldInput
                                                    field={field}
                                                    value={item[field.key]}
                                                    onChange={(val) => updateGenericItem(collection, editingIndex, field.key, val)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
