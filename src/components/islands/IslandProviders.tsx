import React, { useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeContext } from '../../கொக்கிகள்/கருப்பொருள்';
import { SettingsContext } from '../../கொக்கிகள்/அமைப்புகள்கொக்கி';

interface IslandProvidersProps {
  initialEntries?: string[];
  children: React.ReactNode;
}

export const IslandProviders: React.FC<IslandProvidersProps> = ({
  initialEntries = ['/'],
  children,
}) => {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'auto';
    }
    return 'auto';
  });

  const [autoThumbnails, setAutoThumbnails] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoThumbnails') === 'true';
    }
    return true;
  });

  useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem('theme') || 'auto';
      setTheme(saved);
    };
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'auto' ? 'light' : prev === 'light' ? 'dark' : 'auto'));
  };

  return (
    <HelmetProvider>
      <SettingsContext.Provider value={{ autoThumbnails, setAutoThumbnails }}>
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
          <MemoryRouter initialEntries={initialEntries}>
            <div className="astro-island-root">{children}</div>
          </MemoryRouter>
        </ThemeContext.Provider>
      </SettingsContext.Provider>
    </HelmetProvider>
  );
};
