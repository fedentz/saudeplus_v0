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
        <PlayButton onPress={() => navigation.navigate('Activity')} />
      </View>
        <View style={[styles.infoBox, { position: 'absolute', bottom: 80, alignSelf: 'center' }]}>
          <Text style={styles.label}>
            Kilómetros recorridos:{' '}
            <Text style={styles.value}>{kilometers.toFixed(1)} km</Text>
          </Text>
          <Text style={styles.label}>
            Descuento obtenido:{' '}
            <Text style={styles.value}>R$ {descuento.toFixed(2)}</Text>
          </Text>
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
      marginTop: 35, // Margen superior para alejar del borde
      paddingHorizontal: 20, // Padding horizontal para centrar
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
      paddingHorizontal: 24,
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
      fontSize: 40,
      marginBottom: 16,
      textAlign: 'center',
      color: theme.colors.primary, // mismo color que el botón
      fontWeight: 'bold',
    },
    infoText: { 
      marginTop: 8, 
      color: theme.colors.text 
    },
    infoBox: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginVertical: 12,
      shadowColor: '	#F2F2F2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    label: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
    },

    value: {
      fontWeight: 'bold',
      color: '#007AFF',
    },
  });