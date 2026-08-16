// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MobileTopBar from '../../components/ui/MobileTopBar';

import { getOptimizedImage } from '../../lib/media';
import { Helmet } from 'react-helmet-async';
import { db } from '../../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';
import { stripHtml, cleanCaption, formatArtDate } from '../../components/features/arts/artsUtils';
import { ArtCard } from '../../components/features/arts/ArtCard';
import { LightboxImage } from '../../components/features/arts/LightboxImage';
import { Engagement } from '../../components/ui/Engagement';
import profileData from '../../data/profile.json';
import profilePic from '../../assets/instagram/profile.jpg';
import './ArtsGallery.css';
import { Heart, ChatCircle, X, CaretLeft, CaretRight, ArrowsOutSimple, ArrowSquareOut } from '@phosphor-icons/react';

const CATEGORY_META = {
    pencil: {
        titleTa: 'கரிக்கோல் ஓவியங்கள்',
        titleEn: 'Pencil Drawings',
        descTa: 'கையால் வரைந்த பென்சில் ஓவியங்கள்',
        descEn: 'Freehand pencil sketches and portrait art.',
    },
    editing: {
        titleTa: 'தொகுப்புகள்',
        titleEn: 'Editings',
        descTa: 'புகைப்படத் திருத்தங்கள் மற்றும் டிஜிட்டல் படைப்புகள்',
        descEn: 'Photo manipulations and digital creations.',
    },
    poster: {
        titleTa: 'சுவரொட்டிகள்',
        titleEn: 'Posters',
        descTa: 'நிகழ்வுகளுக்கான போஸ்டர் வடிவமைப்புகள்',
        descEn: 'Event banners and creative poster designs.',
    },
    painting: {
        titleTa: 'ஓவியங்கள்',
        titleEn: 'Paintings',
        descTa: 'வண்ணங்களில் வரையப்பட்ட ஓவியங்கள்',
        descEn: 'Color paintings and mixed media artworks.',
    },
    quotes: {
        titleTa: 'நவில் மொழிகள்',
        titleEn: 'Quotes',
        descTa: 'நவில் மொழிகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual quote cards and typographic designs.',
    },
    poems: {
        titleTa: 'நவில் மிழிகள்',
        titleEn: 'Poems',
        descTa: 'கவிதைகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual poem cards and creative typography.',
    },
    illustrations: {
        titleTa: 'விளக்கப்படங்கள்',
        titleEn: 'Illustrations',
        descTa: 'டிஜிட்டல் சித்திரங்கள் மற்றும் லோகோ வடிவமைப்புகள்',
        descEn: 'Digital illustrations, logos, and vector art.',
    },
    digital_arts: {
        titleTa: 'எண்மக்கலைகள்',
        titleEn: 'Digital Arts',
        descTa: 'கணினி மென்பொருளில் உருவாக்கிய கலைப்படைப்புகள்',
        descEn: 'Artworks created using digital software.',
    },
};

const ITEMS_PER_PAGE = 8;
const PAGINATION_INCREMENT = 12;

const ArtsGallery = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const meta = CATEGORY_META[category];

    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const flattenedImages = React.useMemo(() => {
        return allItems.flatMap(item => {
            const imgs = Array.isArray(item.images)
                ? item.images.filter((img: any) => typeof img === 'string')
                : (typeof item.images === 'string' ? [item.images] : (item.image ? [item.image] : []));

            return imgs.map((img, idx) => ({
                id: `${item.id}-${idx}`,
                postId: item.id,
                url: img,
                subIdx: idx,
                totalInPost: imgs.length,
                caption: cleanCaption(item.caption),
                date: item.date
            }));
        });
    }, [allItems]);

    const [lightboxGlobalIdx, setLightboxGlobalIdx] = useState(null);
    const filmstripRef = useRef(null);

    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [category]);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeResizeListener?.(handleResize) || window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!category) return;
        setLoading(true);
        const artsRef = ref(db, 'arts');
        const unsubscribe = onValue(artsRef, (snapshot) => {
            if (snapshot.exists()) {
                const dataObj = snapshot.val();
                const dataArray = Object.entries(dataObj)
                    .map(([key, val]) => ({ ...val, id: key }))
                    .filter(item => item.category === category)
                    .sort((a, b) => {
                        const orderA = a.display_order !== undefined ? a.display_order : 999999;
                        const orderB = b.display_order !== undefined ? b.display_order : 999999;
                        if (orderA !== orderB) return orderA - orderB;
                        return (b.timestamp || 0) - (a.timestamp || 0);
                    });
                setAllItems(dataArray);
            } else {
                setAllItems([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase fetch error:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [category]);

    const visibleItems = allItems.slice(0, visibleCount);
    const hasMore = visibleCount < allItems.length;
    const remainingCount = allItems.length - visibleCount;

    const closeLightbox = useCallback(() => {
        if (window.history.state?.lightboxOpen) {
            window.history.back();
        } else {
            setLightboxGlobalIdx(null);
        }
    }, []);

    const openLightbox = useCallback((item) => {
        const firstIdx = flattenedImages.findIndex(fi => fi.postId === item.id);
        setLightboxGlobalIdx(firstIdx >= 0 ? firstIdx : 0);
        window.history.pushState({ lightboxOpen: true }, '');
    }, [flattenedImages]);

    useEffect(() => {
        const handlePopState = (e) => {
            if (e.state?.lightboxOpen !== true) {
                setLightboxGlobalIdx(null);
            }
        };
        window.addEventListener('popstate', handlePopState);

        const mainContent = document.querySelector('.arts-gallery-page');
        if (lightboxGlobalIdx !== null) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            if (mainContent) {
                mainContent.style.visibility = 'hidden';
                mainContent.setAttribute('aria-hidden', 'true');
            }
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            if (mainContent) {
                mainContent.style.visibility = 'visible';
                mainContent.removeAttribute('aria-hidden');
            }
        }

        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            if (mainContent) {
                mainContent.style.visibility = 'visible';
            }
        };
    }, [lightboxGlobalIdx]);

    const goToNext = useCallback(() => {
        if (lightboxGlobalIdx === null) return;
        if (lightboxGlobalIdx < flattenedImages.length - 1) {
            setLightboxGlobalIdx(prev => prev + 1);
        }
    }, [flattenedImages.length, lightboxGlobalIdx]);

    const goToPrev = useCallback(() => {
        if (lightboxGlobalIdx === null) return;
        if (lightboxGlobalIdx > 0) {
            setLightboxGlobalIdx(prev => prev - 1);
        }
    }, [lightboxGlobalIdx]);

    const goToNextPost = useCallback(() => {
        if (lightboxGlobalIdx === null || !flattenedImages[lightboxGlobalIdx]) return;
        const currentPostId = flattenedImages[lightboxGlobalIdx].postId;
        const nextPostIdx = flattenedImages.findIndex(
            (img, idx) => idx > lightboxGlobalIdx && img.postId !== currentPostId
        );
        if (nextPostIdx !== -1) {
            setLightboxGlobalIdx(nextPostIdx);
        }
    }, [flattenedImages, lightboxGlobalIdx]);

    const goToPrevPost = useCallback(() => {
        if (lightboxGlobalIdx === null || !flattenedImages[lightboxGlobalIdx]) return;
        const currentPostId = flattenedImages[lightboxGlobalIdx].postId;
        let prevPostId = null;
        for (let i = lightboxGlobalIdx - 1; i >= 0; i--) {
            if (flattenedImages[i].postId !== currentPostId) {
                prevPostId = flattenedImages[i].postId;
                break;
            }
        }
        if (prevPostId) {
            const firstImgOfPrevPost = flattenedImages.findIndex(img => img.postId === prevPostId);
            setLightboxGlobalIdx(firstImgOfPrevPost);
        }
    }, [flattenedImages, lightboxGlobalIdx]);

    const hasPrevPost = React.useMemo(() => {
        if (lightboxGlobalIdx === null || !flattenedImages[lightboxGlobalIdx]) return false;
        const currentPostId = flattenedImages[lightboxGlobalIdx].postId;
        return flattenedImages.some((img, idx) => idx < lightboxGlobalIdx && img.postId !== currentPostId);
    }, [flattenedImages, lightboxGlobalIdx]);

    const hasNextPost = React.useMemo(() => {
        if (lightboxGlobalIdx === null || !flattenedImages[lightboxGlobalIdx]) return false;
        const currentPostId = flattenedImages[lightboxGlobalIdx].postId;
        return flattenedImages.some((img, idx) => idx > lightboxGlobalIdx && img.postId !== currentPostId);
    }, [flattenedImages, lightboxGlobalIdx]);

    useEffect(() => {
        if (lightboxGlobalIdx === null) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') { closeLightbox(); return; }
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'ArrowLeft') goToPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxGlobalIdx, goToNext, goToPrev, closeLightbox]);

    useEffect(() => {
        if (filmstripRef.current && lightboxGlobalIdx !== null) {
            const activeEl = filmstripRef.current.querySelector('.arts-lb-fs-item.active');
            if (activeEl) {
                const container = filmstripRef.current;
                const scrollPos = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
                container.scrollTo({
                    left: scrollPos,
                    behavior: 'smooth'
                });
            }
        }
    }, [lightboxGlobalIdx]);

    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const containerDragX = useRef(0);
    const isTransitioning = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const scaleRef = useRef(1);
    const offsetRef = useRef({ x: 0, y: 0 });
    const activeImgRef = useRef(null);
    const transformPending = useRef(false);

    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const touchStartTime = useRef(0);
    const lastPinchDistance = useRef(0);
    const pointerStart = useRef({ x: 0, y: 0 });

    const applyTransforms = () => {
        if (!transformPending.current) return;
        if (activeImgRef.current) {
            activeImgRef.current.style.transform = `translate3d(${offsetRef.current.x}px, ${offsetRef.current.y}px, 0) scale(${scaleRef.current})`;
        }
        transformPending.current = false;
    };

    const requestTransform = () => {
        if (!transformPending.current) {
            transformPending.current = true;
            requestAnimationFrame(applyTransforms);
        }
    };

    const preventImageDrag = (e) => {
        e.preventDefault();
    };

    const handlePointerDown = (e) => {
        if (e.pointerType === 'touch' || e.button !== 0 || scale <= 1.01) return;
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        pointerStart.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
    };

    const handlePointerMove = (e) => {
        if (e.pointerType === 'touch' || !isDragging || scaleRef.current <= 1.01) return;
        e.preventDefault();
        const dx = e.clientX - pointerStart.current.x;
        const dy = e.clientY - pointerStart.current.y;

        offsetRef.current.x += dx;
        offsetRef.current.y += dy;
        pointerStart.current = { x: e.clientX, y: e.clientY };
        requestTransform();
    };

    const handlePointerEnd = (e) => {
        if (e.pointerType === 'touch') return;
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        setIsDragging(false);
        setOffset({ ...offsetRef.current });
    };

    const updateScale = useCallback((nextScale) => {
        setScale(prev => {
            const rawScale = typeof nextScale === 'function' ? nextScale(prev) : nextScale;
            const clampedScale = Math.min(Math.max(rawScale, 1), 4);

            scaleRef.current = clampedScale;

            if (clampedScale <= 1.05) {
                setOffset({ x: 0, y: 0 });
                offsetRef.current = { x: 0, y: 0 };
                requestTransform();
                return 1;
            }

            requestTransform();
            return clampedScale;
        });
    }, []);

    useEffect(() => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
        scaleRef.current = 1;
        offsetRef.current = { x: 0, y: 0 };
        setIsCaptionExpanded(false);
        setShowCaptionModal(false);
    }, [lightboxGlobalIdx]);

    useEffect(() => {
        if (scale <= 1.01) {
            setOffset({ x: 0, y: 0 });
            offsetRef.current = { x: 0, y: 0 };
            requestTransform();
        }
    }, [scale]);

    const handleTouchStart = (e) => {
        if (isTransitioning.current) {
            isTransitioning.current = false;
        }

        if (scaleRef.current > 1.01) {
            if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                lastPinchDistance.current = dist;
                setIsDragging(true);
            } else if (e.touches.length === 1 && scaleRef.current > 1.01) {
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
                touchStartTime.current = Date.now();
                setIsDragging(true);
            }
            return;
        }

        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            lastPinchDistance.current = dist;
            setIsDragging(true);
        } else if (e.touches.length === 1) {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
            touchStartTime.current = Date.now();
            containerDragX.current = 0;
            setIsDragging(true);

            if (containerRef.current) {
                containerRef.current.style.transition = 'none';
            }
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            if (lastPinchDistance.current > 0) {
                const delta = dist / lastPinchDistance.current;
                const nextScale = Math.min(Math.max(scaleRef.current * delta, 0.6), 4);
                scaleRef.current = nextScale;

                if (nextScale <= 1.0) {
                    offsetRef.current.x *= 0.8;
                    offsetRef.current.y *= 0.8;
                }

                requestTransform();
            }
            lastPinchDistance.current = dist;
            return;
        }

        if (!isDragging || isTransitioning.current) return;

        if (scaleRef.current > 1.01) {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - touchStartX.current;
            const dy = currentY - touchStartY.current;
            offsetRef.current.x += dx;
            offsetRef.current.y += dy;
            touchStartX.current = currentX;
            touchStartY.current = currentY;
            requestTransform();
            if (e.cancelable) e.preventDefault();
        } else {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - touchStartX.current;
            const dy = currentY - touchStartY.current;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (e.cancelable) e.preventDefault();

                let finalDx = dx;
                const isFirst = lightboxGlobalIdx === 0;
                const isLast = lightboxGlobalIdx === flattenedImages.length - 1;

                if (dx > 0 && isFirst) {
                    finalDx = dx * 0.35;
                } else if (dx < 0 && isLast) {
                    finalDx = dx * 0.35;
                }

                containerDragX.current = finalDx;
                if (containerRef.current) {
                    containerRef.current.style.transform = `translate3d(calc(-33.333% + ${finalDx}px), 0, 0)`;
                }
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (e.touches.length === 0) {
            lastPinchDistance.current = 0;
            setIsDragging(false);

            if (scaleRef.current <= 1.05) {
                scaleRef.current = 1;
                offsetRef.current = { x: 0, y: 0 };
                requestTransform();

                if (containerRef.current && !isTransitioning.current) {
                    const dx = containerDragX.current;
                    const dt = Date.now() - touchStartTime.current;
                    const width = (containerRef.current.clientWidth / 3) || window.innerWidth;

                    const swipeThreshold = width * 0.15;
                    const isFlick = dt < 300 && Math.abs(dx) > 20;
                    const direction = dx > 0 ? -1 : 1;

                    const hasNext = lightboxGlobalIdx < flattenedImages.length - 1;
                    const hasPrev = lightboxGlobalIdx > 0;

                    if (direction === 1 && hasNext && (Math.abs(dx) > swipeThreshold || isFlick)) {
                        slideContainer(1);
                    } else if (direction === -1 && hasPrev && (Math.abs(dx) > swipeThreshold || isFlick)) {
                        slideContainer(-1);
                    } else {
                        slideContainer(0);
                    }
                }
            } else {
                setScale(scaleRef.current);
                setOffset({ ...offsetRef.current });
            }
        } else if (e.touches.length === 1) {
            lastPinchDistance.current = 0;
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const wrapperRef = useRef(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const onTouchStart = (e) => handleTouchStart(e);
        const onTouchMove = (e) => {
            if (e.touches.length === 2) {
                if (e.cancelable) e.preventDefault();
            }
            handleTouchMove(e);
        };
        const onTouchEnd = (e) => handleTouchEnd(e);

        wrapper.addEventListener('touchstart', onTouchStart, { passive: false });
        wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
        wrapper.addEventListener('touchend', onTouchEnd, { passive: false });

        return () => {
            wrapper.removeEventListener('touchstart', onTouchStart);
            wrapper.removeEventListener('touchmove', onTouchMove);
            wrapper.removeEventListener('touchend', onTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const containerRef = useRef(null);

    const slideContainer = useCallback((direction) => {
        if (!containerRef.current || isTransitioning.current) return;

        isTransitioning.current = true;
        const container = containerRef.current;
        container.style.transition = 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)';

        if (direction === 1) {
            container.style.transform = 'translate3d(-66.666%, 0, 0)';
            setTimeout(() => {
                setLightboxGlobalIdx(prev => prev + 1);
            }, 150);
        } else if (direction === -1) {
            container.style.transform = 'translate3d(0%, 0, 0)';
            setTimeout(() => {
                setLightboxGlobalIdx(prev => prev - 1);
            }, 150);
        } else {
            container.style.transform = 'translate3d(-33.333%, 0, 0)';
            setTimeout(() => {
                container.style.transition = 'none';
                isTransitioning.current = false;
            }, 150);
        }
    }, [setLightboxGlobalIdx]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.transition = 'none';
            containerRef.current.style.transform = 'translate3d(-33.333%, 0, 0)';
        }
        isTransitioning.current = false;
        containerDragX.current = 0;
    }, [lightboxGlobalIdx]);

    const handleWheel = useCallback((e) => {
        if (lightboxGlobalIdx === null) return;

        if (e.target.closest('.arts-lb-filmstrip') || e.target.closest('.arts-lb-sidebar')) {
            return;
        }

        if (e.ctrlKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.01;
            updateScale(prev => prev + delta);
            return;
        }

        if (scaleRef.current > 1.01) {
            e.preventDefault();
            offsetRef.current.x -= e.deltaX;
            offsetRef.current.y -= e.deltaY;
            setOffset({ x: offsetRef.current.x, y: offsetRef.current.y });
            requestTransform();
            return;
        }
    }, [lightboxGlobalIdx, updateScale]);

    useEffect(() => {
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel]);

    if (!meta) {
        return (
            <div className="page-view fadeIn" style={{ padding: '40px 24px', textAlign: 'center' }}>
                <h2>Category Not Found</h2>
                <Link to="/arts" style={{ color: 'var(--text-muted)' }}>Return to Arts</Link>
            </div>
        );
    }

    return (
        <>
            <MobileTopBar title={`${meta?.titleTa}|${meta?.titleEn || ''}`} showBack={true} backUrl="/arts" />
            <div className="page-view fadeIn">
                <Helmet>
                    <title>{meta.titleTa} | {meta.titleEn}</title>
                    <meta name="description" content={meta.descEn} />
                </Helmet>

<div className="arts-gallery-page">
                    <header className="arts-gallery-header animate-entry">
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h1 className="arts-gallery-title">{meta.titleTa}</h1>
                            <div className="arts-gallery-sub">{meta.titleEn}</div>
                        </div>
                        <Link
                            to="/arts"
                            className="back-pill bp-fixed"
                            onClick={(e) => {
                                if (window.history.state && window.history.state.idx > 0) {
                                    e.preventDefault();
                                    navigate(-1);
                                }
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg> பின்செல்
                        </Link>
                    </header>

                    {loading ? (
                        <div className="arts-skeleton-grid animate-entry">
                            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                <div key={i} className="arts-skeleton-item" />
                            ))}
                        </div>
                    ) : allItems.length === 0 ? (
                        <div className="arts-empty animate-entry">
                            <p>இன்னும் படைப்புகள் இல்லை. விரைவில் சேர்க்கப்படும்!</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>No artworks yet. Check back soon!</p>
                        </div>
                    ) : (
                        <>
                            <div className="arts-grid animate-entry">
                                {visibleItems.map((item) => (
                                    <ArtCard
                                        key={item.id}
                                        item={item}
                                        onOpen={openLightbox}
                                        caption={cleanCaption(item.caption)}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="arts-show-more-wrapper animate-entry">
                                    <button
                                        className="arts-show-more-btn"
                                        onClick={() => setVisibleCount(prev => prev + PAGINATION_INCREMENT)}
                                    >
                                        மேலும் காட்டு / Show More
                                        <span className="arts-show-more-count">{remainingCount}</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* LIGHTBOX TELEPORTED OUT OF ANIMATED CONTAINER */}
            {lightboxGlobalIdx !== null && flattenedImages[lightboxGlobalIdx] && typeof document !== 'undefined' && createPortal(
                (() => {
                    const currentImg = flattenedImages[lightboxGlobalIdx];
                    return (
                        <div className="arts-lightbox" onClick={closeLightbox}>

                            <div
                                className="arts-lb-header"
                                onClick={(e) => e.stopPropagation()}
                                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                            >
                                <button className="arts-lb-close" onClick={closeLightbox} aria-label="Close">
                                    <X weight="regular" size={18} />
                                </button>

                                <div className="arts-lb-profile">
                                    <div className="arts-lb-avatar">
                                        <img src={profilePic} alt={profileData.fullName} />
                                    </div>
                                    <div className="arts-lb-author">{profileData.fullName}</div>
                                </div>
                            </div>

                            <div className="arts-lb-main-container" onClick={(e) => e.stopPropagation()}>
                                {hasPrevPost && (
                                    <button className="arts-lb-nav prev arts-lb-nav-post desktop-only" onClick={goToPrevPost}>
                                        <CaretLeft weight="regular" size={26} />
                                    </button>
                                )}
                                {hasNextPost && (
                                    <button className="arts-lb-nav next arts-lb-nav-post desktop-only" onClick={goToNextPost}>
                                        <CaretRight weight="regular" size={26} />
                                    </button>
                                )}

                                <div
                                    className="arts-lb-img-wrapper"
                                    ref={wrapperRef}
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerEnd}
                                    onPointerCancel={handlePointerEnd}
                                    onPointerLeave={handlePointerEnd}
                                    style={{ touchAction: scale !== 1 ? 'none' : 'pan-x pan-y' }}
                                >
                                    <div
                                        className="arts-lb-img-container"
                                        ref={containerRef}
                                        style={{ transform: 'translate3d(-33.333%, 0, 0)' }}
                                    >
                                        {[-1, 0, 1].map(offset => {
                                            const i = lightboxGlobalIdx + offset;
                                            if (i < 0 || i >= flattenedImages.length) {
                                                return <div key={`spacer-${offset}`} className="arts-lb-slide spacer" />;
                                            }

                                            const img = flattenedImages[i];
                                            const isCurrent = offset === 0;

                                            return (
                                                <LightboxImage
                                                    key={img.id}
                                                    img={img}
                                                    isCurrent={isCurrent}
                                                    isMobile={isMobile}
                                                    isDragging={isDragging}
                                                    preventImageDrag={preventImageDrag}
                                                    activeImgRef={isCurrent ? activeImgRef : null}
                                                />
                                            );
                                        })}
                                    </div>

                                    {lightboxGlobalIdx > 0 && flattenedImages[lightboxGlobalIdx].subIdx > 0 && (
                                        <button className="arts-lb-nav prev arts-lb-nav-photo desktop-only" onClick={goToPrev}>
                                            <CaretLeft weight="regular" size={22} />
                                        </button>
                                    )}
                                    {lightboxGlobalIdx < flattenedImages.length - 1 && flattenedImages[lightboxGlobalIdx].subIdx < flattenedImages[lightboxGlobalIdx].totalInPost - 1 && (
                                        <button className="arts-lb-nav next arts-lb-nav-photo desktop-only" onClick={goToNext}>
                                            <CaretRight weight="regular" size={22} />
                                        </button>
                                    )}
                                </div>

                                <div className="arts-lb-sidebar">
                                    <div className="arts-lb-sidebar-header">
                                        <div className="arts-lb-profile">
                                            <div className="arts-lb-avatar">
                                                <img src={profilePic} alt={profileData.fullName} />
                                            </div>
                                            <div className="arts-lb-author">{profileData.fullName}</div>
                                        </div>
                                    </div>

                                    <div className="arts-lb-sidebar-body">
                                        <div className="arts-lb-meta-header">
                                            {currentImg.caption && (
                                                <div className="arts-lb-caption-scroll">
                                                    <h2 className="arts-lb-caption" dangerouslySetInnerHTML={{ __html: currentImg.caption }} />
                                                </div>
                                            )}

                                            <div className="arts-lb-meta-row">
                                                {currentImg.totalInPost > 1 && (
                                                    <div className="arts-lb-pagination">
                                                        {[...Array(currentImg.totalInPost)].map((_, i) => {
                                                            const postBaseIdx = flattenedImages.findIndex(img => img.postId === currentImg.postId);
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`arts-lb-dot ${i === currentImg.subIdx ? 'active' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setLightboxGlobalIdx(postBaseIdx + i);
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                <div className="arts-lb-engagement-pill">
                                                    <Engagement postId={currentImg.postId} category="arts" minimal={true} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="arts-lb-date">{formatArtDate(currentImg.date)}</div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="arts-lb-footer-content"
                                onClick={(e) => e.stopPropagation()}
                                style={{ pointerEvents: isDragging ? 'none' : undefined }}
                            >
                                <div className="arts-lb-meta-header">
                                    {/* Mobile Image Dots (On top of image) */}
                                    {currentImg.totalInPost > 1 && (
                                        <div className="mobile-image-dots mobile-only">
                                            {[...Array(currentImg.totalInPost)].map((_, i) => {
                                                const postBaseIdx = flattenedImages.findIndex(img => img.postId === currentImg.postId);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`arts-lb-dot ${i === currentImg.subIdx ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLightboxGlobalIdx(postBaseIdx + i);
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="arts-lb-caption-row mobile-only">
                                        {currentImg.caption && (() => {
                                            const plainText = stripHtml(currentImg.caption);
                                            return (
                                                <h2 className="arts-lb-caption">
                                                    {plainText.length > 60 ? (
                                                        <>
                                                            <span dangerouslySetInnerHTML={{ __html: plainText.slice(0, 60) + '...' }} />
                                                            <button
                                                                className="arts-lb-view-more"
                                                                onClick={() => setShowCaptionModal(true)}
                                                            >
                                                                more
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: currentImg.caption }} />
                                                    )}
                                                </h2>
                                            );
                                        })()}
                                        <div className="arts-lb-engagement-pill mobile-only">
                                            <Engagement postId={currentImg.postId} category="arts" minimal={true} />
                                        </div>
                                    </div>

                                </div>

                                <div className="arts-lb-footer-row">
                                    <div className="arts-lb-caption-group">
                                        <div className="arts-lb-date">{formatArtDate(currentImg.date)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="arts-lb-filmstrip" ref={filmstripRef} onClick={(e) => e.stopPropagation()}>
                                {flattenedImages.filter(fi => fi.subIdx === 0).map((firstImg) => {
                                    const itemGlobalIdx = flattenedImages.findIndex(fi => fi.postId === firstImg.postId);
                                    const currentPostId = flattenedImages[lightboxGlobalIdx]?.postId;
                                    const isActive = currentPostId === firstImg.postId;

                                    return (
                                        <div
                                            key={firstImg.postId}
                                            className={`arts-lb-fs-item ${isActive ? 'active' : ''}`}
                                            onClick={() => setLightboxGlobalIdx(itemGlobalIdx)}
                                        >
                                            <img src={getOptimizedImage(firstImg.url, 'thumb')} alt="" loading="lazy" decoding="async" draggable={false} onDragStart={preventImageDrag} />
                                        </div>
                                    );
                                })}
                            </div>

                            {showCaptionModal && (
                                <div
                                    className="arts-lb-caption-sheet-overlay"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCaptionModal(false);
                                    }}
                                >
                                    <div className="arts-lb-caption-sheet" onClick={e => e.stopPropagation()}>
                                        <button className="arts-lb-sheet-close" onClick={() => setShowCaptionModal(false)}>
                                            <X weight="regular" size={18} />
                                        </button>
                                        <div className="arts-lb-sheet-title" dangerouslySetInnerHTML={{ __html: currentImg.caption }} />
                                        <div className="arts-lb-sheet-meta">
                                            <div className="arts-lb-profile">
                                                <div className="arts-lb-avatar">
                                                    <img src={profilePic} alt={profileData.fullName} />
                                                </div>
                                                <div className="arts-lb-author">{profileData.fullName}</div>
                                            </div>
                                            <div className="arts-lb-date">{formatArtDate(currentImg.date)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })(),
                document.body
            )}
        </>
    );
};

export default ArtsGallery;