import React from 'react';

export interface SettingsContextType {
    autoThumbnails: boolean;
    setAutoThumbnails: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create a Context for Settings
export const SettingsContext = React.createContext<SettingsContextType>({
    autoThumbnails: true,
    setAutoThumbnails: () => {}
});

export const useSettings = () => React.useContext(SettingsContext);
