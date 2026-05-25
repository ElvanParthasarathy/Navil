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
        </div>
    );
};

export default HighlightBar;
