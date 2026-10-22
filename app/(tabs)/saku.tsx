import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';

import { useAppTheme, palette } from '@/src/core/theme';
import { useSakuStore } from '@/src/features/saku/stores/useSakuStore';
import {
  Header,
  BalanceCard,
  SpendingChart,
  TransactionList,
  TransactionModal,
} from '@/src/features/saku/components';
import {
  WALLET_FILTER_MAP,
  formatRupiah,
  formatMonthYearLabel,
  isSameMonthAndYear,
  type WalletFilterType,
  type CategoryBreakdownItem,
} from '@/src/features/saku/utils/formatters';
import type {
  Transaction,
  TransactionType,
  WalletType,
} from '@/src/features/saku/types';

export default function SakuScreen() {
  const { isDark, theme, uiColors } = useAppTheme();

  // Zustand Store
  const transactions = useSakuStore((state) => state.transactions);
  const totalBalance = useSakuStore((state) => state.totalBalance);
  const walletBalances = useSakuStore((state) => state.walletBalances);
  const isLoading = useSakuStore((state) => state.isLoading);
  const fetchTransactions = useSakuStore((state) => state.fetchTransactions);
  const addTransaction = useSakuStore((state) => state.addTransaction);
  const deleteTransaction = useSakuStore((state) => state.deleteTransaction);

  // 1. State Filter Akun: 'ALL' | 'CASH' | 'BANK' | 'E-WALLET' (default: 'ALL')
  const [walletFilter, setWalletFilter] = useState<WalletFilterType>('ALL');
  const [showAllTransactions, setShowAllTransactions] = useState<boolean>(false);

  // 2. State Bulan & Tahun Aktif pada Monthly Spending (default: bulan & tahun saat ini)
  const [selectedPeriod, setSelectedPeriod] = useState<{
    month: number;
    year: number;
  }>(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  // Modal Form state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('Food');
  const [txWallet, setTxWallet] = useState<WalletType>('Cash');
  const [txNote, setTxNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Navigasi bulan sebelumnya / berikutnya
  const handlePrevMonth = useCallback(() => {
    setSelectedPeriod((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setSelectedPeriod((prev) => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  }, []);

  // Filter transaksi berdasarkan bulan aktif dan filter dompet ('ALL' | 'CASH' | 'BANK' | 'E-WALLET')
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesMonth = isSameMonthAndYear(
        tx.createdAt,
        selectedPeriod.month,
        selectedPeriod.year
      );
      if (!matchesMonth) return false;

      if (walletFilter === 'ALL') return true;
      return tx.wallet === WALLET_FILTER_MAP[walletFilter];
    });
  }, [transactions, selectedPeriod, walletFilter]);

  const displayedTransactions = useMemo(() => {
    if (showAllTransactions) return filteredTransactions;
    return filteredTransactions.slice(0, 5);
  }, [filteredTransactions, showAllTransactions]);

  // Kalkulasi Monthly Spending, Donut Chart, & Breakdown Kategori sesuai bulan & filter aktif
  const monthlyStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryTotals: Record<string, number> = {
      Food: 0,
      Bills: 0,
      Transport: 0,
    };

    for (const tx of filteredTransactions) {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        const cat = tx.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] ?? 0) + tx.amount;
      }
    }

    const segmentPalette = isDark
      ? [palette.primaryMint, '#4B7D6D', '#354F46', '#6CA390']
      : ['#1B6F53', '#77A898', '#D0DDD8', '#528B78'];

    const defaultCategories = ['Food', 'Bills', 'Transport'];
    const extraCategories = Object.keys(categoryTotals).filter(
      (c) => !defaultCategories.includes(c) && categoryTotals[c] > 0
    );
    const orderedKeys = [...defaultCategories, ...extraCategories].slice(0, 3);

    const breakdown: CategoryBreakdownItem[] = orderedKeys.map((cat, idx) => {
      const amount = categoryTotals[cat] ?? 0;
      const percentage = expense > 0 ? Math.round((amount / expense) * 100) : 0;
      return {
        category: cat,
        amount,
        percentage,
        color: segmentPalette[idx % segmentPalette.length],
      };
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      breakdown,
    };
  }, [filteredTransactions, isDark]);

  const activeMonthLabel = useMemo(
    () => formatMonthYearLabel(selectedPeriod.month, selectedPeriod.year),
    [selectedPeriod]
  );

  const selectedWalletLabel =
    walletFilter === 'ALL' ? 'All wallets' : WALLET_FILTER_MAP[walletFilter];

  const handleAddTransaction = async () => {
    const cleanNumber = Number(txAmount.replace(/[^0-9]/g, ''));
    if (!cleanNumber || cleanNumber <= 0) {
      Alert.alert('Nominal Tidak Valid', 'Masukkan jumlah nominal transaksi lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    const success = await addTransaction({
      amount: cleanNumber,
      type: txType,
      category: txCategory.trim() || (txType === 'expense' ? 'Food' : 'Salary'),
      wallet: txWallet,
      note: txNote.trim() || txCategory,
      createdAt: new Date().toISOString(),
    });
    setIsSubmitting(false);

    if (success) {
      const now = new Date();
      setSelectedPeriod({ month: now.getMonth(), year: now.getFullYear() });
      setTxAmount('');
      setTxNote('');
      setIsModalVisible(false);
    } else {
      Alert.alert('Gagal', 'Tidak dapat menyimpan transaksi ke database.');
    }
  };

  const handleDeleteTransaction = useCallback(
    (item: Transaction) => {
      Alert.alert(
        'Hapus Transaksi',
        `Hapus "${item.note || item.category}" (${formatRupiah(item.amount)})?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => {
              deleteTransaction(item.id);
            },
          },
        ]
      );
    },
    [deleteTransaction]
  );

  const openModalWithCurrentWallet = useCallback(() => {
    setTxWallet(
      walletFilter === 'ALL' ? 'Cash' : WALLET_FILTER_MAP[walletFilter]
    );
    setIsModalVisible(true);
  }, [walletFilter]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: uiColors.screenBg }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <TransactionList
        transactions={displayedTransactions}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        showAllTransactions={showAllTransactions}
        isDark={isDark}
        theme={theme}
        uiColors={uiColors}
        onRefresh={fetchTransactions}
        onToggleShowAll={() => setShowAllTransactions((prev) => !prev)}
        onDeleteTransaction={handleDeleteTransaction}
        onOpenAddModal={openModalWithCurrentWallet}
        topSlot={
          <>
            <Header
              isDark={isDark}
              theme={theme}
              uiColors={uiColors}
            />

            <BalanceCard
              totalBalance={totalBalance}
              walletBalances={walletBalances}
              walletFilter={walletFilter}
              totalIncome={monthlyStats.totalIncome}
              totalExpense={monthlyStats.totalExpense}
              theme={theme}
              uiColors={uiColors}
              onSelectWalletFilter={setWalletFilter}
            />

            <SpendingChart
              totalSpent={monthlyStats.totalExpense}
              breakdown={monthlyStats.breakdown}
              activeMonthLabel={activeMonthLabel}
              selectedWalletLabel={selectedWalletLabel}
              isDark={isDark}
              theme={theme}
              uiColors={uiColors}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />
          </>
        }
      />

      <Pressable
        onPress={openModalWithCurrentWallet}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: uiColors.fabBg,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}
      >
        <Feather name="plus" size={26} color={uiColors.fabIcon} />
      </Pressable>

      <TransactionModal
        visible={isModalVisible}
        txType={txType}
        txAmount={txAmount}
        txCategory={txCategory}
        txWallet={txWallet}
        txNote={txNote}
        isSubmitting={isSubmitting}
        theme={theme}
        uiColors={uiColors}
        onClose={() => setIsModalVisible(false)}
        onChangeType={(type) => {
          setTxType(type);
          setTxCategory(type === 'expense' ? 'Food' : 'Freelance');
        }}
        onChangeAmount={setTxAmount}
        onChangeCategory={setTxCategory}
        onChangeWallet={setTxWallet}
        onChangeNote={setTxNote}
        onSubmit={handleAddTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
