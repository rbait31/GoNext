/**
 * Web-версия выбора координат — только форма ввода (react-native-maps не поддерживает web)
 */
import { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, TextInput, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { setMapSelection } from '@/lib/selectionStore';
import { parseDD, formatDD } from '@/lib/coordsUtils';

export default function MapPickerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const initialLat = parseFloat(params.lat ?? '55.7558') || 55.7558;
  const initialLng = parseFloat(params.lng ?? '37.6173') || 37.6173;

  const [coords, setCoords] = useState(formatDD(initialLat, initialLng));

  const handleConfirm = useCallback(() => {
    const parsed = parseDD(coords);
    if (parsed) {
      setMapSelection(parsed.lat, parsed.lng);
      router.back();
    }
  }, [coords, router]);

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t('mapPickerWeb.title')} />
      </Appbar.Header>
      <View style={styles.webForm}>
        <Text variant="bodyMedium" style={styles.hint}>
          {t('mapPickerWeb.hint')}
        </Text>
        <View style={styles.coordBlock}>
          <Text
            variant="labelLarge"
            style={[styles.coordLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            {t('mapPickerWeb.coords')}
          </Text>
          <TextInput
            value={coords}
            onChangeText={setCoords}
            placeholder={t('placeEdit.coordsPlaceholder')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            mode="outlined"
            style={styles.input}
          />
        </View>
        <Button mode="contained" onPress={handleConfirm}>
          {t('mapPickerWeb.select')}
        </Button>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  webForm: {
    padding: 16,
    gap: 12,
  },
  hint: {
    marginBottom: 8,
    opacity: 0.8,
  },
  coordBlock: { marginBottom: 12 },
  coordLabel: { marginBottom: 4 },
  input: {
    marginBottom: 8,
  },
});
