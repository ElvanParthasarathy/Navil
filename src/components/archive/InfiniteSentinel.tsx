import React, { useEffect, useRef } from 'react';

export default function InfiniteSentinel ({ onLoadMore }) => {
    const ref = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setTimeout(onLoadMore, 100);
        }, { rootMargin: '50px' });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [onLoadMore]);
    return <div ref={ref} style={{ height: '20px', width: '100%', gridColumn: '1 / -1' }} />;
};
