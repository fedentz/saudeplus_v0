// hooks/useUser.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore parse errors
        }
      }
      setLoading(false);
    };

    checkSession();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        AsyncStorage.setItem('user', JSON.stringify(firebaseUser));
      } else {
        AsyncStorage.removeItem('user');
      }
      setUser(firebaseUser);
    });

    return () => unsubscribe(); // Limpia el listener
  }, []);

  return { user, loading };
}
