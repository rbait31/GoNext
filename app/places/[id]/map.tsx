import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Appbar, Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { ScreenBackground } from '@/components/ScreenBackground';
import { getPlaceById } from '@/lib/dal';
import type { Place } from '@/lib/types';

const DEFAULT_DELTA = 0.01;

function openInExternalMap(lat: number, lng: number) {
  const url =
    Platform.OS === 'ios'
      ? `maps://?q=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`).catch(console.error);
  });
}

function openInNavigator(lat: number, lng: number) {
  const url =
    Platform.OS === 'ios'
      ? `maps://?daddr=${lat},${lng}`
      : `google.navigation:q=${lat},${lng}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    ).catch(console.error);
  });
}

export default function PlaceMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
      <ScreenBackground style={styles.container}>
        <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место на карте" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenBackground>
    );
  }

  const region = {
    latitude: place.lat,
    longitude: place.lng,
    latitudeDelta: DEFAULT_DELTA,
    longitudeDelta: DEFAULT_DELTA,
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} subtitle="На карте" />
      </Appbar.Header>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
      >
        <Marker
          coordinate={{ latitude: place.lat, longitude: place.lng }}
          title={place.name}
          description={place.description || undefined}
        />
      </MapView>

      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>
        <Button
          mode="contained-tonal"
          icon="map"
          onPress={() => openInExternalMap(place.lat, place.lng)}
          style={styles.footerButton}
        >
          Открыть в приложении Карты
        </Button>
        <Button
          mode="contained-tonal"
          icon="navigation"
          onPress={() => openInNavigator(place.lat, place.lng)}
        >
          Маршрут
        </Button>
      </View>
    </ScreenBackground>
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
  map: {
    flex: 1,
    width: '100%',
  },
  footer: {
    padding: 16,
    gap: 8,
    backgroundColor: 'white',
  },
  footerButton: {
    marginBottom: 4,
  },
});
