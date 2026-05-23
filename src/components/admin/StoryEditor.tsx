import React, { useState, useMemo } from 'react';
import { VariantListEditor } from './VariantListEditor';
import { FiFolder, FiArrowLeft, FiPlus, FiEdit3, FiImage } from 'react-icons/fi';
import { Box, Typography, Button, IconButton, Grid, Paper, TextField } from '@mui/material';

export const StoryEditor = (props: any) => {
    const { items, editingId, seriesData = [], addSeries, updateGenericItem, updateSeriesNameAndChapters, renameSeriesForStories, onSave, saveStatus } = props;
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [editingSeries, setEditingSeries] = useState<any>(null); // To track which series is being edited

    const folders = useMemo(() => {
        const f = new Map();
        
        // Add all master series
        seriesData.forEach((s: any) => {
            if (s.title) {
                f.set(s.title, { 
                    name: s.title, 
                    count: 0, 
                    latestDate: s.date || s.publish_date || new Date().toISOString(),
                    coverImage: s.coverImage,
                    description: s.description,
                    id: s.id,
                    isMaster: true 
                });
            }
        });

        // Add dynamically from chapters
        items?.forEach((item: any) => {
            const seriesName = item.series_name?.trim() || 'Standalone Stories';
            if (!f.has(seriesName)) {
                f.set(seriesName, { name: seriesName, count: 0, latestDate: item.date || item.publish_date || new Date().toISOString(), isMaster: false });
            }
            f.get(seriesName).count++;
            const currentDate = new Date(item.date || item.publish_date || new Date().toISOString());
            const latestDate = new Date(f.get(seriesName).latestDate);
            if (currentDate > latestDate) {
                f.get(seriesName).latestDate = currentDate.toISOString();
            }
        });
        return Array.from(f.values()).sort((a: any, b: any) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime());
    }, [items, seriesData]);

    const filteredItems = useMemo(() => {
        if (!currentFolder) return [];
        return items?.filter((item: any) => {
            const seriesName = item.series_name?.trim() || 'Standalone Stories';
            return seriesName === currentFolder;
        }) || [];
    }, [items, currentFolder]);

    const handleEditSeries = (e: React.MouseEvent, folder: any) => {
        e.stopPropagation();
        if (folder.isMaster) {
            setEditingSeries(seriesData.find((s: any) => s.id === folder.id));
        } else {
            // It's a dynamic folder without master data, create a temporary master object to start editing
            setEditingSeries({
                id: 'new',
                originalTitle: folder.name,
                title: folder.name,
                coverImage: '',
                description: ''
            });
        }
    };

    const handleSaveSeries = () => {
        if (editingSeries.id === 'new') {
            // Add new series
            const { id, originalTitle, ...newSeriesData } = editingSeries;
            addSeries(newSeriesData);
            if (originalTitle && originalTitle !== newSeriesData.title) {
                renameSeriesForStories(originalTitle, newSeriesData.title);
            }
        } else {
            // Update existing series
            const index = seriesData.findIndex((s: any) => s.id === editingSeries.id);
            if (index !== -1) {
                const oldTitle = seriesData[index].title;
                updateGenericItem('series', index, 'title', editingSeries.title);
                updateGenericItem('series', index, 'coverImage', editingSeries.coverImage);
                updateGenericItem('series', index, 'description', editingSeries.description);
                if (oldTitle !== editingSeries.title) {
                    updateSeriesNameAndChapters(index, editingSeries.title);
                    renameSeriesForStories(oldTitle, editingSeries.title);
                }
            }
        }
        setEditingSeries(null);
        // We do not call onSave() immediately, user should click the main Save button to commit to Firebase.
    };

    if (editingId) {
        return <VariantListEditor {...props} collection="stories" />;
    }

    if (editingSeries) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>
                <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
                    <Button startIcon={<FiArrowLeft />} onClick={() => setEditingSeries(null)} sx={{ color: 'text.secondary' }}>Back</Button>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Edit Master Series</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button onClick={() => setEditingSeries(null)}>Cancel</Button>
                        <Button variant="contained" onClick={handleSaveSeries} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                            Apply Changes
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
                    <Paper elevation={0} sx={{ width: '100%', maxWidth: 600, p: 4, display: 'flex', flexDirection: 'column', gap: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Master Details</Typography>
                        
                        <TextField
                            fullWidth label="Series Title"
                            value={editingSeries.title}
                            onChange={(e) => setEditingSeries({ ...editingSeries, title: e.target.value })}
                            helperText="Changing this will automatically update the folder name for all existing chapters."
                        />
                        
                        <TextField
                            fullWidth label="Cover Image URL (Thumbnail)"
                            value={editingSeries.coverImage || ''}
                            onChange={(e) => setEditingSeries({ ...editingSeries, coverImage: e.target.value })}
                        />
                        
                        {editingSeries.coverImage && (
                            <Box sx={{ width: 120, height: 120, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <img src={editingSeries.coverImage} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </Box>
                        )}
                        
                        <TextField
                            fullWidth label="Description / Summary (Optional)"
                            multiline rows={4}
                            value={editingSeries.description || ''}
                            onChange={(e) => setEditingSeries({ ...editingSeries, description: e.target.value })}
                        />
                    </Paper>
                </Box>
            </Box>
        );
    }

    if (currentFolder) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                <Box sx={{ p: 2, px: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, bgcolor: 'background.default' }}>
                    <Button variant="outlined" onClick={() => setCurrentFolder(null)} startIcon={<FiArrowLeft />} sx={{ borderRadius: 3 }}>
                        Back to Folders
                    </Button>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{currentFolder}</Typography>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <VariantListEditor 
                        {...props} 
                        collection="stories" 
                        items={filteredItems}
                    />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, overflowY: 'auto', height: '100%', bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Story Folders</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="secondary" onClick={() => setEditingSeries({ id: 'new', title: '', coverImage: '', description: '' })} startIcon={<FiFolder />} sx={{ borderRadius: 3, boxShadow: 'none' }}>
                        New Master Series
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => props.onAddItem('stories')} startIcon={<FiPlus />} sx={{ borderRadius: 3, boxShadow: 'none' }}>
                        New Chapter
                    </Button>
                </Box>
            </Box>
            
            {folders.length === 0 ? (
                <Box sx={{ color: 'text.secondary',  height: '50%',  alignItems: 'center',  justifyContent: 'center',  display: 'flex' }}>
                    <Typography>No stories found. Click "New Chapter" to create one.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {folders.map((folder: any) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={folder.name}>
                            <Paper 
                                onClick={() => setCurrentFolder(folder.name)}
                                sx={{
                                    p: 3,
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                    transition: 'all 0.2s ease',
                                    boxShadow: 'none',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        borderColor: 'primary.main',
                                        bgcolor: 'surfaceContainer',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                        '& .edit-btn': { opacity: 1 }
                                    }
                                }}
                            >
                                <IconButton 
                                    className="edit-btn"
                                    onClick={(e) => handleEditSeries(e, folder)}
                                    sx={{ position: 'absolute', top: 8, right: 8, opacity: 0, transition: 'opacity 0.2s', bgcolor: 'background.paper', '&:hover': { bgcolor: 'action.hover' } }}
                                    size="small"
                                    title="Edit Master Series"
                                >
                                    <FiEdit3 size={16} />
                                </IconButton>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ 
                                        width: 64, height: 64, 
                                        bgcolor: 'primary.main', 
                                        color: 'primary.contrastText',
                                        borderRadius: 3, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        flexShrink: 0,
                                        overflow: 'hidden'
                                    }}>
                                        {folder.coverImage ? (
                                            <img src={folder.coverImage} alt={folder.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <FiFolder size={32} />
                                        )}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="h6" noWrap title={folder.name} sx={{ fontWeight: 700 }}>{folder.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            {folder.count} chapter{folder.count !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default StoryEditor;
