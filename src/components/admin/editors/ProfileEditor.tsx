import React from 'react';
import { FiEdit3, FiX, FiCheck } from 'react-icons/fi';
import { Box, Typography, Button, Card, CardContent, TextField, Avatar, Grid, Divider } from '@mui/material';

export const ProfileEditor = ({
    profileData,
    isProfileEditing,
    setIsProfileEditing,
    onUpdateProfile,
    onSave
}) => {
    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Profile Details</Typography>
                <Box>
                    {!isProfileEditing ? (
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => setIsProfileEditing(true)}
                            startIcon={<FiEdit3 size={16} />}
                            sx={{ fontWeight: 600, borderRadius: 2 }}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                color="inherit" 
                                onClick={() => setIsProfileEditing(false)}
                                startIcon={<FiX size={16} />}
                                sx={{ fontWeight: 600, borderRadius: 2, borderColor: 'divider' }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={onSave}
                                startIcon={<FiCheck size={16} />}
                                sx={{ fontWeight: 600, borderRadius: 2 }}
                            >
                                Save Profile
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper' }}>
                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                    {!isProfileEditing ? (
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 4, alignItems: { xs: 'center', sm: 'flex-start' } }}>
                            <Avatar sx={{ width: 100, height: 100, fontSize: '3rem', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                                {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'A'}
                            </Avatar>
                            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>{profileData.name}</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, whiteSpace: 'pre-wrap' }}>
                                    {profileData.bio}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 4, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{profileData.followers || 0}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase',  fontWeight: 600 }}>Followers</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{profileData.following || 0}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase',  fontWeight: 600 }}>Following</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{profileData.postsCount || 0}</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase',  fontWeight: 600 }}>Posts</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Full Name"
                                        fullWidth
                                        variant="outlined"
                                        value={profileData.name || ''}
                                        onChange={(e) => onUpdateProfile('name', e.target.value)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        label="Bio"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        variant="outlined"
                                        value={profileData.bio || ''}
                                        onChange={(e) => onUpdateProfile('bio', e.target.value)}
                                    />
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase',  fontWeight: 700 }}>Instagram Stats</Typography>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Followers"
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        value={profileData.followers || 0}
                                        onChange={(e) => onUpdateProfile('followers', parseInt(e.target.value) || 0)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Following"
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        value={profileData.following || 0}
                                        onChange={(e) => onUpdateProfile('following', parseInt(e.target.value) || 0)}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        label="Posts"
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        value={profileData.postsCount || 0}
                                        onChange={(e) => onUpdateProfile('postsCount', parseInt(e.target.value) || 0)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};
