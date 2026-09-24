import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { Scroll, Scales, ShieldCheck, FileText, CheckCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
    return (
        <>
            <MobileTopBar title="விதிமுறைகள்|terms" />
            <Helmet>
                <title>பயன்பாட்டு விதிமுறைகள் | Terms of Service — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Terms of Service and conditions for using Elvan Navil digital studio, Nammil desktop companion, and online Tamil linguistic tools." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/terms" />
                <meta property="og:title" content="பயன்பாட்டு விதிமுறைகள் | Terms of Service — Elvan Navil" />
                <meta property="og:description" content="Official terms and conditions governing the use of Elvan Navil content, software, and tools." />
                <meta property="og:url" content="https://elvannavil.vercel.app/terms" />
            </Helmet>

            <FloatingBackButton to="/" />

            <div className="page-view animate-entry" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 20px 80px' }}>
                <style>{`
                    .terms-hero {
                        text-align: center;
                        padding: 32px 16px 24px;
                        margin-bottom: 32px;
                    }
                    .terms-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 6px 16px;
                        border-radius: 100px;
                        background: color-mix(in srgb, var(--text-main) 8%, transparent);
                        color: var(--text-main);
                        font-size: 0.82rem;
                        font-weight: 600;
                        margin-bottom: 16px;
                        letter-spacing: 0.5px;
                    }
                    .terms-title {
                        font-size: clamp(2rem, 4vw, 2.7rem);
                        font-weight: 800;
                        color: var(--text-main);
                        margin: 0 0 8px;
                        letter-spacing: -0.02em;
                    }
                    .terms-subtitle {
                        font-size: 1.1rem;
                        color: var(--text-muted);
                        margin: 0 0 12px;
                    }
                    .terms-updated {
                        font-size: 0.8rem;
                        color: var(--text-muted);
                        opacity: 0.7;
                    }
                    .terms-card {
                        background: var(--bg-card);
                        border: 1px solid var(--border-light);
                        border-radius: 20px;
                        padding: 32px;
                        margin-bottom: 24px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                        line-height: 1.8;
                    }
                    .terms-section-title {
                        font-size: 1.35rem;
                        font-weight: 700;
                        color: var(--text-main);
                        margin: 0 0 16px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .terms-p {
                        color: var(--text-muted);
                        font-size: 0.95rem;
                        margin: 0 0 14px;
                    }
                    .terms-ul {
                        margin: 0 0 16px;
                        padding-left: 20px;
                        color: var(--text-muted);
                        font-size: 0.95rem;
                    }
                    .terms-ul li {
                        margin-bottom: 8px;
                    }
                `}</style>

                <header className="terms-hero">
                    <div className="terms-badge">
                        <Scales weight="fill" size={16} />
                        சட்ட விதிமுறைகள் • TERMS &amp; CONDITIONS
                    </div>
                    <h1 className="terms-title">பயன்பாட்டு விதிமுறைகள் • Terms of Service</h1>
                    <p className="terms-subtitle">Legal guidelines, intellectual property rights, and terms of software usage</p>
                    <p className="terms-updated">Last Updated: September 2026 • Effective Immediately</p>
                </header>

                <section className="terms-card">
                    <h2 className="terms-section-title">
                        <FileText size={22} weight="regular" />
                        1. அறிமுகமும் ஒப்புதலும் • Introduction &amp; Acceptance
                    </h2>
                    <p className="terms-p">
                        Welcome to <strong>Elvan Navil</strong> (https://elvannavil.vercel.app), an independent bilingual digital creation studio established and operated by <strong>Elvan Parthasarathy (Jaiprakash P)</strong>. 
                    </p>
                    <p className="terms-p">
                        By accessing, browsing, downloading software from, or otherwise interacting with this website, you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, along with our <Link to="/privacy" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Privacy Policy</Link> and <Link to="/disclaimer" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Disclaimer</Link>. If you do not accept these terms, please discontinue using the website and associated services.
                    </p>
                </section>

                <section className="terms-card">
                    <h2 className="terms-section-title">
                        <Scroll size={22} weight="regular" />
                        2. அறிவுசார் சொத்துரிமை • Intellectual Property Rights
                    </h2>
                    <p className="terms-p">
                        All original creative, literary, aesthetic, and technical materials published across Elvan Navil are the sole intellectual property of Elvan Parthasarathy unless otherwise attributed. This encompasses:
                    </p>
                    <ul className="terms-ul">
                        <li><strong>கவிதைகள் மற்றும் இலக்கியப் படைப்புகள் (Literature &amp; Poetry):</strong> Original Tamil poems, philosophical quotes, short stories, serialized narratives, and critical essays.</li>
                        <li><strong>வடிவமைப்பு மற்றும் கலைகள் (Visual Arts &amp; Typography):</strong> Bespoke typefaces (e.g. Elvan Sans), vector artworks, digital graphics, and illustrations.</li>
                        <li><strong>மென்பொருள் மூலக்குறியீடு (Software Code):</strong> Proprietary algorithms powering the Navil Transliterator (Tamil phonetic engine), Arichuvadi, Piano Synthesizer, and the Nammil desktop companion application.</li>
                    </ul>
                    <p className="terms-p">
                        Personal, non-commercial reading and sharing of quotes or verses with explicit author attribution (<em>"Elvan Parthasarathy / Elvan Navil"</em>) is warmly permitted. Commercial syndication, re-publication, automated scraping, or unauthorized redistribution without prior written consent is strictly prohibited.
                    </p>
                </section>

                <section className="terms-card">
                    <h2 className="terms-section-title">
                        <ShieldCheck size={22} weight="regular" />
                        3. மென்பொருள் மற்றும் கருவிகள் பயன்பாடு • Software &amp; Tools License
                    </h2>
                    <p className="terms-p">
                        Elvan Navil provides desktop applications and web-based utilities subject to the following principles:
                    </p>
                    <ul className="terms-ul">
                        <li><strong>நம்மில் கணினிச் செயலி (Nammil Desktop Companion):</strong> Provided free of charge for personal productivity on Windows. You may not reverse-engineer, decompile, redistribute for commercial profit, or package malicious modifications of Nammil.</li>
                        <li><strong>உள்ளமைவுத் தனியுரிமை (Client-Side Privacy):</strong> All tools (Transliterator, Arichuvadi, Piano) process text and audio directly within your local browser runtime. Nammil maintains all sessions on your local machine without intermediary data retention.</li>
                        <li><strong>பயன்பாட்டு வரம்பு (Acceptable Use):</strong> You agree not to utilize our tools for unlawful communications, generation of abusive material, or disruptive attacks against our hosting infrastructure.</li>
                    </ul>
                </section>

                <section className="terms-card">
                    <h2 className="terms-section-title">
                        <Scales size={22} weight="regular" />
                        4. விளம்பரங்கள் மற்றும் மூன்றாம் தரப்புச் சேவைகள் • Third-Party Services &amp; Advertising
                    </h2>
                    <p className="terms-p">
                        Our website integrates verified third-party partners to support our ongoing creation studio:
                    </p>
                    <ul className="terms-ul">
                        <li><strong>கூகுள் ஆட்சென்ஸ் (Google AdSense):</strong> We partner with Google AdSense to serve non-intrusive, relevant advertisements. Google uses cookies to display ads based on prior visits. See our <Link to="/privacy" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Privacy Policy</Link> for opt-out details.</li>
                        <li><strong>வெளிப்புற இணைப்புகள் (External Links):</strong> Links to external platforms (GitHub, LinkedIn, ImageKit, Cloudinary, Firebase) are provided for reference. We hold no responsibility for third-party privacy practices or external content.</li>
                    </ul>
                </section>

                <section className="terms-card">
                    <h2 className="terms-section-title">
                        <FileText size={22} weight="regular" />
                        5. உத்தரவாத மறுப்பும் பொறுப்பு வரம்பும் • Disclaimers &amp; Limitation of Liability
                    </h2>
                    <p className="terms-p">
                        All materials, tools, and downloads provided on Elvan Navil are supplied on an <strong>"as is"</strong> and <strong>"as available"</strong> basis without warranties of any kind, whether express or implied.
                    </p>
                    <p className="terms-p">
                        Under no circumstances shall Elvan Parthasarathy or Elvan Navil be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your access to, use of, or inability to use the website, literary content, or software tools.
                    </p>
                </section>

                <section className="terms-card">
                    <h2 className="terms-section-title">
                        <CheckCircle size={22} weight="regular" />
                        6. சட்ட வரம்பும் தொடர்பும் • Governing Law &amp; Contact
                    </h2>
                    <p className="terms-p">
                        These Terms of Service shall be governed by and interpreted in accordance with the laws of the Republic of India, under the jurisdiction of the courts in Tamil Nadu, India.
                    </p>
                    <p className="terms-p">
                        If you have questions, licensing proposals, or clarification requests regarding these Terms, please reach out via our dedicated <Link to="/contact" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Contact Page</Link> or email <strong>jaiprakashpartha@gmail.com</strong>.
                    </p>
                </section>

                {/* Footer Navigation */}
                <footer style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 8px' }}>© 2026 Elvan Navil (எல்வன் நவில்) • Independent Bilingual Digital Creation Studio</p>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>முகப்பு / Home</Link>
                        <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>பற்றி / About</Link>
                        <Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>தொடர்பு / Contact</Link>
                        <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>தனியுரிமை / Privacy Policy</Link>
                        <Link to="/disclaimer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>பொறுப்புத் துறப்பு / Disclaimer</Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
