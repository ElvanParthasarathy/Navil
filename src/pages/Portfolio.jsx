import React from 'react';
import { FiBox } from 'react-icons/fi';

const Portfolio = () => {
    return (
        <div className="page-view page-fade">
            <style>{`
        /* LOCAL STYLES FOR PORTFOLIO PAGE */
        
        .coming-soon-container { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            text-align: center; 
            padding: 40px 20px; /* Reduced padding for compact look */
            background: #fff; 
            border: 1px solid #eee; 
            border-radius: 16px; 
            margin-top: 25px; /* Added spacing */
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            
            /* Ensures smooth re-entry transition */
            transition: opacity 0.3s ease;
        }
        
        /* Icon Styling and Animation Trigger */
        .cs-icon { 
            font-size: 3.5rem; /* Large icon size */
            margin-bottom: 20px; 
            
            /* ADDED: Bounce Animation */
            animation: simpleBounce 2.5s infinite ease-in-out; 
            will-change: transform;
        }
        
        /* Animation Keyframes */
        @keyframes simpleBounce {
            0%, 100% {
                transform: translateY(0) rotate(0deg);
            }
            25% {
                transform: translateY(-8px) rotate(-2deg); /* Bounce up and slight tilt */
            }
            50% {
                transform: translateY(0) rotate(2deg);
            }
            75% {
                transform: translateY(-4px) rotate(-1deg);
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
                <h1 className="title">Portfolio</h1>
                <h2 className="subtitle">Selected works and ongoing experiments.</h2>
            </div>

            {/* WORK IN PROGRESS CONTAINER */}
            <div className="coming-soon-container">
                {/* The icon now has the animation applied */}
                <div className="cs-icon"><FiBox /></div>
                <div className="cs-title">Building Something Cool</div>
                <p className="cs-text">
                    I am currently documenting my projects and case studies.<br />
                    Check back soon to see what I've been working on.
                </p>
            </div>

            {/* Add some bottom spacing */}
            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default Portfolio;
