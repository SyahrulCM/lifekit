import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import type { WalletBalances } from '../types';
import {
  WALLETS,
  WALLET_FILTER_MAP,
  WALLET_TO_FILTER_MAP,
  formatRupiah,
  type WalletFilterType,
  type SakuUIColors,
} from '../utils/formatters';

export interface BalanceCardProps {
  totalBalance: number;
  walletBalances: WalletBalances;
  walletFilter: WalletFilterType;
  totalIncome: number;
  totalExpense: number;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onSelectWalletFilter: (filter: WalletFilterType) => void;
}

export function BalanceCard({
  totalBalance,
  walletBalances,
  walletFilter,
  totalIncome,
  totalExpense,
  theme,
  uiColors,
  onSelectWalletFilter,
}: BalanceCardProps) {
  const isAllSelected = walletFilter === 'ALL';
  const activeWalletName = isAllSelected
    ? 'all wallets'
    : WALLET_FILTER_MAP[walletFilter];

  const displayedBalance = isAllSelected
    ? totalBalance
    : walletBalances[WALLET_FILTER_MAP[walletFilter]] ?? 0;

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
      <View style={styles.balanceHeaderRow}>
        <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>
          {`Total balance · ${activeWalletName}`}
        </Text>

        <Pressable
          onPress={() => onSelectWalletFilter('ALL')}
          hitSlop={8}
          style={[
            styles.allWalletsChip,
            {
              backgroundColor: isAllSelected
                ? uiColors.switcherActiveBg
                : uiColors.switcherContainerBg,
              borderColor: isAllSelected ? uiColors.accentGreen : 'transparent',
            },
          ]}
        >
          <Ionicons
            name="wallet-outline"
            size={14}
            color={
              isAllSelected ? uiColors.switcherActiveText : theme.textSecondary
            }
          />
          <Text
            style={[
              styles.allWalletsChipText,
              {
                color: isAllSelected
                  ? uiColors.switcherActiveText
                  : theme.textSecondary,
                fontWeight: isAllSelected ? '700' : '500',
              },
            ]}
          >
            All
          </Text>
        </Pressable>
      </View>

      <Text
        style={[styles.totalBalanceText, { color: theme.text }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatRupiah(displayedBalance)}
      </Text>

      <View
        style={[
          styles.walletSwitcher,
          { backgroundColor: uiColors.switcherContainerBg },
        ]}
      >
        {WALLETS.map((wallet) => {
          const filterKey = WALLET_TO_FILTER_MAP[wallet];
          const isSelected = walletFilter === filterKey;
          const balance = walletBalances[wallet] ?? 0;

          return (
            <Pressable
              key={wallet}
              onPress={() =>
                onSelectWalletFilter(isSelected ? 'ALL' : filterKey)
              }
              style={[
                styles.walletTab,
                isSelected && {
                  backgroundColor: uiColors.switcherActiveBg,
                  borderColor: uiColors.accentGreen,
                },
              ]}
            >
              <Text
                style={[
                  styles.walletTabName,
                  {
                    color: isSelected
                      ? uiColors.switcherActiveText
                      : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {wallet}
              </Text>
              <Text
                style={[
                  styles.walletTabAmount,
                  {
                    color: isSelected
                      ? uiColors.switcherActiveText
                      : theme.text,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatRupiah(balance)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.incomeExpenseRow,
          { borderTopColor: uiColors.divider },
        ]}
      >
        <View style={styles.incomeExpenseItem}>
          <View
            style={[
              styles.miniFlowIcon,
              { backgroundColor: uiColors.incomePillBg },
            ]}
          >
            <Feather
              name="arrow-down-left"
              size={13}
              color={uiColors.incomePillText}
            />
          </View>
          <View style={styles.incomeExpenseTextCol}>
            <Text
              style={[
                styles.incomeExpenseLabel,
                { color: theme.textSecondary },
              ]}
            >
              Income
            </Text>
            <Text
              style={[
                styles.incomeExpenseValue,
                { color: uiColors.incomePillText },
              ]}
              numberOfLines={1}
            >
              {formatRupiah(totalIncome)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.verticalDivider,
            { backgroundColor: uiColors.divider },
          ]}
        />

        <View style={styles.incomeExpenseItem}>
          <View
            style={[
              styles.miniFlowIcon,
              { backgroundColor: uiColors.expensePillBg },
            ]}
          >
            <Feather
              name="arrow-up-right"
              size={13}
              color={uiColors.expensePillText}
            />
          </View>
          <View style={styles.incomeExpenseTextCol}>
            <Text
              style={[
                styles.incomeExpenseLabel,
                { color: theme.textSecondary },
              ]}
            >
              Expense
            </Text>
            <Text
              style={[
                styles.incomeExpenseValue,
                { color: uiColors.expensePillText },
              ]}
              numberOfLines={1}
            >
              {formatRupiah(totalExpense)}
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
  balanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  allWalletsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  allWalletsChipText: {
    fontSize: 12,
  },
  totalBalanceText: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  walletSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  walletTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  walletTabName: {
    fontSize: 12,
    marginBottom: 3,
  },
  walletTabAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  incomeExpenseItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniFlowIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeExpenseTextCol: {
    flex: 1,
  },
  incomeExpenseLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  incomeExpenseValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 26,
    marginHorizontal: 10,
  },
});

export default BalanceCard;
