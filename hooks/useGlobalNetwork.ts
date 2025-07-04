import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { LocationObjectCoords } from 'expo-location';

export interface TrackData {
  route: LocationObjectCoords[];
  distance: number;
  time: number;
}

const PENDING_KEY = 'TRACKING_PENDING';

const enviarAFirebase = async (data: TrackData): Promise<void> => {
  // Simula el retraso de una subida real a Firebase
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('📡 Datos enviados a Firebase', data);
};

export default function useGlobalNetwork() {
  const wasOffline = useRef(false);

  useEffect(() => {
    const processPending = async () => {
      Alert.alert('Se intentarán enviar actividades pendientes');
      console.log('🔄 Procesando pendientes...');

      try {
        const stored = await AsyncStorage.getItem(PENDING_KEY);
        if (!stored) {
          console.log('No hay actividades pendientes');
          return;
        }

        let pending: TrackData[] = [];
        try {
          pending = JSON.parse(stored);
        } catch {
          console.log('Error al leer datos guardados');
          return;
        }

        console.log(`Pendientes encontrados: ${pending.length}`);
        const remaining: TrackData[] = [];
        for (const item of pending) {
          try {
            console.log('Enviando pendiente...');
            await enviarAFirebase(item);
            console.log('Envío exitoso');
          } catch (err) {
            console.log('Error al enviar, se mantendrá en la lista');
            remaining.push(item);
          }
        }

        if (remaining.length === 0) {
          await AsyncStorage.removeItem(PENDING_KEY);
          console.log('Todos los pendientes fueron enviados');
        } else {
          await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
          console.log(`Quedan ${remaining.length} pendientes por enviar`);
        }
      } catch (err) {
        console.log('Error procesando pendientes', err);
      }
    };

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = Boolean(state.isConnected);
      if (connected && wasOffline.current) {
        wasOffline.current = false;
        processPending();
      } else if (!connected) {
        console.log('🚫 Sin conexión');
        wasOffline.current = true;
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
