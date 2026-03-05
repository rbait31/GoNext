import { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';

// Предупреждение из зависимостей (expo-router/react-navigation)
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18nLanguage } from '@/lib/i18n';
import { ThemeProvider, useThemeMode } from '@/lib/ThemeContext';
import { getDatabase } from '@/lib/db';

function LayoutContent() {
  const { themeMode } = useThemeMode();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    getDatabase().catch((err: unknown) => console.error('DB init error:', err));
  }, []);

  useEffect(() => {
    initI18nLanguage().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return null;
  }

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LayoutContent />
      </ThemeProvider>
    </I18nextProvider>
  );
}
