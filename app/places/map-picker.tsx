import { useState, useCallback } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Appbar, Button, TextInput, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { setMapSelection } from '@/lib/selectionStore';

export default function MapPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const initialLat = parseFloat(params.lat ?? '55.7558') || 55.7558;
  const initialLng = parseFloat(params.lng ?? '37.6173') || 37.6173;

  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const handleConfirm = useCallback(() => {
    setMapSelection(lat, lng);
    router.back();
  }, [lat, lng, router]);

  const handleMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setLat(latitude);
      setLng(longitude);
    },
    []
  );

  const handleLatChange = (t: string) => {
    const n = parseFloat(t);
    if (!isNaN(n)) setLat(n);
  };

  const handleLngChange = (t: string) => {
    const n = parseFloat(t);
    if (!isNaN(n)) setLng(n);
  };

  // На web react-native-maps может не работать — показываем форму ввода
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Выбрать координаты" />
        </Appbar.Header>
        <View style={styles.webForm}>
          <Text variant="bodyMedium" style={styles.hint}>
            Введите координаты или используйте приложение на телефоне для выбора на карте.
          </Text>
          <TextInput
            label="Широта"
            value={String(lat)}
            onChangeText={handleLatChange}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Долгота"
            value={String(lng)}
            onChangeText={handleLngChange}
            keyboardType="numeric"
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

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Выбрать на карте" />
        <Appbar.Action icon="check" onPress={handleConfirm} />
      </Appbar.Header>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} draggable onDragEnd={handleMapPress} />
      </MapView>

      <View style={styles.footer}>
        <Text variant="bodySmall">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </Text>
        <Button mode="contained" onPress={handleConfirm} compact>
          Выбрать
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    flex: 1,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
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
