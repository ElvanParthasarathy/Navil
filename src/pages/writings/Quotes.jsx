
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import quotesData from '../../data/quotes.json';

const Quotes = () => {
    // Reverse data to show newest first, as per instructions in original file
    const sortedQuotes = [...quotesData].reverse();

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
                    margin-top: 4px;
                    display: block;
                    text-align: right;
                    opacity: 0.8;
                }
                
                .quote-variant {
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                    border-bottom: 1px dashed var(--border-light);
                }
                
                .quote-variant:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                @media (max-width: 768px) {
                    .quotes-page {
                        padding: 24px 16px 48px;
                    }
                    .quotes-back-pill {
                        padding: 8px 16px;
                        margin-bottom: 16px;
                    }
                    .quote-card {
                        padding: 18px;
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
                            <div className="quote-sub-label" style={{ marginBottom: '16px' }}>{quote.tag}</div>

                            {/* Render Variants */}
                            {quote.variants?.map((variant, index) => (
                                <div key={index} className="quote-variant">
                                    {/* Optional Header Label */}
                                    {variant.label && <div className="quote-sub-label">{variant.label}</div>}

                                    {/* Text */}
                                    <div className="quote-text" style={{ position: 'relative', zIndex: 1, whiteSpace: 'pre-line' }}>
                                        {variant.text}
                                    </div>

                                    {/* Author for this specific variant */}
                                    {variant.author && <span className="quote-author">- {variant.author}</span>}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Quotes;
