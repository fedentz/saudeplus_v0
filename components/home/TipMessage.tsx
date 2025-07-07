import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Props {
  text: string;
}

export default function TipMessage({ text }: Props) {
  const theme = useAppTheme();
  return <Text style={[styles.text, { color: theme.colors.darkGray }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    marginTop: 24,
    fontSize: 16,
    textAlign: 'center',
  },
});
