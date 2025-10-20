import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useAppTheme } from '../../src/theme';

export default function TabLayout() {
  const { theme } = useAppTheme();

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: theme.colors.tabBarActive,
      tabBarInactiveTintColor: theme.colors.tabBarInactive,
      tabBarStyle: {
        backgroundColor: theme.colors.tabBarBackground,
        borderTopColor: theme.colors.tabBarStroke,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: theme.colors.backgroundAlt,
      },
      headerTintColor: theme.colors.textPrimary,
      tabBarHideOnKeyboard: true,
      headerShadowVisible: false,
    }),
    [theme.colors]
  );

  return (
    <Tabs
      screenOptions={screenOptions}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
