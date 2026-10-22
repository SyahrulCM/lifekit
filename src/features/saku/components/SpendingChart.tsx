import React from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import {
  formatRupiah,
  type CategoryBreakdownItem,
  type SakuUIColors,
} from '../utils/formatters';

export interface SpendingChartProps {
  totalSpent: number;
  breakdown: CategoryBreakdownItem[];
  activeMonthLabel: string;
  selectedWalletLabel: string;
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function SpendingChart({
  totalSpent,
  breakdown,
  activeMonthLabel,
  selectedWalletLabel,
  isDark,
  theme,
  uiColors,
  onPrevMonth,
  onNextMonth,
}: SpendingChartProps) {
  const size = 132;
  const strokeWidth = 15;
  const innerSize = size - strokeWidth * 2;

  const primarySegmentColor = isDark ? palette.primaryMint : '#1B6F53';
  const secondarySegmentColor = isDark ? '#4B7D6D' : '#77A898';
  const tertiarySegmentColor = isDark ? '#2B443C' : '#D0DDD8';
  const ringTrackColor = isDark ? '#243932' : '#E3ECE8';

  const hasSpending = totalSpent > 0;
  const topPct = breakdown[0]?.percentage ?? 0;
  const secondPct = breakdown[1]?.percentage ?? 0;

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
      <View style={styles.sectionCardHeader}>
        <Text style={[styles.cardSectionTitle, { color: theme.text }]}>
          Monthly spending
        </Text>

        {/* Month Switcher (< OCT 2026 >) */}
        <View
          style={[
            styles.monthSwitcherContainer,
            { backgroundColor: uiColors.switcherContainerBg },
          ]}
        >
          <Pressable
            onPress={onPrevMonth}
            hitSlop={8}
            style={styles.monthArrowBtn}
          >
            <Ionicons
              name="chevron-back"
              size={15}
              color={theme.textSecondary}
            />
          </Pressable>

          <Text
            style={[styles.monthSelectorText, { color: theme.text }]}
          >
            {activeMonthLabel}
          </Text>

          <Pressable
            onPress={onNextMonth}
            hitSlop={8}
            style={styles.monthArrowBtn}
          >
            <Ionicons
              name="chevron-forward"
              size={15}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.spendingContentRow}>
        {/* Donut Ring */}
        <View style={[styles.donutWrapper, { width: size, height: size }]}>
          <View
            style={[
              styles.donutTrack,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: hasSpending ? tertiarySegmentColor : ringTrackColor,
              },
            ]}
          />

          {hasSpending && topPct > 0 && (
            <View
              style={[
                styles.donutArcOverlay,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderTopColor: primarySegmentColor,
                  borderRightColor:
                    topPct > 25 ? primarySegmentColor : 'transparent',
                  borderBottomColor:
                    topPct > 65 ? primarySegmentColor : 'transparent',
                  borderLeftColor: 'transparent',
                  transform: [{ rotate: '35deg' }],
                },
              ]}
            />
          )}

          {hasSpending && secondPct > 0 && (
            <View
              style={[
                styles.donutArcOverlay,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderWidth: strokeWidth,
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                  borderBottomColor: secondarySegmentColor,
                  borderLeftColor:
                    secondPct > 20 ? secondarySegmentColor : 'transparent',
                  transform: [{ rotate: '25deg' }],
                },
              ]}
            />
          )}

          {hasSpending && breakdown.some((b) => b.amount > 0) && (
            <>
              <View
                style={[
                  styles.donutDividerLine,
                  {
                    backgroundColor: isDark ? '#182622' : '#FFFFFF',
                    top: 0,
                    left: size / 2 - 1.5,
                    height: strokeWidth + 2,
                  },
                ]}
              />
              {secondPct > 0 && (
                <View
                  style={[
                    styles.donutDividerLine,
                    {
                      backgroundColor: isDark ? '#182622' : '#FFFFFF',
                      bottom: 14,
                      right: 22,
                      height: strokeWidth + 2,
                      transform: [{ rotate: '-35deg' }],
                    },
                  ]}
                />
              )}
              {(breakdown[2]?.percentage ?? 0) > 0 && (
                <View
                  style={[
                    styles.donutDividerLine,
                    {
                      backgroundColor: isDark ? '#182622' : '#FFFFFF',
                      top: 22,
                      left: 16,
                      height: strokeWidth + 2,
                      transform: [{ rotate: '-52deg' }],
                    },
                  ]}
                />
              )}
            </>
          )}

          <View
            style={[
              styles.donutInnerHole,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                backgroundColor: isDark ? '#182622' : '#FFFFFF',
              },
            ]}
          >
            <Text style={[styles.donutLabelTop, { color: theme.textSecondary }]}>
              Total spent
            </Text>
            <Text
              style={[styles.donutTotalValue, { color: theme.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatRupiah(totalSpent)}
            </Text>
            <Text
              style={[styles.donutLabelBottom, { color: theme.textSecondary }]}
            >
              {selectedWalletLabel}
            </Text>
          </View>
        </View>

        {/* Category Breakdown List */}
        <View style={styles.categoryListContainer}>
          {breakdown.map((item) => (
            <View key={item.category} style={styles.categoryItem}>
              <View style={styles.categoryHeaderLine}>
                <View style={styles.categoryNameRow}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text
                    style={[styles.categoryName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {item.category}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.categoryPercent,
                    { color: theme.textSecondary },
                  ]}
                >
                  {item.percentage}%
                </Text>
              </View>
              <Text
                style={[styles.categoryAmount, { color: theme.text }]}
                numberOfLines={1}
              >
                {formatRupiah(item.amount)}
              </Text>
            </View>
          ))}
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
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  monthSwitcherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  monthArrowBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    minWidth: 66,
    textAlign: 'center',
  },
  spendingContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutTrack: {
    position: 'absolute',
  },
  donutArcOverlay: {
    position: 'absolute',
  },
  donutDividerLine: {
    position: 'absolute',
    width: 3,
    zIndex: 5,
  },
  donutInnerHole: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    zIndex: 10,
  },
  donutLabelTop: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: 2,
  },
  donutTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  donutLabelBottom: {
    fontSize: 10,
    fontWeight: '400',
  },
  categoryListContainer: {
    flex: 1,
    gap: 12,
  },
  categoryItem: {
    justifyContent: 'center',
  },
  categoryHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 15,
  },
});

export default SpendingChart;
