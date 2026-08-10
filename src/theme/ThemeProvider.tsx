import React, { createContext, useContext, useMemo } from 'react';
import { buildTheme, type ColorScheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(buildTheme('light'));

export const ThemeProvider = ({
  scheme = 'light',
  children,
}: {
  scheme?: ColorScheme;
  children: React.ReactNode;
}) => {
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
