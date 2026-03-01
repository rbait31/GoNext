/**
 * Web — SQLite не поддерживается (требует WASM).
 * Используется заглушка. На web приложение работает без БД.
 */

export async function getDatabase(): Promise<never> {
  throw new Error(
    'База данных не поддерживается на web. Используйте приложение на iOS или Android.'
  );
}
