import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';

import type { LocationObjectCoords } from 'expo-location';
import { getAuth } from 'firebase/auth';
import { useUser } from './useUser';
import { log } from '../utils/logger';

export interface TrackData {
  route: LocationObjectCoords[];
  distance: number;
  time: number;
}

const PENDING_KEY = 'TRACKING_PENDING';

const enviarAFirebase = async (data: TrackData): Promise<void> => {
  log('hooks/useGlobalNetwork.ts', 'enviarAFirebase', 'NETWORK', 'Intentando enviar a Firebase...');
  const userId = getAuth().currentUser?.uid;
  if (!userId) throw new Error('Usuario no autenticado');

  const response = await fetch(
    'https://us-central1-prueba1fedentz.cloudfunctions.net/saveActivity',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: new Date().toISOString(),
        distance: data.distance,
        duration: data.time,
      }),
    },
  );

  log(
    'hooks/useGlobalNetwork.ts',
    'enviarAFirebase',
    'NETWORK',
    `Respuesta de servidor: ${response.status}`,
  );
  if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
  log('hooks/useGlobalNetwork.ts', 'enviarAFirebase', 'NETWORK', 'Envío exitoso');
};

export default function useGlobalNetwork() {
  const wasOffline = useRef(false);
  const processing = useRef(false);
  const reintentando = useRef(false);
  const prevType = useRef<NetInfoStateType | 'none' | 'unknown'>('unknown');
  const { authInitialized } = useUser();

  useEffect(() => {
    if (!authInitialized) return;
    // Prueba mínima para verificar NetInfo
    NetInfo.fetch().then((state) =>
      log(
        'hooks/useGlobalNetwork.ts',
        'useGlobalNetwork',
        'NETWORK',
        `Estado inicial: ${state.isConnected ? state.type : 'offline'}`,
      ),
    );

    const sendPending = async () => {
      if (processing.current) return;
      processing.current = true;

      log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'Procesando pendientes...');
      log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'Conexión restablecida: enviando pendientes');

      try {
        const stored = await AsyncStorage.getItem(PENDING_KEY);
        if (!stored) {
          log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'No hay actividades pendientes');
          return;
        }

        let pending: TrackData[] = [];
        try {
          pending = JSON.parse(stored);
        } catch {
          log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'Error al leer datos guardados');
          return;
        }

        // Filtramos datos inválidos
        pending = pending.filter((p) => p.distance > 0);

        log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', `Pendientes encontrados: ${pending.length}`);
        if (pending.length === 0) {
          await AsyncStorage.removeItem(PENDING_KEY);
          processing.current = false;
          log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'No hay pendientes válidos');
          return;
        }

        const remaining: TrackData[] = [];
        for (const item of pending) {
          try {
            log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'Enviando pendiente...');
            await enviarAFirebase(item);
            log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'Envío exitoso');
          } catch (err) {
            log('hooks/useGlobalNetwork.ts', 'sendPending', 'ERROR', 'Error al enviar, se mantendrá en la lista');
            remaining.push(item);
          }
        }

        if (remaining.length === 0) {
          await AsyncStorage.removeItem(PENDING_KEY);
          log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', 'Todos los pendientes fueron enviados');
        } else {
          await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
          log('hooks/useGlobalNetwork.ts', 'sendPending', 'NETWORK', `Quedan ${remaining.length} pendientes por enviar`);
        }
      } catch (err) {
        log('hooks/useGlobalNetwork.ts', 'sendPending', 'ERROR', `Error procesando pendientes: ${err}`);
      } finally {
        processing.current = false;
      }
    };

    const unsubscribe = NetInfo.addEventListener((state) => {
      const type = state.type ?? 'unknown';
      const connected = Boolean(state.isConnected);
      log('hooks/useGlobalNetwork.ts', 'listener', 'NETWORK', `Tipo de conexión: ${connected ? type : 'offline'}`);

      if (!connected) {
        wasOffline.current = true;
        reintentando.current = false;
        log('hooks/useGlobalNetwork.ts', 'listener', 'NETWORK', '🚫 Sin conexión');
      } else {
        if (wasOffline.current) {
          log('hooks/useGlobalNetwork.ts', 'listener', 'NETWORK', 'Conexión restablecida');
          if (!reintentando.current) {
            reintentando.current = true;
            log('hooks/useGlobalNetwork.ts', 'listener', 'NETWORK', 'Conexión restablecida: enviando pendientes');
            sendPending().finally(() => {
              reintentando.current = false;
            });
          }
        } else if (prevType.current !== 'unknown' && prevType.current !== type) {
          const msg =
            type === 'wifi'
              ? '📶 Conectado a Wi-Fi'
              : type === 'cellular'
                ? '📱 Usando datos móviles'
                : 'Tipo de conexión desconocido';
          log('hooks/useGlobalNetwork.ts', 'listener', 'NETWORK', msg);
        }
        wasOffline.current = false;
      }

      prevType.current = connected ? type : 'none';
    });

    return () => unsubscribe();
  }, [authInitialized]);

  return null;
}
