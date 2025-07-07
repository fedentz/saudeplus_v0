import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { getUserActivitiesSummary, MonthlySummary } from '../services/activityService';
import ProgressDisplay from '../components/home/ProgressDisplay';
import { useUser } from '../hooks/useUser';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

export default function Stats() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const theme = useAppTheme();
  const monthlyGoal = 30;
  const currentMonthKey = format(new Date(), 'MM/yyyy');
  const current = summary.find((s) => s.month === currentMonthKey);
  const currentKm = current ? current.totalDistance : 0;
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.gray,
    },
    itemMonth: { color: theme.colors.text, fontWeight: 'bold' },
    itemKm: { color: theme.colors.primary },
    itemInfo: { color: theme.colors.text, fontSize: 12 },
    progressWrapper: { paddingHorizontal: 16, marginBottom: 20 },
  });
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

  const renderItem = ({ item }: { item: MonthlySummary }) => {
    const [m, y] = item.month.split('/');
    const date = new Date(Number(y), Number(m) - 1, 1);
    const label = format(date, 'MMMM yyyy', { locale: es });
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Registro de Atividades</Text>
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
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </>
      )}
    </SafeAreaView>
  );
}
