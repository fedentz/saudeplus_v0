import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/firebase';
import db from '../firebase/db';
import { logEvent } from '../utils/logger';
import { evaluateActivityStatus } from '../utils/stats';
import ActivityModel from '../models/ActivityModel';

export interface LocalActivity {
  id: string;
  startTime: string;
  endTime: string;
  distance: number;
  duration: number;
  conexion: 'wifi' | 'datos_moviles' | 'offline';
  metodoGuardado: 'online' | 'offline_post_sync';
  status: 'pendiente' | 'valida' | 'invalida';
  invalidReason?: 'vehiculo' | 'no_es_usuario';
  velocidadPromedio: number;
}

const PENDING_KEY = 'PENDING_ACTIVITIES_V2';

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const uploadActivity = async (activity: LocalActivity) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const payload = ActivityModel.fromLocalActivity(activity, user.uid).toFirestore();
    console.log(
      `\uD83D\uDE80 Subiendo actividad: ${activity.id} para usuario ${user.uid} \u2192`,
      payload,
    );
    await addDoc(collection(db, 'activities'), payload);


    logEvent('UPLOAD', 'Actividad guardada en Firebase');
  } catch (error) {
    logEvent('UPLOAD', `Error al guardar: ${error}`);
    throw error;
  }
};

export const saveActivityWithCache = async (
  activity: Omit<LocalActivity, 'id' | 'conexion' | 'metodoGuardado' | 'status' | 'invalidReason' | 'velocidadPromedio'>,
) => {
  const netInfo = await NetInfo.fetch();
  const online = Boolean(netInfo.isConnected) && netInfo.isInternetReachable !== false;
  const conexion = online ? (netInfo.type === 'wifi' ? 'wifi' : 'datos_moviles') : 'offline';
  const evalRes = evaluateActivityStatus(activity.distance, activity.duration);
  const data: LocalActivity = {
    ...activity,
    id: generateId(),
    conexion,
    metodoGuardado: online ? 'online' : 'offline_post_sync',
    status: evalRes.status,
    invalidReason: evalRes.invalidReason,
    velocidadPromedio: evalRes.velocidadPromedio,
  };
  if (online) {
    try {
      await uploadActivity(data);
      return;
    } catch (error) {
      logEvent('UPLOAD', `Error al guardar online: ${error}`);
    }
  }
  const stored = await AsyncStorage.getItem(PENDING_KEY);
  const pending: LocalActivity[] = stored ? JSON.parse(stored) : [];
  pending.push(data);
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
};

export const syncPendingActivities = async () => {
  const stored = await AsyncStorage.getItem(PENDING_KEY);
  if (!stored) return;
  let pending: LocalActivity[] = [];
  try {
    pending = JSON.parse(stored);
  } catch {
    return;
  }
  console.log(`\uD83E\uDEA5 [SYNC] Encontradas ${pending.length} actividades pendientes`);
  const remaining: LocalActivity[] = [];
  for (const item of pending) {
    try {
      await uploadActivity(item);
      console.log(`\uD83E\uDEA5 [SYNC] Actividad subida con éxito: ${item.id}`);
    } catch (e) {
      console.log(`\uD83E\uDEA5 [SYNC] Falló la subida de ${item.id}: ${e}`);
      remaining.push(item);
    }
  }
  if (remaining.length === 0) {
    await AsyncStorage.removeItem(PENDING_KEY);
    console.log('\uD83E\uDEA5 [SYNC] Todas las actividades pendientes fueron subidas');
  } else {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
    console.log(`\uD83E\uDEA5 [SYNC] Quedaron ${remaining.length} pendientes`);
  }
};

let listenerAdded = false;
export const setupActivitySync = async () => {
  if (listenerAdded) return;
  listenerAdded = true;
  const state = await NetInfo.fetch();
  if (state.isConnected && state.isInternetReachable !== false) {
    syncPendingActivities().catch(() => undefined);
  }
  NetInfo.addEventListener((info) => {
    if (info.isConnected && info.isInternetReachable !== false) {
      syncPendingActivities().catch(() => undefined);
    }
  });
};

export const getActivitiesByUser = async (userId: string) => {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export interface MonthlySummary {
  month: string;
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
}

export const getUserActivitiesSummary = async (userId: string): Promise<MonthlySummary[]> => {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('date', 'asc'),
  );
  const snapshot = await getDocs(q);

  const map = new Map<
    string,
    { totalActivities: number; totalDistance: number; totalTime: number }
  >();

  snapshot.forEach((docu) => {
    const data = docu.data() as any;
    const date: Date = data.date.toDate();
    const key = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const stats = map.get(key) || { totalActivities: 0, totalDistance: 0, totalTime: 0 };
    stats.totalActivities += 1;
    stats.totalDistance += data.distance;
    stats.totalTime += data.duration;
    map.set(key, stats);
  });

  return Array.from(map.entries()).map(([month, stats]) => ({
    month,
    totalActivities: stats.totalActivities,
    totalDistance: Number(stats.totalDistance.toFixed(2)),
    totalTime: stats.totalTime,
  }));
};
