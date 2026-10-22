import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import type { Transaction } from '../types';
import {
  formatRupiah,
  formatTransactionDateTime,
  getTransactionIcon,
  type SakuUIColors,
} from '../utils/formatters';

export interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isSubmitting: boolean;
  showAllTransactions: boolean;
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  topSlot?: React.ReactNode;
  onRefresh: () => void;
  onToggleShowAll: () => void;
  onDeleteTransaction: (item: Transaction) => void;
  onOpenAddModal: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  isSubmitting,
  showAllTransactions,
  isDark,
  theme,
  uiColors,
  topSlot,
  onRefresh,
  onToggleShowAll,
  onDeleteTransaction,
  onOpenAddModal,
}: TransactionListProps) {
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {topSlot}

      <View style={styles.recentHeaderRow}>
        <Text style={[styles.recentSectionTitle, { color: theme.text }]}>
          Recent transactions
        </Text>
        {transactions.length > 5 && (
          <Pressable onPress={onToggleShowAll} hitSlop={8}>
            <Text style={[styles.viewAllText, { color: uiColors.accentGreen }]}>
              {showAllTransactions ? 'Show less' : 'View all'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderItem = ({ item, index }: { item: Transaction; index: number }) => {
    const isIncome = item.type === 'income';
    const iconSpec = getTransactionIcon(item);
    const isFirst = index === 0;
    const isLast = index === transactions.length - 1;

    return (
      <Pressable
        onLongPress={() => onDeleteTransaction(item)}
        style={[
          styles.txItemWrapper,
          {
            backgroundColor: uiColors.cardBg,
            borderLeftColor: uiColors.cardBorder,
            borderRightColor: uiColors.cardBorder,
          },
          isFirst && {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            borderTopWidth: 1,
            borderTopColor: uiColors.cardBorder,
            paddingTop: 16,
          },
          isLast && {
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            borderBottomWidth: 1,
            borderBottomColor: uiColors.cardBorder,
            paddingBottom: 16,
          },
        ]}
      >
        <View style={styles.txRow}>
          <View
            style={[
              styles.txIconBox,
              { backgroundColor: uiColors.txIconBoxBg },
            ]}
          >
            {iconSpec.family === 'mci' && (
              <MaterialCommunityIcons
                name={iconSpec.name as any}
                size={20}
                color={uiColors.txIconColor}
              />
            )}
            {iconSpec.family === 'feather' && (
              <Feather
                name={iconSpec.name as any}
                size={20}
                color={uiColors.txIconColor}
              />
            )}
            {iconSpec.family === 'ionicons' && (
              <Ionicons
                name={iconSpec.name as any}
                size={20}
                color={uiColors.txIconColor}
              />
            )}
          </View>

          <View style={styles.txInfoCol}>
            <Text
              style={[styles.txTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.note || item.category}
            </Text>
            <Text
              style={[styles.txSubtext, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {formatTransactionDateTime(item.createdAt)} · {item.wallet}
            </Text>
          </View>

          <View
            style={[
              styles.txAmountPill,
              {
                backgroundColor: isIncome
                  ? uiColors.incomePillBg
                  : uiColors.expensePillBg,
              },
            ]}
          >
            <Text
              style={[
                styles.txAmountText,
                {
                  color: isIncome
                    ? uiColors.incomePillText
                    : uiColors.expensePillText,
                },
              ]}
            >
              {formatRupiah(item.amount, item.type)}
            </Text>
          </View>
        </View>

        {!isLast && (
          <View
            style={[
              styles.txDivider,
              { backgroundColor: uiColors.divider },
            ]}
          />
        )}
      </Pressable>
    );
  };

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
          name="wallet-outline"
          size={30}
          color={uiColors.txIconColor}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Belum Ada Transaksi
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Catat pemasukan dan pengeluaran harianmu. Semua data tersimpan aman secara offline di perangkat ini.
      </Text>

      <View style={styles.emptyActionRow}>
        <Pressable
          onPress={onOpenAddModal}
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
            Tambah Transaksi
          </Text>
        </Pressable>
      </View>
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
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
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
          onRefresh={onRefresh}
          tintColor={uiColors.accentGreen}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },
  headerContainer: {
    marginBottom: 4,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  recentSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  recentActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  txItemWrapper: {
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  txIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  txSubtext: {
    fontSize: 12,
    fontWeight: '400',
  },
  txAmountPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  txDivider: {
    height: 1,
    width: '100%',
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
  emptyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  emptyPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptySecondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  emptySecondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
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
    marginTop: 18,
    paddingLeft: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TransactionList;
