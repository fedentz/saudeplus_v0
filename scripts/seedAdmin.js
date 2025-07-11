require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, setDoc, doc } = require('firebase/firestore');

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

async function seedAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el archivo .env.local');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'users', uid), {
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Admin creado con éxito: ${email}`);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const typedError = error;
      if (typedError.code === 'auth/email-already-in-use') {
        console.warn('⚠️ El usuario admin ya existe.');
      } else {
        console.error('❌ Error creando el admin:', typedError.message);
      }
    } else if (error instanceof Error) {
      console.error('❌ Error creando el admin:', error.message);
    } else {
      console.error('❌ Error desconocido:', error);
    }
  }
}

seedAdmin();
