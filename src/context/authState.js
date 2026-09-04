// Authentication State (Phase 3)
// Real Firebase Auth integration with fallback session support.
import { auth, isRealFirebaseConfigured } from '../config/firebase.js';
import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';

const SESSION_KEY = 'medi_auth_session';

let currentUser = null;
let isAuthLoading = true;
const listeners = new Set();

// Check for local persisted session
try {
  const savedSession = localStorage.getItem(SESSION_KEY);
  if (savedSession) {
    currentUser = JSON.parse(savedSession);
  }
} catch (e) {
  console.warn("Could not read auth session:", e);
}

// Wire Firebase Auth state if real Firebase is available
if (auth && isRealFirebaseConfigured) {
  onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      currentUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || "Staff Pharmacist",
        role: "pharmacist"
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      currentUser = null;
      localStorage.removeItem(SESSION_KEY);
    }
    isAuthLoading = false;
    listeners.forEach(fn => fn(currentUser));
  });
} else {
  // If in demo/offline mode, keep persistent session or default
  isAuthLoading = false;
}

export const authState = {
  get user() {
    return currentUser;
  },

  get isAuthenticated() {
    return Boolean(currentUser);
  },

  get isLoading() {
    return isAuthLoading;
  },

  async login(identifier, password) {
    isAuthLoading = true;
    listeners.forEach(fn => fn(currentUser));

    // Handle Firebase Auth
    if (auth && isRealFirebaseConfigured) {
      try {
        const email = identifier.includes('@') ? identifier : `${identifier.replace(/\s+/g, '')}@sribalaji.in`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || "Licensed Pharmacist",
          role: "owner"
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        isAuthLoading = false;
        listeners.forEach(fn => fn(currentUser));
        return { success: true };
      } catch (error) {
        isAuthLoading = false;
        listeners.forEach(fn => fn(currentUser));
        return { success: false, error: error.message };
      }
    } else {
      // Offline/Local validation mode matching Stitch credentials
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate auth network latency
      
      const cleanId = identifier.trim().replace(/\s+/g, '');
      const cleanPwd = password.trim();

      // Accept sample staff logins: 9849012345 or staff@sribalaji.in with min 6-8 chars
      if (cleanId && cleanPwd.length >= 6) {
        currentUser = {
          uid: "usr_staff_01",
          email: cleanId.includes('@') ? cleanId : `${cleanId}@sribalaji.in`,
          mobile: cleanId.includes('@') ? "9849012345" : cleanId,
          displayName: "Dr. K. Rama Rao",
          role: "owner"
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
        isAuthLoading = false;
        listeners.forEach(fn => fn(currentUser));
        return { success: true };
      } else {
        isAuthLoading = false;
        listeners.forEach(fn => fn(currentUser));
        return { 
          success: false, 
          error: "Invalid staff credentials. Password must be at least 6 characters." 
        };
      }
    }
  },

  async logout() {
    if (auth && isRealFirebaseConfigured) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn("Sign out error:", e);
      }
    }
    currentUser = null;
    localStorage.removeItem(SESSION_KEY);
    listeners.forEach(fn => fn(currentUser));
  },

  async forgotPassword(email) {
    if (auth && isRealFirebaseConfigured && email) {
      await sendPasswordResetEmail(auth, email);
    }
    return true;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
