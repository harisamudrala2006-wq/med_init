// Firebase Initialization and Configuration
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
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
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sri-maheswari-medical.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sri-maheswari-medical",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sri-maheswari-medical.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Determine if we have real Firebase configured
export const isRealFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_API_KEY !== "your_api_key_here" &&
  import.meta.env.VITE_FIREBASE_API_KEY !== "AIzaSyDummyKeyForDevelopment"
);

let app, auth, db;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  // Set persistence
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }
} catch (error) {
  console.warn("Firebase SDK initialization in client mode:", error.message);
}

export { app, auth, db };
