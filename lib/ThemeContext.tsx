/**
 * Контекст выбора темы: светлая/тёмная и основной цвет.
 * Сохраняет выбор в AsyncStorage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import color from 'color';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import {
  getThemeMode,
  setThemeMode as saveThemeMode,
  getPrimaryColorIndex,
  setPrimaryColorIndex as savePrimaryColorIndex,
  PRIMARY_COLORS,
  type ThemeMode,
} from './themeStore';

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  primaryColorIndex: number;
  setPrimaryColorIndex: (index: number) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeProvider');
  return ctx;
}

function applyPrimaryColor(
  baseTheme: MD3Theme,
  hexColor: string,
  isDarkMode: boolean
): MD3Theme {
  const c = color(hexColor);
  const isPrimaryDark = c.isDark();
  const onPrimary = isPrimaryDark ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
  const primaryContainer = c.mix(color('white'), 0.85).hex();
  const onPrimaryContainer = c.mix(color('black'), 0.8).hex();
  const inversePrimary = c.mix(color('white'), 0.6).hex();

  const colors: Partial<MD3Theme['colors']> = {
    ...baseTheme.colors,
    primary: hexColor,
    primaryContainer,
    onPrimary,
    onPrimaryContainer,
    inversePrimary,
  };

  // В тёмной теме: фон и surface — тёмный оттенок выбранного основного цвета
  if (isDarkMode) {
    const darkBackground = c.mix(color('black'), 0.85).hex();
    colors.background = darkBackground;
    colors.surface = darkBackground;
    colors.surfaceVariant = c.mix(color('black'), 0.75).hex();
  }

  return {
    ...baseTheme,
    colors: { ...baseTheme.colors, ...colors } as MD3Theme['colors'],
  };
}

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [primaryColorIndex, setPrimaryColorIndexState] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getThemeMode(), getPrimaryColorIndex()]).then(
      ([mode, colorIndex]) => {
        setThemeModeState(mode);
        setPrimaryColorIndexState(colorIndex);
        setReady(true);
      }
    );
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    await saveThemeMode(mode);
    setThemeModeState(mode);
  };

  const setPrimaryColorIndex = async (index: number) => {
    await savePrimaryColorIndex(index);
    setPrimaryColorIndexState(index);
  };

  const baseTheme =
    themeMode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const hexColor = PRIMARY_COLORS[primaryColorIndex] ?? PRIMARY_COLORS[0];
  const theme = applyPrimaryColor(
    baseTheme,
    hexColor,
    themeMode === 'dark'
  );

  if (!ready) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        primaryColorIndex,
        setPrimaryColorIndex,
      }}
    >
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}
