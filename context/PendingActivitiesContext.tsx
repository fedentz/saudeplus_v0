import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import NetInfo from '@react-native-community/netinfo';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { LocationObjectCoords } from 'expo-location';
import { logEvent } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PendingActivity {
  distance: number;
  duration: number;
  route: LocationObjectCoords[];
  date: string;
  conexion_al_guardar: string;
}

interface PendingCtx {
  pending: PendingActivity[];
  add(activity: PendingActivity): void;
  sync(): Promise<void>;
  logPending(): void;
  pendingCount: number;
}

const PendingActivityContext = createContext<PendingCtx | undefined>(undefined);
const baseKey = 'PENDING_ACTIVITIES_V2';

const getKey = (uid: string | null | undefined) =>
  uid ? `${baseKey}_${uid}` : baseKey;

const sendToFirebase = async (activity: PendingActivity): Promise<void> => {
  const userId = getAuth().currentUser?.uid;
  if (!userId) throw new Error('no-auth');
  const response = await fetch(
    'https://us-central1-prueba1fedentz.cloudfunctions.net/saveActivity',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        date: activity.date,
        distance: activity.distance,
        duration: activity.duration,
        conexion_al_guardar: activity.conexion_al_guardar,
      }),
    }
  );
  if (!response.ok) throw new Error(`http-${response.status}`);
};

export const PendingActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<PendingActivity[]>([]);
  const wasOffline = useRef(false);

  const keyRef = useRef('');

  const sync = async () => {
    const state = await NetInfo.fetch();
    const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
    if (!online) return;

    const remaining: PendingActivity[] = [];
    for (const act of pending) {
      try {
        await sendToFirebase(act);
        logEvent('ACTIVITY_UPLOADED', act.date);
      } catch {
        logEvent('UPLOAD_FAILED', act.date);
        remaining.push(act);
      }
    }
    setPending(() => {
      AsyncStorage.setItem(keyRef.current, JSON.stringify(remaining)).catch(() => undefined);
      return remaining;
    });
  };

  const add = (activity: PendingActivity) => {
    setPending(prev => {
      const updated = [...prev, activity];
      AsyncStorage.setItem(keyRef.current, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
    logEvent('ACTIVITY_SAVED_LOCALLY', JSON.stringify(activity));
  };

  const logPending = () => {
    console.log(`\uD83D\uDC65 Pendientes: ${pending.length}`);
  };

  useEffect(() => {
    if (keyRef.current) {
      AsyncStorage.setItem(keyRef.current, JSON.stringify(pending)).catch(() => undefined);
    }
  }, [pending]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
      if (online && wasOffline.current) {
        sync();
      }
      wasOffline.current = !online;
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async user => {
      if (user) {
        keyRef.current = getKey(user.uid);
        try {
          const stored = await AsyncStorage.getItem(keyRef.current);
          if (stored) {
            setPending(JSON.parse(stored));
          }
          const state = await NetInfo.fetch();
          const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
          if (online) {
            await sync();
          }
        } catch {
          // ignore parse errors
        }
      } else {
        keyRef.current = '';
        setPending([]);
      }
    });
    return () => unsub();
  }, []);

  return (
    <PendingActivityContext.Provider value={{ pending, add, sync, logPending, pendingCount: pending.length }}>
      {children}
    </PendingActivityContext.Provider>
  );
};

export const usePendingActivities = () => {
  const ctx = useContext(PendingActivityContext);
  if (!ctx) throw new Error('usePendingActivities must be inside provider');
  return ctx;
};

