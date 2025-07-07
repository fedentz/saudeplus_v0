import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { startOfMonth, endOfMonth } from 'date-fns';
import db from '../firebase/db';

export interface Walk {
  userId: string;
  date: Date;
  distanceKm: number;
}

export const saveWalk = async (walk: Walk) => {
  await addDoc(collection(db, 'walks'), {
    userId: walk.userId,
    date: walk.date,
    distanceKm: walk.distanceKm,
  });
};

export const getMonthlyProgress = async (userId: string, goalKm: number) => {
  const start = startOfMonth(new Date());
  const end = endOfMonth(new Date());

  const q = query(
    collection(db, 'walks'),
    where('userId', '==', userId),
    where('date', '>=', start),
    where('date', '<=', end)
  );

  const snapshot = await getDocs(q);
  const totalKm = snapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (typeof data.distanceKm === 'number' ? data.distanceKm : 0);
  }, 0);

  return {
    totalKm,
    percentage: Math.min((totalKm / goalKm) * 100, 100),
  };
};
