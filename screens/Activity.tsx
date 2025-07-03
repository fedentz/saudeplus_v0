import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Vibration, Platform, SafeAreaView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import MapView from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from '@expo/vector-icons/Ionicons';

import useTracking from '../hooks/useTracking';
import { saveActivity } from '../services/activityService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import ActivityMap from '../components/activity/activityMap';
import ActivityOverlay from '../components/activity/activityOverlay';
import ActivitySummaryModal from '../components/activity/activitySummaryModal';

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
  const [mapReady, setMapReady] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [activityEnded, setActivityEnded] = useState(false);
  const [activitySummary, setActivitySummary] = useState('');

const handleEndActivity = async () => {
  if (activityEnded) return;

  setActivityEnded(true);
  await stopTracking();

  const summary = `🟢 Actividad completada\n\n📏 Distancia: ${totalDistance.toFixed(2)} km\n⏱️ Duración: ${formatElapsedTime(elapsedTime)}`;
  setActivitySummary(summary);
  setSummaryVisible(true);
 
  if (!startTime) {
  console.warn('No se puede guardar actividad: startTime es null');
  return;
}
  // Guardar solo si cumple la duración mínima (ya lo maneja internamente)
  await saveActivity(
    elapsedTime,
    totalDistance,
    new Date(startTime) // reconstruye startTime
  );

  Vibration.vibrate(500);
};

const handleExit = () => {
  Alert.alert(
    'Você está em uma atividade',
    'Deseja encerrar ou salvar antes de sair?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salvar e sair',
        onPress: async () => {
          await handleEndActivity();
          navigation.goBack();
        },
      },
      {
        text: 'Encerrar sem salvar',
        onPress: () => {
          stopTracking();
          navigation.goBack();
        },
      },
    ],
  );
};

useFocusEffect(
  useCallback(() => {
    const onBack = () => {
      handleExit();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [activityEnded, elapsedTime])
);


  useEffect(() => {
    const unsubscribeNet = NetInfo.addEventListener(state => {
      const type = state.type ?? 'desconocido';
      const msg = state.isConnected
        ? `📶 Conexión restablecida (${type})`
        : `🚫 Sin conexión (${type})`;
      console.log(msg);
    });

    startTracking();

    return () => {
      stopTracking();
      unsubscribeNet();
    };
  }, []);

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
        console.log('⚠️ preloadMapArea no soportado o falló', err);
      }
    }
  }, []);

  if (!location) return null;

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <TouchableOpacity onPress={handleExit} style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <ActivityMap
          location={location}
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
    </SafeAreaView>
  );
}
