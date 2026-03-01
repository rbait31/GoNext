import { StyleSheet, View } from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={() => router.push('/places/index')}
          style={styles.button}
          icon="map-marker"
        >
          Места
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/trips/index')}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
