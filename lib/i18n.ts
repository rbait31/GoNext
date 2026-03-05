/**
 * Настройка i18next для интернационализации
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLanguage } from './languageStore';

import ru from '@/locales/ru.json';
import en from '@/locales/en.json';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

/** Загрузить сохранённый язык при запуске */
export async function initI18nLanguage(): Promise<void> {
  const saved = await getLanguage();
  await i18n.changeLanguage(saved);
}

export default i18n;
