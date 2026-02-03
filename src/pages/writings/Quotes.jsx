import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import quotesData from '../../data/quotesData';

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
                /* Scoped Styles for Quotes - OPTIMIZED FOR READABILITY */
                
                /* 1. Masonry Grid */
                .quotes-masonry { columns: 1; column-gap: 20px; }
                @media (min-width: 768px) { .quotes-masonry { columns: 2 280px; } }
                @media (min-width: 1200px) { .quotes-masonry { columns: 3 280px; } }

                .quote-card {
                    break-inside: avoid; 
                    background: #fff; 
                    border: 1px solid #eee; 
                    padding: 24px; 
                    border-radius: 16px; 
                    margin-bottom: 20px;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    position: relative; 
                    display: inline-block; 
                    width: 100%;
                }
                .quote-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); border-color: #111; }
                
                /* 2. Quote Text */
                .quote-text { 
                    font-family: "Mukta Malar", sans-serif; 
                    font-size: 1rem; 
                    line-height: 1.5; 
                    color: #222; 
                    margin-bottom: 8px; 
                }

                /* 3. Quote Mark */
                .quote-mark {
                    position: absolute; top: 15px; left: 20px; font-size: 3rem;
                    line-height: 1; font-family: serif; color: #f0f0f0; z-index: 0; pointer-events: none;
                }

                .quote-sub-label {
                    font-size: 0.7rem; 
                    color: #999; 
                    text-transform: uppercase; 
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                    font-weight: 600;
                    font-family: "Inter", sans-serif;
                }

                .quote-author { 
                    font-size: 0.85rem; 
                    font-weight: 700; 
                    color: #111; 
                    margin-top: 10px; 
                    display: block; 
                    text-align: right; 
                }
            `}</style>

            <Link to="/writings" className="spa-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#666', textDecoration: 'none', fontWeight: 600, marginBottom: '24px' }}>
                <span>←</span> Back to Writings
            </Link>

            <div className="hero-section" style={{ marginBottom: '40px' }}>
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
                            <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                <div className="quote-sub-label">Translation</div>
                                <div style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                                    {quote.translation}
                                </div>
                            </div>
                        )}

                        {/* Transliteration if available */}
                        {quote.transliteration && (
                            <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                <div className="quote-sub-label">Malayalam</div>
                                <div style={{ fontSize: '0.9rem', color: '#555', fontFamily: 'sans-serif', whiteSpace: 'pre-line' }}>
                                    {quote.transliteration}
                                </div>
                            </div>
                        )}

                        <span className="quote-author">- {quote.author}</span>
                    </div>
                ))}
            </div>

            <div style={{ height: '60px' }}></div>
        </div>
    );
};

export default Quotes;
