import React, { useState, useMemo } from 'react';
import { FiEdit3, FiTrash2, FiArrowLeft, FiPlus, FiSave, FiChevronUp, FiChevronDown, FiChevronRight, FiCopy, FiSearch } from 'react-icons/fi';
import { Box, Typography, Button, IconButton, Checkbox, Paper, Card, MenuItem, Select, FormControl, InputLabel, Collapse, TextField, Pagination, InputAdornment } from '@mui/material';
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
    onCopyItems,
    onDuplicateItems
}: any) => {
    interface ConfirmState {
        open: boolean;
        type: string;
        title?: string;
        message?: string;
        payload: any;
    }
    const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, type: '', payload: null });
    const [selected, setSelected] = useState(new Set<string>());
    const [isListEditMode, setIsListEditMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ settings: true, variants: true });
    const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    const schema = SCHEMAS[collection];
    const isBilingual = schema.type === 'bilingual_post';

    // ── Selection helpers ──
    const toggleSelect = (id: string, e: any) => {
        e.stopPropagation();
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = (e: any) => {
        if (e) e.stopPropagation();
        if (selected.size === items?.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(items?.map((i: any) => i.id)));
        }
    };

    const clearSelection = () => setSelected(new Set());

    const requestDelete = (e: any, index: number) => {
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

    const requestRemoveVariant = (itemIndex: number, variantIndex: number) => {
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
            const indices = ids.map((id: string) => items.findIndex((i: any) => i.id === id)).filter((i: number) => i >= 0).sort((a: number, b: number) => b - a);
            indices.forEach((idx: number) => deleteItem(collection, idx));
            clearSelection();
        }
        setConfirmState({ open: false, type: '', payload: null });
    };

    const editingIndex = items?.findIndex((item: any) => item.id === editingId);
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

    const getTargetCollections = (currentColl: string) => {
        if (currentColl === 'arts') {
            return artsCollections;
        }
        if (artsCollections.includes(currentColl)) {
            return artsCollections.filter(c => c !== currentColl);
        }
        return [];
    };

    const targetCollections = getTargetCollections(collection);

    // Derived states
    const filteredItems = useMemo(() => {
        if (!items) return [];
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter((item: any) => {
            const title = schema.getItemTitle
                ? schema.getItemTitle(item)?.toLowerCase()
                : (item.title || item.date || '').toLowerCase();
            const caption = (item.caption || '').toLowerCase();
            const classification = item.classification?.toLowerCase() || '';
            const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : (typeof item.tags === 'string' ? item.tags.toLowerCase() : '');
            
            return title.includes(q) || caption.includes(q) || classification.includes(q) || tags.includes(q);
        });
    }, [items, searchQuery, schema]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
            <ConfirmDialog
                open={confirmState.open}
                title={confirmState.title || ''}
                message={confirmState.message || ''}
                onCancel={() => setConfirmState({ open: false, type: '', payload: null })}
                onProceed={handleConfirm}
            />

            {/* ── FILE LIST VIEW ── */}
            {!item ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {schema.label} ({items?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                            <TextField
                                size="small"
                                placeholder="Search items..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                slotProps={{ input: {
                                    startAdornment: <InputAdornment position="start"><FiSearch size={16} /></InputAdornment>,
                                }}}
                                sx={{ maxWidth: 300, bgcolor: 'background.paper', borderRadius: 2 }}
                            />
                            {!isListEditMode ? (
                                <Button variant="outlined" startIcon={<FiEdit3 />} onClick={() => setIsListEditMode(true)}>Edit</Button>
                            ) : (
                                <>
                                    <Button variant="text" onClick={() => { setIsListEditMode(false); clearSelection(); }} sx={{ color: 'text.secondary' }}>Cancel</Button>
                                    <Button variant="contained" startIcon={<FiPlus />} onClick={() => onAddItem()} color="secondary" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>Add New</Button>
                                    {collection === 'stories' && addSeries && (
                                        <Button variant="outlined" startIcon={<FiFolderPlus />} onClick={() => addSeries()} sx={{ color: 'text.primary', borderColor: 'divider' }}>Add Series</Button>
                                    )}
                                    <Button variant="contained" startIcon={<FiSave />} onClick={onSave} disabled={saveStatus === 'loading'} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                        Save
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* Bulk Action Toolbar — appears when items selected */}
                    {selected.size > 0 && (
                        <Paper elevation={0} sx={{ p: 2, m: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', bgcolor: 'secondary.dark', borderRadius: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Checkbox checked={selected.size === items?.length} onChange={toggleSelectAll} sx={{ color: 'onSecondaryContainer', '&.Mui-checked': { color: 'onSecondaryContainer' } }} />
                                <Typography sx={{ fontWeight: 600, color: 'onSecondaryContainer' }}>{selected.size} selected</Typography>
                                <Button size="small" onClick={clearSelection} sx={{ color: 'onSecondaryContainer' }}>Clear</Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                 {targetCollections.length > 0 && (
                                    <>
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel>Move to...</InputLabel>
                                            <Select label="Move to..." value="" onChange={(e) => {
                                                if (e.target.value && onMoveItems) {
                                                    onMoveItems([...selected], collection, e.target.value);
                                                    clearSelection();
                                                }
                                            }}>
                                                {targetCollections.map(c => (
                                                    <MenuItem key={c} value={c}>{SCHEMAS[c].label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl size="small" sx={{ minWidth: 140 }}>
                                            <InputLabel>Copy to...</InputLabel>
                                            <Select label="Copy to..." value="" onChange={(e) => {
                                                if (e.target.value && onCopyItems) {
                                                    onCopyItems([...selected], collection, e.target.value);
                                                    clearSelection();
                                                }
                                            }}>
                                                {targetCollections.map(c => (
                                                    <MenuItem key={c} value={c}>{SCHEMAS[c].label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </>
                                )}
                                <Button size="small" startIcon={<FiCopy />} onClick={() => {
                                    if (onDuplicateItems) {
                                        onDuplicateItems([...selected]);
                                        clearSelection();
                                    }
                                }} sx={{ color: 'onSecondaryContainer' }}>Duplicate</Button>
                                <Button size="small" color="error" startIcon={<FiTrash2 />} onClick={requestBulkDelete}>Delete</Button>
                            </Box>
                        </Paper>
                    )}

                    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {items?.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No items yet. Click "Add New" to create one.</Box>
                        ) : (
                            <>
                                {isListEditMode && selected.size === 0 && paginatedItems?.length > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, opacity: 0.6, cursor: 'pointer', '&:hover': { opacity: 1 }, transition: 'opacity 0.2s' }} onClick={toggleSelectAll}>
                                        <Checkbox checked={false} readOnly size="small" />
                                        <Typography variant="body2">Select all</Typography>
                                    </Box>
                                )}
                                {paginatedItems?.map((listItem: any, paginatedIndex: number) => {
                                    const index = items.findIndex((i: any) => i.id === listItem.id);
                                    const isSelected = selected.has(listItem.id);
                                    const title = schema.getItemTitle ? schema.getItemTitle(listItem) : (listItem.title || listItem.date || 'Untitled');
                                    const dateVal = listItem.date || listItem.publish_date;
                                    const dateParsed = dateVal ? new Date(dateVal) : null;
                                    const formattedDate = dateParsed && !isNaN(dateParsed.getTime()) ? dateParsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : (dateVal || '');
                                    const sub = schema.getItemSubtitle ? schema.getItemSubtitle(listItem) : formattedDate;
                                    const coverUrl = getCoverImageUrl(listItem);
                                    return (
                                        <Card
                                            key={listItem.id || index}
                                            elevation={0}
                                            sx={{
                                                display: 'flex', alignItems: 'center', p: 1.5, gap: 2,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                bgcolor: isSelected ? 'primary.dark' : 'background.paper',
                                                color: isSelected ? 'onPrimaryContainer' : 'text.primary',
                                                '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'surfaceContainer' },
                                                flexShrink: 0
                                            }}
                                            onClick={() => {
                                                if (isListEditMode) toggleSelect(listItem.id, null);
                                                else setEditingId(listItem.id);
                                            }}
                                        >
                                            {isListEditMode && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }} onClick={(e: any) => { e.stopPropagation(); toggleSelect(listItem.id, e); }}>
                                                    <Checkbox checked={isSelected} readOnly sx={{ p: 0 }} />
                                                </Box>
                                            )}
                                            {coverUrl && (
                                                <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </Box>
                                            )}
                                            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {title}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                    {sub}
                                                    {listItem.variants?.length > 0 && ` • ${listItem.variants.length} lang${listItem.variants.length > 1 ? 's' : ''}`}
                                                </Typography>
                                            </Box>
                                            {isListEditMode ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
                                                    {collection !== 'stories' && (
                                                        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 1 }}>
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); moveItem(collection, index, 'up'); }} disabled={index === 0} title="Move Up"><FiChevronUp size={16} /></IconButton>
                                                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); moveItem(collection, index, 'down'); }} disabled={index === items.length - 1} title="Move Down"><FiChevronDown size={16} /></IconButton>
                                                        </Box>
                                                    )}
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); if (onDuplicateItems) onDuplicateItems([listItem.id]); }} title="Duplicate"><FiCopy size={16} /></IconButton>
                                                    <IconButton size="small" color="error" onClick={(e) => requestDelete(e, index)} title="Delete"><FiTrash2 size={16} /></IconButton>
                                                </Box>
                                            ) : (
                                                <Box sx={{ display: 'flex', alignItems: 'center', pr: 1, color: 'text.secondary', opacity: 0.5 }}>
                                                    <FiChevronRight size={20} />
                                                </Box>
                                            )}
                                        </Card>
                                    );
                                })}
                                
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, pb: 4 }}>
                                        <Pagination 
                                            count={totalPages} 
                                            page={currentPage} 
                                            onChange={(_, p) => setCurrentPage(p)} 
                                            color="primary" 
                                            size="large" 
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            ) : (
                /* ── EDITOR VIEW ── */
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                        <Button startIcon={<FiArrowLeft />} onClick={() => handleCloseEditor(editingId)} sx={{ color: 'text.secondary' }}>Back</Button>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit {schema.label.slice(0, -1) || 'Entry'}</Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button onClick={() => handleCloseEditor(editingId)}>Cancel</Button>
                            <Button variant="contained" startIcon={<FiSave />} onClick={onSave} disabled={saveStatus === 'loading'} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                {saveStatus === 'loading' ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, pb: 10, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 1400, display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4, alignItems: 'flex-start' }}>
                            {/* LEFT SIDEBAR: Meta Fields */}
                            <Box sx={{ flex: { lg: '0 0 320px' }, display: 'flex', flexDirection: 'column', gap: 4, position: { lg: 'sticky' }, top: 0 }}>
                                <Paper elevation={0} sx={{ bgcolor: 'background.paper', overflow: 'hidden' }}>
                                <Box 
                                    sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                    onClick={() => toggleSection('settings')}
                                >
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Post Settings</Typography>
                                    <Box sx={{ transform: expandedSections.settings ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                        <FiChevronRight size={20} />
                                    </Box>
                                </Box>
                                <Collapse in={expandedSections.settings}>
                                    <Box sx={{ p: 3, pt: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {isBilingual ? (
                                            schema.metaFields.map((field: any) => (
                                                <Box key={field.key}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>{field.label}</Typography>
                                                    <FieldInput
                                                        field={field}
                                                        value={item[field.key]}
                                                        onChange={(val: any) => updateGenericItem(collection, editingIndex, field.key, val)}
                                                    />
                                                </Box>
                                            ))
                                        ) : (
                                            schema.fields?.filter((f: any) => !f.fullWidth).map((field: any) => (
                                                <Box key={field.key}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>{field.label}</Typography>
                                                    <FieldInput
                                                        field={field}
                                                        value={item[field.key]}
                                                        onChange={(val: any) => updateGenericItem(collection, editingIndex, field.key, val)}
                                                    />
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                </Collapse>
                            </Paper>
                        </Box>

                        {/* RIGHT MAIN: Language Variants or Full Width Fields */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {isBilingual ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => toggleSection('variants')}>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Language Variants</Typography>
                                            <Box sx={{ transform: expandedSections.variants ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                                <FiChevronRight size={20} />
                                            </Box>
                                        </Box>
                                        <Button variant="contained" startIcon={<FiPlus />} onClick={(e) => { e.stopPropagation(); addVariant(collection, editingIndex); }}>
                                            Add Variant
                                        </Button>
                                    </Box>
                                    <Collapse in={expandedSections.variants}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
                                            {item.variants?.map((variant: any, vIndex: number) => (
                                                <VariantCard
                                                    key={vIndex}
                                                    variant={variant}
                                                    vIndex={vIndex}
                                                    totalVariants={item.variants.length}
                                                    onUpdate={(field: string, value: any) => updateVariant(collection, editingIndex, vIndex, field, value)}
                                                    onUpdateTransl={(fieldObj: any, langKey: string, value: any) => updateTransliteration(collection, editingIndex, vIndex, fieldObj, langKey, value)}
                                                    onToggleLang={(tLang: string) => toggleTransliterationLang(collection, editingIndex, vIndex, tLang)}
                                                    onRemove={() => requestRemoveVariant(editingIndex, vIndex)}
                                                    onMove={(direction: string) => moveVariant(collection, editingIndex, vIndex, direction)}
                                                    idPrefix={`v-${item.id}-${vIndex}`}
                                                />
                                            ))}
                                        </Box>
                                    </Collapse>
                                </Box>
                            ) : (
                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {schema.fields?.filter((f: any) => f.fullWidth).map((field: any) => (
                                            <Box key={field.key}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>{field.label}</Typography>
                                                <FieldInput
                                                    field={field}
                                                    value={item[field.key]}
                                                    onChange={(val: any) => updateGenericItem(collection, editingIndex, field.key, val)}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            )}
                        </Box>
                    </Box>
                </Box>
                </Box>
            )}
        </Box>
    );
};
