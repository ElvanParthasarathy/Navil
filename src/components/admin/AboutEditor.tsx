import React, { useState, useEffect } from 'react';
import { FiSave, FiEdit2, FiX, FiArrowUp, FiArrowDown, FiTrash2, FiPlus } from 'react-icons/fi';
import { db } from '../../lib/firebaseClient';
import RichTextEditor from './RichTextEditor';
import { ref, onValue, set } from 'firebase/database';
import { Box, Typography, Button, Card, CardContent, TextField, Select, MenuItem, IconButton, Grid2 as Grid, Divider } from '@mui/material';

const getInitialAbout = () => {
    try {
        const cached = localStorage.getItem('elvan_about_cache');
        if (cached) return JSON.parse(cached);
    } catch (e) { console.error(e); }
    return null;
};

export const AboutEditor = () => {
    const [data, setData] = useState(getInitialAbout());
    const [isEditing, setIsEditing] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [cards, setCards] = useState<any[]>([]);

    useEffect(() => {
        const aboutRef = ref(db, 'config/about_page');
        const unsub = onValue(aboutRef, (snap) => {
            if (snap.exists()) {
                const val = snap.val();
                setData(val);
                localStorage.setItem('elvan_about_cache', JSON.stringify(val));
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (data) {
            if (data.cards) {
                setCards(data.cards);
            } else {
                const fallbackCards = [
                    {
                        content: `<span lang="ta" style="display: block; margin-bottom: 6px; font-weight: 500;">
    "ஏன் கூடாது?" என்று வினவுகையில் புதிய எண்ணம் பிறக்கிறது.
</span>
<span style="display: block; color: var(--text-muted); font-style: italic; font-weight: 500;">
    Every idea begins with a simple question — why not?
</span>`
                    },
                    { content: data.identity_text || '' },
                    { content: data.education_text || '' },
                    { content: data.social_text || '' },
                    { content: data.philosophy_lines || '' }
                ];
                setCards(fallbackCards);
            }
        }
    }, [data]);

    const handleSave = async () => {
        setSaveStatus('loading');
        try {
            await set(ref(db, 'config/about_page'), data);
            setSaveStatus('success');
            setMessage('About page saved!');
            setIsEditing(false);
        } catch (err: any) {
            setSaveStatus('error');
            setMessage('Error: ' + err.message);
        }
        setTimeout(() => { setSaveStatus('idle'); setMessage(''); }, 3000);
    };

    const updateField = (key: string, val: string) => {
        setData(prev => ({ ...prev, [key]: val }));
    };

    const getSpanClass = (index: number) => {
        const mod = index % 4;
        if (mod === 0) return 'span-7';
        if (mod === 1) return 'span-5';
        if (mod === 2) return 'span-5';
        if (mod === 3) return 'span-7';
        return 'span-7';
    };

    const updateCardSize = (index: number, newSize: string) => {
        const updated = cards.map((c, i) => i === index ? { ...c, size: newSize } : c);
        setCards(updated);
        setData(prev => ({ ...prev, cards: updated }));
    };

    const updateCardContent = (index: number, newContent: string) => {
        const updated = cards.map((c, i) => i === index ? { ...c, content: newContent } : c);
        setCards(updated);
        setData(prev => ({ ...prev, cards: updated }));
    };

    const addCard = () => {
        const newCard = { content: '' };
        const updated = [...cards, newCard];
        setCards(updated);
        setData(prev => ({ ...prev, cards: updated }));
    };

    const deleteCard = (index: number) => {
        const updated = cards.filter((_, i) => i !== index);
        setCards(updated);
        setData(prev => ({ ...prev, cards: updated }));
    };

    const moveCard = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= cards.length) return;
        const updated = [...cards];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setCards(updated);
        setData(prev => ({ ...prev, cards: updated }));
    };

    if (!data) {
        return (
            <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Loading editor...</Typography>
            </Box>
        );
    }

    if (!isEditing) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>About Page</Typography>
                        <Typography variant="body2" color="text.secondary">Manage the content displayed on your About page.</Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => setIsEditing(true)}
                        startIcon={<FiEdit2 size={16} />}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    >
                        Edit Content
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1,  textTransform: 'uppercase',  fontWeight: 800 }}>
                        Bento Grid Cards
                    </Typography>
                    {cards.map((card, idx) => {
                        const size = card.size || getSpanClass(idx);
                        const sizeLabel = size === 'span-5' ? 'Small (Span 5)' : size === 'span-7' ? 'Large (Span 7)' : 'Full Width (Span 12)';
                        return (
                            <PreviewCard key={idx} label={`Card #${idx + 1} (${sizeLabel})`} value={card.content} isHtml />
                        );
                    })}

                    <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1,  textTransform: 'uppercase',  fontWeight: 800,  mt: 3 }}>
                        Contact & Details
                    </Typography>
                    <PreviewCard label="Contact Title (Tamil)" value={data.contact_tamil} />
                    <PreviewCard label="Contact Title (English)" value={data.contact_english} />
                    <PreviewCard label="Contact Desc (Tamil)" value={data.contact_desc_tamil} />
                    <PreviewCard label="Contact Desc (English)" value={data.contact_desc_english} />
                    <PreviewCard label="Location" value={data.location} />
                    <PreviewCard label="Portfolio URL" value={data.portfolio_url} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Edit About Page</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        onClick={() => setIsEditing(false)}
                        startIcon={<FiX size={16} />}
                        sx={{ fontWeight: 600, borderRadius: 2, borderColor: 'divider' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleSave} 
                        disabled={saveStatus === 'loading'}
                        startIcon={<FiSave size={16} />}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    >
                        {saveStatus === 'loading' ? 'Saving...' : 'Save'}
                    </Button>
                </Box>
            </Box>

            {message && (
                <Box sx={{ p: 2, borderRadius: 2, mb: 3, bgcolor: saveStatus === 'error' ? 'error.light' : 'success.light', color: saveStatus === 'error' ? 'error.contrastText' : 'success.contrastText' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{message}</Typography>
                </Box>
            )}

            <SectionLabel>Content Cards (Dynamic Bento Grid)</SectionLabel>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                {cards.map((card, idx) => (
                    <Card key={idx} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', position: 'relative' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase',  fontWeight: 800 }}>Card #{idx + 1}</Typography>
                                    <Select
                                        size="small"
                                        value={card.size || getSpanClass(idx)}
                                        onChange={(e) => updateCardSize(idx, e.target.value)}
                                        sx={{ minWidth: 160, borderRadius: 2 }}
                                    >
                                        <MenuItem value="span-5">Small (Span 5)</MenuItem>
                                        <MenuItem value="span-7">Large (Span 7)</MenuItem>
                                        <MenuItem value="span-12">Full Width (Span 12)</MenuItem>
                                    </Select>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton size="small" onClick={() => moveCard(idx, 'up')} disabled={idx === 0}><FiArrowUp /></IconButton>
                                    <IconButton size="small" onClick={() => moveCard(idx, 'down')} disabled={idx === cards.length - 1}><FiArrowDown /></IconButton>
                                    <IconButton size="small" color="error" onClick={() => deleteCard(idx)}><FiTrash2 /></IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                                <RichTextEditor
                                    content={card.content}
                                    onChange={(v: string) => updateCardContent(idx, v)}
                                    placeholder={`Write content for Card #${idx + 1}...`}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                ))}
                
                <Button 
                    variant="outlined" 
                    startIcon={<FiPlus />} 
                    onClick={addCard}
                    sx={{ alignSelf: 'flex-start', borderRadius: 2, borderStyle: 'dashed', borderWidth: 2 }}
                >
                    Add New Card
                </Button>
            </Box>

            <SectionLabel>Contact Section</SectionLabel>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Contact Title (Tamil)" value={data.contact_tamil || ''} onChange={e => updateField('contact_tamil', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Contact Title (English)" value={data.contact_english || ''} onChange={e => updateField('contact_english', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Contact Desc (Tamil)" value={data.contact_desc_tamil || ''} onChange={e => updateField('contact_desc_tamil', e.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth label="Contact Desc (English)" value={data.contact_desc_english || ''} onChange={e => updateField('contact_desc_english', e.target.value)} />
                </Grid>
            </Grid>

            <SectionLabel>Other</SectionLabel>
            <Grid container spacing={2}>
                <Grid size={12}>
                    <TextField fullWidth label="Location" value={data.location || ''} onChange={e => updateField('location', e.target.value)} />
                </Grid>
                <Grid size={12}>
                    <TextField fullWidth label="Portfolio URL" value={data.portfolio_url || ''} onChange={e => updateField('portfolio_url', e.target.value)} />
                </Grid>
            </Grid>
        </Box>
    );
};

// ── Shared sub-components ──

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: 1.5,  textTransform: 'uppercase',  fontWeight: 800,  mt: 4, mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {children}
    </Typography>
);

const PreviewCard = ({ label, value, isHtml }: { label: string, value: string, isHtml?: boolean }) => (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', p: 2.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1,  textTransform: 'uppercase',  fontWeight: 700,  mb: 1, display: 'block' }}>
            {label}
        </Typography>
        {isHtml ? (
            <Typography variant="body2" component="div" sx={{ lineHeight: 1.6, '& p': { m: 0 } }} dangerouslySetInnerHTML={{ __html: value || '' }} />
        ) : (
            <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {value || <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Empty</Box>}
            </Typography>
        )}
    </Card>
);

export default AboutEditor;
