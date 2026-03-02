/**
 * Web-версия выбора координат — только форма ввода (react-native-maps не поддерживает web)
 */
import { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { setMapSelection } from '@/lib/selectionStore';
import { parseDD, formatDD } from '@/lib/coordsUtils';

export default function MapPickerScreen() {
  const router = useRouter();
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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Выбрать координаты" />
      </Appbar.Header>
      <View style={styles.webForm}>
        <Text variant="bodyMedium" style={styles.hint}>
          Введите координаты в формате DD (широта, долгота) или используйте приложение на телефоне для выбора на карте.
        </Text>
        <TextInput
          label="Координаты (DD)"
          value={coords}
          onChangeText={setCoords}
          placeholder="55.7558, 37.6173"
          mode="outlined"
          style={styles.input}
        />
        <Button mode="contained" onPress={handleConfirm}>
          Выбрать
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webForm: {
    padding: 16,
    gap: 12,
  },
  hint: {
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    marginBottom: 8,
  },
});
