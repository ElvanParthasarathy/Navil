import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiEdit3, FiSettings, FiInstagram, FiUser } from 'react-icons/fi';
import profileData from './data/profile.json';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Writings from './pages/Writings';
import Archive from './pages/Archive';
import Quotes from './pages/writings/Quotes';
import WritingsPlaceholder from './pages/writings/WritingsPlaceholder';
import Admin from './pages/Admin';
import Blog from './pages/writings/Blog';
import Articles from './pages/writings/Articles';
import Essays from './pages/writings/Essays';
import Stories from './pages/writings/Stories';
import Poems from './pages/writings/Poems';
import Thoughts from './pages/writings/Thoughts';
import Diary from './pages/writings/Diary';

// Create a Context for Theme
const ThemeContext = React.createContext({ theme: 'auto', setTheme: () => { }, toggleTheme: () => { } });

// Export a hook for easy access
export const useTheme = () => React.useContext(ThemeContext);

const ProfileImage = ({ src, alt, className }) => {
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
    const { theme, setTheme, toggleTheme } = useTheme();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
    const settingsZoneRef = React.useRef(null);

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

    return (
        <div className="app-shell" style={{ display: 'flex' }}>
            <header className="mobile-header">
                <div className="brand">Elvan</div>
                <div className="mobile-actions">
                    <Link to="/settings" className="settings-btn-small">
                        <FiSettings size={22} />
                    </Link>
                </div>
            </header>

            <nav className="sidebar">
                <div className="sidebar-top">
                    <div className="brand">Elvan</div>
                    <div className="sidebar-nav">
                        <NavLink to="/" icon={<FiHome size={22} />} label="முகப்பு" subLabel="Home" active={location.pathname === '/'} />
                        <NavLink to="/writings" icon={<FiEdit3 size={22} />} label="எழுத்துகள்" subLabel="Writings" active={location.pathname.startsWith('/writings')} />

                        <NavLink to="/archive" icon={<FiInstagram size={22} />} label="காப்புகள்" subLabel="Archive" active={location.pathname === '/archive'} />
                        <NavLink to="/about" icon={<FiUser size={22} />} label="பற்றி" subLabel="About" active={location.pathname === '/about'} className="desktop-only" />
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
                        />
                    </div>
                </div>

                <div className="sidebar-bottom" ref={settingsZoneRef}>
                    <div className="settings-profile-container">
                        <div
                            className={`settings-trigger ${isSettingsOpen ? 'active-trigger' : ''}`}
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
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

                        {isSettingsOpen && (
                            <div className="settings-popup">
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

            <main className="main-content" style={{ flexGrow: 1, minHeight: '100vh', width: '100%' }}>
                <Outlet context={{ theme, setTheme, toggleTheme }} />
            </main>
        </div>
    );
};

const NavLink = ({ to, icon, label, subLabel, active, className = '' }) => (
    <Link to={to} className={`nav-item ${active ? 'active' : ''} ${className}`.trim()}>
        <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <div className="nav-text-container">
            <span className="label">{label}</span>
            {subLabel && <span className="sub-label desktop-only">{subLabel}</span>}
        </div>
    </Link>
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
            { path: "archive", element: <Archive /> },
            { path: "writings/quotes", element: <Quotes /> },
            { path: "writings/blog", element: <Blog /> },
            { path: "writings/articles", element: <Articles /> },
            { path: "writings/essays", element: <Essays /> },
            { path: "writings/stories", element: <Stories /> },
            { path: "writings/poems", element: <Poems /> },
            { path: "writings/thoughts", element: <Thoughts /> },
            { path: "writings/diary", element: <Diary /> },
            { path: "writings/:category", element: <WritingsPlaceholder /> },
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
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            <RouterProvider router={router} />
        </ThemeContext.Provider>
    );
}

export default App;
