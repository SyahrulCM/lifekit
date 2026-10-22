import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import { useSettingsStore } from '@/src/features/profile/stores/useSettingsStore';
import { useI18n } from '@/src/core/i18n';
import {
  formatHeaderDate,
  getGreeting,
  type SakuUIColors,
} from '@/src/features/saku/utils/formatters';

export interface RutinitasHeaderProps {
  completedCount: number;
  totalCount: number;
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onToggleTheme?: () => void;
}

export function RutinitasHeader({
  completedCount,
  totalCount,
  isDark,
  theme,
  uiColors,
  onToggleTheme,
}: RutinitasHeaderProps) {
  const profile = useSettingsStore((s) => s.profile);
  const { language, i18n, format } = useI18n();

  return (
    <View>
      {/* Top Brand Bar */}
      <View style={styles.topBarRow}>
        <View style={styles.brandRow}>
          <View
            style={[
              styles.logoBadge,
              { backgroundColor: uiColors.accentGreen },
            ]}
          >
            <Ionicons
              name="layers-outline"
              size={18}
              color={isDark ? palette.deepForestDark : '#FFFFFF'}
            />
          </View>
          <View>
            <Text style={[styles.brandText, { color: theme.text }]}>
              LifeKit
            </Text>
            <Text
              style={[styles.greetingSubtext, { color: theme.textSecondary }]}
            >
              {getGreeting(language, profile.name)}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/profile')}
          style={[
            styles.avatarButton,
            {
              backgroundColor: isDark
                ? 'rgba(120, 218, 183, 0.12)'
                : 'rgba(16, 25, 24, 0.08)',
              borderColor: uiColors.accentGreen,
            },
          ]}
          accessibilityLabel={i18n.nav.profile}
        >
          <Text style={[styles.avatarText, { color: uiColors.accentGreen }]}>
            {profile.avatarText || 'LK'}
          </Text>
        </Pressable>
      </View>

      {/* Title, Date & Small Completion Summary */}
      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>
            {i18n.rutinitas.title}
          </Text>

          <View
            style={[
              styles.summaryBadge,
              { backgroundColor: uiColors.switcherActiveBg },
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={14}
              color={uiColors.switcherActiveText}
            />
            <Text
              style={[
                styles.summaryBadgeText,
                { color: uiColors.switcherActiveText },
              ]}
            >
              {totalCount > 0
                ? format(i18n.rutinitas.summaryFormat, {
                    completed: completedCount,
                    total: totalCount,
                  })
                : i18n.rutinitas.noHabitsSummary}
            </Text>
          </View>
        </View>

        <Text style={[styles.screenDate, { color: theme.textSecondary }]}>
          {formatHeaderDate(new Date(), language)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  greetingSubtext: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleSection: {
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  screenDate: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default RutinitasHeader;
