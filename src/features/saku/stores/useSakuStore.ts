/**
 * LifeKit - Saku Zustand Store
 * State management for transactions and wallet balances.
 */

import { create } from 'zustand';
import type {
  Transaction,
  NewTransactionPayload,
  WalletBalances,
} from '../types';
import { transactionRepo } from '../repositories/transactionRepo';

export interface SakuState {
  // State
  transactions: Transaction[];
  totalBalance: number;
  walletBalances: WalletBalances;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: NewTransactionPayload) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;
  clearAllTransactions: () => Promise<boolean>;
  clearError: () => void;
}

const initialWalletBalances: WalletBalances = {
  Cash: 0,
  Bank: 0,
  'E-Wallet': 0,
};

export const useSakuStore = create<SakuState>((set) => ({
  transactions: [],
  totalBalance: 0,
  walletBalances: initialWalletBalances,
  isLoading: false,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const [transactions, summary] = await Promise.all([
        transactionRepo.getAll(),
        transactionRepo.getBalanceSummary(),
      ]);

      set({
        transactions,
        totalBalance: summary.totalBalance,
        walletBalances: summary.walletBalances,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengambil data transaksi';
      set({ isLoading: false, error: message });
    }
  },

  addTransaction: async (transaction: NewTransactionPayload) => {
    set({ isLoading: true, error: null });
    try {
      const inserted = await transactionRepo.insert(transaction);
      if (!inserted) {
        set({ isLoading: false, error: 'Gagal menambahkan transaksi baru' });
        return false;
      }

      // Re-fetch transactions & updated balance summary directly from SQLite
      const [transactions, summary] = await Promise.all([
        transactionRepo.getAll(),
        transactionRepo.getBalanceSummary(),
      ]);

      set({
        transactions,
        totalBalance: summary.totalBalance,
        walletBalances: summary.walletBalances,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan transaksi';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  deleteTransaction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await transactionRepo.delete(id);
      if (!success) {
        set({ isLoading: false, error: 'Transaksi tidak ditemukan atau gagal dihapus' });
        return false;
      }

      // Re-fetch transactions & updated balance summary directly from SQLite
      const [transactions, summary] = await Promise.all([
        transactionRepo.getAll(),
        transactionRepo.getBalanceSummary(),
      ]);

      set({
        transactions,
        totalBalance: summary.totalBalance,
        walletBalances: summary.walletBalances,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus transaksi';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearAllTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      await transactionRepo.clearAll();
      const [transactions, summary] = await Promise.all([
        transactionRepo.getAll(),
        transactionRepo.getBalanceSummary(),
      ]);

      set({
        transactions,
        totalBalance: summary.totalBalance,
        walletBalances: summary.walletBalances,
        isLoading: false,
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengosongkan transaksi';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useSakuStore;
