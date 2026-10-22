/**
 * LifeKit - Centralized Local Notification Service
 * Mengelola konfigurasi handler, izin, penjadwalan notifikasi harian Rutinitas,
 * serta pengingat tagihan Pengingat (H-x sebelum jatuh tempo).
 */

import { Platform } from 'react-native';
import type * as NotificationsType from 'expo-notifications';

// Simpan pemetaan ID sistem notifikasi berdasarkan ID entitas (habit / subscription)
const scheduledNotificationIds = new Map<string, string[]>();

let NotificationsModule: typeof NotificationsType | null = null;
let isNotificationsAvailable: boolean | null = null;
let isHandlerConfigured = false;

/**
 * Lazy loader aman untuk modul expo-notifications.
 * Mencegah crash jika native module belum terhubung di runtime (misal Expo Go).
 */
export function getNotifications(): typeof NotificationsType | null {
  if (isNotificationsAvailable === false) return null;
  if (NotificationsModule) return NotificationsModule;

  try {
    NotificationsModule = require('expo-notifications');
    isNotificationsAvailable = true;

    // Konfigurasi handler agar notifikasi tetap muncul saat aplikasi di foreground
    if (!isHandlerConfigured && NotificationsModule) {
      NotificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      isHandlerConfigured = true;
    }

    return NotificationsModule;
  } catch (_error) {
    isNotificationsAvailable = false;
    console.warn(
      '[notificationService] Native module expo-notifications tidak tersedia di environment ini. Notifikasi lokal dilewati secara aman.'
    );
    return null;
  }
}

/**
 * Parsing string format 24-jam "HH:mm" menjadi { hour, minute }.
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
 * Meminta izin notifikasi dan mendaftarkan channel notifikasi di Android.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const Notifications = getNotifications();
  if (!Notifications) {
    return false;
  }

  try {
    // Siapkan Android Notification Channel default
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'LifeKit Pengingat',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#78DAB7',
        enableLights: true,
        enableVibrate: true,
      });
    }

    const current = await Notifications.getPermissionsAsync();
    if (
      current.granted ||
      current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return Boolean(requested.granted);
  } catch (error) {
    console.warn(
      '[notificationService.requestNotificationPermissions] Gagal meminta izin notifikasi:',
      error
    );
    return false;
  }
}

/**
 * Membatalkan notifikasi terjadwal berdasarkan ID notifikasi sistem atau ID entitas.
 */
export async function cancelScheduledNotification(id: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const Notifications = getNotifications();
  if (!Notifications) {
    scheduledNotificationIds.delete(id);
    return;
  }

  try {
    // Cek jika ID tersebut menyimpan daftar notifikasi internal
    const mappedIds = scheduledNotificationIds.get(id);
    if (mappedIds && mappedIds.length > 0) {
      for (const sysId of mappedIds) {
        await Notifications.cancelScheduledNotificationAsync(sysId);
      }
      scheduledNotificationIds.delete(id);
    }

    // Batalkan juga ID langsung
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.warn(
      `[notificationService.cancelScheduledNotification] Gagal membatalkan notifikasi ${id}:`,
      error
    );
  }
}

/**
 * Menjadwalkan notifikasi lokal harian berulang untuk Rutinitas (Habit).
 */
export async function scheduleHabitReminder(
  id: string,
  title: string,
  time: string
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const parsed = parseReminderTime(time);
  if (!parsed) return null;

  const hasPermission = await requestNotificationPermissions();
  const Notifications = getNotifications();
  if (!Notifications || !hasPermission) {
    return null;
  }

  // Batalkan notifikasi sebelumnya jika ada
  await cancelScheduledNotification(id);

  try {
    const triggerType =
      Notifications.SchedulableTriggerInputTypes?.DAILY ?? ('daily' as any);

    const scheduledId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rutinitas LifeKit',
        body: `Waktunya menjalankan "${title}" (${time})`,
        data: { type: 'habit', habitId: id, time },
        sound: true,
      },
      trigger: {
        type: triggerType,
        hour: parsed.hour,
        minute: parsed.minute,
      },
    });

    const existing = scheduledNotificationIds.get(id) ?? [];
    scheduledNotificationIds.set(id, [...existing, scheduledId]);

    return scheduledId;
  } catch (error) {
    console.warn(
      `[notificationService.scheduleHabitReminder] Gagal menjadwalkan ${title} (${time}):`,
      error
    );
    return null;
  }
}

/**
 * Menjadwalkan pengingat tagihan / langganan beberapa hari (daysBefore) sebelum tanggal jatuh tempo.
 * Trigger waktu default disetel pukul 09:00 AM pada hari pengingat.
 */
export async function scheduleSubscriptionReminder(
  id: string,
  name: string,
  dueDate: string,
  daysBefore: number
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const hasPermission = await requestNotificationPermissions();
  const Notifications = getNotifications();
  if (!Notifications || !hasPermission) {
    return null;
  }

  // Batalkan notifikasi sebelumnya untuk subscription ini
  await cancelScheduledNotification(id);

  try {
    // Parse dueDate "YYYY-MM-DD"
    const [year, month, day] = dueDate.split('-').map(Number);
    if (!year || !month || !day) return null;

    // Hitung tanggal pengingat = due date - daysBefore hari, pukul 09:00 pagi
    const targetDate = new Date(year, month - 1, day, 9, 0, 0, 0);
    targetDate.setDate(targetDate.getDate() - Math.max(0, daysBefore));

    const now = new Date();
    // Jika waktu pengingat sudah terlewat, jangan jadwalkan
    if (targetDate.getTime() <= now.getTime()) {
      return null;
    }

    const triggerType =
      Notifications.SchedulableTriggerInputTypes?.DATE ?? ('date' as any);

    const dayText =
      daysBefore === 0
        ? 'Jatuh tempo hari ini!'
        : daysBefore === 1
        ? 'Jatuh tempo besok!'
        : `Jatuh tempo dalam ${daysBefore} hari.`;

    const scheduledId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat Tagihan · LifeKit',
        body: `Tagihan "${name}" segera tiba (${dayText})`,
        data: { type: 'subscription', subscriptionId: id, dueDate, daysBefore },
        sound: true,
      },
      trigger: {
        type: triggerType,
        date: targetDate,
      },
    });

    scheduledNotificationIds.set(id, [scheduledId]);
    return scheduledId;
  } catch (error) {
    console.warn(
      `[notificationService.scheduleSubscriptionReminder] Gagal menjadwalkan ${name}:`,
      error
    );
    return null;
  }
}

/**
 * Helper sinkronisasi semua pengingat pada sebuah entitas Habit.
 */
export async function syncHabitReminders(habit: {
  id: string;
  title: string;
  reminders?: { id: string; label: string; time: string; enabled: boolean }[];
}): Promise<string[]> {
  await cancelHabitReminders(habit.id);

  const activeReminders = (habit.reminders ?? []).filter(
    (item) => item.enabled && parseReminderTime(item.time) !== null
  );

  const scheduled: string[] = [];
  for (const item of activeReminders) {
    const subId = `${habit.id}_${item.id}`;
    const notifId = await scheduleHabitReminder(subId, habit.title, item.time);
    if (notifId) scheduled.push(notifId);
  }

  if (scheduled.length > 0) {
    scheduledNotificationIds.set(habit.id, scheduled);
  }

  return scheduled;
}

/**
 * Helper membatalkan semua jadwal notifikasi pada sebuah habit.
 */
export async function cancelHabitReminders(habitId: string): Promise<void> {
  await cancelScheduledNotification(habitId);
}

export const notificationService = {
  requestNotificationPermissions,
  scheduleHabitReminder,
  scheduleSubscriptionReminder,
  cancelScheduledNotification,
  syncHabitReminders,
  cancelHabitReminders,
  parseReminderTime,
};

export default notificationService;
