import NetInfo from '@react-native-community/netinfo';
import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
  Vibration,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { usePendingActivities } from '../context/PendingActivitiesContext';
import { auth } from '../firebase/firebase';
import { useKilometers } from '../context/KmContext';
import { useTranslation } from 'react-i18next';

export default function Home({ navigation }: any) {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const { sync, logPending, pendingCount } = usePendingActivities();
  const { kilometers } = useKilometers();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const styles = createStyles(theme);

  useEffect(() => {
    const check = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected && state.isInternetReachable !== false) {
        await sync();
      }
      logPending();
      (global as any).forceSync = sync;
      (global as any).logPendings = logPending;
    };
    check();
  }, []);

  const username = auth.currentUser?.email?.split('@')[0] || '';
  const discount = kilometers * 0.05;

  const animatePressIn = () => {
    Vibration.vibrate(10);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Pending Badge */}
      {pendingCount > 0 && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{pendingCount}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.greeting', { username })}</Text>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar" size={16} color={theme.colors.primary} />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>{t('home.start')}</Text>
      </View>

      {/* Centered Button */}
      <View style={styles.buttonContainer}>
        <View style={styles.playButtonWrapper}>
          <TouchableWithoutFeedback
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            onPress={() => navigation.navigate('Activity')}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View style={styles.playButton}>
                <Ionicons style={styles.play} name="play" size={82} color={theme.colors.background} />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </View>

      {/* Info Box */}
      <View style={styles.bottomSection}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('home.kilometers')}</Text>
            <Text style={styles.statValue}>{kilometers.toFixed(1)} km</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('home.discount')}</Text>
            <Text style={styles.statValue}>R$ {discount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 16,
    },
    greeting: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
    },
    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.cardBackground,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
    },
    dateText: {
      marginLeft: 6,
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.9,
    },
    centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },   // Main Title Styles
    titleContainer: {
      marginTop: 30,
      marginBottom: 40,
      paddingHorizontal: 24,
    },
    mainTitle: {
  fontSize: 42, // antes 32
  fontWeight: '700',
  color: theme.colors.primary,
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginTop: 30,
},

    // Button Styles
    buttonContainer: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
},

    playButtonWrapper: {
  shadowColor: theme.colors.primary,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 16,
  elevation: 12,
},

    playButton: {
  width: 160,
  height: 160,
  borderRadius: 70,
  backgroundColor: theme.colors.primary,
  justifyContent: 'center',
  alignItems: 'center',
},


    bottomSection: {
      paddingHorizontal: 24,
      paddingBottom: 32,
      position: 'absolute',
      bottom: 100,
      left: 0,
      right: 0,
    },
    statsCard: {
      backgroundColor:
        theme.colors.cardBackground ||
        (theme.colors.background === '#121212' ? '#1e1e1e' : '#fff'),
      borderRadius: 20,
      padding: 24,
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor:
        theme.colors.border || (theme.colors.background === '#121212' ? '#333' : '#f0f0f0'),
    },
    statItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    statLabel: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
      flex: 1,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: 'right',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.text + '20',
      marginVertical: 18,
    },
    pendingBadge: {
      position: 'absolute',
      top: 50,
      right: 24,
      backgroundColor: '#ff4444',
      borderRadius: 16,
      minWidth: 32,
      height: 32,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      shadowColor: '#ff4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    pendingText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
    },
    play: {
      marginLeft: 4,
    }
  });