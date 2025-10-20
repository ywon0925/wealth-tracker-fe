import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { AppTheme, useAppTheme } from '../src/theme';

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Wait for component to mount and auth check to complete
    if (!isMounted || isLoading) return;

    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, isLoading, isMounted, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verified Wealth</Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 24,
    },
    loader: {
      marginTop: 20,
    },
  });
