import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import quotesData from '../../data/quotes.json';

const Quotes = () => {
    // Reverse data to show newest first, as per instructions in original file
    const sortedQuotes = [...quotesData].reverse();
    const [currentPage, setCurrentPage] = useState(1);
    const quotesPerPage = 10; // Adjust as needed

    // Logic for displaying quotes could include pagination if list grows
    // For now simple masonry or list

    return (
        <div className="page-view page-fade">
            <style>{`
                /* Scoped Styles for Quotes - aligned with app theme */
                .quotes-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px 20px 56px;
                }

                .quotes-back-pill {
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

                .quotes-back-pill:hover {
                    background: var(--nav-hover);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.06);
                }

                .quotes-back-pill:active {
                    transform: scale(0.96);
                    box-shadow: none;
                }

                .quotes-header {
                    margin-bottom: 32px;
                }

                /* Masonry Grid */
                .quotes-masonry { columns: 1; column-gap: 20px; }
                @media (min-width: 768px) { .quotes-masonry { columns: 2 280px; } }
                @media (min-width: 1200px) { .quotes-masonry { columns: 3 280px; } }

                .quote-card {
                    break-inside: avoid;
                    background: var(--bg-card);
                    border: 1px solid var(--border-light);
                    padding: 20px;
                    border-radius: 18px;
                    margin-bottom: 20px;
                    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
                    position: relative;
                    display: inline-block;
                    width: 100%;
                }

                .quote-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 26px rgba(0,0,0,0.08);
                    border-color: var(--text-main);
                }

                /* Quote Text */
                .quote-text {
                    font-family: "Mukta Malar", sans-serif;
                    font-size: 0.98rem;
                    line-height: 1.5;
                    color: var(--text-main);
                    margin-bottom: 8px;
                }

                /* Quote Mark */
                .quote-mark {
                    position: absolute;
                    top: 14px;
                    left: 18px;
                    font-size: 2.8rem;
                    line-height: 1;
                    font-family: serif;
                    color: var(--border-light);
                    z-index: 0;
                    pointer-events: none;
                }

                .quote-sub-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                    font-weight: 600;
                    font-family: "Inter", sans-serif;
                }

                .quote-author {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin-top: 10px;
                    display: block;
                    text-align: right;
                }

                @media (max-width: 768px) {
                    .quotes-page {
                        padding: 24px 16px 48px;
                    }

                    .quotes-header {
                        margin-bottom: 24px;
                    }

                    .quotes-back-pill {
                        padding: 8px 16px;
                        margin-bottom: 16px;
                        font-size: 0.95rem;
                        border-radius: 999px;
                    }

                    .quote-card {
                        padding: 18px;
                        border-radius: 16px;
                    }

                    .quote-card:active {
                        transform: scale(0.97) translateY(1px);
                        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
                    }

                    .quote-text {
                        font-size: 0.96rem;
                    }
                }
            `}</style>

            <div className="quotes-page">
                <Link to="/writings" className="quotes-back-pill">
                    <span>←</span> Back to Writings
                </Link>

                <div className="hero-section quotes-header">
                    <h1 className="title">Quotes</h1>
                    <h2 className="subtitle">Fragments of wisdom I've collected over time.</h2>
                </div>

                <div className="quotes-masonry">
                    {sortedQuotes.map(quote => (
                        <div key={quote.id} className="quote-card">
                            <div className="quote-mark">“</div>

                            {/* Tag */}
                            <div className="quote-sub-label">{quote.tag}</div>

                            {/* Text */}
                            <div className="quote-text" style={{ position: 'relative', zIndex: 1, whiteSpace: 'pre-line' }}>
                                {quote.text}
                            </div>

                            {/* Translation if available */}
                            {quote.translation && (
                                <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                                    <div className="quote-sub-label">Translation</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                                        {quote.translation}
                                    </div>
                                </div>
                            )}

                            {/* Transliteration if available */}
                            {quote.transliteration && (
                                <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                                    <div className="quote-sub-label">{quote.transliterationLabel || 'Malayalam'}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'sans-serif', whiteSpace: 'pre-line' }}>
                                        {quote.transliteration}
                                    </div>
                                </div>
                            )}

                            <span className="quote-author">- {quote.author}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Quotes;
