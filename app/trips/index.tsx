import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function TripsListScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="bodyLarge">Список поездок</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
  },
});
