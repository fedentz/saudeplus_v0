import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../constants/theme';

export const useAppTheme = () => {
  const { theme } = useTheme();
  return theme === 'dark' ? darkTheme : lightTheme;
};
