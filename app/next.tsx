import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Platform, Linking } from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { getNextPlace, getCurrentTrip, getTripPlacesWithPlace } from '@/lib/dal';

function openInMap(lat: number, lng: number) {
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

export default function NextPlaceScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof getNextPlace>>>(null);
  const [emptyReason, setEmptyReason] = useState<'no_trip' | 'all_visited' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getNextPlace();
      if (result) {
        setData(result);
        setEmptyReason(null);
      } else {
        setData(null);
        const currentTrip = await getCurrentTrip();
        if (!currentTrip) {
          setEmptyReason('no_trip');
        } else {
          const tripPlaces = await getTripPlacesWithPlace(currentTrip.id);
          setEmptyReason(tripPlaces.length === 0 ? 'no_trip' : 'all_visited');
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setData(null);
      setEmptyReason('no_trip');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Следующее место" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenBackground>
    );
  }

  if (data) {
    const { trip, tripPlace } = data;
    const { place } = tripPlace;
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Следующее место" />
        </Appbar.Header>
        <View style={styles.content}>
          <Text variant="labelLarge" style={styles.tripLabel}>
            {trip.title}
          </Text>
          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.placeName}>
                {place.name}
              </Text>
              {place.description ? (
                <Text variant="bodyMedium" style={styles.description}>
                  {place.description}
                </Text>
              ) : null}
              <Text variant="bodySmall" style={styles.orderHint}>
                Пункт {tripPlace.order + 1} в маршруте
              </Text>
            </Card.Content>
          </Card>
          <View style={styles.actions}>
            <Button
              mode="contained-tonal"
              icon="map"
              onPress={() => openInMap(place.lat, place.lng)}
              style={styles.button}
            >
              Открыть на карте
            </Button>
            <Button
              mode="contained-tonal"
              icon="navigation"
              onPress={() => openInNavigator(place.lat, place.lng)}
              style={styles.button}
            >
              Открыть в навигаторе
            </Button>
            <Button
              mode="text"
              onPress={() => router.push(`/places/${place.id}`)}
            >
              Карточка места
            </Button>
            <Button
              mode="text"
              onPress={() => router.push(`/trips/${trip.id}`)}
            >
              Маршрут поездки
            </Button>
          </View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>
      <View style={styles.center}>
        <Text variant="headlineSmall" style={styles.emptyTitle}>
          {emptyReason === 'no_trip'
            ? 'Нет активной поездки'
            : 'Все места посещены'}
        </Text>
        <Text variant="bodyMedium" style={styles.emptyHint}>
          {emptyReason === 'no_trip'
            ? 'Выберите текущую поездку в списке поездок или создайте новую.'
            : 'Вы посетили все места в маршруте. Отлично!'}
        </Text>
        <Button
          mode="contained-tonal"
          onPress={() => router.push('/trips')}
          style={styles.emptyButton}
        >
          Перейти к поездкам
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
    padding: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tripLabel: {
    marginBottom: 8,
    opacity: 0.8,
  },
  card: {
    marginBottom: 16,
  },
  placeName: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 8,
    opacity: 0.9,
  },
  orderHint: {
    opacity: 0.7,
  },
  actions: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
  },
  emptyButton: {},
});
