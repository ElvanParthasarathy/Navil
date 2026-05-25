// @ts-nocheck
import React from 'react';
import { FiSettings, FiMoon, FiSun, FiMonitor } from 'react-icons/fi';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../components/ui/MobileTopBar';

const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useOutletContext();

    return (
        <>
            <MobileTopBar title="அமைப்புகள்|settings" />
            <Helmet>
                <title>அமைப்புகள் | Settings</title>
            </Helmet>
            <div className="settings-page page-view animate-entry">
            <style>{`
                .settings-page {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 32px 20px 80px;
                }

                .settings-hero {
                    text-align: left;
                    margin-bottom: 48px;
                    padding-top: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                }

                .settings-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 8px;
                    letter-spacing: -1px;
                    color: var(--text-main);
                }

                .settings-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                /* THEME SECTION */
                .section-label {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 16px;
                    padding-left: 12px;
                }

                .settings-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    border-radius: 24px;
                    padding: 24px;
                    margin-bottom: 40px;
                }

                /* THEME SLIDER */
                .theme-slider-container {
                    background: var(--bg-panel);
                    border-radius: 18px;
                    padding: 6px;
                    display: flex;
                    position: relative;
                }

                .theme-option {
                    flex: 1;
                    padding: 12px;
                    border-radius: 14px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                    z-index: 2;
                }

                .theme-option:hover {
                    color: var(--text-main);
                }

                .theme-option.active {
                    color: var(--bg-app);
                }

                /* Active Indicator pill */
                .slider-indicator {
                    position: absolute;
                    top: 6px;
                    bottom: 6px;
                    background: var(--text-main);
                    border-radius: 14px;
                    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                    z-index: 1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                /* Calculate positions based on 3 items */
                /* 
                   0% for first item
                   33.33% width
                   left: 0, 33.33%, 66.66%
                */
                .slider-indicator { width: calc(33.33% - 4px); }
                
                [data-active-theme="light"] .slider-indicator { left: 6px; }
                [data-active-theme="auto"] .slider-indicator { left: calc(50% - (33.33% / 2) + 2px); } /* Centered? No wait. 3 items. Left is 33.33% + spacer? */
                
                /* Let's use simple flex logic or inline styles for the indicator translate */
                
                /* Coming Soon */
                .coming-soon-container { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    text-align: center; 
                    padding: 48px 20px; 
                    opacity: 0.6;
                }
                
                .cs-icon { 
                    font-size: 2.5rem;
                    margin-bottom: 20px; 
                    animation: gearSpin 8s linear infinite; 
                    color: var(--text-main);
                }
                
                @keyframes gearSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .settings-hero {
                        text-align: center;
                        display: block;
                    }
                }
            `}</style>

            <div className="settings-hero animate-entry">
                <div>
                    <h1 className="settings-title">Settings</h1>
                    <h2 className="settings-subtitle">Personalize your experience.</h2>
                </div>
                <Link 
                    to="/" 
                    className="back-pill desktop-only"
                    onClick={(e) => {
                        if (window.history.state && window.history.state.idx > 0) {
                            e.preventDefault();
                            navigate(-1);
                        }
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </div>

            <div className="settings-section animate-entry" style={{ animationDelay: '0.1s' }}>
                <h3 className="section-label">Appearance</h3>

                <div className="settings-card">
                    <div className="theme-slider-container" data-active-theme={theme || 'auto'}>
                        {/* Indicator */}
                        <div className="slider-indicator" style={{
                            transform: `translateX(${theme === 'light' ? '0%' :
                                    theme === 'auto' ? '100%' : '200%'
                                })`,
                            left: '6px',
                            /* Adjust widths precisely or use flex logic */
                            /* Simpler logic: */
                            /* With 3 flex:1 items, each is 33.3% wide. */
                            /* Transform X: 0%, 100%, 200% of its OWN width */
                            /* But we have padding 6px on container. */
                        }}></div>

                        <button
                            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <FiSun size={18} /> Light
                        </button>

                        <button
                            className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                            onClick={() => setTheme('auto')}
                        >
                            <FiMonitor size={18} /> Auto
                        </button>

                        <button
                            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <FiMoon size={18} /> Dark
                        </button>
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {theme === 'auto' ? 'Syncs with your system preferences.' :
                            theme === 'dark' ? 'Dark mode is active.' : 'Light mode is active.'}
                    </p>
                </div>
            </div>

            <div className="coming-soon-container animate-entry" style={{ animationDelay: '0.2s' }}>
                <div className="cs-icon"><FiSettings /></div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>More Coming Soon</h3>
                <p style={{ fontSize: '0.95rem' }}>
                    Profile customization and extra configuration options are being built.
                </p>
            </div>

        </div>
        </>
    );
};

export default Settings;

