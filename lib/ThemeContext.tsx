/**
 * Контекст выбора темы: светлая/тёмная.
 * Сохраняет выбор в AsyncStorage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { getThemeMode, setThemeMode as saveThemeMode, type ThemeMode } from './themeStore';

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeProvider');
  return ctx;
}

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getThemeMode().then((mode) => {
      setThemeModeState(mode);
      setReady(true);
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    await saveThemeMode(mode);
    setThemeModeState(mode);
  };

  const theme = themeMode === 'dark' ? MD3DarkTheme : MD3LightTheme;

  if (!ready) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}
