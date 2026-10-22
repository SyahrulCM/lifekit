import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import {
  formatRupiah,
  type SakuUIColors,
} from '@/src/features/saku/utils/formatters';
import type { UpcomingBill } from '../types';

export type CycleFilterType = 'ALL' | 'MONTHLY' | 'YEARLY';

export interface TotalCommitmentCardProps {
  totalMonthlyCommitment: number;
  nearestBill?: UpcomingBill;
  cycleFilter: CycleFilterType;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onSelectCycleFilter: (filter: CycleFilterType) => void;
}

export function formatCountdownIndo(days: number): string {
  if (days <= 0) return 'Hari ini';
  if (days === 1) return 'Besok';
  return `Dalam ${days} hari`;
}

export function TotalCommitmentCard({
  totalMonthlyCommitment,
  nearestBill,
  cycleFilter,
  theme,
  uiColors,
  onSelectCycleFilter,
}: TotalCommitmentCardProps) {
  const yearlyEstimate = Math.round(totalMonthlyCommitment * 12);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: uiColors.cardBg,
          borderColor: uiColors.cardBorder,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Total komitmen bulanan
        </Text>
        <Ionicons
          name="shield-checkmark-outline"
          size={19}
          color={uiColors.accentGreen}
        />
      </View>

      <Text
        style={[styles.totalAmountText, { color: theme.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatRupiah(totalMonthlyCommitment)}
      </Text>

      {/* Filter Siklus Tagihan: Semua | Bulanan | Tahunan */}
      <View
        style={[
          styles.cycleSwitcher,
          { backgroundColor: uiColors.switcherContainerBg },
        ]}
      >
        {(
          [
            { key: 'ALL', label: 'Semua' },
            { key: 'MONTHLY', label: 'Bulanan' },
            { key: 'YEARLY', label: 'Tahunan' },
          ] as const
        ).map((item) => {
          const active = cycleFilter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelectCycleFilter(item.key)}
              style={[
                styles.cycleTab,
                active && {
                  backgroundColor: uiColors.switcherActiveBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.cycleTabText,
                  {
                    color: active
                      ? uiColors.switcherActiveText
                      : theme.textSecondary,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Ringkasan Jatuh Tempo Terdekat & Estimasi Tahunan */}
      <View
        style={[
          styles.bottomMetaRow,
          { borderTopColor: uiColors.divider },
        ]}
      >
        <View style={styles.metaItem}>
          <View
            style={[
              styles.metaIconBox,
              { backgroundColor: uiColors.txIconBoxBg },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={uiColors.txIconColor}
            />
          </View>
          <View style={styles.metaTextCol}>
            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>
              Jatuh tempo terdekat
            </Text>
            <Text
              style={[styles.metaValue, { color: theme.text }]}
              numberOfLines={1}
            >
              {nearestBill
                ? `${nearestBill.name} (${formatCountdownIndo(nearestBill.daysUntilDue)})`
                : 'Belum ada jadwal'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.verticalDivider,
            { backgroundColor: uiColors.divider },
          ]}
        />

        <View style={styles.metaItem}>
          <View
            style={[
              styles.metaIconBox,
              { backgroundColor: uiColors.txIconBoxBg },
            ]}
          >
            <Feather
              name="repeat"
              size={13}
              color={uiColors.txIconColor}
            />
          </View>
          <View style={styles.metaTextCol}>
            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>
              Estimasi / tahun
            </Text>
            <Text
              style={[styles.metaValue, { color: uiColors.accentGreen }]}
              numberOfLines={1}
            >
              {formatRupiah(yearlyEstimate)}
            </Text>
          </View>
        </View>
      </View>
    </View>
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
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalAmountText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  cycleSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  cycleTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  cycleTabText: {
    fontSize: 12,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '400',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 26,
    marginHorizontal: 10,
  },
});

export default TotalCommitmentCard;
