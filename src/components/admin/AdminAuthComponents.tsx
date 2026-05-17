import React, { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import '../../styles/admin-auth.css';

export interface AuthLayoutProps {
    children: React.ReactNode;
    shaking?: boolean;
}

export const AuthLayout = ({ children, shaking }: AuthLayoutProps) => (
    <div className="auth-container">
        <div className="auth-shape shape-1" />
        <div className="auth-shape shape-2" />
        <div className="auth-shape shape-3" />
        <div className="auth-shape shape-4" />
        <div className={`auth-content ${shaking ? 'shake' : ''}`}>
            {children}
        </div>
    </div>
);

export interface AuthHeaderProps {
    title: string;
    subtitle: string;
    logoText?: string;
}

export const AuthHeader = ({ title, subtitle, logoText = "E" }: AuthHeaderProps) => (
    <div className="auth-header animate-enter delay-1">
        <div className="auth-logo-text">{logoText}</div>
        <div className="auth-title">{title}</div>
        <div className="auth-subtitle">{subtitle}</div>
    </div>
);

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const AuthInput = ({ label, value, onChange, type = "text", placeholder, error, ...props }: AuthInputProps) => {
    const [showPass, setShowPass] = useState(false);
    const isPass = type === 'password';

    return (
        <div className="auth-field animate-enter delay-2">
            <label className="auth-label">{label}</label>
            <div className={`auth-input-wrapper ${error ? 'has-error' : ''}`}>
                <input
                    className="auth-input"
                    type={isPass && showPass ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...props}
                />
                {isPass && (
                    <div className="auth-icon-end" onClick={() => setShowPass(!showPass)}>
                        {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                    </div>
                )}
            </div>
            {error && <div className="auth-error">{error}</div>}
        </div>
    );
};

export interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    icon?: React.ReactNode;
    secondary?: boolean;
}

export const AuthButton = ({ children, onClick, disabled, loading, type = "button", icon, secondary, ...props }: AuthButtonProps) => (
    <button
        type={type}
        className={`auth-btn ${secondary ? 'auth-btn-secondary' : ''} animate-enter delay-3`}
        onClick={onClick}
        disabled={disabled || loading}
        {...props}
    >
        {loading ? <div className="btn-loader" /> : (
            <>
                {children}
                {icon}
            </>
        )}
    </button>
);

export const AuthDivider = () => (
    <div className="auth-divider animate-enter delay-3">
        <div className="divider-line" />
        <div className="divider-text">OR</div>
        <div className="divider-line" />
    </div>
);
