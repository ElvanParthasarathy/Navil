import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BsChatQuote, BsPencilSquare, BsNewspaper, BsFileText, BsBook, BsPen, BsCloud, BsMoonStars } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import { FloatingBackButton } from '../components/ui/FloatingBackButton';
import AdBanner from '../components/ui/AdBanner';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';
import MobileTopBar from '../components/ui/MobileTopBar';
import './Writings.css';

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
            <Helmet>
                <title>எழுத்துகள் | Writings</title>
            </Helmet>
            <div className="writings-page page-view fadeIn">
            

            <FloatingBackButton to="/" />
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
            </header>

            <div className="category-grid animate-entry">
                <Link to="/writings/poems" className="category-card">
                    <div className="cat-icon-box"><BsPen /></div>
                    <div className="cat-content">
                        <div className="cat-title">நவில் மிழிகள்<CountBadge category="poems" /></div>
                        <div className="cat-title-sub">Navil Poems</div>
                        <p className="cat-desc">என் உணர்வுகளைப் பேசும் ஓசைநயமிக்க வரிகள்.</p>
                        <p className="cat-desc-sub">My lyrical verses and emotional expressions.</p>
                    </div>
                    <div className="cat-footer">நவில் மிழிகளை வாசிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/quotes" className="category-card">
                    <div className="cat-icon-box"><BsChatQuote /></div>
                    <div className="cat-content">
                        <div className="cat-title">நவில் மொழிகள்<CountBadge category="quotes" /></div>
                        <div className="cat-title-sub">Navil Quotes</div>
                        <p className="cat-desc">என் பட்டறிவில் உதித்த சிந்தனைத் துளிகள்.</p>
                        <p className="cat-desc-sub">My short quotes and personal insights.</p>
                    </div>
                    <div className="cat-footer">நவில் மொழிகளைப் பார்க்க <FiArrowRight /></div>
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
