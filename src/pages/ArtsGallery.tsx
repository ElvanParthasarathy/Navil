// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MobileTopBar from '../components/MobileTopBar';
import { FiHeart, FiMessageCircle, FiX, FiChevronLeft, FiChevronRight, FiMaximize2, FiExternalLink } from 'react-icons/fi';
import { getOptimizedImage } from '../lib/media';
import { Helmet } from 'react-helmet-async';
import { db } from '../lib/firebaseClient';
import { ref, onValue } from 'firebase/database';
import { Engagement } from '../components/Engagement';
import profileData from '../data/profile.json';

const CATEGORY_META = {
    pencil: {
        titleTa: 'ஓவியங்கள்',
        titleEn: 'pencil drawings',
        descTa: 'கையால் வரைந்த பென்சில் ஓவியங்கள்',
        descEn: 'Freehand pencil sketches and portrait art.',
    },
    editing: {
        titleTa: 'தொகுப்புகள்',
        titleEn: 'editings',
        descTa: 'புகைப்படத் திருத்தங்கள் மற்றும் டிஜிட்டல் படைப்புகள்',
        descEn: 'Photo manipulations and digital creations.',
    },
    poster: {
        titleTa: 'சுவரொட்டிகள்',
        titleEn: 'posters',
        descTa: 'நிகழ்வுகளுக்கான போஸ்டர் வடிவமைப்புகள்',
        descEn: 'Event banners and creative poster designs.',
    },
    painting: {
        titleTa: 'ஓவியக்கலை',
        titleEn: 'paintings',
        descTa: 'வண்ணங்களில் வரையப்பட்ட ஓவியங்கள்',
        descEn: 'Color paintings and mixed media artworks.',
    },
    quotes: {
        titleTa: 'மேற்கோள் அட்டைகள்',
        titleEn: 'quotes',
        descTa: 'பொன்மொழிகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual quote cards and typographic designs.',
    },
    poems: {
        titleTa: 'கவிதை அட்டைகள்',
        titleEn: 'poems',
        descTa: 'கவிதைகளின் காட்சி வடிவமைப்புகள்',
        descEn: 'Visual poem cards and creative typography.',
    },
    illustrations: {
        titleTa: 'சித்திரங்கள்',
        titleEn: 'illustrations',
        descTa: 'டிஜிட்டல் சித்திரங்கள் மற்றும் லோகோ வடிவமைப்புகள்',
        descEn: 'Digital illustrations, logos, and vector art.',
    },
    digital_arts: {
        titleTa: 'டிஜிட்டல் கலை',
        titleEn: 'digital arts',
        descTa: 'கணினி மென்பொருளில் உருவாக்கிய கலைப்படைப்புகள்',
        descEn: 'Artworks created using digital software.',
    },
};

const ITEMS_PER_PAGE = 8;
const PAGINATION_INCREMENT = 12;

const cleanCaption = (cap) => {
    if (!cap) return '';
    return cap.replace(/#\S+/g, '').replace(/\n{2,}/g, '\n').trim();
};

const ArtCard = React.memo(({ item, onOpen, caption }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Normalize images: ensure we have a valid array of strings
    const imgs = Array.isArray(item.images)
        ? item.images.filter(img => typeof img === 'string')
        : (typeof item.images === 'string' ? [item.images] : (item.image ? [item.image] : []));

    const thumbUrl = imgs.length > 0 ? getOptimizedImage(imgs[0], 'thumb') : '';

    return (
        <div
            className="arts-grid-item"
            onClick={() => onOpen(item)}
            role="button"
            tabIndex={0}
            aria-label={caption || 'View artwork'}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(item)}
            style={{
                minHeight: '150px',
                aspectRatio: item.aspectRatio || 'auto'
            }}
        >
            {!isLoaded && <div className="arts-img-shimmer" />}
            {thumbUrl && (
                <img
                    src={thumbUrl}
                    alt={caption || 'Artwork'}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setIsLoaded(true)}
                    draggable={false}
                    style={{
                        opacity: isLoaded ? 1 : 0,
                        visibility: isLoaded ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s ease-in, transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                />
            )}
            {imgs.length > 1 && (
                <div className="arts-multi-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M8 1v2M16 1v2M1 8h2M1 16h2" />
                    </svg>
                    {imgs.length}
                </div>
            )}
            <div className="arts-grid-overlay">
                {caption && <div className="arts-grid-overlay-text">{caption}</div>}
            </div>
        </div>
    );
});

const LightboxImage = React.memo(({ img, isCurrent, isMobile, isDragging, preventImageDrag, activeImgRef }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
        } else {
            setIsLoaded(false);
        }
    }, [img.url]);

    const setRefs = useCallback((el) => {
        imgRef.current = el;
        if (isCurrent && activeImgRef) {
            activeImgRef.current = el;
        }
    }, [isCurrent, activeImgRef]);

    return (
        <div className="arts-lb-slide">
            {!isLoaded && (
                <div className="arts-lb-loader">
                    <div className="arts-lb-spinner"></div>
                </div>
            )}
            <img
                ref={setRefs}
                className={`arts-lb-img ${isDragging ? 'is-dragging' : ''}`}
                src={getOptimizedImage(img.url, isMobile ? 'medium' : 'full')}
                alt={img.caption || 'Artwork'}
                loading={isCurrent ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                onDragStart={preventImageDrag}
                onLoad={() => setIsLoaded(true)}
                style={{
                    opacity: isLoaded ? 1 : 0
                }}
            />
        </div>
    );
});

const ArtsGallery = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const meta = CATEGORY_META[category];

    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const flattenedImages = React.useMemo(() => {
        return allItems.flatMap(item => {
            let imgs = [];
            if (Array.isArray(item.images)) {
                imgs = item.images;
            } else if (typeof item.images === 'string') {
                imgs = [item.images];
            } else if (item.image) {
                imgs = [item.image];
            }

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
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
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
                    <title>{meta.titleEn} | {profileData.fullName}</title>
                    <meta name="description" content={meta.descEn} />
                </Helmet>

                <style>{`
                .arts-lb-loader {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: -1;
                }
                .arts-lb-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }

                .arts-gallery-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 10px 20px 100px;
                }
                .arts-gallery-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 32px;
                }
                .arts-gallery-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    letter-spacing: 0;
                    margin-bottom: 10px;
                    color: var(--text-main);
                    line-height: 1.3;
                }
                .arts-gallery-sub {
                    font-size: 1rem;
                    font-weight: 500;
                    color: #888888;
                    letter-spacing: 0.5px;
                }

                .arts-grid {
                    columns: 3;
                    column-gap: 8px;
                }
                
                .arts-grid-item {
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    background: var(--bg-panel);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    break-inside: avoid;
                    transform: translateZ(0); 
                    will-change: transform;
                }
                
                @media (max-width: 768px) {
                    .arts-grid-item {
                        margin-bottom: 4px; 
                        border-radius: 4px;
                        background: transparent;
                    }
                }
                
                .arts-img-shimmer {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);
                    background-size: 800px 100%;
                    animation: shimmerAnim 1.5s ease-in-out infinite;
                    z-index: 1;
                }
                .arts-grid-item img {
                    width: 100%;
                    height: auto;
                    display: block;
                    object-fit: contain;
                    transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.3s;
                }
                @media (hover: hover) {
                    .arts-grid-item:hover img {
                        transform: scale(1.03);
                    }
                }
                .arts-grid-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(transparent 40%, rgba(0,0,0,0.7));
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    display: flex;
                    align-items: flex-end;
                    padding: 16px;
                }
                @media (hover: hover) {
                    .arts-grid-item:hover .arts-grid-overlay {
                        opacity: 1;
                    }
                }
                .arts-grid-overlay-text {
                    color: white;
                    font-size: 0.8rem;
                    font-weight: 600;
                    line-height: 1.3;
                    max-height: 2.6em;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .arts-multi-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 4px 8px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    pointer-events: none;
                }

                .arts-lightbox {
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 999999;
                    background: rgba(0,0,0,0.98);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    animation: lbFadeIn 0.3s cubic-bezier(0.2, 0, 0, 1);
                    touch-action: none;
                    overscroll-behavior: none;
                    overflow: hidden; 
                }
                
                .arts-lb-close {
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    backdrop-filter: blur(10px);
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                @keyframes lbFadeIn {
                    from { opacity: 0; transform: scale(1.02); }
                    to { opacity: 1; transform: scale(1); }
                }
                
                .arts-lb-close {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 100;
                    transition: transform 0.2s ease, background-color 0.2s ease;
                }
                .arts-lb-close:hover { 
                    background: white; 
                    color: black;
                    transform: rotate(90deg);
                }

                .arts-lb-main-container {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    z-index: 10;
                }

                .arts-lb-img-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .arts-lb-header {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    padding: 40px 24px 20px;
                    background: linear-gradient(rgba(0,0,0,0.8) 0%, transparent 100%);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    z-index: 100;
                    pointer-events: none;
                }
                .arts-lb-header > * { pointer-events: auto; }
                .arts-lb-header .arts-lb-profile {
                    order: 1;
                    min-width: 0;
                }
                .arts-lb-header .arts-lb-close {
                    position: static;
                    order: 2;
                    width: 40px;
                    height: 40px;
                    margin-left: auto;
                    flex-shrink: 0;
                }

                .arts-lb-footer-content {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 80px 24px calc(120px + env(safe-area-inset-bottom, 0px));
                    background: linear-gradient(to top, 
                        rgba(0,0,0,0.95) 0%, 
                        rgba(0,0,0,0.85) 60%, 
                        transparent 100%);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    z-index: 40;
                    pointer-events: none;
                }
                .arts-lb-footer-content > * { pointer-events: auto; }

                .arts-lb-footer-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                }

                .arts-lb-sidebar {
                    display: none;
                }

                @media (min-width: 769px) {
                    .arts-lb-main-container {
                        display: grid;
                        grid-template-columns: minmax(0, 1fr) 440px;
                        gap: 40px;
                        max-width: 1600px;
                        margin: 0 auto;
                        width: 100%;
                        height: 100%;
                        align-items: center;
                        padding: 40px 60px 140px; 
                    }
                    .arts-lb-header { 
                        display: flex;
                        background: none;
                        border: none;
                        pointer-events: none;
                    }
                    .arts-lb-header .arts-lb-profile { display: none !important; } 
                    .arts-lb-header .arts-lb-close { 
                        display: flex !important;
                        pointer-events: auto;
                        position: absolute;
                        top: 40px; 
                        right: 40px;
                        align-items: center;
                        justify-content: center;
                    }
                    .arts-lb-footer-content { display: none !important; }

                    .arts-lb-img-wrapper {
                        position: relative;
                        width: 100%;
                        height: 75vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .arts-lb-sidebar {
                        width: 440px;
                        height: calc(100vh - 180px);
                        background: none;
                        border: none;
                        border-radius: 0;
                        padding: 4px 40px 20px 0; 
                        backdrop-filter: none;
                        display: flex !important;
                        flex-direction: column;
                        justify-content: space-between;
                        z-index: 50;
                        box-shadow: none;
                    }
                    .arts-lb-sidebar-header {
                        padding-bottom: 20px;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                    }
                    .arts-lb-sidebar-body {
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .arts-lb-sidebar .arts-lb-caption {
                        font-size: 1.15rem;
                        font-weight: 500;
                        line-height: 1.6;
                        color: rgba(255,255,255,0.95);
                    }
                    .arts-lb-sidebar .arts-lb-date {
                        font-size: 0.85rem;
                        opacity: 0.4;
                        letter-spacing: 0.5px;
                    }
                    .arts-lb-nav {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        z-index: 60;
                    }
                    
                    .arts-lb-nav.prev { left: 0px; }
                    .arts-lb-nav.next { right: 0px; }

                    .arts-lb-pagination.floating {
                        display: none !important;
                    }
                    .arts-lb-sidebar .arts-lb-pagination {
                        display: inline-flex !important;
                        position: static !important;
                        margin: 0 !important;
                        justify-content: flex-end;
                        gap: 6px;
                        width: fit-content;
                        padding: 6px 14px; 
                        height: 32px; 
                        box-sizing: border-box;
                    }
                    .arts-lb-meta-header {
                        display: flex;
                        flex-direction: column-reverse; 
                        align-items: flex-start;
                        justify-content: flex-start;
                        gap: 12px;
                        width: 100%;
                    }
                    
                    .arts-lb-slide {
                        padding: 0 !important; 
                    }
                }

                .arts-lb-img-container {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    width: 300%;
                    height: 100%;
                    overflow: hidden;
                    will-change: transform;
                    transform: translate3d(-33.333%, 0, 0);
                }
                
                .arts-lb-slide {
                    flex: 0 0 33.333%;
                    width: 33.333%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 10px 140px; 
                    position: relative;
                    box-sizing: border-box;
                }

                .arts-lb-img {
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 0;
                    user-select: none;
                    pointer-events: none;
                    transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1), opacity 0.4s ease-out;
                }
                .arts-lb-img.is-dragging {
                    transition: none !important;
                }

                .arts-lb-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255,255,255,0.12);
                    border: none;
                    color: white;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
                    z-index: 10;
                }
                .arts-lb-nav:hover { background: white; color: black; }
                .arts-lb-nav.prev { left: 24px; }
                .arts-lb-nav.next { right: 24px; }

                .arts-lb-profile {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .arts-lb-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .arts-lb-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .arts-lb-author {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.9);
                }
                .arts-lb-caption {
                    font-size: 1.1rem;
                    font-weight: 600;
                    line-height: 1.4;
                    color: white;
                    margin: 0;
                }
                .arts-lb-view-more {
                    display: inline;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding: 0 4px;
                    cursor: pointer;
                    text-decoration: none;
                    margin-left: 4px;
                }
                .arts-lb-view-more:hover {
                    color: white;
                }
                .arts-lb-date {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.5);
                    font-weight: 500;
                }
                .arts-lb-dots {
                    display: flex;
                    gap: 6px;
                }
                .arts-lb-pagination-overlay {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px 8px;
                    min-width: 32px;
                }
                @media (max-width: 768px) {
                    .arts-lb-pagination-overlay {
                        bottom: calc(130px + env(safe-area-inset-bottom, 0px));
                    }
                }
                .arts-lb-pagination {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.12);
                    border-radius: 100px;
                    border: 1px solid rgba(255,255,255,0.05);
                    z-index: 100;
                }
                .arts-lb-pagination.floating {
                    display: inline-flex !important;
                    margin: 0 !important;
                    width: fit-content;
                }
                .arts-lb-meta-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    width: 100%;
                    margin-bottom: 8px;
                }
                .arts-lb-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    margin-top: 12px;
                }
                .arts-lb-meta-row.floating {
                    position: static;
                    margin: 0;
                    justify-content: flex-start;
                    pointer-events: auto;
                }
                @media (max-width: 768px) {
                    .arts-lb-meta-row.floating {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                }

                .arts-lb-caption-row {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    width: 100%;
                }
                .arts-lb-caption-row .arts-lb-pagination {
                    margin-top: 4px;
                }
                .arts-lb-caption-row .arts-lb-caption {
                    margin-top: 0;
                }

                .arts-lb-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 3px;
                    background: rgba(255,255,255,0.25);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
                    cursor: pointer;
                }
                .arts-lb-dot:hover {
                    background: rgba(255,255,255,0.5);
                }
                .arts-lb-dot.active {
                    width: 14px; 
                    background: white;
                    border-radius: 3px;
                }
                
                .arts-lb-engagement-pill {
                    display: inline-flex;
                    align-items: center;
                    padding: 0 12px;
                    height: 32px;
                    box-sizing: border-box;
                    background: rgba(255,255,255,0.12);
                    border-radius: 100px;
                    border: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                }

                .engagement-minimal {
                    display: flex;
                    align-items: center;
                }

                .engagement-minimal .mini-like-btn {
                    background: transparent;
                    border: none;
                    padding: 0;
                    color: white;
                    height: auto;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .engagement-minimal .mini-count {
                    font-size: 0.85rem;
                    font-weight: 700;
                }
                
                .arts-lb-caption-sheet-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 200;
                    display: flex;
                    align-items: flex-end;
                    animation: lbFadeIn 0.3s ease;
                }
                .arts-lb-caption-sheet {
                    width: 100%;
                    max-height: 70vh;
                    background: #121212;
                    border-radius: 24px 24px 0 0;
                    padding: 30px 24px calc(40px + env(safe-area-inset-bottom, 0px));
                    position: relative;
                    animation: lbSlideUp 0.4s cubic-bezier(0.2, 0, 0, 1);
                    overflow-y: auto;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }
                @keyframes lbSlideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .arts-lb-sheet-close {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .arts-lb-sheet-title {
                    font-size: 1.05rem;
                    font-weight: 500;
                    color: rgba(255,255,255,0.95);
                    margin-bottom: 24px;
                    line-height: 1.6;
                    padding-right: 40px;
                }
                .arts-lb-sheet-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }

                .arts-lb-date {
                    font-size: 0.8rem;
                    opacity: 0.5;
                    font-weight: 500;
                }
                .arts-lb-dots {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    margin-top: 12px;
                }
                .arts-lb-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    transition: transform 0.2s ease, background-color 0.2s ease;
                }
                .arts-lb-dot.active {
                    background: white;
                    transform: scale(1.3);
                }

                .arts-lb-filmstrip {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 10px 16px calc(30px + env(safe-area-inset-bottom, 0px));
                    background: transparent; 
                    width: 100%;
                    scroll-behavior: auto;
                    -webkit-overflow-scrolling: touch;
                    z-index: 50;
                }
                .arts-lb-filmstrip::-webkit-scrollbar { display: none; }
                .arts-lb-fs-item {
                    width: 48px;
                    height: 48px;
                    flex-shrink: 0;
                    border-radius: 6px;
                    overflow: hidden;
                    cursor: pointer;
                    opacity: 0.3;
                    transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
                    border: 2px solid transparent;
                }
                .arts-lb-fs-item.active {
                    opacity: 1;
                    border-color: white;
                    transform: scale(1.1);
                }
                .arts-lb-fs-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .arts-empty {
                    text-align: center;
                    padding: 80px 20px;
                    color: var(--text-muted);
                    font-size: 1.1rem;
                }

                .arts-show-more-wrapper {
                    display: flex;
                    justify-content: center;
                    margin-top: 32px;
                }
                .arts-show-more-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 32px;
                    border: 1px solid var(--border-light);
                    background: var(--bg-card);
                    color: var(--text-main);
                    font-size: 0.9rem;
                    font-weight: 600;
                    border-radius: 100px;
                    cursor: pointer;
                    transition: transform 0.3s cubic-bezier(0.2, 0, 0, 1), background-color 0.3s ease, color 0.3s ease;
                }
                .arts-show-more-btn:hover {
                    background: var(--text-main);
                    color: var(--bg-app);
                    border-color: var(--text-main);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px color-mix(in srgb, var(--text-main) 20%, transparent);
                }
                .arts-show-more-btn:active {
                    transform: scale(0.97);
                }
                .arts-show-more-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 24px;
                    padding: 0 8px;
                    border-radius: 100px;
                    background: color-mix(in srgb, var(--text-main) 10%, transparent);
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .arts-show-more-btn:hover .arts-show-more-count {
                    background: rgba(255,255,255,0.2);
                }

                .arts-skeleton-grid {
                    columns: 3;
                    column-gap: 8px;
                }
                .arts-skeleton-item {
                    background: var(--bg-panel);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    break-inside: avoid;
                    overflow: hidden;
                    position: relative;
                }
                .arts-skeleton-item::after {
                    content: '';
                    display: block;
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);
                    background-size: 800px 100%;
                    animation: shimmerAnim 1.5s ease-in-out infinite;
                }

                @media (max-width: 768px) {
                    .arts-gallery-page { padding: 20px 0 100px 0; }
                    .arts-gallery-header { display: none; }
                    .arts-gallery-title { font-size: 2.2rem; margin-bottom: 8px; }
                    .arts-gallery-sub { font-size: 0.95rem; }
                    .arts-grid { 
                        columns: 2;
                        column-gap: 4px;
                        padding: 0 4px;
                    }
                    .arts-grid-overlay { display: none; }
                    .arts-lb-nav { width: 36px; height: 36px; }
                    .arts-lb-nav.prev { left: 8px; }
                    .arts-lb-nav.next { right: 8px; }
                    .arts-lb-header {
                        padding: calc(22px + env(safe-area-inset-top, 0px)) 22px 18px;
                        background: rgba(0,0,0,0.45); 
                        backdrop-filter: none !important;
                    }
                    
                    .arts-lb-slide {
                        padding: calc(60px + env(safe-area-inset-top, 0px)) 10px calc(140px + env(safe-area-inset-bottom, 0px)) !important;
                    }
                    
                    .arts-lb-footer { 
                        padding: 12px 16px 20px;
                        background: rgba(0,0,0,0.45); 
                        backdrop-filter: none !important;
                    }
                    .arts-lb-footer-content {
                        background: linear-gradient(to top, 
                            rgba(0,0,0,0.7) 0%, 
                            rgba(0,0,0,0.3) 50%, 
                            transparent 100%);
                        padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
                        backdrop-filter: none !important;
                    }
                    .arts-lb-nav, .arts-lb-pagination, .arts-lb-close, .arts-lb-fs-item {
                        backdrop-filter: none !important;
                        background: rgba(255,255,255,0.12) !important;
                    }
                    .arts-skeleton-grid { columns: 2; column-gap: 4px; padding: 0 4px; }
                    .arts-skeleton-item { margin-bottom: 4px; border-radius: 4px; }
                    .arts-show-more-wrapper { padding: 0 20px; }
                    .arts-show-more-btn { width: 100%; justify-content: center; }
                    
                    .arts-gallery-page {
                        text-rendering: optimizeSpeed;
                        image-rendering: -webkit-optimize-contrast;
                        -webkit-font-smoothing: antialiased;
                    }

                    .arts-lb-meta-header {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                }

                .back-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-decoration: none;
                    background: color-mix(in srgb, var(--text-main) 6%, transparent);
                    border-radius: 100px;
                    padding: 10px 20px;
                    flex-shrink: 0;
                    white-space: nowrap;
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, color 0.2s ease;
                }
                .back-pill:hover {
                    background: color-mix(in srgb, var(--text-main) 12%, transparent);
                    color: var(--text-main);
                }
                .back-pill:active {
                    transform: scale(0.95);
                    background: color-mix(in srgb, var(--text-main) 18%, transparent);
                }
            `}</style>

                <div className="arts-gallery-page">
                    <header className="arts-gallery-header animate-entry">
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h1 className="arts-gallery-title">{meta.titleTa}</h1>
                            <div className="arts-gallery-sub">{meta.titleEn}</div>
                        </div>
                        <Link
                            to="/arts"
                            className="back-pill desktop-only"
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
                            {[200, 280, 180, 240, 200, 260].map((h, i) => (
                                <div key={i} className="arts-skeleton-item" style={{ paddingBottom: `${h}px` }} />
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
                                    <FiX size={18} />
                                </button>

                                <div className="arts-lb-profile">
                                    <div className="arts-lb-avatar">
                                        <img src={profileData.profilePic} alt={profileData.fullName} />
                                    </div>
                                    <div className="arts-lb-author">{profileData.fullName}</div>
                                </div>
                            </div>

                            <div className="arts-lb-main-container" onClick={(e) => e.stopPropagation()}>
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

                                    {lightboxGlobalIdx > 0 && (
                                        <button className="arts-lb-nav prev desktop-only" onClick={goToPrev}>
                                            <FiChevronLeft size={22} />
                                        </button>
                                    )}
                                    {lightboxGlobalIdx < flattenedImages.length - 1 && (
                                        <button className="arts-lb-nav next desktop-only" onClick={goToNext}>
                                            <FiChevronRight size={22} />
                                        </button>
                                    )}
                                </div>

                                <div className="arts-lb-sidebar">
                                    <div className="arts-lb-sidebar-header">
                                        <div className="arts-lb-profile">
                                            <div className="arts-lb-avatar">
                                                <img src={profileData.profilePic} alt={profileData.fullName} />
                                            </div>
                                            <div className="arts-lb-author">{profileData.fullName}</div>
                                        </div>
                                    </div>

                                    <div className="arts-lb-sidebar-body">
                                        <div className="arts-lb-meta-header">
                                            {currentImg.caption && <h2 className="arts-lb-caption">{currentImg.caption}</h2>}

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
                                        <div className="arts-lb-date">{currentImg.date}</div>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="arts-lb-footer-content"
                                onClick={(e) => e.stopPropagation()}
                                style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
                            >
                                <div className="arts-lb-meta-header">
                                    <div className="arts-lb-engagement-pill mobile-only">
                                        <Engagement postId={currentImg.postId} category="arts" minimal={true} />
                                    </div>

                                    <div className="arts-lb-caption-row mobile-only">
                                        {currentImg.caption && (
                                            <h2 className="arts-lb-caption">
                                                {currentImg.caption.length > 60 ? (
                                                    <>
                                                        {currentImg.caption.slice(0, 60)}...
                                                        <button
                                                            className="arts-lb-view-more"
                                                            onClick={() => setShowCaptionModal(true)}
                                                        >
                                                            more
                                                        </button>
                                                    </>
                                                ) : currentImg.caption}
                                            </h2>
                                        )}

                                        {currentImg.totalInPost > 1 && (
                                            <div className="arts-lb-pagination floating">
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
                                    </div>

                                    {/* Desktop-only version of caption and pagination */}
                                    <div className="desktop-only">
                                        {currentImg.caption && (
                                            <h2 className="arts-lb-caption">{currentImg.caption}</h2>
                                        )}
                                        <div className="arts-lb-meta-row floating">
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
                                </div>

                                <div className="arts-lb-footer-row">
                                    <div className="arts-lb-caption-group">
                                        <div className="arts-lb-date">{currentImg.date}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="arts-lb-filmstrip" ref={filmstripRef} onClick={(e) => e.stopPropagation()}>
                                {allItems.map((item) => {
                                    const itemGlobalIdx = flattenedImages.findIndex(fi => fi.postId === item.id);
                                    const currentPostId = flattenedImages[lightboxGlobalIdx]?.postId;
                                    const isActive = currentPostId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`arts-lb-fs-item ${isActive ? 'active' : ''}`}
                                            onClick={() => setLightboxGlobalIdx(itemGlobalIdx)}
                                        >
                                            <img src={getOptimizedImage(item.images?.[0] || item.image, 'thumb')} alt="" loading="lazy" decoding="async" draggable={false} onDragStart={preventImageDrag} />
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
                                            <FiX size={18} />
                                        </button>
                                        <div className="arts-lb-sheet-title">{currentImg.caption}</div>
                                        <div className="arts-lb-sheet-meta">
                                            <div className="arts-lb-profile">
                                                <div className="arts-lb-avatar">
                                                    <img src={profileData.profilePic} alt={profileData.fullName} />
                                                </div>
                                                <div className="arts-lb-author">{profileData.fullName}</div>
                                            </div>
                                            <div className="arts-lb-date">{currentImg.date}</div>
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