import React from 'react';

export interface ThemeContextType {
    theme: string;
    setTheme: React.Dispatch<React.SetStateAction<string>>;
    toggleTheme: () => void;
}

// Create a Context for Theme
export const ThemeContext = React.createContext<ThemeContextType>({
    theme: 'auto',
    setTheme: () => {},
    toggleTheme: () => {}
});

export const useTheme = () => React.useContext(ThemeContext);
