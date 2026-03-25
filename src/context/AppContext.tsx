import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { APP_CONFIG } from '@/constants';
import type { ThemeMode } from '@/types';

type AppContextValue = {
  userName: string;
  setUserName: (value: string) => void;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [userName, setUserName] = useState<string>(APP_CONFIG.defaultUserName);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const value: AppContextValue = {
    userName,
    setUserName,
    themeMode,
    toggleThemeMode: () => {
      setThemeMode((currentMode) => (currentMode === 'light' ? 'dark' : 'light'));
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider.');
  }

  return context;
}
