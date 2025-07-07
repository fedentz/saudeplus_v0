import { useEffect } from 'react';
import { setupActivitySync } from '../services/activityService';

let initialized = false;

export default function useActivitySync() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;
    setupActivitySync();
    return () => undefined;
  }, []);
}
