import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Button } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { LocationObjectCoords } from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../utils/logger';

export interface PendingActivity {
  id: string;
  distance: number;
  duration: number;
  route: LocationObjectCoords[];
  date: string;
  conexion: 'wifi' | 'datos_moviles' | 'offline';
  metodoGuardado: 'online' | 'offline_post_sync';
  status: 'pendiente' | 'valida' | 'invalida';
  invalidReason?: 'vehiculo' | 'no_es_usuario';
  velocidadPromedio: number;
}

export type PendingActivityInput = Omit<PendingActivity, 'id'>;

interface PendingCtx {
  pending: PendingActivity[];
  add(activity: PendingActivityInput): void;
  sync(): Promise<void>;
  logPending(): void;
  pendingCount: number;
  askSync: boolean;
  confirmSync(): void;
  dismissSync(): void;
}

const PendingActivityContext = createContext<PendingCtx | undefined>(undefined);
const baseKey = 'PENDING_ACTIVITIES_V3';
const uploadedBaseKey = 'UPLOADED_ACTIVITIES_V1';

const getKey = (uid: string | null | undefined) => (uid ? `${baseKey}_${uid}` : baseKey);
const getUploadedKey = (uid: string | null | undefined) =>
  uid ? `${uploadedBaseKey}_${uid}` : uploadedBaseKey;

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
        conexion: activity.conexion,
        metodoGuardado: activity.metodoGuardado,
        status: activity.status,
        invalidReason: activity.invalidReason,
        velocidadPromedio: activity.velocidadPromedio,
        id: activity.id,
      }),
    },
  );
  if (!response.ok) throw new Error(`http-${response.status}`);
};

export const PendingActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pending, setPending] = useState<PendingActivity[]>([]);
  const [askSync, setAskSync] = useState(false);
  const wasOffline = useRef(false);

  const keyRef = useRef('');
  const uploadedKeyRef = useRef('');
  const uploadedRef = useRef<string[]>([]);

  const sync = async () => {
    const state = await NetInfo.fetch();
    const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
    if (!online) return;

    const remaining: PendingActivity[] = [];
    for (const act of pending) {
      if (uploadedRef.current.includes(act.id)) continue;
      try {
        await sendToFirebase(act);
        uploadedRef.current.push(act.id);
        AsyncStorage.setItem(uploadedKeyRef.current, JSON.stringify(uploadedRef.current)).catch(
          () => undefined,
        );
        logEvent('ACTIVITY_UPLOADED', act.id);
      } catch {
        logEvent('UPLOAD_FAILED', act.id);
        remaining.push(act);
      }
    }
    setPending(() => {
      AsyncStorage.setItem(keyRef.current, JSON.stringify(remaining)).catch(() => undefined);
      return remaining;
    });
  };

  const add = (activity: PendingActivityInput) => {
    const withId: PendingActivity = { ...activity, id: generateId() };
    setPending((prev) => {
      const updated = [...prev, withId];
      AsyncStorage.setItem(keyRef.current, JSON.stringify(updated)).catch(() => undefined);
      return updated;
    });
    logEvent('ACTIVITY_SAVED_LOCALLY', JSON.stringify(withId));
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
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
      if (online && wasOffline.current && pending.length > 0 && !askSync) {
        setAskSync(true);
      }
      wasOffline.current = !online;
    });
    return () => unsubscribe();
  }, [pending, askSync]);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        keyRef.current = getKey(user.uid);
        uploadedKeyRef.current = getUploadedKey(user.uid);
        try {
          const stored = await AsyncStorage.getItem(keyRef.current);
          if (stored) {
            setPending(JSON.parse(stored));
          }
          const uploaded = await AsyncStorage.getItem(uploadedKeyRef.current);
          if (uploaded) {
            uploadedRef.current = JSON.parse(uploaded);
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
        uploadedKeyRef.current = '';
        setPending([]);
        uploadedRef.current = [];
      }
    });
    return () => unsub();
  }, []);

  const confirmSync = async () => {
    setAskSync(false);
    await sync();
  };

  const dismissSync = () => setAskSync(false);

  return (
    <PendingActivityContext.Provider
      value={{
        pending,
        add,
        sync,
        logPending,
        pendingCount: pending.length,
        askSync,
        confirmSync,
        dismissSync,
      }}
    >
      {children}
      <Modal transparent visible={askSync} animationType="fade" onRequestClose={dismissSync}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 12,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 16, textAlign: 'center' }}>
              Quedaron actividades pendientes de guardar, ¿desea guardarlas?
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Button title="Sí" onPress={confirmSync} />
              <View style={{ width: 16 }} />
              <Button title="No" onPress={dismissSync} />
            </View>
          </View>
        </View>
      </Modal>
    </PendingActivityContext.Provider>
  );
};

export const usePendingActivities = () => {
  const ctx = useContext(PendingActivityContext);
  if (!ctx) throw new Error('usePendingActivities must be inside provider');
  return ctx;
};
