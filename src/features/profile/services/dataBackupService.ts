/**
 * LifeKit - Offline Data Management & Backup Service
 * Menyediakan fungsi ekspor cadangan JSON, pemulihan data JSON, dan pembersihan seluruh data lokal.
 */

import { getDatabase } from '@/src/core/database/db';
import { cancelScheduledNotification } from '@/src/core/services/notificationService';

export interface BackupDataPayload {
  version: string;
  exportedAt: string;
  data: {
    transactions: any[];
    habits: any[];
    habitLogs: any[];
    subscriptions: any[];
  };
}

/**
 * Mengambil seluruh data dari tabel lokal SQLite dan membentuk string JSON cadangan.
 */
export async function exportBackupJson(): Promise<{
  jsonString: string;
  summary: {
    transactionsCount: number;
    habitsCount: number;
    subscriptionsCount: number;
  };
}> {
  const db = await getDatabase();

  const [transactions, habits, habitLogs, subscriptions] = await Promise.all([
    db.getAllAsync<any>(`SELECT * FROM transactions ORDER BY created_at DESC;`),
    db.getAllAsync<any>(`SELECT * FROM habits ORDER BY created_at DESC;`),
    db.getAllAsync<any>(`SELECT * FROM habit_logs ORDER BY date DESC;`),
    db.getAllAsync<any>(`SELECT * FROM subscriptions ORDER BY created_at DESC;`).catch(() => []),
  ]);

  const payload: BackupDataPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      transactions: transactions ?? [],
      habits: habits ?? [],
      habitLogs: habitLogs ?? [],
      subscriptions: subscriptions ?? [],
    },
  };

  return {
    jsonString: JSON.stringify(payload, null, 2),
    summary: {
      transactionsCount: transactions.length,
      habitsCount: habits.length,
      subscriptionsCount: subscriptions.length,
    },
  };
}

/**
 * Memvalidasi dan memulihkan data dari string JSON cadangan ke dalam database SQLite.
 */
export async function importRestoreJson(
  jsonString: string
): Promise<{ success: boolean; message: string; count: number }> {
  try {
    const parsed: BackupDataPayload = JSON.parse(jsonString);

    if (!parsed || !parsed.data) {
      return {
        success: false,
        message: 'Format data JSON tidak valid atau rusak.',
        count: 0,
      };
    }

    const db = await getDatabase();
    const { transactions = [], habits = [], habitLogs = [], subscriptions = [] } =
      parsed.data;

    let restoredTotal = 0;

    // Masukkan transaksi
    for (const tx of transactions) {
      if (!tx.id || tx.amount == null) continue;
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions (id, amount, type, category, wallet, note, date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          tx.id,
          tx.amount,
          tx.type ?? 'expense',
          tx.category ?? 'Other',
          tx.wallet ?? 'Cash',
          tx.note ?? null,
          tx.date ?? null,
          tx.created_at ?? new Date().toISOString(),
          tx.updated_at ?? new Date().toISOString(),
        ]
      );
      restoredTotal += 1;
    }

    // Masukkan habits
    for (const h of habits) {
      if (!h.id || !h.title) continue;
      await db.runAsync(
        `INSERT OR REPLACE INTO habits (id, title, description, icon, color, frequency, target_days_per_week, streak_current, streak_best, reminders_json, is_archived, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          h.id,
          h.title,
          h.description ?? null,
          h.icon ?? null,
          h.color ?? null,
          h.frequency ?? 'daily',
          h.target_days_per_week ?? 7,
          h.streak_current ?? 0,
          h.streak_best ?? 0,
          h.reminders_json ?? null,
          h.is_archived ?? 0,
          h.created_at ?? new Date().toISOString(),
          h.updated_at ?? new Date().toISOString(),
        ]
      );
      restoredTotal += 1;
    }

    // Masukkan habit logs
    for (const log of habitLogs) {
      if (!log.id || !log.habit_id || !log.date) continue;
      await db.runAsync(
        `INSERT OR REPLACE INTO habit_logs (id, habit_id, date, completed, created_at)
         VALUES (?, ?, ?, ?, ?);`,
        [
          log.id,
          log.habit_id,
          log.date,
          log.completed ?? 1,
          log.created_at ?? new Date().toISOString(),
        ]
      );
    }

    // Masukkan subscriptions
    for (const sub of subscriptions) {
      if (!sub.id || !sub.name) continue;
      await db.runAsync(
        `INSERT OR REPLACE INTO subscriptions (id, name, amount, billing_cycle, due_day, due_month, category, reminder_days_before, icon, color, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          sub.id,
          sub.name,
          sub.amount ?? 0,
          sub.billing_cycle ?? 'monthly',
          sub.due_day ?? 1,
          sub.due_month ?? null,
          sub.category ?? 'Other',
          sub.reminder_days_before ?? 3,
          sub.icon ?? null,
          sub.color ?? null,
          sub.is_active ?? 1,
          sub.created_at ?? new Date().toISOString(),
          sub.updated_at ?? new Date().toISOString(),
        ]
      ).catch(() => {});
      restoredTotal += 1;
    }

    return {
      success: true,
      message: `Berhasil memulihkan ${restoredTotal} data dari berkas cadangan.`,
      count: restoredTotal,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Kesalahan parsing JSON';
    return {
      success: false,
      message: `Gagal membaca berkas cadangan: ${msg}`,
      count: 0,
    };
  }
}

/**
 * Menghapus SELURUH data lokal di perangkat SQLite secara bersih.
 */
export async function clearAllLocalData(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    DELETE FROM transactions;
    DELETE FROM habit_logs;
    DELETE FROM habits;
    DELETE FROM subscriptions;
    DELETE FROM reminders;
  `);

  // Batalkan seluruh notifikasi
  await cancelScheduledNotification('ALL');
}
