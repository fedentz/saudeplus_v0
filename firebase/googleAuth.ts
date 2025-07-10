import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import Constants from 'expo-constants';
import { app } from './firebase'; // Tu configuración Firebase
import { log } from '../utils/logger';

WebBrowser.maybeCompleteAuthSession(); // Cierra correctamente la sesión en iOS

const auth = getAuth(app);

const clientId = Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID; // tomado desde .env

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = (response.authentication as any).id_token; // 👈 fix de TypeScript
      if (!idToken) {
        log('firebase/googleAuth.ts', 'useGoogleAuth', 'WARN', 'No se recibió id_token en la respuesta de autenticación');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      signInWithCredential(auth, credential)
        .then((userCred) => {
          log(
            'firebase/googleAuth.ts',
            'useGoogleAuth',
            'AUTH',
            `Usuario autenticado con Google: ${userCred.user.email}`,
          );
        })
        .catch((error) => {
          log(
            'firebase/googleAuth.ts',
            'useGoogleAuth',
            'ERROR',
            `Error al autenticar con Google: ${error.message}`,
          );
        });
    }
  }, [response]);

  return { promptAsync, request };
};
