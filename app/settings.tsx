import { StyleSheet, View } from 'react-native';
import { Appbar, Text, List, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useThemeMode } from '@/lib/ThemeContext';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={theme.dark ? undefined : styles.appbar}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>Оформление</List.Subheader>
          <List.Item
            title="Светлая тема"
            description="Фоновое изображение на экранах"
            left={(props) => <List.Icon {...props} icon="weather-sunny" />}
            right={(props) =>
              themeMode === 'light' ? (
                <List.Icon {...props} icon="check" color={theme.colors.primary} />
              ) : null
            }
            onPress={() => setThemeMode('light')}
          />
          <List.Item
            title="Тёмная тема"
            description="Без фонового изображения"
            left={(props) => <List.Icon {...props} icon="weather-night" />}
            right={(props) =>
              themeMode === 'dark' ? (
                <List.Icon {...props} icon="check" color={theme.colors.primary} />
              ) : null
            }
            onPress={() => setThemeMode('dark')}
          />
        </List.Section>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  content: {
    flex: 1,
    paddingTop: 8,
  },
});
