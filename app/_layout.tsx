import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { getDatabase } from '@/lib/db';

export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch((err) => console.error('DB init error:', err));
  }, []);
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
