import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { AppTheme, useAppTheme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const spinnerColor =
    variant === 'outline' ? theme.colors.primary : theme.colors.onPrimary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.primaryButtonText,
            variant === 'secondary' && styles.secondaryButtonText,
            variant === 'outline' && styles.outlineButtonText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
      backgroundColor: 'transparent',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.secondary,
    },
    outlineButton: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      backgroundColor: 'transparent',
    },
    disabledButton: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
    },
    secondaryButtonText: {
      color: theme.colors.onSecondary,
    },
    outlineButtonText: {
      color: theme.colors.primary,
    },
  });
