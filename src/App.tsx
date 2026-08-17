import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation, useNavigate, ScrollRestoration, useNavigationType } from 'react-router-dom';

import { Analytics } from '@vercel/analytics/react';
import profileData from './data/profile.json';
import profilePic from './assets/instagram/profile.jpg';
import Home from './pages/main/Home';
// import Home2 from './legacy/Home2';
import About from './pages/main/About';
import Portfolio from './pages/main/Portfolio';
import Settings from './pages/main/Settings';
import Writings from './pages/Writings';
import Teaching from './pages/main/Teaching';
import Arts from './pages/main/Arts';
import ArtsGallery from './pages/main/ArtsGallery';
import ToolsView from './pages/main/ToolsView';
import PianoTool from './pages/tools/piano/PianoTool';
import TransliteratorTool from './pages/tools/transliterator/TransliteratorTool';
import VocoderView from './pages/tools/VocoderView';
import CategoryListView from './components/features/CategoryListView';
import StoriesListView from './components/features/StoriesListView';
import ReadingView from './components/features/ReadingView';
import AdBanner from './components/ui/AdBanner';
import GlobalErrorBoundary from './components/core/GlobalErrorBoundary';
import { House, PencilSimple, Gear, User, Monitor, Sun, Moon, Book, Wrench, ListDashes, List, Palette } from '@phosphor-icons/react';

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

interface ThemeContextType {
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
    toggleTheme: () => void;
}

// Create a Context for Theme
const ThemeContext = React.createContext<ThemeContextType>({
    theme: 'auto',
    setTheme: () => {},
    toggleTheme: () => {}
});

interface SettingsContextType {
    autoThumbnails: boolean;
    setAutoThumbnails: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create a Context for Settings
export const SettingsContext = React.createContext<SettingsContextType>({
    autoThumbnails: true,
    setAutoThumbnails: () => {}
});

export const useTheme = () => React.useContext(ThemeContext);
export const useSettings = () => React.useContext(SettingsContext);

interface ProfileImageProps {
    src: string;
    alt: string;
    className?: string;
}

const ProfileImage = ({ src, alt, className }: ProfileImageProps) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    return (
        <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
            {loading && !error && (
                <div className="shimmer-loader" style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'var(--border-light)'
                }} />
            )}
            <img
                src={error ? "https://via.placeholder.com/150" : src}
                alt={alt}
                style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    opacity: loading ? 0 : 1, transition: 'opacity 0.3s ease'
                }}
                onLoad={() => setLoading(false)}
                onError={() => { setError(true); setLoading(false); }}
            />
        </div>
    );
};

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
        return path.split('/').filter(Boolean).length;
    };

    const getTabIndex = (path: string) => {
        const normalized = path.toLowerCase().replace(/\/$/, '') || '/';
        if (normalized === '/') return 0;
        if (normalized.startsWith('/writings')) return 1;
        if (normalized.startsWith('/arts')) return 2;

        if (normalized.startsWith('/teaching')) return 4;
        if (normalized.startsWith('/about')) return 5;
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
            return normalized === '/' || normalized === '/writings' || normalized === '/arts' || normalized === '/about';
        };

        if (navType === 'POP') {
            // Browser back button always means backward slide
            if (isBottomTab(location.pathname) && isBottomTab(navState.prevPath)) {
                newDirection = navState.prevState?.fromQuickLink ? 'backward' : 'none';
            } else {
                newDirection = 'backward';
            }
        } else if (location.state?.fromQuickLink) {
            newDirection = 'forward';
        } else if (isBottomTab(location.pathname) && isBottomTab(navState.prevPath)) {
            newDirection = navState.prevState?.fromQuickLink ? 'backward' : 'none';
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
        const handleClickOutside = (e) => {
            if (settingsZoneRef.current && !settingsZoneRef.current.contains(e.target)) {
                setIsSettingsOpen(false);
            }
        };
        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSettingsOpen]);

const normalizedPath = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const mainLevelPaths = ['/writings', '/arts', '/about', '/portfolio', '/settings', '/teaching', '/tools'];
    const isMainLevel = normalizedPath === '/' || mainLevelPaths.some(p => normalizedPath === p || normalizedPath.endsWith(p));

    return (
        <div className={`app-shell ${shouldAnimate ? 'animate-layout' : ''} ${navClass}`} style={{ display: 'flex' }}>

            <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${!isMainLevel ? 'mobile-hidden-nav' : ''}`}>
                <div className="sidebar-backdrop" />

                <div className="sidebar-top">
                    <div className="sidebar-header">
                        {!isSidebarCollapsed && (
                            <div className="brand" lang="ta">
                                நவில்
                                <span className="brand-subtitle">Navil</span>
                            </div>
                        )}
                        <button
                            className="sidebar-toggle-btn"
                            onClick={handleSidebarToggle}
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <List weight="regular" size={20} /> : <ListDashes weight="regular" size={20} />}
                        </button>
                    </div>
                    <div className="sidebar-nav">
                        <NavLink to="/" icon={<House weight={location.pathname === '/' ? "fill" : "regular"} size={22} />} label="முகப்பு" subLabel="home" active={location.pathname === '/'} collapsed={isSidebarCollapsed} />
                        <NavLink to="/writings" icon={<PencilSimple weight={location.pathname.startsWith('/writings') ? "fill" : "regular"} size={22} />} label="எழுத்துகள்" subLabel="writings" active={location.pathname.startsWith('/writings')} collapsed={isSidebarCollapsed} />
                        <NavLink to="/arts" icon={<Palette weight={location.pathname.startsWith('/arts') ? "fill" : "regular"} size={22} />} label="படைப்புகள்" subLabel="arts" active={location.pathname.startsWith('/arts')} collapsed={isSidebarCollapsed} />
                        <NavLink to="/tools" icon={<Wrench weight={location.pathname.startsWith('/tools') ? "fill" : "regular"} size={22} />} label="கருவிகள்" subLabel="tools" badge="BETA" active={location.pathname.startsWith('/tools')} collapsed={isSidebarCollapsed} />
                        <NavLink to="/teaching" icon={<Monitor weight={location.pathname.startsWith('/teaching') ? "fill" : "regular"} size={22} />} label="பயிற்றுவிப்பு" subLabel="teaching" active={location.pathname.startsWith('/teaching')} collapsed={isSidebarCollapsed} className="desktop-only" />

                        <NavLink to="/about" icon={<User weight={location.pathname === '/about' ? "fill" : "regular"} size={22} />} label="பற்றி" subLabel="about" active={location.pathname === '/about'} className="desktop-only" collapsed={isSidebarCollapsed} />
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
        </div>

    );
};

interface NavLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    badge?: string;
    active: boolean;
    className?: string;
    collapsed: boolean;
}

const NavLink = ({ to, icon, label, subLabel, badge, active, className = '', collapsed }: NavLinkProps) => (
    <Link to={to} className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''} ${className}`.trim()} title={collapsed ? label : ''}>
        <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        {!collapsed && (
            <div className="nav-text-container">
                <span className="label" style={{ display: 'flex', alignItems: 'center' }}>
                    {label}
                    {badge && (
                        <span 
                            className="nav-badge desktop-only" 
                            style={{ 
                                fontSize: '0.6rem', 
                                background: active ? 'var(--text-main)' : 'color-mix(in srgb, var(--text-main) 15%, transparent)', 
                                color: active ? 'var(--bg-app)' : 'var(--text-main)', 
                                padding: '2px 6px', 
                                borderRadius: '100px', 
                                marginLeft: '8px', 
                                fontWeight: 700, 
                                letterSpacing: '0.5px',
                                display: 'inline-block',
                                lineHeight: 1
                            }}
                        >
                            {badge}
                        </span>
                    )}
                </span>
                {subLabel && <span className="sub-label desktop-only">{subLabel}</span>}
            </div>
        )}
    </Link>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <GlobalErrorBoundary />,
        children: [
            { index: true, element: <Home /> },
            { path: "about", element: <About /> },
            { path: "portfolio", element: <Portfolio /> },
            { path: "settings", element: <Settings /> },
            { path: "writings", element: <Writings /> },
            { path: "teaching", element: <Teaching /> },
            { path: "arts", element: <Arts /> },
            { path: "tools", element: <ToolsView /> },
            { path: "tools/piano", element: <PianoTool /> },
            { path: "tools/transliterator", element: <TransliteratorTool /> },
            { path: "arts/:category", element: <ArtsGallery /> },
            { path: "teaching/vocoder", element: <VocoderView /> },

            // Unified Categories (Blog, Articles, Essays, Stories, Thoughts, Diary, Poems, Quotes)
            { path: "writings/stories", element: <StoriesListView /> },
            { path: "writings/stories/series/:seriesId", element: <StoriesListView /> },
            { path: "writings/:category", element: <CategoryListView /> },
            { path: "writings/:category/series/:seriesId", element: <CategoryListView /> },
            { path: "writings/:category/:slug", element: <ReadingView /> },
        ]
    }
], {
    future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
    },
});

function App() {
    const [theme, setTheme] = React.useState(() => {
        return localStorage.getItem('theme') || 'auto';
    });
    
    const [autoThumbnails, setAutoThumbnails] = React.useState(() => {
        return localStorage.getItem('autoThumbnails') === 'true';
    });

    React.useEffect(() => {
        sessionStorage.removeItem('chunk_retry');
    }, []);

    React.useEffect(() => {
        localStorage.setItem('autoThumbnails', String(autoThumbnails));
    }, [autoThumbnails]);

    React.useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('theme', theme);

        const applyTheme = () => {
            if (theme === 'auto') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.setAttribute('data-theme', systemTheme);
            } else {
                root.setAttribute('data-theme', theme);
            }
        };

        applyTheme();
        
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    React.useEffect(() => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Broadcast theme change to the Mac OS wrapper
        if (window.parent) {
            window.parent.postMessage({ 
                type: 'IFRAME_THEME_CHANGE', 
                appId: 'elvan', 
                isDark: isDark 
            }, '*');
        }
    }, [theme]);

    const toggleTheme = () => {
        // Simple toggle for the header button: auto -> light -> dark -> auto
        setTheme(prev => {
            if (prev === 'auto') return 'light';
            if (prev === 'light') return 'dark';
            return 'auto';
        });
    };

    return (
        <SettingsContext.Provider value={{ autoThumbnails, setAutoThumbnails }}>
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            <style>{`
                .mobile-topbar .brand {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    line-height: 1.1;
                    gap: 2px;
                    flex: 1;
                }

                .brand-main {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--text-main);
                }

                .brand-sub {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-muted);
                    text-transform: none;
                    letter-spacing: 0;
                    opacity: 0.7;
                }

                .mobile-topbar.is-centered .brand,
                .mobile-topbar.has-back .brand {
                    margin-right: 0;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: auto;
                    max-width: 60%;
                    text-align: center;
                    align-items: center;
                    white-space: nowrap;
                }
            `}</style>
            <RouterProvider router={router} />
            <Analytics />
        </ThemeContext.Provider>
        </SettingsContext.Provider>
    );
}

export default App;

