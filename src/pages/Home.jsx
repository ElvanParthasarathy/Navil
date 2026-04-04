import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiLinkedin, FiInstagram, FiGrid, FiEdit3, FiLayers, FiChevronRight, FiArrowRight, FiGithub } from 'react-icons/fi';
import profileData from '../data/profile.json';
import AdBanner from '../components/AdBanner';

const Home = () => {
    return (
        <div className="home-page page-view fadeIn">
            <style>{`
                .home-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }

                /* HERO SECTION */
                .home-hero {
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    margin-bottom: 56px;
                    padding: 24px 0;
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
                    width: 260px;
                    height: 260px;
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
                    font-size: clamp(2.6rem, 3.2vw, 3.25rem);
                    font-weight: 800;
                    line-height: 1.1;
                    margin-bottom: 12px;
                    letter-spacing: 0;
                    color: var(--text-main);
                }

                .hero-subtitle {
                    font-family: 'Mukta Malar', sans-serif;
                    font-size: clamp(1.4rem, 2vw, 1.75rem);
                    color: var(--text-muted);
                    margin-bottom: 16px;
                }

                .hero-bio {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                    max-width: 600px;
                    margin-bottom: 28px;
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
                    padding: 10px 22px;
                    border-radius: 99px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s ease;
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

                @media (hover: hover) and (pointer: fine) {
                    .hero-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
                    }
                    .hero-btn.secondary:hover {
                        background: var(--text-main);
                        color: var(--bg-app);
                        border-color: var(--text-main);
                    }
                }

                .hero-btn:active {
                    transform: scale(0.98);
                }

                /* GRID SECTIONS */


                /* CONTACT FOOTER */
                .contact-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px;
                    background: var(--bg-panel);
                    border-radius: 32px;
                }

                .contact-info-block h3 {
                    font-size: 1.35rem;
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
                    width: 44px;
                    height: 44px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                }

                @media (hover: hover) and (pointer: fine) {
                    .social-icon-link:hover {
                        background: var(--text-main);
                        color: var(--bg-app);
                        transform: translateY(-3px);
                    }
                }

                .social-icon-link:active {
                    background: var(--text-main);
                    color: var(--bg-app);
                    transform: scale(0.95);
                }

                /* RESPONSIVE */
                @media (max-width: 1024px) {
                    .hero-avatar-wrapper { width: 220px; height: 220px; }
                    .hero-title { font-size: 2.6rem; }
                    .hero-subtitle { font-size: 1.5rem; }
                }

                @media (max-width: 768px) {
                    .home-page { padding: 40px 20px; }
                    .home-hero { flex-direction: column; gap: 0; padding: 0; align-items: center; text-align: center; margin-bottom: 40px; }
                    .hero-visual { order: -1; margin-bottom: 24px; }
                    .hero-content { width: 100%; display: flex; flex-direction: column; align-items: center; }
                    .hero-avatar-wrapper { width: 120px; height: 120px; }
                    .hero-avatar { border-radius: 50%; border-width: 3px; }
                    .hero-title { font-size: 1.8rem; margin-bottom: 6px; letter-spacing: -0.5px; }
                    .hero-subtitle { font-size: 1.1rem; margin-bottom: 14px; opacity: 0.9; }
                    .hero-bio { font-size: 1rem; margin-bottom: 28px; line-height: 1.6; max-width: 90%; margin-left: auto; margin-right: auto; white-space: pre-line; }
                    .hero-actions { width: 100%; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 12px; }
                    .hero-btn { width: auto; flex: 1; min-width: 140px; justify-content: center; margin: 0; padding: 12px 16px; font-size: 0.95rem; font-weight: 600; }
                    
                    .contact-footer { padding: 36px 24px; border-radius: 24px; flex-direction: column !important; gap: 24px; text-align: center; }
                    .contact-info-block h3 { font-size: 1.25rem; margin-bottom: 8px; font-weight: 800; }
                    .contact-info-block p { font-size: 1rem; line-height: 1.6; max-width: 260px; margin: 0 auto; }
                    .contact-socials { justify-content: center; gap: 20px; }
                    .social-icon-link { width: 48px; height: 48px; }
                }
            `}</style>

            <section className="home-hero animate-entry">
                <div className="hero-content">
                    <h1 className="hero-title" lang="ta">எல்வன் பார்த்தசாரதி</h1>
                    <h2 className="hero-subtitle">{profileData.name} Parthasarathy</h2>

                    <div className="hero-bio">
                        <span lang="ta" style={{ display: 'block', marginBottom: '4px' }}>
                            "ஏன் கூடாது?" என்று வினவுகையில் புதிய எண்ணம் பிறக்கிறது.
                        </span>
                        <span style={{ fontSize: '0.95rem', opacity: 0.8, display: 'block', marginBottom: '16px' }}>{profileData.bio}</span>

                        <span lang="ta" style={{ display: 'block', fontWeight: 600 }}>இயற்பெயர்: பா. ஜெய்பிரகாஷ்</span>
                        <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>(Real Name: Jaiprakash P)</span>
                    </div>

                    <div className="hero-actions">
                        <a href="https://jaiprakashpartha.vercel.app" target="_blank" rel="noopener noreferrer" className="hero-btn primary">
                            View Portfolio <FiArrowRight />
                        </a>
                        <Link to="/archive" className="hero-btn secondary">
                            <FiInstagram /> Explore Insta Archive
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

            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />

            <div className="contact-footer animate-entry">
                <div className="contact-info-block">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h3 lang="ta" style={{ fontSize: '1.5rem', margin: 0 }}>இணைவோம்</h3>
                        <div style={{ width: '2px', height: '24px', background: 'var(--border-color)', opacity: 0.6 }}></div>
                        <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Let's Connect</h3>
                    </div>

                    <p lang="ta" style={{ color: '#888888', marginTop: 0, marginBottom: 0 }}>புதிய படைப்புகளுக்கும் உரையாடல்களுக்கும்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px', marginBottom: 0 }}>Open for collaborations and creative conversations.</p>
                </div>
                <div className="contact-socials">
                    <a href="tel:+919345128797" className="social-icon-link">
                        <FiPhone size={20} />
                    </a>
                    <a href="mailto:jaiprakashpartha@gmail.com" className="social-icon-link">
                        <FiMail size={20} />
                    </a>
                    <a href="https://linkedin.com/in/jaiprakashpartha" target="_blank" rel="noreferrer" className="social-icon-link">
                        <FiLinkedin size={20} />
                    </a>
                    <a href="https://github.com/elvanparthasarathy" target="_blank" rel="noreferrer" className="social-icon-link">
                        <FiGithub size={20} />
                    </a>
                </div>
            </div>

            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default Home;
