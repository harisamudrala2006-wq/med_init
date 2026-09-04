// Real Cloud Firestore Database & Orchestrator Service
// Single source of truth in Firebase Cloud Firestore. Zero localStorage business data.
import { db, isRealFirebaseConfigured } from '../config/firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy,
  writeBatch 
} from 'firebase/firestore';
import { pharmacyState } from '../context/pharmacyState.js';
import { authService } from './authService.js';
import { distributorService } from './distributorService.js';
import { billService } from './billService.js';
import { priceAlertService } from './priceAlertService.js';
import { inventoryService } from './inventoryService.js';
import { auditService } from './auditService.js';

const COLLECTIONS = [
  'distributors', 
  'products', 
  'batches', 
  'purchaseBills', 
  'payments', 
  'receipts',
  'adjustments', 
  'priceAlerts', 
  'notifications', 
  'auditLogs'
];

class DatabaseService {
  constructor() {
    this.listeners = new Set();
    this.activeUnsubscribers = [];
    this.isInitialized = false;

    // Reactive in-memory cache populated directly from Cloud Firestore onSnapshot
    this.cache = {
      distributors: [],
      products: [],
      batches: [],
      purchaseBills: [],
      payments: [],
      receipts: [],
      adjustments: [],
      priceAlerts: [],
      notifications: [],
      auditLogs: []
    };

    // Attach Firestore listeners immediately
    this.initFirestoreSync();

    // Re-synchronize whenever authenticated user or pharmacy changes
    authService.subscribe(() => {
      this.initFirestoreSync();
    });
  }

  get activePharmacyId() {
    return authService.user?.pharmacyId || pharmacyState.profile.id || 'pharmacy_sri_maheswari';
  }

  /**
   * Initializes real-time Firestore listeners (onSnapshot) for all collections scoped by pharmacyId
   */
  initFirestoreSync() {
    // Unsubscribe previous listeners
    this.activeUnsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.activeUnsubscribers = [];

    if (!db || !isRealFirebaseConfigured) return;

    const pharmacyId = this.activePharmacyId;

    COLLECTIONS.forEach(collectionName => {
      try {
        const colRef = collection(db, collectionName);
        const q = query(colRef, where('pharmacyId', '==', pharmacyId));

        const unsub = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            this.cache[collectionName] = [];
          } else {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            this.cache[collectionName] = items;
          }

          this.isInitialized = true;
          this.notify();
        }, (err) => {
          console.warn(`Firestore onSnapshot listener for ${collectionName}:`, err);
        });

        this.activeUnsubscribers.push(unsub);
      } catch (err) {
        console.warn(`Failed to connect listener for ${collectionName}:`, err);
      }
    });
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // ==========================================
  // DISTRIBUTORS
  // ==========================================
  getDistributors() {
    return [...this.cache.distributors];
  }

  getDistributorById(id) {
    return this.cache.distributors.find(d => d.id === id);
  }

  async addDistributor(distributor) {
    const id = distributor.id || `dist_${Date.now()}`;
    const newDist = {
      ...distributor,
      id,
      pharmacyId: this.activePharmacyId,
      createdAt: distributor.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Optimistically update cache
    this.cache.distributors.unshift(newDist);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        const docRef = doc(db, 'distributors', id);
        await setDoc(docRef, newDist);
      } catch (err) {
        console.error("Firestore error saving distributor:", err);
      }
    }

    this.logAudit("Distributor Added", "distributors", id, `Added distributor: ${newDist.name}`);
    return newDist;
  }

  async deleteDistributor(distributorId) {
    const dist = this.cache.distributors.find(d => d.id === distributorId);
    if (!dist) return false;

    this.cache.distributors = this.cache.distributors.filter(d => d.id !== distributorId);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'distributors', distributorId));
      } catch (err) {
        console.error("Firestore error deleting distributor:", err);
      }
    }

    this.logAudit(
      "Distributor Deleted",
      "distributors",
      distributorId,
      `Deleted distributor: ${dist.name}`
    );
    return true;
  }

  // ==========================================
  // FINANCIAL LEDGER (Single Source of Truth)
  // Outstanding = Sum(Verified Purchases) - Sum(Verified Payments)
  // ==========================================
  getDistributorFinances(distributorId) {
    const verifiedBills = this.getPurchaseBills().filter(b => b.status === 'verified');
    const verifiedPayments = this.getPayments().filter(p => p.status === 'verified');
    return distributorService.calculateLedger(distributorId, verifiedBills, verifiedPayments);
  }

  getOverallFinances() {
    const verifiedBills = this.getPurchaseBills().filter(b => b.status === 'verified');
    const verifiedPayments = this.getPayments().filter(p => p.status === 'verified');
    const pendingBills = this.getPurchaseBills().filter(b => b.status === 'needs_verification');
    const expiringBatches = this.getExpiringBatches(60);

    return distributorService.calculateOverallFinances(
      verifiedBills, 
      verifiedPayments, 
      pendingBills, 
      expiringBatches
    );
  }

  // ==========================================
  // PURCHASE BILLS & INVOICES
  // ==========================================
  getPurchaseBills() {
    return [...this.cache.purchaseBills];
  }

  getPurchaseBillById(id) {
    return this.cache.purchaseBills.find(b => b.id === id);
  }

  checkDuplicateBill(distributorId, invoiceNumber) {
    return billService.checkDuplicate(this.getPurchaseBills(), distributorId, invoiceNumber);
  }

  async savePurchaseBill(billData) {
    const id = billData.id || `bill_${Date.now()}`;
    const newBill = {
      ...billData,
      id,
      pharmacyId: this.activePharmacyId,
      createdAt: billData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = this.cache.purchaseBills.findIndex(b => b.id === id);
    if (existingIndex >= 0) {
      this.cache.purchaseBills[existingIndex] = newBill;
    } else {
      this.cache.purchaseBills.unshift(newBill);
    }
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        const docRef = doc(db, 'purchaseBills', id);
        await setDoc(docRef, newBill, { merge: true });
      } catch (err) {
        console.error("Firestore error saving purchase bill:", err);
      }
    }

    // If bill is verified, synchronize items to batch-level inventory
    if (newBill.status === 'verified') {
      await this.syncBillItemsToInventory(newBill);
    }

    this.logAudit(
      existingIndex >= 0 ? "Bill Updated" : "Bill Created",
      "purchaseBills",
      newBill.id,
      `Invoice #${newBill.invoiceNumber} for ${newBill.distributorName} (${newBill.status})`
    );

    return newBill;
  }

  async deletePurchaseBill(billId) {
    const bill = this.cache.purchaseBills.find(b => b.id === billId);
    if (!bill) return false;

    // Remove from cache
    this.cache.purchaseBills = this.cache.purchaseBills.filter(b => b.id !== billId);
    // Also remove associated batches
    this.cache.batches = this.cache.batches.filter(b => b.billId !== billId);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'purchaseBills', billId));
        // Delete associated batches in Firestore
        const batchQuery = query(collection(db, 'batches'), where('billId', '==', billId));
        const batchSnap = await getDocs(batchQuery);
        const wb = writeBatch(db);
        batchSnap.docs.forEach(d => wb.delete(d.ref));
        await wb.commit();
      } catch (err) {
        console.error("Firestore error deleting bill:", err);
      }
    }

    this.logAudit(
      "Purchase Bill Deleted",
      "purchaseBills",
      billId,
      `Deleted Invoice #${bill.invoiceNumber} for ${bill.distributorName}`
    );
    return true;
  }

  // ==========================================
  // PAYMENTS & RECEIPTS
  // ==========================================
  getPayments() {
    return [...this.cache.payments];
  }

  async savePayment(paymentData) {
    const id = paymentData.id || `pay_${Date.now()}`;
    const newPayment = {
      ...paymentData,
      id,
      pharmacyId: this.activePharmacyId,
      status: paymentData.status || 'verified',
      createdAt: paymentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.cache.payments.unshift(newPayment);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        const docRef = doc(db, 'payments', id);
        await setDoc(docRef, newPayment);
      } catch (err) {
        console.error("Firestore error saving payment:", err);
      }
    }

    this.logAudit(
      "Payment Recorded",
      "payments",
      id,
      `₹${Number(newPayment.amount).toFixed(2)} to ${newPayment.distributorName} via ${newPayment.paymentMethod.toUpperCase()}`
    );

    return newPayment;
  }

  // ==========================================
  // INVENTORY & BATCH TRACKING
  // ==========================================
  getBatches() {
    return [...this.cache.batches];
  }

  async syncBillItemsToInventory(bill) {
    const products = [...this.cache.products];
    const batches = [...this.cache.batches];

    for (const item of (bill.items || [])) {
      // Find or create product
      let product = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
      if (!product) {
        product = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          pharmacyId: this.activePharmacyId,
          name: item.productName,
          genericSalt: item.genericSalt || "Essential Medicine Salt",
          category: "Prescription",
          gstRate: item.gstRate || 12,
          defaultPackSize: item.packSize || "10 Units",
          createdAt: new Date().toISOString()
        };
        products.push(product);
        if (db && isRealFirebaseConfigured) {
          setDoc(doc(db, 'products', product.id), product).catch(console.warn);
        }
      }

      // Check for price anomaly against purchase rate history
      const priceAlert = priceAlertService.detectPriceDifference(item, batches);
      if (priceAlert) {
        this.addPriceAlert({
          ...priceAlert,
          billId: bill.id,
          distributorId: bill.distributorId,
          distributorName: bill.distributorName
        });
      }

      // Add or update batch
      const batchId = `batch_${item.batchNumber.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const existingBatch = batches.find(b => b.id === batchId);

      if (existingBatch) {
        existingBatch.quantityInUnits += (Number(item.quantity) * 10);
        existingBatch.purchaseRate = Number(item.purchaseRate);
        existingBatch.distributorId = bill.distributorId;
        existingBatch.distributorName = bill.distributorName;
        existingBatch.expiryDate = item.expiryDate;
        existingBatch.updatedAt = new Date().toISOString();

        if (db && isRealFirebaseConfigured) {
          setDoc(doc(db, 'batches', batchId), existingBatch, { merge: true }).catch(console.warn);
        }
      } else {
        const newBatch = {
          id: batchId,
          pharmacyId: this.activePharmacyId,
          productId: product.id,
          productName: item.productName,
          genericSalt: product.genericSalt,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          packSize: item.packSize || "10 Tabs",
          quantityInUnits: Number(item.quantity) * 10,
          purchaseRate: Number(item.purchaseRate),
          mrp: Number(item.purchaseRate) * 1.25,
          distributorId: bill.distributorId,
          distributorName: bill.distributorName,
          billId: bill.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batches.unshift(newBatch);
        if (db && isRealFirebaseConfigured) {
          setDoc(doc(db, 'batches', batchId), newBatch).catch(console.warn);
        }
      }
    }

    this.cache.products = products;
    this.cache.batches = batches;
    this.notify();
  }

  async adjustInventory(batchId, quantityChange, reason, notes = '') {
    const batch = this.cache.batches.find(b => b.id === batchId);
    if (!batch) return false;

    const oldQty = batch.quantityInUnits;
    batch.quantityInUnits = Math.max(0, batch.quantityInUnits + Number(quantityChange));
    batch.updatedAt = new Date().toISOString();

    const adjId = `adj_${Date.now()}`;
    const adjRecord = {
      id: adjId,
      pharmacyId: this.activePharmacyId,
      batchId,
      productName: batch.productName,
      batchNumber: batch.batchNumber,
      oldQty,
      newQty: batch.quantityInUnits,
      quantityChange: Number(quantityChange),
      reason, // 'Damaged' | 'Expired' | 'Lost' | 'Stock Correction' | 'Manual Addition'
      notes,
      userId: authService.user?.uid || "usr_system",
      userName: authService.user?.fullName || "Pharmacist",
      createdAt: new Date().toISOString()
    };

    this.cache.adjustments.unshift(adjRecord);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'batches', batchId), batch, { merge: true });
        await setDoc(doc(db, 'adjustments', adjId), adjRecord);
      } catch (err) {
        console.error("Firestore error updating inventory adjustment:", err);
      }
    }

    this.logAudit(
      "Inventory Adjusted",
      "batches",
      batchId,
      `${batch.productName} (Batch ${batch.batchNumber}): ${quantityChange > 0 ? '+' : ''}${quantityChange} units (${reason})`
    );

    return true;
  }

  getExpiringBatches(days = 60) {
    return inventoryService.filterBatchesByExpiry(this.getBatches(), days);
  }

  // ==========================================
  // PRICE ALERTS & ANOMALIES
  // ==========================================
  getPriceAlerts() {
    return [...this.cache.priceAlerts];
  }

  getPriceAnomalies() {
    return this.getPriceAlerts();
  }

  async addPriceAlert(alertData) {
    const id = alertData.id || `alert_${Date.now()}`;
    const newAlert = {
      ...alertData,
      id,
      pharmacyId: this.activePharmacyId,
      createdAt: new Date().toISOString()
    };

    this.cache.priceAlerts.unshift(newAlert);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'priceAlerts', id), newAlert);
      } catch (err) {
        console.warn("Error saving price alert:", err);
      }
    }

    return newAlert;
  }

  // ==========================================
  // NOTIFICATIONS (Real-Time In-App Bell)
  // ==========================================
  getNotifications() {
    const notifs = [...this.cache.notifications];
    
    // Supplement with any expiring batches <= 90 days that may not yet be persisted by scheduled job
    const expiringBatches = this.getExpiringBatches(90);
    expiringBatches.forEach(b => {
      const existing = notifs.find(n => n.batchId === b.id || n.id === `notif_exp_${b.id}`);
      if (!existing) {
        const today = new Date();
        const exp = new Date(b.expiryDate);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        let threshold = '90_days';
        let severity = 'info';
        if (diffDays <= 0) {
          threshold = 'expired';
          severity = 'error';
        } else if (diffDays <= 7) {
          threshold = '7_days';
          severity = 'error';
        } else if (diffDays <= 30) {
          threshold = '30_days';
          severity = 'warning';
        }
        notifs.push({
          id: `notif_exp_${b.id}`,
          pharmacyId: this.activePharmacyId,
          batchId: b.id,
          productName: b.productName,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          daysLeft: diffDays,
          threshold,
          severity,
          title: diffDays <= 0 ? `BATCH EXPIRED: ${b.productName}` : `Expiry Reminder (${diffDays}d left): ${b.productName}`,
          message: `Batch #${b.batchNumber} (${b.quantityInUnits || 0} units left) expires on ${b.expiryDate}.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    return notifs.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return (a.daysLeft ?? 999) - (b.daysLeft ?? 999);
    });
  }

  async markNotificationAsRead(notificationId) {
    const notif = this.cache.notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      this.notify();

      if (db && isRealFirebaseConfigured) {
        try {
          await updateDoc(doc(db, 'notifications', notificationId), {
            isRead: true,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn("Failed to mark notification as read:", e);
        }
      }
    }
  }

  async markAllNotificationsAsRead() {
    const unread = this.getNotifications().filter(n => !n.isRead);
    unread.forEach(n => {
      n.isRead = true;
      const inCache = this.cache.notifications.find(c => c.id === n.id);
      if (inCache) inCache.isRead = true;
    });
    this.notify();

    if (db && isRealFirebaseConfigured && this.cache.notifications.some(n => !n.isRead)) {
      try {
        const batch = writeBatch(db);
        this.cache.notifications.filter(n => !n.isRead).forEach(n => {
          batch.update(doc(db, 'notifications', n.id), {
            isRead: true,
            updatedAt: new Date().toISOString()
          });
        });
        await batch.commit();
      } catch (e) {
        console.warn("Failed to mark all notifications as read in Firestore:", e);
      }
    }
  }

  // ==========================================
  // REVIEW CENTER AGGREGATION
  // ==========================================
  getReviewCenterItems() {
    const items = [];

    // 1. Unverified Invoices
    this.getPurchaseBills()
      .filter(b => b.status === 'needs_verification')
      .forEach(b => {
        items.push({
          id: `rev_bill_${b.id}`,
          type: 'bill_verification',
          title: `Verify Invoice #${b.invoiceNumber}`,
          subtitle: `${b.distributorName} • ₹${Number(b.grandTotal).toFixed(2)}`,
          targetTab: 'bills',
          route: 'bills',
          badge: 'Needs Review',
          urgency: 'high',
          severity: 'warning'
        });
      });

    // 2. Critical Expiry Batches (<30 days)
    this.getExpiringBatches(30).forEach(batch => {
      items.push({
        id: `rev_exp_${batch.id}`,
        type: 'expiry_alert',
        title: `Expiry Warning: ${batch.productName}`,
        subtitle: `Batch ${batch.batchNumber} expires on ${batch.expiryDate} (${batch.quantityInUnits} units left)`,
        targetTab: 'inventory',
        route: 'inventory',
        badge: 'Critical Expiry',
        urgency: 'high',
        severity: 'error'
      });
    });

    // 3. Price Anomalies
    this.getPriceAlerts().slice(0, 5).forEach(alert => {
      items.push({
        id: `rev_price_${alert.id}`,
        type: 'price_anomaly',
        title: alert.alertType || "Potential Price Anomaly",
        subtitle: alert.message,
        targetTab: 'bills',
        route: 'bills',
        badge: 'Price Anomaly',
        urgency: 'medium',
        severity: 'warning'
      });
    });

    return items;
  }

  // ==========================================
  // REGULATORY AUDIT LOGS
  // ==========================================
  getAuditLogs() {
    return [...this.cache.auditLogs];
  }

  async logAudit(action, entity, entityId, details) {
    const user = authService.user;
    const newLog = auditService.createAuditRecord({
      pharmacyId: this.activePharmacyId,
      userId: user?.uid || "usr_system",
      userName: user?.fullName || "Pharmacist",
      action,
      entity,
      entityId,
      details
    });

    this.cache.auditLogs.unshift(newLog);
    this.notify();

    if (db && isRealFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn("Failed to write audit log to Firestore:", err);
      }
    }

    return newLog;
  }
}

export const dbService = new DatabaseService();
