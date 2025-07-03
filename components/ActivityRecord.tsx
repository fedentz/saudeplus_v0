import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTheme } from '../context/ThemeContext';
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
  const appTheme = useAppTheme();
  const { theme } = useTheme();
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

  const s = styles(appTheme, theme);

  if (loading || loadingActivities) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#333" />
        <Text style={s.info}>Cargando actividades...</Text>
      </View>
    );
  }

  if (!user) return <Text style={s.info}>No estás logueado</Text>;
  if (error) return <Text style={s.info}>{error}</Text>;
  if (activities.length === 0) return <Text style={s.info}>No hay actividades registradas</Text>;

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={s.item}>
          <Text style={s.title}>{item.name || 'Actividad'}</Text>
          <Text style={s.text}>Duración: {Math.round((item.duration || 0) / 60)} min</Text>
          <Text style={s.text}>
            Fecha{' '}
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

const styles = (appTheme: any, mode: string) =>
  StyleSheet.create({
    info: {
      padding: 20,
      textAlign: 'center',
      fontSize: 16,
      color: appTheme.colors.text,
    },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    item: {
      backgroundColor: mode === 'dark' ? '#1e1e1e' : appTheme.colors.white,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 10,
      borderWidth: mode === 'dark' ? 1 : 0,
      borderColor: '#333',
    },
    title: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
      color: appTheme.colors.text,
    },
    text: { color: appTheme.colors.text },
  });
