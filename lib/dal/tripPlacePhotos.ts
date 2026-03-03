/**
 * Data Access Layer для фотографий мест в поездке (trip_place_photos)
 */

import { getDatabase } from '../db';

export interface TripPlacePhoto {
  id: number;
  tripPlaceId: number;
  filePath: string;
}

/** Получить все фото пункта поездки */
export async function getTripPlacePhotos(tripPlaceId: number): Promise<TripPlacePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripPlacePhoto>(
    'SELECT id, tripPlaceId, filePath FROM trip_place_photos WHERE tripPlaceId = ? ORDER BY id',
    tripPlaceId
  );
  return rows;
}

/** Добавить фото к пункту поездки */
export async function addTripPlacePhoto(
  tripPlaceId: number,
  filePath: string
): Promise<TripPlacePhoto | null> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO trip_place_photos (tripPlaceId, filePath) VALUES (?, ?)',
    tripPlaceId,
    filePath
  );
  const row = await db.getFirstAsync<TripPlacePhoto>(
    'SELECT id, tripPlaceId, filePath FROM trip_place_photos WHERE id = ?',
    result.lastInsertRowId
  );
  return row ?? null;
}

/** Удалить фото */
export async function deleteTripPlacePhoto(photoId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM trip_place_photos WHERE id = ?', photoId);
  return result.changes > 0;
}
