import React from 'react';
import { Link } from 'react-router-dom';
import { BsChatQuote, BsPencilSquare, BsNewspaper, BsFileText, BsBook, BsPen, BsCloud, BsMoonStars } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';

const Writings = () => {
    return (
        <div className="writings-page page-view fadeIn">
            <style>{`
                .writings-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 10px 20px;
                }

                .writings-header {
                    margin-bottom: 48px;
                    text-align: left;
                }

                .writings-title {
                    font-size: clamp(2.4rem, 3vw, 3rem);
                    font-weight: 800;
                    letter-spacing: -1.5px;
                    margin-bottom: 10px;
                    color: var(--text-main);
                    line-height: 1.1;
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
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
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
                    line-height: 1.1;
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
                @media (hover: hover) {
                    .category-card:hover {
                        transform: translateY(-6px);
                        border-color: color-mix(in srgb, var(--text-main) 15%, var(--border-light));
                        background: color-mix(in srgb, var(--text-main) 3%, var(--bg-card));
                        box-shadow: 0 16px 32px rgba(0,0,0,0.12);
                    }

                    .category-card:hover .cat-icon-box {
                        background: var(--text-main);
                        color: var(--bg-app);
                        transform: scale(1.08) rotate(-4deg);
                        box-shadow: 0 8px 16px color-mix(in srgb, var(--text-main) 20%, transparent);
                    }

                    .category-card:hover .cat-footer {
                        opacity: 1;
                        transform: translateX(0);
                    }

                    .category-card:hover::after {
                        transform: scale(2.2);
                        opacity: 0.06;
                    }
                }

                /* MOBILE / TOUCH DEVICE ADJUSTMENTS */
                @media (max-width: 768px) {
                    .writings-page { padding: 24px 0; }
                    .writings-header { padding: 40px 20px 20px; text-align: center; margin-bottom: 32px; }
                    .writings-title { font-size: 2.1rem; margin-bottom: 10px; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; }
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

                    /* Active state for tap feedback */
                    .category-card:active { 
                        transform: scale(0.97); 
                        background: color-mix(in srgb, var(--text-main) 4%, var(--bg-card));
                        border-color: color-mix(in srgb, var(--text-main) 20%, var(--border-light));
                    }
                    
                    .category-card:active .cat-icon-box {
                        background: var(--text-main);
                        color: var(--bg-app);
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
                    என் வாழ்வியற் சிந்தனைகள், கதைகள், பட்டறிவுகளின் தொகுப்பு. வாசிக்கப் பகுதிகளைத் தேர்வுசெய்க.
                </p>
                <p className="writings-subtitle" style={{ fontSize: '0.9rem', color: '#888888', marginTop: '4px' }}>
                    A collection of thoughts, stories, and observations from my journey. Select a category to explore.
                </p>
            </header>

            <div className="category-grid animate-entry">
                <Link to="/writings/poems" className="category-card">
                    <div className="cat-icon-box"><BsPen /></div>
                    <div className="cat-content">
                        <div className="cat-title">செய்யுள்கள்</div>
                        <div className="cat-title-sub">Poems</div>
                        <p className="cat-desc">என் உணர்வுகளைப் பேசும் ஓசைநயமிக்க வரிகள்.</p>
                        <p className="cat-desc-sub">My lyrical verses and emotional expressions.</p>
                    </div>
                    <div className="cat-footer">செய்யுள்களை வாசிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/quotes" className="category-card">
                    <div className="cat-icon-box"><BsChatQuote /></div>
                    <div className="cat-content">
                        <div className="cat-title">பொன்மொழிகள்</div>
                        <div className="cat-title-sub">Quotes</div>
                        <p className="cat-desc">என் பட்டறிவில் உதித்த சிந்தனைத் துளிகள்.</p>
                        <p className="cat-desc-sub">My short quotes and personal insights.</p>
                    </div>
                    <div className="cat-footer">பொன்மொழிகளைப் பார்க்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/blog" className="category-card">
                    <div className="cat-icon-box"><BsPencilSquare /></div>
                    <div className="cat-content">
                        <div className="cat-title">வலைப்பதிவுகள்</div>
                        <div className="cat-title-sub">Blog Posts</div>
                        <p className="cat-desc">என் அன்றாடத் தேடல்களும் வாழ்வியல் பகிர்வுகளும்.</p>
                        <p className="cat-desc-sub">My daily reflections and personal updates.</p>
                    </div>
                    <div className="cat-footer">பகிர்வுகளை வாசிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/articles" className="category-card">
                    <div className="cat-icon-box"><BsNewspaper /></div>
                    <div className="cat-content">
                        <div className="cat-title">கட்டுரைகள்</div>
                        <div className="cat-title-sub">Articles</div>
                        <p className="cat-desc">என் ஆழமான பகுப்பாய்வுப் பதிவுகள்.</p>
                        <p className="cat-desc-sub">My in-depth technical and structured writings.</p>
                    </div>
                    <div className="cat-footer">கட்டுரைகளைப் படிக்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/essays" className="category-card">
                    <div className="cat-icon-box"><BsFileText /></div>
                    <div className="cat-content">
                        <div className="cat-title">ஆய்வுரைகள்</div>
                        <div className="cat-title-sub">Essays</div>
                        <p className="cat-desc">என் கருத்துரைகளும் திறனாய்வுகளும்.</p>
                        <p className="cat-desc-sub">My formal reviews and critical observations.</p>
                    </div>
                    <div className="cat-footer">ஆய்வுரைகளைப் பார்க்க <FiArrowRight /></div>
                </Link>

                <Link to="/writings/stories" className="category-card">
                    <div className="cat-icon-box"><BsBook /></div>
                    <div className="cat-content">
                        <div className="cat-title">சிறுகதைகள்</div>
                        <div className="cat-title-sub">Short Stories</div>
                        <p className="cat-desc">என் கற்பனையில் உருவான சிறு புனைவுகள்.</p>
                        <p className="cat-desc-sub">My original fiction and short narratives.</p>
                    </div>
                    <div className="cat-footer">சிறுகதைகளை வாசிக்க <FiArrowRight /></div>
                </Link>


                <Link to="/writings/thoughts" className="category-card">
                    <div className="cat-icon-box"><BsCloud /></div>
                    <div className="cat-content">
                        <div className="cat-title">எண்ணங்கள்</div>
                        <div className="cat-title-sub">Thoughts</div>
                        <p className="cat-desc">என் உள்ளத்தின் தடையற்ற எண்ண ஓட்டங்கள்.</p>
                        <p className="cat-desc-sub">My unfiltered thoughts and quick ideas.</p>
                    </div>
                    <div className="cat-footer">எண்ணங்களை அறிய <FiArrowRight /></div>
                </Link>

                <Link to="/writings/diary" className="category-card">
                    <div className="cat-icon-box"><BsMoonStars /></div>
                    <div className="cat-content">
                        <div className="cat-title">நாளேடு</div>
                        <div className="cat-title-sub">Diary</div>
                        <p className="cat-desc">என் தனிப்பட்ட குறிப்புகளும் காலச்சுவடுகளும்.</p>
                        <p className="cat-desc-sub">My private logs and personal milestones.</p>
                    </div>
                    <div className="cat-footer">நாளேட்டைத் திறக்க <FiArrowRight /></div>
                </Link>
            </div>

            <div style={{ height: '56px' }}></div>
        </div>
    );
};

export default Writings;
