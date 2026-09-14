import React from 'react';
import { Outlet, Link, useLocation, useNavigate, ScrollRestoration, useNavigationType } from 'react-router-dom';
import { useTheme } from '../கொக்கிகள்/கருப்பொருள்';
import { useSettings } from '../கொக்கிகள்/அமைப்புகள்கொக்கி';
import { Sidebar } from '../கூறுகள்/கட்டமைப்பு/பக்கவாட்டுப்பட்டை';

const lazyWithRetry = (componentImport: () => Promise<any>) =>
    React.lazy(() =>
        componentImport().catch((error) => {
            console.error("Error importing component:", error);
            const isChunkError = 
                error.message?.includes("Failed to fetch dynamically imported module") ||
                error.name === "ChunkLoadError" ||
                /Failed to fetch/i.test(error.message) ||
                /Loading chunk/i.test(error.message);
                
            if (isChunkError && !sessionStorage.getItem('chunk_retry')) {
                sessionStorage.setItem('chunk_retry', 'true');
                window.location.reload();
                return new Promise(() => {}); // Return a pending promise so the app doesn't render crashed state before reload
            }
            throw error;
        })
    );

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const navType = useNavigationType();
    const isFirstRender = React.useRef(true);

    const [navState, setNavState] = React.useState({
        prevPath: location.pathname,
        prevState: location.state as any,
        direction: 'none'
    });

    const getPathDepth = (path: string) => {
        const normalized = path.toLowerCase().replace(/\/$/, '') || '/';
        if (normalized === '/') return 0;
        if (normalized === '/navilgal' || normalized === '/downloads') return 1;
        if (normalized === '/writings' || normalized === '/arts' || normalized === '/ezhuthugal' || normalized === '/padaippugal') return 2;
        if (normalized.startsWith('/writings/') || normalized.startsWith('/arts/')) {
            return normalized.split('/').filter(Boolean).length + 1;
        }
        return normalized.split('/').filter(Boolean).length;
    };

    const getTabIndex = (path: string) => {
        const normalized = path.toLowerCase().replace(/\/$/, '') || '/';
        if (normalized === '/') return 0;
        if (normalized.startsWith('/navilgal') || normalized.startsWith('/writings') || normalized.startsWith('/arts')) return 1;
        if (normalized.startsWith('/tools') || normalized.startsWith('/teaching')) return 2;
        if (normalized.startsWith('/downloads')) return 3;
        if (normalized.startsWith('/about')) return 4;
        return 99;
    };

    let currentDirection = navState.direction;

    if (location.pathname !== navState.prevPath) {
        isFirstRender.current = false;
        const currentDepth = getPathDepth(location.pathname);
        const prevDepth = getPathDepth(navState.prevPath);
        let newDirection = 'forward';

        const isBottomTab = (path: string) => {
            const normalized = path.toLowerCase().replace(/\/$/, '') || '/';
            return normalized === '/' || 
                   normalized === '/navilgal' || 
                   normalized === '/tools' || 
                   normalized === '/downloads' ||
                   normalized === '/about';
        };

        if (navType === 'POP') {
            // Browser back button or FloatingBackButton always slides backward unless switching between root tabs
            if (isBottomTab(location.pathname) && isBottomTab(navState.prevPath)) {
                newDirection = 'none';
            } else {
                newDirection = 'backward';
            }
        } else if (isBottomTab(location.pathname) && isBottomTab(navState.prevPath)) {
            newDirection = 'none';
        } else if (currentDepth < prevDepth) {
            newDirection = 'backward';
        } else if (currentDepth > prevDepth) {
            newDirection = 'forward';
        } else {
            const currentIndex = getTabIndex(location.pathname);
            const prevIndex = getTabIndex(navState.prevPath);
            if (currentIndex < prevIndex) {
                newDirection = 'backward';
            } else {
                newDirection = 'forward';
            }
        }

        currentDirection = newDirection;
        setNavState({
            prevPath: location.pathname,
            prevState: location.state,
            direction: newDirection
        });
    }

    const navClass = isFirstRender.current ? 'nav-initial' : currentDirection === 'none' ? 'nav-none' : currentDirection === 'backward' ? 'nav-pop' : 'nav-push';
    const { theme, setTheme, toggleTheme } = useTheme();
    const { autoThumbnails, setAutoThumbnails } = useSettings();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });
    const [shouldAnimate, setShouldAnimate] = React.useState(false);

    const handleSidebarToggle = () => {
        setShouldAnimate(true);
        setIsSidebarCollapsed(!isSidebarCollapsed);
        setTimeout(() => setShouldAnimate(false), 500);
    };

    React.useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    const normalizedPath = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const mainLevelPaths = [
        '/navilgal', 
        '/navilgal/writings', 
        '/navilgal/ezhuthugal', 
        '/navilgal/ezhutgal', 
        '/navilgal/arts', 
        '/navilgal/padaippugal', 
        '/writings', 
        '/arts', 
        '/about', 
        '/portfolio', 
        '/settings', 
        '/tools',
        '/downloads'
    ];
    const isMainLevel = normalizedPath === '/' || mainLevelPaths.some(p => normalizedPath === p || normalizedPath.endsWith(p));

    return (
        <div className={`app-shell ${shouldAnimate ? 'animate-layout' : ''} ${navClass}`} style={{ display: 'flex' }}>

            <Sidebar
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={handleSidebarToggle}
                isMainLevel={isMainLevel}
            />

            <main className={`main-content ${!isMainLevel ? 'no-bottom-nav' : ''} ${!isMainLevel ? 'mobile-full-width' : ''}`} style={{ 
                flexGrow: 1, 
                minHeight: '100vh', 
                width: isSidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - var(--sidebar-width))', 
                marginLeft: isSidebarCollapsed ? '72px' : 'var(--sidebar-width)' 
            }}>
                <ScrollRestoration />
                <Outlet context={{ theme, setTheme, toggleTheme, isSidebarCollapsed, autoThumbnails }} />
            </main>
        </div>

    );
};

export default Layout;
