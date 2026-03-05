import { StyleSheet, View } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.Content title={t('home.title')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={() => router.push('/places')}
          style={styles.button}
          icon="map-marker"
        >
          {t('home.places')}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/trips')}
          style={styles.button}
          icon="map"
        >
          {t('home.trips')}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/next')}
          style={styles.button}
          icon="compass"
        >
          {t('home.nextPlace')}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/settings')}
          style={styles.button}
          icon="cog"
        >
          {t('home.settings')}
        </Button>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appbar: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 24,
    gap: 16,
  },
  button: {},
});
