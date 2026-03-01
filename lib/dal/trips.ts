/**
 * Data Access Layer для Trip и TripPlace
 */

import { getDatabase } from '../db';
import type { Place, Trip, TripInput, TripPlace, TripPlaceInput, TripPlaceWithPlace } from '../types';
import { getPlaceById } from './places';

interface TripRow {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  current: number;
}

interface TripPlaceRow {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: number;
  visitDate: string | null;
  notes: string;
}

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    createdAt: row.createdAt,
    current: row.current === 1,
  };
}

function rowToTripPlace(row: TripPlaceRow): TripPlace {
  return {
    id: row.id,
    tripId: row.tripId,
    placeId: row.placeId,
    order: row.order,
    visited: row.visited === 1,
    visitDate: row.visitDate,
    notes: row.notes ?? '',
  };
}

/** При создании новой текущей поездки снять флаг current с остальных */
async function ensureSingleCurrent(db: Awaited<ReturnType<typeof getDatabase>>, currentTripId?: number): Promise<void> {
  if (currentTripId) {
    await db.runAsync('UPDATE trips SET current = 0 WHERE id != ?', currentTripId);
  } else {
    await db.runAsync('UPDATE trips SET current = 0');
  }
}

// --- Trip CRUD ---

export async function getAllTrips(): Promise<Trip[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripRow>('SELECT * FROM trips ORDER BY startDate DESC');
  return rows.map(rowToTrip);
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', id);
  return row ? rowToTrip(row) : null;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE current = 1 LIMIT 1');
  return row ? rowToTrip(row) : null;
}

export async function createTrip(input: TripInput): Promise<Trip> {
  const db = await getDatabase();
  if (input.current) {
    await ensureSingleCurrent(db);
  }
  const result = await db.runAsync(
    `INSERT INTO trips (title, description, startDate, endDate, current)
     VALUES (?, ?, ?, ?, ?)`,
    input.title,
    input.description,
    input.startDate,
    input.endDate,
    input.current ? 1 : 0
  );
  const trip = await getTripById(result.lastInsertRowId);
  if (!trip) throw new Error('Failed to create trip');
  return trip;
}

export async function updateTrip(id: number, input: Partial<TripInput>): Promise<Trip | null> {
  const existing = await getTripById(id);
  if (!existing) return null;

  const db = await getDatabase();
  if (input.current) {
    await ensureSingleCurrent(db, id);
  }
  await db.runAsync(
    `UPDATE trips SET
      title = ?, description = ?, startDate = ?, endDate = ?,
      current = ?
     WHERE id = ?`,
    input.title ?? existing.title,
    input.description ?? existing.description,
    input.startDate ?? existing.startDate,
    input.endDate ?? existing.endDate,
    (input.current ?? existing.current) ? 1 : 0,
    id
  );
  return getTripById(id);
}

export async function setTripCurrent(tripId: number): Promise<void> {
  const db = await getDatabase();
  await ensureSingleCurrent(db, tripId);
  await db.runAsync('UPDATE trips SET current = 1 WHERE id = ?', tripId);
}

export async function deleteTrip(id: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM trips WHERE id = ?', id);
  return result.changes > 0;
}

// --- TripPlace CRUD ---

export async function getTripPlaces(tripId: number): Promise<TripPlace[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TripPlaceRow>(
    'SELECT * FROM trip_places WHERE tripId = ? ORDER BY "order" ASC',
    tripId
  );
  return rows.map(rowToTripPlace);
}

export async function getTripPlacesWithPlace(tripId: number): Promise<TripPlaceWithPlace[]> {
  const tripPlaces = await getTripPlaces(tripId);
  const result: TripPlaceWithPlace[] = [];
  for (const tp of tripPlaces) {
    const place = await getPlaceById(tp.placeId);
    if (place) {
      result.push({ ...tp, place });
    }
  }
  return result;
}

export async function addPlaceToTrip(input: TripPlaceInput): Promise<TripPlace> {
  const db = await getDatabase();
  const maxOrderResult = await db.getFirstAsync<{ maxOrder: number | null }>(
    'SELECT MAX("order") as maxOrder FROM trip_places WHERE tripId = ?',
    input.tripId
  );
  const nextOrder = (maxOrderResult?.maxOrder ?? -1) + 1;
  const order = input.order ?? nextOrder;

  const result = await db.runAsync(
    `INSERT INTO trip_places (tripId, placeId, "order", visited, visitDate, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.tripId,
    input.placeId,
    order,
    input.visited ? 1 : 0,
    input.visitDate ?? null,
    input.notes ?? ''
  );
  const row = await db.getFirstAsync<TripPlaceRow>('SELECT * FROM trip_places WHERE id = ?', result.lastInsertRowId);
  if (!row) throw new Error('Failed to create trip place');
  return rowToTripPlace(row);
}

export async function updateTripPlace(id: number, input: Partial<TripPlaceInput>): Promise<TripPlace | null> {
  const db = await getDatabase();
  const existingRow = await db.getFirstAsync<TripPlaceRow>('SELECT * FROM trip_places WHERE id = ?', id);
  if (!existingRow) return null;

  const order = input.order ?? existingRow.order;
  const visited = input.visited !== undefined ? (input.visited ? 1 : 0) : existingRow.visited;
  const visitDate = input.visitDate !== undefined ? input.visitDate : existingRow.visitDate;
  const notes = input.notes ?? existingRow.notes;

  await db.runAsync(
    `UPDATE trip_places SET "order" = ?, visited = ?, visitDate = ?, notes = ? WHERE id = ?`,
    order,
    visited,
    visitDate,
    notes,
    id
  );
  const row = await db.getFirstAsync<TripPlaceRow>('SELECT * FROM trip_places WHERE id = ?', id);
  return row ? rowToTripPlace(row) : null;
}

export async function reorderTripPlaces(tripId: number, orderedIds: number[]): Promise<void> {
  const db = await getDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.runAsync('UPDATE trip_places SET "order" = ? WHERE id = ? AND tripId = ?', i, orderedIds[i], tripId);
  }
}

export async function removePlaceFromTrip(tripPlaceId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync('DELETE FROM trip_places WHERE id = ?', tripPlaceId);
  return result.changes > 0;
}

/** Получить следующее место в текущей поездке (первое с visited = false) */
export async function getNextPlace(): Promise<{ trip: Trip; tripPlace: TripPlaceWithPlace } | null> {
  const currentTrip = await getCurrentTrip();
  if (!currentTrip) return null;

  const tripPlaces = await getTripPlacesWithPlace(currentTrip.id);
  const next = tripPlaces.find((tp) => !tp.visited);
  if (!next) return null;

  return { trip: currentTrip, tripPlace: next };
}
