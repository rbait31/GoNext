/**
 * Сервис геолокации — получение текущих координат
 */
import * as Location from 'expo-location';

export interface CoordsResult {
  lat: number;
  lng: number;
}

/**
 * Получить текущие координаты (GPS).
 * Запрашивает разрешение при необходимости.
 * На web использует browser geolocation.
 * @returns { lat, lng } или null при отказе/ошибке
 */
export async function getCurrentCoords(): Promise<CoordsResult | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (err) {
    console.error('Ошибка геолокации:', err);
    return null;
  }
}
