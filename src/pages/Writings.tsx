import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsChatQuote, BsPencilSquare, BsNewspaper, BsFileText, BsBook, BsPen, BsCloud, BsMoonStars } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import AdBanner from '../components/AdBanner';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';
import MobileTopBar from '../components/MobileTopBar';

const FIREBASE_KEYS = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];

const Writings = () => {
    const navigate = useNavigate();
    const [counts, setCounts] = useState({});

    useEffect(() => {
        // CLEAR CATEGORY MEMORY: When entering the hub, reset all sub-category states
        // This ensures entering Poems/Quotes always starts from Page 1 with no filters.
        const categories = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];
        categories.forEach(cat => {
            sessionStorage.removeItem(`elvan_${cat}_search`);
            sessionStorage.removeItem(`elvan_${cat}_genre`);
            sessionStorage.removeItem(`elvan_${cat}_page`);
        });
    }, []);

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
        <>
            <MobileTopBar title="எழுத்துகள்|writings" />
            <div className="writings-page page-view fadeIn">
            <style>{`
                .writings-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 10px 20px 32px;
                }

                .writings-header {
                    margin-bottom: 48px;
                    text-align: left;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
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

                    .category-grid { gap: 24px; margin-top: 32px; }

                /* MOBILE / TOUCH DEVICE ADJUSTMENTS */
                @media (max-width: 768px) {

                    .writings-page { padding: 0 0 100px 0; }
                    .writings-header { padding: 28px 28px 10px; text-align: center; margin-bottom: 24px; }
                    .writings-title { display: none; }
                    .writings-title-sub { display: none; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; text-align: center; }
                    .category-grid { grid-template-columns: 1fr; gap: 16px; padding: 0 20px; margin-top: 24px; }
                    
                    .category-card { 
                        min-height: auto; 
                        padding: 24px; 
                    }

                    .cat-footer {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

            `}</style>

            <header className="writings-header animate-entry">
                <div style={{ flex: 1 }}>
                    <h1 className="writings-title">எழுத்துகள்</h1>
                    <div className="writings-title-sub">Writings</div>
                    <p className="writings-subtitle">
                        சிந்தனைகள், கதைகள் & பட்டறிவுகள்
                    </p>
                    <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                        Thoughts, Stories & Observations
                    </p>
                </div>
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
        </>
    );
};

export default Writings;
