// Dynamic Pharmacy Profile State (Phase 4)
// Stores and syncs the active pharmacy configuration.
// Default sample is "Sri Maheswari Medical" / "Sri Balaji Pharmacy".

const DEFAULT_PROFILE = {
  id: "pharmacy_sri_maheswari",
  name: "Sri Maheswari Medical",
  subName: "Sri Balaji Pharmacy Group",
  logoUrl: "https://lh3.googleusercontent.com/aida/AEtjO1UJX0m_oJsrGXsjCW2mNCk1U7pLF8i5fwWLBEJhMzQzSJzPXAJXHz8w3y4pu5cUbP8YKoR9VxJJOnPDppm2iYUrl3PFngg4FN6nDgxshozO7ttJdr0uZ_HztSbu2NhkCBA_rOwCje5-iInw96w6075e6C16-CaX7T9xw0L2caCHq4n4bKkD9qT3klfOPUwzsdWRYl6ID3TjRctiv_u52N1eMc1UfRmpP7H1NwatndtZirZgAJksjyfbzcA",
  address: "Shop #4, Main Road, Near Bus Stand, Andhra Pradesh",
  phone: "+91 98490 12345",
  email: "admin@srimaheswari.in",
  gstin: "37AABCS9603R1ZM",
  drugLicense: "20B/21B-AP-2023-8812",
  defaultLanguage: "en",
  themePreference: "light",
  posNode: "DISPENSARY POS-NODE #04",
  shiftInfo: "Reconciled Shift Active • Till #02",
  enableExpiryAlerts: true,
  enablePriceAlerts: true,
  enablePaymentReminders: true
};

let currentProfile = { ...DEFAULT_PROFILE };

// Load persisted configuration from localStorage if available
try {
  const saved = localStorage.getItem('medi_pharmacy_profile');
  if (saved) {
    currentProfile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
  }
} catch (e) {
  console.warn("Could not load stored pharmacy profile:", e);
}

const listeners = new Set();

export const pharmacyState = {
  get profile() {
    return currentProfile;
  },

  updateProfile(updates) {
    currentProfile = { ...currentProfile, ...updates };
    try {
      localStorage.setItem('medi_pharmacy_profile', JSON.stringify(currentProfile));
    } catch (e) {
      console.warn("Could not save pharmacy profile to storage:", e);
    }
    listeners.forEach(fn => fn(currentProfile));
  },

  resetDefaults() {
    this.updateProfile(DEFAULT_PROFILE);
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
