import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import db from '../firebase/db';

export const findUserByEmail = async (email: string) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as any;
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return (snap.data() as any).role || null;
};
