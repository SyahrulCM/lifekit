import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import type { SakuUIColors } from '@/src/features/saku/utils/formatters';
import type { Habit } from '../types';

export function isIbadahHabit(habit: Habit): boolean {
  if (habit.icon === 'sparkles-outline' || habit.icon === 'heart-outline') {
    return true;
  }
  const lower = habit.title.toLowerCase();
  return (
    lower.includes('ibadah') ||
    lower.includes('doa') ||
    lower.includes('kitab') ||
    lower.includes('renungan') ||
    lower.includes('saat teduh') ||
    lower.includes('spiritual') ||
    lower.includes('syukur') ||
    lower.includes('amal') ||
    lower.includes('berbagi') ||
    lower.includes('sedekah') ||
    lower.includes('sembahyang') ||
    lower.includes('kebaktian') ||
    lower.includes('misa') ||
    lower.includes('puja') ||
    lower.includes('meditasi') ||
    lower.includes('sholat') ||
    lower.includes('salat') ||
    lower.includes('tilawah') ||
    lower.includes('dzikir') ||
    lower.includes('puasa') ||
    lower.includes('pantang')
  );
}

export interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onToggleToday: (habitId: string) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  completedToday,
  isDark,
  theme,
  uiColors,
  onToggleToday,
  onEditHabit,
  onDeleteHabit,
}: HabitCardProps) {
  const iconName =
    (habit.icon as keyof typeof Ionicons.glyphMap) || 'checkmark-circle-outline';
  const targetLabel =
    habit.targetDays >= 7 ? 'Setiap hari' : `${habit.targetDays}x / minggu`;
  const isIbadah = isIbadahHabit(habit);

  const activeReminders = (habit.reminders ?? []).filter((r) => r.enabled);

  return (
    <Pressable
      onPress={() => onToggleToday(habit.id)}
      onLongPress={() => onDeleteHabit(habit)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: uiColors.cardBg,
          borderColor: completedToday
            ? uiColors.accentGreen
            : uiColors.cardBorder,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Left Habit Icon */}
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: completedToday
                ? uiColors.switcherActiveBg
                : uiColors.txIconBoxBg,
            },
          ]}
        >
          <Ionicons name={iconName} size={20} color={uiColors.txIconColor} />
        </View>

        {/* Middle Title, Category Badge, Target & Streak */}
        <View style={styles.infoCol}>
          <View style={styles.titleLine}>
            <Text
              style={[
                styles.habitTitle,
                {
                  color: theme.text,
                  opacity: completedToday ? 0.85 : 1,
                },
              ]}
              numberOfLines={1}
            >
              {habit.title}
            </Text>

            {isIbadah && (
              <View
                style={[
                  styles.ibadahBadge,
                  { backgroundColor: uiColors.badgeBg },
                ]}
              >
                <Text
                  style={[
                    styles.ibadahBadgeText,
                    { color: uiColors.badgeText },
                  ]}
                >
                  Ibadah
                </Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.targetText, { color: theme.textSecondary }]}>
              {targetLabel}
            </Text>

            <View style={styles.dotSeparator} />

            <View style={styles.streakInline}>
              <Ionicons
                name="flame"
                size={13}
                color={
                  habit.streakCount > 0
                    ? uiColors.accentGreen
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.streakText,
                  {
                    color:
                      habit.streakCount > 0
                        ? uiColors.accentGreen
                        : theme.textSecondary,
                  },
                ]}
              >
                {`${habit.streakCount} hari`}
              </Text>
            </View>

            <View style={styles.dotSeparator} />

            {/* Edit / Pengingat Trigger */}
            <Pressable
              onPress={() => onEditHabit(habit)}
              hitSlop={8}
              style={styles.editReminderBtn}
            >
              <Ionicons
                name={
                  activeReminders.length > 0
                    ? 'notifications-outline'
                    : 'time-outline'
                }
                size={13}
                color={
                  activeReminders.length > 0
                    ? uiColors.accentGreen
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.editReminderText,
                  {
                    color:
                      activeReminders.length > 0
                        ? uiColors.accentGreen
                        : theme.textSecondary,
                  },
                ]}
              >
                {activeReminders.length > 0
                  ? `${activeReminders.length} jadwal`
                  : 'Atur jam'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Right Interactive Checklist Button */}
        <Pressable
          onPress={() => onToggleToday(habit.id)}
          hitSlop={10}
          style={[
            styles.checkButton,
            completedToday
              ? {
                  backgroundColor: uiColors.fabBg,
                  borderColor: uiColors.fabBg,
                }
              : {
                  backgroundColor: 'transparent',
                  borderColor: theme.border,
                },
          ]}
        >
          {completedToday && (
            <Ionicons
              name="checkmark"
              size={18}
              color={isDark ? palette.deepForestDark : '#FFFFFF'}
            />
          )}
        </Pressable>
      </View>

      {/* Daftar Sub-Jadwal Pengingat Aktif (contoh: Zuhur 12:05, dll.) */}
      {activeReminders.length > 0 && (
        <Pressable
          onPress={() => onEditHabit(habit)}
          style={[
            styles.remindersStrip,
            { borderTopColor: uiColors.divider },
          ]}
        >
          {activeReminders.map((rem) => (
            <View
              key={rem.id}
              style={[
                styles.reminderChip,
                { backgroundColor: uiColors.switcherContainerBg },
              ]}
            >
              <Ionicons
                name="alarm-outline"
                size={12}
                color={uiColors.accentGreen}
              />
              <Text
                style={[styles.reminderChipText, { color: theme.text }]}
                numberOfLines={1}
              >
                {rem.label ? `${rem.label} · ${rem.time}` : rem.time}
              </Text>
            </View>
          ))}
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  ibadahBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  ibadahBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  targetText: {
    fontSize: 12,
    fontWeight: '400',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#95A7A2',
  },
  streakInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editReminderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remindersStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  reminderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reminderChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default HabitCard;
