import React from 'react';

export const StoryFilterBar = ({ 
    searchTerm, 
    setSearchTerm, 
    activeGenre, 
    setActiveGenre, 
    allGenres, 
    handleFilterResetPage 
}) => {
    return (
        <div className="controls-area" style={{ maxWidth: '800px' }}>
            <div className="minimal-search">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    type="text"
                    placeholder="தேடுக..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleFilterResetPage();
                    }}
                    aria-label="Search Short Stories"
                />
            </div>

            <div className="filter-icon-wrapper">
                <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                <select
                    className="theme-dropdown"
                    value={activeGenre}
                    onChange={(e) => {
                        setActiveGenre(e.target.value);
                        handleFilterResetPage();
                    }}
                >
                    <option value="">வகைகள்</option>
                    {allGenres.map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};
