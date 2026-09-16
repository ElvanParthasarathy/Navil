import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { FloatingBackButton } from '../../கூறுகள்/கட்டமைப்பு/மிதக்கும்பின்பொத்தான்';
import AdBanner from '../../கூறுகள்/ஊடகம்/விளம்பரம்';
import { db } from '../../நூலகம்/ஃபயர்பேஸ்/வாடிக்கையாளர்';
import { ref, onValue } from 'firebase/database';
import MobileTopBar from '../../கூறுகள்/கட்டமைப்பு/மொபைல்மேல்பட்டை';
import './படைப்புகள்.css';
import { ChatCircleText, PencilSimpleLine, Newspaper, FileText, BookOpen, Pen, Cloud, MoonStars, ArrowRight } from '@phosphor-icons/react';

import staticArticles from '../../தரவு/கட்டுரைகள்.json';

const FIREBASE_KEYS = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];

const Writings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/navilgal/ezhutgal') 
        ? '/navilgal/ezhutgal' 
        : location.pathname.startsWith('/navilgal/ezhuthugal') 
        ? '/navilgal/ezhuthugal' 
        : location.pathname.startsWith('/navilgal/writings') 
        ? '/navilgal/writings' 
        : '/writings';
    const [counts, setCounts] = useState({
        articles: Object.keys(staticArticles).length
    });

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
                const count = snapshot.exists() 
                    ? Object.keys(snapshot.val()).length 
                    : (key === 'articles' ? Object.keys(staticArticles).length : 0);
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
            <MobileTopBar title="எழுத்துகள்|writings" showBack={true} backUrl="/navilgal" />
            <Helmet>
                <title>எழுத்துகள் | Writings</title>
            </Helmet>
            <div className="writings-page page-view fadeIn">

<FloatingBackButton to="/navilgal" />
            <header className="writings-header animate-entry">
                <div style={{ flex: 1 }}>
                    <h1 className="writings-title">எழுத்துகள்</h1>
                    <div className="writings-title-sub">Writings</div>
                    <p className="writings-subtitle">
                        சிந்தனைகள், கதைகள் & பட்டறிவுகள்
                    </p>
                    <p className="writings-subtitle writings-subtitle-en">
                        Thoughts, Stories & Observations
                    </p>
                </div>
            </header>

            <div className="category-grid animate-entry">
                <Link to={`${basePath}/poems`} className="category-card">
                    <div className="cat-icon-box"><Pen weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">நவில் மிழிகள்<CountBadge category="poems" /></div>
                        <div className="cat-title-sub">Navil Poems</div>
                        <p className="cat-desc">என் உணர்வுகளைப் பேசும் ஓசைநயமிக்க வரிகள்.</p>
                        <p className="cat-desc-sub">My lyrical verses and emotional expressions.</p>
                    </div>
                    <div className="cat-footer">நவில் மிழிகளை வாசிக்க <ArrowRight weight="regular" /></div>
                </Link>

                <Link to={`${basePath}/quotes`} className="category-card">
                    <div className="cat-icon-box"><ChatCircleText weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">நவில் மொழிகள்<CountBadge category="quotes" /></div>
                        <div className="cat-title-sub">Navil Quotes</div>
                        <p className="cat-desc">என் பட்டறிவில் உதித்த சிந்தனைத் துளிகள்.</p>
                        <p className="cat-desc-sub">My short quotes and personal insights.</p>
                    </div>
                    <div className="cat-footer">நவில் மொழிகளைப் பார்க்க <ArrowRight weight="regular" /></div>
                </Link>

                <Link to={`${basePath}/blog`} className="category-card">
                    <div className="cat-icon-box"><PencilSimpleLine weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">வலைப்பதிவுகள்<CountBadge category="blog" /></div>
                        <div className="cat-title-sub">Blog Posts</div>
                        <p className="cat-desc">என் அன்றாடத் தேடல்களும் வாழ்வியல் பகிர்வுகளும்.</p>
                        <p className="cat-desc-sub">My daily reflections and personal updates.</p>
                    </div>
                    <div className="cat-footer">பகிர்வுகளை வாசிக்க <ArrowRight weight="regular" /></div>
                </Link>

                <Link to={`${basePath}/articles`} className="category-card">
                    <div className="cat-icon-box"><Newspaper weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">கட்டுரைகள்<CountBadge category="articles" /></div>
                        <div className="cat-title-sub">Articles</div>
                        <p className="cat-desc">என் ஆழமான பகுப்பாய்வுப் பதிவுகள்.</p>
                        <p className="cat-desc-sub">My in-depth technical and structured writings.</p>
                    </div>
                    <div className="cat-footer">கட்டுரைகளைப் படிக்க <ArrowRight weight="regular" /></div>
                </Link>

                <Link to={`${basePath}/stories`} className="category-card">
                    <div className="cat-icon-box"><BookOpen weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">சிறுகதைகள்<CountBadge category="stories" /></div>
                        <div className="cat-title-sub">Short Stories</div>
                        <p className="cat-desc">ஒரு கதை சொல்லட்டா சார்?</p>
                        <p className="cat-desc-sub">My original fiction and short narratives.</p>
                    </div>
                    <div className="cat-footer">சிறுகதைகளை வாசிக்க <ArrowRight weight="regular" /></div>
                </Link>

                <Link to={`${basePath}/diary`} className="category-card">
                    <div className="cat-icon-box"><MoonStars weight="regular" /></div>
                    <div className="cat-content">
                        <div className="cat-title">நாளேடு<CountBadge category="diary" /></div>
                        <div className="cat-title-sub">Diary</div>
                        <p className="cat-desc">என் நாள்களின் நினைவுகளும் பதிவுகளும்</p>
                        <p className="cat-desc-sub">Memories and records of my days.</p>
                    </div>
                    <div className="cat-footer">நாளேட்டைத் திறக்க <ArrowRight weight="regular" /></div>
                </Link>
            </div>

            <AdBanner variant="inline" wrapperStyle={{ margin: '60px 0' }} />
        </div>
        </>
    );
};

export default Writings;
