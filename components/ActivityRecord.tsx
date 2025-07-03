import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useUser } from '../hooks/useUser';
import { getActivitiesByUser } from '../services/activityService';

type Activity = {
  id: string;
  name?: string;
  duration?: number;
  date?: any;
};

export default function Stats() {
  const { user, loading } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const data = await getActivitiesByUser(user.uid);
        setActivities(data as Activity[]);
      } catch (err: any) {
        console.error('❌ Error al traer actividades:', err);
        setError('No se pudieron cargar las actividades.');
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [user]);

  if (loading || loadingActivities) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={styles.info}>Cargando actividades...</Text>
      </View>
    );
  }

  if (!user) return <Text style={styles.info}>No estás logueado</Text>;
  if (error) return <Text style={styles.info}>{error}</Text>;
  if (activities.length === 0) return <Text style={styles.info}>No hay actividades registradas</Text>;

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.name || 'Actividad'}</Text>
          <Text>Duración: {Math.round((item.duration || 0) / 60)} min</Text>
          <Text>
            Fecha:{' '}
            {item.date?.seconds
              ? new Date(item.date.seconds * 1000).toLocaleString()
              : item.date
              ? new Date(item.date).toLocaleString()
              : 'Sin fecha'}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  info: {
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
});
