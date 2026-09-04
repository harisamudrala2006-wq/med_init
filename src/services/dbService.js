// Unified Database & Real-Time Firestore Orchestrator Service
// Bridges frontend views with real-time Cloud Firestore listeners (onSnapshot) and batched persistence.
import { db, isRealFirebaseConfigured } from '../config/firebase.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  where, 
  writeBatch 
} from 'firebase/firestore';
import { pharmacyState } from '../context/pharmacyState.js';
import { authService } from './authService.js';
import { distributorService } from './distributorService.js';
import { billService } from './billService.js';
import { paymentService } from './paymentService.js';
import { inventoryService } from './inventoryService.js';
import { priceAlertService } from './priceAlertService.js';
import { notificationService } from './notificationService.js';
import { auditService } from './auditService.js';

const STORAGE_PREFIX = 'medi_db_';
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

// Seed Data for Initial Pharmacy Setup
const SEED_DISTRIBUTORS = [
  {
    id: "dist_abc_pharma",
    name: "ABC Pharma Distributors Ltd.",
    gstin: "37AABCA1234F1Z0",
    dlNumber: "20B/21B-TG-2019",
    contactPerson: "Rajesh Kumar",
    phone: "+91 98480 22334",
    email: "orders@abcpharma.com",
    address: "Plot 12, Industrial Estate, Vijayawada Central",
    paymentTerms: "Net 15 Days",
    createdAt: "2024-01-10T10:00:00Z"
  },
  {
    id: "dist_apex_medilink",
    name: "Apex Medilink Lifecare LLP",
    gstin: "37AAPEX9876E1Z5",
    dlNumber: "20B/21B-AP-2021",
    contactPerson: "V. Srinivas",
    phone: "+91 94401 55678",
    email: "billing@apexmedilink.in",
    address: "D.No 4-55, Wholesale Market, Guntur",
    paymentTerms: "Net 21 Days",
    createdAt: "2024-02-15T11:30:00Z"
  },
  {
    id: "dist_sterling_health",
    name: "Sterling Healthcare Supply Co.",
    gstin: "37ASTLH4321D1ZQ",
    dlNumber: "20B/21B-TG-2020",
    contactPerson: "K. Mohan",
    phone: "+91 97003 44112",
    email: "dispatch@sterlinghealth.com",
    address: "Autonagar Industrial Hub, Visakhapatnam",
    paymentTerms: "Net 7 Days",
    createdAt: "2024-03-01T09:15:00Z"
  },
  {
    id: "dist_cipla_depot",
    name: "Cipla Authorized Depot",
    gstin: "37ACIPD5678K1ZR",
    dlNumber: "20B/21B-AP-2018",
    contactPerson: "Anand Reddy",
    phone: "+91 98850 88990",
    email: "depot.ap@cipla.com",
    address: "Pharma City, Parawada, Visakhapatnam",
    paymentTerms: "Net 30 Days",
    createdAt: "2024-01-05T08:00:00Z"
  }
];

const SEED_PRODUCTS = [
  {
    id: "prod_aug_625",
    name: "Augmentin 625 Duo Tablet",
    genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    manufacturer: "GSK Pharmaceuticals Ltd",
    category: "Antibiotic",
    hsnCode: "300410",
    gstRate: 12,
    defaultPackSize: "10 Tablets"
  },
  {
    id: "prod_pan_d",
    name: "Pan-D Capsule",
    genericSalt: "Pantoprazole (40mg) + Domperidone (30mg)",
    manufacturer: "Alkem Laboratories",
    category: "Gastrointestinal",
    hsnCode: "300490",
    gstRate: 12,
    defaultPackSize: "15 Capsules"
  },
  {
    id: "prod_dolo_650",
    name: "Dolo 650 Tablet",
    genericSalt: "Paracetamol (650mg)",
    manufacturer: "Micro Labs Ltd",
    category: "Analgesic / Antipyretic",
    hsnCode: "300490",
    gstRate: 12,
    defaultPackSize: "15 Tablets"
  },
  {
    id: "prod_azith_500",
    name: "Azithral 500 Tablet",
    genericSalt: "Azithromycin (500mg)",
    manufacturer: "Alembic Pharmaceuticals",
    category: "Antibiotic",
    hsnCode: "300420",
    gstRate: 12,
    defaultPackSize: "5 Tablets"
  },
  {
    id: "prod_glyc_m",
    name: "Glycomet-GP 2 Forte Tablet",
    genericSalt: "Glimepiride (2mg) + Metformin (1000mg)",
    manufacturer: "USV Ltd",
    category: "Antidiabetic",
    hsnCode: "300490",
    gstRate: 12,
    defaultPackSize: "15 Tablets"
  }
];

const SEED_PURCHASE_BILLS = [
  {
    id: "bill_inv_8891",
    distributorId: "dist_abc_pharma",
    distributorName: "ABC Pharma Distributors Ltd.",
    invoiceNumber: "INV-2024-8891",
    invoiceDate: "2024-10-24",
    items: [
      {
        productId: "prod_aug_625",
        productName: "Augmentin 625 Duo Tablet",
        genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
        batchNumber: "AUG-2490",
        expiryDate: "2026-11-30",
        quantity: 10,
        packSize: "10 Tabs",
        purchaseRate: 142.50,
        discount: 5.0,
        gstRate: 12,
        taxableValue: 1353.75,
        total: 1516.20
      },
      {
        productId: "prod_pan_d",
        productName: "Pan-D Capsule",
        genericSalt: "Pantoprazole (40mg) + Domperidone (30mg)",
        batchNumber: "PND-9921",
        expiryDate: "2026-08-31",
        quantity: 20,
        packSize: "15 Caps",
        purchaseRate: 110.00,
        discount: 4.0,
        gstRate: 12,
        taxableValue: 2112.00,
        total: 2365.44
      }
    ],
    subtotal: 3465.75,
    cgst: 207.95,
    sgst: 207.95,
    igst: 0,
    totalTax: 415.90,
    grandTotal: 3881.65,
    status: "verified",
    notes: "Verified delivery against PO #8891",
    createdAt: "2024-10-24T14:20:00Z"
  }
];

const SEED_PAYMENTS = [
  {
    id: "pay_rec_4401",
    distributorId: "dist_abc_pharma",
    distributorName: "ABC Pharma Distributors Ltd.",
    amount: 3881.65,
    paymentDate: "2024-10-25",
    paymentMethod: "upi",
    referenceNumber: "UPI-9923884100",
    status: "verified",
    notes: "Full payment for Bill INV-2024-8891",
    createdAt: "2024-10-25T11:00:00Z"
  }
];

class DatabaseService {
  constructor() {
    this.listeners = new Set();
    this.activeUnsubscribers = [];
    this.initStorage();
    this.initFirestoreSync();

    // Re-sync with Firestore whenever authenticated pharmacy changes
    authService.subscribe((user) => {
      this.initFirestoreSync();
    });
  }

  get activePharmacyId() {
    return authService.user?.pharmacyId || pharmacyState.profile.id || 'pharmacy_sri_maheswari';
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_PREFIX + 'distributors')) {
      localStorage.setItem(STORAGE_PREFIX + 'distributors', JSON.stringify(SEED_DISTRIBUTORS));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'products')) {
      localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'purchaseBills')) {
      localStorage.setItem(STORAGE_PREFIX + 'purchaseBills', JSON.stringify(SEED_PURCHASE_BILLS));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'payments')) {
      localStorage.setItem(STORAGE_PREFIX + 'payments', JSON.stringify(SEED_PAYMENTS));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'batches')) {
      localStorage.setItem(STORAGE_PREFIX + 'batches', JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'receipts')) {
      localStorage.setItem(STORAGE_PREFIX + 'receipts', JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'auditLogs')) {
      localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'adjustments')) {
      localStorage.setItem(STORAGE_PREFIX + 'adjustments', JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'priceAlerts')) {
      localStorage.setItem(STORAGE_PREFIX + 'priceAlerts', JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'notifications')) {
      localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify([]));
    }
  }

  /**
   * Subscribes to real-time Cloud Firestore updates via onSnapshot
   */
  initFirestoreSync() {
    if (!db || !isRealFirebaseConfigured) return;

    // Clean up any existing listeners
    this.activeUnsubscribers.forEach(unsub => {
      try { unsub(); } catch (e) {}
    });
    this.activeUnsubscribers = [];

    const pharmacyId = this.activePharmacyId;

    COLLECTIONS.forEach(collectionName => {
      try {
        const colRef = collection(db, collectionName);
        // Scoped by pharmacyId to ensure multi-tenant isolation
        const q = query(colRef, where('pharmacyId', '==', pharmacyId));

        const unsub = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            // First time this pharmacy accesses this collection: seed to Firestore if distributors or products
            const local = this.getCollection(collectionName);
            if (local && local.length > 0) {
              local.forEach(item => this.saveToFirestore(collectionName, item));
            }
            return;
          }

          const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          localStorage.setItem(STORAGE_PREFIX + collectionName, JSON.stringify(items));
          this.notify();
        }, (err) => {
          console.warn(`Firestore real-time sync for ${collectionName}:`, err);
        });

        this.activeUnsubscribers.push(unsub);
      } catch (err) {
        console.warn(`Could not attach listener for ${collectionName}:`, err);
      }
    });
  }

  getCollection(name) {
    try {
      const data = localStorage.getItem(STORAGE_PREFIX + name);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn(`Error reading collection ${name}:`, e);
      return [];
    }
  }

  saveCollection(name, items) {
    try {
      localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(items));
      this.notify();
    } catch (e) {
      console.warn(`Error writing collection ${name}:`, e);
    }
  }

  async saveToFirestore(collectionName, item) {
    if (!db || !isRealFirebaseConfigured || !item || !item.id) return;
    try {
      const docRef = doc(db, collectionName, String(item.id));
      const payload = {
        ...item,
        pharmacyId: item.pharmacyId || this.activePharmacyId,
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, payload, { merge: true });
    } catch (e) {
      console.warn(`Firestore setDoc error for ${collectionName}/${item.id}:`, e);
    }
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
    return this.getCollection('distributors');
  }

  getDistributorById(id) {
    return this.getDistributors().find(d => d.id === id);
  }

  addDistributor(distributor) {
    const list = this.getDistributors();
    const newDist = {
      ...distributor,
      id: distributor.id || `dist_${Date.now()}`,
      pharmacyId: this.activePharmacyId,
      createdAt: distributor.createdAt || new Date().toISOString()
    };
    list.unshift(newDist);
    this.saveCollection('distributors', list);
    this.saveToFirestore('distributors', newDist);

    this.logAudit("Distributor Added", "distributors", newDist.id, `Added distributor: ${newDist.name}`);
    return newDist;
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
  // PURCHASE BILLS & OCR
  // ==========================================
  getPurchaseBills() {
    return this.getCollection('purchaseBills');
  }

  getPurchaseBillById(id) {
    return this.getPurchaseBills().find(b => b.id === id);
  }

  checkDuplicateBill(distributorId, invoiceNumber) {
    return billService.checkDuplicate(this.getPurchaseBills(), distributorId, invoiceNumber);
  }

  savePurchaseBill(billData) {
    const bills = this.getPurchaseBills();
    const newBill = {
      ...billData,
      id: billData.id || `bill_${Date.now()}`,
      pharmacyId: this.activePharmacyId,
      createdAt: billData.createdAt || new Date().toISOString()
    };

    const existingIndex = bills.findIndex(b => b.id === newBill.id);
    if (existingIndex >= 0) {
      bills[existingIndex] = newBill;
    } else {
      bills.unshift(newBill);
    }

    this.saveCollection('purchaseBills', bills);
    this.saveToFirestore('purchaseBills', newBill);

    // If verified, update inventory batches & check price alerts automatically
    if (newBill.status === 'verified') {
      this.syncBillItemsToInventory(newBill);
    }

    this.logAudit(
      existingIndex >= 0 ? "Bill Updated" : "Bill Created",
      "purchaseBills",
      newBill.id,
      `Invoice #${newBill.invoiceNumber} for ${newBill.distributorName} (${newBill.status})`
    );

    return newBill;
  }

  // ==========================================
  // PAYMENTS & RECEIPTS
  // ==========================================
  getPayments() {
    return this.getCollection('payments');
  }

  savePayment(paymentData) {
    const payments = this.getPayments();
    const newPayment = {
      ...paymentData,
      id: paymentData.id || `pay_${Date.now()}`,
      pharmacyId: this.activePharmacyId,
      status: paymentData.status || 'verified',
      createdAt: paymentData.createdAt || new Date().toISOString()
    };

    payments.unshift(newPayment);
    this.saveCollection('payments', payments);
    this.saveToFirestore('payments', newPayment);

    this.logAudit(
      "Payment Recorded",
      "payments",
      newPayment.id,
      `₹${Number(newPayment.amount).toFixed(2)} to ${newPayment.distributorName} via ${newPayment.paymentMethod.toUpperCase()}`
    );

    return newPayment;
  }

  // ==========================================
  // INVENTORY & BATCH TRACKING
  // ==========================================
  syncBillItemsToInventory(bill) {
    const products = this.getCollection('products');
    let batches = this.getCollection('batches') || [];

    (bill.items || []).forEach(item => {
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
          defaultPackSize: item.packSize || "10 Units"
        };
        products.push(product);
        this.saveToFirestore('products', product);
      }

      // Check for price anomaly
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
        this.saveToFirestore('batches', existingBatch);
      } else {
        const newBatch = {
          id: batchId,
          pharmacyId: this.activePharmacyId,
          productId: product.id,
          productName: item.productName,
          genericSalt: product.genericSalt,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          packSize: item.packSize,
          quantityInUnits: Number(item.quantity) * 10,
          purchaseRate: Number(item.purchaseRate),
          mrp: Number(item.purchaseRate) * 1.25,
          distributorId: bill.distributorId,
          distributorName: bill.distributorName,
          billId: bill.id,
          createdAt: new Date().toISOString()
        };
        batches.unshift(newBatch);
        this.saveToFirestore('batches', newBatch);
      }
    });

    this.saveCollection('products', products);
    this.saveCollection('batches', batches);
  }

  getBatches() {
    let batches = this.getCollection('batches');
    if (!batches || batches.length === 0) {
      const bills = this.getPurchaseBills().filter(b => b.status === 'verified');
      batches = [];
      bills.forEach(bill => {
        (bill.items || []).forEach(item => {
          batches.push({
            id: `batch_${item.batchNumber}`,
            pharmacyId: this.activePharmacyId,
            productName: item.productName,
            genericSalt: item.genericSalt || "Active Pharmaceutical Ingredient",
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            packSize: item.packSize || "10 Tabs",
            quantityInUnits: (item.quantity || 10) * 10,
            purchaseRate: item.purchaseRate,
            mrp: (item.purchaseRate * 1.25).toFixed(2),
            distributorId: bill.distributorId,
            distributorName: bill.distributorName,
            billId: bill.id
          });
        });
      });
      this.saveCollection('batches', batches);
    }
    return batches;
  }

  adjustInventory(batchId, quantityChange, reason, notes = '') {
    const batches = this.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return false;

    const oldQty = batch.quantityInUnits;
    batch.quantityInUnits = Math.max(0, batch.quantityInUnits + Number(quantityChange));

    const adjustments = this.getCollection('adjustments');
    const adjRecord = {
      id: `adj_${Date.now()}`,
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

    adjustments.unshift(adjRecord);
    this.saveCollection('batches', batches);
    this.saveCollection('adjustments', adjustments);

    this.saveToFirestore('batches', batch);
    this.saveToFirestore('adjustments', adjRecord);

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
    return this.getCollection('priceAlerts');
  }

  getPriceAnomalies() {
    return this.getPriceAlerts();
  }

  addPriceAlert(alertData) {
    const alerts = this.getPriceAlerts();
    const newAlert = {
      ...alertData,
      id: alertData.id || `alert_${Date.now()}`,
      pharmacyId: this.activePharmacyId,
      createdAt: new Date().toISOString()
    };
    alerts.unshift(newAlert);
    this.saveCollection('priceAlerts', alerts);
    this.saveToFirestore('priceAlerts', newAlert);
    return newAlert;
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications() {
    return this.getCollection('notifications');
  }

  markNotificationAsRead(notificationId) {
    const notifications = this.getNotifications();
    const notif = notifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      this.saveCollection('notifications', notifications);
      this.saveToFirestore('notifications', notif);
    }
  }

  // ==========================================
  // REVIEW CENTER AGGREGATION
  // ==========================================
  getReviewCenterItems() {
    const items = [];

    // 1. Bills Needing Verification
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
  // AUDIT LOGS
  // ==========================================
  getAuditLogs() {
    return this.getCollection('auditLogs');
  }

  logAudit(action, entity, entityId, details) {
    const logs = this.getAuditLogs();
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

    logs.unshift(newLog);
    this.saveCollection('auditLogs', logs);
    this.saveToFirestore('auditLogs', newLog);
    return newLog;
  }
}

export const dbService = new DatabaseService();
