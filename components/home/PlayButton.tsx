import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';

interface Props {
  onPress: () => void;
}

export default function PlayButton({ onPress }: Props) {
  const theme = useAppTheme();
  const isDark = theme.colors.background === '#121212';
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: isDark ? '#111' : '#e0e0e0',
        },
      ]}
      onPress={onPress}
    >
      <Ionicons name="play" size={70} color={theme.colors.white} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    marginVertical: 24,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
});
