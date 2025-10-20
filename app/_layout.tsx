import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { apiClient } from '../src/services/apiClient';
import { ThemeProvider, useAppTheme } from '../src/theme';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

function AppStack() {
  const router = useRouter();
  const loadUser = useAuthStore((state) => state.loadUser);
  const logout = useAuthStore((state) => state.logout);
  const { theme, mode } = useAppTheme();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const unsubscribe = () => {
      apiClient.setUnauthorizedCallback(() => {});
    };

    apiClient.setUnauthorizedCallback(() => {
      console.log('Auto-logout triggered due to 401');
      logout();
      router.replace('/login');
    });

    return unsubscribe;
  }, [logout, router]);

  const contentStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.background,
    }),
    [theme.colors.background]
  );

  return (
    <>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        backgroundColor={theme.colors.background}
        animated
        translucent={Platform.OS === 'android'}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppStack />
    </ThemeProvider>
  );
}
