import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import { useAppTheme, palette } from '@/src/core/theme';
import { useI18n } from '@/src/core/i18n';
import {
  formatRupiah,
} from '@/src/features/saku/utils/formatters';
import { usePengingatStore } from '@/src/features/pengingat/stores/usePengingatStore';
import {
  PengingatHeader,
  TotalCommitmentCard,
  SubscriptionItem,
  SubscriptionModal,
  type CycleFilterType,
} from '@/src/features/pengingat/components';
import type {
  BillingCycle,
  UpcomingBill,
} from '@/src/features/pengingat/types';

export default function PengingatScreen() {
  const { isDark, theme, uiColors } = useAppTheme();
  const { i18n, isId } = useI18n();

  // Zustand Store
  const upcomingBills = usePengingatStore((state) => state.upcomingBills);
  const totalMonthlyCommitment = usePengingatStore(
    (state) => state.totalMonthlyCommitment
  );
  const isLoading = usePengingatStore((state) => state.isLoading);
  const fetchSubscriptions = usePengingatStore(
    (state) => state.fetchSubscriptions
  );
  const addSubscription = usePengingatStore((state) => state.addSubscription);
  const updateSubscription = usePengingatStore(
    (state) => state.updateSubscription
  );
  const deleteSubscription = usePengingatStore(
    (state) => state.deleteSubscription
  );

  // Filter Siklus ('ALL' | 'MONTHLY' | 'YEARLY')
  const [cycleFilter, setCycleFilter] = useState<CycleFilterType>('ALL');

  // Modal Form state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [dueDay, setDueDay] = useState<string>('25');
  const [category, setCategory] = useState<string>('Entertainment');
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredBills = useMemo(() => {
    if (cycleFilter === 'ALL') return upcomingBills;
    if (cycleFilter === 'MONTHLY') {
      return upcomingBills.filter((b) => b.billingCycle === 'monthly');
    }
    return upcomingBills.filter((b) => b.billingCycle === 'yearly');
  }, [upcomingBills, cycleFilter]);

  const openAddModal = useCallback(() => {
    setEditingId(null);
    setName('');
    setAmount('');
    setBillingCycle('monthly');
    setDueDay(String(new Date().getDate()));
    setCategory('Entertainment');
    setReminderDaysBefore(3);
    setIsModalVisible(true);
  }, []);

  const openEditModal = useCallback((bill: UpcomingBill) => {
    setEditingId(bill.id);
    setName(bill.name);
    setAmount(String(bill.amount));
    setBillingCycle(bill.billingCycle);
    setDueDay(String(bill.dueDay));
    setCategory(bill.category || 'Entertainment');
    setReminderDaysBefore(bill.reminderDaysBefore);
    setIsModalVisible(true);
  }, []);

  const handleSaveSubscription = async () => {
    const trimmedName = name.trim();
    const numericAmount = Number(amount.replace(/[^0-9]/g, ''));
    const numericDueDay = Math.min(
      31,
      Math.max(1, Number(dueDay.replace(/[^0-9]/g, '')) || 1)
    );

    if (!trimmedName) {
      Alert.alert('Nama Kosong', 'Masukkan nama langganan atau tagihan.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert(
        'Nominal Tidak Valid',
        'Masukkan nominal tagihan lebih dari 0.'
      );
      return;
    }

    setIsSubmitting(true);
    const success = editingId
      ? await updateSubscription(editingId, {
          name: trimmedName,
          amount: numericAmount,
          billingCycle,
          dueDay: numericDueDay,
          category,
          reminderDaysBefore,
        })
      : await addSubscription({
          name: trimmedName,
          amount: numericAmount,
          billingCycle,
          dueDay: numericDueDay,
          category,
          reminderDaysBefore,
          color: palette.primaryMint,
          isActive: true,
        });
    setIsSubmitting(false);

    if (success) {
      setIsModalVisible(false);
    } else {
      Alert.alert('Gagal', 'Tidak dapat menyimpan pengingat tagihan.');
    }
  };

  const handleDeleteSubscription = useCallback(
    (bill: UpcomingBill) => {
      Alert.alert(
        'Hapus Pengingat Tagihan',
        `Hapus "${bill.name}" (${formatRupiah(bill.amount)}) dari daftar pengingat?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => {
              deleteSubscription(bill.id);
            },
          },
        ]
      );
    },
    [deleteSubscription]
  );

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <PengingatHeader
        activeCount={upcomingBills.length}
        isDark={isDark}
        theme={theme}
        uiColors={uiColors}
      />

      <TotalCommitmentCard
        totalMonthlyCommitment={totalMonthlyCommitment}
        nearestBill={upcomingBills[0]}
        cycleFilter={cycleFilter}
        theme={theme}
        uiColors={uiColors}
        onSelectCycleFilter={setCycleFilter}
      />

      <View style={styles.listSectionHeaderRow}>
        <Text style={[styles.listSectionTitle, { color: theme.text }]}>
          {isId ? 'Tagihan & langganan mendatang' : 'Upcoming bills & subscriptions'}
        </Text>
        <Text
          style={[styles.listSectionSubtitle, { color: theme.textSecondary }]}
        >
          {isId ? 'Ketuk edit · Tahan hapus' : 'Tap to edit · Hold to delete'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View
      style={[
        styles.emptyCard,
        {
          backgroundColor: uiColors.cardBg,
          borderColor: uiColors.cardBorder,
        },
      ]}
    >
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: uiColors.txIconBoxBg },
        ]}
      >
        <Ionicons
          name="calendar-clear-outline"
          size={30}
          color={uiColors.txIconColor}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {i18n.pengingat.emptyTitle}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {i18n.pengingat.emptySub}
      </Text>

      <Pressable
        onPress={openAddModal}
        style={[
          styles.emptyPrimaryBtn,
          { backgroundColor: uiColors.accentGreen },
        ]}
      >
        <Ionicons
          name="add"
          size={18}
          color={isDark ? '#101918' : '#FFFFFF'}
        />
        <Text
          style={[
            styles.emptyPrimaryBtnText,
            { color: isDark ? '#101918' : '#FFFFFF' },
          ]}
        >
          {isId ? 'Tambah Tagihan Pertama' : 'Add First Bill'}
        </Text>
      </Pressable>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerRow}>
      <MaterialCommunityIcons
        name="shield-check-outline"
        size={15}
        color={theme.textSecondary}
      />
      <Text style={[styles.footerText, { color: theme.textSecondary }]}>
        {isId
          ? 'Pengingat tenang. Aman di perangkat Anda.'
          : 'A gentle reminder. Right on your device.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: uiColors.screenBg }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <FlatList
        data={filteredBills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionItem
            bill={item}
            theme={theme}
            uiColors={uiColors}
            onEdit={openEditModal}
            onDelete={handleDeleteSubscription}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={uiColors.accentGreen} />
            </View>
          ) : (
            renderEmptyState()
          )
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchSubscriptions}
            tintColor={uiColors.accentGreen}
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={openAddModal}
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

      {/* Modal Add / Edit Subscription */}
      <SubscriptionModal
        visible={isModalVisible}
        isEditing={Boolean(editingId)}
        name={name}
        amount={amount}
        billingCycle={billingCycle}
        dueDay={dueDay}
        category={category}
        reminderDaysBefore={reminderDaysBefore}
        isSubmitting={isSubmitting}
        theme={theme}
        uiColors={uiColors}
        onClose={() => setIsModalVisible(false)}
        onChangeName={setName}
        onChangeAmount={setAmount}
        onChangeBillingCycle={setBillingCycle}
        onChangeDueDay={setDueDay}
        onChangeCategory={setCategory}
        onChangeReminderDaysBefore={setReminderDaysBefore}
        onSubmit={handleSaveSubscription}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  headerContainer: {
    marginBottom: 4,
  },
  listSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  listSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  listSectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  emptyPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingLeft: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
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
