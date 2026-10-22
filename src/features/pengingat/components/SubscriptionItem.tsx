import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import {
  formatRupiah,
  type SakuUIColors,
} from '@/src/features/saku/utils/formatters';
import type { UpcomingBill } from '../types';
import { formatCountdownIndo } from './TotalCommitmentCard';

export interface SubscriptionItemProps {
  bill: UpcomingBill;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onEdit: (bill: UpcomingBill) => void;
  onDelete: (bill: UpcomingBill) => void;
}

function getDueBadgeParts(nextDueDate: string): { month: string; day: string } {
  const d = new Date(nextDueDate);
  if (isNaN(d.getTime())) {
    return { month: 'BLN', day: '--' };
  }
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return {
    month: months[d.getMonth()],
    day: String(d.getDate()).padStart(2, '0'),
  };
}

export function SubscriptionItem({
  bill,
  theme,
  uiColors,
  onEdit,
  onDelete,
}: SubscriptionItemProps) {
  const { month, day } = getDueBadgeParts(bill.nextDueDate);
  const isUrgent = bill.daysUntilDue <= 3;
  const cycleText = bill.billingCycle === 'yearly' ? '/ tahun' : '/ bulan';
  const reminderBadgeText =
    bill.reminderDaysBefore <= 0
      ? 'Hari-H'
      : `H-${bill.reminderDaysBefore}`;

  return (
    <Pressable
      onPress={() => onEdit(bill)}
      onLongPress={() => onDelete(bill)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: uiColors.cardBg,
          borderColor: isUrgent ? uiColors.accentGreen : uiColors.cardBorder,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {/* Kotak Tanggal Jatuh Tempo (OCT / 25) */}
        <View
          style={[
            styles.dateBadgeBox,
            { backgroundColor: uiColors.switcherContainerBg },
          ]}
        >
          <Text style={[styles.dateMonthText, { color: theme.textSecondary }]}>
            {month}
          </Text>
          <Text style={[styles.dateDayText, { color: theme.text }]}>{day}</Text>
        </View>

        {/* Tengah: Nama, Nominal/Siklus, Kategori & Info Pengingat */}
        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.nameText, { color: theme.text }]}
              numberOfLines={1}
            >
              {bill.name}
            </Text>
          </View>

          <Text
            style={[styles.amountText, { color: theme.text }]}
            numberOfLines={1}
          >
            {`${formatRupiah(bill.amount)} `}
            <Text
              style={[styles.cycleSuffix, { color: theme.textSecondary }]}
            >
              {cycleText}
            </Text>
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
              {bill.category}
            </Text>

            <View style={styles.dotSeparator} />

            <View style={styles.reminderTag}>
              <Ionicons
                name="notifications-outline"
                size={11}
                color={uiColors.accentGreen}
              />
              <Text
                style={[
                  styles.reminderTagText,
                  { color: uiColors.accentGreen },
                ]}
              >
                {reminderBadgeText}
              </Text>
            </View>
          </View>
        </View>

        {/* Kanan: Badge Hitung Mundur ("Dalam 3 hari") */}
        <View
          style={[
            styles.countdownPill,
            {
              backgroundColor: isUrgent
                ? uiColors.expensePillBg
                : uiColors.badgeBg,
            },
          ]}
        >
          <Text
            style={[
              styles.countdownPillText,
              {
                color: isUrgent
                  ? uiColors.expensePillText
                  : uiColors.badgeText,
              },
            ]}
          >
            {formatCountdownIndo(bill.daysUntilDue)}
          </Text>
        </View>
      </View>
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
  dateBadgeBox: {
    width: 50,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonthText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  dateDayText: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 1,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  cycleSuffix: {
    fontSize: 12,
    fontWeight: '400',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#95A7A2',
  },
  reminderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reminderTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countdownPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  countdownPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default SubscriptionItem;
