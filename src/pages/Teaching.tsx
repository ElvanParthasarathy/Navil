import React from 'react';
import { BsDisplay } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import { Link, useOutletContext } from 'react-router-dom';
import AdBanner from '../components/AdBanner';

const Teaching = () => {
    const { setPageTitle } = useOutletContext();

    React.useEffect(() => {
        setPageTitle('பயிற்றுவிப்பு');
    }, [setPageTitle]);

    return (
        <div className="writings-page page-view fadeIn">
            <style>{`
                .writings-page { max-width: 1200px; margin: 0 auto; padding: 10px 20px; }
                .writings-header { margin-bottom: 48px; text-align: left; }
                .writings-title { font-size: clamp(2.4rem, 3vw, 3rem); font-weight: 800; letter-spacing: 0; margin-bottom: 10px; color: var(--text-main); line-height: 1.3; }
                .writings-title-sub { font-size: 1rem; font-weight: 500; color: #888888; margin-bottom: 16px; letter-spacing: 0.5px; }
                .writings-subtitle { font-size: 1.1rem; color: var(--text-muted); line-height: 1.6; margin: 0; }
                .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; margin-top: 32px; }
                
                .category-card { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 20px; padding: 24px; text-decoration: none; color: inherit; transition: all 0.4s cubic-bezier(0.2, 0, 0, 1); display: flex; flex-direction: column; gap: 20px; position: relative; overflow: hidden; min-height: 220px; }
                .cat-icon-box { width: 56px; height: 56px; background: var(--bg-panel); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--text-main); transition: all 0.3s ease; }
                .cat-content { flex: 1; }
                .cat-title { font-size: 1.35rem; font-weight: 700; margin-bottom: 2px; color: var(--text-main); line-height: 1.3; }
                .cat-title-sub { font-size: 0.8rem; font-weight: 500; color: #888888; margin-bottom: 8px; }
                .cat-desc { font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; }
                .cat-desc-sub { font-size: 0.82rem; color: #888888; line-height: 1.4; margin-top: 2px; }
                
                .cat-footer { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.85rem; color: var(--text-main); opacity: 0; transform: translateX(-10px); transition: all 0.3s ease; }
                .category-card::after { content: ''; position: absolute; bottom: -20px; right: -20px; width: 100px; height: 100px; background: var(--text-main); opacity: 0.03; border-radius: 50%; transition: all 0.5s ease; }
                
                @media (hover: hover) {
                    .category-card:hover { transform: translateY(-6px); border-color: color-mix(in srgb, var(--text-main) 15%, var(--border-light)); background: color-mix(in srgb, var(--text-main) 3%, var(--bg-card)); box-shadow: 0 16px 32px rgba(0,0,0,0.12); }
                    .category-card:hover .cat-icon-box { background: var(--text-main); color: var(--bg-app); transform: scale(1.08) rotate(-4deg); box-shadow: 0 8px 16px color-mix(in srgb, var(--text-main) 20%, transparent); }
                    .category-card:hover .cat-footer { opacity: 1; transform: translateX(0); }
                    .category-card:hover::after { transform: scale(2.2); opacity: 0.06; }
                }
                
                @media (max-width: 768px) {
                    .writings-page { padding: 24px 0; }
                    .writings-header { padding: 40px 20px 20px; text-align: center; margin-bottom: 32px; }
                    .writings-title { display: none; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; }
                    .category-grid { grid-template-columns: 1fr; gap: 12px; padding: 0 20px; margin-top: 24px; }
                    .category-card { min-height: auto; padding: 20px; gap: 16px; border-radius: 18px; }
                    .cat-footer { opacity: 1; transform: translateX(0); font-size: 0.8rem; color: var(--text-muted); }
                    .category-card:active { transform: scale(0.97); background: color-mix(in srgb, var(--text-main) 4%, var(--bg-card)); border-color: color-mix(in srgb, var(--text-main) 20%, var(--border-light)); }
                    .category-card:active .cat-icon-box { background: var(--text-main); color: var(--bg-app); }
                    .cat-icon-box { width: 48px; height: 48px; font-size: 1.25rem; border-radius: 12px; }
                    .cat-title { font-size: 1.2rem; margin-bottom: 4px; }
                    .cat-desc { font-size: 0.95rem; line-height: 1.4; }
                }
            `}</style>

            <header className="writings-header animate-entry">
                <h1 className="writings-title">பயிற்றுவிப்பு</h1>
                <div className="writings-title-sub">Teaching & Presentations</div>
                <p className="writings-subtitle">
                    கற்றல் கற்பித்தல் மற்றும் தொழில்நுட்ப விளக்கக்காட்சிகள்.
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                    Interactive teaching materials, slides, and educational resources.
                </p>
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
