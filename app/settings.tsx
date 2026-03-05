import { StyleSheet, View, Pressable } from 'react-native';
import { Appbar, Text, List, Switch, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useThemeMode } from '@/lib/ThemeContext';
import { ScreenBackground } from '@/components/ScreenBackground';
import { PRIMARY_COLORS } from '@/lib/themeStore';
import i18n from '@/lib/i18n';
import { setLanguage, type Language } from '@/lib/languageStore';

const CIRCLE_SIZE = 40;
const CIRCLE_GAP = 12;

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { themeMode, setThemeMode, primaryColorIndex, setPrimaryColorIndex } =
    useThemeMode();

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
    await i18n.changeLanguage(lang);
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('settings.title')} />
      </Appbar.Header>

      <View style={styles.content}>
        <List.Section>
          <List.Subheader>{t('settings.appearance')}</List.Subheader>
          <List.Item
            title={t('settings.darkTheme')}
            left={(props) => <List.Icon {...props} icon="weather-night" />}
            right={() => (
              <Switch
                value={themeMode === 'dark'}
                onValueChange={(v) => setThemeMode(v ? 'dark' : 'light')}
                color={theme.colors.primary}
              />
            )}
          />
          {themeMode === 'dark' && (
            <View style={styles.colorSection}>
              <Text variant="labelLarge" style={styles.colorLabel}>
                {t('settings.darkThemeShade')}
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
          )}
          <List.Subheader>{t('settings.language')}</List.Subheader>
          <List.Item
            title={t('settings.languageRu')}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) =>
              i18n.language === 'ru' ? (
                <List.Icon {...props} icon="check" color={theme.colors.primary} />
              ) : null
            }
            onPress={() => handleLanguageChange('ru')}
          />
          <List.Item
            title={t('settings.languageEn')}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={(props) =>
              i18n.language === 'en' ? (
                <List.Icon {...props} icon="check" color={theme.colors.primary} />
              ) : null
            }
            onPress={() => handleLanguageChange('en')}
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
