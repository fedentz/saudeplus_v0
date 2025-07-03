import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const appTheme = useAppTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: appTheme.colors.background,
    },
    text: { color: appTheme.colors.text, marginBottom: 10 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dark Mode</Text>
      <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
    </View>
  );
}
