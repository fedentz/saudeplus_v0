import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useAppTheme } from '../hooks/useAppTheme';
import { usePendingActivities } from '../context/PendingActivitiesContext';
import { useUser } from '../hooks/useUser';
import { getMonthlyProgress } from '../services/walkService';
import HeaderInfo from '../components/home/HeaderInfo';
import PlayButton from '../components/home/PlayButton';
import ProgressDisplay from '../components/home/ProgressDisplay';
import TipMessage from '../components/home/TipMessage';

export default function Home({ navigation }: any) {
  const theme = useAppTheme();
  const { sync, logPending, pendingCount } = usePendingActivities();
  const { user } = useUser();
  const [totalKm, setTotalKm] = useState(0);
  const monthlyGoalKm = 20;
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

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;
      try {
        const res = await getMonthlyProgress(user.uid, monthlyGoalKm);
        setTotalKm(res.totalKm);
      } catch {
        // ignore errors for now
      }
    };
    loadProgress();
  }, [user]);
  return (
    <SafeAreaView style={styles.container}>
      {pendingCount > 0 && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{pendingCount}</Text>
        </View>
      )}
      <View style={styles.centerContent}>
        <HeaderInfo date={new Date()} />
        <PlayButton onPress={() => navigation.navigate('Activity')} />
        {user && (
          <View style={styles.progressWrapper}>
            <ProgressDisplay distance={totalKm} goal={monthlyGoalKm} />
          </View>
        )}
        <TipMessage text="¡Sigue moviéndote cada día!" />
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
    progressWrapper: {
      marginTop: 40,
      alignItems: 'center',
    },
  });
