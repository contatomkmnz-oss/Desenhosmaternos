/**
 * Inicialização condicional do Firebase (100% via import.meta.env).
 *
 * Sem variáveis válidas, firebaseEnabled = false e o app usa o modo demo.
 * Em produção (Vercel), defina as mesmas VITE_FIREBASE_* no painel.
 */
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

const apiKey = String(firebaseConfig.apiKey ?? '').trim();

export const firebaseEnabled = !!(
  apiKey &&
  apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  String(apiKey).trim() !== '' &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let _auth = null;
let _googleProvider = null;
let _app = null;
let _db = null;

if (firebaseEnabled) {
  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  _app = app;

  _auth = getAuth(app);
  _db = getFirestore(app);
  _googleProvider = new GoogleAuthProvider();
  _googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export const firebaseApp = _app;
export const firebaseAuth = _auth;
export const googleProvider = _googleProvider;
export const firestoreDb = _db;
export const auth = firebaseAuth;
export const googleAuthProvider = googleProvider;
