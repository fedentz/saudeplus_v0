import { useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import * as Location from 'expo-location';
import type { LocationObjectCoords } from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../utils/logger';
import useNetworkListener from './useNetworkListener';

interface TrackData {
  route: LocationObjectCoords[];
  distance: number;
  time: number;
}

const CURRENT_KEY = 'current_activity';
const PENDING_KEY = 'pending_activity';

const enviarAFirebase = async (data: TrackData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  logEvent('UPLOAD', `Datos enviados (${data.distance.toFixed(2)} km)`);
};

export default function useTracking() {
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [route, setRoute] = useState<LocationObjectCoords[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [gpsLost, setGpsLost] = useState(false);
  const { isOffline } = useNetworkListener();

  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const persistIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevOffline = useRef<boolean>(false);

  const toRad = (v: number) => (v * Math.PI) / 180;
  const getDistance = (a: LocationObjectCoords, b: LocationObjectCoords) => {
    const R = 6371;
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);
    const aCalc =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));
    return R * c;
  };

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
      // ignore
    }
  };

  const resetGpsTimer = () => {
    if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
    gpsTimeoutRef.current = setTimeout(() => setGpsLost(true), 10000);
  };

  const addPending = async (data: TrackData) => {
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    const pending: TrackData[] = stored ? JSON.parse(stored) : [];
    pending.push(data);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  };

  const sendPending = async () => {
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    if (!stored) return;
    const pending: TrackData[] = JSON.parse(stored);
    const remaining: TrackData[] = [];
    for (const item of pending) {
      try {
        await enviarAFirebase(item);
      } catch {
        remaining.push(item);
      }
    }
    if (remaining.length === 0) await AsyncStorage.removeItem(PENDING_KEY);
    else await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  };

  useEffect(() => {
    if (isOffline && !prevOffline.current) {
      const data: TrackData = { route, distance: totalDistance, time: elapsedTime };
      addPending(data).catch(() => undefined);
    } else if (!isOffline && prevOffline.current) {
      sendPending().catch(() => undefined);
    }
    prevOffline.current = isOffline;
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
        activityType: Location.ActivityType.Fitness,
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
      if (isOffline) throw new Error('offline');
      await enviarAFirebase(data);
    } catch {
      const stored = await AsyncStorage.getItem(PENDING_KEY);
      const pending = stored ? JSON.parse(stored) : [];
      pending.push(data);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
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
    route,
    location,
    totalDistance,
    elapsedTime,
    formatElapsedTime,
  };
}

