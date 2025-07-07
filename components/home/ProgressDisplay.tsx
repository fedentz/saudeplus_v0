import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Props {
  distance: number;
  goal: number;
  benefit?: string;
}

export default function ProgressDisplay({ distance, goal, benefit }: Props) {
  const theme = useAppTheme();
  const ratio = Math.min(distance / goal, 1);

  let message = '¡Recién empieza!';
  if (ratio >= 1) message = '¡Objetivo completado!';
  else if (ratio > 0.75) message = '¡Casi llegás!';
  else if (ratio > 0.4) message = '¡Vas bien!';

  return (
    <View style={styles.container}>
      <Text style={[styles.progressText, { color: theme.colors.text }]}>
        {' '}
        {distance.toFixed(1)} / {goal} km
      </Text>
      <View style={[styles.barBackground, { backgroundColor: theme.colors.gray }]}>
        <View
          style={[styles.bar, { backgroundColor: theme.colors.primary, width: `${ratio * 100}%` }]}
        />
      </View>
      <Text style={[styles.message, { color: theme.colors.primary }]}>{message}</Text>
      {benefit ? (
        <Text style={[styles.benefit, { color: theme.colors.darkGray }]}>{benefit}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center' },
  progressText: { fontWeight: 'bold', marginBottom: 8 },
  barBackground: { width: '100%', height: 10, borderRadius: 5, overflow: 'hidden' },
  bar: { height: 10 },
  message: { marginTop: 8, fontSize: 16 },
  benefit: { marginTop: 4, fontSize: 14 },
});
