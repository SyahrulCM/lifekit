/**
 * LifeKit SQLite Database Connection & Initialization
 * Utilizes expo-sqlite (openDatabaseAsync) with WAL mode and schema setup.
 */

import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

export const DATABASE_NAME = 'lifekit.db';

let dbInstance: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Executes schema creation, indexes, triggers, and enables WAL mode on a database instance.
 * Can be used standalone or as the onInit callback for Expo's SQLiteProvider.
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    ${SCHEMA_SQL}
  `);

  // Defensive migration: ensure wallet column exists for existing database instances
  try {
    await db.execAsync(`ALTER TABLE transactions ADD COLUMN wallet TEXT NOT NULL DEFAULT 'Cash';`);
  } catch {
    // Column already exists or table freshly created
  }
}

/**
 * Returns the singleton SQLiteDatabase instance.
 * Automatically initializes tables and indexes on first connection using openDatabaseAsync.
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await openDatabaseAsync(DATABASE_NAME);
      await initDatabase(db);
      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Closes and resets the current active database connection instance.
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.closeAsync();
    dbInstance = null;
    initPromise = null;
  }
}
