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

const PENDING_KEY = 'PENDING_ACTIVITIES';

export const saveActivity = async (
  duration: number, // en segundos
  distance: number,
  date: Date = new Date()
) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    // ✅ NO GUARDAR si duró menos de 5 minutos
    if (duration < 300) {
      logEvent('UPLOAD', 'Actividad descartada: menos de 5 minutos');
      return;
    }

    await addDoc(collection(db, 'activities'), {
      userId: user.uid,
      duration,
      distance,
      date: Timestamp.fromDate(date), // ✅ Timestamp de Firestore
    });

    logEvent('UPLOAD', 'Actividad guardada en Firebase');
  } catch (error) {
    logEvent('UPLOAD', `Error al guardar: ${error}`);
  }
};

export const saveActivityWithCache = async (
  duration: number,
  distance: number,
  date: Date = new Date()
) => {
  try {
    await saveActivity(duration, distance, date);
  } catch (error) {
    logEvent('UPLOAD', `Error al guardar, se guarda localmente: ${error}`);
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    const pending = stored ? JSON.parse(stored) : [];
    pending.push({ duration, distance, date: date.toISOString() });
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  }
};

export const syncPendingActivities = async () => {
  const stored = await AsyncStorage.getItem(PENDING_KEY);
  if (!stored) return;
  const pending = JSON.parse(stored);
  logEvent('UPLOAD', `Sincronizando ${pending.length} actividades pendientes`);
  const remaining = [] as any[];
  for (const item of pending) {
    try {
      await saveActivity(
        item.duration,
        item.distance,
        new Date(item.date)
      );
    } catch (e) {
      remaining.push(item);
    }
  }
  if (remaining.length === 0) {
    await AsyncStorage.removeItem(PENDING_KEY);
    logEvent('UPLOAD', 'Todas las actividades pendientes fueron subidas');
  } else {
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
    logEvent('UPLOAD', `Quedaron ${remaining.length} actividades sin subir`);
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

