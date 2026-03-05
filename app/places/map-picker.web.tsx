/**
 * Web-версия выбора координат — только форма ввода (react-native-maps не поддерживает web)
 */
import { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { setMapSelection } from '@/lib/selectionStore';
import { parseDD, formatDD } from '@/lib/coordsUtils';

export default function MapPickerScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const initialLat = parseFloat(params.lat ?? '55.7558') || 55.7558;
  const initialLng = parseFloat(params.lng ?? '37.6173') || 37.6173;

  const [coords, setCoords] = useState(formatDD(initialLat, initialLng));

  const handleConfirm = useCallback(() => {
    const parsed = parseDD(coords);
    if (parsed) {
      setMapSelection(parsed.lat, parsed.lng);
      router.back();
    }
  }, [coords, router]);

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Выбрать координаты" />
      </Appbar.Header>
      <View style={styles.webForm}>
        <Text variant="bodyMedium" style={styles.hint}>
          Введите координаты в формате DD (широта, долгота) или используйте приложение на телефоне для выбора на карте.
        </Text>
        <View style={styles.coordBlock}>
          <Text
            variant="labelLarge"
            style={[styles.coordLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Координаты (DD)
          </Text>
          <TextInput
            value={coords}
            onChangeText={setCoords}
            placeholder="55.7558, 37.6173"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            mode="outlined"
            style={styles.input}
          />
        </View>
        <Button mode="contained" onPress={handleConfirm}>
          Выбрать
        </Button>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  webForm: {
    padding: 16,
    gap: 12,
  },
  hint: {
    marginBottom: 8,
    opacity: 0.8,
  },
  coordBlock: { marginBottom: 12 },
  coordLabel: { marginBottom: 4 },
  input: {
    marginBottom: 8,
  },
});
