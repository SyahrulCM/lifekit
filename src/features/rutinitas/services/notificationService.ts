/**
 * LifeKit - Rutinitas Local Notification Service
 * Mengelola penjadwalan notifikasi pengingat harian berulang berdasarkan daftar waktu (HH:mm).
 * Menggunakan lazy-loading yang aman agar tidak error di Expo Go / environment tanpa native module penuh.
 */

import { Platform } from 'react-native';
import type { Habit, HabitReminderItem } from '../types';

// Simpan pemetaan ID notifikasi per habitId di memori lokal sesi
const scheduledIdsByHabit = new Map<string, string[]>();

type ExpoNotificationsModule = typeof import('expo-notifications');

let cachedNotificationsModule: ExpoNotificationsModule | null | undefined;

/**
 * Lazy-load `expo-notifications` di dalam blok try/catch.
 * Mencegah crash `Cannot find native module 'ExpoTopicSubscriptionModule'` pada Expo Go.
 */
function getNotificationsModule(): ExpoNotificationsModule | null {
  if (Platform.OS === 'web') {
    return null;
  }

  if (cachedNotificationsModule !== undefined) {
    return cachedNotificationsModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-notifications') as ExpoNotificationsModule;
    cachedNotificationsModule = mod;
    return mod;
  } catch {
    // Native module belum tersedia di runtime (mis. Expo Go tanpa ExpoTopicSubscriptionModule)
    cachedNotificationsModule = null;
    return null;
  }
}

/**
 * Validasi dan pecah string "HH:mm" menjadi { hour, minute }.
 */
export function parseReminderTime(
  timeStr: string
): { hour: number; minute: number } | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(timeStr.trim());
  if (!match) return null;
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

/**
 * Meminta izin notifikasi lokal pada perangkat dengan fallback aman.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  try {
    const current = await Notifications.getPermissionsAsync();
    if (
      current.granted ||
      current.ios?.status === Notifications.IosAuthorizationStatus?.PROVISIONAL
    ) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return Boolean(requested.granted);
  } catch {
    return false;
  }
}

/**
 * Batalkan semua jadwal notifikasi milik sebuah habit.
 */
export async function cancelHabitReminders(habitId: string): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    scheduledIdsByHabit.delete(habitId);
    return;
  }

  try {
    const existingIds = scheduledIdsByHabit.get(habitId) ?? [];
    for (const notifId of existingIds) {
      await Notifications.cancelScheduledNotificationAsync(notifId);
    }
  } catch {
    // Abaikan jika native module tidak mendukung pembatalan pada runtime ini
  } finally {
    scheduledIdsByHabit.delete(habitId);
  }
}

/**
 * Jadwalkan notifikasi harian berulang untuk setiap item pengingat yang aktif (enabled: true).
 */
export async function scheduleHabitReminders(
  habitId: string,
  habitTitle: string,
  reminders: HabitReminderItem[] = []
): Promise<string[]> {
  await cancelHabitReminders(habitId);

  const activeReminders = reminders.filter(
    (item) => item.enabled && parseReminderTime(item.time) !== null
  );
  if (activeReminders.length === 0) {
    return [];
  }

  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return [];
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return [];
  }

  const scheduledIds: string[] = [];

  for (const reminder of activeReminders) {
    const parsed = parseReminderTime(reminder.time);
    if (!parsed) continue;

    try {
      const subLabel = reminder.label.trim();
      const bodyText =
        subLabel && subLabel.toLowerCase() !== habitTitle.toLowerCase()
          ? `Waktunya "${habitTitle}" — ${subLabel} (${reminder.time})`
          : `Waktunya menjalankan rutinitas "${habitTitle}" (${reminder.time})`;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pengingat Rutinitas · LifeKit',
          body: bodyText,
          data: {
            habitId,
            reminderId: reminder.id,
            label: reminder.label,
            time: reminder.time,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hour,
          minute: parsed.minute,
        },
      });

      scheduledIds.push(id);
    } catch {
      // Lewati item jika penjadwalan native gagal di Expo Go
    }
  }

  if (scheduledIds.length > 0) {
    scheduledIdsByHabit.set(habitId, scheduledIds);
  }

  return scheduledIds;
}

/**
 * Sinkronisasi penuh pengingat untuk sebuah entitas Habit (tidak pernah melempar error).
 */
export async function syncHabitReminders(habit: Habit): Promise<void> {
  try {
    await scheduleHabitReminders(habit.id, habit.title, habit.reminders ?? []);
  } catch {
    // Pastikan kegagalan native notification tidak menggagalkan penyimpanan SQLite
  }
}

export const notificationService = {
  parseReminderTime,
  requestNotificationPermission,
  scheduleHabitReminders,
  cancelHabitReminders,
  syncHabitReminders,
};

export default notificationService;
