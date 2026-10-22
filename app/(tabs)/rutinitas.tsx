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
import { useRutinitasStore } from '@/src/features/rutinitas/stores/useRutinitasStore';
import {
  RutinitasHeader,
  WeeklyStrip,
  HabitCard,
  HabitModal,
  createReminderId,
  isIbadahHabit,
} from '@/src/features/rutinitas/components';
import type { Habit, HabitReminderItem } from '@/src/features/rutinitas/types';

type HabitCategoryFilter = 'ALL' | 'IBADAH' | 'UMUM';

export default function RutinitasScreen() {
  const { isDark, theme, uiColors } = useAppTheme();
  const { i18n, isId } = useI18n();

  // Zustand Store
  const habits = useRutinitasStore((state) => state.habits);
  const todayLogs = useRutinitasStore((state) => state.todayLogs);
  const streak = useRutinitasStore((state) => state.streak);
  const isLoading = useRutinitasStore((state) => state.isLoading);
  const fetchHabits = useRutinitasStore((state) => state.fetchHabits);
  const addHabit = useRutinitasStore((state) => state.addHabit);
  const updateHabit = useRutinitasStore((state) => state.updateHabit);
  const toggleHabitToday = useRutinitasStore((state) => state.toggleHabitToday);
  const deleteHabit = useRutinitasStore((state) => state.deleteHabit);

  // Filter Kategori ('ALL' | 'IBADAH' | 'UMUM')
  const [categoryFilter, setCategoryFilter] =
    useState<HabitCategoryFilter>('ALL');

  // Modal Form state (Add & Edit)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitTitle, setHabitTitle] = useState<string>('');
  const [targetDays, setTargetDays] = useState<number>(7);
  const [selectedIcon, setSelectedIcon] = useState<string>('sparkles-outline');
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(false);
  const [reminders, setReminders] = useState<HabitReminderItem[]>([
    { id: createReminderId(), label: 'Pengingat Utama', time: '07:00', enabled: true },
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const completedTodayIds = useMemo(() => {
    const set = new Set<string>();
    for (const log of todayLogs) {
      if (log.completed) {
        set.add(log.habitId);
      }
    }
    return set;
  }, [todayLogs]);

  const completedCount = useMemo(
    () => habits.filter((h) => completedTodayIds.has(h.id)).length,
    [habits, completedTodayIds]
  );

  const filteredHabits = useMemo(() => {
    if (categoryFilter === 'ALL') return habits;
    if (categoryFilter === 'IBADAH') {
      return habits.filter((h) => isIbadahHabit(h));
    }
    return habits.filter((h) => !isIbadahHabit(h));
  }, [habits, categoryFilter]);

  const nextUnfinishedHabit = useMemo(
    () => habits.find((h) => !completedTodayIds.has(h.id)),
    [habits, completedTodayIds]
  );

  const openAddModal = useCallback(() => {
    setEditingHabitId(null);
    setHabitTitle('');
    setTargetDays(7);
    setSelectedIcon(
      categoryFilter === 'IBADAH' ? 'sparkles-outline' : 'book-outline'
    );
    setRemindersEnabled(false);
    setReminders([
      {
        id: createReminderId(),
        label: 'Pengingat Utama',
        time: '07:00',
        enabled: true,
      },
    ]);
    setIsModalVisible(true);
  }, [categoryFilter]);

  const openEditModal = useCallback((habit: Habit) => {
    setEditingHabitId(habit.id);
    setHabitTitle(habit.title);
    setTargetDays(habit.targetDays);
    setSelectedIcon(habit.icon || 'sparkles-outline');
    const existingReminders = habit.reminders ?? [];
    setRemindersEnabled(existingReminders.length > 0);
    setReminders(
      existingReminders.length > 0
        ? existingReminders
        : [
            {
              id: createReminderId(),
              label: 'Pengingat Utama',
              time: '07:00',
              enabled: true,
            },
          ]
    );
    setIsModalVisible(true);
  }, []);

  const handleToggleRemindersEnabled = useCallback(
    (enabled: boolean) => {
      setRemindersEnabled(enabled);
      if (enabled && reminders.length === 0) {
        setReminders([
          {
            id: createReminderId(),
            label: 'Pengingat Utama',
            time: '07:00',
            enabled: true,
          },
        ]);
      }
    },
    [reminders.length]
  );

  const handleSaveHabit = async () => {
    const trimmed = habitTitle.trim();
    if (!trimmed) {
      Alert.alert(
        'Nama Rutinitas Kosong',
        'Masukkan nama ibadah atau rutinitas yang ingin kamu bangun.'
      );
      return;
    }

    const finalReminders = remindersEnabled
      ? reminders.map((r) => ({
          ...r,
          label: r.label.trim() || 'Pengingat',
          time: r.time.trim() || '07:00',
        }))
      : [];

    setIsSubmitting(true);
    const success = editingHabitId
      ? await updateHabit(editingHabitId, {
          title: trimmed,
          targetDays,
          icon: selectedIcon,
          reminders: finalReminders,
        })
      : await addHabit({
          title: trimmed,
          targetDays,
          icon: selectedIcon,
          color: palette.primaryMint,
          reminders: finalReminders,
        });
    setIsSubmitting(false);

    if (success) {
      setIsModalVisible(false);
    } else {
      Alert.alert('Gagal', 'Tidak dapat menyimpan rutinitas dan pengingat.');
    }
  };

  const handleDeleteHabit = useCallback(
    (habit: Habit) => {
      Alert.alert(
        'Hapus Rutinitas',
        `Hapus "${habit.title}" beserta seluruh riwayat streak dan pengingatnya?`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: () => {
              deleteHabit(habit.id);
            },
          },
        ]
      );
    },
    [deleteHabit]
  );

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      <RutinitasHeader
        completedCount={completedCount}
        totalCount={habits.length}
        isDark={isDark}
        theme={theme}
        uiColors={uiColors}
      />

      <WeeklyStrip
        completedCount={completedCount}
        totalCount={habits.length}
        bestStreak={streak}
        nextHabitTitle={nextUnfinishedHabit?.title}
        isDark={isDark}
        theme={theme}
        uiColors={uiColors}
      />

      {/* Filter Tab Kategori: Semua, Ibadah, Umum */}
      <View
        style={[
          styles.filterBar,
          { backgroundColor: uiColors.switcherContainerBg },
        ]}
      >
        {[
          { key: 'ALL' as const, label: i18n.rutinitas.filter.all, icon: 'apps-outline' as const },
          { key: 'IBADAH' as const, label: i18n.rutinitas.filter.ibadah, icon: 'sparkles-outline' as const },
          {
            key: 'UMUM' as const,
            label: i18n.rutinitas.filter.general,
            icon: 'checkmark-circle-outline' as const,
          },
        ].map((tab) => {
          const active = categoryFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setCategoryFilter(tab.key)}
              style={[
                styles.filterTab,
                active && {
                  backgroundColor: uiColors.switcherActiveBg,
                },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={14}
                color={
                  active ? uiColors.switcherActiveText : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: active
                      ? uiColors.switcherActiveText
                      : theme.textSecondary,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listSectionHeaderRow}>
        <Text style={[styles.listSectionTitle, { color: theme.text }]}>
          {categoryFilter === 'IBADAH'
            ? isId ? 'Rutinitas ibadah' : 'Worship habits'
            : categoryFilter === 'UMUM'
            ? isId ? 'Kebiasaan umum' : 'General habits'
            : isId ? 'Daftar rutinitas' : 'All habits'}
        </Text>
        <Text
          style={[styles.listSectionSubtitle, { color: theme.textSecondary }]}
        >
          {isId
            ? 'Ketuk ceklis · Atur jam · Tahan hapus'
            : 'Tap checkmark · Set time · Hold to delete'}
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
          name={
            categoryFilter === 'IBADAH'
              ? 'sparkles-outline'
              : 'checkmark-done-circle-outline'
          }
          size={30}
          color={uiColors.txIconColor}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {categoryFilter === 'IBADAH'
          ? isId ? 'Belum Ada Rutinitas Ibadah' : 'No Worship Habits Yet'
          : i18n.rutinitas.emptyTitle}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {categoryFilter === 'IBADAH'
          ? isId
            ? 'Tambahkan rutinitas ibadah dan spiritual harianmu seperti Doa Harian, Baca Kitab Suci, Saat Teduh, atau Amal & Berbagi.'
            : 'Add your daily spiritual routines like prayer, scripture reading, meditation, or giving back.'
          : i18n.rutinitas.emptySub}
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
          color={isDark ? palette.deepForestDark : '#FFFFFF'}
        />
        <Text
          style={[
            styles.emptyPrimaryBtnText,
            { color: isDark ? palette.deepForestDark : '#FFFFFF' },
          ]}
        >
          {categoryFilter === 'IBADAH'
            ? isId ? 'Tambah Ibadah' : 'Add Worship'
            : isId ? 'Buat Rutinitas Pertama' : 'Create First Habit'}
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
        Saved on this device
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
        data={filteredHabits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            completedToday={completedTodayIds.has(item.id)}
            isDark={isDark}
            theme={theme}
            uiColors={uiColors}
            onToggleToday={toggleHabitToday}
            onEditHabit={openEditModal}
            onDeleteHabit={handleDeleteHabit}
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
            onRefresh={fetchHabits}
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

      {/* Modal Add / Edit Habit & Reminders */}
      <HabitModal
        visible={isModalVisible}
        isEditing={Boolean(editingHabitId)}
        title={habitTitle}
        targetDays={targetDays}
        selectedIcon={selectedIcon}
        remindersEnabled={remindersEnabled}
        reminders={reminders}
        isSubmitting={isSubmitting}
        isDark={isDark}
        theme={theme}
        uiColors={uiColors}
        onClose={() => setIsModalVisible(false)}
        onChangeTitle={setHabitTitle}
        onChangeTargetDays={setTargetDays}
        onChangeIcon={setSelectedIcon}
        onToggleRemindersEnabled={handleToggleRemindersEnabled}
        onChangeReminders={setReminders}
        onSubmit={handleSaveHabit}
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
  filterBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 9,
  },
  filterTabText: {
    fontSize: 12,
  },
  listSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
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
