import { useEffect } from 'react';
import { setupActivitySync } from '../services/activityService';
import { useUser } from './useUser';

let initialized = false;

export default function useActivitySync() {
  const { authInitialized } = useUser();

  useEffect(() => {
    if (!authInitialized || initialized) return;
    initialized = true;
    setupActivitySync();
    return () => undefined;
  }, [authInitialized]);
}
