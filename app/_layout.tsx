import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';

// Предупреждение из зависимостей (expo-router/react-navigation)
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeMode } from '@/lib/ThemeContext';
import { getDatabase } from '@/lib/db';

function LayoutContent() {
  const { themeMode } = useThemeMode();
  useEffect(() => {
    getDatabase().catch((err: unknown) => console.error('DB init error:', err));
  }, []);

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LayoutContent />
    </ThemeProvider>
  );
}
