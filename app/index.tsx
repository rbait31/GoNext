import { StyleSheet, View } from 'react-native';
import { Appbar, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
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
