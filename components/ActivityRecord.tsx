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
        setError('Não foi possível carregar as atividades.');
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
        <Text style={s.info}>Carregando atividades...</Text>
      </View>
    );
  }

  if (!user) return <Text style={s.info}>Você não está logado</Text>;
  if (error) return <Text style={s.info}>{error}</Text>;
  if (activities.length === 0) return <Text style={s.info}>Não há atividades registradas</Text>;

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={s.item}>
          <Text style={s.title}>{item.name || 'Atividade'}</Text>
          <Text style={s.text}>Duração: {Math.round((item.duration || 0) / 60)} min</Text>
          <Text style={s.text}>
            Data{' '}
            {item.date?.seconds
              ? new Date(item.date.seconds * 1000).toLocaleString()
              : item.date
              ? new Date(item.date).toLocaleString()
              : 'Sem data'}
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
