import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImage } from '../../../lib/media';

export const CategoryGrid = ({ posts, category }: any) => {
    return (
        <div className="blog-grid-container" style={posts.length > 0 && posts[0].type === 'series_master' ? { gridTemplateColumns: 'repeat(2, 1fr)', gap: '28px' } : {}}>
            {posts.map((item: any) => {
                if (item.type === 'series_master') {
                    const parts = item.parts || [];
                    const firstPart = parts[0];
                    const primaryVariant = firstPart?.variants?.[0];
                    const seriesTitle = primaryVariant?.title || firstPart?.title || item.seriesName || '';
                    const coverImage = item.masterCover || firstPart?.cover_image || null;
                    const classification = parts.find((p: any) => p.classification)?.classification || null;
                    
                    const genresSet = new Set<string>();
                    parts.forEach((p: any) => {
                        const pGenres = [
                            ...(p.tags || []),
                            p.style,
                            p.theme,
                            p.meter
                        ].filter(Boolean);
                        pGenres.forEach((g: string) => genresSet.add(g));
                    });
                    const genres = Array.from(genresSet);

                    return (
                        <div key={item.id} className="blog-card-item series-card animate-entry">
                            {coverImage && (
                                <Link to={`/writings/${category}/${firstPart.slug || firstPart.id}`} className="blog-cover-wrapper" style={{ display: 'block' }}>
                                    <img src={getOptimizedImage(coverImage, 'thumb')} alt={seriesTitle} loading="lazy" />
                                    {classification && (
                                        <span className={`blog-classification-badge ${classification === 'அகம்' ? 'agam' : classification === 'புறம்' ? 'puram' : ''}`}>{classification}</span>
                                    )}
                                    <div className="series-hover-play">▶ Start Reading</div>
                                </Link>
                            )}
                            <div className="blog-card-content">
                                {!coverImage && classification && (
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        <span className={`blog-classification-badge inline ${classification === 'அகம்' ? 'agam' : classification === 'புறம்' ? 'puram' : ''}`}>{classification}</span>
                                    </div>
                                )}
                                
                                <div className="blog-meta-minimal">
                                    <span className="series-badge">📚 தொடர் ({parts.length} பகுதிகள்)</span>
                                    {genres.length > 0 && <span className="meta-dot">•</span>}
                                    {genres.slice(0, 2).map((g, i) => (
                                        <React.Fragment key={i}>
                                            <span>{g as string}</span>
                                            {i < Math.min(genres.length, 2) - 1 && <span className="meta-dot">•</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <h2 className="blog-title" style={{ marginTop: '8px' }}>{seriesTitle}</h2>
                                <Link to={`/writings/${category}/${firstPart.slug || firstPart.id}`} className="tv-primary-btn" style={{ marginTop: '16px', padding: '10px 16px', fontSize: '0.9rem' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                    வாசிக்கத் தொடங்கு
                                </Link>
                            </div>
                        </div>
                    );
                }

                // Regular Post
                const post = item;
                const primaryVariant = post.variants?.[0];
                const primaryTitle = primaryVariant?.title || post.title || '';
                const primaryExcerpt = primaryVariant?.text ? (new DOMParser().parseFromString(primaryVariant.text, 'text/html').body.textContent || '').substring(0, 120) : '';

                const genres = [
                    ...(post.tags || []),
                    post.style,
                    post.theme,
                    post.meter
                ].filter(Boolean);

                const coverImage = post.cover_image || null;

                return (
                    <Link
                        to={`/writings/${category}/${post.slug || post.id}`}
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
                                        {new Date(post.publish_date || post.date || 0).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {genres.length > 0 && <span className="meta-dot">•</span>}
                                    {genres.slice(0, 2).map((g, i) => (
                                        <React.Fragment key={i}>
                                            <span>{g as string}</span>
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




