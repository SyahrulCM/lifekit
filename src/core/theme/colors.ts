/**
 * LifeKit Design System Color Tokens & Themes
 * Sourced directly from Figma design system specifications.
 */

export const palette = {
  // Official Figma Brand Tokens
  primaryMint: '#78DAB7',      // Primary Mint Green: Aksen utama, tombol aktif, badge positif, icon
  lightMintSurface: '#EEF5F3', // Light Mint/Off-White Surface: Background card di Light Mode, container soft
  deepForestDark: '#101918',   // Deep Forest Dark: Background utama di Dark Mode
  darkMintSurface: '#182622',  // Dark Mint Card/Surface: Card/Surface di Dark Mode (exact screenshot tone)
  darkMintContainer: '#233D33',// Container sekunder
  mutedSage: '#95A7A2',        // Muted Sage / Subtext: Warna teks sekunder, label tanggal, border halus

  // Semantic & Auxiliary Accents
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  info: '#3B82F6',

  // Alpha / Overlays
  overlayDark: 'rgba(16, 25, 24, 0.65)',
  overlayLight: 'rgba(238, 245, 243, 0.65)',
} as const;

export type Palette = typeof palette;

export interface ThemeColors {
  // Primary brand / accents
  primary: string;
  tint: string;

  // Backgrounds & Surfaces
  background: string;
  surface: string;
  surfaceVariant: string;

  // Card surfaces
  card: string;
  cardSecondary: string;

  // Text hierarchy
  text: string;
  textSecondary: string;
  textMuted: string;

  // Borders & Dividers
  border: string;
  borderSubtle: string;

  // Navigation & Tabs
  tabIconDefault: string;
  tabIconSelected: string;

  // Feedback & Status
  error: string;
  warning: string;
  success: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  primary: palette.primaryMint,
  tint: palette.primaryMint,

  background: '#F5F8F7',
  surface: '#FFFFFF',
  surfaceVariant: '#EBF3EF',

  card: '#FFFFFF',
  cardSecondary: '#EEF5F2',

  text: palette.deepForestDark,
  textSecondary: '#5A716B',
  textMuted: '#879D96',

  border: '#DEE7E3',
  borderSubtle: 'rgba(149, 167, 162, 0.22)',

  tabIconDefault: '#6D857E',
  tabIconSelected: palette.primaryMint,

  error: palette.error,
  warning: palette.warning,
  success: palette.success,
  info: palette.info,
};

export const darkTheme: ThemeColors = {
  primary: palette.primaryMint,
  tint: palette.primaryMint,

  background: palette.deepForestDark,
  surface: palette.darkMintSurface,
  surfaceVariant: '#1F332C',

  card: palette.darkMintSurface,
  cardSecondary: palette.darkMintContainer,

  text: '#FFFFFF',
  textSecondary: palette.mutedSage,
  textMuted: '#6E807B',

  border: 'rgba(149, 167, 162, 0.14)',
  borderSubtle: 'rgba(149, 167, 162, 0.08)',

  tabIconDefault: '#7E938D',
  tabIconSelected: palette.primaryMint,

  error: palette.error,
  warning: palette.warning,
  success: palette.success,
  info: palette.info,
};

export const colors = {
  palette,
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeMode = 'light' | 'dark';

export default colors;
