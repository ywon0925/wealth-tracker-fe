import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../src/store/authStore';
import { useAppStore } from '../../src/store/appStore';
import { rankingService } from '../../src/services/rankingService';
import { AppTheme, useAppTheme } from '../../src/theme';

export default function RankingScreen() {
  const user = useAuthStore((state) => state.user);
  const ranking = useAppStore((state) => state.ranking);
  const setRanking = useAppStore((state) => state.setRanking);
  const [ageRange, setAgeRange] = useState('25-29');
  const [location, setLocation] = useState('US');
  const [incomeBracket, setIncomeBracket] = useState('100k-150k');
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const loadRanking = useCallback(async () => {
    if (!user) return;
    try {
      const data = await rankingService.assessRanking(user.id, {
        ageRange,
        location,
        incomeBracket,
      });
      setRanking(data);
    } catch (error) {
      console.error('Failed to load ranking:', error);
    }
  }, [ageRange, incomeBracket, location, setRanking, user]);

  useEffect(() => {
    loadRanking();
  }, [loadRanking]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Ranking</Text>
        <Text style={styles.subtitle}>Compare yourself with similar peers</Text>
      </View>

      {ranking && (
        <View style={styles.card}>
          <View style={styles.percentileContainer}>
            <Text style={styles.percentileLabel}>You are in the top</Text>
            <Text style={styles.percentile}>{Math.round(ranking.percentile)}%</Text>
            <Text style={styles.percentileLabel}>among {ranking.peerCount} peers</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${ranking.percentile}%` }]} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Your Net Worth</Text>
              <Text style={styles.statValue}>
                ${(ranking.userNetWorth / 1000).toFixed(0)}k
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Peer Average</Text>
              <Text style={styles.statValue}>
                ${(ranking.averageNetWorth / 1000).toFixed(0)}k
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filters</Text>

        <Text style={styles.label}>Age Range</Text>
        <Picker
          selectedValue={ageRange}
          onValueChange={setAgeRange}
          style={styles.picker}
          dropdownIconColor={theme.colors.textPrimary}
        >
          <Picker.Item label="25-29" value="25-29" />
          <Picker.Item label="30-34" value="30-34" />
          <Picker.Item label="35-39" value="35-39" />
          <Picker.Item label="40-44" value="40-44" />
        </Picker>

        <Text style={styles.label}>Location</Text>
        <Picker
          selectedValue={location}
          onValueChange={setLocation}
          style={styles.picker}
          dropdownIconColor={theme.colors.textPrimary}
        >
          <Picker.Item label="United States" value="US" />
          <Picker.Item label="Canada" value="CA" />
        </Picker>

        <Text style={styles.label}>Income Bracket</Text>
        <Picker
          selectedValue={incomeBracket}
          onValueChange={setIncomeBracket}
          style={styles.picker}
          dropdownIconColor={theme.colors.textPrimary}
        >
          <Picker.Item label="$80k-$100k" value="80k-100k" />
          <Picker.Item label="$100k-$150k" value="100k-150k" />
          <Picker.Item label="$150k-$200k" value="150k-200k" />
          <Picker.Item label="$200k+" value="200k+" />
        </Picker>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 24, paddingTop: 60, backgroundColor: theme.colors.surface },
    title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.textPrimary },
    subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 4 },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      margin: 16,
      shadowColor: theme.isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0 : 0.05,
      shadowRadius: 8,
      elevation: theme.isDark ? 0 : 2,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    percentileContainer: { alignItems: 'center', paddingVertical: 24 },
    percentileLabel: { fontSize: 16, color: theme.colors.textMuted },
    percentile: { fontSize: 64, fontWeight: 'bold', color: theme.colors.primary, marginVertical: 8 },
    progressBar: { height: 8, backgroundColor: theme.colors.border, borderRadius: 4, marginVertical: 16 },
    progressFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 4 },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    stat: { alignItems: 'center' },
    statLabel: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '600', color: theme.colors.textPrimary },
    cardTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 16 },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginTop: 12,
      marginBottom: 4,
    },
    picker: {
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 10,
      color: theme.colors.textPrimary,
    },
  });
