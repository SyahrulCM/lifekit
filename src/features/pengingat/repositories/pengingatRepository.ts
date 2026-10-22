/**
 * LifeKit - Pengingat (Subscription & Bill Tracker) SQLite Repository
 * Mengelola tabel `subscriptions` beserta perhitungan jatuh tempo terdekat.
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '@/src/core/database/db';
import type {
  Subscription,
  UpcomingBill,
  BillingCycle,
  NewSubscriptionPayload,
  UpdateSubscriptionPayload,
} from '../types';

const CREATE_SUBSCRIPTIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  due_day INTEGER NOT NULL DEFAULT 1 CHECK (due_day >= 1 AND due_day <= 31),
  due_month INTEGER,
  category TEXT NOT NULL DEFAULT 'Other',
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  icon TEXT,
  color TEXT,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_due_day ON subscriptions(due_day ASC);
`;

let tablesReady: Promise<void> | null = null;

/**
 * Pastikan tabel `subscriptions` beserta indeksnya tersedia di SQLite.
 */
export function ensureTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      const db = await getDatabase();
      await db.execAsync(CREATE_SUBSCRIPTIONS_TABLE_SQL);
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

function generateId(prefix: string = 'sub'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function clampDueDay(day: number): number {
  return Math.min(31, Math.max(1, Math.round(day || 1)));
}

/**
 * Sesuaikan tanggal jatuh tempo dengan jumlah hari maksimal pada bulan tersebut (misal Feb 28/29).
 */
function getValidDateForMonth(year: number, monthZeroIndexed: number, dueDay: number): Date {
  const maxDayInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  const actualDay = Math.min(clampDueDay(dueDay), maxDayInMonth);
  return new Date(year, monthZeroIndexed, actualDay);
}

function toIsoDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDaysRemainingLabel(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/**
 * Hitung tanggal jatuh tempo berikutnya dan sisa hari dari sebuah Subscription.
 */
export function computeUpcomingBill(
  sub: Subscription,
  referenceDate: Date = new Date()
): UpcomingBill {
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  let nextDue: Date;

  if (sub.billingCycle === 'yearly') {
    const targetMonth =
      sub.dueMonth && sub.dueMonth >= 1 && sub.dueMonth <= 12
        ? sub.dueMonth - 1
        : new Date(sub.createdAt).getMonth() || currentMonth;

    const candidateThisYear = getValidDateForMonth(
      currentYear,
      targetMonth,
      sub.dueDay
    );
    if (candidateThisYear.getTime() >= today.getTime()) {
      nextDue = candidateThisYear;
    } else {
      nextDue = getValidDateForMonth(currentYear + 1, targetMonth, sub.dueDay);
    }
  } else {
    const candidateThisMonth = getValidDateForMonth(
      currentYear,
      currentMonth,
      sub.dueDay
    );
    if (candidateThisMonth.getTime() >= today.getTime()) {
      nextDue = candidateThisMonth;
    } else {
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const nextMonthIndex = (currentMonth + 1) % 12;
      nextDue = getValidDateForMonth(
        nextMonthYear,
        nextMonthIndex,
        sub.dueDay
      );
    }
  }

  const diffMs = nextDue.getTime() - today.getTime();
  const daysUntilDue = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  return {
    ...sub,
    nextDueDate: toIsoDateKey(nextDue),
    daysUntilDue,
    daysRemainingLabel: formatDaysRemainingLabel(daysUntilDue),
  };
}

/**
 * Hitung total komitmen pengeluaran bulanan dari seluruh langganan aktif.
 * Langganan tahunan dinormalisasi ke biaya per bulan (amount / 12).
 */
export function calculateTotalMonthlyCommitment(
  subscriptions: Subscription[]
): number {
  return subscriptions.reduce((sum, sub) => {
    if (!sub.isActive) return sum;
    const monthlyEquivalent =
      sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
    return sum + monthlyEquivalent;
  }, 0);
}

interface SubscriptionRow {
  id: string;
  name: string;
  amount: number;
  billing_cycle: BillingCycle;
  due_day: number;
  due_month: number | null;
  category: string;
  reminder_days_before: number;
  icon: string | null;
  color: string | null;
  is_active: number;
  created_at: string;
}

function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    billingCycle: row.billing_cycle,
    dueDay: Number(row.due_day),
    dueMonth: row.due_month !== null ? Number(row.due_month) : null,
    category: row.category,
    reminderDaysBefore: Number(row.reminder_days_before),
    icon: row.icon,
    color: row.color,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

// ==========================================
// CRUD Subscriptions
// ==========================================

export async function getAll(): Promise<Subscription[]> {
  try {
    const db = await getReadyDatabase();
    const rows = await db.getAllAsync<SubscriptionRow>(`
      SELECT
        id,
        name,
        amount,
        billing_cycle,
        due_day,
        due_month,
        category,
        reminder_days_before,
        icon,
        color,
        is_active,
        created_at
      FROM subscriptions
      ORDER BY is_active DESC, due_day ASC, name ASC;
    `);
    return rows.map(mapSubscription);
  } catch (error) {
    console.error('[pengingatRepository.getAll] Gagal mengambil daftar langganan:', error);
    return [];
  }
}

export async function insert(
  payload: NewSubscriptionPayload
): Promise<Subscription | null> {
  try {
    const db = await getReadyDatabase();
    const id = payload.id ?? generateId('sub');
    const createdAt = payload.createdAt ?? new Date().toISOString();
    const billingCycle: BillingCycle = payload.billingCycle ?? 'monthly';
    const dueDay = clampDueDay(payload.dueDay);
    const dueMonth = payload.dueMonth ?? null;
    const category = (payload.category ?? 'Other').trim() || 'Other';
    const reminderDaysBefore = Math.max(0, Math.round(payload.reminderDaysBefore ?? 3));
    const isActive = payload.isActive ?? true;

    await db.runAsync(
      `INSERT INTO subscriptions (
        id, name, amount, billing_cycle, due_day, due_month, category,
        reminder_days_before, icon, color, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      id,
      payload.name.trim(),
      Number(payload.amount),
      billingCycle,
      dueDay,
      dueMonth,
      category,
      reminderDaysBefore,
      payload.icon ?? null,
      payload.color ?? null,
      isActive ? 1 : 0,
      createdAt,
      createdAt
    );

    return {
      id,
      name: payload.name.trim(),
      amount: Number(payload.amount),
      billingCycle,
      dueDay,
      dueMonth,
      category,
      reminderDaysBefore,
      icon: payload.icon ?? null,
      color: payload.color ?? null,
      isActive,
      createdAt,
    };
  } catch (error) {
    console.error('[pengingatRepository.insert] Gagal menambah langganan:', error);
    return null;
  }
}

export async function update(
  id: string,
  changes: UpdateSubscriptionPayload
): Promise<boolean> {
  try {
    const db = await getReadyDatabase();
    const sets: string[] = [];
    const values: (string | number | null)[] = [];

    if (changes.name !== undefined) {
      sets.push('name = ?');
      values.push(changes.name.trim());
    }
    if (changes.amount !== undefined) {
      sets.push('amount = ?');
      values.push(Number(changes.amount));
    }
    if (changes.billingCycle !== undefined) {
      sets.push('billing_cycle = ?');
      values.push(changes.billingCycle);
    }
    if (changes.dueDay !== undefined) {
      sets.push('due_day = ?');
      values.push(clampDueDay(changes.dueDay));
    }
    if (changes.dueMonth !== undefined) {
      sets.push('due_month = ?');
      values.push(changes.dueMonth);
    }
    if (changes.category !== undefined) {
      sets.push('category = ?');
      values.push(changes.category.trim() || 'Other');
    }
    if (changes.reminderDaysBefore !== undefined) {
      sets.push('reminder_days_before = ?');
      values.push(Math.max(0, Math.round(changes.reminderDaysBefore)));
    }
    if (changes.icon !== undefined) {
      sets.push('icon = ?');
      values.push(changes.icon);
    }
    if (changes.color !== undefined) {
      sets.push('color = ?');
      values.push(changes.color);
    }
    if (changes.isActive !== undefined) {
      sets.push('is_active = ?');
      values.push(changes.isActive ? 1 : 0);
    }

    if (sets.length === 0) return false;

    sets.push(`updated_at = datetime('now')`);

    const result = await db.runAsync(
      `UPDATE subscriptions SET ${sets.join(', ')} WHERE id = ?;`,
      ...values,
      id
    );
    return result.changes > 0;
  } catch (error) {
    console.error(`[pengingatRepository.update] Gagal mengubah langganan ${id}:`, error);
    return false;
  }
}

export async function remove(id: string): Promise<boolean> {
  try {
    const db = await getReadyDatabase();
    const result = await db.runAsync(`DELETE FROM subscriptions WHERE id = ?;`, id);
    return result.changes > 0;
  } catch (error) {
    console.error(`[pengingatRepository.remove] Gagal menghapus langganan ${id}:`, error);
    return false;
  }
}

/**
 * Ambil daftar tagihan aktif yang diurutkan dari tanggal jatuh tempo terdekat dengan hari ini.
 */
export async function getUpcomingBills(
  referenceDate: Date = new Date()
): Promise<UpcomingBill[]> {
  const all = await getAll();
  return all
    .filter((sub) => sub.isActive)
    .map((sub) => computeUpcomingBill(sub, referenceDate))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue || a.dueDay - b.dueDay);
}

export const pengingatRepository = {
  ensureTables,
  getAll,
  insert,
  update,
  delete: remove,
  getUpcomingBills,
  computeUpcomingBill,
  calculateTotalMonthlyCommitment,
};

export default pengingatRepository;
