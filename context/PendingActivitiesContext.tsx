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

  const payload = {
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
  };

  console.log(`🚀 Subiendo actividad: ${activity.id} para usuario ${userId} →`, payload);

  const response = await fetch(
    'https://us-central1-prueba1fedentz.cloudfunctions.net/saveActivity',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
  console.log('🔄 [SYNC] Iniciando sincronización de actividades...');

  const state = await NetInfo.fetch();
  const online = Boolean(state.isConnected) && state.isInternetReachable !== false;

  if (!online) {
    console.log('🚫 [SYNC] No hay conexión, abortando sincronización');
    return;
  }

  console.log(`✅ [SYNC] Conectado a internet, tipo: ${state.type}`);
  console.log(`📦 [SYNC] Actividades pendientes: ${pending.length}`);

  const remaining: PendingActivity[] = [];

  for (const act of pending) {
    if (uploadedRef.current.includes(act.id)) {
      console.log(`⏩ [SYNC] Actividad ${act.id} ya fue subida, la salto`);
      continue;
    }

    try {
      console.log(`🚀 [SYNC] Subiendo actividad ${act.id}...`);
      await sendToFirebase(act);
      console.log(`✅ [SYNC] Actividad ${act.id} subida correctamente`);

      uploadedRef.current.push(act.id);
      await AsyncStorage.setItem(uploadedKeyRef.current, JSON.stringify(uploadedRef.current));
      logEvent('ACTIVITY_UPLOADED', act.id);
    } catch (error) {
      console.log(`❌ [SYNC] Falló la subida de ${act.id}:`, error);
      logEvent('UPLOAD_FAILED', act.id);
      remaining.push(act);
    }
  }

  setPending(() => {
    AsyncStorage.setItem(keyRef.current, JSON.stringify(remaining)).catch(() => undefined);
    return remaining;
  });

  console.log('✅ [SYNC] Sincronización finalizada');
};


  const add = (activity: PendingActivityInput) => {
  const userId = getAuth().currentUser?.uid;
  if (!userId || !keyRef.current) {
    console.error("🚨 [PENDING] No se puede agregar actividad: usuario no autenticado o key vacía");
    return;
  }

  const withId: PendingActivity = {
    ...activity,
    id: generateId(),
  };

  console.log('➕ [PENDING] Agregando actividad local:', withId);

  setPending((prev) => {
    const updated = [...prev, withId];
    AsyncStorage.setItem(keyRef.current!, JSON.stringify(updated))
      .then(() => console.log("💾 [PENDING] Actividad guardada en AsyncStorage"))
      .catch((e) => console.error("❌ [PENDING] Error guardando en AsyncStorage", e));
    return updated;
  });

  logEvent('ACTIVITY_SAVED_LOCALLY', JSON.stringify(withId));

  setTimeout(async () => {
  const stored = await AsyncStorage.getItem(keyRef.current!);
  const parsed = stored ? JSON.parse(stored) : [];
  console.log("🔁 [PENDING] Releyendo desde AsyncStorage:", parsed.length);
  setPending(parsed);
}, 500);

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
        console.log('👤 [AUTH] Usuario autenticado:', user.uid);
        keyRef.current = getKey(user.uid);
        uploadedKeyRef.current = getUploadedKey(user.uid);
        try {
          const stored = await AsyncStorage.getItem(keyRef.current);
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log('📥 [AUTH] Cargando actividades previas:', parsed.length);
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
        console.log('🚫 [AUTH] Usuario deslogueado');
        keyRef.current = '';
        uploadedKeyRef.current = '';
        setPending([]);
        uploadedRef.current = [];
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    console.log('📥 [PENDING] Estado actualizado:', pending.length);
  }, [pending]);


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
