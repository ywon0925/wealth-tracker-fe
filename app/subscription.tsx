import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
import { AppTheme, useAppTheme } from '../src/theme';

type Tier = 'free' | 'premium' | 'pro';

export default function SubscriptionScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [currentTier, setCurrentTier] = useState<Tier>('free');
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    if (user) {
      setCurrentTier(user.subscriptionTier);
    }
  }, [user]);

  const tiers = [
    {
      name: 'Free',
      value: 'free' as Tier,
      price: 0,
      features: [
        'Up to 3 accounts',
        'Weekly data refresh',
        'Basic benchmarking',
        'Read-only community access',
      ],
    },
    {
      name: 'Premium',
      value: 'premium' as Tier,
      price: 15,
      features: [
        'Unlimited accounts',
        'Daily data refresh',
        'Advanced benchmarking filters',
        'Post & comment in community',
        'Priority support',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      value: 'pro' as Tier,
      price: 40,
      features: [
        'Everything in Premium',
        'On-demand refresh',
        'AI-powered insights',
        'Extended analytics',
        'Private channels',
        'Dedicated support',
      ],
    },
  ];

  const handleUpgrade = (tier: Tier) => {
    if (tier === currentTier) return;
    // TODO: Implement Stripe payment flow
    console.log('Upgrade to:', tier);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>Upgrade to unlock more features</Text>
      </View>

      <View style={styles.content}>
        {tiers.map((tier) => (
          <View
            key={tier.value}
            style={[
              styles.tierCard,
              tier.popular && styles.popularCard,
              currentTier === tier.value && styles.currentCard,
            ]}
          >
            {tier.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            {currentTier === tier.value && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentText}>CURRENT PLAN</Text>
              </View>
            )}

            <Text style={styles.tierName}>{tier.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>${tier.price}</Text>
              <Text style={styles.priceUnit}>/month</Text>
            </View>

            <View style={styles.features}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <Button
              title={
                currentTier === tier.value
                  ? 'Current Plan'
                  : tier.value === 'free'
                  ? 'Downgrade'
                  : 'Upgrade'
              }
              onPress={() => handleUpgrade(tier.value)}
              variant={tier.popular ? 'primary' : 'outline'}
              disabled={currentTier === tier.value}
              style={styles.tierButton}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 24, paddingTop: 60, backgroundColor: theme.colors.surface },
    backButton: { marginBottom: 16 },
    backText: { fontSize: 18, color: theme.colors.primary },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary },
    subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 8 },
    content: { padding: 16 },
    tierCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.colors.border,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 8,
      elevation: theme.isDark ? 0 : 2,
    },
    popularCard: { borderColor: theme.colors.primary, transform: [{ scale: 1.02 }] },
    currentCard: { borderColor: theme.colors.success },
    popularBadge: {
      position: 'absolute',
      top: -12,
      right: 24,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    popularText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.onPrimary },
    currentBadge: {
      position: 'absolute',
      top: -12,
      right: 24,
      backgroundColor: theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    currentText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.onPrimary },
    tierName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 8 },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
    price: { fontSize: 40, fontWeight: 'bold', color: theme.colors.textPrimary },
    priceUnit: { fontSize: 16, color: theme.colors.textMuted, marginLeft: 4 },
    features: { marginBottom: 24 },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkmark: { fontSize: 16, color: theme.colors.success, marginRight: 8, fontWeight: 'bold' },
    featureText: { fontSize: 14, color: theme.colors.textSecondary, flex: 1 },
    tierButton: { marginTop: 8 },
  });
