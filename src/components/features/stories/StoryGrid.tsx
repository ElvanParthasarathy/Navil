import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImage } from '../../../lib/media';

export const StoryGrid = ({ posts, onSeriesClick }: any) => {
    return (
        <div className="blog-grid-container stories-netflix-grid">
            {posts.map((post: any) => {
                if (post.type === 'series_master') {
                    const primaryVariant = post.variants?.[0];
                    const seriesTitle = primaryVariant?.title || post.title || post.seriesName || '';
                    const seriesDesc = primaryVariant?.text 
                        ? primaryVariant.text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 120)
                        : post.masterDescription || '';
                    
                    const coverImage = post.masterCover || (post.parts?.[0]?.cover_image) || null;
                    const isComplete = post.isComplete;
                    
                    return (
                        <div
                            key={post.id}
                            className="blog-link-card"
                            onClick={() => onSeriesClick(post)}
                            style={{ cursor: 'pointer' }}
                        >
                            <article className="blog-card-item series-master-card">
                                <div className="series-stacked-effect">
                                    <div className="stack-layer layer-1"></div>
                                    <div className="stack-layer layer-2"></div>
                                </div>
                                
                                {coverImage && (
                                    <div className="blog-cover-wrapper">
                                        <img src={getOptimizedImage(coverImage, 'thumb')} alt={seriesTitle} loading="lazy" />
                                        <span className="blog-classification-badge series">தொடர்</span>
                                    </div>
                                )}
                                
                                <div className="blog-card-content">
                                    {!coverImage && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <span className="blog-classification-badge inline series">தொடர்</span>
                                        </div>
                                    )}
                                    <div className="blog-meta-minimal">
                                        <span className="meta-date" style={{ color: 'var(--brand-blue)' }}>
                                            {post.parts?.length || 0} பகுதிகள்
                                        </span>
                                        <span className="meta-dot">•</span>
                                        <span>{isComplete ? 'முழுமையானது' : 'தொடர்கிறது'}</span>
                                    </div>
                                    
                                    <h2 className="blog-title">{seriesTitle}</h2>
                                    
                                    {seriesDesc && (
                                        <p className="blog-excerpt">{seriesDesc}...</p>
                                    )}
                                </div>
                            </article>
                        </div>
                    );
                }

                // Regular Post
                const primaryVariant = post.variants?.[0];
                const primaryTitle = primaryVariant?.title || post.title || '';
                const primaryExcerpt = primaryVariant?.text ? primaryVariant.text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').substring(0, 120) : '';

                const genres = [
                    ...(post.tags || []),
                    post.style,
                    post.theme,
                    post.meter
                ].filter(Boolean);

                const coverImage = post.cover_image || null;

                return (
                    <Link
                        to={`/writings/stories/${post.slug || post.id}`}
                        key={post.id}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        className="blog-link-card"
                    >
                        <article className="blog-card-item">
                            {coverImage && (
                                <div className="blog-cover-wrapper">
                                    <img src={getOptimizedImage(coverImage, 'thumb')} alt={primaryTitle} loading="lazy" />
                                    {((post.isPinned || post.is_pinned) && (post.pinType === 'permanent' || post.pin_type === 'permanent')) && (
                                        <span className="blog-featured-badge">✨ Featured</span>
                                    )}
                                    {post.classification && (
                                        <span className={`blog-classification-badge ${post.classification === 'அகம்' ? 'agam' : post.classification === 'புறம்' ? 'puram' : ''}`}>{post.classification}</span>
                                    )}
                                </div>
                            )}
                            <div className="blog-card-content">
                                {!coverImage && (((post.isPinned || post.is_pinned) && (post.pinType === 'permanent' || post.pin_type === 'permanent')) || post.classification) && (
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                        {((post.isPinned || post.is_pinned) && (post.pinType === 'permanent' || post.pin_type === 'permanent')) && (
                                            <span className="blog-featured-badge inline">✨ Featured</span>
                                        )}
                                        {post.classification && (
                                            <span className={`blog-classification-badge inline ${post.classification === 'அகம்' ? 'agam' : post.classification === 'புறம்' ? 'puram' : ''}`}>{post.classification}</span>
                                        )}
                                    </div>
                                )}
                                <div className="blog-meta-minimal">
                                    <span className="meta-date">
                                        {new Date(post.publish_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {genres.length > 0 && <span className="meta-dot">•</span>}
                                    {genres.slice(0, 2).map((g, i) => (
                                        <React.Fragment key={i}>
                                            <span>{g}</span>
                                            {i < Math.min(genres.length, 2) - 1 && <span className="meta-dot">•</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <h2 className="blog-title">{primaryTitle}</h2>
                                {primaryExcerpt && <p className="blog-excerpt">{primaryExcerpt}...</p>}
                            </div>
                        </article>
                    </Link>
                );
            })}
        </div>
    );
};
