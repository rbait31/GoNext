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
  SegmentedButtons,
  Text,
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { getPlacesByFilter } from '@/lib/dal';
import type { Place } from '@/lib/types';

type Filter = 'all' | 'visitlater' | 'liked';

export default function PlacesListScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlaces = useCallback(async () => {
    try {
      const data = await getPlacesByFilter(filter);
      setPlaces(data);
    } catch (err) {
      console.error('Ошибка загрузки мест:', err);
      setPlaces([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPlaces();
    }, [loadPlaces])
  );

  useEffect(() => {
    setLoading(true);
    loadPlaces();
  }, [filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPlaces();
  }, [loadPlaces]);

  const addPressRef = useRef(false);
  const handleAddPlace = useCallback(() => {
    if (addPressRef.current) return;
    addPressRef.current = true;
    router.push('/places/new');
    setTimeout(() => {
      addPressRef.current = false;
    }, 600);
  }, [router]);

  const handlePlacePress = (place: Place) => {
    router.push(`/places/${place.id}`);
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('places.title')} />
      </Appbar.Header>

      <View style={styles.filter}>
        <SegmentedButtons
          value={filter}
          onValueChange={(v) => setFilter(v as Filter)}
          buttons={[
            { value: 'all', label: t('places.all') },
            { value: 'visitlater', label: t('places.visitlater') },
            { value: 'liked', label: t('places.liked') },
          ]}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : places.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {t('places.empty')}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            {t('places.emptyHint')}
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
          {places.map((place) => (
            <Card
              key={place.id}
              mode="elevated"
              style={styles.card}
              onPress={() => handlePlacePress(place)}
            >
              <List.Item
                title={place.name}
                description={place.description || undefined}
                descriptionNumberOfLines={2}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={
                      place.visitlater
                        ? 'map-marker'
                        : place.liked
                          ? 'heart'
                          : 'map-marker-outline'
                    }
                    color={
                      place.liked
                        ? theme.colors.error
                        : theme.colors.primary
                    }
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
        onPress={handleAddPlace}
        label={t('places.add')}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
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
