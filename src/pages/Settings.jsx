import { FiSettings, FiMoon, FiSun } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';

const Settings = () => {
    const { theme, toggleTheme } = useOutletContext();

    return (
        <div className="page-view page-fade">
            <style>{`
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

        .theme-toggle-btn:active {
            transform: translateY(0);
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
            transition: all 0.3s ease;
        }
        
        .cs-icon { 
            font-size: 3.5rem;
            margin-bottom: 20px; 
            animation: gearSpin 4s linear infinite; 
            will-change: transform;
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
