# ProjectOverview

SaudePlus es una aplicación desarrollada con React Native y Expo para registrar caminatas y almacenar estadísticas de actividad física. Permite iniciar sesión con Firebase, registrar recorridos mediante el GPS del teléfono y consultar el progreso mensual.

## Flujos principales

- **Autenticación**: los usuarios pueden registrarse o iniciar sesión mediante correo electrónico o Google. La sesión se mantiene con `initializeAuth` y `AsyncStorage`.
- **Registro de actividad**: al iniciar una caminata se obtiene la ubicación en tiempo real y se calcula distancia y tiempo. La información se guarda localmente.
- **Sincronización offline**: si no hay conexión, las actividades se guardan en `AsyncStorage` a través del `PendingActivitiesContext`.
- **Sincronización al recuperar red**: al reconectarse el dispositivo se envían las actividades pendientes a una Cloud Function que las escribe en Firestore.

## Autenticación y persistencia

La configuración de Firebase se encuentra en `firebase/firebase.ts`. Se inicializa con las variables de `.env` y se crea la instancia de `auth` usando `getReactNativePersistence(AsyncStorage)` para que la sesión se conserve entre reinicios de la app. El hook `useUser` expone el usuario y un indicador `authInitialized` para saber cuándo está lista la autenticación.

## Tecnologías utilizadas

- **React Native** y **Expo** para el desarrollo multiplataforma.
- **Firebase** (Auth y Firestore) para backend y almacenamiento.
- **Expo Location** y **react-native-maps** para el seguimiento por GPS.
- **AsyncStorage** para persistir datos y manejar funcionamiento offline.
- **React Navigation** para la navegación por pestañas y stacks.

## Estructura del proyecto

- **firebase/**: inicialización de Firebase y helpers de autenticación.
- **hooks/**: hooks personalizados como `useTracking`, `useUser` y `useActivitySync`.
- **context/**: contextos globales para tema de la app y cola de actividades pendientes.
- **screens/**: pantallas principales (Home, Activity, Stats, Profile, Login, etc.).
- **components/**: componentes reutilizables (mapa, barra de progreso, etc.).
- **services/**: lógica de negocio para guardar y sincronizar actividades.
- **functions/**: Cloud Functions que se encargan de guardar actividades en Firestore.
- **utils/**: utilidades y helpers generales.
