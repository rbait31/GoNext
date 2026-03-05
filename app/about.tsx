import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';

export default function AboutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('about.title')} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="bodyLarge" style={styles.description}>
          {t('about.description')}
        </Text>
        <Text variant="labelMedium" style={styles.version}>
          {t('settings.version')}: {version}
        </Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    lineHeight: 24,
  },
  version: {
    marginTop: 24,
    opacity: 0.7,
  },
});
