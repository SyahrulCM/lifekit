/**
 * LifeKit - Pengingat (Subscription & Bill Tracker) Zustand Store
 * State management untuk daftar langganan, tagihan mendatang, dan total komitmen bulanan.
 */

import { create } from 'zustand';
import type {
  Subscription,
  UpcomingBill,
  NewSubscriptionPayload,
  UpdateSubscriptionPayload,
} from '../types';
import { pengingatRepository } from '../repositories/pengingatRepository';
import {
  scheduleSubscriptionReminder,
  cancelScheduledNotification,
} from '@/src/core/services/notificationService';

export interface PengingatState {
  // State
  subscriptions: Subscription[];
  upcomingBills: UpcomingBill[];
  totalMonthlyCommitment: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (payload: NewSubscriptionPayload) => Promise<boolean>;
  updateSubscription: (
    id: string,
    changes: UpdateSubscriptionPayload
  ) => Promise<boolean>;
  deleteSubscription: (id: string) => Promise<boolean>;
  clearError: () => void;
}

async function loadSnapshot() {
  const subscriptions = await pengingatRepository.getAll();
  const now = new Date();
  const upcomingBills = subscriptions
    .filter((sub) => sub.isActive)
    .map((sub) => pengingatRepository.computeUpcomingBill(sub, now))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue || a.dueDay - b.dueDay);
  const totalMonthlyCommitment =
    pengingatRepository.calculateTotalMonthlyCommitment(subscriptions);

  return {
    subscriptions,
    upcomingBills,
    totalMonthlyCommitment,
  };
}

export const usePengingatStore = create<PengingatState>((set) => ({
  subscriptions: [],
  upcomingBills: [],
  totalMonthlyCommitment: 0,
  isLoading: false,
  error: null,

  fetchSubscriptions: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await loadSnapshot();
      set({ ...snapshot, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil daftar pengingat tagihan';
      set({ isLoading: false, error: message });
    }
  },

  addSubscription: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const inserted = await pengingatRepository.insert(payload);
      if (!inserted) {
        set({
          isLoading: false,
          error: 'Gagal menambahkan pengingat tagihan baru',
        });
        return false;
      }

      // Jadwalkan notifikasi tagihan H-x jika aktif
      if (inserted.isActive) {
        const upcoming = pengingatRepository.computeUpcomingBill(
          inserted,
          new Date()
        );
        await scheduleSubscriptionReminder(
          inserted.id,
          inserted.name,
          upcoming.nextDueDate,
          inserted.reminderDaysBefore ?? 1
        );
      }

      const snapshot = await loadSnapshot();
      set({ ...snapshot, isLoading: false });
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal menambahkan pengingat tagihan';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateSubscription: async (id, changes) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await pengingatRepository.update(id, changes);
      if (!updated) {
        set({
          isLoading: false,
          error: 'Gagal memperbarui pengingat tagihan',
        });
        return false;
      }

      const snapshot = await loadSnapshot();
      const targetSub = snapshot.subscriptions.find((s) => s.id === id);

      // Sinkronisasi atau batalkan notifikasi sesuai status aktif
      if (targetSub && targetSub.isActive) {
        const upcoming = pengingatRepository.computeUpcomingBill(
          targetSub,
          new Date()
        );
        await scheduleSubscriptionReminder(
          targetSub.id,
          targetSub.name,
          upcoming.nextDueDate,
          targetSub.reminderDaysBefore ?? 1
        );
      } else {
        await cancelScheduledNotification(id);
      }

      set({ ...snapshot, isLoading: false });
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui pengingat tagihan';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  deleteSubscription: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const deleted = await pengingatRepository.delete(id);
      if (!deleted) {
        set({
          isLoading: false,
          error: 'Tagihan tidak ditemukan atau gagal dihapus',
        });
        return false;
      }

      // Batalkan notifikasi terjadwal untuk tagihan ini
      await cancelScheduledNotification(id);

      const snapshot = await loadSnapshot();
      set({ ...snapshot, isLoading: false });
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal menghapus pengingat tagihan';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default usePengingatStore;
