// Payment Processing Service
// Handles payments, allocations against bills, and ledger updates
import { db, isRealFirebaseConfigured } from '../config/firebase.js';

export const paymentService = {
  /**
   * Generates a reference number for transactions if not provided
   */
  generateReferenceNumber(method = 'upi') {
    const prefix = method.toUpperCase().slice(0, 3);
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${rand}`;
  },

  /**
   * Automatically allocates payment amount against unpaid/partially paid bills
   */
  allocatePayment(amount, unpaidBills = []) {
    let remainingAmount = Number(amount || 0);
    const allocations = [];

    for (const bill of unpaidBills) {
      if (remainingAmount <= 0) break;
      const billRemaining = Math.max(0, Number(bill.grandTotal || 0) - Number(bill.paidAmount || 0));
      if (billRemaining > 0) {
        const allocated = Math.min(remainingAmount, billRemaining);
        allocations.push({
          billId: bill.id,
          invoiceNumber: bill.invoiceNumber,
          amount: allocated
        });
        remainingAmount -= allocated;
      }
    }

    return {
      allocations,
      unallocatedCredit: Math.max(0, remainingAmount)
    };
  }
};
