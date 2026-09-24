import React from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { WarningCircle, ShieldCheck, Info, FileText } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function DisclaimerPage() {
    return (
        <>
            <MobileTopBar title="பொறுப்புத்துறப்பு|disclaimer" />
            <Helmet>
                <title>பொறுப்புத் துறப்பு | Disclaimer — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Legal and informational disclaimer for Elvan Navil studio, Nammil desktop companion, linguistic tools, and Google AdSense advertising." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/disclaimer" />
                <meta property="og:title" content="பொறுப்புத் துறப்பு | Disclaimer — Elvan Navil" />
                <meta property="og:description" content="Official disclaimers regarding software, advertising, and literary content." />
                <meta property="og:url" content="https://elvannavil.vercel.app/disclaimer" />
            </Helmet>

            <FloatingBackButton to="/" />

            <div className="page-view animate-entry" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 20px 80px' }}>
                <style>{`
                    .disclaimer-hero {
                        text-align: center;
                        padding: 32px 16px 24px;
                        margin-bottom: 32px;
                    }
                    .disclaimer-badge {
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
                    .disclaimer-title {
                        font-size: clamp(2rem, 4vw, 2.7rem);
                        font-weight: 800;
                        color: var(--text-main);
                        margin: 0 0 8px;
                        letter-spacing: -0.02em;
                    }
                    .disclaimer-subtitle {
                        font-size: 1.1rem;
                        color: var(--text-muted);
                        margin: 0 0 12px;
                    }
                    .disclaimer-card {
                        background: var(--bg-card);
                        border: 1px solid var(--border-light);
                        border-radius: 20px;
                        padding: 32px;
                        margin-bottom: 24px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                        line-height: 1.8;
                    }
                    .disclaimer-section-title {
                        font-size: 1.35rem;
                        font-weight: 700;
                        color: var(--text-main);
                        margin: 0 0 16px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .disclaimer-p {
                        color: var(--text-muted);
                        font-size: 0.95rem;
                        margin: 0 0 14px;
                    }
                    .disclaimer-ul {
                        margin: 0 0 16px;
                        padding-left: 20px;
                        color: var(--text-muted);
                        font-size: 0.95rem;
                    }
                    .disclaimer-ul li {
                        margin-bottom: 8px;
                    }
                `}</style>

                <header className="disclaimer-hero">
                    <div className="disclaimer-badge">
                        <WarningCircle weight="fill" size={16} />
                        சட்ட மறுப்புரை • LEGAL DISCLAIMER
                    </div>
                    <h1 className="disclaimer-title">பொறுப்புத் துறப்பு • Disclaimer</h1>
                    <p className="disclaimer-subtitle">Transparency, trademark notices, and content disclosures for Elvan Navil</p>
                </header>

                <section className="disclaimer-card">
                    <h2 className="disclaimer-section-title">
                        <Info size={22} weight="regular" />
                        1. பொதுவான தகவல் மறுப்புரை • General Information Disclaimer
                    </h2>
                    <p className="disclaimer-p">
                        All information, literary compositions, articles, essays, and educational tools published on <strong>Elvan Navil</strong> (https://elvannavil.vercel.app) are provided in good faith for cultural, linguistic, educational, and creative enjoyment. While we strive to maintain impeccable accuracy, we make no representations or warranties concerning completeness or contemporary suitability.
                    </p>
                </section>

                <section className="disclaimer-card">
                    <h2 className="disclaimer-section-title">
                        <ShieldCheck size={22} weight="regular" />
                        2. மூன்றாம் தரப்பு வர்த்தக முத்திரைகள் • Trademark Notice
                    </h2>
                    <p className="disclaimer-p">
                        All product and company names mentioned throughout this studio are trademarks™ or registered® trademarks of their respective holders:
                    </p>
                    <ul className="disclaimer-ul">
                        <li><strong>WhatsApp:</strong> WhatsApp is a registered trademark of Meta Platforms, Inc. The <strong>Nammil (நம்மில்)</strong> desktop application is an independent client-side companion software and is <em>not affiliated with, authorized, maintained, sponsored, or endorsed by Meta Platforms, Inc. or WhatsApp</em>.</li>
                        <li><strong>Google &amp; Google AdSense:</strong> Google is a registered trademark of Google LLC. Advertising displayed on this website is served by Google AdSense adhering strictly to their publisher guidelines.</li>
                        <li><strong>Windows:</strong> Windows is a registered trademark of Microsoft Corporation.</li>
                    </ul>
                </section>

                <section className="disclaimer-card">
                    <h2 className="disclaimer-section-title">
                        <FileText size={22} weight="regular" />
                        3. விளம்பரங்கள் மற்றும் ஆட்சென்ஸ் வெளிப்படைத்தன்மை • Advertising Disclosure
                    </h2>
                    <p className="disclaimer-p">
                        To maintain our digital studio, support hosting infrastructure, and continue providing free software and bilingual literature, this website displays contextual advertisements provided by Google AdSense and its certified partners.
                    </p>
                    <p className="disclaimer-p">
                        These advertisements are automatically generated and matched based on page content and user interest. Elvan Navil does not personally endorse the specific commercial products, services, or claims displayed in third-party ad units. Users should perform their own due diligence before engaging with any advertiser.
                    </p>
                </section>

                <section className="disclaimer-card">
                    <h2 className="disclaimer-section-title">
                        <Info size={22} weight="regular" />
                        4. மொழி மற்றும் இலக்கணக் கருவிகள் • Linguistic &amp; Synthesizer Tools
                    </h2>
                    <p className="disclaimer-p">
                        Our linguistic tools—including the <strong>Navil Transliterator</strong> and <strong>Navil Arichuvadi</strong>—are engineered based on Tolkappiyam phonetic principles and historical orthographic models. They are designed to facilitate typing and historical exploration. We do not warrant that all machine transliterations will meet legal certification standards for formal documentation without manual review.
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
                        <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>விதிமுறைகள் / Terms</Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
