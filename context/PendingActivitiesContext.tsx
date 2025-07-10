import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Button } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useUser } from '../hooks/useUser';
import type { LocationObjectCoords } from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/logger';

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
  aceleracionPromedio: number;
}

export type PendingActivityInput = Omit<PendingActivity, 'id'>;

interface PendingCtx {
  pending: PendingActivity[];
  add(activity: PendingActivityInput): Promise<void>;
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
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('no-auth');

  // Solo enviar los campos requeridos, excluyendo `route`
  const {
    id,
    date,
    distance,
    duration,
    status,
    invalidReason,
    metodoGuardado,
    velocidadPromedio,
    conexion,
    aceleracionPromedio,
  } = activity;

  const payload = {
    id,
    userId,
    date,
    distance,
    duration,
    status,
    invalidReason,
    metodoGuardado,
    velocidadPromedio,
    conexion,
    aceleracionPromedio,
  };

  log(
    'context/PendingActivitiesContext.tsx',
    'sendToFirebase',
    'UPLOAD',
    `Subiendo actividad ${id} para usuario ${userId}: ${JSON.stringify(payload)}`,
  );

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
  const { authInitialized } = useUser();
  const authInitRef = useRef(authInitialized);
  useEffect(() => {
    authInitRef.current = authInitialized;
  }, [authInitialized]);

  const keyRef = useRef('');
  const uploadedKeyRef = useRef('');
  const uploadedRef = useRef<string[]>([]);
  const pendingRef = useRef<PendingActivity[]>([]);
  const isSyncingRef = useRef(false);

  const sync = async () => {
    if (isSyncingRef.current) {
      log(
        'context/PendingActivitiesContext.tsx',
        'sync',
        'SYNC',
        'Ya se está ejecutando una sincronización',
      );
      return;
    }
    isSyncingRef.current = true;
    try {
      log(
        'context/PendingActivitiesContext.tsx',
        'sync',
        'SYNC',
        'Iniciando sincronización de actividades...',
      );

      const state = await NetInfo.fetch();
      const online = Boolean(state.isConnected) && state.isInternetReachable !== false;

      if (!online) {
        log(
          'context/PendingActivitiesContext.tsx',
          'sync',
          'SYNC',
          'No hay conexión, abortando sincronización',
        );
        return;
      }

      const userId = auth.currentUser?.uid;
      if (!userId) {
        log(
          'context/PendingActivitiesContext.tsx',
          'sync',
          'SYNC',
          'Usuario no autenticado, abortando sincronización',
        );
        return;
      }

      log(
        'context/PendingActivitiesContext.tsx',
        'sync',
        'SYNC',
        `Conectado a internet, tipo: ${state.type}`,
      );
      log(
        'context/PendingActivitiesContext.tsx',
        'sync',
        'SYNC',
        `Actividades pendientes: ${pendingRef.current.length}`,
      );

      const remaining: PendingActivity[] = [];

      const currentPending = pendingRef.current.slice();
      for (const act of currentPending) {
        if (uploadedRef.current.includes(act.id)) {
          log(
            'context/PendingActivitiesContext.tsx',
            'sync',
            'SYNC',
            `Actividad ${act.id} ya fue subida, la salto`,
          );
          continue;
        }

        try {
          log(
            'context/PendingActivitiesContext.tsx',
            'sync',
            'SYNC',
            `Subiendo actividad ${act.id}...`,
          );
          await sendToFirebase(act);
          log(
            'context/PendingActivitiesContext.tsx',
            'sync',
            'SYNC',
            `Actividad ${act.id} subida correctamente`,
          );

          uploadedRef.current.push(act.id);
          await AsyncStorage.setItem(uploadedKeyRef.current, JSON.stringify(uploadedRef.current));
          log('context/PendingActivitiesContext.tsx', 'sync', 'ACTIVITY_UPLOADED', act.id);
        } catch (error) {
          log(
            'context/PendingActivitiesContext.tsx',
            'sync',
            'ERROR',
            `Falló la subida de ${act.id}: ${error}`,
          );
          log('context/PendingActivitiesContext.tsx', 'sync', 'UPLOAD_FAILED', act.id);
          remaining.push(act);
        }
      }

      pendingRef.current = remaining;
      setPending(remaining);
      await AsyncStorage.setItem(keyRef.current, JSON.stringify(remaining)).catch(() => undefined);

      log('context/PendingActivitiesContext.tsx', 'sync', 'SYNC', 'Sincronización finalizada');
    } finally {
      isSyncingRef.current = false;
    }
  };

  const add = async (activity: PendingActivityInput) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !keyRef.current) {
      log(
        'context/PendingActivitiesContext.tsx',
        'add',
        'ERROR',
        'No se puede agregar actividad: usuario no autenticado o key vacía',
      );
      return;
    }

    const withId: PendingActivity = {
      ...activity,
      id: generateId(),
    };

    log(
      'context/PendingActivitiesContext.tsx',
      'add',
      'PENDING',
      `Agregando actividad local: ${JSON.stringify(withId)}`,
    );

    const updated = [...pendingRef.current, withId];
    pendingRef.current = updated;
    setPending(updated);
    await AsyncStorage.setItem(keyRef.current, JSON.stringify(updated))
      .then(() =>
        log(
          'context/PendingActivitiesContext.tsx',
          'add',
          'PENDING',
          'Actividad guardada en AsyncStorage',
        ),
      )
      .catch((e) =>
        log(
          'context/PendingActivitiesContext.tsx',
          'add',
          'ERROR',
          `Error guardando en AsyncStorage: ${e}`,
        ),
      );

    log(
      'context/PendingActivitiesContext.tsx',
      'add',
      'ACTIVITY_SAVED_LOCALLY',
      JSON.stringify(withId),
    );

    const state = await NetInfo.fetch();
    const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
    if (online) {
      await sync();
    }
  };

  const logPending = () => {
    log(
      'context/PendingActivitiesContext.tsx',
      'logPending',
      'PENDING',
      `Pendientes: ${pending.length}`,
    );
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        log(
          'context/PendingActivitiesContext.tsx',
          'auth',
          'AUTH',
          `Usuario autenticado: ${user.uid}`,
        );
        keyRef.current = getKey(user.uid);
        uploadedKeyRef.current = getUploadedKey(user.uid);
        try {
          const stored = await AsyncStorage.getItem(keyRef.current);
          if (stored) {
            const parsed = JSON.parse(stored);
            log(
              'context/PendingActivitiesContext.tsx',
              'auth',
              'AUTH',
              `Cargando actividades previas: ${parsed.length}`,
            );
            pendingRef.current = parsed;
            setPending(parsed);
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
        log(
          'context/PendingActivitiesContext.tsx',
          'auth',
          'AUTH',
          authInitRef.current ? 'Usuario deslogueado' : 'Esperando autenticación...',
        );
        keyRef.current = '';
        uploadedKeyRef.current = '';
        setPending([]);
        pendingRef.current = [];
        uploadedRef.current = [];
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    pendingRef.current = pending;
    log(
      'context/PendingActivitiesContext.tsx',
      'state',
      'PENDING',
      `Estado actualizado: ${pending.length}`,
    );
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
