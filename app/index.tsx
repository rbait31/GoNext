import { StyleSheet, View, ImageBackground } from 'react-native';
import { BACKGROUND_IMAGE } from '@/lib/backgroundAsset';
import { Appbar, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.container}
      resizeMode="cover"
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={() => router.push('/places')}
          style={styles.button}
          icon="map-marker"
        >
          Места
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/trips')}
          style={styles.button}
          icon="map"
        >
          Поездки
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/next')}
          style={styles.button}
          icon="compass"
        >
          Следующее место
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/settings')}
          style={styles.button}
          icon="cog"
        >
          Настройки
        </Button>
      </View>
    </ImageBackground>
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
