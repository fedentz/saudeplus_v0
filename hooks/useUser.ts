// hooks/useUser.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { log } from '../utils/logger';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    log('hooks/useUser.ts', 'useUser', 'AUTH', 'Registrando listener de auth...');
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      log(
        'hooks/useUser.ts',
        'onAuthStateChanged',
        'AUTH',
        `Usuario recibido: ${firebaseUser?.uid || 'sin usuario'}`,
      );
      setUser(firebaseUser);
      setLoading(false);
      setAuthInitialized(true);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { user, loading, authInitialized };
}
