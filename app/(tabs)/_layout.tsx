import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/core/theme';
import { useI18n } from '@/src/core/i18n';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const { isDark, theme } = useAppTheme();
  const { i18n } = useI18n();
  const insets = useSafeAreaInsets();

  const activeColor = theme.tabIconSelected;
  const inactiveColor = theme.tabIconDefault;
  const activePillBg = isDark ? theme.surface : theme.cardSecondary;
  const tabBarBg = isDark ? theme.cardSecondary : theme.background;
  const bottomPadding = Math.max(insets.bottom + 12, 28);

  const renderTabIcon = (
    iconName: keyof typeof Ionicons.glyphMap,
    focused: boolean
  ) => (
    <View
      style={[
        styles.tabIconWrapper,
        focused && {
          backgroundColor: activePillBg,
        },
      ]}
    >
      <Ionicons
        name={iconName}
        size={20}
        color={focused ? activeColor : inactiveColor}
      />
    </View>
  );

  const renderTabLabel = (label: string, focused: boolean) => (
    <Text
      style={[
        styles.tabLabel,
        {
          color: focused ? activeColor : inactiveColor,
          fontWeight: focused ? '600' : '500',
        },
      ]}
    >
      {label}
    </Text>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: theme.borderSubtle,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: 62 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          width: 56,
          height: 32,
        },
        headerStyle: {
          backgroundColor: theme.card,
        },
        headerTintColor: theme.text,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.nav.dashboard,
          headerShown: false,
          tabBarIcon: ({ focused }) => renderTabIcon('grid-outline', focused),
          tabBarLabel: ({ focused }) =>
            renderTabLabel(i18n.nav.dashboard, focused),
        }}
      />
      <Tabs.Screen
        name="saku"
        options={{
          title: i18n.nav.saku,
          headerShown: false,
          tabBarIcon: ({ focused }) => renderTabIcon('wallet-outline', focused),
          tabBarLabel: ({ focused }) => renderTabLabel(i18n.nav.saku, focused),
        }}
      />
      <Tabs.Screen
        name="rutinitas"
        options={{
          title: i18n.nav.rutinitas,
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            renderTabIcon('checkmark-circle-outline', focused),
          tabBarLabel: ({ focused }) =>
            renderTabLabel(i18n.nav.rutinitas, focused),
        }}
      />
      <Tabs.Screen
        name="pengingat"
        options={{
          title: i18n.nav.pengingat,
          headerShown: false,
          tabBarIcon: ({ focused }) => renderTabIcon('shield-outline', focused),
          tabBarLabel: ({ focused }) =>
            renderTabLabel(i18n.nav.pengingat, focused),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.1,
  },
});
