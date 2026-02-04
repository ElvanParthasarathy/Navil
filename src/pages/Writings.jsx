import React from 'react';
import { Link } from 'react-router-dom';
import { BsChatQuote, BsPencilSquare, BsNewspaper, BsFileText, BsBook, BsPen, BsCloud, BsMoonStars } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';

const Writings = () => {
    return (
        <div className="writings-page page-view fadeIn">
            <style jsx>{`
                .writings-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }

                .writings-header {
                    margin-bottom: 48px;
                    text-align: left;
                }

                .writings-title {
                    font-size: clamp(2.4rem, 3vw, 3rem);
                    font-weight: 800;
                    letter-spacing: -1.5px;
                    margin-bottom: 12px;
                    color: var(--text-main);
                }

                .writings-subtitle {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    max-width: 640px;
                    line-height: 1.6;
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
                    margin-bottom: 6px;
                    color: var(--text-main);
                }

                .cat-desc {
                    font-size: 0.95rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }

                /* HOVER EFFECTS */
                .category-card:hover {
                    transform: translateY(-8px);
                    border-color: var(--text-main);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .category-card:hover .cat-icon-box {
                    background: var(--text-main);
                    color: var(--bg-app);
                    transform: rotate(-5deg) scale(1.1);
                }

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

                .category-card:hover .cat-footer {
                    opacity: 1;
                    transform: translateX(0);
                }

                /* GLASS DECORATION */
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

                .category-card:hover::after {
                    transform: scale(2);
                    opacity: 0.05;
                }

                @media (max-width: 768px) {
                    .writings-page { padding: 24px 0; }
                    .writings-header { padding: 40px 20px 20px; text-align: center; margin-bottom: 32px; }
                    .writings-title { font-size: 2.1rem; margin-bottom: 10px; }
                    .writings-subtitle { font-size: 1rem; line-height: 1.5; }
                    .category-grid { grid-template-columns: 1fr; gap: 12px; padding: 0 20px; margin-top: 24px; }
                    .category-card { min-height: auto; padding: 20px; gap: 16px; border-radius: 18px; }
                    .category-card:active { transform: scale(0.97) translateY(1px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
                    .cat-icon-box { width: 48px; height: 48px; font-size: 1.25rem; border-radius: 12px; }
                    .cat-title { font-size: 1.2rem; margin-bottom: 4px; }
                    .cat-desc { font-size: 0.95rem; line-height: 1.4; }
                }
            `}</style>

            <header className="writings-header animate-entry">
                <h1 className="writings-title">Writings</h1>
                <p className="writings-subtitle">
                    A collection of thoughts, stories, and observations captured throughout my journey. Select a category to explore my archive.
                </p>
            </header>

            <div className="category-grid animate-entry">
                <Link to="/writings/quotes" className="category-card">
                    <div className="cat-icon-box"><BsChatQuote /></div>
                    <div className="cat-content">
                        <div className="cat-title">Quotes</div>
                        <p className="cat-desc">Collected wisdom and inspiring words from thinkers across generations.</p>
                    </div>
                    <div className="cat-footer">Browse archive <FiArrowRight /></div>
                </Link>

                <Link to="/writings/blog" className="category-card">
                    <div className="cat-icon-box"><BsPencilSquare /></div>
                    <div className="cat-content">
                        <div className="cat-title">Blog Posts</div>
                        <p className="cat-desc">Daily reflections, updates, and casual shares from my personal life.</p>
                    </div>
                    <div className="cat-footer">Read posts <FiArrowRight /></div>
                </Link>

                <Link to="/writings/articles" className="category-card">
                    <div className="cat-icon-box"><BsNewspaper /></div>
                    <div className="cat-content">
                        <div className="cat-title">Articles</div>
                        <p className="cat-desc">In-depth technical analysis and structured philosophical long-forms.</p>
                    </div>
                    <div className="cat-footer">Explore articles <FiArrowRight /></div>
                </Link>

                <Link to="/writings/essays" className="category-card">
                    <div className="cat-icon-box"><BsFileText /></div>
                    <div className="cat-content">
                        <div className="cat-title">Essays</div>
                        <p className="cat-desc">Formal arguments, critical reviews, and academic observations.</p>
                    </div>
                    <div className="cat-footer">View essays <FiArrowRight /></div>
                </Link>

                <Link to="/writings/stories" className="category-card">
                    <div className="cat-icon-box"><BsBook /></div>
                    <div className="cat-content">
                        <div className="cat-title">Short Stories</div>
                        <p className="cat-desc">Narrative experiments, fiction, and immersive storytelling pieces.</p>
                    </div>
                    <div className="cat-footer">Read stories <FiArrowRight /></div>
                </Link>

                <Link to="/writings/poems" className="category-card">
                    <div className="cat-icon-box"><BsPen /></div>
                    <div className="cat-content">
                        <div className="cat-title">Poems</div>
                        <p className="cat-desc">Rhythmic verses, abstract poetry, and lyrical expressions of emotion.</p>
                    </div>
                    <div className="cat-footer">Read poems <FiArrowRight /></div>
                </Link>

                <Link to="/writings/thoughts" className="category-card">
                    <div className="cat-icon-box"><BsCloud /></div>
                    <div className="cat-content">
                        <div className="cat-title">Thoughts</div>
                        <p className="cat-desc">Unfiltered streams of consciousness and quick ideological captures.</p>
                    </div>
                    <div className="cat-footer">Explore thoughts <FiArrowRight /></div>
                </Link>

                <Link to="/writings/diary" className="category-card">
                    <div className="cat-icon-box"><BsMoonStars /></div>
                    <div className="cat-content">
                        <div className="cat-title">Diary</div>
                        <p className="cat-desc">Private logs, milestones, and personal journey documentations.</p>
                    </div>
                    <div className="cat-footer">Open logbook <FiArrowRight /></div>
                </Link>
            </div>

            <div style={{ height: '56px' }}></div>
        </div>
    );
};

export default Writings;
