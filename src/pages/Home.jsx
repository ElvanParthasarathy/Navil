import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiLinkedin, FiInstagram } from 'react-icons/fi';

const Home = () => {
    return (
        <div className="page-view page-fade">
            <style>{`
        /* GLOBAL STYLES FOR HOME PAGE ALIGNMENT AND SIZING */
        
        .hero-section {
            /* General layout container */
            padding: 40px 20px; 
            display: flex;
            flex-direction: column;
            align-items: center; /* Center align content horizontally */
            text-align: center; /* Center align text within the container */
            min-height: 80vh; 
            justify-content: center; 
        }

        /* Tamil Name Size */
        .tamil-name {
            font-family: 'Mukta Malar', sans-serif; 
            font-size: 1.6rem; 
            margin-top: 4px; 
            color: var(--text-main);
        }

        /* Real Name Details */
        .real-name-details {
            margin-bottom: 25px; 
            font-size: 0.95rem; 
            color: var(--text-muted); 
            line-height: 1.5;
        }

        /* Contact Links Container */
        .contact-links {
            display: flex;
            flex-direction: row; /* Horizontal alignment */
            flex-wrap: wrap; 
            justify-content: center; /* Center links in the row */
            align-items: center; 
            gap: 20px; 
            margin-top: 30px; 
        }

        /* Individual Contact Link */
        .contact-link-item {
            display: flex; 
            align-items: center; 
            gap: 8px; 
            color: var(--text-main); 
            font-weight: 600; 
            text-decoration: none;
            padding: 8px 15px; 
            border-radius: 25px; 
            transition: all 0.3s ease; /* KEPT: Transition for hover effects */
        }

        .contact-link-item:hover {
            color: var(--accent-text);
            background-color: var(--accent-color); /* Hover effect retained */
            transform: scale(1.05); /* Hover effect retained */
        }

        /* Contact Icon Circle */
        .contact-icon-circle {
            background: var(--bg-card); 
            border: 1px solid var(--border-color);
            padding: 6px; 
            border-radius: 50%; 
            width: 32px; 
            height: 32px;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            font-size: 1rem; 
            flex-shrink: 0;
            color: var(--text-main);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }

        /* Media Query for smaller screens (optional, but good practice) */
        @media (max-width: 600px) {
            .contact-links {
                flex-direction: column;
                gap: 12px;
                width: 100%; 
            }
            .contact-link-item {
                width: 80%; 
                justify-content: center;
            }
        }
      `}</style>
            <div className="hero-section">
                <h1 className="title" style={{ marginBottom: '5px' }}>Elvan Parthasarathy</h1>

                <h2 className="subtitle tamil-name">
                    எல்வன் பார்த்தசாரதி
                </h2>

                <div className="real-name-details">
                    (Real Name: <strong>Jaiprakash P</strong>)<br />
                    (இயற்பெயர்: <strong>பா. ஜெய்பிரகாஷ்</strong>)
                </div>

                <div className="contact-links">
                    <a href="tel:+919345128797" className="contact-link-item">
                        <span className="contact-icon-circle"><FiPhone size={16} /></span>
                        +91 9345128797
                    </a>

                    <a href="mailto:jaiprakashpartha@gmail.com" className="contact-link-item">
                        <span className="contact-icon-circle"><FiMail size={16} /></span>
                        jaiprakashpartha@gmail.com
                    </a>

                    <a href="https://www.linkedin.com/in/jaiprakashpartha" target="_blank" rel="noopener noreferrer" className="contact-link-item">
                        <span className="contact-icon-circle"><FiLinkedin size={16} /></span>
                        LinkedIn
                    </a>

                    <Link to="/library" className="contact-link-item">
                        <span className="contact-icon-circle"><FiInstagram size={16} /></span>
                        Instagram
                    </Link>
                </div>

                <div style={{ height: '20px' }}></div>
            </div>
        </div>
    );
};

export default Home;
