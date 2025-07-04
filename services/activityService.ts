import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';

import { auth } from '../firebase/firebase';
import db from '../firebase/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent } from '../utils/logger';

export interface LocalActivity {
  id: string;
  startTime: string;
  endTime: string;
  distance: number;
  duration: number;
}

const PENDING_KEY = 'PENDING_ACTIVITIES_V2';

const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const uploadActivity = async (activity: LocalActivity) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');
    if (activity.duration < 300) {
      logEvent('UPLOAD', 'Actividad descartada: menos de 5 minutos');
      return;
    }

    await addDoc(collection(db, 'activities'), {
      userId: user.uid,
      startTime: Timestamp.fromDate(new Date(activity.startTime)),
      endTime: Timestamp.fromDate(new Date(activity.endTime)),
      duration: activity.duration,
      distance: activity.distance,
    });

    logEvent('UPLOAD', 'Actividad guardada en Firebase');
  } catch (error) {
    logEvent('UPLOAD', `Error al guardar: ${error}`);
  }
};

export const saveActivityWithCache = async (activity: Omit<LocalActivity, 'id'>) => {
  const data: LocalActivity = { ...activity, id: generateId() };
  try {
    await uploadActivity(data);
  } catch (error) {
    logEvent('UPLOAD', `Error al guardar, se guarda localmente: ${error}`);
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    const pending: LocalActivity[] = stored ? JSON.parse(stored) : [];
    pending.push(data);
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }
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

export const getActivitiesByUser = async (userId: string) => {
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
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
    orderBy('date', 'asc')
  );
  const snapshot = await getDocs(q);

  const map = new Map<string, { totalActivities: number; totalDistance: number; totalTime: number }>();

  snapshot.forEach(docu => {
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

