import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useEmoji } from '../../context/EmojiContext';
import { useTranslation } from 'react-i18next';

type Props = {
  distance: number;
  timeFormatted: string;
  onEnd: () => void;
  disabled: boolean;
};

export default function ActivityOverlay({ distance, timeFormatted, onEnd, disabled }: Props) {
  const theme = useAppTheme();
  const { emoji } = useEmoji();
  const { t } = useTranslation();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, [scale]);

  const styles = createStyles(theme);
  return (
    <>
      <View style={styles.header}>
        <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>{emoji}</Animated.Text>
        <Text style={styles.distance}>{distance.toFixed(2)} km</Text>
        <Text style={styles.time}>
          {t('activity.duration')}
          {timeFormatted}
        </Text>
      </View>
      <View style={styles.footer} pointerEvents="box-none">
        <TouchableOpacity style={styles.button} onPress={onEnd} disabled={disabled}>
          <Text style={styles.buttonText}>{t('activity.finish')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 40,
      alignSelf: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor:
        theme.colors.white === '#000000' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
      alignItems: 'center',
      zIndex: 2,
    },
    emoji: {
      fontSize: 42,
      zIndex: 99,
    },
    distance: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.white === '#000000' ? '#fff' : '#000',
    },
    time: {
      fontSize: 14,
      color: theme.colors.white === '#000000' ? '#ccc' : '#555',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.white === '#000000' ? '#1e1e1e' : '#fff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingVertical: 12,
      paddingBottom: 32,
      paddingHorizontal: 24,
      alignItems: 'center',
      elevation: 6,
    },
    button: {
      backgroundColor: '#0099ff',
      borderRadius: 32,
      paddingVertical: 14,
      paddingHorizontal: 32,
      width: '100%',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
