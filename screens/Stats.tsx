import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUser } from '../hooks/useUser';
import { getActivitiesByUser } from '../services/activityService';
import { log } from '../utils/logger';
import { useTranslation } from 'react-i18next';

export default function Stats() {
  const { user, authInitialized } = useUser();
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const theme = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  useEffect(() => {
    if (!authInitialized) return;
    const loadActivities = async () => {
      if (!user) {
        setActivities([]);
        setLoadingActivities(false);
        return;
      }
      try {
        const data = await getActivitiesByUser(user.uid);
        setActivities(data as any[]);
      } finally {
        setLoadingActivities(false);
      }
    };
    setLoadingActivities(true);
    loadActivities();
  }, [user, authInitialized]);

  const renderActivity = ({ item }: { item: any }) => {
    try {
      const activityDate =
        item.date?.seconds && typeof item.date.seconds === 'number'
          ? new Date(item.date.seconds * 1000)
          : new Date(item.date);

      const weekday = new Intl.DateTimeFormat('pt', { weekday: 'long' }).format(activityDate);
      const month = new Intl.DateTimeFormat('pt', { month: 'long' }).format(activityDate);
      const day = activityDate.getDate();
      const year = activityDate.getFullYear();
      const formattedDate = t('activity.date', {
        day: weekday,
        date: day,
        month,
        year,
      });
      const formattedTime = format(activityDate, 'HH:mm');

      const durationMin = Math.floor(item.duration / 60);
      const durationSec = item.duration % 60;
      const distance = item.distance ? item.distance.toFixed(2) : '0.00';

      let statusText = t('activity.status.pending');
      let statusColor = '#e67e22';
      if (item.status === 'valida') {
        statusText = t('activity.status.valid');
        statusColor = '#2ecc71';
      } else if (item.status === 'invalida') {
        statusText = t('activity.status.invalid');
        statusColor = '#e74c3c';
      }

      return (
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>📆 {formattedDate}</Text>
          <Text style={styles.activityInfo}>🕒 {formattedTime}</Text>
          <Text style={styles.activityInfo}>
            ⏱️ {t('activity.duration', { minutes: durationMin, seconds: durationSec })}
          </Text>
          <Text style={styles.activityInfo}>📏 {t('activity.distance', { distance })}</Text>
          <Text style={[styles.activityInfo, { color: statusColor }]}>
            {item.status === 'valida'
              ? '✅'
              : item.status === 'invalida'
              ? '❌'
              : '⏳'}{' '}
            {statusText}
          </Text>

        </View>
      );
    } catch (error) {
      log('screens/Stats.tsx', 'renderActivity', 'ERROR', `Error rendering activity: ${error}`);
      return (
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle}>{t('stats.invalidActivity')}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('activity.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loadingActivities || !authInitialized ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderActivity}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.colors.background,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    listContent: {
      paddingBottom: 60,
      backgroundColor: theme.colors.background,
    },
    activityCard: {
      backgroundColor:
        theme.colors.cardBackground || (theme.colors.background === '#121212' ? '#1e1e1e' : '#fff'),
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      elevation: 1,
      shadowColor: theme.colors.shadow || '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 6,
      color: theme.colors.text,
    },
    activityInfo: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 2,
      opacity: 0.9,
    },
  });
