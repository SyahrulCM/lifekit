/**
 * LifeKit - Rutinitas (Habit Tracker) Module Types
 */

export interface HabitReminderItem {
  id: string;
  label: string;
  /** Format 24-jam "HH:mm" (contoh: "12:05") */
  time: string;
  enabled: boolean;
}

export interface Habit {
  id: string;
  title: string;
  /** Target hari per minggu (1-7) */
  targetDays: number;
  /** Streak berjalan (hari berturut-turut sampai hari ini/kemarin) */
  streakCount: number;
  icon: string | null;
  color: string | null;
  reminders?: HabitReminderItem[];
  createdAt: string; // ISO 8601
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD (waktu lokal)
  completed: boolean;
}

export type NewHabitPayload = {
  id?: string;
  title: string;
  targetDays?: number;
  icon?: string | null;
  color?: string | null;
  reminders?: HabitReminderItem[];
  createdAt?: string;
};

export type UpdateHabitPayload = Partial<
  Pick<Habit, 'title' | 'targetDays' | 'icon' | 'color' | 'reminders'>
>;

export interface ToggleHabitResult {
  completed: boolean;
  streakCount: number;
}
