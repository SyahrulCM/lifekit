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
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '@/src/core/theme/colors';
import type { TransactionType, WalletType } from '../types';
import {
  WALLETS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type SakuUIColors,
} from '../utils/formatters';

export interface TransactionModalProps {
  visible: boolean;
  txType: TransactionType;
  txAmount: string;
  txCategory: string;
  txWallet: WalletType;
  txNote: string;
  isSubmitting: boolean;
  theme: ThemeColors;
  uiColors: SakuUIColors;
  onClose: () => void;
  onChangeType: (type: TransactionType) => void;
  onChangeAmount: (value: string) => void;
  onChangeCategory: (category: string) => void;
  onChangeWallet: (wallet: WalletType) => void;
  onChangeNote: (note: string) => void;
  onSubmit: () => void;
}

export function TransactionModal({
  visible,
  txType,
  txAmount,
  txCategory,
  txWallet,
  txNote,
  isSubmitting,
  theme,
  uiColors,
  onClose,
  onChangeType,
  onChangeAmount,
  onChangeCategory,
  onChangeWallet,
  onChangeNote,
  onSubmit,
}: TransactionModalProps) {
  const categories =
    txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

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
              Tambah Transaksi
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.typeSegmentContainer,
                { backgroundColor: uiColors.switcherContainerBg },
              ]}
            >
              {(['expense', 'income'] as TransactionType[]).map((type) => {
                const active = txType === type;
                return (
                  <Pressable
                    key={type}
                    onPress={() => onChangeType(type)}
                    style={[
                      styles.typeSegmentBtn,
                      active && {
                        backgroundColor:
                          type === 'expense'
                            ? uiColors.expensePillBg
                            : uiColors.switcherActiveBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeSegmentText,
                        {
                          color: active
                            ? type === 'expense'
                              ? uiColors.expensePillText
                              : uiColors.switcherActiveText
                            : theme.textSecondary,
                        },
                      ]}
                    >
                      {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Nominal (Rp)
            </Text>
            <TextInput
              value={txAmount}
              onChangeText={onChangeAmount}
              keyboardType="numeric"
              placeholder="Contoh: 35000"
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

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Saku / Dompet
            </Text>
            <View style={styles.chipGroup}>
              {WALLETS.map((wallet) => {
                const active = txWallet === wallet;
                return (
                  <Pressable
                    key={wallet}
                    onPress={() => onChangeWallet(wallet)}
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
                      {wallet}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Kategori
            </Text>
            <View style={styles.chipGroup}>
              {categories.map((cat) => {
                const active = txCategory === cat;
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

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Deskripsi / Catatan
            </Text>
            <TextInput
              value={txNote}
              onChangeText={onChangeNote}
              placeholder="Contoh: Lunch at Warung"
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
                  Simpan Transaksi
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
    maxHeight: '85%',
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
  typeSegmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeSegmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  typeSegmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 4,
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
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 10,
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

export default TransactionModal;
