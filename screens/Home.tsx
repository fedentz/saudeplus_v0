import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../hooks/useAppTheme';
import { usePendingActivities } from '../context/PendingActivitiesContext';
import { useUser } from '../hooks/useUser';
import { getMonthlyProgress } from '../services/walkService';
import MonthlyProgress from '../components/MonthlyProgress';

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
        <Text style={styles.title}>VAMOS COMEÇAR?</Text>
        <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('Activity')}>
          <Ionicons name="play" size={60} color={theme.colors.white} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          pressione o botão para iniciar uma nova atividade física
        </Text>
        {user && (
          <View style={styles.progressWrapper}>
            <MonthlyProgress totalKm={totalKm} goalKm={monthlyGoalKm} />
          </View>
        )}
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
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 24,
    },
    playButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 100,
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 24,
      elevation: 4,
    },
    playIcon: {
      fontSize: 60,
      color: theme.colors.white,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.darkGray,
      textAlign: 'center',
      paddingHorizontal: 20,
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
