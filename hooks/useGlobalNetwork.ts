import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
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
  const processing = useRef(false);
  const prevType = useRef<NetInfoStateType | 'none' | 'unknown'>('unknown');

  useEffect(() => {
    const processPending = async () => {
      if (processing.current) return;
      processing.current = true;
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

        // Filtramos datos inválidos
        pending = pending.filter(p => p.distance > 0);

        console.log(`Pendientes encontrados: ${pending.length}`);
        if (pending.length === 0) {
          await AsyncStorage.removeItem(PENDING_KEY);
          processing.current = false;
          console.log('No hay pendientes válidos');
          return;
        }

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
      } finally {
        processing.current = false;
      }
    };

    const unsubscribe = NetInfo.addEventListener(state => {
      const type = state.type ?? 'unknown';
      const connected = Boolean(state.isConnected);
      console.log(`📡 Cambio de red: ${connected ? type : 'offline'}`);

      if (!connected) {
        wasOffline.current = true;
        Alert.alert('📴 Sin conexión');
        console.log('🚫 Sin conexión');
      } else {
        if (wasOffline.current) {
          Alert.alert('Se intentarán enviar actividades pendientes');
          processPending();
        } else if (
          prevType.current !== 'unknown' &&
          prevType.current !== type
        ) {
          const msg =
            type === 'wifi'
              ? 'Conectado a Wi-Fi'
              : type === 'cellular'
              ? 'Usando datos móviles'
              : 'Tipo de conexión desconocido';
          Alert.alert(msg);
        }
        wasOffline.current = false;
      }

      prevType.current = connected ? type : 'none';
    });

    return () => unsubscribe();
  }, []);

  return null;
}
