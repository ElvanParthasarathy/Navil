import React from 'react';
import { Link, useParams } from 'react-router-dom';

const WritingsPlaceholder = () => {
    const { category } = useParams();
    const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="page-view page-fade">
            <Link to="/writings" className="spa-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, marginBottom: '24px' }}>
                <span>←</span> Back to Writings
            </Link>

            <div className="hero-section">
                <h1 className="title">{formattedCategory}</h1>
                <h2 className="subtitle">Coming Soon</h2>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚧</div>
                <p>Content for {formattedCategory} is currently being written.</p>
            </div>
        </div>
    );
};

export default WritingsPlaceholder;
