import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Auth } from 'firebase/auth'; // 👈 importación del tipo
import Constants from 'expo-constants';
import { log } from '../utils/logger';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || 'TU_API_KEY',
  authDomain: Constants.expoConfig?.extra?.AUTH_DOMAIN || 'TU_AUTH_DOMAIN',
  projectId: Constants.expoConfig?.extra?.PROJECT_ID || 'TU_PROJECT_ID',
  storageBucket: Constants.expoConfig?.extra?.STORAGE_BUCKET || 'TU_STORAGE_BUCKET',
  messagingSenderId: Constants.expoConfig?.extra?.MESSAGING_SENDER_ID || 'TU_SENDER_ID',
  appId: Constants.expoConfig?.extra?.APP_ID || 'TU_APP_ID',
  measurementId: Constants.expoConfig?.extra?.MEASUREMENT_ID || 'TU_MEASUREMENT_ID',
  googleClientId: Constants.expoConfig?.extra?.GOOGLE_CLIENT_ID || 'TU_GOOGLE_CLIENT_ID',
};

log(
  'firebase/firebase.ts',
  'init',
  'FIREBASE',
  'Verificando si hay apps de Firebase inicializadas...',
);
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
log(
  'firebase/firebase.ts',
  'init',
  'FIREBASE',
  getApps().length ? 'Firebase app existente encontrada.' : 'Nueva app de Firebase inicializada.',
);

// Inicialización segura de Auth con persistencia
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  log('firebase/firebase.ts', 'init', 'FIREBASE', 'Firebase Auth inicializado con persistencia.');
} catch (e) {
  auth = getAuth(app);
  log('firebase/firebase.ts', 'init', 'FIREBASE', 'Firebase Auth ya estaba inicializado.');
}

console.log('[DEBUG] auth.currentUser al iniciar:', auth.currentUser);

export { app, auth };
