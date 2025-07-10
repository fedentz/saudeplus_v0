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
        <Text style={styles.greeting}>¡Hola, {username}!</Text>
        <HeaderInfo date={new Date()} />
      </View>
      <View style={styles.centerContent}>
        <Text style={styles.startText}>Vamos começar?</Text>
        <PlayButton onPress={() => console.log('Actividad iniciada')} />
        <View style={styles.infoBox}>
          <Text style={styles.label}>
            Kilómetros recorridos: <Text style={styles.value}>{kilometers.toFixed(1)} km</Text>
          </Text>
          <Text style={styles.label}>
            Descuento obtenido: <Text style={styles.value}>R$ {descuento.toFixed(2)}</Text>
          </Text>
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
      marginTop: 20,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    greeting: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.text,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pendingBadge: {
      position: 'absolute',
      top: 28, // Ajustado por el nuevo margen del header
      right: 16,
      backgroundColor: 'red',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      paddingHorizontal: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pendingText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    startText: {
      width: '85%',
      fontSize: 30,
      marginBottom: 20,
      textAlign: 'center',
      color: theme.colors.primary,
      fontWeight: 'bold',
      textShadowColor: theme.colors.background === '#121212' ? '#000' : '#ccc',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },

    infoText: {
      marginTop: 8,
      color: theme.colors.text,
    },
    infoBox: {
      width: '88%',
      backgroundColor: theme.colors.background === '#121212' ? '#1e1e1e' : '#fff',
      borderRadius: 16,
      padding: 16,
      marginTop: 16,
      shadowColor: theme.colors.background === '#121212' ? '#111' : '#e0e0e0',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    label: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
    },

    value: {
      fontWeight: 'bold',
      color: theme.colors.primary,
    },

    buttonLabel: {
      marginTop: 8,
      fontSize: 16,
      color: theme.colors.text,
    },
  });
