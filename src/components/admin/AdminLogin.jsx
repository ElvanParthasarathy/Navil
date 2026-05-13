import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { AuthLayout, AuthHeader, AuthInput, AuthButton } from './AdminAuthComponents';

const AdminLogin = ({ onLogin, onGoogleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [shaking, setShaking] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (loading) return;

        if (!username.trim() || !password) {
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
            return;
        }

        setLoading(true);
        const result = await onLogin(username.trim(), password);
        setLoading(false);

        if (!result.success) {
            setErrorMsg(result.error || 'Login failed');
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
        }
    };

    return (
        <AuthLayout shaking={shaking}>
            <AuthHeader
                title="Admin Portal"
                subtitle="Sign in to manage your content"
            />

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <AuthInput
                    label="Email address"
                    type="text"
                    placeholder="Enter admin email"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                    autoFocus
                    autoComplete="username"
                />

                <AuthInput
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                    autoComplete="current-password"
                />

                {errorMsg && (
                    <div style={{ 
                        color: 'var(--auth-danger, #EF5350)', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        textAlign: 'center', 
                        marginBottom: '16px',
                        animation: 'enterFade 0.3s ease-out'
                    }}>
                        {errorMsg}
                    </div>
                )}

                <AuthButton
                    type="submit"
                    loading={loading}
                    icon={<FiArrowRight size={18} />}
                >
                    Sign In with Email
                </AuthButton>

                <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', opacity: 0.6 }}>
                    <div style={{ flex: 1, height: '1px', background: 'currentColor' }} />
                    <span style={{ padding: '0 10px', fontSize: '12px' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'currentColor' }} />
                </div>

                <AuthButton
                    type="button"
                    onClick={async () => {
                        setErrorMsg('');
                        if (loading) return;
                        setLoading(true);
                        const result = await onGoogleLogin();
                        setLoading(false);
                        if (!result.success) {
                            setErrorMsg(result.error || 'Google login failed');
                            setShaking(true);
                            setTimeout(() => setShaking(false), 500);
                        }
                    }}
                    loading={loading}
                    style={{ background: '#4285F4', color: 'white' }}
                >
                    Sign In with Google
                </AuthButton>
            </form>
        </AuthLayout>
    );
};

export default AdminLogin;
