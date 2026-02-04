import React from 'react';
import { FiSettings, FiMoon, FiSun, FiLayers } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
    const { theme, toggleTheme } = useOutletContext();

    return (
        <div className="page-view page-fade">
            <style jsx>{`
                .settings-section {
                    margin-top: 30px;
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                    color: var(--text-main);
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .settings-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    border-radius: 20px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                }

                .clickable-card:hover {
                    border-color: var(--text-main);
                    transform: translateY(-2px);
                    background: var(--nav-hover);
                }

                .settings-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .settings-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--bg-panel);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-main);
                }

                .settings-label {
                    font-weight: 600;
                    color: var(--text-main);
                }

                .theme-toggle-btn {
                    background: var(--bg-panel);
                    border: 1px solid var(--border-light);
                    padding: 8px 16px;
                    border-radius: 10px;
                    color: var(--text-main);
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .theme-toggle-btn:hover {
                    background: var(--nav-hover);
                    transform: translateY(-2px);
                }

                .coming-soon-container { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    text-align: center; 
                    padding: 40px 20px; 
                    background: var(--bg-card); 
                    border: 1px solid var(--border-light); 
                    border-radius: 16px; 
                    margin-top: 25px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                .cs-icon { 
                    font-size: 3.5rem;
                    margin-bottom: 20px; 
                    animation: gearSpin 4s linear infinite; 
                    color: var(--text-main);
                }
                
                @keyframes gearSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .cs-title { 
                    font-size: 1.4rem; 
                    font-weight: 800; 
                    color: var(--text-main); 
                    margin-bottom: 8px; 
                }
                .cs-text { 
                    font-size: 0.95rem; 
                    color: var(--text-muted); 
                    max-width: 400px; 
                    line-height: 1.6; 
                }

                @media (max-width: 768px) {
                    .settings-section { margin-top: 24px; }
                    .section-title { font-size: 0.9rem; margin-bottom: 12px; }
                    .settings-card { padding: 16px; border-radius: 16px; }
                    .settings-icon { width: 36px; height: 36px; border-radius: 10px; }
                    .settings-label { font-size: 0.95rem; }
                    .theme-toggle-btn { padding: 6px 12px; font-size: 0.9rem; }
                    
                    .hero-section { text-align: center; }
                    .hero-section .title { font-size: 1.8rem; }
                    .hero-section .subtitle { font-size: 1rem; }
                    
                    .coming-soon-container { padding: 32px 16px; margin-top: 20px; }
                    .cs-icon { font-size: 2.5rem; margin-bottom: 16px; }
                    .cs-title { font-size: 1.2rem; }
                    .cs-text { font-size: 0.85rem; line-height: 1.5; }
                }
            `}</style>

            <div className="hero-section">
                <h1 className="title">Settings</h1>
                <h2 className="subtitle">Manage preferences and view info.</h2>
            </div>

            <div className="settings-section">
                <h3 className="section-title">Appearance</h3>
                <div className="settings-card">
                    <div className="settings-info">
                        <div className="settings-icon">
                            {theme === 'dark' ? <FiMoon size={20} /> : <FiSun size={20} />}
                        </div>
                        <div className="settings-label">Dark Mode</div>
                    </div>
                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
            </div>

            <div className="settings-section">
                <h3 className="section-title">External</h3>
                <a href="https://jaiprakashpartha.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="settings-card clickable-card">
                        <div className="settings-info">
                            <div className="settings-icon">
                                <FiLayers size={20} />
                            </div>
                            <div className="settings-label">View Portfolio</div>
                        </div>
                        <div className="theme-toggle-btn">
                            Visit
                        </div>
                    </div>
                </a>
            </div>

            <div className="coming-soon-container">
                <div className="cs-icon"><FiSettings /></div>
                <div className="cs-title">More Settings Coming Soon</div>
                <p className="cs-text">
                    Profile customization and extra configuration options are being built.<br />
                    Check back soon for updates!
                </p>
            </div>

            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default Settings;
