import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import { useI18n } from '@/src/core/i18n';
import type { SakuUIColors } from '@/src/features/saku/utils/formatters';

export interface DashboardReminderItem {
  id: string;
  title: string;
  subtitle: string;
  dueDate: string;
  daysRemainingLabel: string;
}

export interface UpcomingExpiryCardProps {
  reminders: DashboardReminderItem[];
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onPressNavigate: () => void;
}

function getMonthAndDay(dateStr: string, isId: boolean): { month: string; day: string } {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { month: isId ? 'OKT' : 'OCT', day: '--' };
  }
  const monthsEn = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  const monthsId = [
    'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN',
    'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES',
  ];
  const months = isId ? monthsId : monthsEn;
  return {
    month: months[date.getMonth()],
    day: String(date.getDate()).padStart(2, '0'),
  };
}

export function UpcomingExpiryCard({
  reminders,
  theme,
  uiColors,
  onPressNavigate,
}: UpcomingExpiryCardProps) {
  const { i18n, isId } = useI18n();
  const nextItem = reminders[0];

  return (
    <Pressable
      onPress={onPressNavigate}
      style={[
        styles.card,
        {
          backgroundColor: uiColors.cardBg,
          borderColor: uiColors.cardBorder,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons
            name="calendar-outline"
            size={19}
            color={uiColors.accentGreen}
          />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {i18n.dashboard.upcomingBills}
          </Text>
        </View>

        <Pressable onPress={onPressNavigate} hitSlop={8}>
          <Feather
            name="arrow-up-right"
            size={18}
            color={theme.textSecondary}
          />
        </Pressable>
      </View>

      {nextItem ? (
        <View style={styles.reminderRow}>
          <View
            style={[
              styles.dateBadgeBox,
              { backgroundColor: uiColors.switcherContainerBg },
            ]}
          >
            <Text
              style={[styles.dateMonthText, { color: theme.textSecondary }]}
            >
              {getMonthAndDay(nextItem.dueDate, isId).month}
            </Text>
            <Text style={[styles.dateDayText, { color: theme.text }]}>
              {getMonthAndDay(nextItem.dueDate, isId).day}
            </Text>
          </View>

          <View style={styles.reminderInfoCol}>
            <Text
              style={[styles.reminderTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {nextItem.title}
            </Text>
            <Text
              style={[styles.reminderSub, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {nextItem.subtitle}
            </Text>
          </View>

          <View
            style={[
              styles.duePill,
              { backgroundColor: uiColors.badgeBg },
            ]}
          >
            <Text style={[styles.duePillText, { color: uiColors.badgeText }]}>
              {nextItem.daysRemainingLabel}
            </Text>
          </View>
        </View>
      ) : (
        /* Empty State tanpa dummy data */
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.dateBadgeBox,
              { backgroundColor: uiColors.switcherContainerBg },
            ]}
          >
            <Ionicons
              name="notifications-off-outline"
              size={22}
              color={theme.textSecondary}
            />
          </View>

          <View style={styles.reminderInfoCol}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {i18n.dashboard.noReminders}
            </Text>
            <Text
              style={[styles.reminderSub, { color: theme.textSecondary }]}
            >
              {isId
                ? 'Jadwalkan pengingat langganan atau jatuh tempo.'
                : 'Track your recurring bills or upcoming dues.'}
            </Text>
          </View>

          <Pressable
            onPress={onPressNavigate}
            style={[
              styles.duePill,
              { backgroundColor: uiColors.badgeBg },
            ]}
          >
            <Feather name="plus" size={13} color={uiColors.badgeText} />
            <Text style={[styles.duePillText, { color: uiColors.badgeText }]}>
              {i18n.dashboard.addReminder}
            </Text>
          </Pressable>
        </View>
      )}

      <Text style={[styles.footerNote, { color: theme.textSecondary }]}>
        {isId
          ? 'Pengingat tenang. Aman di perangkat Anda.'
          : 'A gentle reminder. Right on your device.'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dateBadgeBox: {
    width: 48,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonthText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  dateDayText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 1,
  },
  reminderInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  reminderSub: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  duePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default UpcomingExpiryCard;
