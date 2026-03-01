import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездка" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="bodyLarge">Детали поездки (id: {id})</Text>
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
