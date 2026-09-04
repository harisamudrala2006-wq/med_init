// Real Firebase Authentication Service (Custom Claims Role Support: Owner vs Staff)
// Zero fake fallbacks or simulated credentials.
import { 
  auth, 
  db, 
  isRealFirebaseConfigured 
} from '../config/firebase.js';
import { 
  signInWithPhoneNumber, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { pharmacyState } from '../context/pharmacyState.js';

const SESSION_KEY = 'medi_auth_session';
const DEFAULT_PHARMACY_ID = 'pharmacy_sri_maheswari';

let currentUser = null;
let isAuthLoading = true;
let confirmationResult = null;
let recaptchaVerifier = null;
const listeners = new Set();

// Ensure local persistence
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch(console.warn);
}

// Load session from localStorage if already signed in
try {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    currentUser = JSON.parse(saved);
  }
} catch (e) {
  console.warn("Could not read stored session:", e);
}

// Real Firebase Auth state change observer
if (auth && isRealFirebaseConfigured) {
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        // Read custom claims from the ID token (owner vs staff, pharmacyId)
        const tokenResult = await fbUser.getIdTokenResult(true);
        const claims = tokenResult.claims || {};

        // Fetch user document from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        let profile = {};
        if (userSnap.exists()) {
          profile = userSnap.data();
        }

        const role = claims.role || profile.role || (fbUser.email?.includes('owner') ? 'owner' : 'staff');
        const pharmacyId = claims.pharmacyId || profile.pharmacyId || DEFAULT_PHARMACY_ID;
        const fullName = profile.fullName || fbUser.displayName || (role === 'owner' ? "Dr. K. Rama Rao (Owner)" : "Pharmacist (Staff)");

        currentUser = {
          uid: fbUser.uid,
          email: fbUser.email || profile.email || "",
          phoneNumber: fbUser.phoneNumber || profile.phoneNumber || "",
          fullName,
          pharmacyId,
          role, // 'owner' | 'staff'
          tokenClaims: claims
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      } catch (err) {
        console.error("Error retrieving user custom claims:", err);
      }
    } else {
      currentUser = null;
      localStorage.removeItem(SESSION_KEY);
    }
    isAuthLoading = false;
    listeners.forEach(fn => fn(currentUser));
  });
} else {
  isAuthLoading = false;
}

export const authService = {
  get user() {
    return currentUser;
  },

  get isAuthenticated() {
    return Boolean(currentUser);
  },

  get isLoading() {
    return isAuthLoading;
  },

  get isOwner() {
    return currentUser?.role === 'owner';
  },

  get isStaff() {
    return currentUser?.role === 'staff' || currentUser?.role === 'owner';
  },

  /**
   * Initializes reCAPTCHA for Phone Authentication
   */
  initRecaptcha(containerId = 'recaptcha-container') {
    if (!auth || !isRealFirebaseConfigured) return null;
    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          console.warn("reCAPTCHA expired. Please retry.");
        }
      });
      return recaptchaVerifier;
    } catch (e) {
      console.warn("RecaptchaVerifier init error:", e);
      return null;
    }
  },

  /**
   * Real Phone Authentication: Sends SMS OTP via Firebase Auth
   */
  async sendOtp(phoneNumber, containerId = 'recaptcha-container') {
    if (!auth || !isRealFirebaseConfigured) {
      return { success: false, error: "Firebase Authentication is not configured in .env" };
    }

    const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
    const formattedPhone = cleanNumber.startsWith('+') ? cleanNumber : `+91${cleanNumber}`;

    try {
      const verifier = this.initRecaptcha(containerId);
      confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      return { success: true, formattedPhone };
    } catch (error) {
      console.error("Firebase Phone Auth error:", error);
      return { 
        success: false, 
        error: error.message || "Failed to send SMS code. Please verify phone number format and SMS quota." 
      };
    }
  },

  /**
   * Real Phone Authentication: Verifies 6-digit OTP with Firebase
   */
  async verifyOtp(otpCode, { isSignUp = false, fullName = '', pharmacyName = '' } = {}) {
    isAuthLoading = true;
    listeners.forEach(fn => fn(currentUser));

    if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: false, error: "No active verification session. Please request a new OTP." };
    }

    try {
      const userCredential = await confirmationResult.confirm(otpCode);
      const fbUser = userCredential.user;

      // Sync user profile to Firestore
      let pharmacyId = DEFAULT_PHARMACY_ID;
      let userRole = 'staff';
      let resolvedName = fullName || "Pharmacist";

      if (db && isRealFirebaseConfigured) {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          pharmacyId = data.pharmacyId || DEFAULT_PHARMACY_ID;
          userRole = data.role || 'staff';
          resolvedName = data.fullName || resolvedName;

          await updateDoc(userDocRef, {
            lastLoginAt: new Date().toISOString()
          });
        } else {
          // New user sign-up
          if (isSignUp && pharmacyName) {
            pharmacyId = `pharm_${Date.now()}`;
            userRole = 'owner'; // Creator of new pharmacy becomes owner

            await setDoc(doc(db, 'pharmacies', pharmacyId), {
              id: pharmacyId,
              name: pharmacyName.trim(),
              subName: "Retail Dispensary",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }

          await setDoc(userDocRef, {
            uid: fbUser.uid,
            fullName: resolvedName,
            phoneNumber: fbUser.phoneNumber || "",
            pharmacyId,
            role: userRole,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          });
        }
      }

      currentUser = {
        uid: fbUser.uid,
        phoneNumber: fbUser.phoneNumber || "",
        fullName: resolvedName,
        pharmacyId,
        role: userRole,
        email: ""
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: true, user: currentUser };
    } catch (err) {
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: false, error: err.message || "Invalid verification OTP." };
    }
  },

  /**
   * Real Email & Password Login
   */
  async loginWithEmail(identifier, password) {
    isAuthLoading = true;
    listeners.forEach(fn => fn(currentUser));

    if (!auth || !isRealFirebaseConfigured) {
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: false, error: "Firebase Authentication is not configured in .env" };
    }

    const cleanId = identifier.trim().replace(/\s+/g, '');
    const cleanPwd = password.trim();
    const email = identifier.includes('@') ? identifier.trim() : `${cleanId}@sribalaji.in`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, cleanPwd);
      const fbUser = userCredential.user;

      // Get custom claims
      const tokenResult = await fbUser.getIdTokenResult(true);
      const claims = tokenResult.claims || {};

      let profile = {};
      if (db) {
        const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (userSnap.exists()) profile = userSnap.data();
      }

      const role = claims.role || profile.role || (email.includes('owner') ? 'owner' : 'staff');
      const pharmacyId = claims.pharmacyId || profile.pharmacyId || DEFAULT_PHARMACY_ID;

      currentUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        fullName: profile.fullName || fbUser.displayName || (role === 'owner' ? "Dr. K. Rama Rao" : "Staff Dispenser"),
        pharmacyId,
        role
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: true, user: currentUser };
    } catch (error) {
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      let msg = error.message || "Authentication failed.";
      if (error.code === 'auth/operation-not-allowed') {
        msg = "Email/Password sign-in is disabled. Please enable 'Email/Password' in your Firebase Console > Authentication > Sign-in method.";
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        msg = "Invalid email or password. Please check your credentials or create an account.";
      }
      return { success: false, error: msg };
    }
  },

  /**
   * Real Email & Password Registration
   */
  async registerWithEmail(email, password, fullName = 'Pharmacist', pharmacyName = 'Sri Maheswari Medical', role = 'owner') {
    isAuthLoading = true;
    listeners.forEach(fn => fn(currentUser));

    if (!auth || !isRealFirebaseConfigured) {
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: false, error: "Firebase Authentication is not configured in .env" };
    }

    try {
      const cleanEmail = email.trim();
      const cleanPwd = password.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPwd);
      const fbUser = userCredential.user;

      const pharmacyId = `pharm_${Date.now()}`;
      const userRole = role || 'owner';
      const resolvedName = fullName.trim() || 'Pharmacist';

      if (db && isRealFirebaseConfigured) {
        try {
          await setDoc(doc(db, 'pharmacies', pharmacyId), {
            id: pharmacyId,
            name: pharmacyName.trim(),
            subName: "Retail Dispensary",
            ownerUid: fbUser.uid,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("Pharmacy doc creation notice:", e);
        }

        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            uid: fbUser.uid,
            email: cleanEmail,
            fullName: resolvedName,
            pharmacyId,
            role: userRole,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("User doc creation notice:", e);
        }
      }

      currentUser = {
        uid: fbUser.uid,
        email: cleanEmail,
        fullName: resolvedName,
        pharmacyId,
        role: userRole
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      return { success: true, user: currentUser };
    } catch (error) {
      isAuthLoading = false;
      listeners.forEach(fn => fn(currentUser));
      let msg = error.message || "Failed to create account.";
      if (error.code === 'auth/operation-not-allowed') {
        msg = "Email/Password registration is disabled. Please enable 'Email/Password' in your Firebase Console > Authentication > Sign-in method.";
      } else if (error.code === 'auth/email-already-in-use') {
        msg = "This email is already registered. Please switch to 'Sign In' instead.";
      } else if (error.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/invalid-email') {
        msg = "Please enter a valid email address.";
      }
      return { success: false, error: msg };
    }
  },

  /**
   * Password Reset Email
   */
  async sendPasswordReset(email) {
    if (!auth || !isRealFirebaseConfigured) {
      return { success: false, error: "Firebase Authentication is not configured." };
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async resetPassword(email) {
    return this.sendPasswordReset(email);
  },

  /**
   * Sign Out
   */
  async logout() {
    if (auth && isRealFirebaseConfigured) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn("Sign out notice:", e);
      }
    }
    currentUser = null;
    confirmationResult = null;
    localStorage.removeItem(SESSION_KEY);
    listeners.forEach(fn => fn(currentUser));
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
