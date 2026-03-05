import { StyleSheet, View, Pressable } from 'react-native';
import { Appbar, Text, List, Switch, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useThemeMode } from '@/lib/ThemeContext';
import { ScreenBackground } from '@/components/ScreenBackground';
import { PRIMARY_COLORS } from '@/lib/themeStore';

const CIRCLE_SIZE = 40;
const CIRCLE_GAP = 12;

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { themeMode, setThemeMode, primaryColorIndex, setPrimaryColorIndex } =
    useThemeMode();

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Настройки" />
      </Appbar.Header>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>Оформление</List.Subheader>
          <List.Item
            title="Тёмная тема"
            left={(props) => <List.Icon {...props} icon="weather-night" />}
            right={() => (
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
                color={theme.colors.primary}
              />
            )}
          />
          <View style={styles.colorSection}>
            <Text variant="labelLarge" style={styles.colorLabel}>
              Оттенок тёмной темы
            </Text>
            <View style={styles.colorRow}>
              {PRIMARY_COLORS.map((hex, index) => (
                <Pressable
                  key={hex}
                  onPress={() => setPrimaryColorIndex(index)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: hex,
                      borderWidth: primaryColorIndex === index ? 3 : 0,
                      borderColor:
                        primaryColorIndex === index
                          ? theme.colors.outline
                          : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
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
  colorSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  colorLabel: {
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CIRCLE_GAP,
  },
  colorCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
});
