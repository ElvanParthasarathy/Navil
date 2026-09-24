import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { 
    EnvelopeSimple, 
    MapPin, 
    GithubLogo, 
    LinkedinLogo, 
    InstagramLogo, 
    CheckCircle, 
    PaperPlaneTilt,
    Clock,
    ChatsCircle,
    UserCheck,
    Globe
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [sentStatus, setSentStatus] = useState(false);

    const contactEmail = 'jaiprakashpartha@gmail.com';

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(contactEmail);
            setCopiedEmail(true);
            setTimeout(() => setCopiedEmail(false), 2500);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(
            formState.subject || `Inquiry from ${formState.name || 'Visitor'}`
        )}&body=${encodeURIComponent(
            `Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`
        )}`;
        window.location.href = mailtoUrl;
        setSentStatus(true);
        setTimeout(() => setSentStatus(false), 5000);
    };

    return (
        <>
            <MobileTopBar title="தொடர்பு|contact" />
            <Helmet>
                <title>தொடர்பு | Contact Us — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Get in touch with Elvan Parthasarathy (Jaiprakash P) at Elvan Navil. Inquiries for software engineering, desktop tools, literary licensing, or technical feedback." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/contact" />
                <meta property="og:title" content="தொடர்பு | Contact Us — Elvan Navil" />
                <meta property="og:description" content="Direct contact channel for Elvan Navil digital studio. Reach the creator for collaborations, inquiries, or support." />
                <meta property="og:url" content="https://elvannavil.vercel.app/contact" />
            </Helmet>

            <FloatingBackButton to="/" />

            <div className="page-view animate-entry" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 20px 80px' }}>
                <style>{`
                    .contact-hero {
                        text-align: center;
                        padding: 32px 16px 28px;
                        margin-bottom: 32px;
                    }
                    .contact-badge {
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
                    .contact-title {
                        font-size: clamp(2rem, 4vw, 2.7rem);
                        font-weight: 800;
                        color: var(--text-main);
                        margin: 0 0 8px;
                        letter-spacing: -0.02em;
                    }
                    .contact-subtitle {
                        font-size: 1.05rem;
                        color: var(--text-muted);
                        margin: 0 0 12px;
                        max-width: 620px;
                        margin-inline: auto;
                        line-height: 1.6;
                    }
                    .contact-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 24px;
                        margin-bottom: 40px;
                    }
                    @media (max-width: 768px) {
                        .contact-grid {
                            grid-template-columns: 1fr;
                        }
                    }
                    .contact-card {
                        background: var(--bg-card);
                        border: 1px solid var(--border-light);
                        border-radius: 20px;
                        padding: 28px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    }
                    .contact-item {
                        display: flex;
                        align-items: flex-start;
                        gap: 16px;
                        margin-bottom: 24px;
                    }
                    .contact-item:last-child {
                        margin-bottom: 0;
                    }
                    .contact-icon-box {
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        background: color-mix(in srgb, var(--text-main) 7%, transparent);
                        color: var(--text-main);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }
                    .contact-item-title {
                        font-size: 0.85rem;
                        color: var(--text-muted);
                        margin: 0 0 4px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        font-weight: 600;
                    }
                    .contact-item-val {
                        font-size: 1rem;
                        color: var(--text-main);
                        font-weight: 600;
                        margin: 0;
                        word-break: break-word;
                    }
                    .copy-btn {
                        background: var(--text-main);
                        color: var(--bg-app);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 8px;
                        font-size: 0.85rem;
                        font-weight: 600;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        margin-top: 10px;
                        transition: transform 0.15s ease, opacity 0.15s ease;
                    }
                    .copy-btn:hover {
                        opacity: 0.9;
                        transform: translateY(-1px);
                    }
                    .contact-form-input {
                        width: 100%;
                        padding: 12px 14px;
                        border-radius: 10px;
                        border: 1px solid var(--border-light);
                        background: var(--bg-app);
                        color: var(--text-main);
                        font-size: 0.95rem;
                        margin-bottom: 16px;
                        box-sizing: border-box;
                        font-family: inherit;
                        outline: none;
                        transition: border-color 0.2s ease;
                    }
                    .contact-form-input:focus {
                        border-color: var(--text-main);
                    }
                    .contact-form-btn {
                        width: 100%;
                        padding: 14px;
                        background: var(--text-main);
                        color: var(--bg-app);
                        border: none;
                        border-radius: 12px;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        transition: opacity 0.2s ease, transform 0.15s ease;
                    }
                    .contact-form-btn:hover {
                        opacity: 0.92;
                        transform: translateY(-1px);
                    }
                    .social-row {
                        display: flex;
                        gap: 12px;
                        margin-top: 16px;
                        flex-wrap: wrap;
                    }
                    .social-chip {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px 16px;
                        border-radius: 99px;
                        border: 1px solid var(--border-light);
                        background: var(--bg-app);
                        color: var(--text-main);
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 600;
                        transition: background-color 0.2s ease, border-color 0.2s ease;
                    }
                    .social-chip:hover {
                        background: color-mix(in srgb, var(--text-main) 6%, transparent);
                        border-color: var(--text-main);
                    }
                `}</style>

                <header className="contact-hero">
                    <div className="contact-badge">
                        <ChatsCircle weight="fill" size={16} />
                        தொடர்பு • GET IN TOUCH
                    </div>
                    <h1 className="contact-title">தொடர்பு கொள்ள • Contact Us</h1>
                    <p className="contact-subtitle">
                        Have an inquiry, feedback regarding our software tools, or interest in collaborating on bilingual literary creations? We are always pleased to connect.
                    </p>
                </header>

                <div className="contact-grid">
                    {/* Direct Contact Info */}
                    <div className="contact-card">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 20px', color: 'var(--text-main)' }}>
                            தொடர்பு விவரங்கள் • Direct Information
                        </h2>

                        <div className="contact-item">
                            <div className="contact-icon-box">
                                <UserCheck size={22} weight="regular" />
                            </div>
                            <div>
                                <p className="contact-item-title">உருவாக்கியவர் • Creator</p>
                                <p className="contact-item-val">Elvan Parthasarathy (Jaiprakash P)</p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Founder &amp; Developer, Elvan Navil
                                </p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon-box">
                                <EnvelopeSimple size={22} weight="regular" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p className="contact-item-title">மின்னஞ்சல் • Official Email</p>
                                <p className="contact-item-val">{contactEmail}</p>
                                <button className="copy-btn" onClick={handleCopyEmail}>
                                    {copiedEmail ? <CheckCircle size={16} weight="fill" /> : <EnvelopeSimple size={16} />}
                                    {copiedEmail ? 'Email Copied!' : 'Copy Email Address'}
                                </button>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon-box">
                                <MapPin size={22} weight="regular" />
                            </div>
                            <div>
                                <p className="contact-item-title">இடம் • Location &amp; Timezone</p>
                                <p className="contact-item-val">Tamil Nadu, India (IST / UTC+05:30)</p>
                            </div>
                        </div>

                        <div className="contact-item">
                            <div className="contact-icon-box">
                                <Clock size={22} weight="regular" />
                            </div>
                            <div>
                                <p className="contact-item-title">பதில் காலக்கெடு • Response Window</p>
                                <p className="contact-item-val">Within 24–48 Business Hours</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                            <p className="contact-item-title" style={{ marginBottom: '8px' }}>இணையவழி இணைப்புகள் • Web Profiles</p>
                            <div className="social-row">
                                <a 
                                    href="https://github.com/ElvanParthasarathy" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="social-chip"
                                >
                                    <GithubLogo size={18} /> GitHub
                                </a>
                                <a 
                                    href="https://linkedin.com/in/elvanparthasarathy" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="social-chip"
                                >
                                    <LinkedinLogo size={18} /> LinkedIn
                                </a>
                                <a 
                                    href="https://instagram.com/elvanparthasarathy" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="social-chip"
                                >
                                    <InstagramLogo size={18} /> Instagram
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Quick Inquiry Form */}
                    <div className="contact-card">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>
                            செய்தி அனுப்ப • Send a Message
                        </h2>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
                            Fill out the form below to initiate an email draft directly to our inbox.
                        </p>

                        <form onSubmit={handleFormSubmit}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                உங்கள் பெயர் • Your Name
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder="e.g. Anbarasan / John Doe" 
                                className="contact-form-input" 
                                value={formState.name}
                                onChange={e => setFormState({ ...formState, name: e.target.value })}
                            />

                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                மின்னஞ்சல் • Your Email Address
                            </label>
                            <input 
                                type="email" 
                                required
                                placeholder="name@example.com" 
                                className="contact-form-input" 
                                value={formState.email}
                                onChange={e => setFormState({ ...formState, email: e.target.value })}
                            />

                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                பொருள் • Subject
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder="Subject of inquiry or software feedback" 
                                className="contact-form-input" 
                                value={formState.subject}
                                onChange={e => setFormState({ ...formState, subject: e.target.value })}
                            />

                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                                செய்தி • Message
                            </label>
                            <textarea 
                                required
                                rows={4}
                                placeholder="How can we assist you?" 
                                className="contact-form-input" 
                                style={{ resize: 'vertical' }}
                                value={formState.message}
                                onChange={e => setFormState({ ...formState, message: e.target.value })}
                            />

                            <button type="submit" className="contact-form-btn">
                                <PaperPlaneTilt size={18} weight="fill" />
                                மின்னஞ்சல் அனுப்ப • Open Email Draft
                            </button>

                            {sentStatus && (
                                <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
                                    ✓ Email client triggered successfully. Thank you for reaching out!
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Footer Navigation */}
                <footer style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 8px' }}>© 2026 Elvan Navil (எல்வன் நவில்) • Independent Bilingual Digital Creation Studio</p>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>முகப்பு / Home</Link>
                        <Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>பற்றி / About</Link>
                        <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>தனியுரிமை / Privacy Policy</Link>
                        <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>விதிமுறைகள் / Terms</Link>
                        <Link to="/disclaimer" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>பொறுப்புத் துறப்பு / Disclaimer</Link>
                    </div>
                </footer>
            </div>
        </>
    );
}
