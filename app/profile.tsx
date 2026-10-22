import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Modal,
  TextInput,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

import { palette } from '@/src/core/theme/colors';
import { useAppTheme } from '@/src/core/theme';
import { useI18n } from '@/src/core/i18n';
import { useSettingsStore } from '@/src/features/profile/stores/useSettingsStore';
import {
  exportBackupJson,
  importRestoreJson,
  clearAllLocalData,
} from '@/src/features/profile/services/dataBackupService';
import { useSakuStore } from '@/src/features/saku/stores/useSakuStore';
import { useRutinitasStore } from '@/src/features/rutinitas/stores/useRutinitasStore';
import { usePengingatStore } from '@/src/features/pengingat/stores/usePengingatStore';

export default function ProfileScreen() {
  const { isDark, theme, uiColors, setThemeMode } = useAppTheme();
  const { i18n, isId, format } = useI18n();

  const language = useSettingsStore((state) => state.language);
  const currency = useSettingsStore((state) => state.currency);
  const masterNotificationEnabled = useSettingsStore(
    (state) => state.masterNotificationEnabled
  );
  const biometricLockEnabled = useSettingsStore(
    (state) => state.biometricLockEnabled
  );
  const profile = useSettingsStore((state) => state.profile);

  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const setMasterNotification = useSettingsStore(
    (state) => state.setMasterNotification
  );
  const setBiometricLock = useSettingsStore((state) => state.setBiometricLock);
  const updateProfileName = useSettingsStore((state) => state.updateProfileName);

  // Modal State for Restore JSON
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [restoreJsonInput, setRestoreJsonInput] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Modal State for Edit Name
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  // Refresh all stores
  const refreshAllStores = async () => {
    await Promise.all([
      useSakuStore.getState().fetchTransactions(),
      useRutinitasStore.getState().fetchHabits(),
      usePengingatStore.getState().fetchSubscriptions(),
    ]);
  };

  // Handler: Cadangkan Data
  const handleBackupData = async () => {
    try {
      const { jsonString, summary } = await exportBackupJson();

      const summaryText = format(i18n.profile.data.backupSuccessMsg, {
        transactions: summary.transactionsCount,
        habits: summary.habitsCount,
        subscriptions: summary.subscriptionsCount,
      });

      if (Platform.OS === 'web') {
        Alert.alert(i18n.profile.data.backupSuccessTitle, summaryText);
        return;
      }

      await Share.share({
        title: 'LifeKit_Backup.json',
        message: jsonString,
      });

      Alert.alert(i18n.profile.data.backupSuccessTitle, summaryText);
    } catch (error) {
      const msg = error instanceof Error ? error.message : i18n.common.error;
      Alert.alert(i18n.common.error, msg);
    }
  };

  // Handler: Pulihkan Data
  const handleConfirmRestore = async () => {
    if (!restoreJsonInput.trim()) {
      Alert.alert(
        i18n.common.warning,
        isId
          ? 'Tempelkan teks JSON cadangan terlebih dahulu.'
          : 'Please paste the backup JSON text first.'
      );
      return;
    }

    setIsRestoring(true);
    try {
      const result = await importRestoreJson(restoreJsonInput);
      setIsRestoring(false);

      if (result.success) {
        await refreshAllStores();
        setRestoreModalVisible(false);
        setRestoreJsonInput('');
        Alert.alert(i18n.common.success, result.message);
      } else {
        Alert.alert(i18n.common.error, result.message);
      }
    } catch {
      setIsRestoring(false);
      Alert.alert(
        i18n.common.error,
        isId
          ? 'Format berkas cadangan tidak dapat diproses.'
          : 'Backup file format could not be processed.'
      );
    }
  };

  // Handler: Hapus Semua Data
  const handleClearAllData = () => {
    Alert.alert(
      i18n.profile.data.clearAlertTitle,
      i18n.profile.data.clearAlertMsg,
      [
        { text: i18n.common.cancel, style: 'cancel' },
        {
          text: i18n.profile.data.clearBtnConfirm,
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllLocalData();
              await refreshAllStores();
              Alert.alert(
                i18n.profile.data.clearSuccessTitle,
                i18n.profile.data.clearSuccessMsg
              );
            } catch {
              Alert.alert(
                i18n.common.error,
                isId
                  ? 'Gagal membersihkan data lokal.'
                  : 'Failed to erase local data.'
              );
            }
          },
        },
      ]
    );
  };

  // Handler: Simpan Nama
  const handleSaveName = () => {
    updateProfileName(nameInput);
    setNameModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: uiColors.screenBg }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top App Bar Navigation */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: uiColors.cardBg,
              borderColor: uiColors.cardBorder,
            },
          ]}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>
          {i18n.profile.title}
        </Text>
        <View style={styles.topBarRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section: Avatar & Info Pengguna */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: uiColors.cardBg,
              borderColor: uiColors.cardBorder,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              setNameInput(profile.name);
              setNameModalVisible(true);
            }}
            style={[
              styles.avatarContainer,
              {
                borderColor: uiColors.accentGreen,
                backgroundColor: isDark ? palette.darkMintContainer : palette.lightMintSurface,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: uiColors.accentGreen }]}>
              {profile.avatarText}
            </Text>
            <View
              style={[
                styles.editPencilBadge,
                { backgroundColor: uiColors.accentGreen },
              ]}
            >
              <Feather
                name="edit-2"
                size={12}
                color={isDark ? palette.deepForestDark : '#FFFFFF'}
              />
            </View>
          </Pressable>

          <View style={styles.heroTextCol}>
            <Pressable
              onPress={() => {
                setNameInput(profile.name);
                setNameModalVisible(true);
              }}
              style={styles.nameRow}
            >
              <Text style={[styles.userName, { color: theme.text }]}>
                {profile.name}
              </Text>
            </Pressable>

            <View
              style={[
                styles.offlineBadge,
                { backgroundColor: uiColors.badgeBg },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={13}
                color={uiColors.badgeText}
              />
              <Text
                style={[styles.offlineBadgeText, { color: uiColors.badgeText }]}
              >
                {i18n.profile.badgeOffline} · {isId ? 'Penyimpanan Lokal' : 'Local Storage'}
              </Text>
            </View>
          </View>
        </View>

        {/* Seksi 1: Preferensi */}
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {i18n.profile.preferences.title.toUpperCase()}
        </Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: uiColors.cardBg,
              borderColor: uiColors.cardBorder,
            },
          ]}
        >
          {/* Tema Tampilan */}
          <View style={styles.settingItemRow}>
            <View style={styles.itemLabelRow}>
              <View
                style={[
                  styles.itemIconBox,
                  { backgroundColor: uiColors.badgeBg },
                ]}
              >
                <Ionicons
                  name={isDark ? 'moon-outline' : 'sunny-outline'}
                  size={18}
                  color={uiColors.accentGreen}
                />
              </View>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {i18n.profile.preferences.theme}
              </Text>
            </View>

            <View
              style={[
                styles.segmentedContainer,
                { backgroundColor: isDark ? '#20312C' : '#EEF5F3' },
              ]}
            >
              <Pressable
                onPress={() => setThemeMode('dark')}
                style={[
                  styles.segmentButton,
                  isDark && {
                    backgroundColor: uiColors.switcherActiveBg,
                  },
                ]}
              >
                <Ionicons
                  name="moon"
                  size={13}
                  color={isDark ? uiColors.switcherActiveText : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isDark
                        ? uiColors.switcherActiveText
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {i18n.profile.preferences.themeDark}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setThemeMode('light')}
                style={[
                  styles.segmentButton,
                  !isDark && {
                    backgroundColor: uiColors.switcherActiveBg,
                  },
                ]}
              >
                <Ionicons
                  name="sunny"
                  size={13}
                  color={!isDark ? uiColors.switcherActiveText : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: !isDark
                        ? uiColors.switcherActiveText
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {i18n.profile.preferences.themeLight}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: uiColors.divider }]} />

          {/* Bahasa */}
          <View style={styles.settingItemRow}>
            <View style={styles.itemLabelRow}>
              <View
                style={[
                  styles.itemIconBox,
                  { backgroundColor: uiColors.badgeBg },
                ]}
              >
                <Ionicons
                  name="language-outline"
                  size={18}
                  color={uiColors.accentGreen}
                />
              </View>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {i18n.profile.preferences.language}
              </Text>
            </View>

            <View
              style={[
                styles.segmentedContainer,
                { backgroundColor: isDark ? '#20312C' : '#EEF5F3' },
              ]}
            >
              <Pressable
                onPress={() => setLanguage('id')}
                style={[
                  styles.segmentButton,
                  language === 'id' && {
                    backgroundColor: uiColors.switcherActiveBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        language === 'id'
                          ? uiColors.switcherActiveText
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {i18n.profile.preferences.langId}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setLanguage('en')}
                style={[
                  styles.segmentButton,
                  language === 'en' && {
                    backgroundColor: uiColors.switcherActiveBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        language === 'en'
                          ? uiColors.switcherActiveText
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {i18n.profile.preferences.langEn}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: uiColors.divider }]} />

          {/* Format Mata Uang */}
          <View style={styles.settingItemRow}>
            <View style={styles.itemLabelRow}>
              <View
                style={[
                  styles.itemIconBox,
                  { backgroundColor: uiColors.badgeBg },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={18}
                  color={uiColors.accentGreen}
                />
              </View>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                {i18n.profile.preferences.currency}
              </Text>
            </View>

            <View
              style={[
                styles.segmentedContainer,
                { backgroundColor: isDark ? '#20312C' : '#EEF5F3' },
              ]}
            >
              <Pressable
                onPress={() => setCurrency('IDR')}
                style={[
                  styles.segmentButton,
                  currency === 'IDR' && {
                    backgroundColor: uiColors.switcherActiveBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        currency === 'IDR'
                          ? uiColors.switcherActiveText
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {i18n.profile.preferences.currencyIdr}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setCurrency('USD')}
                style={[
                  styles.segmentButton,
                  currency === 'USD' && {
                    backgroundColor: uiColors.switcherActiveBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color:
                        currency === 'USD'
                          ? uiColors.switcherActiveText
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {i18n.profile.preferences.currencyUsd}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Seksi 2: Notifikasi & Keamanan */}
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {i18n.profile.security.title.toUpperCase()}
        </Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: uiColors.cardBg,
              borderColor: uiColors.cardBorder,
            },
          ]}
        >
          {/* Master Notifikasi */}
          <View style={styles.switchItemRow}>
            <View style={styles.switchTextCol}>
              <View style={styles.itemLabelRow}>
                <View
                  style={[
                    styles.itemIconBox,
                    { backgroundColor: uiColors.badgeBg },
                  ]}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={18}
                    color={uiColors.accentGreen}
                  />
                </View>
                <View style={styles.textGroup}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>
                    {i18n.profile.security.masterNotification}
                  </Text>
                  <Text
                    style={[
                      styles.itemSubtitle,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {i18n.profile.security.masterNotificationDesc}
                  </Text>
                </View>
              </View>
            </View>

            <Switch
              value={masterNotificationEnabled}
              onValueChange={setMasterNotification}
              trackColor={{
                false: isDark ? '#2E433C' : '#E2E8E5',
                true: palette.primaryMint,
              }}
              thumbColor={
                masterNotificationEnabled
                  ? isDark
                    ? palette.deepForestDark
                    : '#FFFFFF'
                  : '#B4C4C0'
              }
            />
          </View>

          <View style={[styles.divider, { backgroundColor: uiColors.divider }]} />

          {/* Kunci Biometrik (Placeholder UI) */}
          <View style={styles.switchItemRow}>
            <View style={styles.switchTextCol}>
              <View style={styles.itemLabelRow}>
                <View
                  style={[
                    styles.itemIconBox,
                    { backgroundColor: uiColors.badgeBg },
                  ]}
                >
                  <Ionicons
                    name="finger-print-outline"
                    size={18}
                    color={uiColors.accentGreen}
                  />
                </View>
                <View style={styles.textGroup}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>
                    {i18n.profile.security.biometric}
                  </Text>
                  <Text
                    style={[
                      styles.itemSubtitle,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {i18n.profile.security.biometricDesc}
                  </Text>
                </View>
              </View>
            </View>

            <Switch
              value={biometricLockEnabled}
              onValueChange={setBiometricLock}
              trackColor={{
                false: isDark ? '#2E433C' : '#E2E8E5',
                true: palette.primaryMint,
              }}
              thumbColor={
                biometricLockEnabled
                  ? isDark
                    ? palette.deepForestDark
                    : '#FFFFFF'
                  : '#B4C4C0'
              }
            />
          </View>
        </View>

        {/* Seksi 3: Manajemen Data Offline */}
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {i18n.profile.data.title.toUpperCase()}
        </Text>
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: uiColors.cardBg,
              borderColor: uiColors.cardBorder,
            },
          ]}
        >
          {/* Cadangkan Data */}
          <Pressable
            onPress={handleBackupData}
            style={({ pressed }) => [
              styles.actionItemRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.itemLabelRow}>
              <View
                style={[
                  styles.itemIconBox,
                  { backgroundColor: uiColors.badgeBg },
                ]}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={18}
                  color={uiColors.accentGreen}
                />
              </View>
              <View style={styles.textGroup}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  {i18n.profile.data.backupBtn}
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: theme.textSecondary }]}
                >
                  {i18n.profile.data.backupDesc}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: uiColors.divider }]} />

          {/* Pulihkan Data */}
          <Pressable
            onPress={() => setRestoreModalVisible(true)}
            style={({ pressed }) => [
              styles.actionItemRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.itemLabelRow}>
              <View
                style={[
                  styles.itemIconBox,
                  { backgroundColor: uiColors.badgeBg },
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={uiColors.accentGreen}
                />
              </View>
              <View style={styles.textGroup}>
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  {i18n.profile.data.restoreBtn}
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: theme.textSecondary }]}
                >
                  {i18n.profile.data.restoreDesc}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: uiColors.divider }]} />

          {/* Hapus Semua Data (Danger Zone) */}
          <Pressable
            onPress={handleClearAllData}
            style={({ pressed }) => [
              styles.actionItemRow,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.itemLabelRow}>
              <View
                style={[
                  styles.itemIconBox,
                  {
                    backgroundColor: isDark
                      ? 'rgba(239, 68, 68, 0.18)'
                      : 'rgba(239, 68, 68, 0.1)',
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </View>
              <View style={styles.textGroup}>
                <Text style={[styles.itemTitle, { color: '#EF4444' }]}>
                  {i18n.profile.data.clearBtn}
                </Text>
                <Text
                  style={[styles.itemSubtitle, { color: theme.textSecondary }]}
                >
                  {i18n.profile.data.clearDesc}
                </Text>
              </View>
            </View>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          </Pressable>
        </View>

        {/* Seksi 4: Footer Info */}
        <View style={styles.footerSection}>
          <View
            style={[
              styles.appIconBadge,
              { backgroundColor: uiColors.badgeBg },
            ]}
          >
            <Ionicons
              name="layers-outline"
              size={22}
              color={uiColors.accentGreen}
            />
          </View>
          <Text style={[styles.appNameVersion, { color: theme.text }]}>
            {i18n.profile.footer.version}
          </Text>
          <Text
            style={[styles.appFooterSub, { color: theme.textSecondary }]}
          >
            {i18n.profile.footer.offlineNote}
          </Text>
          <Text
            style={[styles.appFooterPriv, { color: uiColors.accentGreen }]}
          >
            {isId
              ? '100% Offline-First · Tanpa Pelacak Eksternal'
              : '100% Offline-First · Zero External Trackers'}
          </Text>
        </View>
      </ScrollView>

      {/* Modal: Edit Nama Profil */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: uiColors.cardBg,
                borderColor: uiColors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.profile.editNameTitle}
            </Text>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder={i18n.profile.editNamePlaceholder}
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#233D33' : '#F0F5F3',
                  color: theme.text,
                  borderColor: uiColors.cardBorder,
                },
              ]}
              maxLength={30}
              autoFocus
            />
            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => setNameModalVisible(false)}
                style={[
                  styles.modalBtnSecondary,
                  { backgroundColor: isDark ? '#263C34' : '#E8F0EC' },
                ]}
              >
                <Text
                  style={[styles.modalBtnTextSec, { color: theme.textSecondary }]}
                >
                  {i18n.common.cancel}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[
                  styles.modalBtnPrimary,
                  { backgroundColor: uiColors.accentGreen },
                ]}
              >
                <Text
                  style={[
                    styles.modalBtnTextPrim,
                    {
                      color: isDark ? palette.deepForestDark : '#FFFFFF',
                    },
                  ]}
                >
                  {i18n.common.save}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Pulihkan Data JSON */}
      <Modal
        visible={restoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRestoreModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCardLarge,
              {
                backgroundColor: uiColors.cardBg,
                borderColor: uiColors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {i18n.profile.data.restoreModalTitle}
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: theme.textSecondary }]}
            >
              {i18n.profile.data.restoreModalDesc}
            </Text>

            <TextInput
              value={restoreJsonInput}
              onChangeText={setRestoreJsonInput}
              placeholder={i18n.profile.data.restorePlaceholder}
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.modalTextArea,
                {
                  backgroundColor: isDark ? '#1F312B' : '#F0F5F3',
                  color: theme.text,
                  borderColor: uiColors.cardBorder,
                },
              ]}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => {
                  setRestoreModalVisible(false);
                  setRestoreJsonInput('');
                }}
                style={[
                  styles.modalBtnSecondary,
                  { backgroundColor: isDark ? '#263C34' : '#E8F0EC' },
                ]}
              >
                <Text
                  style={[styles.modalBtnTextSec, { color: theme.textSecondary }]}
                >
                  {i18n.common.cancel}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmRestore}
                disabled={isRestoring}
                style={[
                  styles.modalBtnPrimary,
                  { backgroundColor: uiColors.accentGreen },
                ]}
              >
                <Text
                  style={[
                    styles.modalBtnTextPrim,
                    {
                      color: isDark ? palette.deepForestDark : '#FFFFFF',
                    },
                  ]}
                >
                  {isRestoring
                    ? (isId ? 'Memproses...' : 'Processing...')
                    : i18n.profile.data.btnRestore}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  topBarRightSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editPencilBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardSection: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  switchItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  switchTextCol: {
    flex: 1,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  appIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  appNameVersion: {
    fontSize: 15,
    fontWeight: '700',
  },
  appFooterSub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  appFooterPriv: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  modalCardLarge: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 120,
    maxHeight: 200,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalBtnSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnTextSec: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnTextPrim: {
    fontSize: 14,
    fontWeight: '700',
  },
});
