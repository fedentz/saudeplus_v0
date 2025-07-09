import Ionicons from '@expo/vector-icons/Ionicons';
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
import ProgressDisplay from '../components/home/ProgressDisplay';
import { useAppTheme } from '../hooks/useAppTheme';
import { useUser } from '../hooks/useUser';
import {
  getActivitiesByUser,
  getUserActivitiesSummary,
  MonthlySummary,
} from '../services/activityService';

export default function Stats() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const theme = useAppTheme();

  const monthlyGoal = 30;
  const currentMonthKey = format(new Date(), 'MM/yyyy');
  const current = summary.find((s) => s.month === currentMonthKey);
  const currentKm = current ? current.totalDistance : 0;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const data = await getUserActivitiesSummary(user.uid);
        setSummary(data);
      } finally {
        setLoadingSummary(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return;
      try {
        const data = await getActivitiesByUser(user.uid);
        console.log('RAW_ACTIVITIES', data);
        setActivities(data as any[]);
      } finally {
        setLoadingActivities(false);
      }
    };
    loadActivities();
  }, [user]);

  const renderItem = ({ item }: { item: MonthlySummary }) => {
    const [m, y] = item.month.split('/');
    const date = new Date(Number(y), Number(m) - 1, 1);
    const label = format(date, 'MMMM yyyy');

    return (
      <View style={styles.item}>
        <View>
          <Text style={styles.itemMonth}>{label}</Text>
          <Text style={styles.itemInfo}>{item.totalActivities} actividades</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.itemKm}>{item.totalDistance.toFixed(2)} km</Text>
          <Text style={styles.itemInfo}>{Math.round(item.totalTime / 60)} min</Text>
        </View>
      </View>
    );
  };

const renderActivity = ({ item }: { item: any }) => {
  try {
    const activityDate = new Date(item.date);
    const formattedDate = format(activityDate, "eeee d 'de' MMMM yyyy");
    const formattedTime = format(activityDate, 'HH:mm');
    
    return (
      <View style={styles.activityCard}>
        <Text style={styles.activityTitle}>{formattedDate}</Text>
        <Text style={styles.activityInfo}>Hora: {formattedTime} hs</Text>
        <Text style={styles.activityInfo}>Duración: {item.duration} min</Text>
        <Text style={styles.activityInfo}>Distancia: {item.distance?.toFixed(2) || '0'} km</Text>
      </View>
    );
  } catch (error) {
    console.error('Error rendering activity:', error, item);
    return (
      <View style={styles.activityCard}>
        <Text style={styles.activityTitle}>Actividad no válida</Text>
      </View>
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Registro de Actividades</Text>
        <View style={{ width: 24 }} />
      </View>

      {loadingSummary ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.progressWrapper}>
            <ProgressDisplay distance={currentKm} goal={monthlyGoal} />
          </View>

          <FlatList
            data={summary}
            keyExtractor={(item) => item.month}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {loadingActivities ? (
            <ActivityIndicator
              style={{ marginTop: 20 }}
              size="large"
              color={theme.colors.primary}
            />
          ) : (
            <FlatList
              data={activities}
              keyExtractor={(item) => item.id}
              renderItem={renderActivity}
              contentContainerStyle={{ paddingBottom: 60 }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  itemMonth: {
    fontWeight: 'bold',
    color: '#333',
  },
  itemKm: {
    color: '#2196F3',
  },
  itemInfo: {
    fontSize: 12,
    color: '#666',
  },
  progressWrapper: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  activityInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
});
