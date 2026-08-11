import React, { createContext, useContext } from 'react';
import { theme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(theme);

/**
 * Система dark-only, поэтому провайдер отдаёт одну константу.
 * Хук `useTheme()` сохранён намеренно: компоненты не зависят от того,
 * появится ли позже вторая схема.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);
