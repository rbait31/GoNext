import { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text } from 'react-native-paper';
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
});
