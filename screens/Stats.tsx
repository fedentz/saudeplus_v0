import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import ActivityRecord from '../components/ActivityRecord';

export default function Stats() {
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
  });
  return (
    <View style={styles.container}>
      <ActivityRecord />
    </View>
  );
}
