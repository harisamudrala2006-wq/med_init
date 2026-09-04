// Firebase Initialization and Configuration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  runTransaction,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDnFzWQH490WGWLBtVwBkE-y_OhG3rhPAI",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "sri-maheswari-medical.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "sri-maheswari-medical",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "sri-maheswari-medical.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "305132129196",
  appId: env.VITE_FIREBASE_APP_ID || "1:305132129196:web:c69ac9d2b2045b3e340809"
};

// Determine if we have real Firebase configured
export const isRealFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.apiKey !== "AIzaSyDummyKeyForDevelopment"
);

let app, auth, db, storage;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Set persistence
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
} catch (error) {
  console.warn("Firebase SDK initialization in client mode:", error.message);
}

export { app, auth, db, storage };
