/**
 * Web: карты нет — показываем координаты и ссылку на Google Maps
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, Linking } from 'react-native';
import { Appbar, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BACKGROUND_IMAGE } from '@/lib/backgroundAsset';
import { getPlaceById } from '@/lib/dal';
import type { Place } from '@/lib/types';

export default function PlaceMapWebScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const placeId = id ? parseInt(String(id), 10) : NaN;
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPlace = useCallback(async () => {
    if (isNaN(placeId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const p = await getPlaceById(placeId);
      setPlace(p);
    } catch (err) {
      console.error('Ошибка загрузки места:', err);
      setPlace(null);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  if (loading || !place) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место на карте" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ImageBackground>
    );
  }

  const mapsUrl = `https://www.google.com/maps?q=${place.lat},${place.lng}`;
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} subtitle="Координаты" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="bodyLarge" style={styles.coords}>
          {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
        </Text>
        <Text variant="bodySmall" style={styles.hint}>
          На web карта недоступна. Откройте в приложении или по ссылке:
        </Text>
        <Button
          mode="contained-tonal"
          icon="map"
          onPress={() => Linking.openURL(mapsUrl)}
          style={styles.button}
        >
          Открыть в Google Картах
        </Button>
        <Button
          mode="contained-tonal"
          icon="navigation"
          onPress={() => Linking.openURL(navUrl)}
        >
          Построить маршрут
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  coords: {
    marginBottom: 16,
  },
  hint: {
    marginBottom: 16,
    opacity: 0.8,
  },
  button: {
    marginBottom: 12,
  },
});
