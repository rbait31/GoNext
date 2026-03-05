import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Image,
  Platform,
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
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { createPlace, addPlacePhoto } from '@/lib/dal';
import { getAndClearMapSelection } from '@/lib/selectionStore';
import { pickImage, takePhoto, getPhotoUri } from '@/lib/photoService';
import { parseDD, formatDD } from '@/lib/coordsUtils';
import { getCurrentCoords } from '@/lib/locationService';

export default function NewPlaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string }>();
  const theme = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [coords, setCoords] = useState('');
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
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

  const handlePickPhoto = async () => {
    const path = await pickImage();
    if (path) setPhotoPaths((p) => [...p, path]);
  };

  const handleTakePhoto = async () => {
    const path = await takePhoto();
    if (path) setPhotoPaths((p) => [...p, path]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoPaths((p) => p.filter((_, i) => i !== index));
  };

  const handlePickOnMap = () => {
    const parsed = parseDD(coords);
    const lat = parsed?.lat ?? 55.7558;
    const lng = parsed?.lng ?? 37.6173;
    router.push(`/places/map-picker?lat=${lat}&lng=${lng}`);
  };

  const handleMyLocation = async () => {
    setError('');
    const result = await getCurrentCoords();
    if (result) {
      setCoords(formatDD(result.lat, result.lng));
    } else {
      setError('Не удалось получить координаты. Разрешите доступ к геолокации.');
    }
  };

  const handleSave = async () => {
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
      const place = await createPlace({
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        lat: parsed.lat,
        lng: parsed.lng,
      });
      for (const path of photoPaths) {
        await addPlacePhoto(place.id, path);
      }
      const returnTo = params.returnTo;
      if (returnTo && typeof returnTo === 'string') {
        router.replace(returnTo as '/trips/[id]');
      } else {
        router.replace(`/places/${place.id}`);
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(
        Platform.OS === 'web'
          ? 'БД недоступна на web. Используйте приложение на устройстве.'
          : 'Не удалось сохранить'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новое место" />
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

        <View style={styles.coordBlock}>
          <Text
            variant="labelLarge"
            style={[styles.coordLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Координаты (DD)
          </Text>
          <TextInput
            value={coords}
            onChangeText={setCoords}
            mode="outlined"
            placeholder="55.7558, 37.6173"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.input}
          />
        </View>
        <View style={styles.coordButtons}>
          <Button
            mode="outlined"
            icon="map-marker"
            onPress={handlePickOnMap}
            style={[styles.input, styles.coordButton]}
          >
            Выбрать на карте
          </Button>
          <Button
            mode="outlined"
            icon="crosshairs-gps"
            onPress={handleMyLocation}
            style={[styles.input, styles.coordButton]}
          >
            Моё местоположение
          </Button>
        </View>

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
        {photoPaths.length > 0 && (
          <ScrollView horizontal style={styles.photoScroll}>
            {photoPaths.map((path, i) => (
              <View key={i} style={styles.photoItem}>
                <Image
                  source={{ uri: getPhotoUri(path) }}
                  style={styles.thumbnail}
                />
                <IconButton
                  icon="close-circle"
                  size={24}
                  onPress={() => handleRemovePhoto(i)}
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
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  content: { flex: 1 },
  form: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  coordBlock: { marginBottom: 12 },
  coordLabel: { marginBottom: 4 },
  coordButtons: { marginBottom: 12 },
  coordButton: { marginBottom: 8 },
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
