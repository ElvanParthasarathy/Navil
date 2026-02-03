import React from 'react';
import { Link } from 'react-router-dom';
import { BsChatQuote, BsPencilSquare, BsNewspaper, BsFileText, BsBook, BsPen, BsCloud, BsMoonStars } from 'react-icons/bs';

const Writings = () => {
    return (
        <div className="page-view page-fade">
            <style>{`
        .writings-header {
           /* Inherits hero-section styles */
        }
        
        .category-grid {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
           gap: 15px;
           margin-top: 20px;
           padding: 0 10px;
           max-width: 800px; /* Constrain width */
           width: 100%;
        }

        .category-card {
            background-color: #fafafa;
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 20px 15px;
            text-align: center;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 160px;
        }

        .category-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            background-color: #fff;
            border-color: #ddd;
        }

        .cat-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cat-title {
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 5px;
            color: #333;
        }

        .cat-desc {
            font-size: 0.85rem;
            color: #777;
            line-height: 1.4;
        }

        .cat-arrow {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 1.2rem;
            color: #ccc;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .category-card:hover .cat-arrow {
            opacity: 1;
            transform: translateX(3px);
            color: #555;
        }
      `}</style>

            <div className="hero-section writings-header">
                <h1 className="title">Writings</h1>
                <p className="subtitle">Select a category to explore.</p>
            </div>

            <div className="category-grid">
                <Link to="/writings/quotes" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsChatQuote /></div>
                    <div className="cat-title">Quotes</div>
                    <div className="cat-desc">Collected wisdom from others.</div>
                </Link>

                <Link to="/writings/blog" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsPencilSquare /></div>
                    <div className="cat-title">Blog Posts</div>
                    <div className="cat-desc">Daily updates and casual writing.</div>
                </Link>

                <Link to="/writings/articles" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsNewspaper /></div>
                    <div className="cat-title">Articles</div>
                    <div className="cat-desc">Long-form technical and philosophical pieces.</div>
                </Link>

                <Link to="/writings/essays" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsFileText /></div>
                    <div className="cat-title">Essays</div>
                    <div className="cat-desc">Formal arguments and observations.</div>
                </Link>

                <Link to="/writings/stories" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsBook /></div>
                    <div className="cat-title">Short Stories</div>
                    <div className="cat-desc">Fiction, narrative experiments, and tales.</div>
                </Link>

                <Link to="/writings/poems" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsPen /></div>
                    <div className="cat-title">Poems</div>
                    <div className="cat-desc">Verses and rhythmic thoughts.</div>
                </Link>

                <Link to="/writings/thoughts" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsCloud /></div>
                    <div className="cat-title">Thoughts</div>
                    <div className="cat-desc">Random streams of consciousness.</div>
                </Link>

                <Link to="/writings/diary" className="category-card">
                    <span className="cat-arrow">→</span>
                    <div className="cat-icon"><BsMoonStars /></div>
                    <div className="cat-title">Diary</div>
                    <div className="cat-desc">Personal notes and logs.</div>
                </Link>
            </div>

            <div style={{ height: '40px' }}></div>
        </div>
    );
};

export default Writings;
