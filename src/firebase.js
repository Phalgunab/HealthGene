import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  console.error(
    '❌ Firebase configuration missing. Create .env.local from .env.example and add your Firebase credentials.'
  );
}

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// Enable Firebase Emulator if configured
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
if (useEmulator) {
  try {
    const authHost = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_HOST || 'localhost';
    const authPort = import.meta.env.VITE_FIREBASE_EMULATOR_AUTH_PORT || 9099;
    const firestoreHost = import.meta.env.VITE_FIREBASE_EMULATOR_FIRESTORE_HOST || 'localhost';
    const firestorePort = import.meta.env.VITE_FIREBASE_EMULATOR_FIRESTORE_PORT || 8080;

    // Check if emulator is already connected (avoid double connection in dev hot reload)
    if (!auth.emulatorConfig) {
      connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
      console.log(`✅ Connected to Auth Emulator at http://${authHost}:${authPort}`);
    }
    
    if (!db.emulatorConfig) {
      connectFirestoreEmulator(db, firestoreHost, firestorePort);
      console.log(`✅ Connected to Firestore Emulator at http://${firestoreHost}:${firestorePort}`);
    }
  } catch (error) {
    // Emulator might not be running yet or already connected
    console.warn('⚠️  Firebase Emulator not available:', error.message);
  }
}

isSupported().then((supported) => {
  if (supported) getAnalytics(firebaseApp);
});

export { auth, db, googleProvider };
