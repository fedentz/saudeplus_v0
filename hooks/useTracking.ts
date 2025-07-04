import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import * as Location from 'expo-location';
import type { LocationObjectCoords } from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import useNetworkListener from './useNetworkListener';
import { logEvent } from '../utils/logger';
import { getAuth } from 'firebase/auth';


export interface TrackData {
  route: LocationObjectCoords[];
  distance: number;
  time: number;
}



const CURRENT_KEY = 'TRACKING_CURRENT';
const PENDING_KEY = 'TRACKING_PENDING';

const enviarAFirebase = async (data: TrackData) => {
  console.log('📤 Intentando enviar actividad...', data);
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
    }
  );

  console.log('🔁 Respuesta de servidor:', response.status);
  if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

  logEvent('UPLOAD', `✅ Subido: ${data.distance.toFixed(2)} km`);
};

export default function useTracking() {
  // Obtenemos el estado de red a través de nuestro hook personalizado.
  const { isOffline } = useNetworkListener();

  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [route, setRoute] = useState<LocationObjectCoords[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [gpsLost, setGpsLost] = useState(false);

  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const persistIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const toRad = (v: number) => (v * Math.PI) / 180;
  const getDistance = (a: LocationObjectCoords, b: LocationObjectCoords) => {
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const aCalc =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) *
        Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
    return R * c;
  };

  // Persistencia de la sesión actual en AsyncStorage.
  const persistCurrent = async (extra?: Partial<TrackData>) => {
    const data: TrackData = {
      route,
      distance: totalDistance,
      time: elapsedTime,
      ...extra,
    };
    await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify(data));
  };

  const loadCurrent = async () => {
    const stored = await AsyncStorage.getItem(CURRENT_KEY);
    if (!stored) return;
    try {
      const data: TrackData = JSON.parse(stored);
      if (data.route) setRoute(data.route);
      if (data.distance) setTotalDistance(data.distance);
      if (data.time) setElapsedTime(data.time);
    } catch {
      // Ignoramos posibles errores de parseo.
    }
  };

  // Si no se recibe una posición por 10 s, marcamos que se perdió la señal.
  const resetGpsTimer = () => {
    if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
    gpsTimeoutRef.current = setTimeout(() => setGpsLost(true), 10000);
  };

  // Agrega datos pendientes a la cola en AsyncStorage.
  const addPending = async (data: TrackData) => {
    console.log('\uD83D\uDCE5 Agregando a TRACKING_PENDING...');
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    const pending: TrackData[] = stored ? JSON.parse(stored) : [];
    pending.push(data);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  };

  // Reintenta enviar los datos pendientes al servidor.
const sendPending = async () => {
  console.log('\uD83D\uDD17 Ejecutando sendPending()');
  const stored = await AsyncStorage.getItem(PENDING_KEY);
  if (!stored) {
    console.log('No hay pendientes por enviar');
    return;
  }
  const pending: TrackData[] = JSON.parse(stored);
  const remaining: TrackData[] = [];

  console.log('\uD83D\uDCE6 Enviando actividades pendientes...');
  const userId = getAuth().currentUser?.uid;
  if (!userId) {
    console.log('❌ No hay usuario autenticado, no se pueden subir pendientes');
    return;
  }

  for (const item of pending) {
    try {
      console.log('🚀 Intentando subir actividad:', item);

      const response = await fetch(
        'https://us-central1-prueba1fedentz.cloudfunctions.net/saveActivity',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            date: new Date().toISOString(),
            distance: item.distance,
            duration: item.time,
          }),
        }
      );

      console.log('🔁 Respuesta de servidor:', response.status);
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      logEvent('UPLOAD', `✅ Subido: ${item.distance.toFixed(2)} km`);
    } catch (e) {
      console.error('❌ Error al subir actividad:', e);
      remaining.push(item);
    }
  }

  console.log('📦 Actividades restantes sin subir:', remaining.length);

  if (remaining.length === 0) {
    await AsyncStorage.removeItem(PENDING_KEY);
  } else {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  }
  console.log('\u2705 Finaliza sendPending. Restantes:', remaining.length);
};


  // Cuando cambia la conectividad intentamos guardar o subir pendientes
  useEffect(() => {
    if (isOffline) {
      const data: TrackData = {
        route,
        distance: totalDistance,
        time: elapsedTime,
      };
      console.log('📥 Guardando pendiente por estar offline');
      addPending(data).catch(() => undefined);
    } else {
      console.log('🌐 Online: intentando subir pendientes...');
      sendPending().catch(() => undefined);
    }
  }, [isOffline]);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se concedió acceso a la ubicación');
      return;
    }

    await loadCurrent();
    setGpsLost(false);
    const now = Date.now();
    startTimeRef.current = now;
    setElapsedTime(0);

    watcherRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 1000,
      },
      async loc => {
        const coords = loc.coords;
        if (coords.accuracy && coords.accuracy > 25) return;
        resetGpsTimer();
        setGpsLost(false);
        setLocation(coords);
        setRoute(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = getDistance(last, coords);
            if (dist < 0.03) return prev;
            setTotalDistance(d => d + dist);
            const newRoute = [...prev, coords];
            persistCurrent({ route: newRoute });
            return newRoute;
          }
          persistCurrent({ route: [coords] });
          return [coords];
        });
      },
    );

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(secs);
      persistCurrent({ time: secs, distance: totalDistance });
    }, 1000);

    persistIntervalRef.current = setInterval(() => {
      persistCurrent();
    }, 10000);

    resetGpsTimer();
  };

  const stopTracking = async () => {
    if (watcherRef.current) {
      await watcherRef.current.remove();
      watcherRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (persistIntervalRef.current) {
      clearInterval(persistIntervalRef.current);
      persistIntervalRef.current = null;
    }
    if (gpsTimeoutRef.current) {
      clearTimeout(gpsTimeoutRef.current);
      gpsTimeoutRef.current = null;
    }

    const data: TrackData = {
      route,
      distance: totalDistance,
      time: elapsedTime,
    };
    await AsyncStorage.removeItem(CURRENT_KEY);

    try {
      const state = await NetInfo.fetch();
      const offlineNow = !state.isConnected || state.isInternetReachable === false;
      if (offlineNow) throw new Error('offline');
      await enviarAFirebase(data);
    } catch {
      // Si falla el envío (o estamos offline), agregamos el dato a la cola.
      const stored = await AsyncStorage.getItem(PENDING_KEY);
      const pending: TrackData[] = stored ? JSON.parse(stored) : [];
      pending.push(data);
      console.log('\uD83D\uDCE5 Agregando a TRACKING_PENDING...');
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && startTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    });
    return () => {
      stopTracking();
      sub.remove();
    };
  }, []);

  return {
    gpsLost,
    isOffline,
    startTracking,
    stopTracking,
    forceSendPending: sendPending,
    logPending: async () => {
      const stored = await AsyncStorage.getItem(PENDING_KEY);
      console.log('📂 Contenido de TRACKING_PENDING:', stored);
    },
    route,
    location,
    totalDistance,
    elapsedTime,
    formatElapsedTime,
    startTime: startTimeRef.current,
  };
}
