import React from 'react';
import profileData from '../data/profile.json';
import { FiMapPin, FiPhone, FiMail, FiLinkedin, FiGithub, FiArrowRight } from 'react-icons/fi';
import AdBanner from '../components/AdBanner';
import { Helmet } from 'react-helmet-async';

const About = () => {
    return (
        <>
            <Helmet>
                <title>About Elvan Parthasarathy</title>
                <meta name="description" content="Learn more about Jaiprakash P (Elvan Parthasarathy), a pre-final year engineering student, writer, and creator based in Tamil Nadu." />
                <link rel="canonical" href="https://elvanparthasarathy.vercel.app/about" />
            </Helmet>
            <div className="about-page page-view animate-entry">
                <style>{`
                .about-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 10px 20px 80px;
                }

                .about-hero {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    margin-bottom: 56px;
                    padding-top: 24px;
                }

                .hero-avatar-wrapper {
                    position: relative;
                    width: 180px;
                    height: 180px;
                    margin-bottom: 24px;
                }

                .hero-avatar-bg {
                    position: absolute;
                    inset: -15px;
                    background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    filter: blur(30px);
                    opacity: 0.25;
                    animation: morph 10s linear infinite alternate;
                }

                @keyframes morph {
                    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
                }

                .hero-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 6px solid var(--bg-app);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                    position: relative;
                    z-index: 2;
                }

                .hero-title {
                    font-size: clamp(2rem, 4vw, 2.8rem);
                    font-weight: 800;
                    margin-bottom: 8px;
                    letter-spacing: -1px;
                    color: var(--text-main);
                }

                .hero-subtitle {
                    font-size: clamp(1.1rem, 2vw, 1.3rem);
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .about-portfolio-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 24px;
                    padding: 14px 32px;
                    background-color: var(--text-main);
                    color: var(--bg-app);
                    border-radius: 99px;
                    font-weight: 700;
                    text-decoration: none;
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, box-shadow 0.2s ease;
                    font-size: 1.05rem;
                    border: none;
                    cursor: pointer;
                }

                @media (hover: hover) and (pointer: fine) {
                    .about-portfolio-btn:hover {
                        transform: translateY(-4px) scale(1.02);
                        background-color: color-mix(in srgb, var(--text-main) 85%, transparent);
                        box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1); /* Subtle glow for dark mode */
                    }
                }

                .about-portfolio-btn:active {
                    transform: scale(0.96) translateY(0) !important;
                    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }

                /* BENTO GRID LAYOUT */
                .about-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    margin-bottom: 64px;
                }

                .about-card {
                    background: var(--bg-panel);
                    border: 1px solid transparent;
                    padding: 32px;
                    border-radius: 28px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    height: 100%;
                }

                @media (hover: hover) and (pointer: fine) {
                    .about-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                        background: var(--bg-card);
                        border-color: var(--border-light);
                        z-index: 2;
                    }
                }

                .card-title {
                    font-size: 0.95rem;
                    font-weight: 800;
                    margin-bottom: 20px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    opacity: 0.7;
                }

                .card-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-main);
                    font-weight: 500;
                }

                .card-text strong {
                    color: var(--text-main);
                    font-weight: 800;
                }

                /* PHILOSOPHY TEXT */
                .philosophy-text {
                    font-size: 1.35rem;
                    line-height: 1.5;
                    color: var(--text-main);
                    font-style: italic;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                /* CONTACT FOOTER */
                .contact-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px;
                    background: var(--bg-panel);
                    border-radius: 32px;
                    flex-wrap: wrap;
                    gap: 24px;
                }

                .contact-info .contact-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
                .contact-info .contact-header h3:first-child { font-size: 1.5rem; }
                .contact-info .contact-header h3:last-child { font-size: 1.4rem; }
                .contact-divider { width: 2px; height: 24px; background: var(--border-color); opacity: 0.6; }
                .contact-info h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; }
                .contact-location { display: flex; align-items: center; gap: 8px; color: var(--text-muted); margin-top: 8px; font-size: 0.95rem; }
                .contact-socials { display: flex; gap: 12px; }
                .social-icon-link { width: 44px; height: 44px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-main); transition: all 0.3s ease; }
                @media (hover: hover) and (pointer: fine) { .social-icon-link:hover { background: var(--text-main); color: var(--bg-app); transform: translateY(-3px); } }
                .social-icon-link:active { background: var(--text-main); color: var(--bg-app); transform: scale(0.95); }
                .about-footer-text { text-align: center; margin-top: 40px; color: var(--text-muted); font-size: 0.9rem; opacity: 0.7; }

                /* RESPONSIVE & DESKTOP GRID */
                @media (min-width: 768px) {
                    .about-grid {
                        grid-template-columns: repeat(12, 1fr);
                        gap: 24px;
                    }
                    
                    /* Row 1 */
                    .card-identity { grid-column: span 7; }
                    .card-education { grid-column: span 5; }
                    
                    /* Row 2 */
                    .card-social { grid-column: span 5; }
                    .card-philosophy { grid-column: span 7; }
                }

                @media (max-width: 768px) {
                   .about-page { padding: 40px 20px 80px; }
                   .hero-avatar-wrapper { width: 140px; height: 140px; }
                   .about-grid { grid-template-columns: 1fr; gap: 16px; margin-bottom: 40px; }
                   .about-card { padding: 28px; border-radius: 24px; }
                   
                   .contact-footer { flex-direction: column; text-align: center; padding: 32px 20px; }
                   .contact-info { width: 100%; }
                   .contact-header { flex-direction: column; gap: 0px; align-items: center; }
                   .contact-divider { display: none; }
                   .contact-info .contact-header h3:first-child { font-size: 1.4rem; }
                   .contact-info .contact-header h3:last-child { font-size: 1.0rem; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
                   .contact-location { justify-content: center; }
                   .contact-socials { justify-content: center; flex-wrap: wrap; }
                   .social-icon-link { width: 48px; height: 48px; }
                }
            `}</style>

            <section className="about-hero animate-entry">
                <div className="hero-avatar-wrapper">
                    <div className="hero-avatar-bg"></div>
                    <img
                        src={profileData.profilePic}
                        alt={profileData.name}
                        className="hero-avatar"
                    />
                </div>
                <h1 className="hero-title">Elvan Parthasarathy</h1>
                <h2 className="hero-subtitle">(Known as Jaiprakash P)</h2>

                <a href="https://jaiprakashpartha.vercel.app" target="_blank" rel="noopener noreferrer" className="about-portfolio-btn">
                    View Portfolio <FiArrowRight />
                </a>
            </section>

            <div className="about-grid animate-entry" style={{ animationDelay: '0.1s' }}>
                <div className="about-card card-identity">
                    <h3 className="card-title">Identity</h3>
                    <p className="card-text">
                        My real name is <strong>Jaiprakash P</strong>.<br />
                        <strong>Elvan Parthasarathy</strong> is the name I chose for my creations, inventions, and innovations.<br />
                        Academically, I go by <strong>Jaiprakash P</strong>.
                    </p>
                </div>

                <div className="about-card card-education">
                    <h3 className="card-title">Education</h3>
                    <p className="card-text">
                        I’m currently pursuing my <strong>Bachelor of Engineering</strong> at <strong>RMD Engineering College</strong>, and I’m in my <strong>pre-final year</strong>.
                    </p>
                </div>

                <div className="about-card card-social">
                    <h3 className="card-title">Social Presence</h3>
                    <p className="card-text">
                        I’m not active on social media apart from WhatsApp, LinkedIn, and Snapchat. I prefer a quieter space where I can write, think, and create freely.
                    </p>
                </div>

                <div className="about-card card-philosophy">
                    <div className="philosophy-text">
                        <span>"This website is where I share:</span>
                        <span>A simple place.</span>
                        <span>My own place.</span>
                        <span>Where every word is mine."</span>
                    </div>
                </div>
            </div>

            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />

            <div className="contact-footer animate-entry" style={{ animationDelay: '0.2s' }}>
                <div className="contact-info">
                    <div className="contact-header">
                        <h3 lang="ta" style={{ margin: 0 }}>இணைவோம்</h3>
                        <div className="contact-divider"></div>
                        <h3 style={{ margin: 0 }}>Let's Connect</h3>
                    </div>
                    <p lang="ta" style={{ color: '#888888', marginTop: 0, marginBottom: 0 }}>புதிய படைப்புகளுக்கும் உரையாடல்களுக்கும்.</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px', marginBottom: 0 }}>Open for collaborations and creative conversations.</p>
                    <div className="contact-location">
                        <FiMapPin /> Arani, Tamil Nadu - 632317 (Currently in Chennai)
                    </div>
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

            <footer className="about-footer-text animate-entry" style={{ animationDelay: '0.3s' }}>
                <p>Made with passion & curiosity</p>
                <p>© 2026 — Elvan Parthasarathy</p>
            </footer>

        </div>
        </>
    );
};

export default About;
