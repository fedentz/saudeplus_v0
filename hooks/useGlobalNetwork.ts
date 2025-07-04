import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';

import type { LocationObjectCoords } from 'expo-location';
import { logDebug } from '../utils/logger';

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
  const reintentando = useRef(false);
  const prevType = useRef<NetInfoStateType | 'none' | 'unknown'>('unknown');

  useEffect(() => {
    // Prueba mínima para verificar NetInfo
    NetInfo.fetch().then(state =>
      logDebug(
        `[GLOBAL NETWORK] Estado inicial: ${state.isConnected ? state.type : 'offline'}`
      )
    );

    const sendPending = async () => {
      if (processing.current) return;
      processing.current = true;

      console.log('🔄 Procesando pendientes...');
      logDebug('[GLOBAL NETWORK] Conexión restablecida: enviando pendientes');

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
      console.log('[GLOBAL NETWORK] Tipo de conexión:', connected ? type : 'offline');

      if (!connected) {
        wasOffline.current = true;
        reintentando.current = false;
        Alert.alert('📴 Sin conexión');
        console.log('🚫 Sin conexión');
      } else {
        if (wasOffline.current) {
          Alert.alert('🔄 Conexión restablecida');
          if (!reintentando.current) {
            reintentando.current = true;
            console.log('[GLOBAL NETWORK] Conexión restablecida: enviando pendientes');
            sendPending().finally(() => {
              reintentando.current = false;
            });
          }
        } else if (
          prevType.current !== 'unknown' &&
          prevType.current !== type
        ) {
          const msg =
            type === 'wifi'
              ? '📶 Conectado a Wi-Fi'
              : type === 'cellular'
              ? '📱 Usando datos móviles'
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
