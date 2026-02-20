import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation } from 'react-router-dom';
import { FiHome, FiEdit3, FiSettings, FiInstagram } from 'react-icons/fi';
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
                        <NavLink to="/" icon={<FiHome size={22} />} label="Home" active={location.pathname === '/'} />
                        <NavLink to="/writings" icon={<FiEdit3 size={22} />} label="Writings" active={location.pathname.startsWith('/writings')} />

                        <NavLink to="/archive" icon={<FiInstagram size={22} />} label="Archive" active={location.pathname === '/archive'} />
                        <NavLink
                            to="/about"
                            icon={
                                <ProfileImage
                                    src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"}
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

                <div className="sidebar-bottom">
                    <Link to="/about" className="profile-pill">
                        <ProfileImage
                            src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"}
                            alt="Profile"
                            className="pill-avatar"
                        />
                        <div className="pill-name">{profileData?.name?.split(' ')[0] || 'Elvan'}</div>
                    </Link>
                    <Link to="/settings" className="settings-circle">
                        <FiSettings size={20} />
                    </Link>
                </div>
            </nav>

            <main className="main-content" style={{ flexGrow: 1, minHeight: '100vh', width: '100%' }}>
                <Outlet context={{ theme, setTheme, toggleTheme }} />
            </main>
        </div>
    );
};

const NavLink = ({ to, icon, label, active, className = '' }) => (
    <Link to={to} className={`nav-item ${active ? 'active' : ''} ${className}`.trim()}>
        <span className="nav-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        <span className="label">{label}</span>
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
            { path: "writings/:category", element: <WritingsPlaceholder /> },
            { path: "admin", element: <Admin /> },
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
