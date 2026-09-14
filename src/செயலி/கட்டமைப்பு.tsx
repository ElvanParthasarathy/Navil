import React from 'react';
import { Outlet, Link, useLocation, useNavigate, ScrollRestoration, useNavigationType } from 'react-router-dom';
import { useTheme } from '../கொக்கிகள்/கருப்பொருள்';
import { useSettings } from '../கொக்கிகள்/அமைப்புகள்கொக்கி';
import { ProfileImage } from '../கூறுகள்/ஊடகம்/சுயவிவரபடம்';
import { NavLink } from '../கூறுகள்/கட்டமைப்பு/வழிசெலுத்தல்இணைப்பு';
import { BrandTuner } from '../கூறுகள்/கட்டமைப்பு/BrandTuner';
import profileData from '../தரவு/தன்னுரு.json';
import profilePic from '../வளங்கள்/இன்ஸ்டாகிராம்/தன்னுரு.png';
import { House, User, Monitor, Sun, Moon, Wrench, ListDashes, List, BookOpen } from '@phosphor-icons/react';

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
        if (normalized === '/navilgal') return 1;
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
        if (normalized.startsWith('/tools')) return 2;
        if (normalized.startsWith('/teaching')) return 3;
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
                   normalized === '/teaching' || 
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
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const settingsZoneRef = React.useRef(null);
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

    // Close popup on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (settingsZoneRef.current && !(settingsZoneRef.current as any).contains(e.target)) {
                setIsSettingsOpen(false);
            }
        };
        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSettingsOpen]);

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
        '/teaching', 
        '/tools'
    ];
    const isMainLevel = normalizedPath === '/' || mainLevelPaths.some(p => normalizedPath === p || normalizedPath.endsWith(p));

    return (
        <div className={`app-shell ${shouldAnimate ? 'animate-layout' : ''} ${navClass}`} style={{ display: 'flex' }}>

            <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${!isMainLevel ? 'mobile-hidden-nav' : ''}`}>
                <div className="sidebar-backdrop" />

                <div className="sidebar-top">
                    <div className="sidebar-header">
                        {!isSidebarCollapsed && (
                            <div className="brand">
                                <span className="brand-title" lang="ta">எல்வன் நவில்</span>
                                <span className="brand-subtitle">Elvan Navil</span>
                            </div>
                        )}
                        <button
                            className="sidebar-toggle-btn"
                            onClick={handleSidebarToggle}
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <List weight="regular" size={19} /> : <ListDashes weight="regular" size={19} />}
                        </button>
                    </div>
                    <div className="sidebar-nav">
                        <NavLink to="/" icon={<House weight={location.pathname === '/' ? "fill" : "regular"} size={21} />} label="முகப்பு" subLabel="home" active={location.pathname === '/'} collapsed={isSidebarCollapsed} />
                        <NavLink 
                            to="/navilgal" 
                            icon={<BookOpen weight={(location.pathname.startsWith('/navilgal') || location.pathname.startsWith('/writings') || location.pathname.startsWith('/arts')) ? "fill" : "regular"} size={21} />} 
                            label="நவில்கள்" 
                            subLabel="navilgal" 
                            active={location.pathname.startsWith('/navilgal') || location.pathname.startsWith('/writings') || location.pathname.startsWith('/arts')} 
                            collapsed={isSidebarCollapsed} 
                        />
                        <NavLink to="/tools" icon={<Wrench weight={location.pathname.startsWith('/tools') ? "fill" : "regular"} size={21} />} label="கருவிகள்" subLabel="tools" badge="BETA" active={location.pathname.startsWith('/tools')} collapsed={isSidebarCollapsed} />
                        <NavLink to="/teaching" icon={<Monitor weight={location.pathname.startsWith('/teaching') ? "fill" : "regular"} size={21} />} label="பயிற்றுவிப்பு" subLabel="teaching" active={location.pathname.startsWith('/teaching')} collapsed={isSidebarCollapsed} className="desktop-only" />

                        <NavLink to="/about" icon={<User weight={location.pathname === '/about' ? "fill" : "regular"} size={21} />} label="பற்றி" subLabel="about" active={location.pathname === '/about'} className="desktop-only" collapsed={isSidebarCollapsed} />
                        <NavLink
                            to="/about"
                            icon={
                                <ProfileImage
                                    src={profilePic}
                                    alt="Profile"
                                    className="nav-profile-avatar"
                                />
                            }
                            label="Profile"
                            active={location.pathname === '/about'}
                            className="mobile-only-nav-item"
                            collapsed={isSidebarCollapsed}
                        />
                        
                    </div>

                </div>

                <div className="sidebar-bottom" ref={settingsZoneRef}>
                    <div className="settings-profile-container">
                        <div
                            className={`settings-trigger ${isSettingsOpen ? 'active-trigger' : ''} ${isSidebarCollapsed ? 'collapsed-trigger' : ''}`}
                            onClick={() => {
                                setIsSettingsOpen(!isSettingsOpen);
                            }}
                        >
                            <ProfileImage
                                src={profilePic}
                                alt="Profile"
                                className="settings-avatar"
                            />
                            {!isSidebarCollapsed && (
                                <>
                                    <div className="settings-text">
                                        <span className="settings-name">{profileData?.fullName || 'Elvan Parthasarathy'}</span>
                                    </div>
                                    {theme === 'light' ? (
                                        <Sun weight="regular" size={16} className="settings-theme-icon" />
                                    ) : theme === 'dark' ? (
                                        <Moon weight="regular" size={16} className="settings-theme-icon" />
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="settings-theme-icon" style={{ width: 16, height: 16 }}>
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" />
                                        </svg>
                                    )}
                                </>
                            )}
                        </div>

                        {isSettingsOpen && (
                            <div className={`settings-popup ${isSidebarCollapsed ? 'side-popup' : ''}`}>
                                <div className="popup-theme-section" onClick={(e) => e.stopPropagation()}>
                                    <span className="popup-theme-label">Appearance</span>
                                    <div className="theme-slider-container">
                                        <div
                                            className="slider-thumb"
                                            style={{ transform: `translateX(${theme === 'light' ? '0%' : theme === 'auto' ? '100%' : '200%'})` }}
                                        />
                                        <div className={`slider-option ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} title="Light">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
                                        </div>
                                        <div className={`slider-option ${theme === 'auto' ? 'active' : ''}`} onClick={() => setTheme('auto')} title="Auto">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" /></svg>
                                        </div>
                                        <div className={`slider-option ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} title="Dark">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className={`main-content ${!isMainLevel ? 'no-bottom-nav' : ''} ${!isMainLevel ? 'mobile-full-width' : ''}`} style={{ 
                flexGrow: 1, 
                minHeight: '100vh', 
                width: isSidebarCollapsed ? 'calc(100% - 72px)' : 'calc(100% - var(--sidebar-width))', 
                marginLeft: isSidebarCollapsed ? '72px' : 'var(--sidebar-width)' 
            }}>
                <ScrollRestoration />
                <Outlet context={{ theme, setTheme, toggleTheme, isSidebarCollapsed, autoThumbnails }} />
            </main>
            <BrandTuner />
        </div>

    );
};

export default Layout;
