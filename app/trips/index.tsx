import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  Card,
  FAB,
  List,
  Text,
  useTheme,
} from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAllTrips } from '@/lib/dal';
import type { Trip } from '@/lib/types';

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  return `${fmt(startDate)} — ${fmt(endDate)}`;
}

export default function TripsListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const data = await getAllTrips();
      setTrips(data);
    } catch (err) {
      console.error('Ошибка загрузки поездок:', err);
      setTrips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTrips();
    }, [loadTrips])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTrips();
  }, [loadTrips]);

  const addPressRef = useRef(false);
  const handleAddTrip = useCallback(() => {
    if (addPressRef.current) return;
    addPressRef.current = true;
    router.push('/trips/new');
    setTimeout(() => {
      addPressRef.current = false;
    }, 600);
  }, [router]);

  const handleTripPress = (trip: Trip) => {
    router.push(`/trips/${trip.id}`);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Нет поездок
          </Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            Нажмите + чтобы добавить
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {trips.map((trip) => (
            <Card
              key={trip.id}
              mode="elevated"
              style={[
                styles.card,
                trip.current && {
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => handleTripPress(trip)}
            >
              <List.Item
                title={trip.title}
                description={
                  trip.current
                    ? `Текущая · ${formatDateRange(trip.startDate, trip.endDate)}`
                    : formatDateRange(trip.startDate, trip.endDate)
                }
                descriptionNumberOfLines={2}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={trip.current ? 'map-marker' : 'map-marker-outline'}
                    color={trip.current ? theme.colors.primary : theme.colors.outline}
                  />
                )}
              />
            </Card>
          ))}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddTrip}
        label="Добавить"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { marginBottom: 8 },
  emptyHint: { opacity: 0.7 },
  list: { flex: 1 },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
