import React from 'react';

export const CategoryFilterBar = ({ 
    searchTerm, 
    setSearchTerm, 
    activeGenre, 
    setActiveGenre, 
    allGenres, 
    handleFilterResetPage,
    meta,
    totalPages,
    isPaginationExpanded,
    setIsPaginationExpanded
}: any) => {
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
                    aria-label={`Search ${meta.title}`}
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
                    {allGenres.map((g: string) => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>
            {totalPages > 1 && (
                <button 
                    className={`pagination-toggle-btn ${isPaginationExpanded ? 'active' : ''}`}
                    onClick={() => setIsPaginationExpanded(!isPaginationExpanded)}
                    aria-label="Toggle Pages"
                >
                    {isPaginationExpanded ? (
                        <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    ) : (
                        <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    )}
                </button>
            )}
        </div>
    );
};
