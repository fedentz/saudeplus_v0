import Ionicons from '@expo/vector-icons/Ionicons';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Button,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import { useTheme } from '../context/ThemeContext';
import { log } from '../utils/logger';
import { evaluateActivityStatus } from '../utils/stats';

import useTracking from '../hooks/useTracking';

import { usePendingActivities } from '../context/PendingActivitiesContext';

import ActivityMap from '../components/activity/activityMap';
import ActivityOverlay from '../components/activity/activityOverlay';
import ActivitySummaryModal from '../components/activity/activitySummaryModal';
import { useKilometers } from '../context/KmContext';
import { useTranslation } from 'react-i18next';

export default function Activity() {
  const {
    location,
    route,
    elapsedTime,
    totalDistance,
    startTracking,
    stopTracking,
    formatElapsedTime,
    startTime,
  } = useTracking();

  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<any>();
  const { add, sync } = usePendingActivities();
  const { setKilometers } = useKilometers();
  const [mapReady, setMapReady] = useState(false);
  const [locationReady, setLocationReady] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [activityEnded, setActivityEnded] = useState(false);
  const [activitySummary, setActivitySummary] = useState('');
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const handleSaveAndExit = async () => {
    await handleEndActivity();
    setExitModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const stopActivityWithoutSaving = async () => {
    if (activityEnded) return;
    setActivityEnded(true);
    await stopTracking();
    setExitModalVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleEndActivity = async () => {
    if (activityEnded) return;

    setActivityEnded(true);
    await stopTracking();

    const summary = t('activity.summary', {
      distance: totalDistance.toFixed(2),
      duration: formatElapsedTime(elapsedTime),
    });
    setActivitySummary(summary);
    setSummaryVisible(true);

    if (!startTime) {
      log('screens/Activity.tsx', 'handleEndActivity', 'ACTIVITY', 'No se puede guardar actividad: startTime es null');
      return;
    }
    const end = new Date();
    const net = await NetInfo.fetch();
    const rawConnection =
      net.isConnected && net.isInternetReachable !== false ? net.type || 'unknown' : 'offline';

    const conexion = rawConnection === 'wifi' ? 'wifi' : rawConnection === 'cellular' ? 'datos_moviles' : 'offline';
    const metodoGuardado = conexion === 'offline' ? 'offline_post_sync' : 'online';

    const { status, invalidReason, velocidadPromedio } = evaluateActivityStatus(
      totalDistance,
      elapsedTime,
    );

    add({
      route,
      distance: totalDistance,
      duration: elapsedTime,
      date: end.toISOString(),
      conexion,
      metodoGuardado,
      status,
      invalidReason,
      velocidadPromedio,
      aceleracionPromedio: 0,
    });
    setKilometers((k) => k + totalDistance);

    if (conexion !== 'offline') {
      await sync();
    }

    Vibration.vibrate(500);
  };

  const handleExit = () => {
    setExitModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        handleExit();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => subscription.remove();
    }, [activityEnded, elapsedTime]),
  );

  useEffect(() => {
    let prev = true;
    const checkInitial = async () => {
      const state = await NetInfo.fetch();
      const connected = Boolean(state.isConnected);
      prev = connected;
      log('screens/Activity.tsx', 'checkInitial', 'NETWORK', connected ? 'Conectado' : 'Sin conexión');
      if (connected) {
        sync();
      }
    };
    checkInitial();

    startTracking();

    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (location) {
      setLocationReady(true);
    }
  }, [location]);

  useEffect(() => {
    if (location?.speed !== null && location?.speed !== undefined && location.speed > 6) {
      Alert.alert(
        t('activity.autoStopTitle'),
        t('activity.autoStopMessage'),
        [{ text: 'OK' }],
      );
      stopActivityWithoutSaving();
    }
  }, [location?.speed]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        // @ts-ignore
        MapView?.preloadMapArea?.({
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      } catch (err) {
        log('screens/Activity.tsx', 'preloadMapArea', 'MAP', `preloadMapArea no soportado: ${err}`);
      }
    }
  }, []);

  if (!locationReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme === 'dark' ? '#000' : '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#0099ff" />
        <Text style={{ marginTop: 10, color: theme === 'dark' ? '#eee' : '#333' }}>
          {t('activity.loadingMap')}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <TouchableOpacity
        onPress={handleExit}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 60 : 40,
          left: 16,
          zIndex: 10,
        }}
      >
        <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
      </TouchableOpacity>

      {!mapReady && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5,
          }}
        >
          <ActivityIndicator size="large" color="#0099ff" />
          <Text style={{ color: '#ccc', marginTop: 16 }}>{t('activity.loadingMapGeneric')}</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <ActivityMap
          location={location!}
          route={route}
          mapReady={mapReady}
          setMapReady={setMapReady}
          mapRef={mapRef}
        />

        <ActivityOverlay
          distance={totalDistance}
          timeFormatted={formatElapsedTime(elapsedTime)}
          onEnd={handleEndActivity}
          disabled={activityEnded}
        />
      </View>

      {summaryVisible && (
        <ActivitySummaryModal
          visible={summaryVisible}
          summary={activitySummary}
          onClose={() => setSummaryVisible(false)}
        />
      )}

      <Modal
        transparent
        visible={exitModalVisible}
        animationType="fade"
        onRequestClose={() => setExitModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#fff' : '#000',
                marginBottom: 12,
              }}
            >
              {t('activity.exitTitle')}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme === 'dark' ? '#aaa' : '#333',
              }}
            >
              {t('activity.exitQuestion')}
            </Text>
            <View style={{ marginTop: 24 }}>
              <Button title={t('activity.saveAndExit')} color="#1d3557" onPress={handleSaveAndExit} />
              <Button title={t('activity.cancel')} onPress={() => setExitModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
