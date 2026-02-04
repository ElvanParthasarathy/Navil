import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiLinkedin, FiInstagram, FiGrid, FiEdit3, FiLayers, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { profileData } from '../data/instagramData';

const Home = () => {
    return (
        <div className="home-page page-view fadeIn">
            <style jsx>{`
                .home-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 24px;
                }

                /* HERO SECTION */
                .home-hero {
                    display: flex;
                    align-items: center;
                    gap: 60px;
                    margin-bottom: 80px;
                    padding: 40px 0;
                    position: relative;
                }

                .hero-content {
                    flex: 1;
                    z-index: 2;
                }

                .hero-visual {
                    position: relative;
                    z-index: 1;
                }

                .hero-avatar-wrapper {
                    position: relative;
                    width: 320px;
                    height: 320px;
                }

                .hero-avatar-bg {
                    position: absolute;
                    inset: -20px;
                    background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    filter: blur(40px);
                    opacity: 0.2;
                    animation: morph 10s linear infinite alternate;
                }

                @keyframes morph {
                    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
                }

                .hero-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 20%;
                    object-fit: cover;
                    border: 8px solid var(--bg-card);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    position: relative;
                    z-index: 2;
                }

                .hero-title {
                    font-size: 4rem;
                    font-weight: 800;
                    line-height: 1.1;
                    margin-bottom: 16px;
                    letter-spacing: -2px;
                    color: var(--text-main);
                }

                .hero-subtitle {
                    font-family: 'Mukta Malar', sans-serif;
                    font-size: 2rem;
                    color: var(--text-muted);
                    margin-bottom: 24px;
                }

                .hero-bio {
                    font-size: 1.25rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                    max-width: 600px;
                    margin-bottom: 40px;
                    white-space: pre-line;
                }

                /* QUICK CONTACT BAR */
                .hero-actions {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .hero-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 28px;
                    border-radius: 99px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .hero-btn.primary {
                    background: var(--text-main);
                    color: var(--bg-app);
                }

                .hero-btn.secondary {
                    background: var(--bg-panel);
                    color: var(--text-main);
                    border: 1px solid var(--border-color);
                }

                .hero-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                /* GRID SECTIONS */


                /* CONTACT FOOTER */
                .contact-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 40px;
                    background: var(--bg-panel);
                    border-radius: 32px;
                }

                .contact-info-block h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 4px;
                }

                .contact-info-block p {
                    color: var(--text-muted);
                }

                .contact-socials {
                    display: flex;
                    gap: 12px;
                }

                .social-icon-link {
                    width: 48px;
                    height: 48px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                }

                .social-icon-link:hover {
                    background: var(--text-main);
                    color: var(--bg-app);
                    transform: translateY(-3px);
                }

                /* RESPONSIVE */
                @media (max-width: 1024px) {
                    .hero-title { font-size: 3rem; }
                }

                @media (max-width: 768px) {
                    .home-page { padding: 40px 20px; }
                    .home-hero { flex-direction: column; gap: 0; padding: 0; align-items: center; text-align: center; margin-bottom: 40px; }
                    .hero-visual { order: -1; margin-bottom: 24px; }
                    .hero-content { width: 100%; display: flex; flex-direction: column; align-items: center; }
                    .hero-avatar-wrapper { width: 120px; height: 120px; }
                    .hero-avatar { border-radius: 50%; border-width: 3px; }
                    .hero-title { font-size: 1.6rem; margin-bottom: 4px; letter-spacing: -0.5px; }
                    .hero-subtitle { font-size: 1rem; margin-bottom: 12px; opacity: 0.9; }
                    .hero-bio { font-size: 0.9rem; margin-bottom: 24px; line-height: 1.4; max-width: 300px; margin-left: auto; margin-right: auto; white-space: pre-line; }
                    .hero-actions { width: 100%; flex-direction: column; gap: 10px; }
                    .hero-btn { width: 100%; justify-content: center; margin: 0; padding: 12px 20px; font-size: 0.95rem; }
                    

                    
                    .contact-footer { padding: 32px 24px; border-radius: 24px; flex-direction: column; gap: 24px; text-align: center; }
                    .contact-info-block h3 { font-size: 1.2rem; margin-bottom: 6px; }
                    .contact-info-block p { font-size: 0.95rem; line-height: 1.5; }
                    .contact-socials { justify-content: center; gap: 16px; }
                    .social-icon-link { width: 44px; height: 44px; }
                }
            `}</style>

            <section className="home-hero animate-entry">
                <div className="hero-content">
                    <h1 className="hero-title">{profileData.name} Parthasarathy</h1>
                    <h2 className="hero-subtitle">எல்வன் பார்த்தசாரதி</h2>

                    <p className="hero-bio">
                        {profileData.bio}
                        {"\n\n"}
                        (Real Name: <strong>Jaiprakash P</strong>)
                    </p>

                    <div className="hero-actions">
                        <a href="https://jaiprakashpartha.vercel.app" target="_blank" rel="noopener noreferrer" className="hero-btn primary">
                            View Portfolio <FiArrowRight />
                        </a>
                        <Link to="/library" className="hero-btn secondary">
                            <FiInstagram /> Explore Instagram
                        </Link>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-avatar-wrapper">
                        <div className="hero-avatar-bg"></div>
                        <img
                            src={profileData.profilePic}
                            alt={profileData.name}
                            className="hero-avatar"
                        />
                    </div>
                </div>
            </section>

            <div className="contact-footer animate-entry">
                <div className="contact-info-block">
                    <h3>Let's Connect</h3>
                    <p>Open for collaborations and creative conversations.</p>
                </div>
                <div className="contact-socials">
                    <a href="https://instagram.com/jaiprakash_parthasarathy" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                        <FiInstagram size={20} />
                    </a>
                    <a href="mailto:jaiprakashpartha@gmail.com" className="social-icon-link">
                        <FiMail size={20} />
                    </a>
                    <a href="https://linkedin.com/in/jaiprakashpartha" target="_blank" rel="noopener noreferrer" className="social-icon-link">
                        <FiLinkedin size={20} />
                    </a>
                </div>
            </div>

            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default Home;
