// hooks/useUser.ts
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log(
        '[AUTH] Estado de autenticación inicial recibido:',
        firebaseUser?.uid || 'sin usuario',
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
