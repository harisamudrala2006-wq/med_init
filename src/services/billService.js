// Purchase Bill Management Service
// Handles bill persistence, duplicate detection, and verification workflow
import { db, isRealFirebaseConfigured } from '../config/firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';

export const billService = {
  /**
   * Checks for duplicate bills in the database
   */
  checkDuplicate(existingBills = [], distributorId, invoiceNumber) {
    if (!distributorId || !invoiceNumber) return null;
    const cleanNum = invoiceNumber.trim().toLowerCase();
    return existingBills.find(
      b => b.distributorId === distributorId && 
           b.invoiceNumber && 
           b.invoiceNumber.trim().toLowerCase() === cleanNum
    ) || null;
  },

  /**
   * Generates a unique invoice number if not provided
   */
  generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${year}-${rand}`;
  },

  /**
   * Computes totals (subtotal, tax, grandTotal) for bill line items
   */
  computeBillTotals(items = []) {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    items.forEach(it => {
      const lineQty = Number(it.quantity || 0);
      const lineRate = Number(it.purchaseRate || 0);
      const lineDisc = Number(it.discount || 0);
      const lineGst = Number(it.gstRate || 12);

      const taxable = lineQty * lineRate * (1 - lineDisc / 100);
      const taxAmount = taxable * (lineGst / 100);

      subtotal += taxable;
      cgst += taxAmount / 2;
      sgst += taxAmount / 2;
    });

    const totalTax = cgst + sgst + igst;
    const grandTotal = subtotal + totalTax;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2))
    };
  }
};
