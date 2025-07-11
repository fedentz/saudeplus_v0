import { useEffect, useRef } from 'react';
import type { LocationObjectCoords } from 'expo-location';

/**
 * Monitors lack of movement (no GPS change or accelerometer movement) and
 * triggers a callback after a period of inactivity.
 */
export default function useInactivityTimeout(
  location: LocationObjectCoords | null,
  activeMovement: boolean,
  onTimeout: () => void,
  timeoutMs = 5 * 60 * 1000,
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosRef = useRef<LocationObjectCoords | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeoutMs);
  };

  useEffect(() => {
    resetTimer();
  }, [activeMovement, location?.latitude, location?.longitude]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!location) return;
    if (
      !lastPosRef.current ||
      lastPosRef.current.latitude !== location.latitude ||
      lastPosRef.current.longitude !== location.longitude
    ) {
      lastPosRef.current = location;
    }
  }, [location]);
}
