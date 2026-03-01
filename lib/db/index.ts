/**
 * Инициализация и доступ к базе данных.
 * На native — SQLite, на web — заглушка.
 */

import { getDatabase } from './db';

export { getDatabase };
export * from './schema';

/**
 * Выполнить SQL (только native, на web — no-op)
 */
export async function execSql(
  sql: string,
  params: (string | number | null)[] = []
): Promise<void> {
  try {
    const database = await getDatabase();
    await database.runAsync(sql, params);
  } catch {
    // На web getDatabase выбрасывает — игнорируем
  }
}
