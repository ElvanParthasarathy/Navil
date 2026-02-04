import React from 'react';
import { Link, useParams } from 'react-router-dom';

const WritingsPlaceholder = () => {
    const { category } = useParams();
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="page-view page-fade">
            <style>{`
                .writings-subpage {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 32px 20px 56px;
                }

                .writings-back-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 14px;
                    border-radius: 999px;
                    background: var(--bg-panel);
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                    border: 1px solid var(--border-light);
                    margin-bottom: 20px;
                    transition: background 0.2s ease, transform 0.12s ease, box-shadow 0.2s ease;
                }

                .writings-back-pill:hover {
                    background: var(--nav-hover);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.06);
                }

                .writings-back-pill:active {
                    transform: scale(0.96);
                    box-shadow: none;
                }

                .writings-sub-hero {
                    margin-bottom: 28px;
                }

                .coming-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 32px 28px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                }

                .coming-emoji {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                }

                .coming-text {
                    font-size: 0.98rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    .writings-subpage {
                        padding: 24px 16px 48px;
                    }

                    .writings-back-pill {
                        padding: 8px 16px;
                        margin-bottom: 16px;
                        font-size: 0.95rem;
                    }

                    .coming-card {
                        padding: 28px 20px;
                        border-radius: 18px;
                    }
                }
            `}</style>

            <div className="writings-subpage">
                <Link to="/writings" className="writings-back-pill">
                    <span>←</span> Back to Writings
                </Link>

                <div className="hero-section writings-sub-hero">
                    <h1 className="title">{formattedCategory}</h1>
                    <h2 className="subtitle">Coming Soon</h2>
                </div>

                <div className="coming-card">
                    <div className="coming-emoji">🚧</div>
                    <p className="coming-text">
                        Content for {formattedCategory} is currently being written.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WritingsPlaceholder;
