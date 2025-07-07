// hooks/useUser.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/firebase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStored = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed as User);
        }
      } catch {
        // ignore parse errors
      } finally {
        setLoading(false);
      }
    };

    loadStored();

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
    });

    return () => unsubscribe(); // Limpia el listener
  }, []);

  return { user, loading };
}
