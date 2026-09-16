import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import { ShieldCheck, Cookie, ArrowLeft, EnvelopeSimple, Globe } from '@phosphor-icons/react';

export default function PrivacyPolicy() {
    return (
        <>
            <MobileTopBar title="தனியுரிமை|privacy" />
            <Helmet>
                <title>தனியுரிமைக் கொள்கை | Privacy Policy — Elvan Navil</title>
                <meta 
                    name="description" 
                    content="Privacy Policy for Elvan Navil. Details on how we respect your privacy, third-party advertising cookies, Google AdSense compliance, and data protection." 
                />
                <link rel="canonical" href="https://elvannavil.vercel.app/privacy" />
            </Helmet>

            <FloatingBackButton to="/" />

            <div className="page-view animate-entry" style={{ maxWidth: '960px', margin: '0 auto', padding: '16px 20px 80px' }}>
                <style>{`
                    .privacy-hero {
                        text-align: center;
                        padding: 32px 16px 24px;
                        margin-bottom: 32px;
                    }
                    .privacy-badge {
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
                    .privacy-title {
                        font-size: clamp(2rem, 4vw, 2.7rem);
                        font-weight: 800;
                        color: var(--text-main);
                        margin: 0 0 8px;
                        letter-spacing: -0.02em;
                    }
                    .privacy-subtitle {
                        font-size: 1.1rem;
                        color: var(--text-muted);
                        margin: 0 0 12px;
                    }
                    .privacy-updated {
                        font-size: 0.8rem;
                        color: var(--text-muted);
                        opacity: 0.7;
                    }
                    .privacy-card {
                        background: linear-gradient(145deg, var(--bg-card), color-mix(in srgb, var(--bg-card), transparent 20%));
                        border: 1px solid var(--border-light);
                        border-radius: 24px;
                        padding: 32px;
                        margin-bottom: 24px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                        line-height: 1.8;
                    }
                    [data-theme='dark'] .privacy-card {
                        background: linear-gradient(145deg, #141414, color-mix(in srgb, #141414, transparent 35%));
                        box-shadow: 0 10px 40px rgba(0,0,0,0.25);
                    }
                    .privacy-card h2 {
                        font-size: 1.35rem;
                        font-weight: 700;
                        color: var(--text-main);
                        margin: 0 0 16px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .privacy-card h3 {
                        font-size: 1.1rem;
                        font-weight: 600;
                        color: var(--text-main);
                        margin: 20px 0 8px;
                    }
                    .privacy-card p {
                        color: var(--text-main);
                        opacity: 0.9;
                        margin: 0 0 14px;
                        font-size: 0.96rem;
                    }
                    .privacy-card ul {
                        margin: 0 0 16px 20px;
                        padding: 0;
                        color: var(--text-main);
                        opacity: 0.9;
                        font-size: 0.95rem;
                    }
                    .privacy-card li {
                        margin-bottom: 8px;
                    }
                    .privacy-card a {
                        color: #0070f3;
                        text-decoration: underline;
                        text-underline-offset: 3px;
                    }
                    .privacy-highlight-box {
                        background: color-mix(in srgb, #0070f3 8%, transparent);
                        border-left: 4px solid #0070f3;
                        padding: 16px 20px;
                        border-radius: 0 12px 12px 0;
                        margin: 18px 0;
                    }
                    .privacy-footer {
                        text-align: center;
                        margin-top: 48px;
                        padding-top: 24px;
                        border-top: 1px solid var(--border-light);
                        font-size: 0.85rem;
                        color: var(--text-muted);
                    }
                    @media (max-width: 640px) {
                        .privacy-card {
                            padding: 22px 18px;
                            border-radius: 20px;
                        }
                    }
                `}</style>

                {/* HERO HEADER */}
                <header className="privacy-hero">
                    <div className="privacy-badge">
                        <ShieldCheck size={18} weight="bold" />
                        <span>தனியுரிமை நெறிமுறை • Privacy Policy</span>
                    </div>
                    <h1 className="privacy-title">தனியுரிமைக் கொள்கை</h1>
                    <div className="privacy-subtitle">Privacy Policy for Elvan Navil</div>
                    <div className="privacy-updated">கடைசியாகப் புதுப்பிக்கப்பட்டது / Last Updated: September 16, 2026</div>
                </header>

                {/* 1. INTRODUCTION */}
                <section className="privacy-card">
                    <h2>
                        <span>1. அறிமுகம் • Introduction</span>
                    </h2>
                    <p lang="ta">
                        <strong>எல்வன் நவில் (Elvan Navil)</strong> இணையதளத்திற்கு (<strong>https://elvannavil.vercel.app</strong>) தங்களை அன்புடன் வரவேற்கிறோம். எங்களது தளத்தைப் பார்வையிடும் வாசகர்கள், பயனர்கள் மற்றும் படைப்பாளிகளின் தனியுரிமையைப் பாதுகாப்பது எங்களின் முதன்மையான பொறுப்பாகும்.
                    </p>
                    <p>
                        Welcome to <strong>Elvan Navil</strong> (accessible from <strong>https://elvannavil.vercel.app</strong>), an independent bilingual digital creation studio created and maintained by <strong>Elvan Parthasarathy (Jaiprakash P)</strong>. This Privacy Policy document details the types of information collected and recorded by Elvan Navil and how we use it.
                    </p>
                    <p>
                        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="mailto:jaiprakashpartha@gmail.com">jaiprakashpartha@gmail.com</a>.
                    </p>
                </section>

                {/* 2. GOOGLE ADSENSE & THIRD-PARTY ADVERTISING */}
                <section className="privacy-card">
                    <h2>
                        <Cookie size={22} weight="regular" />
                        <span>2. விளம்பரங்கள் & கூகுள் ஆட்சென்ஸ் • Advertising & Google AdSense</span>
                    </h2>

                    <div className="privacy-highlight-box">
                        <p style={{ margin: 0, fontWeight: 500 }}>
                            <strong>முக்கிய அறிவிப்பு:</strong> எங்கள் வலைத்தளம் கூகுள் ஆட்சென்ஸ் (Google AdSense) உள்ளிட்ட மூன்றாம் தரப்பு விளம்பரச் சேவைகளைப் பயன்படுத்தக்கூடும். கூகுள் பயனர்களின் முந்தைய வருகைகளின் அடிப்படையில் விளம்பரங்களை வழங்க குக்கீகளைப் (Cookies) பயன்படுத்துகிறது.
                        </p>
                    </div>

                    <p>
                        Google is one of the third-party vendors on our site. It uses cookies, known as advertising cookies, to serve ads to our site visitors based upon their visit to <strong>elvannavil.vercel.app</strong> and other sites on the internet:
                    </p>

                    <ul>
                        <li>
                            <strong>Third-party vendor cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.
                        </li>
                        <li>
                            <strong>Personalized Advertising:</strong> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.
                        </li>
                        <li>
                            <strong>Opting Out of Personalized Advertising:</strong> Users may choose to opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer">Google Ads Settings (https://www.google.com/settings/ads)</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info/choices/" target="_blank" rel="noreferrer">www.aboutads.info</a>.
                        </li>
                    </ul>

                    <p>
                        Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Elvan Navil, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
                    </p>
                    <p style={{ fontStyle: 'italic', opacity: 0.8 }}>
                        Note that Elvan Navil has no access to or control over these cookies that are used by third-party advertisers.
                    </p>
                </section>

                {/* 3. LOG FILES & ANALYTICS */}
                <section className="privacy-card">
                    <h2>
                        <span>3. பதிவு கோப்புகள் & பகுப்பாய்வு • Log Files & Analytics</span>
                    </h2>
                    <p lang="ta">
                        எல்வன் நவில் இணையதளம் வழக்கமான பதிவு கோப்புகளைப் (Log files) பயன்படுத்துகிறது. இந்த கோப்புகள் தளத்திற்கு வருகை தரும் பார்வையாளர்களின் உலாவல் தகவல்களைத் தானாகவே பதிவு செய்கின்றன. இதில் இணைய நெறிமுறை (IP) முகவரிகள், உலாவி வகை (Browser type), இணைய சேவை வழங்குநர் (ISP), தேதி மற்றும் நேர முத்திரைகள், மற்றும் பக்கப் பார்வைகள் ஆகியவை அடங்கும்.
                    </p>
                    <p>
                        Elvan Navil follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting platforms do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering broad demographic information.
                    </p>
                </section>

                {/* 4. COOKIES & LOCAL STORAGE */}
                <section className="privacy-card">
                    <h2>
                        <span>4. குக்கீகள் & உள்ளமைவுச் சேமிப்பு • Cookies & Local Storage</span>
                    </h2>
                    <p lang="ta">
                        தளத்தின் பயன்பாட்டு அனுபவத்தை மேம்படுத்துவதற்காக உங்கள் சாதனத்தில் உள்ளமைவுச் சேமிப்பகம் (Local Storage) பயன்படுத்தப்படுகிறது (எ.கா: வெளிர்/இருள் வண்ணத் தோற்றம் (Theme Preference), எழுத்துரு அளவு, மற்றும் வாசிப்பு விருப்பங்கள்).
                    </p>
                    <p>
                        Like any other modern web application, Elvan Navil uses browser local storage and session storage to store user preferences (such as Light/Dark theme mode, transliteration typing engine preferences, and font readability adjustments). You can choose to disable cookies or clear local storage through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.
                    </p>
                </section>

                {/* 5. NAMMIL DESKTOP APPLICATION PRIVACY */}
                <section className="privacy-card">
                    <h2>
                        <span>5. நம்மில் கணினிச் செயலி • Nammil Desktop App Privacy</span>
                    </h2>
                    <p lang="ta">
                        <strong>நம்மில் (Nammil)</strong> என்பது வாட்ஸ்அப்பிற்கான நவீன கணினித் துணைச்செயலியாகும். இது முழுக்க முழுக்க பயனரின் சொந்தக் கணினியிலேயே இயங்குகிறது (Local execution).
                    </p>
                    <p>
                        <strong>Nammil</strong> is a standalone, client-side desktop companion for WhatsApp. It operates under a strict privacy-first principle:
                    </p>
                    <ul>
                        <li>Nammil stores your session data and media strictly locally on your own machine.</li>
                        <li>Nammil does not operate any intermediary servers that read, intercept, or store your private WhatsApp messages, contacts, or media.</li>
                        <li>We do not sell, rent, or monetize any desktop user communication data.</li>
                    </ul>
                </section>

                {/* 6. CHILDREN'S INFORMATION */}
                <section className="privacy-card">
                    <h2>
                        <span>6. சிறுவர் தனியுரிமைப் பாதுகாப்பு • Children's Information</span>
                    </h2>
                    <p lang="ta">
                        இணையத்தைப் பயன்படுத்தும் போது சிறுவர்களுக்குக் கூடுதல் பாதுகாப்பை வழங்குவது எங்களின் முக்கியமான குறிக்கோள்களில் ஒன்றாகும். 13 வயதிற்குட்பட்ட குழந்தைகளிடமிருந்து எல்வன் நவில் தளம் எந்தவொரு தனிப்பட்ட அடையாளத் தகவலையும் வேண்டுமென்றே சேகரிப்பதில்லை.
                    </p>
                    <p>
                        Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Elvan Navil does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
                    </p>
                </section>

                {/* 7. CONSENT & CONTACT */}
                <section className="privacy-card">
                    <h2>
                        <span>7. சம்மதம் & தொடர்பு • Consent & Contact</span>
                    </h2>
                    <p lang="ta">
                        எங்கள் வலைத்தளத்தைப் பயன்படுத்துவதன் மூலம், நீங்கள் எங்கள் தனியுரிமைக் கொள்கைக்குச் சம்மதம் தெரிவித்து, அதன் விதிமுறைகளுக்கு உடன்படுகிறீர்கள்.
                    </p>
                    <p>
                        By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                    </p>
                    <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-panel)', borderRadius: '12px' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 600 }}>தொடர்புக்கு / Contact Details:</p>
                        <p style={{ margin: '0 0 4px' }}><strong>Creator:</strong> Elvan Parthasarathy (Jaiprakash P)</p>
                        <p style={{ margin: '0 0 4px' }}>
                            <strong>Email:</strong> <a href="mailto:jaiprakashpartha@gmail.com">jaiprakashpartha@gmail.com</a>
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Website:</strong> <a href="https://elvannavil.vercel.app">https://elvannavil.vercel.app</a>
                        </p>
                    </div>
                </section>

                <footer className="privacy-footer">
                    <p>© 2026 Elvan Navil (எல்வன் நவில்). All rights reserved.</p>
                    <p>
                        <Link to="/" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>முகப்பு / Home</Link>
                        <Link to="/about" style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>பற்றி / About</Link>
                        <Link to="/writings" style={{ color: 'inherit', textDecoration: 'none' }}>படைப்புகள் / Writings</Link>
                    </p>
                </footer>
            </div>
        </>
    );
}
