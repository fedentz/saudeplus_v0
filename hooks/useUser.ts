// hooks/useUser.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/firebase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        AsyncStorage.setItem(
          'user',
          JSON.stringify({ uid: firebaseUser.uid, email: firebaseUser.email }),
        );
      } else {
        AsyncStorage.removeItem('user');
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Limpia el listener
  }, []);

  return { user, loading };
}
