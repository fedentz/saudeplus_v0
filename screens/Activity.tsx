import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Vibration,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  BackHandler,
  Modal,
  Text,
  Button,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MapView from 'react-native-maps';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

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
  const [locationReady, setLocationReady] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [activityEnded, setActivityEnded] = useState(false);
  const [activitySummary, setActivitySummary] = useState('');
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const { theme } = useTheme();

  const handleSaveAndExit = async () => {
    await handleEndActivity();
    setExitModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

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
    if (location) {
      setLocationReady(true);
    }
  }, [location]);

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
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text
          style={{ marginTop: 10, color: theme === 'dark' ? '#eee' : '#333' }}
        >
          Carregando mapa...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000' : '#fff' }}
    >
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
        <Ionicons
          name="arrow-back"
          size={24}
          color={theme === 'dark' ? '#fff' : '#000'}
        />
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
          <ActivityIndicator size="large" color="#00AEEF" />
          <Text style={{ color: '#ccc', marginTop: 16 }}>Carregando o mapa...</Text>
        </View>
      )}
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
              Você está em uma atividade
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme === 'dark' ? '#aaa' : '#333',
              }}
            >
              Deseja encerrar ou salvar antes de sair?
            </Text>
            <View style={{ marginTop: 24 }}>
              <Button
                title="Salvar e sair"
                color="#1d3557"
                onPress={handleSaveAndExit}
              />
              <Button
                title="Cancelar"
                onPress={() => setExitModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
