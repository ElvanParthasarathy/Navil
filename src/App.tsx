import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import { FiHome, FiEdit3, FiSettings, FiInstagram, FiUser, FiMonitor } from 'react-icons/fi';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import { Analytics } from '@vercel/analytics/react';
import profileData from './data/profile.json';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Writings from './pages/Writings';
import Teaching from './pages/Teaching';
import Arts from './pages/Arts';
import ArtsGallery from './pages/ArtsGallery';
import VocoderView from './pages/VocoderView';
const Archive = React.lazy(() => import('./pages/Archive'));
import Admin from './pages/Admin';
import CategoryListView from './components/CategoryListView';
import ReadingView from './components/ReadingView';
import AdBanner from './components/AdBanner';

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

// Export hooks for easy access
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

const GradientCustomizer = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [startColor, setStartColor] = React.useState('#1c1c1f');
    const [endColor, setEndColor] = React.useState('#131315');
    const [angle, setAngle] = React.useState(145);
    const [shadowBlur, setShadowBlur] = React.useState(80);
    const [shadowOpacity, setShadowOpacity] = React.useState(0.75);

    // Apply values in real-time
    React.useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--sidebar-bg-dark', `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`);
        root.style.setProperty('--sidebar-shadow-dark', `25px 0 ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`);
    }, [startColor, endColor, angle, shadowBlur, shadowOpacity]);

    const cssString = `background: linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%);\nbox-shadow: 25px 0 ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity});`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssString);
        alert("Awesome! Gradient values copied to clipboard! Tell Antigravity these values now!");
    };

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999, fontFamily: 'sans-serif' }} className="desktop-only">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #FF512F, #DD2476)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 24px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        transition: 'transform 0.2s',
                    }}
                >
                    🎨 Customizer
                </button>
            ) : (
                <div style={{
                    background: 'rgba(30, 30, 35, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '20px',
                    width: '300px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>🎨 Sidebar Gradient Customizer</span>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px' }}
                        >
                            &times;
                        </button>
                    </div>

                    {/* Start Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>START COLOR</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                type="color" 
                                value={startColor} 
                                onChange={(e) => setStartColor(e.target.value)} 
                                style={{ width: '30px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                            />
                            <input 
                                type="text" 
                                value={startColor} 
                                onChange={(e) => setStartColor(e.target.value)} 
                                style={{ flex: 1, background: '#121214', border: '1px solid #333', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                            />
                        </div>
                    </div>

                    {/* End Color */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: '#aaa', fontWeight: 600 }}>END COLOR</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                type="color" 
                                value={endColor} 
                                onChange={(e) => setEndColor(e.target.value)} 
                                style={{ width: '30px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'none' }}
                            />
                            <input 
                                type="text" 
                                value={endColor} 
                                onChange={(e) => setEndColor(e.target.value)} 
                                style={{ flex: 1, background: '#121214', border: '1px solid #333', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
                            />
                        </div>
                    </div>

                    {/* Angle */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', fontWeight: 600 }}>
                            <span>ANGLE</span>
                            <span>{angle}deg</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value={angle} 
                            onChange={(e) => setAngle(Number(e.target.value))} 
                            style={{ width: '100%', accentColor: '#DD2476', cursor: 'pointer' }}
                        />
                    </div>

                    {/* Shadow Blur */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', fontWeight: 600 }}>
                            <span>SHADOW BLUR</span>
                            <span>{shadowBlur}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="10" 
                            max="150" 
                            value={shadowBlur} 
                            onChange={(e) => setShadowBlur(Number(e.target.value))} 
                            style={{ width: '100%', accentColor: '#DD2476', cursor: 'pointer' }}
                        />
                    </div>

                    {/* Shadow Opacity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', fontWeight: 600 }}>
                            <span>SHADOW OPACITY</span>
                            <span>{shadowOpacity}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            value={shadowOpacity} 
                            onChange={(e) => setShadowOpacity(Number(e.target.value))} 
                            style={{ width: '100%', accentColor: '#DD2476', cursor: 'pointer' }}
                        />
                    </div>

                    {/* Code Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '9px', color: '#777', fontWeight: 600 }}>CURRENT CSS</label>
                        <textarea 
                            readOnly 
                            value={cssString} 
                            style={{ background: '#121214', border: '1px solid #333', color: '#00ff66', padding: '8px', borderRadius: '6px', fontSize: '10px', fontFamily: 'monospace', height: '50px', resize: 'none', outline: 'none' }}
                        />
                    </div>

                    {/* Done Button */}
                    <button 
                        onClick={handleCopy}
                        style={{
                            background: 'linear-gradient(135deg, #00FF87, #60EFFF)',
                            color: '#121214',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '12px',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        ✅ Okay, Copy Values!
                    </button>
                </div>
            )}
        </div>
    );
};

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, setTheme, toggleTheme } = useTheme();
    const { autoThumbnails, setAutoThumbnails } = useSettings();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const settingsZoneRef = React.useRef(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [mobileMenuView, setMobileMenuView] = React.useState('main');
    const mobileMenuRef = React.useRef(null);

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

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close mobile menu on click outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const isInside = event.target.closest('.mobile-menu-zone');
            if (mobileMenuRef.current && !isInside) {
                if (isMobileMenuOpen) {
                    console.log("Closing mobile menu. Clicked on:", event.target);
                    setIsMobileMenuOpen(false);
                }
            }
        };
        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileMenuOpen]);

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


    const [pageTitle, setPageTitle] = React.useState('எல்வன்');
    const normalizedPath = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const mainLevelPaths = ['/writings', '/arts', '/archive', '/about', '/portfolio', '/settings', '/teaching'];
    const isMainLevel = normalizedPath === '/' || mainLevelPaths.some(p => normalizedPath === p || normalizedPath.endsWith(p));


    // Reset title on navigation to home
    React.useEffect(() => {
        if (location.pathname === '/') setPageTitle('எல்வன்');
    }, [location.pathname]);

    return (
        <div className={`app-shell ${shouldAnimate ? 'animate-layout' : ''}`} style={{ display: 'flex' }}>
            {/* Mobile Top Bar */}
            <header className={`mobile-topbar ${location.pathname !== '/' ? 'is-centered' : ''} ${location.pathname !== '/' ? 'has-back' : ''}`}>
                <div className="mobile-topbar-left">
                    { location.pathname !== '/' && (
                        <button 
                            className="mobile-back-btn" 
                            onClick={() => {
                                if (location.pathname.split('/').filter(Boolean).length > 1) {
                                    navigate(-1);
                                } else {
                                    navigate('/');
                                }
                            }}
                            aria-label="Go back"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                    )}
                </div>
                
                <div className="brand" key={pageTitle}>
                    {pageTitle === 'எல்வன்' || pageTitle === 'எல்வன்|elvan' ? (
                        <div className="brand-bilingual" lang="ta">
                            எல்வன்
                            <span className="brand-subtitle">elvan</span>
                        </div>
                    ) : pageTitle.includes('|') ? (
                        <>
                            <div className="brand-main">{pageTitle.split('|')[0]}</div>
                            <div className="brand-sub">{pageTitle.split('|')[1]}</div>
                        </>
                    ) : (
                        pageTitle
                    )}
                </div>

                <div className="top-bar-actions">
                    <div className="mobile-menu-zone" ref={mobileMenuRef}>
                        <button 
                            className="top-dot-btn"
                            onClick={(e) => { 
                                e.stopPropagation();
                                setIsMobileMenuOpen(prev => !prev); 
                                setMobileMenuView('main'); 
                            }}
                            aria-label="More options"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="5" cy="12" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="19" cy="12" r="2" />
                            </svg>
                        </button>

                        {isMobileMenuOpen && (
                            <>
                                <div className="menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
                                <div className="top-menu-dropdown" style={{ height: mobileMenuView === 'main' ? '112px' : '220px' }}>
                                    <div className="menu-slider-track" style={{ transform: mobileMenuView === 'main' ? 'translateX(0%)' : 'translateX(-50%)' }}>

                                        {/* MAIN MENU */}
                                        <div className="menu-view">
                                            <Link to="/teaching" onClick={() => setIsMobileMenuOpen(false)} className="menu-item">
                                                <FiMonitor className="menu-icon" />
                                                Teaching
                                            </Link>
                                            <button onClick={() => setMobileMenuView('appearance')} className="menu-item space-between">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                        <path fillRule="evenodd" d="M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25Zm0 1.5v16.5c4.557 0 8.25-3.693 8.25-8.25 0-4.557-3.693-8.25-8.25-8.25Z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Appearance</span>
                                                </div>
                                                <svg style={{ width: '18px', height: '18px', opacity: 0.4 }} viewBox="0 0 24 24" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* APPEARANCE SUB-MENU */}
                                        <div className="menu-view">
                                            <button onClick={() => setMobileMenuView('main')} className="menu-item back-btn">
                                                <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                                                </svg>
                                                Back
                                            </button>
                                            <button onClick={() => setTheme('auto')} className={`menu-item ${theme === 'auto' ? 'selected' : ''}`}>
                                                <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" />
                                                    <path fillRule="evenodd" d="M8.625 1.5A3.375 3.375 0 0 0 5.25 4.875v14.25a3.375 3.375 0 0 0 3.375 3.375h6.75a3.375 3.375 0 0 0 3.375-3.375V4.875A3.375 3.375 0 0 0 15.375 1.5h-6.75ZM7.5 4.875a1.125 1.125 0 0 1 1.125-1.125h6.75a1.125 1.125 0 0 1 1.125 1.125v14.25a1.125 1.125 0 0 1-1.125 1.125h-6.75A1.125 1.125 0 0 1 7.5 19.125V4.875Z" clipRule="evenodd" />
                                                </svg>
                                                Auto System
                                            </button>
                                            <button onClick={() => setTheme('light')} className={`menu-item ${theme === 'light' ? 'selected' : ''}`}>
                                                <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                                                </svg>
                                                Light Mode
                                            </button>
                                            <button onClick={() => setTheme('dark')} className={`menu-item ${theme === 'dark' ? 'selected' : ''}`}>
                                                <svg className="menu-icon" viewBox="0 0 24 24" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                                                </svg>
                                                Dark Mode
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${!isMainLevel ? 'mobile-hidden-nav' : ''}`}>

                <div className="sidebar-top">
                    <div className="sidebar-header">
                        {!isSidebarCollapsed && (
                            <div className="brand" lang="ta">
                                எல்வன்
                                <span className="brand-subtitle">elvan</span>
                            </div>
                        )}
                        <button
                            className="sidebar-toggle-btn"
                            onClick={handleSidebarToggle}
                            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {isSidebarCollapsed ? <RiMenuUnfoldLine size={20} /> : <RiMenuFoldLine size={20} />}
                        </button>
                    </div>
                    <div className="sidebar-nav">
                        <NavLink to="/" icon={<FiHome size={22} />} label="முகப்பு" subLabel="home" active={location.pathname === '/'} collapsed={isSidebarCollapsed} />
                        <NavLink to="/writings" icon={<FiEdit3 size={22} />} label="எழுத்துகள்" subLabel="writings" active={location.pathname.startsWith('/writings')} collapsed={isSidebarCollapsed} />
                        <NavLink to="/arts" icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z"/></svg>} label="படைப்புகள்" subLabel="arts" active={location.pathname.startsWith('/arts')} collapsed={isSidebarCollapsed} />
                        <NavLink to="/teaching" icon={<FiMonitor size={22} />} label="பயிற்றுவிப்பு" subLabel="teaching" active={location.pathname.startsWith('/teaching')} collapsed={isSidebarCollapsed} className="desktop-only" />

                        <NavLink to="/archive" icon={<FiInstagram size={22} />} label="காப்புகள்" subLabel="archive" active={location.pathname === '/archive'} collapsed={isSidebarCollapsed} />
                        <NavLink to="/about" icon={<FiUser size={22} />} label="பற்றி" subLabel="about" active={location.pathname === '/about'} className="desktop-only" collapsed={isSidebarCollapsed} />
                        <NavLink
                            to="/about"
                            icon={
                                <ProfileImage
                                    src={profileData?.profilePic || "https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/profile.jpg"}
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
                            {!isSidebarCollapsed && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                                    <ProfileImage
                                        src={profileData?.profilePic || "https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/profile.jpg"}
                                        alt="Profile"
                                        className="trigger-avatar"
                                    />
                                    <div className="trigger-text">
                                        <span className="trigger-name">{profileData?.name?.split(' ')[0] || 'Elvan'}</span>
                                    </div>
                                    <FiSettings size={16} className="trigger-gear" />
                                </div>
                            )}
                            {isSidebarCollapsed && (
                                <ProfileImage
                                    src={profileData?.profilePic || "https://cdn.jsdelivr.net/gh/ElvanParthasarathy/Elvanmedia@main/assets/instagram/profile.jpg"}
                                    alt="Profile"
                                    className="trigger-avatar"
                                />
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
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /></svg>
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
                <Outlet context={{ theme, setTheme, toggleTheme, isSidebarCollapsed, setPageTitle, autoThumbnails }} />
            </main>
            <GradientCustomizer />
        </div>

    );
};

interface NavLinkProps {
    to: string;
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    active: boolean;
    className?: string;
    collapsed: boolean;
}

const NavLink = ({ to, icon, label, subLabel, active, className = '', collapsed }: NavLinkProps) => (
    <Link to={to} className={`nav-item ${active ? 'active' : ''} ${collapsed ? 'collapsed' : ''} ${className}`.trim()} title={collapsed ? label : ''}>
        <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        {!collapsed && (
            <div className="nav-text-container">
                <span className="label">{label}</span>
                {subLabel && <span className="sub-label desktop-only">{subLabel}</span>}
            </div>
        )}
    </Link>
);

const ArchiveSkeleton = () => (
    <div className="page-view" style={{ maxWidth: 935, margin: '0 auto', padding: '24px 20px' }}>
        <style>{`
            @keyframes skeletonShimmer {
                0% { background-position: -400px 0; }
                100% { background-position: 400px 0; }
            }
            .skel {
                background: linear-gradient(90deg, var(--bg-panel) 25%, color-mix(in srgb, var(--text-main) 6%, var(--bg-panel)) 50%, var(--bg-panel) 75%);
                background-size: 800px 100%;
                animation: skeletonShimmer 1.5s ease-in-out infinite;
                border-radius: 8px;
            }
        `}</style>
        {/* Profile header */}
        <div style={{ display: 'flex', gap: 30, alignItems: 'center', marginBottom: 36 }}>
            <div className="skel" style={{ width: 150, height: 150, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="skel" style={{ width: '45%', height: 28 }} />
                <div style={{ display: 'flex', gap: 30 }}>
                    <div className="skel" style={{ width: 70, height: 18 }} />
                    <div className="skel" style={{ width: 70, height: 18 }} />
                    <div className="skel" style={{ width: 70, height: 18 }} />
                </div>
                <div className="skel" style={{ width: '60%', height: 16 }} />
                <div className="skel" style={{ width: '40%', height: 16 }} />
            </div>
        </div>
        {/* Highlights */}
        <div style={{ display: 'flex', gap: 15, marginBottom: 30, overflowX: 'hidden' }}>
            {[...Array(7)].map((_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="skel" style={{ width: 66, height: 66, borderRadius: '50%' }} />
                    <div className="skel" style={{ width: 48, height: 10 }} />
                </div>
            ))}
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 50, borderTop: '1px solid var(--border-color)', padding: '16px 0', marginBottom: 10 }}>
            {[60, 50, 55, 65].map((w, i) => (
                <div key={i} className="skel" style={{ width: w, height: 14 }} />
            ))}
        </div>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {[...Array(9)].map((_, i) => (
                <div key={i} className="skel" style={{ width: '100%', paddingTop: '100%', borderRadius: 2 }} />
            ))}
        </div>
    </div>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <Home /> },
            { path: "about", element: <About /> },
            { path: "portfolio", element: <Portfolio /> },
            { path: "settings", element: <Settings /> },
            { path: "writings", element: <Writings /> },
            { path: "teaching", element: <Teaching /> },
            { path: "arts", element: <Arts /> },
            { path: "arts/:category", element: <ArtsGallery /> },
            { path: "teaching/vocoder", element: <VocoderView /> },
            { path: "archive", element: <Suspense fallback={<ArchiveSkeleton />}><Archive /></Suspense> },
            // Unified Categories (Blog, Articles, Essays, Stories, Thoughts, Diary, Poems, Quotes)
            { path: "writings/:category", element: <CategoryListView /> },
            { path: "writings/:category/:slug", element: <ReadingView /> },
        ]
    },
    {
        path: "/admin",
        element: <Admin />
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
        return localStorage.getItem('autoThumbnails') !== 'false';
    });

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
                    animation: headerFadeIn 0.22s ease-out;
                }

                @keyframes headerFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
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
