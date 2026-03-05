import { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import {
  Appbar,
  Button,
  Switch,
  TextInput,
  useTheme,
  Text,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ScreenBackground } from '@/components/ScreenBackground';
import { createTrip } from '@/lib/dal';

export default function NewTripScreen() {
  const router = useRouter();
  const theme = useTheme();

  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [current, setCurrent] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Введите название поездки');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const trip = await createTrip({
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        current,
      });
      router.replace(`/trips/${trip.id}`);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(
        Platform.OS === 'web'
          ? 'БД недоступна на web. Используйте приложение на устройстве.'
          : 'Не удалось сохранить'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground style={styles.container}>
      <Appbar.Header style={!theme.dark ? styles.appbar : undefined}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новая поездка" />
      </Appbar.Header>

      <ScrollView style={styles.content} contentContainerStyle={styles.form}>
        <TextInput
          label="Название *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        <TextInput
          label="Дата начала"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={styles.input}
        />
        <TextInput
          label="Дата окончания"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={styles.input}
        />
        <View style={styles.row}>
          <Switch
            value={current}
            onValueChange={setCurrent}
            color={theme.colors.primary}
          />
          <Button mode="text" onPress={() => setCurrent(!current)}>
            Текущая поездка
          </Button>
        </View>

        {error ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
            {error}
          </Text>
        ) : null}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Создать
        </Button>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  appbar: { backgroundColor: 'transparent' },
  content: { flex: 1 },
  form: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: { marginTop: 8 },
});
