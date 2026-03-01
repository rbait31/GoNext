/**
 * Инициализация и доступ к базе данных SQLite
 */

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLiteDatabase | null = null;

/**
 * Получить экземпляр базы данных (с инициализацией при первом вызове)
 */
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

/**
 * Выполнить SQL с параметрами (для отладки/миграций)
 */
export async function execSql(sql: string, params: (string | number | null)[] = []): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(sql, params);
}
