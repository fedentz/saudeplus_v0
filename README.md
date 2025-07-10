# SaudePlus

Aplicación móvil desarrollada con React Native y Expo para registrar caminatas y llevar un historial de actividad física. Utiliza Firebase para autenticación y para almacenar los datos de las actividades.

## Levantar el proyecto desde cero

### 1. Clonar e instalar dependencias

```bash
git clone <repo>
cd saudeplus_v0
npm install
```

### 2. Configurar Firebase

1. Crea un proyecto en [Firebase](https://console.firebase.google.com/) y habilita **Authentication** (método Email/Password y Google) y **Cloud Firestore**.
2. Genera una aplicación de Firebase para plataformas Android/iOS y obtén las credenciales.
3. Copia el archivo `.env_example` a `.env` y completa los valores:

```
FIREBASE_API_KEY=<tu_api_key>
AUTH_DOMAIN=<tu_auth_domain>
PROJECT_ID=<tu_project_id>
STORAGE_BUCKET=<tu_storage_bucket>
MESSAGING_SENDER_ID=<tu_sender_id>
APP_ID=<tu_app_id>
MEASUREMENT_ID=<tu_measurement_id>
GOOGLE_CLIENT_ID=<tu_client_id_de_oauth>
```

Al ejecutar la app, `app.config.ts` expone estas variables y `firebase/firebase.ts` inicializa Firebase con ellas.

### 3. Ejecutar en entorno local

Ejecuta Expo para abrir el proyecto en el simulador o dispositivo:

```bash
# Inicio general
npm start

# O bien comandos directos
npm run android   # dispositivo/emulador Android
npm run ios       # simulador iOS (solo macOS)
npm run web       # navegador web
```

La primera vez, Expo mostrará un código QR para abrir la aplicación en Expo Go o en una build de desarrollo.

### 4. Uso de la app

Al iniciar se mostrará la pantalla de autenticación. Tras iniciar sesión podrás comenzar a registrar actividades, incluso sin conexión. Las caminatas se sincronizarán automáticamente cuando el dispositivo vuelva a estar en línea.

## Scripts útiles

```bash
npm test    # ejecutar tests con Jest
npm run lint # ejecutar ESLint
npm run format # formatear con Prettier
```
