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
