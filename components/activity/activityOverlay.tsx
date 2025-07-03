import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';

type Props = {
  distance: number;
  timeFormatted: string;
  onEnd: () => void;
  disabled: boolean;
};

export default function ActivityOverlay({ distance, timeFormatted, onEnd, disabled }: Props) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.overlay}>
      <Text style={styles.distance}>{distance.toFixed(2)} km</Text>
      <Text style={styles.time}>Duración: {timeFormatted}</Text>
      <TouchableOpacity style={styles.button} onPress={onEnd} disabled={disabled}>
        <Text style={styles.buttonText}>FINALIZAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 40,
    paddingBottom: 20,
  },
  distance: {
    fontSize: 32,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 18,
    color: theme.colors.white,
    marginVertical: 5,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
