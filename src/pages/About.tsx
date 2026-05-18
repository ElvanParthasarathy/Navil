import React, { useState, useEffect } from 'react';
import profileData from '../data/profile.json';
import { FiMapPin, FiPhone, FiMail, FiLinkedin, FiGithub, FiArrowRight } from 'react-icons/fi';
import AdBanner from '../components/AdBanner';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import MobileTopBar from '../components/MobileTopBar';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';

const getInitialAbout = () => {
    try {
        const cached = localStorage.getItem('elvan_about_cache');
        if (cached) return JSON.parse(cached);
    } catch (e) { console.error(e); }
    return null;
};

const getSpanClass = (index: number) => {
    const mod = index % 5;
    if (mod === 0) return 'span-12';
    if (mod === 1) return 'span-7';
    if (mod === 2) return 'span-5';
    if (mod === 3) return 'span-5';
    if (mod === 4) return 'span-7';
    return 'span-12';
};

const About = () => {
    const navigate = useNavigate();
    const [about, setAbout] = useState(getInitialAbout());

    // Real-time Firebase listener — syncs and updates cache
    useEffect(() => {
        const unsub = onValue(ref(db, 'config/about_page'), (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                setAbout(data);
                localStorage.setItem('elvan_about_cache', JSON.stringify(data));
            }
        });
        return () => unsub();
    }, []);

    if (!about) {
        return (
            <>
                <MobileTopBar title="பற்றி|about" />
                <div style={{ height: '100vh', background: 'var(--bg-app)' }} />
            </>
        );
    }

    const cards = about.cards || [
        {
            content: `<span lang="ta" style="display: block; margin-bottom: 6px; font-weight: 500;">
    "ஏன் கூடாது?" என்று வினவுகையில் புதிய எண்ணம் பிறக்கிறது.
</span>
<span style="display: block; color: var(--text-muted); font-style: italic; font-weight: 500;">
    Every idea begins with a simple question — why not?
</span>`
        },
        { content: about.identity_text || '' },
        { content: about.education_text || '' },
        { content: about.social_text || '' },
        { content: about.philosophy_lines || '' }
    ];

    return (
        <>
            <MobileTopBar title="பற்றி|about" />
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
                    padding: 0 20px 80px;
                    position: relative;
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

                .hero-bio {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                    max-width: 600px;
                    margin-top: 20px;
                    white-space: pre-line;
                    text-align: center;
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
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border: none;
                    padding: 32px;
                    border-radius: 28px;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    height: 100%;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                }

                [data-theme='dark'] .about-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 45%));
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                @media (hover: hover) and (pointer: fine) {
                    .about-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
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
                .philosophy-text p {
                    margin: 0;
                }

                /* CONTACT FOOTER */
                .contact-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 32px;
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border: none;
                    border-radius: 32px;
                    flex-wrap: wrap;
                    gap: 24px;
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
                    margin: 0;
                    line-height: 1.6;
                }

                .contact-right-side {
                    display: flex;
                    flex-direction: column-reverse;
                    align-items: flex-end;
                    gap: 12px;
                }

                .contact-location {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    line-height: 1.5;
                    padding: 8px 16px;
                    background: color-mix(in srgb, var(--text-main), transparent 92%);
                    border: none;
                    border-radius: 99px;
                }
                
                .contact-location svg {
                    flex-shrink: 0;
                }

                .contact-socials { display: flex; gap: 12px; }

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

                .about-footer-text { text-align: center; margin-top: 40px; color: var(--text-muted); font-size: 0.9rem; opacity: 0.7; }

                /* RESPONSIVE & DESKTOP GRID */
                @media (min-width: 1024px) {
                    .about-grid {
                        grid-template-columns: repeat(12, 1fr);
                        gap: 24px;
                    }
                    
                    .span-12 { grid-column: span 12; }
                    .span-7 { grid-column: span 7; }
                    .span-5 { grid-column: span 5; }
                }

                @media (max-width: 1023px) {
                   .about-page { padding: 16px 20px 80px; }
                   .hero-avatar-wrapper { width: 140px; height: 140px; }
                   .about-grid { grid-template-columns: 1fr; gap: 16px; margin-bottom: 40px; }
                   .about-card { padding: 28px; border-radius: 24px; }
                   
                   .contact-footer { padding: 32px 28px; border-radius: 24px; flex-direction: column !important; gap: 24px; text-align: center; align-items: center; }
                   .contact-header { flex-direction: column; gap: 0px; align-items: center; }
                   .contact-divider { display: none; }
                   .contact-info-block h3:first-child { font-size: 1.4rem; }
                   .contact-info-block h3:last-child { font-size: 1.0rem; color: var(--text-muted); font-weight: 600; margin-top: 2px; }
                   .contact-info-block p { font-size: 1rem; line-height: 1.5; max-width: 100%; margin: 0 auto; padding: 0 10px; }
                   
                   .contact-right-side {
                       flex-direction: column;
                       align-items: center;
                       gap: 20px;
                   }
                   
                   .contact-socials { justify-content: center; gap: 20px; flex-wrap: wrap; }
                   .social-icon-link { width: 48px; height: 48px; }
                }
            `}</style>

            <Link 
                to="/" 
                className="back-pill desktop-only"
                onClick={(e) => {
                    if (window.history.state && window.history.state.idx > 0) {
                        e.preventDefault();
                        navigate(-1);
                    }
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
            </Link>

            <section className="about-hero animate-entry">
                <div className="hero-avatar-wrapper">
                    <div className="hero-avatar-bg"></div>
                    <img src={profileData.profilePic} alt={profileData.name} className="hero-avatar" />
                </div>
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

                <a href={about.portfolio_url} target="_blank" rel="noopener noreferrer" className="about-portfolio-btn">
                    View Portfolio <FiArrowRight />
                </a>
            </section>

            <div className="about-grid animate-entry" style={{ animationDelay: '0.1s' }}>
                {cards.map((card, idx) => (
                    <div key={idx} className={`about-card ${getSpanClass(idx)}`}>
                        <div className="card-text" dangerouslySetInnerHTML={{ __html: card.content }} />
                    </div>
                ))}
            </div>


            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />

            <div className="contact-footer animate-entry" style={{ animationDelay: '0.2s' }}>
                <div className="contact-info-block">
                    <div className="contact-header">
                        <h3 lang="ta">{about.contact_tamil}</h3>
                        <div className="contact-divider"></div>
                        <h3>{about.contact_english}</h3>
                    </div>

                    <p lang="ta" style={{ color: '#888888', marginTop: 0, marginBottom: 0 }}>{about.contact_desc_tamil}</p>
                    <p style={{ fontSize: '0.85rem', color: '#888888', marginTop: '4px', marginBottom: 0 }}>{about.contact_desc_english}</p>
                </div>

                <div className="contact-right-side">
                    <div className="contact-location">
                        <FiMapPin size={14} />
                        <span>{about.location}</span>
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
