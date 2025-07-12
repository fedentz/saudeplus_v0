import { useEffect, useState } from 'react';
import { onIdTokenChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export default function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await getIdTokenResult(user, true);
          setIsAdmin(res.claims.admin === true);
        } catch (err) {
          console.log('[useAdminStatus] Error fetching token:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  return isAdmin;
}
