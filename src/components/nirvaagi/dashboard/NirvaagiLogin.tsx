import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Box, Typography, TextField, Button, Paper, InputAdornment, IconButton, CircularProgress } from '@mui/material';

const NirvaagiLogin = ({ onLogin }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setErrorMsg('');
        if (loading) return;

        if (!username.trim() || !password) {
            return;
        }

        setLoading(true);
        const result = await onLogin(username.trim(), password);
        setLoading(false);

        if (!result.success) {
            setErrorMsg(result.error || 'Login failed');
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
            <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, width: '100%', maxWidth: 400, borderRadius: 6, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>Nirvaagi Portal</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>Sign in to manage your content</Typography>
                </Box>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <TextField
                        label="Email address"
                        type="text"
                        placeholder="Enter nirvaagi email"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                        autoFocus
                        autoComplete="username"
                        fullWidth
                        variant="outlined"
                    />

                    <TextField
                        label="Password"
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                        autoComplete="current-password"
                        fullWidth
                        variant="outlined"
                    />

                    {errorMsg && (
                        <Typography variant="body2" color="error" sx={{ textAlign: 'center', fontWeight: 600 }}>
                            {errorMsg}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FiArrowRight />}
                        sx={{ py: 1.5, borderRadius: 3, fontWeight: 700, fontSize: '1rem' }}
                    >
                        {loading ? 'Signing In...' : 'Sign In with Email'}
                    </Button>

                </form>
            </Paper>
        </Box>
    );
};

export default NirvaagiLogin;
