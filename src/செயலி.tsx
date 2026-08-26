import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ThemeContext } from './கொக்கிகள்/கருப்பொருள்';
import { SettingsContext } from './கொக்கிகள்/அமைப்புகள்கொக்கி';
import { router } from './செயலி/வழித்தடம்';

// Re-export hooks for backward compatibility
export { useTheme } from './கொக்கிகள்/கருப்பொருள்';
export { useSettings } from './கொக்கிகள்/அமைப்புகள்கொக்கி';

function App() {
    const [theme, setTheme] = React.useState(() => {
        return localStorage.getItem('theme') || 'auto';
    });
    
    const [autoThumbnails, setAutoThumbnails] = React.useState(() => {
        return localStorage.getItem('autoThumbnails') === 'true';
    });

    React.useEffect(() => {
        sessionStorage.removeItem('chunkretry');
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
                type: 'IFRAMETHEMECHANGE', 
                appId: 'elvan', 
                isDark: isDark 
            }, '*');
        }
    }, [theme]);

    const toggleTheme = () => {
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
