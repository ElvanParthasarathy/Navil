import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiArrowLeft, FiPlus, FiSave } from 'react-icons/fi';
import { SCHEMAS, FieldInput } from './AdminShared';
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
    moveItem,
    deleteItem
}) => {
    const [confirmState, setConfirmState] = useState({ open: false, index: null });

    const requestDelete = (e, index) => {
        e.stopPropagation();
        const title = items[index]?.title || items[index]?.date || 'Untitled';
        setConfirmState({
            open: true, index,
            title: 'Delete Entry',
            message: `Delete "${title}"? Save afterwards to commit.`
        });
    };

    const handleConfirm = () => {
        deleteItem(collection, confirmState.index);
        if (editingId === items[confirmState.index]?.id) setEditingId(null);
        setConfirmState({ open: false, index: null });
    };

    const editingIndex = items?.findIndex(item => item.id === editingId);
    const item = editingIndex >= 0 ? items[editingIndex] : null;

    return (
        <div className="admin-content-area">
            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onCancel={() => setConfirmState({ open: false, index: null })}
                onProceed={handleConfirm}
            />

            {/* Show EITHER the list OR the editor — file explorer pattern */}
            {!item ? (
                /* ── FILE LIST VIEW ── */
                <div className="admin-file-list">
                    <div className="admin-file-list-header">
                        <h2>{SCHEMAS[collection].label} ({items?.length || 0})</h2>
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
                            items?.map((listItem, index) => (
                                <div
                                    key={listItem.id || index}
                                    className="admin-file-row"
                                    onClick={() => setEditingId(listItem.id)}
                                >
                                    <div className="admin-file-row-info">
                                        <h3>{listItem.title || listItem.date || 'Untitled'}</h3>
                                        <span className="admin-file-row-sub">
                                            {listItem.date ? new Date(listItem.date).toLocaleDateString() : ''}
                                            {listItem.tags && ` • ${listItem.tags}`}
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
                        <h2>Edit {SCHEMAS[collection].label.slice(0, -1) || 'Entry'}</h2>
                        <div className="admin-editor-toolbar-actions">
                            <button className="adm-btn ghost" onClick={() => handleCloseEditor(editingId)}>
                                Cancel
                            </button>
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
                                        <span className="adm-section-title">Post Details</span>
                                    </div>
                                    <div className="adm-grid" style={{ display: 'flex', flexDirection: 'column' }}>
                                        {SCHEMAS[collection].fields.filter(f => !f.fullWidth).map(field => (
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
                                </div>
                            </div>

                            {/* RIGHT MAIN: Content Fields */}
                            <div className="adm-form-main">
                                <div className="adm-section" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                                    {SCHEMAS[collection].fields.filter(f => f.fullWidth).map(field => (
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
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
