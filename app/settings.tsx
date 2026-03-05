import { StyleSheet, View, ImageBackground } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { BACKGROUND_IMAGE } from '@/lib/backgroundAsset';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="bodyLarge">Настройки приложения</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  content: {
    flex: 1,
    padding: 24,
  },
});
