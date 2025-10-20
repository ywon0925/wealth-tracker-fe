import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppTheme, useAppTheme } from '../theme';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'medium' }) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconSize = size === 'small' ? 14 : size === 'medium' ? 16 : 20;
  const containerSize = size === 'small' ? 18 : size === 'medium' ? 20 : 24;

  return (
    <View style={[styles.badge, { width: containerSize, height: containerSize }]}>
      <Text style={[styles.checkmark, { fontSize: iconSize }]}>✓</Text>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    badge: {
      backgroundColor: theme.colors.success,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: theme.colors.onPrimary,
      fontWeight: 'bold',
    },
  });
