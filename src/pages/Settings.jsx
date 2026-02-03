import React from 'react';
import { FiSettings } from 'react-icons/fi';

const Settings = () => {
    return (
        <div className="page-view page-fade">
            <style>{`
        /* LOCAL STYLES FOR SETTINGS PAGE (Using Portfolio styles for consistency) */
        
        .coming-soon-container { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            padding: 40px 20px; 
            background: #fff; 
            border: 1px solid #eee; 
            border-radius: 16px; 
            margin-top: 25px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            transition: opacity 0.3s ease;
        }
        
        /* Icon Styling and Animation Trigger */
        .cs-icon { 
            font-size: 3.5rem;
            margin-bottom: 20px; 
            
            /* ADDED: Spin Animation for the Gear Icon */
            animation: gearSpin 4s linear infinite; 
            will-change: transform;
        }
        
        /* Animation Keyframes: Continuous smooth rotation */
        @keyframes gearSpin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        .cs-title { 
            font-size: 1.4rem; 
            font-weight: 800; 
            color: #111; 
            margin-bottom: 8px; 
        }
        .cs-text { 
            font-size: 0.95rem; 
            color: #666; 
            max-width: 400px; 
            line-height: 1.6; 
        }
      `}</style>
            <div className="hero-section">
                <h1 className="title">Settings</h1>
                <h2 className="subtitle">Manage preferences and view info.</h2>
            </div>

            {/* WORK IN PROGRESS CONTAINER */}
            <div className="coming-soon-container">
                {/* Icon changed to ⚙️ and animation changed to gearSpin */}
                <div className="cs-icon"><FiSettings /></div>
                <div className="cs-title">Work in Progress</div>
                <p className="cs-text">
                    System preferences and configuration options are being built.<br />
                    Check back soon for updates!
                </p>
            </div>

            {/* Add some bottom spacing */}
            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default Settings;
