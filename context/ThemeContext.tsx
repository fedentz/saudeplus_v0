import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type AppTheme = 'light' | 'dark';

interface ThemeContextProps {
  theme: AppTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>('light');

  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('APP_THEME');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else {
        const sys = Appearance.getColorScheme();
        if (sys === 'dark' || sys === 'light') setTheme(sys);
      }
    };
    load();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('APP_THEME', newTheme);
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
