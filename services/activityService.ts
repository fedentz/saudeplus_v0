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
      console.log('Actividad descartada: duró menos de 5 minutos.');
      return;
    }

    await addDoc(collection(db, 'activities'), {
      userId: user.uid,
      duration,
      distance,
      date: Timestamp.fromDate(date), // ✅ Timestamp de Firestore
    });

    console.log('✅ Actividad guardada correctamente.');
  } catch (error) {
    console.error('❌ Error al guardar la actividad:', error);
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

