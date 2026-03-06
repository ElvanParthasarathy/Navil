import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { SCHEMAS, renderFieldRow, PinEditor, VariantCard } from './AdminShared';
import { ConfirmDialog } from './ConfirmDialog';

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
    toggleTransliterationLang
}) => {
    const [confirmState, setConfirmState] = useState({ open: false, type: '', payload: null });

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

    const handleConfirm = () => {
        if (confirmState.type === 'item') {
            deleteItem(collection, confirmState.payload.index);
            if (editingId === items[confirmState.payload.index]?.id) setEditingId(null);
        } else if (confirmState.type === 'variant') {
            removeVariant(collection, confirmState.payload.itemIndex, confirmState.payload.variantIndex);
        }
        setConfirmState({ open: false, type: '', payload: null });
    };

    const editingIndex = items?.findIndex(item => item.id === editingId);
    const item = editingIndex >= 0 ? items[editingIndex] : null;

    return (
        <div className="admin-content-area">
            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onCancel={() => setConfirmState({ open: false, type: '', payload: null })}
                onProceed={handleConfirm}
            />

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
                    <div className="admin-file-list-scroll">
                        {items?.length === 0 ? (
                            <div className="admin-file-empty">No items yet. Click "Add New" to create one.</div>
                        ) : (
                            items?.map((listItem, index) => (
                                <div
                                    key={listItem.id || index}
                                    className="admin-file-row"
                                    onClick={() => setEditingId(listItem.id)}
                                >
                                    <div className="admin-file-row-info">
                                        <h3>{SCHEMAS[collection].getItemTitle(listItem)}</h3>
                                        <span className="admin-file-row-sub">
                                            {SCHEMAS[collection].getItemSubtitle(listItem)}
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
                            ))
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
