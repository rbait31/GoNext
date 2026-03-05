import { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Linking,
  Platform,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Card,
  Chip,
  Text,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { BACKGROUND_IMAGE } from '@/lib/backgroundAsset';
import { getPlaceById, getPlacePhotos } from '@/lib/dal';
import type { PlacePhoto } from '@/lib/dal';
import { getPhotoUri } from '@/lib/photoService';
import type { Place } from '@/lib/types';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function openInMap(lat: number, lng: number) {
  const url =
    Platform.OS === 'ios'
      ? `maps://?q=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(
      `https://www.google.com/maps?q=${lat},${lng}`
    ).catch(console.error);
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

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullScreenPhotoUri, setFullScreenPhotoUri] = useState<string | null>(null);

  const placeId = id ? parseInt(String(id), 10) : NaN;

  const loadPlace = useCallback(async () => {
    if (isNaN(placeId)) {
      setError('Неверный ID места');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [p, photoList] = await Promise.all([
        getPlaceById(placeId),
        getPlacePhotos(placeId),
      ]);
      setPlace(p);
      setPhotos(photoList);
    } catch (err) {
      console.error('Ошибка загрузки места:', err);
      setError(
        Platform.OS === 'web'
          ? 'База данных недоступна на web. Используйте приложение на устройстве.'
          : 'Не удалось загрузить место'
      );
      setPlace(null);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useFocusEffect(
    useCallback(() => {
      loadPlace();
    }, [loadPlace])
  );

  const handleEdit = () => {
    router.push(`/places/${placeId}/edit`);
  };

  if (loading) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место" />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ImageBackground>
    );
  }

  if (error || !place) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">{error || 'Место не найдено'}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.chips}>
              {place.visitlater && (
                <Chip icon="map-marker" compact>
                  Посетить позже
                </Chip>
              )}
              {place.liked && (
                <Chip icon="heart" compact>
                  Понравилось
                </Chip>
              )}
            </View>
            {place.description ? (
              <Text variant="bodyLarge" style={styles.description}>
                {place.description}
              </Text>
            ) : null}
            <Text variant="bodySmall" style={styles.date}>
              Добавлено: {formatDate(place.createdAt)}
            </Text>
          </Card.Content>
        </Card>

        {photos.length > 0 && (
          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Фотографии
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((ph) => (
                  <Pressable
                    key={ph.id}
                    onPress={() =>
                      setFullScreenPhotoUri(getPhotoUri(ph.filePath))
                    }
                  >
                    <Image
                      source={{ uri: getPhotoUri(ph.filePath) }}
                      style={styles.photoThumb}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        <Modal
          visible={!!fullScreenPhotoUri}
          transparent
          animationType="fade"
          onRequestClose={() => setFullScreenPhotoUri(null)}
        >
          <View style={styles.fullScreenOverlay}>
            <Appbar.Header style={styles.fullScreenHeader}>
              <Appbar.BackAction
                onPress={() => setFullScreenPhotoUri(null)}
                color="#fff"
              />
              <Appbar.Content title="" />
            </Appbar.Header>
            <Pressable
              style={styles.fullScreenImageWrap}
              onPress={() => setFullScreenPhotoUri(null)}
            >
              {fullScreenPhotoUri ? (
                <Image
                  source={{ uri: fullScreenPhotoUri }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              ) : null}
            </Pressable>
          </View>
        </Modal>

        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleSmall">Координаты</Text>
            <Text variant="bodyMedium">
              {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained-tonal"
            icon="map"
            onPress={() => router.push(`/places/${place.id}/map`)}
            style={styles.button}
          >
            Показать на карте
          </Button>
          <Button
            mode="outlined"
            icon="open-in-new"
            onPress={() => openInMap(place.lat, place.lng)}
            style={styles.button}
          >
            Открыть в приложении Карты
          </Button>
          <Button
            mode="contained-tonal"
            icon="navigation"
            onPress={() => openInNavigator(place.lat, place.lng)}
            style={styles.button}
          >
            Маршрут
          </Button>
        </View>
      </ScrollView>
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
    padding: 24,
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  description: {
    marginBottom: 8,
  },
  date: {
    opacity: 0.7,
  },
  actions: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  photoThumb: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  fullScreenHeader: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1,
  },
  fullScreenImageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
