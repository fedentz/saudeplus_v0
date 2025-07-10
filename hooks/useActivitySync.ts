import { useEffect } from 'react';
import { setupActivitySync } from '../services/activityService';
import { useUser } from './useUser';
import { log } from '../utils/logger';

let initialized = false;

export default function useActivitySync() {
  const { authInitialized, user } = useUser();

  useEffect(() => {
    if (!authInitialized || !user) {
      log('hooks/useActivitySync.ts', 'useActivitySync', 'AUTH', 'Esperando autenticación...');
      return;
    }
    if (initialized) return;
    initialized = true;
    setupActivitySync();
    return () => undefined;
  }, [authInitialized, user]);
}
