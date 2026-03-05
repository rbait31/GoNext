import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Platform,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Checkbox,
  TextInput,
  IconButton,
  List,
  FAB,
  SegmentedButtons,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BACKGROUND_IMAGE } from '@/lib/backgroundAsset';
import {
  getTripById,
  getTripPlacesWithPlace,
  addPlaceToTrip,
  updateTripPlace,
  removePlaceFromTrip,
  reorderTripPlaces,
  getTripPlacePhotos,
  addTripPlacePhoto,
  deleteTripPlacePhoto,
  getAllPlaces,
} from '@/lib/dal';
import type { TripPlaceWithPlace } from '@/lib/types';
import type { TripPlacePhoto } from '@/lib/dal';
import { getPhotoUri } from '@/lib/photoService';
import { pickImage, takePhoto } from '@/lib/photoService';
import type { Trip, Place } from '@/lib/types';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const tripId = id ? parseInt(String(id), 10) : NaN;

  const [trip, setTrip] = useState<{ title: string; startDate: string; endDate: string } | null>(null);
  const [tripPlaces, setTripPlaces] = useState<TripPlaceWithPlace[]>([]);
  const [photosByTripPlace, setPhotosByTripPlace] = useState<Record<number, TripPlacePhoto[]>>({});
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [placesToAdd, setPlacesToAdd] = useState<Place[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'plan' | 'diary'>('plan');

  const loadData = useCallback(async () => {
    if (isNaN(tripId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [tripData, list] = await Promise.all([
        getTripById(tripId),
        getTripPlacesWithPlace(tripId),
      ]);
      setTrip(tripData ?? null);
      setTripPlaces(list);

      const photosMap: Record<number, TripPlacePhoto[]> = {};
      for (const tp of list) {
        photosMap[tp.id] = await getTripPlacePhotos(tp.id);
      }
      setPhotosByTripPlace(photosMap);
    } catch (err) {
      console.error('Ошибка загрузки поездки:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = useCallback(async () => {
    const all = await getAllPlaces();
    const inTrip = new Set(tripPlaces.map((tp) => tp.placeId));
    setPlacesToAdd(all.filter((p) => !inTrip.has(p.id)));
    setAddModalVisible(true);
  }, [tripPlaces]);

  const addPlace = useCallback(
    async (place: Place) => {
      try {
        await addPlaceToTrip({ tripId, placeId: place.id });
        setAddModalVisible(false);
        loadData();
      } catch (err) {
        console.error('Ошибка добавления места:', err);
      }
    },
    [tripId, loadData]
  );

  const removePlace = useCallback(
    async (tripPlaceId: number) => {
      try {
        await removePlaceFromTrip(tripPlaceId);
        loadData();
      } catch (err) {
        console.error('Ошибка удаления:', err);
      }
    },
    [loadData]
  );

  const moveUp = useCallback(
    async (index: number) => {
      if (index <= 0) return;
      const reordered = [...tripPlaces];
      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
      await reorderTripPlaces(tripId, reordered.map((tp) => tp.id));
      setTripPlaces(reordered);
    },
    [tripId, tripPlaces]
  );

  const moveDown = useCallback(
    async (index: number) => {
      if (index >= tripPlaces.length - 1) return;
      const reordered = [...tripPlaces];
      [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
      await reorderTripPlaces(tripId, reordered.map((tp) => tp.id));
      setTripPlaces(reordered);
    },
    [tripId, tripPlaces]
  );

  const toggleVisited = useCallback(
    async (tp: TripPlaceWithPlace) => {
      const visited = !tp.visited;
      const visitDate = visited ? new Date().toISOString().slice(0, 10) : null;
      await updateTripPlace(tp.id, { visited, visitDate });
      setTripPlaces((prev) =>
        prev.map((p) =>
          p.id === tp.id ? { ...p, visited, visitDate } : p
        )
      );
    },
    []
  );

  const updateNotes = useCallback(
    async (tp: TripPlaceWithPlace, notes: string) => {
      await updateTripPlace(tp.id, { notes });
      setTripPlaces((prev) =>
        prev.map((p) => (p.id === tp.id ? { ...p, notes } : p))
      );
    },
    []
  );

  const updateVisitDate = useCallback(
    async (tp: TripPlaceWithPlace, visitDate: string | null) => {
      await updateTripPlace(tp.id, { visitDate });
      setTripPlaces((prev) =>
        prev.map((p) => (p.id === tp.id ? { ...p, visitDate } : p))
      );
    },
    []
  );

  const addPhotoToTripPlace = useCallback(
    async (tripPlaceId: number, picker: () => Promise<string | null>) => {
      const path = await picker();
      if (!path) return;
      try {
        const photo = await addTripPlacePhoto(tripPlaceId, path);
        if (photo) {
          setPhotosByTripPlace((prev) => ({
            ...prev,
            [tripPlaceId]: [...(prev[tripPlaceId] ?? []), photo],
          }));
        }
      } catch (err) {
        console.error('Ошибка добавления фото:', err);
      }
    },
    []
  );

  const deletePhoto = useCallback(
    async (tripPlaceId: number, photoId: number) => {
      await deleteTripPlacePhoto(photoId);
      setPhotosByTripPlace((prev) => ({
        ...prev,
        [tripPlaceId]: (prev[tripPlaceId] ?? []).filter((p) => p.id !== photoId),
      }));
    },
    []
  );

  const goToNewPlace = () => {
    setAddModalVisible(false);
    router.push({
      pathname: '/places/new',
      params: { returnTo: `/trips/${tripId}` },
    });
  };

  if (loading || !trip) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Поездка" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={trip.title}
          subtitle={`${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}`}
        />
      </Appbar.Header>

      <View style={styles.modeRow}>
        <SegmentedButtons
          value={viewMode}
          onValueChange={(v) => setViewMode(v as 'plan' | 'diary')}
          buttons={[
            { value: 'plan', label: 'План', icon: 'format-list-numbered' },
            { value: 'diary', label: 'Дневник', icon: 'notebook' },
          ]}
        />
      </View>

      {tripPlaces.length === 0 ? (
        <View style={[styles.scroll, styles.empty]}>
          <Text variant="bodyLarge">Нет мест в маршруте</Text>
          <Text variant="bodyMedium" style={styles.emptyHint}>
            Нажмите + чтобы добавить
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {tripPlaces.map((tp, index) => (
            <Card key={tp.id} mode="elevated" style={styles.card}>
              <Card.Content>
                <View style={styles.itemHeader}>
                  <View style={styles.orderButtons}>
                    <IconButton
                      icon="chevron-up"
                      size={20}
                      onPress={() => moveUp(index)}
                      disabled={index === 0}
                    />
                    <IconButton
                      icon="chevron-down"
                      size={20}
                      onPress={() => moveDown(index)}
                      disabled={index === tripPlaces.length - 1}
                    />
                  </View>
                  <View style={styles.itemMain}>
                    {viewMode === 'plan' ? (
                      <Pressable
                        style={styles.tappableArea}
                        onPress={() => router.push(`/places/${tp.placeId}`)}
                      >
                        <View style={styles.planRow}>
                          <Text variant="labelLarge" style={styles.planNumber}>
                            {index + 1}.
                          </Text>
                          <Text variant="titleMedium" style={styles.placeName}>
                            {tp.place.name}
                          </Text>
                        </View>
                      </Pressable>
                    ) : (
                      <>
                        <Pressable
                          style={styles.tappableArea}
                          onPress={() => setExpandedId(expandedId === tp.id ? null : tp.id)}
                        >
                          <View style={styles.checkboxRow}>
                            <Checkbox
                              status={tp.visited ? 'checked' : 'unchecked'}
                              onPress={() => toggleVisited(tp)}
                              color={theme.colors.primary}
                            />
                            <Text variant="titleMedium" style={[styles.placeName, tp.visited && styles.visitedText]}>
                              {tp.place.name}
                            </Text>
                            {tp.visited && tp.visitDate && (
                              <Text variant="bodySmall" style={styles.visitDateBadge}>
                                {formatDate(tp.visitDate)}
                              </Text>
                            )}
                          </View>
                        </Pressable>
                        {expandedId === tp.id && (
                      <View style={styles.expanded}>
                        <View style={styles.dateRow}>
                          <Text variant="labelMedium">Дата визита:</Text>
                          <TextInput
                            mode="outlined"
                            value={tp.visitDate ?? ''}
                            onChangeText={(t) => updateVisitDate(tp, t || null)}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={theme.colors.onSurfaceVariant}
                            style={styles.dateInput}
                          />
                        </View>
                        <TextInput
                          mode="outlined"
                          label="Заметки"
                          value={tp.notes}
                          onChangeText={(t) => updateNotes(tp, t)}
                          multiline
                          numberOfLines={2}
                          style={styles.notesInput}
                        />
                        <View style={styles.photoSection}>
                          <Text variant="labelMedium">Фото</Text>
                          <View style={styles.photoRow}>
                            {(photosByTripPlace[tp.id] ?? []).map((ph) => (
                              <View key={ph.id} style={styles.photoWrap}>
                                <Image
                                  source={{ uri: getPhotoUri(ph.filePath) }}
                                  style={styles.photoThumb}
                                />
                                <IconButton
                                  icon="close-circle"
                                  size={24}
                                  style={styles.removePhoto}
                                  onPress={() => deletePhoto(tp.id, ph.id)}
                                />
                              </View>
                            ))}
                            <Button
                              mode="outlined"
                              icon="image"
                              compact
                              onPress={() => addPhotoToTripPlace(tp.id, pickImage)}
                            >
                              Галерея
                            </Button>
                            {Platform.OS !== 'web' && (
                              <Button
                                mode="outlined"
                                icon="camera"
                                compact
                                onPress={() => addPhotoToTripPlace(tp.id, takePhoto)}
                              >
                                Камера
                              </Button>
                            )}
                          </View>
                        </View>
                      </View>
                        )}
                      </>
                    )}
                  </View>
                  <IconButton
                    icon="delete-outline"
                    size={20}
                    onPress={() => removePlace(tp.id)}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={openAddModal}
        label="Добавить место"
      />

      <Modal
        visible={addModalVisible}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modal}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => setAddModalVisible(false)} />
            <Appbar.Content title="Добавить место" />
          </Appbar.Header>
          <Button
            mode="contained-tonal"
            icon="plus"
            onPress={goToNewPlace}
            style={styles.newPlaceBtn}
          >
            Создать новое место
          </Button>
          <ScrollView style={styles.modalList}>
            {placesToAdd.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyHint}>
                Нет доступных мест. Создайте новое.
              </Text>
            ) : (
              placesToAdd.map((place) => (
                <List.Item
                  key={place.id}
                  title={place.name}
                  description={place.description || undefined}
                  left={(props) => <List.Icon {...props} icon="map-marker" />}
                  onPress={() => addPlace(place)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
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
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  empty: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHint: { opacity: 0.7, marginTop: 8 },
  modeRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: { marginBottom: 12 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planNumber: {
    marginRight: 8,
    opacity: 0.7,
  },
  visitedText: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  visitDateBadge: {
    marginLeft: 8,
    opacity: 0.7,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  orderButtons: {
    marginRight: 4,
  },
  itemMain: { flex: 1 },
  tappableArea: { flex: 1, alignSelf: 'stretch' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeName: { marginLeft: 4 },
  expanded: {
    marginTop: 12,
    marginLeft: 36,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateInput: { flex: 1 },
  notesInput: { marginBottom: 12 },
  photoSection: { marginTop: 8 },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  photoWrap: { position: 'relative' },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modal: { flex: 1 },
  modalList: { flex: 1, padding: 16 },
  newPlaceBtn: { margin: 16 },
});
