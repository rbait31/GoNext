import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/places/${id}/edit`);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Место" />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="bodyLarge">Карточка места (id: {id})</Text>
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
