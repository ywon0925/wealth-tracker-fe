export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  accent: string;
  accentSoft: string;
  chipBackground: string;
  chipActiveBackground: string;
  chipText: string;
  chipActiveText: string;
  tabBarBackground: string;
  tabBarStroke: string;
  tabBarActive: string;
  tabBarInactive: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  skeleton: string;
  overlay: string;
}

export interface AppTheme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
}

export const lightTheme: AppTheme = {
  mode: 'light',
  isDark: false,
  colors: {
    background: '#F1F5F9',
    backgroundAlt: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceElevated: '#F8FAFC',
    surfaceMuted: '#EEF2FF',
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    secondary: '#7C3AED',
    onSecondary: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    border: '#E2E8F0',
    borderSubtle: '#CBD5F5',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#F87171',
    info: '#38BDF8',
    accent: '#1D4ED8',
    accentSoft: '#DBEAFE',
    chipBackground: '#E2E8F0',
    chipActiveBackground: '#2563EB',
    chipText: '#1F2937',
    chipActiveText: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    tabBarStroke: '#E2E8F0',
    tabBarActive: '#2563EB',
    tabBarInactive: '#94A3B8',
    inputBackground: '#F1F5F9',
    inputBorder: '#E2E8F0',
    inputPlaceholder: '#94A3B8',
    skeleton: '#E2E8F0',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  isDark: true,
  colors: {
    background: '#020817',
    backgroundAlt: '#0F172A',
    surface: '#131C2E',
    surfaceElevated: '#1E293B',
    surfaceMuted: '#1E1B4B',
    primary: '#60A5FA',
    onPrimary: '#0B1220',
    secondary: '#C084FC',
    onSecondary: '#111827',
    textPrimary: '#E2E8F0',
    textSecondary: '#CBD5F5',
    textMuted: '#94A3B8',
    border: '#1F2A3F',
    borderSubtle: '#27354D',
    success: '#4ADE80',
    warning: '#FACC15',
    danger: '#FB7185',
    info: '#38BDF8',
    accent: '#60A5FA',
    accentSoft: '#1E3A8A',
    chipBackground: '#1E293B',
    chipActiveBackground: '#60A5FA',
    chipText: '#CBD5F5',
    chipActiveText: '#0F172A',
    tabBarBackground: '#0B1220',
    tabBarStroke: '#1F2A3F',
    tabBarActive: '#60A5FA',
    tabBarInactive: '#475569',
    inputBackground: '#0F172A',
    inputBorder: '#1E293B',
    inputPlaceholder: '#64748B',
    skeleton: '#1F2A3F',
    overlay: 'rgba(2, 8, 23, 0.7)',
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
