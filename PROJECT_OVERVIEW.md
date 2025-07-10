# Proyecto SaudePlus

SaudePlus es una aplicación móvil creada con Expo y React Native que permite registrar caminatas y otras actividades físicas. Utiliza Firebase para autenticación y almacenamiento de datos, y funciona tanto online como offline.

## Estructura de carpetas

- **assets/** – Imágenes, íconos y recursos estáticos.
- **components/** – Componentes reutilizables (por ejemplo, elementos de la pantalla de actividad y de la home).
- **constants/** – Colores y tema de la app.
- **context/** – Contextos de React que gestionan tema, emoji de actividad y actividades pendientes.
- **firebase/** – Inicialización de Firebase y helpers para auth y Firestore.
- **functions/** – Cloud Functions. `saveActivity` guarda actividades en Firestore desde una petición HTTP.
- **hooks/** – Hooks personalizados (tracking de ubicación, usuario autenticado, etc.).
- **navigation/** – Navegación principal con pestañas (`MainTabs`).
- **screens/** – Pantallas de la app: Home, Activity, Stats, Profile y otras (login, ajustes...).
- **services/** – Servicios para interactuar con Firebase (authService, activityService, walkService).
- **utils/** – Utilidades como logger y funciones de estadísticas.
- ****tests**/** – Pruebas unitarias con Jest.

## Firebase Auth y mantenimiento de sesión

La configuración se encuentra en `firebase/firebase.ts`. Se inicializa la app con los valores de `.env` y se crea `auth` usando `initializeAuth` con `getReactNativePersistence(AsyncStorage)` para que la sesión se mantenga entre reinicios. El hook `useUser` escucha `onAuthStateChanged` y expone el usuario junto con un estado `authInitialized` que indica cuándo la autenticación está lista.

## Registro y guardado de actividades

El hook `useTracking` toma la ubicación mediante `expo-location`, calcula distancia y tiempo, y guarda el progreso en `AsyncStorage` mientras está en curso. Cuando se detiene, la actividad se pasa a `PendingActivitiesContext`, que intenta enviarla a la Cloud Function `saveActivity`. Si el dispositivo está offline, la actividad queda almacenada localmente y se sincroniza más tarde cuando vuelve la conexión.

## Pantallas principales

- **Home** – Muestra saludo, botón para iniciar actividad y un resumen del progreso mensual. Si hay actividades pendientes de sincronizar aparece un contador.
- **Activity** – Mapa en vivo con el recorrido, distancia y tiempo. Permite guardar la actividad al finalizar y maneja pérdida de GPS o detección de movimiento en vehículo.
- **Stats** – Lista de actividades agrupadas por mes y barra con el progreso actual respecto al objetivo mensual.
- **Profile** – Información del usuario, cambio de emoji y opción de cerrar sesión.

## Objetivo mensual y barra de progreso

`ProgressDisplay` recibe la distancia recorrida y la meta (por defecto 20 km o 30 km según la pantalla). Calcula el porcentaje completado y muestra una barra de progreso y mensajes motivacionales.

## Inicialización de Firebase

En `app.config.ts` se leen variables de entorno y se exponen en `expo.extra`. `firebase/firebase.ts` usa estos valores para `initializeApp` y `initializeAuth`. La persistencia se configura con `getReactNativePersistence(AsyncStorage)`.

## Comandos útiles

- `npm test` – Ejecuta Jest sobre la carpeta `__tests__`.
- `npm run lint` – Linter con ESLint según la configuración del proyecto.
- `npm run format` – Formatea el código con Prettier.

## Librerías principales

Entre otras, se utilizan:

- **Expo** y React Native.
- **firebase** para Auth y Firestore.
- **react-navigation** para navegación en pestañas y stacks.
- **react-native-maps** para mostrar el mapa de la actividad.
- **@react-native-community/netinfo** para detectar conectividad.
- **date-fns** para manejo de fechas.

## Variables requeridas en `.env`

```
FIREBASE_API_KEY=
AUTH_DOMAIN=
PROJECT_ID=
STORAGE_BUCKET=
MESSAGING_SENDER_ID=
APP_ID=
MEASUREMENT_ID=
GOOGLE_CLIENT_ID=
```

Estos valores se inyectan mediante `app.config.ts` y son necesarios para inicializar Firebase y la autenticación con Google.
