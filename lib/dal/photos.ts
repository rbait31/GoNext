/**
 * Data Access Layer для фотографий мест (place_photos)
 */

import { getDatabase } from '../db';

export interface PlacePhoto {
  id: number;
  placeId: number;
  filePath: string;
}

/** Получить все фото места */
export async function getPlacePhotos(placeId: number): Promise<PlacePhoto[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlacePhoto>(
    'SELECT id, placeId, filePath FROM place_photos WHERE placeId = ? ORDER BY id',
    placeId
  );
  return rows;
}

/** Добавить фото к месту */
export async function addPlacePhoto(
  placeId: number,
  filePath: string
): Promise<PlacePhoto | null> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO place_photos (placeId, filePath) VALUES (?, ?)',
    placeId,
    filePath
  );
  const row = await db.getFirstAsync<PlacePhoto>(
    'SELECT id, placeId, filePath FROM place_photos WHERE id = ?',
    result.lastInsertRowId
  );
  return row ?? null;
}

/** Удалить фото */
export async function deletePlacePhoto(photoId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM place_photos WHERE id = ?', photoId);
  return result.changes > 0;
}
