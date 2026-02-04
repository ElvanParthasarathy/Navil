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
                .section-label {
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .section-label::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border-color);
                }

                .explorer-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-bottom: 80px;
                }

                .explorer-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    padding: 40px;
                    border-radius: 32px;
                    text-decoration: none;
                    color: var(--text-main);
                    transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 280px;
                    position: relative;
                    overflow: hidden;
                }

                .card-icon {
                    width: 60px;
                    height: 60px;
                    background: var(--bg-panel);
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                }

                .card-info {
                    margin-top: 40px;
                }

                .card-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .card-desc {
                    font-size: 1rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                .card-arrow {
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }

                .explorer-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--text-main);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                }

                .explorer-card:hover .card-icon {
                    background: var(--text-main);
                    color: var(--bg-app);
                }

                .explorer-card:hover .card-arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

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
                    .explorer-grid { grid-template-columns: 1fr 1fr; }
                    .explorer-grid > *:last-child { grid-column: span 2; min-height: 200px; }
                }

                @media (max-width: 768px) {
                    .home-hero { flex-direction: column-reverse; gap: 40px; padding: 20px 0; align-items: flex-start; text-align: left; }
                    .hero-avatar-wrapper { width: 200px; height: 200px; }
                    .hero-title { font-size: 2.5rem; }
                    .hero-subtitle { font-size: 1.5rem; }
                    .explorer-grid { grid-template-columns: 1fr; gap: 16px; }
                    .explorer-grid > *:last-child { grid-column: span 1; }
                    .contact-footer { flex-direction: column; gap: 30px; text-align: center; }
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

            <div className="section-label animate-entry">Explorer</div>

            <div className="explorer-grid animate-entry">
                <Link to="/library" className="explorer-card">
                    <div className="card-icon">
                        <FiGrid size={28} />
                    </div>
                    <div className="card-info">
                        <div className="card-title">
                            Library <FiChevronRight className="card-arrow" />
                        </div>
                        <p className="card-desc">A curated collection of {profileData.postsCount} Instagram posts, reels, and highlights.</p>
                    </div>
                </Link>

                <Link to="/writings" className="explorer-card">
                    <div className="card-icon">
                        <FiEdit3 size={28} />
                    </div>
                    <div className="card-info">
                        <div className="card-title">
                            Writings <FiChevronRight className="card-arrow" />
                        </div>
                        <p className="card-desc">Thoughts, quotes, and long-form writings captured over the years.</p>
                    </div>
                </Link>

                <a href="https://jaiprakashpartha.vercel.app" target="_blank" rel="noopener noreferrer" className="explorer-card">
                    <div className="card-icon">
                        <FiLayers size={28} />
                    </div>
                    <div className="card-info">
                        <div className="card-title">
                            Portfolio <FiChevronRight className="card-arrow" />
                        </div>
                        <p className="card-desc">Professional work, projects, and creative endeavors.</p>
                    </div>
                </a>
            </div>

            <section className="contact-footer animate-entry">
                <div className="contact-info-block">
                    <h3>Get in touch</h3>
                    <p>Open for collaborations and creative projects.</p>
                </div>

                <div className="contact-socials">
                    <a href="tel:+919345128797" className="social-icon-link" title="Call">
                        <FiPhone size={20} />
                    </a>
                    <a href="mailto:jaiprakashpartha@gmail.com" className="social-icon-link" title="Email">
                        <FiMail size={20} />
                    </a>
                    <a href="https://www.linkedin.com/in/jaiprakashpartha" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="LinkedIn">
                        <FiLinkedin size={20} />
                    </a>
                    <a href="https://www.instagram.com/elvanparthasarathy" target="_blank" rel="noopener noreferrer" className="social-icon-link" title="Instagram">
                        <FiInstagram size={20} />
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Home;
