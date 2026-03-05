import { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Linking,
  Platform,
  Image,
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
  useTheme,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import i18n from '@/lib/i18n';
import { ScreenBackground } from '@/components/ScreenBackground';
import { getPlaceById, getPlacePhotos } from '@/lib/dal';
import type { PlacePhoto } from '@/lib/dal';
import { getPhotoUri } from '@/lib/photoService';
import type { Place } from '@/lib/types';

function formatDate(iso: string, locale: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(locale, {
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
  const theme = useTheme();
  const { t } = useTranslation();
  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullScreenPhotoUri, setFullScreenPhotoUri] = useState<string | null>(null);

  const placeId = id ? parseInt(String(id), 10) : NaN;

  const loadPlace = useCallback(async () => {
    if (isNaN(placeId)) {
      setError(t('placeDetail.invalidId'));
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
          ? t('placeDetail.dbErrorWeb')
          : t('placeDetail.dbError')
      );
      setPlace(null);
    } finally {
      setLoading(false);
    }
  }, [placeId, t]);

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
      <ScreenBackground style={styles.container}>
        <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('placeDetail.place')} />
        </Appbar.Header>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenBackground>
    );
  }

  if (error || !place) {
    return (
      <ScreenBackground style={styles.container}>
        <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t('placeDetail.place')} />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">{error || t('placeDetail.placeNotFound')}</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
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
                  {t('placeDetail.visitLater')}
                </Chip>
              )}
              {place.liked && (
                <Chip icon="heart" compact>
                  {t('placeDetail.liked')}
                </Chip>
              )}
            </View>
            {place.description ? (
              <Text variant="bodyLarge" style={styles.description}>
                {place.description}
              </Text>
            ) : null}
            <Text variant="bodySmall" style={styles.date}>
              {t('placeDetail.added')}: {formatDate(place.createdAt, i18n.language === 'en' ? 'en-US' : 'ru-RU')}
            </Text>
          </Card.Content>
        </Card>

        {photos.length > 0 && (
          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                {t('placeDetail.photos')}
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
            <Text variant="titleSmall">{t('placeDetail.coords')}</Text>
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
              {t('placeDetail.showOnMap')}
            </Button>
          <Button
            mode="outlined"
            icon="open-in-new"
            onPress={() => openInMap(place.lat, place.lng)}
            style={styles.button}
            >
              {t('placeDetail.openInMaps')}
            </Button>
          <Button
            mode="contained-tonal"
            icon="navigation"
            onPress={() => openInNavigator(place.lat, place.lng)}
            style={styles.button}
            >
              {t('placeDetail.route')}
            </Button>
        </View>
      </ScrollView>
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
