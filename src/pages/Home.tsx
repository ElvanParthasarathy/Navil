import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiLinkedin, FiInstagram, FiGrid, FiEdit3, FiLayers, FiChevronRight, FiArrowRight, FiGithub } from 'react-icons/fi';
import profileData from '../data/profile.json';
import AdBanner from '../components/AdBanner';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../components/MobileTopBar';

const Home = () => {
    return (
        <>
            <Helmet>
                <title>Elvan Navil | Creative Portfolio & Writings</title>
                <meta name="description" content="Welcome to the creative space of Elvan Navil (Jaiprakash P). Explore my writings, poems, essays, and personal reflections." />
                <link rel="canonical" href="https://elvanparthasarathy.vercel.app/" />
            </Helmet>
            <MobileTopBar title="நவில்" />
            <div className="home-page page-view fadeIn">
                <style>{`
                .home-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 50px 20px 32px;
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
                    font-size: clamp(2.8rem, 3.6vw, 3.75rem);
                    font-weight: 800;
                    line-height: 1.3;
                    margin-bottom: 12px;
                    letter-spacing: 0;
                    color: var(--text-main);
                }

                .hero-subtitle {
                    font-size: clamp(1.6rem, 2.2vw, 2rem);
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
                    background: color-mix(in srgb, var(--text-main), transparent 92%);
                    color: var(--text-main);
                    border: none;
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

                .mobile-text { display: none; }

                /* GRID SECTIONS */
                .contact-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px;
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border: none;
                    border-radius: 32px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 30px 60px rgba(0, 0, 0, 0.03);
                }

                [data-theme='dark'] .contact-footer {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 45%));
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 30px 70px rgba(0, 0, 0, 0.2);
                }
               .contact-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .contact-divider {
                    width: 2px;
                    height: 24px;
                    background: var(--border-color);
                    opacity: 0.6;
                }

                .contact-info-block h3 {
                    font-weight: 800;
                    margin: 0;
                }
                .contact-info-block h3:first-child {
                    font-size: 1.5rem;
                }
                .contact-info-block h3:last-child {
                    font-size: 1.4rem;
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
                    background: color-mix(in srgb, var(--text-main), transparent 92%);
                    border: none;
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
                @media (max-width: 1023px) {
                    .home-page { padding: 16px 20px; }
                    .home-hero { flex-direction: column; gap: 0; padding: 0; align-items: center; text-align: center; margin-bottom: 40px; }
                    .hero-visual { order: -1; margin-bottom: 24px; }
                    .hero-content { width: 100%; display: flex; flex-direction: column; align-items: center; }
                    .hero-avatar-wrapper { width: clamp(140px, 25vw, 220px); height: clamp(140px, 25vw, 220px); }
                    .hero-avatar { border-radius: 50%; border-width: 4px; }
                    .hero-title { font-size: clamp(2.1rem, 5vw, 2.8rem); margin-bottom: 6px; letter-spacing: -0.5px; }
                    .hero-subtitle { font-size: clamp(1.3rem, 3vw, 1.7rem); margin-bottom: 14px; opacity: 0.9; }
                    .hero-bio { font-size: 1rem; margin-bottom: 28px; line-height: 1.6; max-width: 100%; margin-left: 0; margin-right: 0; white-space: pre-line; }
                    .hero-actions { width: 100%; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 12px; }
                    .hero-btn { width: auto; flex: 1; min-width: 140px; justify-content: center; margin: 0; padding: 12px 16px; font-size: 0.95rem; font-weight: 600; }
                    .desktop-text { display: none; }
                    .mobile-text { display: inline; }
                    
                    .contact-footer { padding: 32px 20px; border-radius: 24px; flex-direction: column !important; gap: 24px; text-align: center; align-items: center; }
                    .contact-header { flex-direction: column; gap: 0px; align-items: center; }
                    .contact-divider { display: none; }
                    .contact-info-block h3:first-child { font-size: 1.4rem; }
                    .contact-info-block h3:last-child { font-size: 1.0rem; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
                    .contact-info-block p { font-size: 1rem; line-height: 1.5; max-width: 100%; margin: 0 auto; padding: 0 10px; }
                    .contact-socials { justify-content: center; gap: 20px; }
                    .social-icon-link { width: 48px; height: 48px; }
                }
                
                .desktop-instruction { display: block; }
                .mobile-instruction { display: none; }
                @media (max-width: 1023px) {
                    .desktop-instruction { display: none; }
                    .mobile-instruction { display: block; }
                }
            `}</style>

                <section className="home-hero animate-entry">
                    <div className="hero-content">
                        <h1 className="hero-title" lang="ta">எல்வன் நவில்</h1>
                        <h2 className="hero-subtitle">Elvan Navil</h2>
                        <div className="hero-signature" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-muted)', opacity: 0.75 }}>
                            <span lang="ta" style={{ fontWeight: 500 }}>எல்வன் பார்த்தசாரதியிடமிருந்து</span>
                            <span style={{ fontWeight: 400 }}>from Elvan Parthasarathy</span>
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

                <div className="category-grid animate-entry" style={{ marginBottom: '48px', animationDelay: '0.1s' }}>
                    {/* Tamil Meaning Card */}
                    <div className="category-card" style={{ cursor: 'default' }}>
                        <div className="cat-icon-box" style={{ background: 'color-mix(in srgb, #f09433 15%, var(--bg-panel))', color: '#f09433' }}>
                            <FiEdit3 />
                        </div>
                        <div className="cat-content">
                            <div className="cat-title" lang="ta">நவில்</div>
                            <div className="cat-title-sub">Tamil Origin</div>
                            <p className="cat-desc" lang="ta" style={{ marginTop: '8px' }}>
                                “நவில்” என்பது தமிழில் “நவிலுதல்” என்னும் சொல்லிலிருந்து வந்தது.
                            </p>
                            <p className="cat-desc-sub" lang="ta">
                                பொருள் — பேசுதல், உரைத்தல், எண்ணங்களை வெளிப்படுத்துதல்.
                            </p>
                        </div>
                    </div>

                    {/* English Meaning Card */}
                    <div className="category-card" style={{ cursor: 'default' }}>
                        <div className="cat-icon-box" style={{ background: 'color-mix(in srgb, #3b82f6 15%, var(--bg-panel))', color: '#3b82f6' }}>
                            <FiLayers />
                        </div>
                        <div className="cat-content">
                            <div className="cat-title">Navil</div>
                            <div className="cat-title-sub">Meaning</div>
                            <p className="cat-desc" style={{ marginTop: '8px' }}>
                                “Navil” is derived from the Tamil word “Naviluthal”.
                            </p>
                            <p className="cat-desc-sub">
                                Means — to speak, utter, narrate, or express thoughts through words.
                            </p>
                        </div>
                    </div>
                </div>

                <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />

                <div className="contact-footer">
                    <div className="contact-info-block" style={{ textAlign: 'center', width: '100%' }}>
                        <div className="desktop-instruction">
                            <h3 lang="ta" style={{ marginBottom: '4px' }}>பக்கங்களை ஆராய</h3>
                            <h3 style={{ marginBottom: '8px' }}>பக்கப்பட்டியை பயன்படுத்துங்கள்.</h3>
                            <p style={{ fontSize: '0.95rem' }}>Use the sidebar to explore the site.</p>
                        </div>
                        <div className="mobile-instruction">
                            <h3 lang="ta" style={{ marginBottom: '4px' }}>கீழ்ப்பட்டியை பயன்படுத்தி</h3>
                            <h3 style={{ marginBottom: '8px' }}>பக்கங்களை ஆராயுங்கள்.</h3>
                            <p style={{ fontSize: '0.95rem' }}>Use the bottom navigation to explore the site.</p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Home;
