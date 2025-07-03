import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import type { LocationObjectCoords } from 'expo-location';
import { logEvent } from '../utils/logger';

export default function useTracking() {
  const [location, setLocation] = useState<LocationObjectCoords | null>(null);
  const [route, setRoute] = useState<LocationObjectCoords[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const toRad = (value: number) => (value * Math.PI) / 180;

  const getDistance = (a: LocationObjectCoords, b: LocationObjectCoords) => {
    const R = 6371; // Radio de la Tierra en km
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

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      logEvent('GPS', 'Permiso de ubicación denegado');
      return;
    }

    const now = Date.now();
    setStartTime(now);
    startTimeRef.current = now;
    setElapsedTime(0);
    setRoute([]);
    setTotalDistance(0);
    logEvent('ACTIVITY', 'Inicio de actividad');
    watcherRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 1000,
        // Configura el modo de actividad para optimizar seguimientos en vehículo
        activityType: Location.ActivityType.AutomotiveNavigation,
      },
      (loc) => {
        const coords = loc.coords;

        // ✅ 1. Ignorar si la precisión es mala (> 25 metros)
        if (coords.accuracy && coords.accuracy > 25) {
          logEvent('GPS', `Punto descartado por precisión: ${coords.accuracy}`);
          return;
        }

        setLocation(coords);

        setRoute((prevRoute) => {
          if (prevRoute.length > 0) {
            const last = prevRoute[prevRoute.length - 1];
            const dist = getDistance(last, coords);

            // ✅ 2. Ignorar si el movimiento es muy pequeño (< 30 metros)
            if (dist > 0.03) {
              setTotalDistance((prev) => prev + dist);
              logEvent('GPS', `Movimiento registrado: ${dist.toFixed(3)} km`);
              return [...prevRoute, coords];
            }

            logEvent('GPS', `Movimiento descartado (<30m): ${dist}`);
            return prevRoute;
          }

          // Primer punto
          return [coords];
        });
      }
    );



    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTracking = async () => {
    if (watcherRef.current) {
      await watcherRef.current.remove();
      watcherRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    logEvent('ACTIVITY', 'Seguimiento detenido');
  };

  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      logEvent('APPSTATE', `Cambio a ${state}`);
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
    location,
    route,
    elapsedTime,
    totalDistance,
    startTracking,
    stopTracking,
    formatElapsedTime,
    startTime,
  };
}
