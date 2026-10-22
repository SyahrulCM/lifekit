/**
 * LifeKit - Saku Transaction Repository
 * Handles direct SQLite queries for transactions and wallet balances.
 */

import { getDatabase } from '@/src/core/database/db';
import type {
  Transaction,
  NewTransactionPayload,
  BalanceSummary,
  WalletType,
  TransactionType,
} from '../types';

/**
 * Generate a unique ID using crypto.randomUUID when available, with a resilient fallback.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Ambil semua transaksi terurut dari yang terbaru.
 */
export async function getAll(): Promise<Transaction[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      amount: number;
      type: TransactionType;
      category: string;
      wallet: WalletType;
      note: string | null;
      created_at: string;
    }>(`
      SELECT 
        id,
        amount,
        type,
        category,
        wallet,
        note,
        created_at
      FROM transactions
      ORDER BY created_at DESC;
    `);

    return rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount),
      type: row.type,
      category: row.category,
      wallet: row.wallet,
      note: row.note,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('[transactionRepo.getAll] Gagal mengambil daftar transaksi:', error);
    return [];
  }
}

/**
 * Simpan transaksi baru ke tabel transactions.
 */
export async function insert(transaction: NewTransactionPayload): Promise<Transaction | null> {
  try {
    const db = await getDatabase();
    const id = transaction.id ?? generateId();
    const createdAt = transaction.createdAt ?? new Date().toISOString();
    const date = createdAt.includes('T') ? createdAt.split('T')[0] : createdAt;
    const note = transaction.note ?? null;

    await db.runAsync(
      `INSERT INTO transactions (id, amount, type, category, wallet, note, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      id,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.wallet,
      note,
      date,
      createdAt,
      createdAt
    );

    return {
      id,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      wallet: transaction.wallet,
      note,
      createdAt,
    };
  } catch (error) {
    console.error('[transactionRepo.insert] Gagal menyimpan transaksi baru:', error);
    return null;
  }
}

/**
 * Hapus transaksi berdasarkan ID.
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(`DELETE FROM transactions WHERE id = ?;`, id);
    return result.changes > 0;
  } catch (error) {
    console.error(`[transactionRepo.delete] Gagal menghapus transaksi ID ${id}:`, error);
    return false;
  }
}

export { deleteTransaction as delete };

/**
 * Hapus seluruh transaksi di database SQLite.
 */
export async function clearAll(): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM transactions;`);
    return true;
  } catch (error) {
    console.error('[transactionRepo.clearAll] Gagal mengosongkan tabel transaksi:', error);
    return false;
  }
}

/**
 * Hitung total saldo dan breakdown per dompet (Cash, Bank, E-Wallet) langsung dari query SQLite.
 */
export async function getBalanceSummary(): Promise<BalanceSummary> {
  const defaultSummary: BalanceSummary = {
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    walletBalances: {
      Cash: 0,
      Bank: 0,
      'E-Wallet': 0,
    },
  };

  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      total_balance: number | null;
      total_income: number | null;
      total_expense: number | null;
      cash_balance: number | null;
      bank_balance: number | null;
      ewallet_balance: number | null;
    }>(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS total_balance,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN wallet = 'Cash' THEN (CASE WHEN type = 'income' THEN amount ELSE -amount END) ELSE 0 END), 0) AS cash_balance,
        COALESCE(SUM(CASE WHEN wallet = 'Bank' THEN (CASE WHEN type = 'income' THEN amount ELSE -amount END) ELSE 0 END), 0) AS bank_balance,
        COALESCE(SUM(CASE WHEN wallet = 'E-Wallet' THEN (CASE WHEN type = 'income' THEN amount ELSE -amount END) ELSE 0 END), 0) AS ewallet_balance
      FROM transactions;
    `);

    if (!row) {
      return defaultSummary;
    }

    return {
      totalBalance: Number(row.total_balance ?? 0),
      totalIncome: Number(row.total_income ?? 0),
      totalExpense: Number(row.total_expense ?? 0),
      walletBalances: {
        Cash: Number(row.cash_balance ?? 0),
        Bank: Number(row.bank_balance ?? 0),
        'E-Wallet': Number(row.ewallet_balance ?? 0),
      },
    };
  } catch (error) {
    console.error('[transactionRepo.getBalanceSummary] Gagal menghitung ringkasan saldo:', error);
    return defaultSummary;
  }
}

export const transactionRepo = {
  getAll,
  insert,
  delete: deleteTransaction,
  clearAll,
  getBalanceSummary,
};

export default transactionRepo;
