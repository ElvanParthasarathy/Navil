// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useTheme } from '../../App';
import { Monitor } from '@phosphor-icons/react';

interface MobileTopBarProps {
    title: string;
    showBack?: boolean;
    backUrl?: string;
    onBack?: () => void;
    isBeta?: boolean;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({ title, showBack = false, backUrl, onBack, isBeta }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileMenuView, setMobileMenuView] = useState('main');
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Close menu on navigation
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isInside = (event.target as Element).closest('.mobile-menu-zone');
            if (mobileMenuRef.current && !isInside) {
                setIsMobileMenuOpen(false);
            }
        };
        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else if (backUrl) {
            navigate(backUrl);
        } else {
            navigate('/');
        }
    };

    const isHome = location.pathname === '/';
    const hasBack = showBack || !isHome;

    return (
        <header className={`mobile-topbar ${!isHome ? 'is-centered' : ''} ${hasBack ? 'has-back' : ''}`}>
            <div className="mobile-topbar-left">
                {hasBack && (
                    <button 
                        className="mobile-back-btn" 
                        onClick={handleBack}
                        aria-label="Go back"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                )}
            </div>
            
            <div className="brand">
                {title === 'நவில்' || title === 'நவில்|navil' || title === 'எல்வன்' || title === 'எல்வன்|elvan' ? (
                    <div className="brand-bilingual" lang="ta">
                        நவில்
                        <span className="brand-subtitle">Navil</span>
                    </div>
                ) : title.includes('|') ? (
                    <>
                        <div className="brand-main">
                            {title.split('|')[0]}
                            {isBeta && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: '#333', color: '#fff', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold', letterSpacing: '0.5px' }}>BETA</span>}
                        </div>
                        <div className="brand-sub">{title.split('|')[1].toLowerCase()}</div>
                    </>
                ) : (
                    <>
                        {title}
                        {isBeta && <span style={{ marginLeft: '8px', fontSize: '0.65rem', background: '#333', color: '#fff', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'bold', letterSpacing: '0.5px' }}>BETA</span>}
                    </>
                )}
            </div>

            <div className="top-bar-actions">
                <div className="mobile-menu-zone" ref={mobileMenuRef}>
                    <button 
                        className="top-dot-btn"
                        onClick={(e) => { 
                            e.stopPropagation();
                            setIsMobileMenuOpen(prev => !prev); 
                            setMobileMenuView('main'); 
                        }}
                        aria-label="More options"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                        </svg>
                    </button>

                    {isMobileMenuOpen && (
                        <>
                            <div className="menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
                            <div className="top-menu-dropdown" style={{ height: mobileMenuView === 'main' ? '112px' : '220px' }}>
                                <div className="menu-slider-track" style={{ transform: mobileMenuView === 'main' ? 'translateX(0%)' : 'translateX(-50%)' }}>

                                    {/* MAIN MENU */}
                                    <div className="menu-view">
                                        <Link to="/teaching" onClick={() => setIsMobileMenuOpen(false)} className="menu-item">
                                            <Monitor weight="regular" className="menu-icon" />
                                            Teaching
                                        </Link>
                                        <button onClick={() => setMobileMenuView('appearance')} className="menu-item space-between">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25Zm0 1.5v16.5c4.557 0 8.25-3.693 8.25-8.25 0-4.557-3.693-8.25-8.25-8.25Z" clipRule="evenodd" />
                                                </svg>
                                                <span>Appearance</span>
                                            </div>
                                            <svg style={{ width: '18px', height: '18px', opacity: 0.4 }} viewBox="0 0 24 24" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* APPEARANCE SUB-MENU */}
                                    <div className="menu-view">
                                        <button onClick={() => setMobileMenuView('main')} className="menu-item back-btn">
                                            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                                            </svg>
                                            Back
                                        </button>
                                        <button onClick={() => setTheme('auto')} className={`menu-item ${theme === 'auto' ? 'selected' : ''}`}>
                                            <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
                                                <path fillRule="evenodd" d="M8.625 1.5A3.375 3.375 0 0 0 5.25 4.875v14.25a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.875A3.375 3.375 0 0 0 15.375 1.5h-6.75ZM7.5 4.875a1.125 1.125 0 0 1 1.125-1.125h6.75a1.125 1.125 0 0 1 1.125 1.125v14.25a1.125 1.125 0 0 1-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.125V4.875Z" clipRule="evenodd" />
                                            </svg>
                                            Auto System
                                        </button>
                                        <button onClick={() => setTheme('light')} className={`menu-item ${theme === 'light' ? 'selected' : ''}`}>
                                            <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                                            </svg>
                                            Light Mode
                                        </button>
                                        <button onClick={() => setTheme('dark')} className={`menu-item ${theme === 'dark' ? 'selected' : ''}`}>
                                            <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                                            </svg>
                                            Dark Mode
                                        </button>
                                    </div>

                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default MobileTopBar;
