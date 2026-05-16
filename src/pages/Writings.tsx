import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { BsChatQuote, BsPencilSquare, BsNewspaper, BsFileText, BsBook, BsPen, BsCloud, BsMoonStars } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import AdBanner from '../components/AdBanner';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';

const FIREBASE_KEYS = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];

const Writings = () => {
    const { setPageTitle } = useOutletContext<{ setPageTitle: (title: string) => void }>();

    const [counts, setCounts] = useState({});

    useEffect(() => {
        setPageTitle('எழுத்துகள்|Writings');

        // CLEAR CATEGORY MEMORY: When entering the hub, reset all sub-category states
        // This ensures entering Poems/Quotes always starts from Page 1 with no filters.
        const categories = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];
        categories.forEach(cat => {
            sessionStorage.removeItem(`elvan_${cat}_search`);
            sessionStorage.removeItem(`elvan_${cat}_genre`);
            sessionStorage.removeItem(`elvan_${cat}_page`);
        });
    }, [setPageTitle]);

    useEffect(() => {
        const unsubs = FIREBASE_KEYS.map(key => {
            const catRef = ref(db, key);
            return onValue(catRef, (snapshot) => {
                const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                setCounts(prev => ({ ...prev, [key]: count }));
            }, () => {});
        });
        return () => unsubs.forEach(fn => fn());
    }, []);

    const CountBadge = ({ category }) => {
        const count = counts[category];
        if (!count) return null;
        return <span className="cat-count-badge">{count}</span>;
    };

    return (
        <div className="writings-page page-view fadeIn">
            <style>{`
                .writings-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px 32px;
                }

                .writings-header {
                    margin-bottom: 48px;
                    text-align: left;
                }

                .writings-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: 0;
                    margin-bottom: 10px;
                    color: var(--text-main);
                    line-height: 1.3;
                }

                .writings-title-sub {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #888888;
                    margin-bottom: 16px;
                    letter-spacing: 0.5px;
                }

                .writings-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin: 0;
                }

                .category-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    margin-top: 32px;
                }

                .category-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    border-radius: 20px;
                    padding: 24px;
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.4s cubic-bezier(0.2, 0, 0, 1);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    position: relative;
                    overflow: hidden;
                    min-height: 220px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
                }
                [data-theme='dark'] .category-card {
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                }

                .cat-icon-box {
                    width: 56px;
                    height: 56px;
                    background: var(--bg-panel);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                }

                .cat-content {
                    flex: 1;
                }

                .cat-title {
                    font-size: 1.35rem;
                    font-weight: 700;
                    margin-bottom: 2px;
                    color: var(--text-main);
                    line-height: 1.3;
                }

                .cat-title-sub {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #888888;
                    margin-bottom: 8px;
                }

                .cat-desc {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                .cat-desc-sub {
                    font-size: 0.82rem;
                    color: #888888;
                    line-height: 1.4;
                    margin-top: 2px;
                }

                /* COUNT BADGE */
                .cat-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: 100px;
                    background: color-mix(in srgb, var(--text-main) 8%, transparent);
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-left: 8px;
                    vertical-align: middle;
                }

                /* BASE FOOTER & DECORATION */
                .cat-footer {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    color: var(--text-main);
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }

                .category-card::after {
                    content: '';
                    position: absolute;
                    bottom: -20px;
                    right: -20px;
                    width: 100px;
                    height: 100px;
                    background: var(--text-main);
                    opacity: 0.03;
                    border-radius: 50%;
                    transition: all 0.5s ease;
                }

                /* HOVER EFFECTS - DESKTOP ONLY */

                .category-card {
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease;
                }

                .category-card:active {
                    transform: scale(0.94);
                    background: color-mix(in srgb, var(--text-main) 8%, var(--bg-card));
                    transition: transform 0.1s ease;
                }


                /* MOBILE / TOUCH DEVICE ADJUSTMENTS */
                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .writings-page { padding: 0 0 100px 0; }
                    .writings-header { padding: 28px 28px 10px; text-align: center; margin-bottom: 24px; }
                    .writings-title { display: none; }
                    .writings-title-sub { display: none; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; text-align: center; }
                    .category-grid { grid-template-columns: 1fr; gap: 12px; padding: 0 20px; margin-top: 24px; }
                    
                    .category-card { 
                        min-height: auto; 
                        padding: 20px; 
                        gap: 16px; 
                        border-radius: 18px; 
                    }
                    
                    .cat-footer {
                        opacity: 1;
                        transform: translateX(0);
                        font-size: 0.8rem;
                        color: var(--text-muted);
                    }


                    
                    .category-card:active .cat-icon-box {
                        background: var(--text-main);
                        color: var(--bg-app);
                        transform: scale(1.1);
                    }

                    .cat-icon-box { width: 48px; height: 48px; font-size: 1.25rem; border-radius: 12px; }
                    .cat-title { font-size: 1.2rem; margin-bottom: 4px; }
                    .cat-desc { font-size: 0.95rem; line-height: 1.4; }
                }
            `}</style>

            <header className="writings-header animate-entry">
                <h1 className="writings-title">எழுத்துகள்</h1>
                <div className="writings-title-sub">Writings</div>
                <p className="writings-subtitle">
                    சிந்தனைகள், கதைகள் & பட்டறிவுகள்
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                    Thoughts, Stories & Observations
                </p>
            </header>

            <div className="category-grid animate-entry">
                <Link to="/writings/poems" className="category-card">
                    <div className="cat-icon-box"><BsPen /></div>
                    <div className="cat-content">
                        <div className="cat-title">செய்யுள்கள்<CountBadge category="poems" /></div>
                        <div className="cat-title-sub">Poems</div>
                        <p className="cat-desc">என் உணர்வுகளைப் பேசும் ஓசைநயமிக்க வரிகள்.</p>
                        <p className="cat-desc-sub">My lyrical verses and emotional expressions.</p>
                    </div>
                    <div className="cat-footer">செய்யுள்களை வாசிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/quotes" className="category-card">
                    <div className="cat-icon-box"><BsChatQuote /></div>
                    <div className="cat-content">
                        <div className="cat-title">பொன்மொழிகள்<CountBadge category="quotes" /></div>
                        <div className="cat-title-sub">Quotes</div>
                        <p className="cat-desc">என் பட்டறிவில் உதித்த சிந்தனைத் துளிகள்.</p>
                        <p className="cat-desc-sub">My short quotes and personal insights.</p>
                    </div>
                    <div className="cat-footer">பொன்மொழிகளைப் பார்க்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/blog" className="category-card">
                    <div className="cat-icon-box"><BsPencilSquare /></div>
                    <div className="cat-content">
                        <div className="cat-title">வலைப்பதிவுகள்<CountBadge category="blog" /></div>
                        <div className="cat-title-sub">Blog Posts</div>
                        <p className="cat-desc">என் அன்றாடத் தேடல்களும் வாழ்வியல் பகிர்வுகளும்.</p>
                        <p className="cat-desc-sub">My daily reflections and personal updates.</p>
                    </div>
                    <div className="cat-footer">பகிர்வுகளை வாசிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/articles" className="category-card">
                    <div className="cat-icon-box"><BsNewspaper /></div>
                    <div className="cat-content">
                        <div className="cat-title">கட்டுரைகள்<CountBadge category="articles" /></div>
                        <div className="cat-title-sub">Articles</div>
                        <p className="cat-desc">என் ஆழமான பகுப்பாய்வுப் பதிவுகள்.</p>
                        <p className="cat-desc-sub">My in-depth technical and structured writings.</p>
                    </div>
                    <div className="cat-footer">கட்டுரைகளைப் படிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/stories" className="category-card">
                    <div className="cat-icon-box"><BsBook /></div>
                    <div className="cat-content">
                        <div className="cat-title">சிறுகதைகள்<CountBadge category="stories" /></div>
                        <div className="cat-title-sub">Short Stories</div>
                        <p className="cat-desc">ஒரு கதை சொல்லட்டா சார்?</p>
                        <p className="cat-desc-sub">My original fiction and short narratives.</p>
                    </div>
                    <div className="cat-footer">சிறுகதைகளை வாசிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/diary" className="category-card">
                    <div className="cat-icon-box"><BsMoonStars /></div>
                    <div className="cat-content">
                        <div className="cat-title">நாளேடு<CountBadge category="diary" /></div>
                        <div className="cat-title-sub">Diary</div>
                        <p className="cat-desc">என் நாள்களின் நினைவுகளும் பதிவுகளும்</p>
                        <p className="cat-desc-sub">Memories and records of my days.</p>
                    </div>
                    <div className="cat-footer">நாளேட்டைத் திறக்க <FiArrowRight /></div>
                </Link>
            </div>

            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />
        </div>
    );
};

export default Writings;
