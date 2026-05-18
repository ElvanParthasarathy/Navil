import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../components/MobileTopBar';
import { FiTool } from 'react-icons/fi';

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Elvan Navil | Under Construction</title>
                <meta name="description" content="Welcome to the creative space of Elvan Navil. The home page is currently under construction." />
            </Helmet>
            <MobileTopBar title="நவில்" />
            <div className="home-page page-view fadeIn">
                <style>{`
                .home-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 50px 20px 32px;
                    min-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .construction-icon {
                    font-size: 4rem;
                    color: var(--text-muted);
                    opacity: 0.5;
                    margin-bottom: 24px;
                    animation: float 4s ease-in-out infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }

                .construction-title {
                    font-size: clamp(2.4rem, 4vw, 3rem);
                    font-weight: 800;
                    margin-bottom: 16px;
                    color: var(--text-main);
                    letter-spacing: -0.02em;
                }

                .construction-subtitle {
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    max-width: 500px;
                    line-height: 1.6;
                }
                `}</style>

                <div className="construction-icon">
                    <FiTool />
                </div>
                <h1 className="construction-title">Under Construction</h1>
                <p className="construction-subtitle">
                    The home page is currently being redesigned. Please use the sidebar or mobile menu to explore the other sections of the site!
                </p>
            </div>
        </>
    );
};

export default Home;
