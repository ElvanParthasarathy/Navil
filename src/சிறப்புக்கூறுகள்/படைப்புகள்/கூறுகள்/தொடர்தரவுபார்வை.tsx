import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export const SeriesDetailView = ({ expandedSeriesData, clearSeriesView }: any) => {
    const sd = expandedSeriesData;
    const sdParts = sd.parts;
    const sdFirst = sdParts[0];
    const sdCover = sd.masterCover || sdParts.find((p: any) => p.cover_image)?.cover_image || null;
    const sdClassification = sdParts.find((p: any) => p.classification)?.classification || null;
    const sdFirstVariant = sdFirst?.variants?.[0];
    const fallbackExcerpt = sdFirstVariant?.text
        ? sdFirstVariant.text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').substring(0, 300)
        : '';
    const sdExcerpt = sd.masterDescription || fallbackExcerpt;
    const sdGenresSet = new Set<string>();
    sdParts.forEach((p: any) => {
        [...(p.tags || []), p.style, p.theme, p.meter].filter(Boolean).forEach((g: string) => sdGenresSet.add(g));
    });
    const sdGenres = Array.from(sdGenresSet);

    return (
        <>
            <Helmet>
                <title>{sd.seriesName} | Series | Elvan Parthasarathy</title>
                <meta name="description" content={`Read the complete series: ${sd.seriesName}. ${sdExcerpt}`} />
            </Helmet>
            
            <button 
                onClick={clearSeriesView}
                className="tv-back-btn"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                <span>தொடர்கள்</span>
            </button>

            <div className="tv-series-master">
                <div className="tv-hero-section">
                    <div className="tv-hero-poster">
                        {sdCover ? (
                            <img src={sdCover} alt={sd.seriesName} />
                        ) : (
                            <div className="tv-placeholder-poster">
                                <span className="tv-placeholder-icon">📚</span>
                            </div>
                        )}
                        <div className="tv-poster-glow" style={sdCover ? { backgroundImage: `url(${sdCover})` } : {}}></div>
                    </div>
                    
                    <div className="tv-hero-info">
                        <div className="tv-meta-badges">
                            <span className="tv-badge premium">தொடர்</span>
                            <span className="tv-badge status">{sd.isComplete ? 'முழுமையானது' : 'தொடர்கிறது'}</span>
                        </div>
                        
                        <h1 className="tv-series-title">{sd.seriesName}</h1>

                        <div className="tv-meta-row">
                            <span className="tv-ep-count-badge">{sdParts.length} அத்தியாயங்கள்</span>
                            {sdClassification && (
                                <span className={`tv-class-badge ${sdClassification === 'அகம்' ? 'agam' : sdClassification === 'புறம்' ? 'puram' : ''}`}>
                                    {sdClassification}
                                </span>
                            )}
                        </div>

                        <div className="tv-genres-row">
                            {sdGenres.map(g => (
                                <span key={g} className="tv-genre-dot">{g}</span>
                            ))}
                        </div>

                        <p className="tv-series-desc">{sdExcerpt}...</p>

                        <div className="tv-actions">
                            <Link 
                                to={`/writings/stories/${sdFirst.slug || sdFirst.id}`}
                                state={{ fromQuickLink: true }}
                                className="tv-primary-btn"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0px', lineHeight: 1.2 }}>
                                    <span style={{ fontSize: '1em' }}>வாசிக்கத் தொடங்கு</span>
                                    <span style={{ fontSize: '0.7em', opacity: 0.7, fontWeight: 500, letterSpacing: '0.2px' }}>Start reading (Part 1)</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="tv-episodes-section">
                    <div style={{ marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingLeft: '24px' }}>
                        <h3 className="tv-section-title" style={{ marginBottom: '4px', paddingBottom: 0, borderBottom: 'none' }}>அத்தியாயங்கள்</h3>
                        <span style={{ fontSize: '0.95em', opacity: 0.6, fontWeight: 500, letterSpacing: '0.5px', textTransform: 'none' }}>chapters</span>
                    </div>
                    <div className="tv-episodes-grid">
                        {sdParts.map((part: any, idx: number) => {
                            const partTitle = part.variants?.[0]?.title || part.title || `Part ${part.series_part}`;
                            const partDate = part.publish_date
                                ? new Date(part.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '';
                            const partExcerpt = part.variants?.[0]?.text
                                ? part.variants[0].text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 150)
                                : '';
                            const partNumStr = String(part.series_part || idx + 1).padStart(2, '0');

                            return (
                                <Link
                                    key={part.id}
                                    to={`/writings/stories/${part.slug || part.id}`}
                                    className="tv-ep-card"
                                    state={{ fromQuickLink: true }}
                                >
                                    <div className="tv-ep-number-bg">{partNumStr}</div>
                                    <div className="tv-ep-card-body">
                                        <div className="tv-ep-meta">
                                            <span className="tv-ep-num-pill">பகுதி {part.series_part || idx + 1}</span>
                                            {partDate && <span className="tv-ep-date">{partDate}</span>}
                                        </div>
                                        <h4 className="tv-ep-title">{partTitle}</h4>
                                        {partExcerpt && <p className="tv-ep-excerpt">{partExcerpt}...</p>}
                                        <div className="tv-ep-footer">
                                            <span>வாசிக்கத் தொடங்கு</span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};
