/**
 * LifeKit - Settings & Profile Zustand Store
 * Mengelola preferensi pengguna: bahasa, tema, format mata uang, status master notifikasi, dan biometrik.
 */

import { create } from 'zustand';

export type Language = 'id' | 'en';
export type ThemeMode = 'dark' | 'light';
export type CurrencyFormat = 'IDR' | 'USD';

export interface UserProfile {
  name: string;
  avatarText: string;
}

export interface SettingsState {
  // Preferensi
  language: Language;
  themeMode: ThemeMode;
  currency: CurrencyFormat;

  // Notifikasi & Keamanan
  masterNotificationEnabled: boolean;
  biometricLockEnabled: boolean;

  // Data Profil
  profile: UserProfile;

  // Actions
  setLanguage: (lang: Language) => void;
  setThemeMode: (theme: ThemeMode) => void;
  setCurrency: (currency: CurrencyFormat) => void;
  setMasterNotification: (enabled: boolean) => void;
  setBiometricLock: (enabled: boolean) => void;
  updateProfileName: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'id',
  themeMode: 'dark',
  currency: 'IDR',
  masterNotificationEnabled: true,
  biometricLockEnabled: false,
  profile: {
    name: 'Pengguna LifeKit',
    avatarText: 'LK',
  },

  setLanguage: (language) => set({ language }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setCurrency: (currency) => set({ currency }),
  setMasterNotification: (masterNotificationEnabled) =>
    set({ masterNotificationEnabled }),
  setBiometricLock: (biometricLockEnabled) => set({ biometricLockEnabled }),
  updateProfileName: (name) =>
    set((state) => ({
      profile: {
        ...state.profile,
        name: name.trim() || 'Pengguna LifeKit',
        avatarText: (name.trim() || 'LK')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
      },
    })),
}));

export default useSettingsStore;
