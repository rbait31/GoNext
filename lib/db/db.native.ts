/**
 * SQLite — нативная реализация (iOS, Android)
 */

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;

  db = await openDatabaseAsync('gonext.db');

  const versionResult = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = versionResult?.user_version ?? 0;

  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(CREATE_TABLES);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }

  return db;
}
