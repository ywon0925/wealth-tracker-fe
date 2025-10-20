import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Button } from '../../src/components/Button';
import { AppTheme, useAppTheme } from '../../src/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, mode, setMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          {user?.verified && <VerifiedBadge />}
        </View>
        <Text style={styles.alias}>@{user?.alias || 'user'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Email" value={user?.email || ''} />
          <InfoRow label="Location" value={`${user?.city}, ${user?.state}, ${user?.country}`} />
          <InfoRow label="Subscription" value={user?.subscriptionTier || 'free'} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/subscription')}>
          <Text style={styles.menuText}>Manage Subscription</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.menuItem}>
          <Text style={styles.menuText}>Dark Mode</Text>
          <Switch
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={mode === 'dark' ? theme.colors.primary : '#f8fafc'}
            value={mode === 'dark'}
            onValueChange={(value) => setMode(value ? 'dark' : 'light')}
          />
        </View>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      alignItems: 'center',
      padding: 24,
      paddingTop: 60,
      backgroundColor: theme.colors.surface,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatar: { fontSize: 32, fontWeight: 'bold', color: theme.colors.onPrimary },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textPrimary },
    alias: { fontSize: 16, color: theme.colors.textMuted, marginTop: 4 },
    section: { padding: 16 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 4,
      elevation: theme.isDark ? 0 : 1,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    infoLabel: { fontSize: 14, color: theme.colors.textMuted },
    infoValue: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    menuText: { fontSize: 16, color: theme.colors.textPrimary },
    menuArrow: { fontSize: 24, color: theme.colors.textMuted },
    logoutButton: { margin: 16, marginTop: 32 },
  });
