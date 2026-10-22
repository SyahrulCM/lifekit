import Colors, { palette, type ThemeColors } from '@/src/core/theme/colors';
import type { Transaction, WalletType } from '../types';

export type WalletFilterType = 'ALL' | 'CASH' | 'BANK' | 'E-WALLET';

export const WALLETS: WalletType[] = ['Cash', 'Bank', 'E-Wallet'];

export const WALLET_FILTER_MAP: Record<Exclude<WalletFilterType, 'ALL'>, WalletType> = {
  CASH: 'Cash',
  BANK: 'Bank',
  'E-WALLET': 'E-Wallet',
};

export const WALLET_TO_FILTER_MAP: Record<WalletType, Exclude<WalletFilterType, 'ALL'>> = {
  Cash: 'CASH',
  Bank: 'BANK',
  'E-Wallet': 'E-WALLET',
};

export const EXPENSE_CATEGORIES = ['Food', 'Bills', 'Transport', 'Shopping', 'Health', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export interface SakuUIColors {
  screenBg: string;
  cardBg: string;
  cardBorder: string;
  accentGreen: string;
  badgeBg: string;
  badgeText: string;
  switcherContainerBg: string;
  switcherActiveBg: string;
  switcherActiveText: string;
  txIconBoxBg: string;
  txIconColor: string;
  expensePillBg: string;
  expensePillText: string;
  incomePillBg: string;
  incomePillText: string;
  fabBg: string;
  fabIcon: string;
  divider: string;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export function getSakuUIColors(isDark: boolean): SakuUIColors {
  return {
    screenBg: isDark ? Colors.dark.background : '#F4F8F6',
    cardBg: isDark ? '#182622' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(149, 167, 162, 0.12)' : 'rgba(223, 232, 229, 0.7)',
    accentGreen: isDark ? palette.primaryMint : '#1B6F53',
    badgeBg: isDark ? '#1D332B' : '#E3F2EC',
    badgeText: isDark ? palette.primaryMint : '#1B6F53',
    switcherContainerBg: isDark ? '#20312C' : '#F0F5F3',
    switcherActiveBg: isDark ? '#264339' : '#DCF0E7',
    switcherActiveText: isDark ? palette.primaryMint : '#1B6F53',
    txIconBoxBg: isDark ? '#21342E' : '#EAF3EF',
    txIconColor: isDark ? palette.primaryMint : '#1B6F53',
    expensePillBg: isDark ? '#382224' : '#FDECEC',
    expensePillText: isDark ? '#F28B82' : '#C64747',
    incomePillBg: isDark ? '#1D3930' : '#E0F4EB',
    incomePillText: isDark ? palette.primaryMint : '#1B6F53',
    fabBg: isDark ? palette.primaryMint : '#1B6F53',
    fabIcon: isDark ? palette.deepForestDark : '#FFFFFF',
    divider: isDark ? 'rgba(149, 167, 162, 0.12)' : '#EEF3F1',
  };
}

export function formatCurrency(
  amount: number,
  currency: 'IDR' | 'USD' = 'IDR',
  showSign?: 'income' | 'expense'
): string {
  const absVal = Math.abs(Math.round(amount));

  if (currency === 'USD') {
    const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (showSign === 'income') return `+$${formatted}`;
    if (showSign === 'expense' || amount < 0) return `-$${formatted}`;
    return `$${formatted}`;
  }

  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (showSign === 'income') return `+Rp ${formatted}`;
  if (showSign === 'expense' || amount < 0) return `-Rp ${formatted}`;
  return `Rp ${formatted}`;
}

export function formatRupiah(amount: number, showSign?: 'income' | 'expense'): string {
  return formatCurrency(amount, 'IDR', showSign);
}

/**
 * Format tanggal dan waktu detail: "DD MMM YYYY, HH:mm" (contoh: "22 Oct 2026, 12:30")
 */
export function formatTransactionDateTime(dateStr: string, lang: 'id' | 'en' = 'id'): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const monthsId = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
    ];
    const monthsEn = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const months = lang === 'en' ? monthsEn : monthsId;
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string, lang: 'id' | 'en' = 'id'): string {
  return formatTransactionDateTime(dateStr, lang);
}

export function formatMonthYearLabel(month: number, year: number): string {
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${months[month] ?? 'JAN'} ${year}`;
}

export function isSameMonthAndYear(
  dateStr: string,
  month: number,
  year: number
): boolean {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  return date.getMonth() === month && date.getFullYear() === year;
}

export function formatHeaderDate(date: Date, lang: 'id' | 'en' = 'id'): string {
  if (lang === 'en') {
    const daysEn = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday',
    ];
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${daysEn[date.getDay()]}, ${monthsEn[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  const daysId = [
    'Minggu', 'Senin', 'Selasa', 'Rabu',
    'Kamis', 'Jumat', 'Sabtu',
  ];
  const monthsId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  return `${daysId[date.getDay()]}, ${date.getDate()} ${monthsId[date.getMonth()]} ${date.getFullYear()}`;
}

export function getGreeting(lang: 'id' | 'en' = 'id', name: string = 'Alex'): string {
  const hour = new Date().getHours();
  const firstName = name.trim().split(' ')[0] || (lang === 'en' ? 'Friend' : 'Kawan');

  if (lang === 'en') {
    if (hour < 12) return `Good Morning, ${firstName}`;
    if (hour < 18) return `Good Afternoon, ${firstName}`;
    return `Good Evening, ${firstName}`;
  }

  if (hour < 11) return `Selamat Pagi, ${firstName}`;
  if (hour < 15) return `Selamat Siang, ${firstName}`;
  if (hour < 18) return `Selamat Sore, ${firstName}`;
  return `Selamat Malam, ${firstName}`;
}

export function getTransactionIcon(tx: Transaction): {
  family: 'ionicons' | 'mci' | 'feather';
  name: string;
} {
  const text = `${tx.category} ${tx.note ?? ''}`.toLowerCase();

  if (tx.type === 'income') {
    return { family: 'feather', name: 'arrow-down-left' };
  }
  if (text.includes('food') || text.includes('lunch') || text.includes('warung') || text.includes('makan')) {
    return { family: 'mci', name: 'silverware-fork-knife' };
  }
  if (text.includes('internet') || text.includes('wifi') || text.includes('bill') || text.includes('tagihan')) {
    return { family: 'ionicons', name: 'wifi' };
  }
  if (text.includes('transport') || text.includes('fuel') || text.includes('bensin') || text.includes('ojek')) {
    return { family: 'ionicons', name: 'car-outline' };
  }
  if (text.includes('shop') || text.includes('belanja')) {
    return { family: 'ionicons', name: 'bag-handle-outline' };
  }
  return { family: 'ionicons', name: 'receipt-outline' };
}

export type { ThemeColors };
