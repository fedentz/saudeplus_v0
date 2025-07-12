import { useEffect, useState } from 'react';
import { onIdTokenChanged, getIdTokenResult } from 'firebase/auth';
import { auth } from '../firebase/firebase';

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const res = await getIdTokenResult(user, true);
        setIsAdmin(res.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  return isAdmin;
}
