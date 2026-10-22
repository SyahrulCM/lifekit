import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import type { SakuUIColors } from '@/src/features/saku/utils/formatters';

export interface WeeklyStripProps {
  completedCount: number;
  totalCount: number;
  bestStreak: number;
  nextHabitTitle?: string;
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
}

interface DayNode {
  key: string;
  label: string;
  dateNum: number;
  isToday: boolean;
  isPast: boolean;
}

function getWeekDaysIndo(): DayNode[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Minggu, 1 = Senin, ...
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  return labels.map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const itemMidnight = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).getTime();

    return {
      key: `${label}-${d.getDate()}`,
      label,
      dateNum: d.getDate(),
      isToday,
      isPast: itemMidnight < todayMidnight,
    };
  });
}

export function WeeklyStrip({
  completedCount,
  totalCount,
  bestStreak,
  nextHabitTitle,
  isDark,
  theme,
  uiColors,
}: WeeklyStripProps) {
  const weekDays = useMemo(() => getWeekDaysIndo(), []);
  const ringSize = 86;
  const ringStroke = 8;
  const trackColor = isDark ? '#243932' : '#E3ECE8';
  const ratio = totalCount > 0 ? completedCount / totalCount : 0;
  const allCompletedToday = totalCount > 0 && completedCount === totalCount;

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
      {/* Top Progress & Streak Summary */}
      <View style={styles.summaryRow}>
        {/* Circular Progress Ring */}
        <View
          style={[
            styles.ringContainer,
            { width: ringSize, height: ringSize },
          ]}
        >
          <View
            style={[
              styles.ringTrack,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: ringStroke,
                borderColor: trackColor,
              },
            ]}
          />
          {ratio > 0 && (
            <View
              style={[
                styles.ringProgress,
                {
                  width: ringSize,
                  height: ringSize,
                  borderRadius: ringSize / 2,
                  borderWidth: ringStroke,
                  borderTopColor: uiColors.accentGreen,
                  borderRightColor:
                    ratio >= 0.25 ? uiColors.accentGreen : 'transparent',
                  borderBottomColor:
                    ratio >= 0.5 ? uiColors.accentGreen : 'transparent',
                  borderLeftColor:
                    ratio >= 0.99 ? uiColors.accentGreen : 'transparent',
                  transform: [{ rotate: '45deg' }],
                },
              ]}
            />
          )}
          <Text style={[styles.ringValueText, { color: theme.text }]}>
            {`${completedCount}/${totalCount}`}
          </Text>
          <Text style={[styles.ringSubText, { color: theme.textSecondary }]}>
            selesai
          </Text>
        </View>

        {/* Streak & Motivation */}
        <View style={styles.infoCol}>
          <View style={styles.streakBadgeRow}>
            <Ionicons
              name="flame"
              size={18}
              color={uiColors.accentGreen}
            />
            <Text style={[styles.streakTitle, { color: theme.text }]}>
              {`${bestStreak} hari streak`}
            </Text>
          </View>

          <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
            {allCompletedToday
              ? 'Luar biasa! Semua rutinitas hari ini telah tuntas.'
              : 'Konsistensi kecil setiap hari membawa perubahan besar.'}
          </Text>

          {nextHabitTitle ? (
            <Text
              style={[styles.upNextText, { color: uiColors.accentGreen }]}
              numberOfLines={1}
            >
              {`Selanjutnya: ${nextHabitTitle}`}
            </Text>
          ) : totalCount > 0 ? (
            <Text
              style={[styles.upNextText, { color: uiColors.accentGreen }]}
              numberOfLines={1}
            >
              Target harian tercapai ✓
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={[styles.divider, { backgroundColor: uiColors.divider }]}
      />

      {/* Baris Hari (Sen - Min) */}
      <View style={styles.weekStripRow}>
        {weekDays.map((day) => {
          const isHighlighted = day.isToday;
          const circleBg = isHighlighted
            ? uiColors.fabBg
            : day.isPast && bestStreak > 0
            ? uiColors.switcherActiveBg
            : uiColors.switcherContainerBg;

          const textColor = isHighlighted
            ? isDark
              ? palette.deepForestDark
              : '#FFFFFF'
            : day.isPast && bestStreak > 0
            ? uiColors.switcherActiveText
            : theme.textSecondary;

          return (
            <View key={day.key} style={styles.dayCol}>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isHighlighted
                      ? uiColors.accentGreen
                      : theme.textSecondary,
                    fontWeight: isHighlighted ? '700' : '500',
                  },
                ]}
              >
                {day.label}
              </Text>

              <View
                style={[
                  styles.dayCircle,
                  { backgroundColor: circleBg },
                ]}
              >
                {isHighlighted && allCompletedToday ? (
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={isDark ? palette.deepForestDark : '#FFFFFF'}
                  />
                ) : (
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: textColor,
                        fontWeight: isHighlighted ? '700' : '600',
                      },
                    ]}
                  >
                    {day.dateNum}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ringTrack: {
    position: 'absolute',
  },
  ringProgress: {
    position: 'absolute',
  },
  ringValueText: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  ringSubText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  streakBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  streakTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitleText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  upNextText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 14,
  },
  weekStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLabel: {
    fontSize: 11,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 12,
  },
});

export default WeeklyStrip;
