/**
 * Хранение выбора темы (светлая/тёмная) и основного цвета
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@gonext/theme';
const PRIMARY_COLOR_KEY = '@gonext/primaryColor';

export type ThemeMode = 'light' | 'dark';

/** 10 цветов для выбора (Material Design) */
export const PRIMARY_COLORS: string[] = [
  '#6750A4', // фиолетовый
  '#3F51B5', // индиго
  '#2196F3', // синий
  '#009688', // бирюзовый
  '#8BC34A', // зелёно-лаймовый
  '#FF9800', // оранжевый
  '#F44336', // красный
  '#1976D2', // тёмно-синий
  '#9C27B0', // пурпурный
  '#5D4037', // коричневый
];

export type PrimaryColorIndex = number; // 0–9 или -1 для темы по умолчанию

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

export async function getPrimaryColorIndex(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(PRIMARY_COLOR_KEY);
    const n = parseInt(value ?? '-1', 10);
    if (n >= 0 && n < PRIMARY_COLORS.length) return n;
  } catch {
    // ignore
  }
  return 0; // по умолчанию первый цвет
}

export async function setPrimaryColorIndex(index: number): Promise<void> {
  try {
    await AsyncStorage.setItem(PRIMARY_COLOR_KEY, String(index));
  } catch (err) {
    console.error('Ошибка сохранения цвета:', err);
  }
}
