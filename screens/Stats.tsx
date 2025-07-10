import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

export default function Stats() {
  const navigation = useNavigation<any>();
  const { user, authInitialized } = useUser();
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const theme = useAppTheme();
  const showBackButton = navigation.canGoBack();

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

    const formattedDate = format(
      activityDate,
      "eeee d 'de' MMMM 'de' yyyy",
    );
    const formattedTime = format(activityDate, 'HH:mm');

    const durationMin = Math.floor(item.duration / 60);
    const durationSec = item.duration % 60;
    const distance = item.distance ? item.distance.toFixed(2) : '0.00';

    let statusText = 'pendente';
    let statusColor = '#e67e22';
    if (item.status === 'valida') {
      statusText = 'válida';
      statusColor = '#2ecc71';
    } else if (item.status === 'invalida') {
      statusText = 'inválida';
      statusColor = '#e74c3c';
    }

    return (
      <View style={styles.activityCard}>
        <Text style={styles.activityTitle}>📆 {formattedDate}</Text>
        <Text style={styles.activityInfo}>🕒 {formattedTime}</Text>
        <Text style={styles.activityInfo}>
          ⏱️ {durationMin} min {durationSec} seg
        </Text>
        <Text style={styles.activityInfo}>📏 {distance} km</Text>
        <Text style={[styles.activityInfo, { color: statusColor }]}>✅ {statusText}</Text>
      </View>
    );
  } catch (error) {
    log('screens/Stats.tsx', 'renderActivity', 'ERROR', `Error rendering activity: ${error}`);
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
        {showBackButton ? (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={styles.title}>Registro de Actividades</Text>
        <View style={{ width: 24 }} />
      </View>

      {loadingActivities || !authInitialized ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={renderActivity}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
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
