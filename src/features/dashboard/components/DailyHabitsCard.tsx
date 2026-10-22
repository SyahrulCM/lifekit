import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import { useI18n } from '@/src/core/i18n';
import type { SakuUIColors } from '@/src/features/saku/utils/formatters';

export interface DashboardHabitItem {
  id: string;
  title: string;
  completedToday: boolean;
  streakCurrent: number;
}

export interface DailyHabitsCardProps {
  habits: DashboardHabitItem[];
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onPressNavigate: () => void;
}

interface WeekDayNode {
  key: string;
  dayLetter: string;
  dateNumber: number;
  isToday: boolean;
}

function getCurrentWeekDays(isId: boolean): WeekDayNode[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ...
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const lettersEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const lettersId = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
  const letters = isId ? lettersId : lettersEn;

  return letters.map((letter, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    return {
      key: `${idx}-${d.getDate()}`,
      dayLetter: letter,
      dateNumber: d.getDate(),
      isToday,
    };
  });
}

export function DailyHabitsCard({
  habits,
  isDark,
  theme,
  uiColors,
  onPressNavigate,
}: DailyHabitsCardProps) {
  const { i18n, isId } = useI18n();
  const weekDays = useMemo(() => getCurrentWeekDays(isId), [isId]);
  const totalCount = habits.length;
  const completedCount = habits.filter((h) => h.completedToday).length;
  const bestStreak = habits.reduce(
    (max, h) => (h.streakCurrent > max ? h.streakCurrent : max),
    0
  );
  const nextHabit = habits.find((h) => !h.completedToday);

  const ringSize = 88;
  const ringStroke = 8;
  const trackColor = isDark ? '#253932' : '#E6EFEA';

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
            name="checkmark-circle-outline"
            size={20}
            color={uiColors.accentGreen}
          />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {i18n.dashboard.dailyHabits}
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

      {totalCount > 0 ? (
        <View style={styles.mainContentRow}>
          {/* Circular Progress */}
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
            {completedCount > 0 && (
              <View
                style={[
                  styles.ringProgress,
                  {
                    width: ringSize,
                    height: ringSize,
                    borderRadius: ringSize / 2,
                    borderWidth: ringStroke,
                    borderTopColor: uiColors.accentGreen,
                    borderRightColor: uiColors.accentGreen,
                    borderBottomColor:
                      completedCount / totalCount >= 0.5
                        ? uiColors.accentGreen
                        : 'transparent',
                    borderLeftColor:
                      completedCount === totalCount
                        ? uiColors.accentGreen
                        : 'transparent',
                    transform: [{ rotate: '45deg' }],
                  },
                ]}
              />
            )}
            <Text style={[styles.ringValueText, { color: theme.text }]}>
              {`${completedCount}/${totalCount}`}
            </Text>
            <Text
              style={[styles.ringSubText, { color: theme.textSecondary }]}
            >
              {i18n.dashboard.completedOf}
            </Text>
          </View>

          {/* Right Info */}
          <View style={styles.habitInfoCol}>
            <View style={styles.streakRow}>
              <Ionicons
                name="flame-outline"
                size={18}
                color={uiColors.accentGreen}
              />
              <Text style={[styles.streakTitle, { color: theme.text }]}>
                {`${bestStreak} ${i18n.common.days}`}
              </Text>
            </View>
            <Text
              style={[styles.habitQuote, { color: theme.textSecondary }]}
            >
              {isId ? 'Kemajuan kecil setiap hari.' : 'A little progress, every day.'}
            </Text>
            {nextHabit && (
              <Text
                style={[styles.upNextText, { color: uiColors.accentGreen }]}
                numberOfLines={1}
              >
                {`${isId ? 'Berikutnya' : 'Up next'}: ${nextHabit.title}`}
              </Text>
            )}
          </View>
        </View>
      ) : (
        /* Empty State tanpa dummy data */
        <View style={styles.emptyContentRow}>
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
            <Text style={[styles.ringValueText, { color: theme.text }]}>
              0/0
            </Text>
            <Text
              style={[styles.ringSubText, { color: theme.textSecondary }]}
            >
              {i18n.dashboard.completedOf}
            </Text>
          </View>

          <View style={styles.habitInfoCol}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {i18n.dashboard.noHabits}
            </Text>
            <Text
              style={[styles.habitQuote, { color: theme.textSecondary }]}
            >
              {isId
                ? 'Bangun kebiasaan baik dan lacak progres harianmu.'
                : 'Build healthy routines and track your daily progress.'}
            </Text>
            <Pressable
              onPress={onPressNavigate}
              style={[
                styles.ctaChip,
                { backgroundColor: uiColors.badgeBg },
              ]}
            >
              <Feather name="plus" size={13} color={uiColors.badgeText} />
              <Text
                style={[styles.ctaChipText, { color: uiColors.badgeText }]}
              >
                {i18n.dashboard.addHabit}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Weekly Calendar Strip */}
      <View style={styles.weekRow}>
        {weekDays.map((day) => {
          const activeCircleBg = day.isToday
            ? uiColors.fabBg
            : uiColors.switcherContainerBg;
          const activeTextColor = day.isToday
            ? isDark
              ? palette.deepForestDark
              : '#FFFFFF'
            : theme.textSecondary;

          return (
            <View key={day.key} style={styles.weekDayCol}>
              <Text
                style={[
                  styles.weekDayLetter,
                  {
                    color: day.isToday
                      ? uiColors.accentGreen
                      : theme.textSecondary,
                    fontWeight: day.isToday ? '700' : '500',
                  },
                ]}
              >
                {day.dayLetter}
              </Text>
              <View
                style={[
                  styles.weekDateCircle,
                  { backgroundColor: activeCircleBg },
                ]}
              >
                <Text
                  style={[
                    styles.weekDateNumber,
                    {
                      color: activeTextColor,
                      fontWeight: day.isToday ? '700' : '500',
                    },
                  ]}
                >
                  {day.dateNumber}
                </Text>
              </View>
            </View>
          );
        })}
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
    marginBottom: 16,
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
  mainContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 18,
  },
  emptyContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 18,
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
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  ringSubText: {
    fontSize: 10,
    fontWeight: '400',
    marginTop: 1,
  },
  habitInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  streakTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  habitQuote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  upNextText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ctaChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  ctaChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  weekDayCol: {
    alignItems: 'center',
    gap: 6,
  },
  weekDayLetter: {
    fontSize: 11,
  },
  weekDateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDateNumber: {
    fontSize: 11,
  },
});

export default DailyHabitsCard;
