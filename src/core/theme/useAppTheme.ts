/**
 * LifeKit - useAppTheme Hook
 * Menyediakan tema aktif ('dark' | 'light'), token warna lengkap, dan helper pengubah tema
 * yang terhubung langsung secara terpusat dengan useSettingsStore.
 */

import { useMemo, useCallback } from 'react';
import Colors, { type ThemeColors, type ThemeMode } from './colors';
import { useSettingsStore } from '@/src/features/profile/stores/useSettingsStore';
import { getSakuUIColors, type SakuUIColors } from '@/src/features/saku/utils/formatters';

export interface AppThemeResult {
  theme: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  uiColors: SakuUIColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export function useAppTheme(): AppThemeResult {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);

  const isDark = themeMode === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const uiColors = useMemo(() => getSakuUIColors(isDark), [isDark]);

  const toggleTheme = useCallback(() => {
    setThemeMode(isDark ? 'light' : 'dark');
  }, [isDark, setThemeMode]);

  return {
    theme,
    isDark,
    themeMode,
    uiColors,
    toggleTheme,
    setThemeMode,
  };
}

export default useAppTheme;
