import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Appbar,
  Button,
  Switch,
  TextInput,
  useTheme,
  IconButton,
  Text,
} from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  getPlaceById,
  updatePlace,
  getPlacePhotos,
  addPlacePhoto,
  deletePlacePhoto,
} from '@/lib/dal';
import type { PlacePhoto } from '@/lib/dal';
import { getAndClearMapSelection } from '@/lib/selectionStore';
import { pickImage, takePhoto, getPhotoUri } from '@/lib/photoService';
import { parseDD, formatDD } from '@/lib/coordsUtils';

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const placeId = id ? parseInt(String(id), 10) : NaN;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [coords, setCoords] = useState('0, 0');
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      const selection = getAndClearMapSelection();
      if (selection) {
        setCoords(formatDD(selection.lat, selection.lng));
      }
    }, [])
  );

  useEffect(() => {
    if (isNaN(placeId)) {
      setLoading(false);
      return;
    }
    Promise.all([getPlaceById(placeId), getPlacePhotos(placeId)])
      .then(([place, photoList]) => {
        if (place) {
          setName(place.name);
          setDescription(place.description);
          setVisitlater(place.visitlater);
          setLiked(place.liked);
          setCoords(formatDD(place.lat, place.lng));
          setPhotos(photoList);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(
          Platform.OS === 'web'
            ? 'БД недоступна на web.'
            : 'Не удалось загрузить место'
        );
      })
      .finally(() => setLoading(false));
  }, [placeId]);

  const handlePickPhoto = async () => {
    const path = await pickImage();
    if (path && !isNaN(placeId)) {
      const added = await addPlacePhoto(placeId, path);
      if (added) setPhotos((p) => [...p, added]);
    }
  };

  const handleTakePhoto = async () => {
    const path = await takePhoto();
    if (path && !isNaN(placeId)) {
      const added = await addPlacePhoto(placeId, path);
      if (added) setPhotos((p) => [...p, added]);
    }
  };

  const handleRemovePhoto = async (photoId: number) => {
    const ok = await deletePlacePhoto(photoId);
    if (ok) setPhotos((p) => p.filter((ph) => ph.id !== photoId));
  };

  const handlePickOnMap = () => {
    const parsed = parseDD(coords);
    const lat = parsed?.lat ?? 55.7558;
    const lng = parsed?.lng ?? 37.6173;
    router.push(`/places/map-picker?lat=${lat}&lng=${lng}`);
  };

  const handleSave = async () => {
    if (isNaN(placeId)) return;
    if (!name.trim()) {
      setError('Введите название');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const parsed = parseDD(coords);
      if (!parsed) {
        setError('Введите координаты в формате: широта, долгота');
        setSaving(false);
        return;
      }
      await updatePlace(placeId, {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        lat: parsed.lat,
        lng: parsed.lng,
      });
      router.back();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(
        Platform.OS === 'web'
          ? 'БД недоступна на web.'
          : 'Не удалось сохранить'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Редактировать место" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Редактировать место" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.form}>
        <TextInput
          label="Название *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <View style={styles.row}>
          <Switch
            value={visitlater}
            onValueChange={setVisitlater}
            color={theme.colors.primary}
          />
          <Button mode="text" onPress={() => setVisitlater(!visitlater)}>
            Посетить позже
          </Button>
        </View>
        <View style={styles.row}>
          <Switch
            value={liked}
            onValueChange={setLiked}
            color={theme.colors.primary}
          />
          <Button mode="text" onPress={() => setLiked(!liked)}>
            Понравилось
          </Button>
        </View>

        <TextInput
          label="Координаты (DD)"
          value={coords}
          onChangeText={setCoords}
          mode="outlined"
          placeholder="55.7558, 37.6173"
          style={styles.input}
        />
        <Button
          mode="outlined"
          icon="map-marker"
          onPress={handlePickOnMap}
          style={styles.input}
        >
          Выбрать на карте
        </Button>

        <Text variant="titleSmall" style={styles.sectionTitle}>
          Фотографии
        </Text>
        <View style={styles.photoRow}>
          <Button mode="outlined" icon="image" onPress={handlePickPhoto}>
            Галерея
          </Button>
          {Platform.OS !== 'web' && (
            <Button mode="outlined" icon="camera" onPress={handleTakePhoto}>
              Камера
            </Button>
          )}
        </View>
        {photos.length > 0 && (
          <ScrollView horizontal style={styles.photoScroll}>
            {photos.map((ph) => (
              <View key={ph.id} style={styles.photoItem}>
                <Image
                  source={{ uri: getPhotoUri(ph.filePath) }}
                  style={styles.thumbnail}
                />
                <IconButton
                  icon="close-circle"
                  size={24}
                  onPress={() => handleRemovePhoto(ph.id)}
                  style={styles.removePhoto}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {error ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        ) : null}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Сохранить
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1 },
  form: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  photoScroll: { marginBottom: 12 },
  photoItem: { marginRight: 12, position: 'relative' },
  thumbnail: { width: 80, height: 80, borderRadius: 8 },
  removePhoto: { position: 'absolute', top: -8, right: -8 },
  saveButton: { marginTop: 16 },
});
