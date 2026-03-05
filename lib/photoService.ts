/**
 * Сервис для работы с фотографиями: выбор, съёмка, сохранение
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const PHOTOS_DIR = 'place_photos';

/** Получить путь к директории для фото мест */
function getPhotosDirectory(): string {
  const base = FileSystem.documentDirectory ?? '';
  return `${base}${PHOTOS_DIR}`;
}

/** Создать уникальное имя файла */
function generateFileName(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.jpg`;
}

/** Скопировать файл в постоянное хранилище и вернуть относительный путь */
async function persistImage(uri: string): Promise<string> {
  const dir = getPhotosDirectory();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const fileName = generateFileName();
  const destPath = `${dir}/${fileName}`;

  try {
    await FileSystem.copyAsync({ from: uri, to: destPath });
  } catch (err) {
    // На iOS ph:// URI может не копироваться — пробуем переместить
    try {
      await FileSystem.moveAsync({ from: uri, to: destPath });
    } catch {
      throw err;
    }
  }

  // Храним относительный путь от documentDirectory
  return `${PHOTOS_DIR}/${fileName}`;
}

/** Выбрать фото из галереи. Возвращает путь для сохранения в БД или null */
export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const uri = result.assets[0].uri;

  try {
    return await persistImage(uri);
  } catch (err) {
    console.error('Ошибка сохранения фото:', err);
    return null;
  }
}

/** Сделать фото камерой. Возвращает путь для сохранения в БД или null */
export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const uri = result.assets[0].uri;

  try {
    return await persistImage(uri);
  } catch (err) {
    console.error('Ошибка сохранения фото:', err);
    return null;
  }
}

/** Получить URI для отображения фото (для Image source) */
export function getPhotoUri(filePath: string): string {
  if (filePath.startsWith('file://') || filePath.startsWith('http')) {
    return filePath;
  }
  const base = FileSystem.documentDirectory ?? '';
  const full = `${base}${filePath}`;
  return full.startsWith('file://') ? full : `file://${full}`;
}
