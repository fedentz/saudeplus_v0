import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Props {
  date: Date;
}

export default function HeaderInfo({ date }: Props) {
  const theme = useAppTheme();
  const formatted = date
    .toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .replace(/^\w/, (m) => m.toUpperCase());
  return <Text style={[styles.text, { color: theme.colors.darkGray }]}>{formatted}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 18, marginBottom: 16 },
});
