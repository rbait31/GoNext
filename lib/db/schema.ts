/**
 * Схема базы данных GoNext
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
-- Места
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  visitlater INTEGER DEFAULT 1,
  liked INTEGER DEFAULT 0,
  lat REAL NOT NULL DEFAULT 0,
  lng REAL NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Поездки
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  current INTEGER DEFAULT 0
);

-- Места в поездке
CREATE TABLE IF NOT EXISTS trip_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  placeId INTEGER NOT NULL REFERENCES places(id),
  "order" INTEGER NOT NULL DEFAULT 0,
  visited INTEGER DEFAULT 0,
  visitDate TEXT,
  notes TEXT DEFAULT '',
  UNIQUE(tripId, placeId)
);

-- Фотографии мест
CREATE TABLE IF NOT EXISTS place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placeId INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  filePath TEXT NOT NULL
);

-- Фотографии мест в поездке
CREATE TABLE IF NOT EXISTS trip_place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripPlaceId INTEGER NOT NULL REFERENCES trip_places(id) ON DELETE CASCADE,
  filePath TEXT NOT NULL
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_places_visitlater ON places(visitlater);
CREATE INDEX IF NOT EXISTS idx_places_liked ON places(liked);
CREATE INDEX IF NOT EXISTS idx_trips_current ON trips(current);
CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
CREATE INDEX IF NOT EXISTS idx_trip_places_placeId ON trip_places(placeId);
CREATE INDEX IF NOT EXISTS idx_trip_places_visited ON trip_places(tripId, visited);
`;
