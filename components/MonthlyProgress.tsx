import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface Props {
  totalKm: number;
  goalKm: number;
}

export default function MonthlyProgress({ totalKm, goalKm }: Props) {
  const theme = useAppTheme();
  const percentage = Math.min(totalKm / goalKm, 1);

  let message = '¡Vamos a comenzar!';
  if (percentage >= 1) message = '¡Objetivo completado!';
  else if (percentage > 0.75) message = '¡Queda poco!';
  else if (percentage > 0.4) message = '¡Buen ritmo!';
  else message = '¡Recién empieza!';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>¿VAMOS COMENZAR?</Text>
      <View style={[styles.playButton, { backgroundColor: theme.colors.primary }]} />
      <Text style={styles.progressText}>{totalKm.toFixed(1)}/{goalKm} km</Text>
      <View style={styles.barContainer}>
        <View style={[styles.bar, { backgroundColor: theme.colors.success, width: `${percentage * 100}%` }]} />
      </View>
      <Text style={[styles.message, { color: theme.colors.success }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 40 },
  title: { fontSize: 24, fontWeight: 'bold' },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0091EA',
    marginVertical: 20,
  },
  progressText: { marginTop: 10, fontWeight: 'bold', fontSize: 16 },
  message: { marginTop: 10, fontSize: 18 },
  barContainer: {
    width: 200,
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: 10,
  },
});
