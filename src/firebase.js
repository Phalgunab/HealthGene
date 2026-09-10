import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAE_OnH_5v7o-tnjqKRK4xRYKwH5KW3jkE',
  authDomain: 'myfamilyhealth-fe7b5.firebaseapp.com',
  projectId: 'myfamilyhealth-fe7b5',
  storageBucket: 'myfamilyhealth-fe7b5.firebasestorage.app',
  messagingSenderId: '1094951940065',
  appId: '1:1094951940065:web:467ebff8a8c6518135aca0',
  measurementId: 'G-CKQXN26H8J',
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

isSupported().then((supported) => {
  if (supported) getAnalytics(firebaseApp);
});

export { auth, db, googleProvider };
