/**
 * LifeKit - Pengingat (Subscription & Bill Tracker) Module Types
 */

export type BillingCycle = 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  /** Nama layanan / tagihan (misal: "Spotify Premium", "Listrik PLN") */
  name: string;
  /** Nominal tagihan dalam Rupiah */
  amount: number;
  /** Siklus penagihan bulanan atau tahunan */
  billingCycle: BillingCycle;
  /** Tanggal jatuh tempo (1 - 31) */
  dueDay: number;
  /** Bulan jatuh tempo (1 - 12), opsional untuk siklus tahunan */
  dueMonth?: number | null;
  /** Kategori (misal: "Entertainment", "Utilities", "Internet", "Cloud", "Other") */
  category: string;
  /** Berapa hari sebelum jatuh tempo untuk pengingat notifikasi */
  reminderDaysBefore: number;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

export interface UpcomingBill extends Subscription {
  /** Tanggal jatuh tempo berikutnya dalam format YYYY-MM-DD */
  nextDueDate: string;
  /** Jumlah hari tersisa menuju tanggal jatuh tempo berikutnya (>= 0) */
  daysUntilDue: number;
  /** Label ringkas sisa hari (misal: "Hari ini", "Besok", "In 3 days") */
  daysRemainingLabel: string;
}

export type NewSubscriptionPayload = {
  id?: string;
  name: string;
  amount: number;
  billingCycle?: BillingCycle;
  dueDay: number;
  dueMonth?: number | null;
  category?: string;
  reminderDaysBefore?: number;
  icon?: string | null;
  color?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export type UpdateSubscriptionPayload = Partial<
  Pick<
    Subscription,
    | 'name'
    | 'amount'
    | 'billingCycle'
    | 'dueDay'
    | 'dueMonth'
    | 'category'
    | 'reminderDaysBefore'
    | 'icon'
    | 'color'
    | 'isActive'
  >
>;
