import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const HighlightBar = ({ highlights, onOpenHighlight }) => {
    const scrollRef = React.useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!highlights || highlights.length === 0) return null;

    return (
        <div className="highlight-bar-container">
            <button className="h-nav-btn left" onClick={() => scroll('left')}>
                <FiChevronLeft size={20} />
            </button>

            <div className="highlights-scroll" ref={scrollRef}>
                {highlights.map((hl) => (
                    <div
                        key={hl.id}
                        className="h-item"
                        onClick={() => onOpenHighlight(hl)}
                    >
                        <div className="h-ring">
                            <div className="h-inner">
                                {hl.cover.endsWith('.mp4') ? (
                                    <video src={hl.cover} muted />
                                ) : (
                                    <img src={hl.cover} alt={hl.title} />
                                )}
                            </div>
                        </div>
                        <span className="h-label">{hl.title}</span>
                    </div>
                ))}
            </div>

            <button className="h-nav-btn right" onClick={() => scroll('right')}>
                <FiChevronRight size={20} />
            </button>

            <style jsx>{`
                .highlight-bar-container {
                    position: relative;
                    padding: 10px 0 20px;
                    width: 100%;
                }

                .highlights-scroll {
                    display: flex;
                    gap: 18px;
                    overflow-x: auto;
                    padding: 0 10px;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .highlights-scroll::-webkit-scrollbar {
                    display: none;
                }

                .h-item {
                    flex-shrink: 0;
                    width: 84px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                }

                .h-ring {
                    width: 66px;
                    height: 66px;
                    border-radius: 50%;
                    padding: 3px;
                    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .h-inner {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    overflow: hidden;
                    background: #fafafa;
                }

                .h-inner img, 
                .h-inner video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .h-label {
                    font-size: 12px;
                    text-align: center;
                    color: #262626;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 100%;
                    padding: 0 4px;
                }

                .h-nav-btn {
                    position: absolute;
                    top: 35px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #fff;
                    border: none;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    color: #8e8e8e;
                    opacity: 0.8;
                }

                .h-nav-btn:hover {
                    opacity: 1;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .h-nav-btn.left { left: -12px; }
                .h-nav-btn.right { right: -12px; }

                @media (max-width: 768px) {
                    .h-nav-btn { display: none; }
                    .h-ring { width: 62px; height: 62px; }
                    .h-item { width: 78px; }
                    .highlight-bar-container { padding: 4px 0 12px; }
                    .highlights-scroll { gap: 12px; }
                }
            `}</style>
        </div>
    );
};

export default HighlightBar;
