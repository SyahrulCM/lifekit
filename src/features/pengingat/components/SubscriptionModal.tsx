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
  Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import type { SakuUIColors } from '@/src/features/saku/utils/formatters';
import type { BillingCycle } from '../types';

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Internet & Utilitas',
  'Cloud & Produktivitas',
  'Kesehatan & Asuransi',
  'Lainnya',
];

export const REMINDER_DAYS_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Hari-H' },
  { value: 1, label: 'H-1 (1 hari)' },
  { value: 3, label: 'H-3 (3 hari)' },
  { value: 7, label: 'H-7 (1 minggu)' },
];

export interface SubscriptionPreset {
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  {
    name: 'Spotify Premium',
    amount: 54990,
    billingCycle: 'monthly',
    category: 'Entertainment',
    icon: 'musical-notes-outline',
  },
  {
    name: 'Netflix',
    amount: 120000,
    billingCycle: 'monthly',
    category: 'Entertainment',
    icon: 'tv-outline',
  },
  {
    name: 'Internet / Wi-Fi Rumah',
    amount: 325000,
    billingCycle: 'monthly',
    category: 'Internet & Utilitas',
    icon: 'wifi-outline',
  },
  {
    name: 'Listrik PLN / Air',
    amount: 250000,
    billingCycle: 'monthly',
    category: 'Internet & Utilitas',
    icon: 'flash-outline',
  },
  {
    name: 'iCloud / Google One',
    amount: 45000,
    billingCycle: 'monthly',
    category: 'Cloud & Produktivitas',
    icon: 'cloud-outline',
  },
  {
    name: 'BPJS / Asuransi',
    amount: 150000,
    billingCycle: 'monthly',
    category: 'Kesehatan & Asuransi',
    icon: 'medkit-outline',
  },
];

export interface SubscriptionModalProps {
  visible: boolean;
  isEditing: boolean;
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  dueDay: string;
  category: string;
  reminderDaysBefore: number;
  isSubmitting: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onClose: () => void;
  onChangeName: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onChangeBillingCycle: (cycle: BillingCycle) => void;
  onChangeDueDay: (day: string) => void;
  onChangeCategory: (category: string) => void;
  onChangeReminderDaysBefore: (days: number) => void;
  onSubmit: () => void;
}

export function SubscriptionModal({
  visible,
  isEditing,
  name,
  amount,
  billingCycle,
  dueDay,
  category,
  reminderDaysBefore,
  isSubmitting,
  theme,
  uiColors,
  onClose,
  onChangeName,
  onChangeAmount,
  onChangeBillingCycle,
  onChangeDueDay,
  onChangeCategory,
  onChangeReminderDaysBefore,
  onSubmit,
}: SubscriptionModalProps) {
  const stepDueDay = (delta: number) => {
    const current = Number(dueDay) || 1;
    const next = Math.min(31, Math.max(1, current + delta));
    onChangeDueDay(String(next));
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
              {isEditing ? 'Edit Pengingat Tagihan' : 'Tambah Langganan / Tagihan'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Preset Cepat */}
            {!isEditing && (
              <>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Pilih Cepat Layanan Populer
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.presetScrollRow}
                >
                  {SUBSCRIPTION_PRESETS.map((preset) => {
                    const active = name === preset.name;
                    return (
                      <Pressable
                        key={preset.name}
                        onPress={() => {
                          onChangeName(preset.name);
                          onChangeAmount(String(preset.amount));
                          onChangeBillingCycle(preset.billingCycle);
                          onChangeCategory(preset.category);
                        }}
                        style={[
                          styles.presetChip,
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
                          name={preset.icon}
                          size={14}
                          color={
                            active
                              ? uiColors.switcherActiveText
                              : uiColors.accentGreen
                          }
                        />
                        <Text
                          style={[
                            styles.presetChipText,
                            {
                              color: active
                                ? uiColors.switcherActiveText
                                : theme.text,
                            },
                          ]}
                        >
                          {preset.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Nama Langganan */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Nama Langganan / Tagihan
            </Text>
            <TextInput
              value={name}
              onChangeText={onChangeName}
              placeholder="Contoh: Spotify Premium / Wi-Fi Rumah"
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

            {/* Nominal Tagihan */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Nominal Tagihan (Rp)
            </Text>
            <TextInput
              value={amount}
              onChangeText={onChangeAmount}
              keyboardType="numeric"
              placeholder="Contoh: 54990"
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

            {/* Siklus Tagihan & Tanggal Jatuh Tempo */}
            <View style={styles.twoColRow}>
              <View style={styles.colItem}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Siklus Tagihan
                </Text>
                <View
                  style={[
                    styles.cycleSegment,
                    { backgroundColor: uiColors.switcherContainerBg },
                  ]}
                >
                  {(
                    [
                      { key: 'monthly', label: 'Bulanan' },
                      { key: 'yearly', label: 'Tahunan' },
                    ] as const
                  ).map((item) => {
                    const active = billingCycle === item.key;
                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => onChangeBillingCycle(item.key)}
                        style={[
                          styles.cycleSegmentBtn,
                          active && {
                            backgroundColor: uiColors.switcherActiveBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cycleSegmentText,
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
              </View>

              <View style={styles.colItem}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  Tgl Jatuh Tempo (1-31)
                </Text>
                <View
                  style={[
                    styles.dueDayStepper,
                    {
                      backgroundColor: uiColors.switcherContainerBg,
                      borderColor: uiColors.cardBorder,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => stepDueDay(-1)}
                    hitSlop={8}
                    style={styles.stepIconBtn}
                  >
                    <Feather
                      name="minus"
                      size={15}
                      color={theme.textSecondary}
                    />
                  </Pressable>

                  <TextInput
                    value={dueDay}
                    onChangeText={onChangeDueDay}
                    keyboardType="numeric"
                    maxLength={2}
                    style={[styles.dueDayInput, { color: theme.text }]}
                  />

                  <Pressable
                    onPress={() => stepDueDay(1)}
                    hitSlop={8}
                    style={styles.stepIconBtn}
                  >
                    <Feather
                      name="plus"
                      size={15}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Kategori */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Kategori
            </Text>
            <View style={styles.chipGroup}>
              {SUBSCRIPTION_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => onChangeCategory(cat)}
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
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Pengingat Sebelum Jatuh Tempo (Hari-H / H-x) */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Waktu Pengingat Notifikasi
            </Text>
            <View style={styles.chipGroup}>
              {REMINDER_DAYS_OPTIONS.map((opt) => {
                const active = reminderDaysBefore === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => onChangeReminderDaysBefore(opt.value)}
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
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Tombol Simpan */}
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
                  {isEditing ? 'Simpan Perubahan' : 'Simpan Pengingat'}
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
    maxHeight: '88%',
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
    marginBottom: 12,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  colItem: {
    flex: 1,
  },
  cycleSegment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    height: 44,
    alignItems: 'center',
  },
  cycleSegmentBtn: {
    flex: 1,
    height: '100%',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleSegmentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dueDayStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 44,
  },
  stepIconBtn: {
    padding: 4,
  },
  dueDayInput: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    minWidth: 36,
    paddingVertical: 0,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  choiceChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  choiceChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
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

export default SubscriptionModal;
