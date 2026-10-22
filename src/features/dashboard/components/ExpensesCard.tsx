import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import { useI18n } from '@/src/core/i18n';
import { useSettingsStore } from '@/src/features/profile/stores/useSettingsStore';
import {
  formatCurrency,
  type SakuUIColors,
} from '@/src/features/saku/utils/formatters';

export interface ExpensesCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlySpent: number;
  monthLabel: string;
  hasTransactions: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onPressCard: () => void;
  onPressAdd: () => void;
}

export function ExpensesCard({
  totalBalance,
  monthlyIncome,
  monthlySpent,
  monthLabel,
  hasTransactions,
  theme,
  uiColors,
  onPressCard,
  onPressAdd,
}: ExpensesCardProps) {
  const { i18n } = useI18n();
  const currency = useSettingsStore((s) => s.currency);

  return (
    <Pressable
      onPress={onPressCard}
      style={[
        styles.card,
        {
          backgroundColor: uiColors.cardBg,
          borderColor: uiColors.cardBorder,
        },
      ]}
    >
      {/* Card Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons
            name="wallet-outline"
            size={19}
            color={uiColors.accentGreen}
          />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {i18n.nav.saku}
          </Text>
        </View>

        <Text style={[styles.monthText, { color: theme.textSecondary }]}>
          {monthLabel}
        </Text>
      </View>

      {/* Balance & Quick Add Row */}
      <View style={styles.balanceMainRow}>
        <View style={styles.balanceTextCol}>
          <Text style={[styles.balanceCaption, { color: theme.textSecondary }]}>
            {i18n.dashboard.totalBalance}
          </Text>
          <Text
            style={[styles.balanceAmount, { color: theme.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(totalBalance, currency)}
          </Text>
          {!hasTransactions && (
            <Text style={[styles.emptyHintText, { color: theme.textSecondary }]}>
              {i18n.dashboard.noTransactions}
            </Text>
          )}
        </View>

        <Pressable
          onPress={onPressAdd}
          style={({ pressed }) => [
            styles.addCircleBtn,
            {
              backgroundColor: uiColors.fabBg,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
        >
          <Feather name="plus" size={22} color={uiColors.fabIcon} />
        </Pressable>
      </View>

      {/* Divider */}
      <View
        style={[styles.divider, { backgroundColor: uiColors.divider }]}
      />

      {/* Income & Spent Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryIconBox,
              { backgroundColor: uiColors.incomePillBg },
            ]}
          >
            <Feather
              name="arrow-down-left"
              size={16}
              color={uiColors.incomePillText}
            />
          </View>
          <View style={styles.summaryTextCol}>
            <Text
              style={[styles.summaryLabel, { color: theme.textSecondary }]}
            >
              {i18n.dashboard.monthlyIncome}
            </Text>
            <Text
              style={[styles.summaryValue, { color: uiColors.incomePillText }]}
              numberOfLines={1}
            >
              {formatCurrency(monthlyIncome, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryIconBox,
              { backgroundColor: uiColors.expensePillBg },
            ]}
          >
            <Feather
              name="arrow-up-right"
              size={16}
              color={uiColors.expensePillText}
            />
          </View>
          <View style={styles.summaryTextCol}>
            <Text
              style={[styles.summaryLabel, { color: theme.textSecondary }]}
            >
              {i18n.dashboard.monthlySpent}
            </Text>
            <Text
              style={[styles.summaryValue, { color: uiColors.expensePillText }]}
              numberOfLines={1}
            >
              {formatCurrency(monthlySpent, currency)}
            </Text>
          </View>
        </View>
      </View>
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
  monthText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  balanceMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceTextCol: {
    flex: 1,
  },
  balanceCaption: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  emptyHintText: {
    fontSize: 11,
    marginTop: 4,
  },
  addCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ExpensesCard;
