import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth'; // ✅ Tipo Auth importado correctamente
import Constants from 'expo-constants';

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

// Inicializar Firebase App (si aún no fue inicializada)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Obtener instancia de Auth
const auth: Auth = getAuth(app);

export { app, auth };
