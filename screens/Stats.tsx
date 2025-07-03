import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import ActivityRecord from '../components/ActivityRecord';

export default function Stats() {
  return (
    <View style={styles.container}>
      <ActivityRecord />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
