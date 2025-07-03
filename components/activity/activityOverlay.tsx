import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  distance: number;
  timeFormatted: string;
  onEnd: () => void;
  disabled: boolean;
};

export default function ActivityOverlay({ distance, timeFormatted, onEnd, disabled }: Props) {
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

const styles = StyleSheet.create({
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
    color: '#fff',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 18,
    color: '#fff',
    marginVertical: 5,
  },
  button: {
    backgroundColor: '#00aaff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
