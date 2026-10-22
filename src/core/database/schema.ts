/**
 * LifeKit SQLite Database Schema & Types
 * Defines schemas for transactions, habits, and reminders tables.
 */

// ==========================================
// Table Names
// ==========================================
export const TABLES = {
  TRANSACTIONS: 'transactions',
  HABITS: 'habits',
  REMINDERS: 'reminders',
} as const;

// ==========================================
// DDL Statements
// ==========================================

export const CREATE_TRANSACTIONS_TABLE = `
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  wallet TEXT NOT NULL DEFAULT 'Cash' CHECK (wallet IN ('Cash', 'Bank', 'E-Wallet')),
  note TEXT,
  date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_HABITS_TABLE = `
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
  is_archived INTEGER NOT NULL DEFAULT 0 CHECK (is_archived IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_REMINDERS_TABLE = `
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  notification_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export const CREATE_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

CREATE INDEX IF NOT EXISTS idx_habits_is_archived ON habits(is_archived);

CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date ASC);
CREATE INDEX IF NOT EXISTS idx_reminders_is_completed ON reminders(is_completed);
`;

export const CREATE_TRIGGERS = `
CREATE TRIGGER IF NOT EXISTS trg_transactions_updated_at
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
  UPDATE transactions SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_habits_updated_at
AFTER UPDATE ON habits
FOR EACH ROW
BEGIN
  UPDATE habits SET updated_at = datetime('now') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reminders_updated_at
AFTER UPDATE ON reminders
FOR EACH ROW
BEGIN
  UPDATE reminders SET updated_at = datetime('now') WHERE id = OLD.id;
END;
`;

export const SCHEMA_SQL = `
${CREATE_TRANSACTIONS_TABLE}
${CREATE_HABITS_TABLE}
${CREATE_REMINDERS_TABLE}
${CREATE_INDEXES}
${CREATE_TRIGGERS}
`.trim();

// ==========================================
// TypeScript Entity Definitions
// ==========================================

export type TransactionType = 'income' | 'expense';

export type WalletType = 'Cash' | 'Bank' | 'E-Wallet';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  wallet: WalletType;
  note: string | null;
  date?: string; // ISO 8601 (YYYY-MM-DD or full timestamp)
  created_at: string;
  updated_at: string;
}

export type NewTransaction = Omit<Transaction, 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: HabitFrequency;
  target_days_per_week: number;
  streak_current: number;
  streak_best: number;
  is_archived: number; // 0: active, 1: archived
  created_at: string;
  updated_at: string;
}

export type NewHabit = Omit<Habit, 'created_at' | 'updated_at' | 'streak_current' | 'streak_best' | 'is_archived'> & {
  streak_current?: number;
  streak_best?: number;
  is_archived?: number;
  created_at?: string;
  updated_at?: string;
};

export type ReminderPriority = 'low' | 'medium' | 'high';

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string; // ISO 8601 date string
  is_completed: number; // 0: pending, 1: completed
  priority: ReminderPriority;
  category: string | null;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
}

export type NewReminder = Omit<Reminder, 'created_at' | 'updated_at' | 'is_completed' | 'priority'> & {
  is_completed?: number;
  priority?: ReminderPriority;
  created_at?: string;
  updated_at?: string;
};
