/**
 * LifeKit - Rutinitas Zustand Store
 * State management untuk habit tracker dan penjadwalan pengingat notifikasi.
 */

import { create } from 'zustand';
import type {
  Habit,
  HabitLog,
  NewHabitPayload,
  UpdateHabitPayload,
} from '../types';
import { rutinitasRepository } from '../repositories/rutinitasRepository';
import { notificationService } from '@/src/core/services/notificationService';

export interface RutinitasState {
  // State
  habits: Habit[];
  todayLogs: HabitLog[];
  /** Streak terbaik di antara semua habit yang sedang berjalan */
  streak: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchHabits: () => Promise<void>;
  addHabit: (payload: NewHabitPayload) => Promise<boolean>;
  updateHabit: (habitId: string, changes: UpdateHabitPayload) => Promise<boolean>;
  toggleHabitToday: (habitId: string) => Promise<boolean>;
  deleteHabit: (habitId: string) => Promise<boolean>;
  clearError: () => void;
}

function computeStreak(habits: Habit[]): number {
  return habits.reduce((max, h) => (h.streakCount > max ? h.streakCount : max), 0);
}

async function loadSnapshot() {
  const [habits, todayLogs] = await Promise.all([
    rutinitasRepository.getAll(),
    rutinitasRepository.getLogsByDate(),
  ]);
  return { habits, todayLogs, streak: computeStreak(habits) };
}

export const useRutinitasStore = create<RutinitasState>((set) => ({
  habits: [],
  todayLogs: [],
  streak: 0,
  isLoading: false,
  error: null,

  fetchHabits: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await loadSnapshot();
      set({ ...snapshot, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengambil data rutinitas';
      set({ isLoading: false, error: message });
    }
  },

  addHabit: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const inserted = await rutinitasRepository.insert(payload);
      if (!inserted) {
        set({ isLoading: false, error: 'Gagal menambahkan rutinitas baru' });
        return false;
      }

      await notificationService.syncHabitReminders(inserted);

      const snapshot = await loadSnapshot();
      set({ ...snapshot, isLoading: false });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan rutinitas';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  updateHabit: async (habitId, changes) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await rutinitasRepository.update(habitId, changes);
      if (!updated) {
        set({ isLoading: false, error: 'Gagal memperbarui rutinitas' });
        return false;
      }

      const snapshot = await loadSnapshot();
      const targetHabit = snapshot.habits.find((h) => h.id === habitId);
      if (targetHabit) {
        await notificationService.syncHabitReminders(targetHabit);
      }

      set({ ...snapshot, isLoading: false });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui rutinitas';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  toggleHabitToday: async (habitId) => {
    set({ error: null });
    try {
      const result = await rutinitasRepository.toggleToday(habitId);
      if (!result) {
        set({ error: 'Gagal memperbarui status rutinitas' });
        return false;
      }
      const snapshot = await loadSnapshot();
      set(snapshot);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui rutinitas';
      set({ error: message });
      return false;
    }
  },

  deleteHabit: async (habitId) => {
    set({ isLoading: true, error: null });
    try {
      const success = await rutinitasRepository.delete(habitId);
      if (!success) {
        set({ isLoading: false, error: 'Rutinitas tidak ditemukan atau gagal dihapus' });
        return false;
      }

      await notificationService.cancelHabitReminders(habitId);

      const snapshot = await loadSnapshot();
      set({ ...snapshot, isLoading: false });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus rutinitas';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRutinitasStore;
