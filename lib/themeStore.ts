/**
 * Хранение выбора темы (светлая/тёмная)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@gonext/theme';

export type ThemeMode = 'light' | 'dark';

export async function getThemeMode(): Promise<ThemeMode> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    if (value === 'light' || value === 'dark') return value;
  } catch {
    // ignore
  }
  return 'light';
}

export async function setThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, mode);
  } catch (err) {
    console.error('Ошибка сохранения темы:', err);
  }
}
