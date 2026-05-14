import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Simple global in-memory cache for scroll positions keyed by URL path + search
const scrollCache = new Map<string, number>();

/**
 * Hook to automatically handle scroll restoration on Single Page App navigation.
 * Caches the scroll position when leaving a page, and restores it when clicking 'Back'.
 * 
 * @param isLoading Optional flag. If the page fetches data asynchronously, 
 *                  pass the loading state so scroll is only restored after content paints.
 */
export function useScrollRestore(isLoading: boolean = false) {
    const location = useLocation();
    const navType = useNavigationType();
    const hasRestoredRef = useRef(false);
    
    const cacheKey = location.pathname + location.search;

    // Reset the restoration flag whenever we switch to a different key
    useEffect(() => {
        hasRestoredRef.current = false;
    }, [cacheKey]);

    // Track and save scroll position whenever the user scrolls
    useEffect(() => {
        const handleScroll = () => {
            scrollCache.set(cacheKey, window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            // Save one final time on component unmount
            scrollCache.set(cacheKey, window.scrollY);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [cacheKey]);

    // Restore scroll position
    useEffect(() => {
        // Only restore once loading is finished AND we haven't restored yet for this mount
        if (!isLoading && !hasRestoredRef.current) {
            if (navType === 'POP') {
                const savedPosition = scrollCache.get(cacheKey);
                if (savedPosition !== undefined) {
                    hasRestoredRef.current = true;
                    // Defer scroll to guarantee the DOM has laid out the items
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            window.scrollTo({ top: savedPosition, behavior: 'instant' });
                        }, 25);
                    });
                }
            } else if (navType === 'PUSH') {
                // Normal forward navigation: always start clean at top
                hasRestoredRef.current = true;
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        }
    }, [isLoading, cacheKey, navType]);
}
