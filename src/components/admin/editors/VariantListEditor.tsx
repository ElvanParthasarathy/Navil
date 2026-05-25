import React, { useState, useMemo } from 'react';
import { FiEdit3, FiTrash2, FiPlus, FiArrowLeft, FiSave, FiChevronUp, FiChevronDown, FiCopy, FiChevronRight, FiSearch } from 'react-icons/fi';
import { Box, Typography, Button, IconButton, Checkbox, Chip, Paper, Card, MenuItem, Select, FormControl, InputLabel, Collapse, TextField, Pagination, InputAdornment, Tabs, Tab } from '@mui/material';
import { SCHEMAS, renderFieldRow, FieldInput, PinEditor, VariantCard } from '../shared/AdminShared';
import ConfirmDialog from '../shared/ConfirmDialog';
import RichTextEditor from './RichTextEditor';
import { getOptimizedImage } from '../../../lib/media';

const getCoverImageUrl = (listItem: any) => {
    if (!listItem) return '';
    const raw = listItem.cover_image || listItem.image || '';
    return raw ? getOptimizedImage(raw, 'thumb') : '';
};

// Classification colors — preset for known types, auto-generated for custom
const CLASSIFICATION_COLORS: Record<string, string> = { 'அகம்': '#e8a0bf', 'புறம்': '#d4af37' };
const getClassColor = (name: string) => {
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
    onCopyItems,
    onDuplicateItems,
    seriesData = []
}: any) => {
    const [confirmState, setConfirmState] = useState<{ open: boolean, type: string, payload: any, title?: string, message?: string }>({ open: false, type: '', payload: null });
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ core: true, meta: false, variants: true, writtenForGroup: false, urai: true, notes: true });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isListEditMode, setIsListEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const itemsPerPage = 10;

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

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

    // ── Confirm dialogs ──
    const requestDelete = (e: any, index: number) => {
        e.stopPropagation();
        const title = SCHEMAS[collection].getItemTitle(items[index]);
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

    const getTargetCollections = (currentColl: string) => {
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

    // Derived states
    const filteredItems = useMemo(() => {
        if (!items) return [];
        if (!searchQuery.trim()) return items;
        const q = searchQuery.toLowerCase();
        return items.filter((item: any) => {
            const title = SCHEMAS[collection].getItemTitle(item)?.toLowerCase() || '';
            const classification = item.classification?.toLowerCase() || '';
            const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : (typeof item.tags === 'string' ? item.tags.toLowerCase() : '');
            
            let match = title.includes(q) || classification.includes(q) || tags.includes(q);
            
            if (!match && Array.isArray(item.variants)) {
                match = item.variants.some((v: any) => {
                    if (v.title?.toLowerCase().includes(q)) return true;
                    if (v.label?.toLowerCase().includes(q)) return true;
                    if (v.content?.toLowerCase().includes(q)) return true;
                    if (v.transliterations) {
                        return Object.values(v.transliterations).some((t: any) => 
                            typeof t === 'string' && t.toLowerCase().includes(q)
                        );
                    }
                    return false;
                });
            }
            return match;
        });
    }, [items, searchQuery, collection]);

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

            {/* Show EITHER the list OR the editor — file explorer pattern */}
            {!item ? (
                /* ── FILE LIST VIEW ── */
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {SCHEMAS[collection].label} ({items?.length || 0})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {!isListEditMode ? (
                                <Button variant="outlined" startIcon={<FiEdit3 />} onClick={() => setIsListEditMode(true)}>Edit</Button>
                            ) : (
                                <>
                                    <Button variant="text" onClick={() => { setIsListEditMode(false); clearSelection(); }} sx={{ color: 'text.secondary' }}>Cancel</Button>
                                    <Button variant="contained" startIcon={<FiPlus />} onClick={() => onAddItem()} color="secondary" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>Add New</Button>
                                    <Button variant="contained" startIcon={<FiSave />} onClick={onSave} disabled={saveStatus === 'loading'} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                        Save
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ px: 2, pt: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder={`Search ${SCHEMAS[collection].label.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment>
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 }
                            }}
                        />
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
                        {filteredItems.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>No items found.</Box>
                        ) : (
                            <>
                                {isListEditMode && selected.size === 0 && items?.length > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', px: 2, opacity: 0.6, cursor: 'pointer', '&:hover': { opacity: 1 }, transition: 'opacity 0.2s' }} onClick={toggleSelectAll}>
                                        <Checkbox checked={false} readOnly size="small" />
                                        <Typography variant="body2">Select all</Typography>
                                    </Box>
                                )}
                                {paginatedItems.map((listItem: any, paginatedIndex: number) => {
                                    const index = items.findIndex((i: any) => i.id === listItem.id); // Get true index for backend mutation if needed
                                    const isSelected = selected.has(listItem.id);
                                    const itemTags = Array.isArray(listItem.tags) 
                                        ? listItem.tags 
                                        : (typeof listItem.tags === 'string' 
                                            ? listItem.tags.split(',').map((t: string) => t.trim()).filter(Boolean) 
                                            : []);
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
                                                    {SCHEMAS[collection].getItemTitle(listItem)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                                                    {listItem.isPinned && <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>✨</Typography>}
                                                    {listItem.classification && (
                                                        <Chip size="small" label={listItem.classification} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, bgcolor: getClassColor(listItem.classification), color: '#fff' }} />
                                                    )}
                                                    {listItem.variants?.length > 0 && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {listItem.variants.map((v: any, vi: number) => (
                                                                <Box key={vi} sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: '50%', fontSize: '0.55rem', fontWeight: 700, bgcolor: 'action.hover', color: 'text.secondary' }} title={v.lang}>
                                                                    {{ ta: 'த', ml: 'മ', en: 'Aa', hi: 'हि' }[v.lang as string] || v.lang}
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    )}
                                                    {itemTags.slice(0, 2).map((tag: string, ti: number) => (
                                                        <Chip key={ti} size="small" label={tag} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                                                    ))}
                                                    {itemTags.length > 2 && (
                                                        <Chip size="small" label={`+${itemTags.length - 2}`} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, opacity: 0.7 }} />
                                                    )}
                                                    {(() => {
                                                        const dateStr = listItem.date || listItem.publish_date;
                                                        if (!dateStr) return null;
                                                        const parsed = new Date(dateStr);
                                                        if (isNaN(parsed.getTime())) {
                                                            return <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, ml: 0.5 }}>{dateStr}</Typography>;
                                                        }
                                                        return <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, ml: 0.5 }}>{parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Typography>;
                                                    })()}
                                                </Box>
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
                                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 4 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={(e, value) => setCurrentPage(value)}
                                            color="primary"
                                            size="small"
                                        />
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Box>
            ) : (
                /* ── EDITOR VIEW (replaces list) ── */
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                        <Button startIcon={<FiArrowLeft />} onClick={() => handleCloseEditor(editingId)} sx={{ color: 'text.secondary' }}>Back</Button>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button onClick={() => handleCloseEditor(editingId)}>Cancel</Button>
                            <Button variant="contained" startIcon={<FiSave />} onClick={onSave} disabled={saveStatus === 'loading'} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                {saveStatus === 'loading' ? 'Saving...' : 'Save'}
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, pb: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 1000 }}>
                            <Box sx={{ mb: 4 }}>
                                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
                                    <Tab label={collection === 'stories' ? 'Writing Canvas' : 'Writing Canvas'} value={0} sx={{ fontWeight: 600, fontSize: '1rem' }} />
                                    {['poems', 'quotes'].includes(collection) && <Tab label="Notes & Urai" value={1} sx={{ fontWeight: 600, fontSize: '1rem' }} />}
                                    <Tab label="Metadata & Settings" value={2} sx={{ fontWeight: 600, fontSize: '1rem' }} />
                                </Tabs>
                            </Box>
                            
                            {/* TAB 0: Writing Canvas (Variants) */}
                            {activeTab === 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Language Variants */}
                                    {collection !== 'stories' && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Language Variants</Typography>
                                            <Button variant="contained" startIcon={<FiPlus />} onClick={(e) => { e.stopPropagation(); addVariant(collection, editingIndex); }}>
                                                Add Variant
                                            </Button>
                                        </Box>
                                    )}

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        {item.variants?.map((variant: any, vIndex: number) => (
                                            <VariantCard
                                                key={vIndex}
                                                collection={collection}
                                                variant={variant}
                                                vIndex={vIndex}
                                                totalVariants={item.variants.length}
                                                onUpdate={(field: string, value: any) => updateVariant(collection, editingIndex, vIndex, field, value)}
                                                onUpdateTransl={(fieldObj: any, langKey: string, value: any) => updateTransliteration(collection, editingIndex, vIndex, fieldObj, langKey, value)}
                                                onToggleLang={(tLang: string) => toggleTransliterationLang(collection, editingIndex, vIndex, tLang)}
                                                onRemove={() => requestRemoveVariant(editingIndex, vIndex)}
                                                onMove={(direction: string) => moveVariant(collection, editingIndex, vIndex, direction)}
                                                idPrefix={`v-${item.id}-${vIndex}`}
                                                defaultAuthors={defaultAuthors}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* TAB 1: Notes & Urai */}
                            {activeTab === 1 && ['poems', 'quotes'].includes(collection) && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {SCHEMAS[collection].extraFields?.filter((f: any) => ['urai', 'notes'].includes(f.key)).map((f: any) => (
                                        <Box key={f.key}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{f.label}</Typography>
                                            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', '& .ProseMirror': { minHeight: 400 } }}>
                                                <RichTextEditor
                                                    content={item[f.key] || ''}
                                                    onChange={(val: string) => updateItemField(collection, editingIndex, f.key, val)}
                                                    placeholder={f.placeholder || ''}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* TAB 2: Metadata & Settings */}
                            {activeTab === 2 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {/* Core Details */}
                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Core Details</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {renderFieldRow(SCHEMAS[collection].itemFields, item, collection, editingIndex, updateItemField)}
                                <PinEditor item={item} onUpdate={(field: string, value: any) => updateItemField(collection, editingIndex, field, value)} idPrefix={`${collection}-${editingIndex}`} />
                            </Box>
                        </Paper>

                        {/* Context & Metadata */}
                        <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>Context &amp; Metadata</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {[SCHEMAS[collection].row2Fields, SCHEMAS[collection].row3Fields].filter(Boolean).map((fieldGroup: any, gi: number) => {
                                    const processedGroup = fieldGroup.map((f: any) => {
                                        if (collection === 'stories' && f.key === 'series_name') {
                                            const options = [{ value: '', label: 'Independent / Standalone Story' }];
                                            seriesData.forEach((s: any) => {
                                                if (s.title) options.push({ value: s.title, label: s.title });
                                            });
                                            return { ...f, type: 'select', options };
                                        }
                                        return f;
                                    });

                                    const inlineFields = processedGroup.filter((f: any) => f.type !== 'tags' && f.type !== 'checkbox');
                                    const fullWidthFields = processedGroup.filter((f: any) => f.type === 'tags' || f.type === 'checkbox');
                                    return (
                                        <React.Fragment key={gi}>
                                            {inlineFields.length > 0 && renderFieldRow(inlineFields, item, collection, editingIndex, updateItemField)}
                                            {fullWidthFields.map((f: any) => (
                                                <Box key={f.key} sx={{ mt: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>{f.label}</Typography>
                                                    {f.type === 'checkbox' ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Checkbox
                                                                id={`row-${f.key}`}
                                                                checked={!!item[f.key]}
                                                                onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.checked)}
                                                            />
                                                            <Typography component="label" htmlFor={`row-${f.key}`} variant="body2">{f.placeholder || 'Enable'}</Typography>
                                                        </Box>
                                                    ) : (
                                                        <FieldInput field={f} value={item[f.key]} onChange={(val: any) => updateItemField(collection, editingIndex, f.key, val)} />
                                                    )}
                                                </Box>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}

                                {SCHEMAS[collection].extraFields?.filter((f: any) => !['urai', 'notes', 'writtenFor', 'writtenForPassword'].includes(f.key)).map((f: any) => {
                                    // Hide password and hint fields if lock toggle is not enabled
                                    if (!item.isUraiNotesLocked && (f.key === 'uraiNotesPassword' || f.key === 'uraiNotesPasswordHint')) {
                                        return null;
                                    }
                                    return (
                                    <Box key={f.key}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>{f.label}</Typography>
                                        {f.type === 'richtext' ? (
                                            <RichTextEditor
                                                content={item[f.key] || ''}
                                                onChange={(val: string) => updateItemField(collection, editingIndex, f.key, val)}
                                                placeholder={f.placeholder || ''}
                                            />
                                        ) : f.type === 'textarea' ? (
                                            <TextField
                                                fullWidth
                                                multiline
                                                minRows={f.rows || 3}
                                                value={item[f.key] || ''}
                                                onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.value)}
                                                placeholder={f.placeholder || ''}
                                            />
                                        ) : f.type === 'checkbox' ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Checkbox
                                                    id={`extra-${f.key}`}
                                                    checked={!!item[f.key]}
                                                    onChange={(e) => updateItemField(collection, editingIndex, f.key, e.target.checked)}
                                                />
                                                <Typography component="label" htmlFor={`extra-${f.key}`} variant="body2">{f.placeholder || 'Enable'}</Typography>
                                            </Box>
                                        ) : (
                                            <FieldInput 
                                                field={f} 
                                                value={item[f.key]} 
                                                onChange={(val: any) => updateItemField(collection, editingIndex, f.key, val)} 
                                            />
                                        )}
                                    </Box>
                                    );
                                })}
                            </Box>
                        </Paper>

                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
