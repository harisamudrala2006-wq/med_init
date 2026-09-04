// Pharmacy Management Service
// Real-time Firestore sync for pharmacies/{pharmacyId}
import { db, isRealFirebaseConfigured } from '../config/firebase.js';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { pharmacyState } from '../context/pharmacyState.js';

let unsubscribeListener = null;

export const pharmacyService = {
  /**
   * Initializes real-time listener for the given pharmacyId
   */
  initRealtimeSync(pharmacyId) {
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = null;
    }

    if (!db || !isRealFirebaseConfigured || !pharmacyId) return;

    try {
      const docRef = doc(db, 'pharmacies', pharmacyId);
      unsubscribeListener = onSnapshot(docRef, (snap) => {
        if (snap.exists()) {
          const cloudProfile = snap.data();
          pharmacyState.updateProfile(cloudProfile);
        } else {
          // If pharmacy doesn't exist yet, seed with default profile
          this.savePharmacyProfile(pharmacyId, pharmacyState.profile);
        }
      }, (err) => {
        console.warn("Pharmacy real-time sync notice:", err);
      });
    } catch (e) {
      console.warn("Could not attach pharmacy listener:", e);
    }
  },

  /**
   * Updates pharmacy profile in Cloud Firestore
   */
  async savePharmacyProfile(pharmacyId, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update local state immediately for fast response
    pharmacyState.updateProfile(updatedData);

    if (db && isRealFirebaseConfigured && pharmacyId) {
      try {
        const docRef = doc(db, 'pharmacies', pharmacyId);
        await setDoc(docRef, updatedData, { merge: true });
        return { success: true };
      } catch (err) {
        console.warn("Failed to write pharmacy to Firestore:", err);
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  },

  destroy() {
    if (unsubscribeListener) {
      unsubscribeListener();
      unsubscribeListener = null;
    }
  }
};
