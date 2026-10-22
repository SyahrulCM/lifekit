/**
 * LifeKit - Rutinitas Repository
 * Direct SQLite access untuk habits & habit_logs, termasuk dukungan jadwal pengingat (reminders).
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '@/src/core/database/db';
import type {
  Habit,
  HabitLog,
  HabitReminderItem,
  NewHabitPayload,
  UpdateHabitPayload,
  ToggleHabitResult,
} from '../types';

const CREATE_HABITS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  target_days_per_week INTEGER NOT NULL DEFAULT 7,
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_best INTEGER NOT NULL DEFAULT 0,
  reminders_json TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const CREATE_HABIT_LOGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1 CHECK (completed IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (habit_id, date),
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON habit_logs(habit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
`;

let tablesReady: Promise<void> | null = null;

/**
 * Pastikan tabel habits & habit_logs serta kolom reminders_json tersedia.
 */
export function ensureTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      const db = await getDatabase();
      await db.execAsync(`${CREATE_HABITS_TABLE_SQL}\n${CREATE_HABIT_LOGS_TABLE_SQL}`);

      // Migrasi defensif jika tabel habits sudah ada sebelum kolom reminders_json ditambahkan
      try {
        await db.execAsync(`ALTER TABLE habits ADD COLUMN reminders_json TEXT;`);
      } catch {
        // Kolom sudah ada
      }
    })().catch((error) => {
      tablesReady = null;
      throw error;
    });
  }
  return tablesReady;
}

async function getReadyDatabase(): Promise<SQLiteDatabase> {
  await ensureTables();
  return getDatabase();
}

// ==========================================
// Helpers
// ==========================================

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/** Format tanggal lokal menjadi YYYY-MM-DD. */
export function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/**
 * Hitung streak dari kumpulan tanggal selesai.
 */
export function calculateStreak(completedDates: string[], today: string = toDateKey()): number {
  if (completedDates.length === 0) return 0;

  const set = new Set(completedDates);
  let cursor = set.has(today) ? today : shiftDateKey(today, -1);
  let streak = 0;

  while (set.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

function parseRemindersJson(raw: string | null): HabitReminderItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is HabitReminderItem =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.label === 'string' &&
        typeof item.time === 'string' &&
        typeof item.enabled === 'boolean'
    );
  } catch {
    return [];
  }
}

interface HabitRow {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  target_days_per_week: number;
  streak_current: number;
  reminders_json: string | null;
  created_at: string;
}

function mapHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    title: row.title,
    targetDays: Number(row.target_days_per_week),
    streakCount: Number(row.streak_current),
    icon: row.icon,
    color: row.color,
    reminders: parseRemindersJson(row.reminders_json),
    createdAt: row.created_at,
  };
}

async function getCompletedDates(db: SQLiteDatabase, habitId: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>(
    `SELECT date FROM habit_logs WHERE habit_id = ? AND completed = 1 ORDER BY date DESC;`,
    habitId
  );
  return rows.map((r) => r.date);
}

async function recalculateStreak(db: SQLiteDatabase, habitId: string): Promise<number> {
  const dates = await getCompletedDates(db, habitId);
  const streak = calculateStreak(dates);

  await db.runAsync(
    `UPDATE habits
       SET streak_current = ?,
           streak_best = MAX(streak_best, ?)
     WHERE id = ?;`,
    streak,
    streak,
    habitId
  );
  return streak;
}

// ==========================================
// CRUD Habit
// ==========================================

export async function getAll(): Promise<Habit[]> {
  try {
    const db = await getReadyDatabase();
    const habitIds = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM habits WHERE is_archived = 0;`
    );
    for (const { id } of habitIds) {
      await recalculateStreak(db, id);
    }

    const rows = await db.getAllAsync<HabitRow>(`
      SELECT id, title, icon, color, target_days_per_week, streak_current, reminders_json, created_at
      FROM habits
      WHERE is_archived = 0
      ORDER BY created_at ASC;
    `);
    return rows.map(mapHabit);
  } catch (error) {
    console.error('[rutinitasRepository.getAll] Gagal mengambil habit:', error);
    return [];
  }
}

export async function insert(payload: NewHabitPayload): Promise<Habit | null> {
  try {
    const db = await getReadyDatabase();
    const id = payload.id ?? generateId('habit');
    const createdAt = payload.createdAt ?? new Date().toISOString();
    const targetDays = Math.min(7, Math.max(1, Math.round(payload.targetDays ?? 7)));
    const frequency = targetDays === 7 ? 'daily' : 'weekly';
    const reminders = payload.reminders ?? [];
    const remindersJson = reminders.length > 0 ? JSON.stringify(reminders) : null;

    await db.runAsync(
      `INSERT INTO habits (id, title, icon, color, frequency, target_days_per_week, streak_current, streak_best, reminders_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?);`,
      id,
      payload.title.trim(),
      payload.icon ?? null,
      payload.color ?? null,
      frequency,
      targetDays,
      remindersJson,
      createdAt,
      createdAt
    );

    return {
      id,
      title: payload.title.trim(),
      targetDays,
      streakCount: 0,
      icon: payload.icon ?? null,
      color: payload.color ?? null,
      reminders,
      createdAt,
    };
  } catch (error) {
    console.error('[rutinitasRepository.insert] Gagal menambah habit:', error);
    return null;
  }
}

export async function update(id: string, changes: UpdateHabitPayload): Promise<boolean> {
  try {
    const db = await getReadyDatabase();
    const sets: string[] = [];
    const values: (string | number | null)[] = [];

    if (changes.title !== undefined) {
      sets.push('title = ?');
      values.push(changes.title.trim());
    }
    if (changes.targetDays !== undefined) {
      const target = Math.min(7, Math.max(1, Math.round(changes.targetDays)));
      sets.push('target_days_per_week = ?', 'frequency = ?');
      values.push(target, target === 7 ? 'daily' : 'weekly');
    }
    if (changes.icon !== undefined) {
      sets.push('icon = ?');
      values.push(changes.icon);
    }
    if (changes.color !== undefined) {
      sets.push('color = ?');
      values.push(changes.color);
    }
    if (changes.reminders !== undefined) {
      sets.push('reminders_json = ?');
      values.push(
        changes.reminders && changes.reminders.length > 0
          ? JSON.stringify(changes.reminders)
          : null
      );
    }

    if (sets.length === 0) return false;

    const result = await db.runAsync(
      `UPDATE habits SET ${sets.join(', ')} WHERE id = ?;`,
      ...values,
      id
    );
    return result.changes > 0;
  } catch (error) {
    console.error(`[rutinitasRepository.update] Gagal mengubah habit ${id}:`, error);
    return false;
  }
}

export async function remove(id: string): Promise<boolean> {
  try {
    const db = await getReadyDatabase();
    await db.runAsync(`DELETE FROM habit_logs WHERE habit_id = ?;`, id);
    const result = await db.runAsync(`DELETE FROM habits WHERE id = ?;`, id);
    return result.changes > 0;
  } catch (error) {
    console.error(`[rutinitasRepository.remove] Gagal menghapus habit ${id}:`, error);
    return false;
  }
}

// ==========================================
// Logs
// ==========================================

export async function getLogsByDate(date: string = toDateKey()): Promise<HabitLog[]> {
  try {
    const db = await getReadyDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      habit_id: string;
      date: string;
      completed: number;
    }>(
      `SELECT id, habit_id, date, completed FROM habit_logs WHERE date = ?;`,
      date
    );
    return rows.map((r) => ({
      id: r.id,
      habitId: r.habit_id,
      date: r.date,
      completed: r.completed === 1,
    }));
  } catch (error) {
    console.error('[rutinitasRepository.getLogsByDate] Gagal mengambil log:', error);
    return [];
  }
}

export async function toggleToday(habitId: string): Promise<ToggleHabitResult | null> {
  try {
    const db = await getReadyDatabase();
    const today = toDateKey();

    const existing = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?;`,
      habitId,
      today
    );

    let completed: boolean;
    if (existing) {
      await db.runAsync(`DELETE FROM habit_logs WHERE id = ?;`, existing.id);
      completed = false;
    } else {
      await db.runAsync(
        `INSERT INTO habit_logs (id, habit_id, date, completed) VALUES (?, ?, ?, 1);`,
        generateId('hlog'),
        habitId,
        today
      );
      completed = true;
    }

    const streakCount = await recalculateStreak(db, habitId);
    return { completed, streakCount };
  } catch (error) {
    console.error(`[rutinitasRepository.toggleToday] Gagal toggle habit ${habitId}:`, error);
    return null;
  }
}

export const rutinitasRepository = {
  ensureTables,
  getAll,
  insert,
  update,
  delete: remove,
  getLogsByDate,
  toggleToday,
  calculateStreak,
  toDateKey,
};

export default rutinitasRepository;
