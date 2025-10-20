import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { plaidService } from '../src/services/plaidService';
import { accountService } from '../src/services/accountService';
import { netWorthService } from '../src/services/netWorthService';
import { useAppStore } from '../src/store/appStore';
import { Button } from '../src/components/Button';
import { AppTheme, useAppTheme } from '../src/theme';

// Don't import Plaid SDK at module level - it causes NativeEventEmitter warnings
// We'll use it via dynamic calls instead

export default function LinkAccountScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setNetWorth = useAppStore((state) => state.setNetWorth);
  const setAccounts = useAppStore((state) => state.setAccounts);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingToken, setFetchingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinkToken = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setFetchingToken(false);
      return;
    }

    try {
      setFetchingToken(true);
      setError(null);
      console.log('Fetching link token...');
      console.log('User ID:', user.id);
      // Backend automatically gets userId from auth token
      const token = await plaidService.createLinkToken();
      console.log('Link token received from service:', token);
      console.log('Token length:', token?.length);
      console.log('Token value:', token ? 'Success' : 'Failed');
      setLinkToken(token);
      console.log('Link token state updated');
    } catch (err: any) {
      console.error('Failed to fetch link token:', err);
      setError(err.message || 'Failed to initialize Plaid Link. Please ensure the backend is running.');
    } finally {
      setFetchingToken(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchLinkToken();
    }
  }, [fetchLinkToken, user?.id]);

  const onSuccess = useCallback(async (success: any) => {
    console.log('Plaid Link success callback triggered');
    const { publicToken, metadata } = success;

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      setLoading(true);
      console.log('Linking account with backend...');

      // Link account using backend API format (matches Postman collection)
      // Backend expects: { publicToken, institutionName, accountName, accountType }
      const firstAccount = metadata.accounts?.[0];
      const accountType = firstAccount?.type === 'depository' ? 'cash' :
                         firstAccount?.type === 'credit' ? 'credit' :
                         firstAccount?.type === 'loan' ? 'loan' : 'other';

      await accountService.linkAccount({
        userId: user.id,
        publicToken,
        institutionName: metadata.institution?.name || 'Unknown Bank',
        accountName: firstAccount?.name || 'Account',
        accountType,
      });

      try {
        const updatedAccounts = await accountService.listAccounts(user.id);
        setAccounts(updatedAccounts);
      } catch (listError) {
        console.warn('Failed to refresh account list after linking:', listError);
      }

      try {
        const latestNetWorth = await netWorthService.calculateNetWorth(user.id);
        setNetWorth(latestNetWorth);
      } catch (calcError) {
        console.warn('Failed to recalculate net worth after linking account:', calcError);
      }

      console.log('Account linked successfully');
      Alert.alert('Success', 'Account linked successfully!');
      router.back();
    } catch (error: any) {
      console.error('Link account error:', error);
      Alert.alert('Error', error.message || 'Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router, setAccounts, setNetWorth, user?.id]);

  const onExit = useCallback((exit: any) => {
    console.log('Plaid Link exited:', exit);
    if (exit.error) {
      Alert.alert('Error', exit.error.displayMessage || 'Failed to link account');
    }
  }, []);

  const handleOpenPlaid = useCallback(async () => {
    console.log('Opening Plaid Link, token exists:', !!linkToken);

    if (Platform.OS === 'web') {
      Alert.alert('Error', 'Plaid Link is only available on iOS and Android.');
      return;
    }

    if (!linkToken) {
      console.error('No link token available');
      Alert.alert('Error', 'Plaid Link not initialized. Please try again.');
      return;
    }

    try {
      // Import Plaid SDK helpers dynamically to avoid NativeEventEmitter warnings
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PlaidLink = require('react-native-plaid-link-sdk');
      const { create, open, destroy } = PlaidLink;
      console.log('Plaid SDK imported with methods:', Object.keys(PlaidLink));

      // Tear down any stale session before creating a new one
      if (typeof destroy === 'function') {
        await destroy();
      }

      // Initialize Plaid with the link token
      console.log('Creating Plaid Link with token:', `${linkToken.substring(0, 20)}...`);
      create({
        token: linkToken,
      });

      // Open Plaid Link with success and exit handlers
      console.log('Opening Plaid Link...');
      open({
        onSuccess: (success: any) => {
          console.log('Plaid success callback');
          onSuccess(success);
        },
        onExit: (exit: any) => {
          console.log('Plaid exit callback');
          onExit(exit);
        },
      });
      console.log('Plaid Link opened successfully');
    } catch (err) {
      console.error('Failed to open Plaid Link:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      Alert.alert('Error', `Failed to open Plaid Link: ${err.message}`);
    }
  }, [linkToken, onSuccess, onExit]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Link Your Account</Text>
        <Text style={styles.subtitle}>
          Securely connect your financial accounts using Plaid
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 Bank-Level Security</Text>
          <Text style={styles.infoText}>
            We use Plaid to securely connect your accounts. Your credentials are never stored.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>✓ Verified Data</Text>
          <Text style={styles.infoText}>
            Linking your accounts gives you a verified badge and access to all features.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📊 Automatic Updates</Text>
          <Text style={styles.infoText}>
            Your net worth is automatically calculated and updated based on your subscription tier.
          </Text>
        </View>

        {fetchingToken ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Initializing Plaid Link...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={fetchLinkToken}
              variant="outline"
              style={styles.retryButton}
            />
            <Text style={styles.helpText}>
              Make sure your backend server is running and the Plaid API credentials are configured.
            </Text>
          </View>
        ) : linkToken ? (
          <Button
            title="Connect with Plaid"
            onPress={handleOpenPlaid}
            loading={loading}
            style={styles.linkButton}
          />
        ) : null}

        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      padding: 24,
      paddingTop: 60,
      backgroundColor: theme.colors.surface,
    },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary },
    subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 8 },
    content: { padding: 16 },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 4,
      elevation: theme.isDark ? 0 : 1,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    infoTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
    infoText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
    linkButton: { marginTop: 24 },
    cancelButton: { marginTop: 12 },
    loadingContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 32,
      marginTop: 24,
      alignItems: 'center',
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    loadingText: { fontSize: 14, color: theme.colors.textMuted, marginTop: 16 },
    errorContainer: {
      backgroundColor: theme.isDark ? theme.colors.surfaceElevated : '#FEE2E2',
      borderRadius: 12,
      padding: 16,
      marginTop: 24,
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    errorText: { fontSize: 14, fontWeight: '600', color: theme.colors.danger, marginBottom: 12 },
    retryButton: { marginTop: 8 },
    helpText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 12, lineHeight: 18 },
  });
