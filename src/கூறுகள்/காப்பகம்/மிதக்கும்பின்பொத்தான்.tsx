import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './மிதக்கும்பின்பொத்தான்.css';

/**
 * ARCHIVED: FloatingBackButton
 * Backed up as requested by user.
 * The active desktop back navigation has been migrated into DesktopTopBar.
 */

interface FloatingBackButtonProps {
    to?: string;
    onClick?: (e: React.MouseEvent) => void;
    label?: string;
    className?: string;
}

export const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({ 
    to = '/', 
    onClick, 
    label = "பின்செல்", 
    className = "back-pill bp-fixed" 
}) => {
    const navigate = useNavigate();

    if (onClick) {
        return (
            <button 
                type="button" 
                className={className}
                onClick={onClick}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>{label}</span>
            </button>
        );
    }

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
            <span>{label}</span>
        </Link>
    );
};

export default FloatingBackButton;
