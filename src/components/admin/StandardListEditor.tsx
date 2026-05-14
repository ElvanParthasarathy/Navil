import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiArrowLeft, FiPlus, FiSave } from 'react-icons/fi';
import { SCHEMAS, renderFieldRow, FieldInput, VariantCard } from './AdminShared';
import { ConfirmDialog } from './ConfirmDialog';

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
    toggleTransliterationLang
}) => {
    const [confirmState, setConfirmState] = useState({ open: false, type: '', payload: null });
    const schema = SCHEMAS[collection];
    const isBilingual = schema.type === 'bilingual_post';

    const requestDelete = (e, index) => {
        e.stopPropagation();
        const title = isBilingual
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
                    <div className="admin-file-list-scroll">
                        {items?.length === 0 ? (
                            <div className="admin-file-empty">No items yet. Click "Add New" to create one.</div>
                        ) : (
                            items?.map((listItem, index) => {
                                const title = isBilingual ? schema.getItemTitle(listItem) : (listItem.title || listItem.date || 'Untitled');
                                const sub = isBilingual ? schema.getItemSubtitle(listItem) : (listItem.date ? new Date(listItem.date).toLocaleDateString() : '');
                                return (
                                    <div
                                        key={listItem.id || index}
                                        className="admin-file-row"
                                        onClick={() => setEditingId(listItem.id)}
                                    >
                                        <div className="admin-file-row-info">
                                            <h3>{title}</h3>
                                            <span className="admin-file-row-sub">
                                                {sub}
                                                {listItem.variants?.length > 0 && ` • ${listItem.variants.length} lang${listItem.variants.length > 1 ? 's' : ''}`}
                                            </span>
                                        </div>
                                        <div className="admin-file-row-actions">
                                            <button className="adm-btn icon-only" onClick={(e) => { e.stopPropagation(); setEditingId(listItem.id); }} title="Edit">
                                                <FiEdit3 size={14} />
                                            </button>
                                            <button className="adm-btn danger" onClick={(e) => requestDelete(e, index)} title="Delete">
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
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
                                    <div className="adm-section-header">
                                        <span className="adm-section-title">Post Settings</span>
                                    </div>
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

                            {/* RIGHT MAIN: Language Variants (same as poem editor) */}
                            <div className="adm-form-main">
                                {isBilingual ? (
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
