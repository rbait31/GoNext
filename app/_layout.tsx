import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';

// Предупреждение из зависимостей (expo-router/react-navigation)
LogBox.ignoreLogs(['props.pointerEvents is deprecated']);
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@/lib/db';

export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch((err: unknown) => console.error('DB init error:', err));
  }, []);
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
