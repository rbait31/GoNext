import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Text, Snackbar } from 'react-native-paper';

export default function HomeScreen() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const showSnackbar = () => setSnackbarVisible(true);
  const hideSnackbar = () => setSnackbarVisible(false);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.text}>
          Привет, Супер-Тупер!
        </Text>
        <Button mode="contained" onPress={showSnackbar} style={styles.button}>
          Нажми меня
        </Button>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={hideSnackbar}
        duration={2000}
      >
        Хи-хи
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {},
});
