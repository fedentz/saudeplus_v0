import NetInfo from '@react-native-community/netinfo';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import HeaderInfo from '../components/home/HeaderInfo';
import PlayButton from '../components/home/PlayButton';
import { usePendingActivities } from '../context/PendingActivitiesContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { auth } from '../firebase/firebase';
import { useKilometers } from '../context/KmContext';

export default function Home({ navigation }: any) {
  const theme = useAppTheme();
  const { sync, logPending, pendingCount } = usePendingActivities();
  const { kilometers } = useKilometers();
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
  const descuento = kilometers * 0.05;

  return (
    <SafeAreaView style={styles.container}>
      {pendingCount > 0 && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{pendingCount}</Text>
        </View>
      )}
      
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>¡Hola, {username}!</Text>
          <HeaderInfo date={new Date()} />
        </View>
      </View>

      <View style={styles.startContainer}>
        <Text style={styles.startText}>VAMOS COMENZAR?</Text>
      </View>

      <View style={styles.centerContent}>
        <PlayButton onPress={() => console.log('Actividad iniciada')} />
      </View>

      <View style={styles.infoBoxContainer}>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Kilómetros recorridos:</Text>
            <Text style={styles.value}>{kilometers.toFixed(1)} km</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Descuento obtenido:</Text>
            <Text style={styles.value}>R$ {descuento.toFixed(2)}</Text>
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
    headerContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    startContainer: {
      marginTop: 30,
      alignItems: 'center',
    },
    startText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pendingBadge: {
      position: 'absolute',
      top: 28,
      right: 16,
      backgroundColor: 'red',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      paddingHorizontal: 6,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    pendingText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    infoBoxContainer: {
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    infoBox: {
      width: '100%',
      backgroundColor: theme.colors.cardBackground || 
                     (theme.colors.background === '#121212' ? '#1e1e1e' : '#fff'),
      borderRadius: 16,
      padding: 16,
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      color: theme.colors.text,
    },
    value: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
  });