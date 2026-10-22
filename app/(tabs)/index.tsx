import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { useAppTheme } from '@/src/core/theme';
import { useI18n } from '@/src/core/i18n';
import { useSettingsStore } from '@/src/features/profile/stores/useSettingsStore';
import { useSakuStore } from '@/src/features/saku/stores/useSakuStore';
import { useRutinitasStore } from '@/src/features/rutinitas/stores/useRutinitasStore';
import { usePengingatStore } from '@/src/features/pengingat/stores/usePengingatStore';
import { TransactionModal } from '@/src/features/saku/components';
import {
  formatMonthYearLabel,
  formatCurrency,
  isSameMonthAndYear,
} from '@/src/features/saku/utils/formatters';
import type { TransactionType, WalletType } from '@/src/features/saku/types';
import {
  DashboardHeader,
  ExpensesCard,
  DailyHabitsCard,
  UpcomingExpiryCard,
  type DashboardHabitItem,
  type DashboardReminderItem,
} from '@/src/features/dashboard/components';

export default function DashboardScreen() {
  const { isDark, theme, uiColors } = useAppTheme();
  const { i18n } = useI18n();
  const currency = useSettingsStore((state) => state.currency);

  // Modul Keuangan (Zustand Store)
  const transactions = useSakuStore((state) => state.transactions);
  const totalBalance = useSakuStore((state) => state.totalBalance);
  const isLoading = useSakuStore((state) => state.isLoading);
  const fetchTransactions = useSakuStore((state) => state.fetchTransactions);
  const addTransaction = useSakuStore((state) => state.addTransaction);

  // Modul Rutinitas (Zustand Store) & Pengingat (Zustand Store)
  const rawHabits = useRutinitasStore((state) => state.habits);
  const todayLogs = useRutinitasStore((state) => state.todayLogs);
  const fetchHabits = useRutinitasStore((state) => state.fetchHabits);

  const upcomingBills = usePengingatStore((state) => state.upcomingBills);
  const fetchSubscriptions = usePengingatStore(
    (state) => state.fetchSubscriptions
  );

  const habits: DashboardHabitItem[] = useMemo(() => {
    const completedSet = new Set(
      todayLogs.filter((l) => l.completed).map((l) => l.habitId)
    );
    return rawHabits.map((h) => ({
      id: h.id,
      title: h.title,
      completedToday: completedSet.has(h.id),
      streakCurrent: h.streakCount,
    }));
  }, [rawHabits, todayLogs]);

  const reminders: DashboardReminderItem[] = useMemo(() => {
    return upcomingBills.map((bill) => ({
      id: bill.id,
      title: bill.name,
      subtitle: `${formatCurrency(bill.amount, currency)} / ${
        bill.billingCycle === 'yearly' ? i18n.common.year : i18n.common.month
      }`,
      dueDate: bill.nextDueDate,
      daysRemainingLabel: bill.daysRemainingLabel,
    }));
  }, [upcomingBills, currency, i18n]);

  // Modal Tambah Transaksi Cepat dari Dashboard
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [txType, setTxType] = useState<TransactionType>('expense');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('Food');
  const [txWallet, setTxWallet] = useState<WalletType>('Cash');
  const [txNote, setTxNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchTransactions();
    fetchHabits();
    fetchSubscriptions();
  }, [fetchTransactions, fetchHabits, fetchSubscriptions]);

  const currentMonthSummary = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    let income = 0;
    let spent = 0;

    for (const tx of transactions) {
      if (isSameMonthAndYear(tx.createdAt, curMonth, curYear)) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else {
          spent += tx.amount;
        }
      }
    }

    return {
      monthLabel: formatMonthYearLabel(curMonth, curYear),
      monthlyIncome: income,
      monthlySpent: spent,
    };
  }, [transactions]);

  const handleAddTransaction = async () => {
    const cleanNumber = Number(txAmount.replace(/[^0-9]/g, ''));
    if (!cleanNumber || cleanNumber <= 0) {
      Alert.alert(
        'Nominal Tidak Valid',
        'Masukkan jumlah nominal transaksi lebih dari 0.'
      );
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
      setTxAmount('');
      setTxNote('');
      setIsModalVisible(false);
    } else {
      Alert.alert('Gagal', 'Tidak dapat menyimpan transaksi ke database.');
    }
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: uiColors.screenBg }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              fetchTransactions();
              fetchHabits();
              fetchSubscriptions();
            }}
            tintColor={uiColors.accentGreen}
          />
        }
      >
        <DashboardHeader
          isDark={isDark}
          theme={theme}
          uiColors={uiColors}
        />

        <ExpensesCard
          totalBalance={totalBalance}
          monthlyIncome={currentMonthSummary.monthlyIncome}
          monthlySpent={currentMonthSummary.monthlySpent}
          monthLabel={currentMonthSummary.monthLabel}
          hasTransactions={transactions.length > 0}
          theme={theme}
          uiColors={uiColors}
          onPressCard={() => router.push('/(tabs)/saku')}
          onPressAdd={() => setIsModalVisible(true)}
        />

        <DailyHabitsCard
          habits={habits}
          isDark={isDark}
          theme={theme}
          uiColors={uiColors}
          onPressNavigate={() => router.push('/(tabs)/rutinitas')}
        />

        <UpcomingExpiryCard
          reminders={reminders}
          theme={theme}
          uiColors={uiColors}
          onPressNavigate={() => router.push('/(tabs)/pengingat')}
        />
      </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
