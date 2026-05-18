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
                    position: relative;
                }

                .home-page::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-image: url('/assets/home-bg.webp');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    opacity: 0.12;
                    z-index: -1;
                    pointer-events: none;
                }

                [data-theme='dark'] .home-page::before {
                    opacity: 0.05;
                    filter: grayscale(40%);
                }

                /* HERO SECTION - DICTIONARY AESTHETIC */
                .home-hero {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
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
                    width: clamp(280px, 35vw, 400px);
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .hero-avatar-wrapper:hover {
                    transform: scale(1.02) translateY(-4px);
                }

                .hero-avatar-bg {
                    position: absolute;
                    inset: -20px;
                    background: linear-gradient(135deg, color-mix(in srgb, var(--text-main) 10%, transparent), color-mix(in srgb, var(--bg-panel) 50%, transparent));
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    filter: blur(30px);
                    opacity: 0.5;
                    animation: morph 10s linear infinite alternate;
                }

                @keyframes morph {
                    0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
                    100% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
                }

                .hero-avatar {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                    border: none;
                    background: transparent;
                    box-shadow: none;
                    position: relative;
                    z-index: 2;
                    display: block;
                }

                /* TYPOGRAPHY */
                .hero-title {
                    font-size: clamp(2.8rem, 4vw, 4rem);
                    font-weight: 800;
                    line-height: 1.2;
                    margin-bottom: 8px;
                    letter-spacing: -0.02em;
                    color: var(--text-main);
                }

                .hero-subtitle {
                    font-size: clamp(1.6rem, 2.5vw, 2.2rem);
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-bottom: 24px;
                }

                .hero-signature {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    font-size: 1rem;
                    color: var(--text-muted);
                    opacity: 0.85;
                }

                .hero-signature span {
                    line-height: 1.4;
                }

                /* MEANING CARDS */
                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 24px;
                }

                .category-card {
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 40%));
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid color-mix(in srgb, var(--text-main), transparent 94%);
                    border-radius: 28px;
                    padding: 32px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .category-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                    border-color: color-mix(in srgb, var(--text-main), transparent 85%);
                }

                .cat-icon-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    margin-bottom: 20px;
                }

                .cat-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 4px;
                    color: var(--text-main);
                }

                .cat-title-sub {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                }

                .cat-desc {
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: var(--text-main);
                    margin-bottom: 12px;
                }

                .cat-desc-sub {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: var(--text-muted);
                }

                /* EXPLORE FOOTER */
                .explore-footer {
                    margin-top: 40px;
                    padding: 40px 32px;
                    background: linear-gradient(145deg, var(--bg-panel), color-mix(in srgb, var(--bg-panel), transparent 20%));
                    border-radius: 32px;
                    text-align: center;
                    border: 1px solid color-mix(in srgb, var(--text-main), transparent 94%);
                }

                .explore-footer h3 {
                    font-size: clamp(1.4rem, 4vw, 1.6rem);
                    font-weight: 800;
                    margin: 0 0 8px 0;
                    color: var(--text-main);
                }

                .explore-footer p {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    font-weight: 400;
                    margin: 0;
                }

                /* RESPONSIVE */
                @media (max-width: 1023px) {
                    .home-page { padding: 24px 20px; }
                    .home-hero { flex-direction: column; gap: 32px; padding: 0; align-items: center; text-align: center; }
                    .hero-visual { order: -1; }
                    .hero-content { width: 100%; display: flex; flex-direction: column; align-items: center; }
                    .hero-avatar-wrapper { width: clamp(220px, 60vw, 320px); }
                    .hero-avatar { border-radius: 0; }
                    .hero-title { font-size: clamp(2.4rem, 8vw, 3.2rem); }
                    .hero-subtitle { font-size: clamp(1.4rem, 5vw, 1.8rem); margin-bottom: 16px; }
                    
                    .explore-footer { padding: 32px 20px; border-radius: 24px; }
                }

                /* STAGGERED ENTRANCES */
                .stagger-1 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); animation-delay: 0.1s; }
                .stagger-2 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); animation-delay: 0.2s; }
                .stagger-3 { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); animation-delay: 0.3s; }

                @keyframes fadeUp {
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

                {/* HERO: The Identity */}
                <section className="home-hero stagger-1">
                    <div className="hero-content">
                        <h1 className="hero-title" lang="ta">எல்வன் நவில்</h1>
                        <h2 className="hero-subtitle">Elvan Navil</h2>
                        <div className="hero-signature">
                            <span lang="ta" style={{ fontWeight: 600 }}>எல்வன் பார்த்தசாரதியிடமிருந்து</span>
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

                {/* MEANING: The Definition Cards */}
                <div className="category-grid stagger-2" style={{ marginBottom: '40px' }}>
                    {/* Tamil Meaning Card */}
                    <div className="category-card" style={{ cursor: 'default' }}>
                        <div className="cat-icon-box" style={{ background: 'color-mix(in srgb, #f09433 15%, var(--bg-panel))', color: '#f09433' }}>
                            <FiEdit3 />
                        </div>
                        <div className="cat-content">
                            <div className="cat-title" lang="ta">நவில்</div>
                            <div className="cat-title-sub">Tamil Origin</div>
                            <p className="cat-desc" lang="ta">
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
                            <p className="cat-desc">
                                “Navil” is derived from the Tamil word “Naviluthal”.
                            </p>
                            <p className="cat-desc-sub">
                                Means — to speak, utter, narrate, or express thoughts through words.
                            </p>
                        </div>
                    </div>
                </div>

                <AdBanner variant="inline" wrapperStyle={{ margin: '40px 0' }} className="stagger-3" />

                {/* FOOTER: The Invitation to Explore */}
                <div className="explore-footer stagger-3">
                    <h3 lang="ta">பக்கங்களை ஆராயுங்கள்.</h3>
                    <p>Explore the site.</p>
                </div>

            </div>
        </>
    );
};

export default Home;