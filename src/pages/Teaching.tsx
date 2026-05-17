import React from 'react';
import { BsDisplay } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import { Link, useOutletContext } from 'react-router-dom';
import AdBanner from '../components/AdBanner';

const Teaching = () => {
    const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();

    React.useEffect(() => {
        setPageTitle('பயிற்றுவிப்பு|teaching');
    }, [setPageTitle]);

    return (
        <div className="writings-page page-view fadeIn">
            <style>{`
                .writings-page { max-width: 1200px; margin: 0 auto; padding: 10px 20px 32px; }
                .writings-header { margin-bottom: 48px; text-align: left; display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
                .writings-title { font-size: 2.4rem; font-weight: 800; letter-spacing: 0; margin-bottom: 10px; color: var(--text-main); line-height: 1.3; }

                .writings-title-sub { font-size: 1rem; font-weight: 500; color: #888888; margin-bottom: 16px; letter-spacing: 0.5px; }
                .writings-subtitle { font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; margin: 0; }
                /* MOBILE / TOUCH DEVICE ADJUSTMENTS */
                @media (max-width: 768px) {
                    .writings-page { padding: 24px 0; }
                    .writings-header { padding: 40px 20px 20px; text-align: center; margin-bottom: 32px; }
                    .writings-title { display: none; }
                    .writings-title-sub { display: none; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; }
                    .category-grid { grid-template-columns: 1fr; gap: 12px; padding: 0 20px; margin-top: 24px; }
                    
                    .category-card { 
                        min-height: auto; 
                        padding: 24px; 
                    }

                    .cat-footer {
                        opacity: 1;
                        transform: none;
                    }
                }

            `}</style>

            <header className="writings-header animate-entry">
                <div style={{ flex: 1 }}>
                    <h1 className="writings-title">பயிற்றுவிப்பு</h1>
                    <div className="writings-title-sub">Teaching & Presentations</div>
                    <p className="writings-subtitle">
                        கற்றல் கற்பித்தல் மற்றும் தொழில்நுட்ப விளக்கக்காட்சிகள்.
                    </p>
                    <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                        Interactive teaching materials, slides, and educational resources.
                    </p>
                </div>
                <Link to="/" className="back-pill desktop-only">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                </Link>
            </header>

            <div className="category-grid animate-entry">
                <Link to="/teaching/vocoder" className="category-card">
                    <div className="cat-icon-box"><BsDisplay /></div>
                    <div className="cat-content">
                        <div className="cat-title">Vocoder</div>
                        <div className="cat-title-sub">Interactive Presentation</div>
                        <p className="cat-desc">எனது படைப்பு மற்றும் தொழில் நுட்ப விளக்கக்காட்சி.</p>
                        <p className="cat-desc-sub">Modern presentation for Vocoder engine concepts.</p>
                    </div>
                    <div className="cat-footer">விளக்கக்காட்சியைக் காண <FiArrowRight /></div>
                </Link>
            </div>

            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />
        </div>
    );
};

export default Teaching;
