import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { AppTheme, ThemeMode, darkTheme, lightTheme } from './theme';

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const defaultContext: ThemeContextValue = {
  theme: lightTheme,
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
};

const ThemeContext = createContext(defaultContext);

const themeFromScheme = (scheme: ColorSchemeName | null): ThemeMode =>
  scheme === 'dark' ? 'dark' : 'light';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    themeFromScheme(Appearance.getColorScheme())
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const nextMode = themeFromScheme(colorScheme);
      setModeState((current) => (current === nextMode ? current : nextMode));
    });

    return () => subscription.remove();
  }, []);

  const setMode = useCallback((value: ThemeMode) => {
    setModeState(value);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      mode,
      setMode,
      toggleMode,
    }),
    [theme, mode, setMode, toggleMode]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};
