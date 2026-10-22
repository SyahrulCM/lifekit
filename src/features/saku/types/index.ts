/**
 * LifeKit - Saku (Finance Tracker) Module Types
 */

export type TransactionType = 'income' | 'expense';

export type WalletType = 'Cash' | 'Bank' | 'E-Wallet';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  wallet: WalletType;
  note: string | null;
  createdAt: string; // ISO 8601 string (e.g. 2026-10-22T10:00:00.000Z or YYYY-MM-DD)
}

export type NewTransactionPayload = Omit<Transaction, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export interface WalletBalances {
  Cash: number;
  Bank: number;
  'E-Wallet': number;
}

export interface BalanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  walletBalances: WalletBalances;
}
