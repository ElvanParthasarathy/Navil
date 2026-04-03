import React, { useState } from 'react';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [shaking, setShaking] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
            return;
        }
        const success = onLogin(username.trim(), password);
        if (!success) {
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
        }
    };

    return (
        <div className="admin-login-backdrop">
            <div className={`admin-login-card ${shaking ? 'shake' : ''}`}>
                <div className="admin-login-logo">E</div>
                <h1 className="admin-login-title">Admin Panel</h1>
                <p className="admin-login-subtitle">Sign in to manage your content</p>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="admin-login-field">
                        <FiUser className="admin-login-field-icon" size={16} />
                        <input
                            id="admin-username"
                            type="text"
                            placeholder="Email address"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                            autoComplete="username"
                        />
                    </div>
                    <div className="admin-login-field">
                        <FiLock className="admin-login-field-icon" size={16} />
                        <input
                            id="admin-password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    <button id="admin-login-btn" type="submit" className="admin-login-submit">
                        <span>Sign In</span>
                        <FiArrowRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
