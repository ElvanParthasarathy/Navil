import React, { useState } from 'react';
import { FiMessageCircle, FiPenTool, FiEdit3, FiFileText, FiBook, FiImage, FiClock, FiTrendingUp, FiZap, FiArrowRight, FiDownload, FiUploadCloud, FiSliders, FiFeather, FiAnchor } from 'react-icons/fi';
import { db } from '../../lib/firebaseClient';
import { ref, get } from 'firebase/database';
import { Box, Typography, Button, Card, CardContent, Grid, List, ListItem, ListItemButton, Avatar, Chip, CircularProgress, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const COLLECTION_META = {
    quotes: { label: 'Quotes', icon: <FiMessageCircle size={20} />, color: 'var(--color-cat-quotes)' },
    poems: { label: 'Poems', icon: <FiPenTool size={20} />, color: 'var(--color-cat-poems)' },
    blog: { label: 'Blog', icon: <FiEdit3 size={20} />, color: 'var(--color-cat-blog)' },
    articles: { label: 'Articles', icon: <FiFileText size={20} />, color: 'var(--color-cat-articles)' },
    stories: { label: 'Stories', icon: <FiBook size={20} />, color: 'var(--color-cat-stories)' },
    diary: { label: 'Diary', icon: <FiBook size={20} />, color: 'var(--color-cat-diary)' },
    art_pencil: { label: 'Pencil', icon: <FiEdit3 size={20} />, color: 'var(--color-cat-art)' },
    art_editing: { label: 'Editings', icon: <FiSliders size={20} />, color: 'var(--color-cat-art)' },
    art_poster: { label: 'Posters', icon: <FiFileText size={20} />, color: 'var(--color-cat-art)' },
    art_painting: { label: 'Paintings', icon: <FiFeather size={20} />, color: 'var(--color-cat-art)' },
    art_quotes: { label: 'Art Quotes', icon: <FiMessageCircle size={20} />, color: 'var(--color-cat-art)' },
    art_poems: { label: 'Art Poems', icon: <FiPenTool size={20} />, color: 'var(--color-cat-art)' },
    art_illustrations: { label: 'Illustrations', icon: <FiAnchor size={20} />, color: 'var(--color-cat-art)' },
    art_digital_arts: { label: 'Digital Arts', icon: <FiImage size={20} />, color: 'var(--color-cat-art)' },
};

interface DashboardItem {
    id?: string;
    title?: string;
    date?: string;
    _collection: string;
    variants?: any[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const AdminDashboard = ({ dataStore, username, onNavigate }: { 
    dataStore: any, 
    username: string, 
    onNavigate: (tab: string) => void
}) => {
    const allItems: DashboardItem[] = [];
    Object.entries(dataStore).forEach(([key, items]) => {
        if (key === 'profile' || key === 'defaultAuthors' || !Array.isArray(items)) return;
        items.forEach(item => {
            allItems.push({ ...item, _collection: key });
        });
    });

    const sorted = [...allItems].sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    const latestPerCollection: Record<string, DashboardItem> = {};
    sorted.forEach(item => {
        if (!latestPerCollection[item._collection]) {
            latestPerCollection[item._collection] = item;
        }
    });

    const recentItems = (Object.values(latestPerCollection) as DashboardItem[]).sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newItems: DashboardItem[] = [];
    (Object.values(latestPerCollection) as DashboardItem[]).forEach(item => {
        if (item.date && new Date(item.date).getTime() >= sevenDaysAgo.getTime()) {
            newItems.push(item);
        }
    });

    newItems.sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
    });

    const totalItems = allItems.length;

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadBackup = async () => {
        try {
            setIsDownloading(true);
            const snapshot = await get(ref(db));
            const rawData = snapshot.val() || {};
            
            const dataStr = JSON.stringify(rawData, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `elvan_firebase_backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            console.error("Backup failed:", error);
            alert("Failed to generate backup: " + error.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ p: { xs: 3, md: 5 }, maxWidth: 1400, mx: 'auto' }}>
            {/* Hero Section */}
            <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 4, mb: 6 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800,  letterSpacing: '-0.02em', mb: 1 }}>
                            Welcome back, <Box component="span" sx={{ color: 'primary.main' }}>{username}</Box>
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Here's what's happening with your content today.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ textAlign: 'center', px: 3, py: 1.5, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>{totalItems}</Typography>
                            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>Total Items</Typography>
                        </Box>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleDownloadBackup}
                            disabled={isDownloading}
                            startIcon={isDownloading ? <CircularProgress size={18} color="inherit" /> : <FiDownload size={18} />}
                            sx={{ height: 56, px: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                            {isDownloading ? 'Fetching...' : 'Backup Data'}
                        </Button>
                    </Box>
                </Box>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 6 }}>
                    {['poems', 'quotes', 'blog', 'stories'].map(type => {
                        const meta = COLLECTION_META[type as keyof typeof COLLECTION_META];
                        return (
                            <Button
                                key={type}
                                variant="contained"
                                onClick={() => onNavigate(type)}
                                startIcon={meta.icon}
                                sx={{ 
                                    py: 1, 
                                    px: 2.5,
                                    bgcolor: 'action.hover',
                                    color: 'text.primary',
                                    '&:hover': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                    }
                                }}
                            >
                                New {meta.label.replace(/s$/, '')}
                            </Button>
                        );
                    })}
                </Box>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants}>
                <Typography variant="h6" sx={{ fontWeight: 700,  mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FiTrendingUp size={20} color="var(--color-primary)" />
                    Content Overview
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(7, 1fr)' }, gap: 2.5, mb: 6 }}>
                    {Object.entries(COLLECTION_META).map(([key, meta]) => {
                        const count = Array.isArray(dataStore[key]) ? dataStore[key].length : 0;
                        return (
                            <Card 
                                key={key}
                                component={motion.div}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate(key)}
                                sx={{ 
                                    cursor: 'pointer', 
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        borderColor: meta.color,
                                        boxShadow: `0 8px 24px ${meta.color}20`
                                    }
                                }}
                            >
                                <CardContent sx={{ p: '24px !important', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <Avatar sx={{ bgcolor: `${meta.color}20`, color: meta.color, width: 44, height: 44, mb: 3, borderRadius: 2 }}>
                                        {meta.icon}
                                    </Avatar>
                                    <Box sx={{ mt: 'auto' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 800,  mb: 0.5 }}>{count}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                            {meta.label}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>
            </motion.div>

            {/* Two-column: Recent + What's New */}
            <Grid container spacing={4}>
                {/* Recently Updated */}
                <Grid xs={12} md={6}>
                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, px: 1 }}>
                            <FiClock size={20} color="var(--color-text-muted)" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Recently Updated</Typography>
                        </Box>
                        <Card sx={{ overflow: 'hidden' }}>
                            <List disablePadding>
                                {recentItems.length === 0 ? (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>No items yet. Start creating!</Typography>
                                    </Box>
                                ) : recentItems.map((item, i) => {
                                    const meta = COLLECTION_META[item._collection as keyof typeof COLLECTION_META] || {};
                                    return (
                                        <React.Fragment key={item._collection}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => onNavigate(item._collection)} sx={{ px: 3, py: 2.5 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: meta.color || 'text.disabled', mr: 3 }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600,  mb: 0.5 }}>
                                                            {item.title || item.variants?.[0]?.text?.replace(/<[^>]+>/g, '').slice(0, 40) || 'Untitled'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            {meta.label} &middot; {formatDate(item.date)}
                                                        </Typography>
                                                    </Box>
                                                    <FiArrowRight size={16} color="var(--color-outline)" style={{ opacity: 0.5 }} />
                                                </ListItemButton>
                                            </ListItem>
                                            {i < recentItems.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Card>
                    </motion.div>
                </Grid>

                {/* What's New */}
                <Grid xs={12} md={6}>
                    <motion.div variants={itemVariants}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, px: 1 }}>
                            <FiZap size={20} color="var(--color-warning)" />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Activity <Typography component="span" color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>(Last 7 days)</Typography></Typography>
                            {newItems.length > 0 && <Chip label={`${newItems.length} new`} size="small" color="primary" sx={{ ml: 'auto', fontWeight: 700, borderRadius: 2 }} />}
                        </Box>
                        <Card sx={{ overflow: 'hidden' }}>
                            <List disablePadding>
                                {newItems.length === 0 ? (
                                    <Box sx={{ p: 6, textAlign: 'center' }}>
                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>Nothing new in the last 7 days.</Typography>
                                    </Box>
                                ) : newItems.slice(0, 8).map((item, i) => {
                                    const meta = (COLLECTION_META[item._collection as keyof typeof COLLECTION_META] || {}) as any;
                                    return (
                                        <React.Fragment key={item._collection}>
                                            <ListItem disablePadding>
                                                <ListItemButton onClick={() => onNavigate(item._collection)} sx={{ px: 3, py: 2.5 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: meta.color || 'text.disabled', mr: 3 }} />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600,  mb: 0.5 }}>
                                                            {item.title || item.variants?.[0]?.text?.replace(/<[^>]+>/g, '').slice(0, 40) || 'Untitled'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                            {meta.label} &middot; {formatDate(item.date)}
                                                        </Typography>
                                                    </Box>
                                                    <FiArrowRight size={16} color="var(--color-outline)" style={{ opacity: 0.5 }} />
                                                </ListItemButton>
                                            </ListItem>
                                            {i < newItems.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;

