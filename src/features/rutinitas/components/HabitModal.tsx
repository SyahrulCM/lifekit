import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { palette, type ThemeColors } from '@/src/core/theme/colors';
import type { SakuUIColors } from '@/src/features/saku/utils/formatters';
import type { HabitReminderItem } from '../types';

export const HABIT_ICON_OPTIONS: {
  name: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { name: 'sparkles-outline', label: 'Ibadah & Doa' },
  { name: 'book-outline', label: 'Kitab / Bacaan' },
  { name: 'heart-outline', label: 'Amal / Berbagi' },
  { name: 'leaf-outline', label: 'Refleksi / Teduh' },
  { name: 'fitness-outline', label: 'Olahraga' },
  { name: 'water-outline', label: 'Kesehatan' },
  { name: 'code-slash-outline', label: 'Belajar / Kerja' },
  { name: 'moon-outline', label: 'Istirahat' },
];

export interface HabitPresetOption {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  targetDays: number;
  defaultReminders?: Omit<HabitReminderItem, 'id'>[];
}

export const IBADAH_PRESETS: HabitPresetOption[] = [
  {
    title: 'Ibadah & Doa Harian',
    icon: 'sparkles-outline',
    targetDays: 7,
    defaultReminders: [
      { label: 'Doa Pagi', time: '06:00', enabled: true },
      { label: 'Doa Malam', time: '21:00', enabled: true },
    ],
  },
  {
    title: 'Salat / Ibadah 5 Waktu',
    icon: 'sparkles-outline',
    targetDays: 7,
    defaultReminders: [
      { label: 'Subuh', time: '04:35', enabled: true },
      { label: 'Zuhur', time: '12:05', enabled: true },
      { label: 'Asar', time: '15:20', enabled: true },
      { label: 'Magrib', time: '17:55', enabled: true },
      { label: 'Isya', time: '19:05', enabled: true },
    ],
  },
  {
    title: 'Baca Kitab Suci / Renungan',
    icon: 'book-outline',
    targetDays: 7,
    defaultReminders: [{ label: 'Renungan Harian', time: '06:30', enabled: true }],
  },
  {
    title: 'Saat Teduh & Meditasi Spiritual',
    icon: 'leaf-outline',
    targetDays: 7,
    defaultReminders: [{ label: 'Saat Teduh', time: '05:30', enabled: true }],
  },
  {
    title: 'Jurnal Syukur & Refleksi Malam',
    icon: 'moon-outline',
    targetDays: 7,
    defaultReminders: [{ label: 'Refleksi Malam', time: '21:30', enabled: true }],
  },
  {
    title: 'Amal & Berbagi Kasih',
    icon: 'heart-outline',
    targetDays: 7,
    defaultReminders: [{ label: 'Amal Pagi', time: '07:00', enabled: true }],
  },
  {
    title: 'Ibadah Raya / Komunitas Mingguan',
    icon: 'sparkles-outline',
    targetDays: 1,
    defaultReminders: [{ label: 'Ibadah Mingguan', time: '08:00', enabled: true }],
  },
];

export const TARGET_DAYS_OPTIONS: { value: number; label: string }[] = [
  { value: 7, label: 'Setiap Hari (7x)' },
  { value: 5, label: '5x / Minggu' },
  { value: 4, label: '4x / Minggu' },
  { value: 3, label: '3x / Minggu' },
  { value: 2, label: '2x / Minggu' },
  { value: 1, label: '1x / Minggu' },
];

export function createReminderId(): string {
  return `rem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Geser string "HH:mm" sejumlah menit (misal +15 atau -15 menit)
 */
function shiftTimeString(timeStr: string, deltaMinutes: number): string {
  const parts = timeStr.split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const baseMinutes =
    (!isNaN(h) && !isNaN(m) ? h * 60 + m : 7 * 60) + deltaMinutes;
  const normalized = ((baseMinutes % 1440) + 1440) % 1440;
  const nextH = String(Math.floor(normalized / 60)).padStart(2, '0');
  const nextM = String(normalized % 60).padStart(2, '0');
  return `${nextH}:${nextM}`;
}

export interface HabitModalProps {
  visible: boolean;
  isEditing: boolean;
  title: string;
  targetDays: number;
  selectedIcon: string;
  remindersEnabled: boolean;
  reminders: HabitReminderItem[];
  isSubmitting: boolean;
  isDark: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onClose: () => void;
  onChangeTitle: (value: string) => void;
  onChangeTargetDays: (days: number) => void;
  onChangeIcon: (icon: string) => void;
  onToggleRemindersEnabled: (enabled: boolean) => void;
  onChangeReminders: (reminders: HabitReminderItem[]) => void;
  onSubmit: () => void;
}

export function HabitModal({
  visible,
  isEditing,
  title,
  targetDays,
  selectedIcon,
  remindersEnabled,
  reminders,
  isSubmitting,
  isDark,
  theme,
  uiColors,
  onClose,
  onChangeTitle,
  onChangeTargetDays,
  onChangeIcon,
  onToggleRemindersEnabled,
  onChangeReminders,
  onSubmit,
}: HabitModalProps) {
  const handleAddSubReminder = () => {
    const nextIndex = reminders.length + 1;
    onChangeReminders([
      ...reminders,
      {
        id: createReminderId(),
        label: `Jadwal ${nextIndex}`,
        time: '08:00',
        enabled: true,
      },
    ]);
  };

  const handleApplyTemplate5Waktu = () => {
    onChangeReminders([
      { id: createReminderId(), label: 'Subuh', time: '04:35', enabled: true },
      { id: createReminderId(), label: 'Zuhur', time: '12:05', enabled: true },
      { id: createReminderId(), label: 'Asar', time: '15:20', enabled: true },
      { id: createReminderId(), label: 'Magrib', time: '17:55', enabled: true },
      { id: createReminderId(), label: 'Isya', time: '19:05', enabled: true },
    ]);
  };

  const handleApplyTemplatePagiMalam = () => {
    onChangeReminders([
      { id: createReminderId(), label: 'Pagi', time: '06:00', enabled: true },
      { id: createReminderId(), label: 'Malam', time: '21:00', enabled: true },
    ]);
  };

  const handleUpdateReminder = (
    id: string,
    patch: Partial<HabitReminderItem>
  ) => {
    onChangeReminders(
      reminders.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveReminder = (id: string) => {
    onChangeReminders(reminders.filter((item) => item.id !== id));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <Pressable style={styles.modalDismissArea} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: uiColors.cardBg,
              borderColor: uiColors.cardBorder,
            },
          ]}
        >
          <View style={styles.modalHandle} />

          <View style={styles.modalHeaderRow}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {isEditing ? 'Edit Rutinitas & Pengingat' : 'Tambah Rutinitas Baru'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Preset Cepat Ibadah & Spiritual Universal */}
            {!isEditing && (
              <>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Inspirasi Ibadah & Spiritual
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetScrollRow}
                >
                  {IBADAH_PRESETS.map((preset) => {
                    const isSelected = title === preset.title;
                    return (
                      <Pressable
                        key={preset.title}
                        onPress={() => {
                          onChangeTitle(preset.title);
                          onChangeIcon(preset.icon);
                          onChangeTargetDays(preset.targetDays);
                          if (preset.defaultReminders) {
                            onToggleRemindersEnabled(true);
                            onChangeReminders(
                              preset.defaultReminders.map((r) => ({
                                ...r,
                                id: createReminderId(),
                              }))
                            );
                          }
                        }}
                        style={[
                          styles.presetChip,
                          {
                            backgroundColor: isSelected
                              ? uiColors.switcherActiveBg
                              : uiColors.switcherContainerBg,
                            borderColor: isSelected
                              ? uiColors.accentGreen
                              : 'transparent',
                          },
                        ]}
                      >
                        <Ionicons
                          name={preset.icon}
                          size={14}
                          color={
                            isSelected
                              ? uiColors.switcherActiveText
                              : uiColors.accentGreen
                          }
                        />
                        <Text
                          style={[
                            styles.presetChipText,
                            {
                              color: isSelected
                                ? uiColors.switcherActiveText
                                : theme.text,
                            },
                          ]}
                        >
                          {preset.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Input Nama Rutinitas */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Nama Rutinitas / Ibadah
            </Text>
            <TextInput
              value={title}
              onChangeText={onChangeTitle}
              placeholder="Contoh: Doa Pagi / Baca Kitab Suci / Olahraga"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.textInput,
                {
                  backgroundColor: uiColors.switcherContainerBg,
                  color: theme.text,
                  borderColor: uiColors.cardBorder,
                },
              ]}
            />

            {/* Pilihan Target Frekuensi */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Target Frekuensi Mingguan
            </Text>
            <View style={styles.chipGroup}>
              {TARGET_DAYS_OPTIONS.map((option) => {
                const active = targetDays === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onChangeTargetDays(option.value)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: active
                          ? uiColors.switcherActiveBg
                          : uiColors.switcherContainerBg,
                        borderColor: active
                          ? uiColors.accentGreen
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceChipText,
                        {
                          color: active
                            ? uiColors.switcherActiveText
                            : theme.textSecondary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Pilihan Ikon */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Pilih Kategori & Ikon
            </Text>
            <View style={styles.chipGroup}>
              {HABIT_ICON_OPTIONS.map((item) => {
                const active = selectedIcon === item.name;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => onChangeIcon(item.name)}
                    style={[
                      styles.iconChip,
                      {
                        backgroundColor: active
                          ? uiColors.switcherActiveBg
                          : uiColors.switcherContainerBg,
                        borderColor: active
                          ? uiColors.accentGreen
                          : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.name}
                      size={16}
                      color={
                        active
                          ? uiColors.switcherActiveText
                          : theme.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.choiceChipText,
                        {
                          color: active
                            ? uiColors.switcherActiveText
                            : theme.textSecondary,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ============================================== */}
            {/* Section Pengingat Terjadwal (Reminder Time)    */}
            {/* ============================================== */}
            <View
              style={[
                styles.reminderSectionCard,
                {
                  backgroundColor: uiColors.switcherContainerBg,
                  borderColor: uiColors.cardBorder,
                },
              ]}
            >
              <View style={styles.reminderToggleRow}>
                <View style={styles.reminderToggleInfo}>
                  <View style={styles.reminderTitleInline}>
                    <Ionicons
                      name="notifications-outline"
                      size={17}
                      color={uiColors.accentGreen}
                    />
                    <Text
                      style={[styles.reminderSectionTitle, { color: theme.text }]}
                    >
                      Aktifkan Pengingat
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.reminderSectionSub,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Jadwalkan notifikasi harian untuk setiap sub-jadwal waktu
                  </Text>
                </View>

                <Switch
                  value={remindersEnabled}
                  onValueChange={onToggleRemindersEnabled}
                  trackColor={{
                    false: isDark ? '#2B3E38' : '#D5E2DD',
                    true: palette.primaryMint,
                  }}
                  thumbColor={
                    remindersEnabled
                      ? isDark
                        ? palette.deepForestDark
                        : '#1B6F53'
                      : '#FFFFFF'
                  }
                />
              </View>

              {remindersEnabled && (
                <View style={styles.reminderListWrapper}>
                  {/* Template Cepat Sub-Jadwal */}
                  <View style={styles.templateBtnRow}>
                    <Pressable
                      onPress={handleApplyTemplatePagiMalam}
                      style={[
                        styles.templateBtn,
                        { backgroundColor: uiColors.cardBg },
                      ]}
                    >
                      <Ionicons
                        name="sunny-outline"
                        size={13}
                        color={uiColors.accentGreen}
                      />
                      <Text
                        style={[
                          styles.templateBtnText,
                          { color: uiColors.accentGreen },
                        ]}
                      >
                        Template Pagi & Malam
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleApplyTemplate5Waktu}
                      style={[
                        styles.templateBtn,
                        { backgroundColor: uiColors.cardBg },
                      ]}
                    >
                      <Ionicons
                        name="sparkles-outline"
                        size={13}
                        color={uiColors.accentGreen}
                      />
                      <Text
                        style={[
                          styles.templateBtnText,
                          { color: uiColors.accentGreen },
                        ]}
                      >
                        Sub-Jadwal 5 Waktu
                      </Text>
                    </Pressable>
                  </View>

                  {/* Daftar Item Sub-Jadwal */}
                  {reminders.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.reminderItemRow,
                        {
                          backgroundColor: uiColors.cardBg,
                          borderColor: item.enabled
                            ? uiColors.accentGreen
                            : uiColors.cardBorder,
                        },
                      ]}
                    >
                      {/* Checkbox aktif / nonaktif sub-jadwal */}
                      <Pressable
                        onPress={() =>
                          handleUpdateReminder(item.id, {
                            enabled: !item.enabled,
                          })
                        }
                        style={[
                          styles.subCheckBtn,
                          item.enabled
                            ? {
                                backgroundColor: uiColors.fabBg,
                                borderColor: uiColors.fabBg,
                              }
                            : {
                                borderColor: theme.border,
                              },
                        ]}
                      >
                        {item.enabled && (
                          <Ionicons
                            name="checkmark"
                            size={13}
                            color={isDark ? palette.deepForestDark : '#FFFFFF'}
                          />
                        )}
                      </Pressable>

                      {/* Input Label Sub-Jadwal (misal: Zuhur, Pagi) */}
                      <TextInput
                        value={item.label}
                        onChangeText={(text) =>
                          handleUpdateReminder(item.id, { label: text })
                        }
                        placeholder="Label (mis: Zuhur)"
                        placeholderTextColor={theme.textMuted}
                        style={[
                          styles.reminderLabelInput,
                          { color: theme.text },
                        ]}
                      />

                      {/* Time Picker Controls (-15m | HH:mm | +15m) */}
                      <View
                        style={[
                          styles.timePickerBox,
                          { backgroundColor: uiColors.switcherContainerBg },
                        ]}
                      >
                        <Pressable
                          onPress={() =>
                            handleUpdateReminder(item.id, {
                              time: shiftTimeString(item.time, -15),
                            })
                          }
                          hitSlop={6}
                          style={styles.timeStepBtn}
                        >
                          <Feather
                            name="minus"
                            size={12}
                            color={theme.textSecondary}
                          />
                        </Pressable>

                        <TextInput
                          value={item.time}
                          onChangeText={(val) =>
                            handleUpdateReminder(item.id, { time: val })
                          }
                          keyboardType="numbers-and-punctuation"
                          maxLength={5}
                          placeholder="12:05"
                          placeholderTextColor={theme.textMuted}
                          style={[
                            styles.timeValueInput,
                            { color: uiColors.accentGreen },
                          ]}
                        />

                        <Pressable
                          onPress={() =>
                            handleUpdateReminder(item.id, {
                              time: shiftTimeString(item.time, 15),
                            })
                          }
                          hitSlop={6}
                          style={styles.timeStepBtn}
                        >
                          <Feather
                            name="plus"
                            size={12}
                            color={theme.textSecondary}
                          />
                        </Pressable>
                      </View>

                      {/* Hapus sub-jadwal */}
                      {reminders.length > 1 && (
                        <Pressable
                          onPress={() => handleRemoveReminder(item.id)}
                          hitSlop={8}
                          style={styles.deleteSubBtn}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={theme.textSecondary}
                          />
                        </Pressable>
                      )}
                    </View>
                  ))}

                  {/* Tombol Tambah Sub-Jadwal Waktu */}
                  <Pressable
                    onPress={handleAddSubReminder}
                    style={[
                      styles.addSubReminderBtn,
                      { borderColor: uiColors.accentGreen },
                    ]}
                  >
                    <Feather
                      name="plus"
                      size={14}
                      color={uiColors.accentGreen}
                    />
                    <Text
                      style={[
                        styles.addSubReminderText,
                        { color: uiColors.accentGreen },
                      ]}
                    >
                      Tambah Waktu Pengingat
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={onSubmit}
              disabled={isSubmitting}
              style={[
                styles.submitBtn,
                {
                  backgroundColor: uiColors.fabBg,
                  opacity: isSubmitting ? 0.6 : 1,
                },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={uiColors.fabIcon} />
              ) : (
                <Text
                  style={[styles.submitBtnText, { color: uiColors.fabIcon }]}
                >
                  {isEditing ? 'Simpan Perubahan' : 'Simpan Rutinitas'}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 25, 24, 0.6)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(149, 167, 162, 0.4)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
  },
  presetScrollRow: {
    gap: 8,
    paddingBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    marginBottom: 14,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  choiceChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reminderSectionCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 14,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reminderToggleInfo: {
    flex: 1,
  },
  reminderTitleInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  reminderSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  reminderSectionSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  reminderListWrapper: {
    marginTop: 12,
    gap: 8,
  },
  templateBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  templateBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reminderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    gap: 8,
  },
  subCheckBtn: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderLabelInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 4,
  },
  timePickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 4,
  },
  timeStepBtn: {
    padding: 3,
  },
  timeValueInput: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 44,
    textAlign: 'center',
    paddingVertical: 0,
  },
  deleteSubBtn: {
    padding: 4,
  },
  addSubReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addSubReminderText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default HabitModal;
