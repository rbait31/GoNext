/**
 * Data Access Layer для Place
 */

import { getDatabase } from '../db';
import type { Place, PlaceInput } from '../types';

interface PlaceRow {
  id: number;
  name: string;
  description: string;
  visitlater: number;
  liked: number;
  lat: number;
  lng: number;
  createdAt: string;
}

function rowToPlace(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visitlater: row.visitlater === 1,
    liked: row.liked === 1,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.createdAt,
  };
}

export async function getAllPlaces(): Promise<Place[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PlaceRow>('SELECT * FROM places ORDER BY createdAt DESC');
  return rows.map(rowToPlace);
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PlaceRow>('SELECT * FROM places WHERE id = ?', id);
  return row ? rowToPlace(row) : null;
}

export async function getPlacesByFilter(filter: 'all' | 'visitlater' | 'liked'): Promise<Place[]> {
  const db = await getDatabase();
  let sql = 'SELECT * FROM places';
  if (filter === 'visitlater') {
    sql += ' WHERE visitlater = 1';
  } else if (filter === 'liked') {
    sql += ' WHERE liked = 1';
  }
  sql += ' ORDER BY createdAt DESC';
  const rows = await db.getAllAsync<PlaceRow>(sql);
  return rows.map(rowToPlace);
}

export async function createPlace(input: PlaceInput): Promise<Place> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO places (name, description, visitlater, liked, lat, lng)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.name,
    input.description,
    input.visitlater ? 1 : 0,
    input.liked ? 1 : 0,
    input.lat,
    input.lng
  );
  const place = await getPlaceById(result.lastInsertRowId);
  if (!place) throw new Error('Failed to create place');
  return place;
}

export async function updatePlace(id: number, input: Partial<PlaceInput>): Promise<Place | null> {
  const existing = await getPlaceById(id);
  if (!existing) return null;

  const db = await getDatabase();
  await db.runAsync(
    `UPDATE places SET
      name = ?, description = ?, visitlater = ?, liked = ?,
      lat = ?, lng = ?
     WHERE id = ?`,
    input.name ?? existing.name,
    input.description ?? existing.description,
    (input.visitlater ?? existing.visitlater) ? 1 : 0,
    (input.liked ?? existing.liked) ? 1 : 0,
    input.lat ?? existing.lat,
    input.lng ?? existing.lng,
    id
  );
  return getPlaceById(id);
}

export async function deletePlace(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM places WHERE id = ?', id);
  return result.changes > 0;
}
