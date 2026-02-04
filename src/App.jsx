import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation, useOutletContext } from 'react-router-dom';
import { FiHome, FiEdit3, FiSettings, FiGrid } from 'react-icons/fi';
import { profileData } from './data/instagramData';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Writings from './pages/Writings';
import Library from './pages/Library';
import Quotes from './pages/writings/Quotes';
import WritingsPlaceholder from './pages/writings/WritingsPlaceholder';

// Create a Context for Theme
const ThemeContext = React.createContext({ theme: 'light', toggleTheme: () => { } });

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
    const { theme, toggleTheme } = useTheme();

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

                        <NavLink to="/library" icon={<FiGrid size={22} />} label="Library" active={location.pathname === '/library'} />
                    </div>
                </div>

                <div className="sidebar-bottom">
                    <div className="bottom-nav-pill">
                        <Link to="/about" className={`pill-profile ${location.pathname === '/about' ? 'active' : ''}`}>
                            <ProfileImage
                                src={profileData?.profilePic || "https://res.cloudinary.com/doxhuprh4/image/upload/assets/instagram/profile.jpg"}
                                alt="Profile"
                                className="pill-avatar"
                            />
                            <div className="pill-name">{profileData?.name?.split(' ')[0] || 'Elvan'}</div>
                        </Link>
                        <Link to="/settings" className={`pill-settings ${location.pathname === '/settings' ? 'active' : ''}`}>
                            <FiSettings size={20} />
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="main-content" style={{ flexGrow: 1, minHeight: '100vh', width: '100%' }}>
                <Outlet context={{ theme, toggleTheme }} />
            </main>
        </div>
    );
};

const NavLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
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
            { path: "library", element: <Library /> },
            { path: "writings/quotes", element: <Quotes /> },
            { path: "writings/:category", element: <WritingsPlaceholder /> },
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
        return localStorage.getItem('theme') || 'light';
    });

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <RouterProvider router={router} />
        </ThemeContext.Provider>
    );
}

export default App;
