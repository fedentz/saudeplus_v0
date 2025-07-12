import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/useUser';
import { findUserByEmail, isCurrentUserAdmin } from '../services/userService';
import { getUserActivitiesSummary, MonthlySummary } from '../services/activityService';

export default function AdminPanel() {
  const navigation = useNavigation<any>();
  const { user } = useUser();
  const theme = useAppTheme();
  const { t } = useTranslation();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);

  useEffect(() => {
    const verifyRole = async () => {
      if (user) {
        try {
          const admin = await isCurrentUserAdmin();
          setIsAdmin(admin);
          if (!admin) {
            console.log('AdminPanel: acceso denegado, redirigiendo a Home');
            navigation.replace('MainTabs');
          }
        } catch (err) {
          console.log('AdminPanel: error verificando custom claims', err);
          navigation.replace('MainTabs');
        }
      }
    };
    verifyRole();
  }, [user]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleSearch = async () => {
    if (!query) return Alert.alert(t('admin.panel'), t('admin.emailRequired'));
    try {
      setLoading(true);
      const found = await findUserByEmail(query);
      if (!found) {
        Alert.alert(t('admin.userNotFound'));
        setSummary([]);
        return;
      }
      const data = await getUserActivitiesSummary(found.id);
      setSummary(data);
    } catch (e) {
      Alert.alert(t('admin.searchError'));
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isAdmin === false) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('admin.restricted')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.background,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>
          {t('admin.panel')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ padding: 20 }}>
        <TextInput
          placeholder={t('admin.searchPlaceholder')}
          placeholderTextColor={theme.colors.darkGray}
          value={query}
          onChangeText={setQuery}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.gray,
            borderRadius: 6,
            padding: 10,
            marginBottom: 10,
            backgroundColor: theme.colors.white,
            color: theme.colors.text,
          }}
        />
        <TouchableOpacity
          onPress={handleSearch}
          style={{ backgroundColor: theme.colors.primary, padding: 12, borderRadius: 6 }}
        >
          <Text style={{ color: theme.colors.white, textAlign: 'center' }}>
            {t('admin.search')}
          </Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={summary}
          keyExtractor={(item) => item.month}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderColor: theme.colors.gray,
              }}
            >
              <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{item.month}</Text>
              <Text style={{ color: theme.colors.text }}>
                {t('admin.activities', { count: item.totalActivities })}
              </Text>
              <Text style={{ color: theme.colors.text }}>
                {t('admin.distance', { distance: item.totalDistance })}
              </Text>
              <Text style={{ color: theme.colors.text }}>
                {t('admin.time', { time: formatTime(item.totalTime) })}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
