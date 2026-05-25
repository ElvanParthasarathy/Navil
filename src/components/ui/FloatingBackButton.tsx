import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface FloatingBackButtonProps {
    to: string;
    label?: string;
    className?: string;
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({ to, label = "பின்செல்", className = "back-pill desktop-only" }) => {
    const navigate = useNavigate();

    return (
        <Link 
            to={to} 
            className={className}
            onClick={(e) => {
                // If there's browser history within the app, use navigate(-1) for correct back sliding animations
                if (window.history.state && window.history.state.idx > 0) {
                    e.preventDefault();
                    navigate(-1);
                }
            }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
            </svg>
            {label}
        </Link>
    );
};
