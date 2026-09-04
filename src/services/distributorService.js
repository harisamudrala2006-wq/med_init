// Distributor Service
// Dynamic Financial Ledger: Outstanding = Sum(Verified Purchases) - Sum(Verified Payments)
import { db, isRealFirebaseConfigured } from '../config/firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';

export const distributorService = {
  /**
   * Calculates dynamic ledger for a specific distributor using bills and payments
   */
  calculateLedger(distributorId, verifiedBills = [], verifiedPayments = []) {
    const distBills = verifiedBills.filter(b => b.distributorId === distributorId);
    const distPayments = verifiedPayments.filter(p => p.distributorId === distributorId);

    const totalPurchases = distBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const totalPaid = distPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const outstanding = Math.max(0, totalPurchases - totalPaid);

    return {
      totalPurchases,
      totalPaid,
      outstanding,
      billCount: distBills.length,
      paymentCount: distPayments.length,
      bills: distBills,
      payments: distPayments
    };
  },

  /**
   * Calculates overall finances across all distributors
   */
  calculateOverallFinances(verifiedBills = [], verifiedPayments = [], pendingBills = [], expiringBatches = []) {
    const totalPurchases = verifiedBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const totalPaid = verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalOutstanding = Math.max(0, totalPurchases - totalPaid);

    return {
      totalPurchases,
      totalPaid,
      totalOutstanding,
      invoiceCount: verifiedBills.length,
      pendingVerificationCount: pendingBills.length,
      expiringCount: expiringBatches.length
    };
  }
};
