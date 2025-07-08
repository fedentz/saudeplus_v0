import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAppTheme } from '../hooks/useAppTheme';
import { usePendingActivities } from '../context/PendingActivitiesContext';
import HeaderInfo from '../components/home/HeaderInfo';
import PlayButton from '../components/home/PlayButton';

export default function Home({ navigation }: any) {
  const theme = useAppTheme();
  const { sync, logPending, pendingCount } = usePendingActivities();
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

  const kmCaminados = 4.2;
  const descuento = kmCaminados * 0.05;

  return (
    <SafeAreaView style={styles.container}>
      {pendingCount > 0 && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{pendingCount}</Text>
        </View>
      )}
      <HeaderInfo date={new Date()} />
      <View style={styles.centerContent}>
        <Text style={styles.startText}>¿Vamos comenzar?</Text>
        <PlayButton onPress={() => navigation.navigate('Activity')} />
        <Text style={styles.infoText}>KM caminados: {kmCaminados.toFixed(1)}</Text>
        <Text style={styles.infoText}>
          Descuento obtenido: R$ {descuento.toFixed(2)}
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
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    pendingBadge: {
      position: 'absolute',
      top: 8,
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
      fontSize: 20,
      marginBottom: 16,
      textAlign: 'center',
      color: theme.colors.text,
    },
    infoText: { marginTop: 8, color: theme.colors.text },
  });
