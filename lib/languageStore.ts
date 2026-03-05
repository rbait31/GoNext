/**
 * Хранение выбранного языка (ru/en)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@gonext/language';

export type Language = 'ru' | 'en';

export async function getLanguage(): Promise<Language> {
  try {
    const value = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (value === 'ru' || value === 'en') return value;
  } catch {
    // ignore
  }
  return 'ru';
}

export async function setLanguage(lang: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (err) {
    console.error('Ошибка сохранения языка:', err);
  }
}
