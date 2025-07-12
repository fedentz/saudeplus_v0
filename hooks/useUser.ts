import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, getIdTokenResult, getIdToken } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { log } from '../utils/logger';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    log('hooks/useUser.ts', 'useUser', 'AUTH', 'Registrando listener de auth...');
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      log(
        'hooks/useUser.ts',
        'onAuthStateChanged',
        'AUTH',
        `Usuario recibido: ${firebaseUser?.uid || 'sin usuario'}`,
      );

      if (firebaseUser) {
        try {
          // 👇 Forzar refresh del token para obtener los últimos claims
          await firebaseUser.getIdToken(true);
          const tokenResult = await firebaseUser.getIdTokenResult();
          log(
            'hooks/useUser.ts',
            'onAuthStateChanged',
            'AUTH',
            `Custom claims: ${JSON.stringify(tokenResult.claims)}`
          );
        } catch (err) {
          console.error('[AUTH] Error refrescando token:', err);
        }
      }

      setUser(firebaseUser);
      setLoading(false);
      setAuthInitialized(true);

      if (firebaseUser) {
        await getIdToken(firebaseUser, true);
        const tokenResult = await getIdTokenResult(firebaseUser);
        log(
          'hooks/useUser.ts',
          'onAuthStateChanged',
          'AUTH',
          `[AUTH] Custom claims actualizados: ${JSON.stringify(tokenResult.claims)}`,
        );
        setIsAdmin(tokenResult.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { user, loading, authInitialized, isAdmin };
}
