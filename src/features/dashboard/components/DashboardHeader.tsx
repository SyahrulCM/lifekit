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

export interface DashboardHeaderProps {
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onToggleTheme?: () => void;
}

export function DashboardHeader({
  isDark,
  theme,
  uiColors,
  onToggleTheme,
}: DashboardHeaderProps) {
  const profile = useSettingsStore((s) => s.profile);
  const { language, i18n } = useI18n();

  return (
    <View>
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
          <Text style={[styles.brandText, { color: theme.text }]}>LifeKit</Text>
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

      <View style={styles.titleSection}>
        <Text style={[styles.greetingTitle, { color: theme.text }]}>
          {getGreeting(language, profile.name)}
        </Text>
        <Text style={[styles.dateSubtitle, { color: theme.textSecondary }]}>
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
  greetingTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  dateSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
});

export default DashboardHeader;
