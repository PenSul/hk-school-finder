import type { SQLiteDatabase } from "expo-sqlite";

const CURRENT_SCHEMA_VERSION = 1;

/**
 * Runs schema migrations if needed. Called after createTables.
 * Version 1 is the initial schema -- no migrations needed yet.
 */
export async function migrateIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db
    .getFirstAsync<{ value: string }>(
      "SELECT value FROM db_metadata WHERE key = ?",
      "schema_version"
    )
    .catch(() => null);

  const version = row ? parseInt(row.value, 10) : 0;

  if (version < CURRENT_SCHEMA_VERSION) {
    await db.runAsync(
      "INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)",
      "schema_version",
      String(CURRENT_SCHEMA_VERSION)
    );
  }
}
