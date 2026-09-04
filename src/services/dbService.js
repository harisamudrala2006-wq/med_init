// Unified Database Service - Single Source of Truth (Phase 21)
// All totals (Purchases, Paid, Outstanding, Expiry, Ledger) are computed dynamically.

import { pharmacyState } from '../context/pharmacyState.js';
import { authState } from '../context/authState.js';

const STORAGE_PREFIX = 'medi_db_';

// Initial Clinical Seed Data for Instant Readiness
const SEED_DISTRIBUTORS = [
  {
    id: "dist_abc_pharma",
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
    pharmacyId: "pharmacy_sri_maheswari",
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
      },
      {
        productId: "prod_dolo_650",
        productName: "Dolo 650 Tablet",
        genericSalt: "Paracetamol (650mg)",
        batchNumber: "DL-8832",
        expiryDate: "2025-04-15", // Expiring soon (<60 days)
        quantity: 50,
        packSize: "15 Tabs",
        purchaseRate: 24.50,
        discount: 2.0,
        gstRate: 12,
        taxableValue: 1200.50,
        total: 1344.56
      }
    ],
    subtotal: 4666.25,
    cgst: 260.00,
    sgst: 260.00,
    igst: 0,
    totalTax: 520.00,
    grandTotal: 5226.20,
    status: "verified",
    notes: "Regular monthly bulk order",
    createdAt: "2024-10-24T14:32:00Z"
  },
  {
    id: "bill_inv_9941",
    pharmacyId: "pharmacy_sri_maheswari",
    distributorId: "dist_apex_medilink",
    distributorName: "Apex Medilink Lifecare LLP",
    invoiceNumber: "INV-2024-9941",
    invoiceDate: "2024-10-18",
    items: [
      {
        productId: "prod_azith_500",
        productName: "Azithral 500 Tablet",
        genericSalt: "Azithromycin (500mg)",
        batchNumber: "AZ-4410",
        expiryDate: "2026-10-31",
        quantity: 30,
        packSize: "5 Tabs",
        purchaseRate: 72.00,
        discount: 3.0,
        gstRate: 12,
        taxableValue: 2095.20,
        total: 2346.62
      },
      {
        productId: "prod_glyc_m",
        productName: "Glycomet-GP 2 Forte Tablet",
        genericSalt: "Glimepiride (2mg) + Metformin (1000mg)",
        batchNumber: "GLY-3319",
        expiryDate: "2025-03-28", // Expiring very soon (<30 days)
        quantity: 25,
        packSize: "15 Tabs",
        purchaseRate: 128.00,
        discount: 5.0,
        gstRate: 12,
        taxableValue: 3040.00,
        total: 3404.80
      }
    ],
    subtotal: 5135.20,
    cgst: 308.11,
    sgst: 308.11,
    igst: 0,
    totalTax: 616.22,
    grandTotal: 5751.42,
    status: "verified",
    notes: "Urgent diabetic stock replenishment",
    createdAt: "2024-10-18T10:15:00Z"
  },
  {
    id: "bill_inv_cip_1102",
    pharmacyId: "pharmacy_sri_maheswari",
    distributorId: "dist_cipla_depot",
    distributorName: "Cipla Authorized Depot",
    invoiceNumber: "INV-1102",
    invoiceDate: "2024-10-22",
    items: [
      {
        productId: "prod_aug_625",
        productName: "Augmentin 625 Duo Tablet",
        genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
        batchNumber: "CP-AUG-01",
        expiryDate: "2027-01-31",
        quantity: 200,
        packSize: "10 Tabs",
        purchaseRate: 131.70, // Cheaper than ABC Pharma
        discount: 6.0,
        gstRate: 12,
        taxableValue: 24759.60,
        total: 27730.75
      }
    ],
    subtotal: 24759.60,
    cgst: 1485.58,
    sgst: 1485.58,
    igst: 0,
    totalTax: 2971.15,
    grandTotal: 27730.75,
    status: "verified",
    notes: "Direct depot quarterly dispatch",
    createdAt: "2024-10-22T16:00:00Z"
  },
  {
    id: "bill_inv_ocr_pending",
    pharmacyId: "pharmacy_sri_maheswari",
    distributorId: "dist_sterling_health",
    distributorName: "Sterling Healthcare Supply Co.",
    invoiceNumber: "INV-2024-7740",
    invoiceDate: "2024-10-25",
    items: [
      {
        productId: "prod_pan_d",
        productName: "Pan-D Capsule",
        genericSalt: "Pantoprazole (40mg) + Domperidone (30mg)",
        batchNumber: "PND-7701",
        expiryDate: "2026-12-31",
        quantity: 40,
        packSize: "15 Caps",
        purchaseRate: 112.00,
        discount: 3.0,
        gstRate: 12,
        taxableValue: 4345.60,
        total: 4867.07
      }
    ],
    subtotal: 4345.60,
    cgst: 260.74,
    sgst: 260.74,
    igst: 0,
    totalTax: 521.48,
    grandTotal: 4867.08,
    status: "needs_verification",
    notes: "Scanned via mobile camera; review required",
    createdAt: "2024-10-25T11:20:00Z"
  }
];

const SEED_PAYMENTS = [
  {
    id: "pay_rec_101",
    pharmacyId: "pharmacy_sri_maheswari",
    distributorId: "dist_abc_pharma",
    distributorName: "ABC Pharma Distributors Ltd.",
    amount: 3000.00,
    paymentDate: "2024-10-25",
    paymentMethod: "bank_transfer",
    referenceNumber: "HDFC-NEFT-991203",
    status: "verified",
    allocatedBills: [{ billId: "bill_inv_8891", allocatedAmount: 3000.00 }],
    receiptUrl: "https://example.com/receipt101.jpg",
    createdAt: "2024-10-25T09:15:00Z"
  },
  {
    id: "pay_rec_102",
    pharmacyId: "pharmacy_sri_maheswari",
    distributorId: "dist_cipla_depot",
    distributorName: "Cipla Authorized Depot",
    amount: 15000.00,
    paymentDate: "2024-10-23",
    paymentMethod: "upi",
    referenceNumber: "UPI-42991028371",
    status: "verified",
    allocatedBills: [{ billId: "bill_inv_cip_1102", allocatedAmount: 15000.00 }],
    receiptUrl: "",
    createdAt: "2024-10-23T14:40:00Z"
  }
];

const SEED_AUDIT_LOGS = [
  {
    id: "log_01",
    pharmacyId: "pharmacy_sri_maheswari",
    userId: "usr_staff_01",
    userName: "Dr. K. Rama Rao",
    action: "Bill Verified",
    details: "Purchase bill INV-2024-8891 from ABC Pharma verified and stock updated.",
    timestamp: "2024-10-24T14:45:00Z"
  },
  {
    id: "log_02",
    pharmacyId: "pharmacy_sri_maheswari",
    userId: "usr_staff_01",
    userName: "Dr. K. Rama Rao",
    action: "Payment Recorded",
    details: "Recorded NEFT payment of ₹3,000.00 to ABC Pharma Distributors Ltd.",
    timestamp: "2024-10-25T09:20:00Z"
  }
];

class DatabaseService {
  constructor() {
    this.listeners = new Set();
    this.initStorage();
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
    if (!localStorage.getItem(STORAGE_PREFIX + 'auditLogs')) {
      localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(SEED_AUDIT_LOGS));
    }
    if (!localStorage.getItem(STORAGE_PREFIX + 'adjustments')) {
      localStorage.setItem(STORAGE_PREFIX + 'adjustments', JSON.stringify([]));
    }
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
      pharmacyId: pharmacyState.profile.id,
      createdAt: new Date().toISOString()
    };
    list.unshift(newDist);
    this.saveCollection('distributors', list);
    this.logAudit("Distributor Added", `Added new distributor: ${newDist.name}`);
    return newDist;
  }

  // ==========================================
  // SINGLE SOURCE OF TRUTH: FINANCIAL LEDGER
  // Outstanding = Sum(Verified Purchases) - Sum(Verified Payments)
  // ==========================================
  getDistributorFinances(distributorId) {
    const bills = this.getPurchaseBills().filter(b => b.distributorId === distributorId && b.status === 'verified');
    const payments = this.getPayments().filter(p => p.distributorId === distributorId && p.status === 'verified');

    const totalPurchases = bills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const outstanding = Math.max(0, totalPurchases - totalPaid);

    return {
      totalPurchases,
      totalPaid,
      outstanding,
      billCount: bills.length,
      paymentCount: payments.length,
      bills,
      payments
    };
  }

  getOverallFinances() {
    const verifiedBills = this.getPurchaseBills().filter(b => b.status === 'verified');
    const verifiedPayments = this.getPayments().filter(p => p.status === 'verified');

    const totalPurchases = verifiedBills.reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);
    const totalPaid = verifiedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalOutstanding = Math.max(0, totalPurchases - totalPaid);

    const pendingBills = this.getPurchaseBills().filter(b => b.status === 'needs_verification');
    const expiringBatches = this.getExpiringBatches(60);

    return {
      totalPurchases,
      totalPaid,
      totalOutstanding,
      invoiceCount: verifiedBills.length,
      pendingVerificationCount: pendingBills.length,
      expiringCount: expiringBatches.length
    };
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
    if (!distributorId || !invoiceNumber) return null;
    const cleanNum = invoiceNumber.trim().toLowerCase();
    const existing = this.getPurchaseBills().find(
      b => b.distributorId === distributorId && 
           b.invoiceNumber.trim().toLowerCase() === cleanNum
    );
    return existing || null;
  }

  savePurchaseBill(billData) {
    const bills = this.getPurchaseBills();
    const newBill = {
      ...billData,
      id: billData.id || `bill_${Date.now()}`,
      pharmacyId: pharmacyState.profile.id,
      createdAt: billData.createdAt || new Date().toISOString()
    };

    const existingIndex = bills.findIndex(b => b.id === newBill.id);
    if (existingIndex >= 0) {
      bills[existingIndex] = newBill;
    } else {
      bills.unshift(newBill);
    }

    this.saveCollection('purchaseBills', bills);

    // If verified, update inventory batches automatically!
    if (newBill.status === 'verified') {
      this.syncBillItemsToInventory(newBill);
    }

    this.logAudit(
      existingIndex >= 0 ? "Bill Updated" : "Bill Created",
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
      pharmacyId: pharmacyState.profile.id,
      status: paymentData.status || 'verified',
      createdAt: paymentData.createdAt || new Date().toISOString()
    };

    payments.unshift(newPayment);
    this.saveCollection('payments', payments);

    this.logAudit(
      "Payment Recorded",
      `₹${newPayment.amount.toFixed(2)} to ${newPayment.distributorName} via ${newPayment.paymentMethod.toUpperCase()}`
    );

    return newPayment;
  }

  // ==========================================
  // INVENTORY & BATCH TRACKING (Phase 11 & 12)
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
          pharmacyId: pharmacyState.profile.id,
          name: item.productName,
          genericSalt: item.genericSalt || "Essential Medicine Salt",
          category: "Prescription",
          gstRate: item.gstRate || 12,
          defaultPackSize: item.packSize || "10 Units"
        };
        products.push(product);
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
      } else {
        batches.unshift({
          id: batchId,
          pharmacyId: pharmacyState.profile.id,
          productId: product.id,
          productName: item.productName,
          genericSalt: product.genericSalt,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          packSize: item.packSize,
          quantityInUnits: Number(item.quantity) * 10,
          purchaseRate: Number(item.purchaseRate),
          mrp: Number(item.purchaseRate) * 1.25, // Default margin
          distributorId: bill.distributorId,
          distributorName: bill.distributorName,
          billId: bill.id,
          createdAt: new Date().toISOString()
        });
      }
    });

    this.saveCollection('products', products);
    this.saveCollection('batches', batches);
  }

  getBatches() {
    let batches = this.getCollection('batches');
    if (!batches || batches.length === 0) {
      // Synthesize batches from verified bills on initial start
      const bills = this.getPurchaseBills().filter(b => b.status === 'verified');
      batches = [];
      bills.forEach(bill => {
        (bill.items || []).forEach(item => {
          batches.push({
            id: `batch_${item.batchNumber}`,
            pharmacyId: pharmacyState.profile.id,
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

  adjustInventory(batchId, quantityChange, reason) {
    const batches = this.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return false;

    const oldQty = batch.quantityInUnits;
    batch.quantityInUnits = Math.max(0, batch.quantityInUnits + Number(quantityChange));

    const adjustments = this.getCollection('adjustments');
    adjustments.unshift({
      id: `adj_${Date.now()}`,
      pharmacyId: pharmacyState.profile.id,
      batchId,
      productName: batch.productName,
      batchNumber: batch.batchNumber,
      oldQty,
      newQty: batch.quantityInUnits,
      change: Number(quantityChange),
      reason,
      user: authState.user?.displayName || "Pharmacist",
      timestamp: new Date().toISOString()
    });

    this.saveCollection('batches', batches);
    this.saveCollection('adjustments', adjustments);
    this.logAudit("Stock Adjusted", `${batch.productName} (B.No: ${batch.batchNumber}) adjusted by ${quantityChange} units. Reason: ${reason}`);
    return true;
  }

  // ==========================================
  // EXPIRY CALCULATIONS (Phase 12)
  // ==========================================
  getExpiringBatches(daysThreshold = 90) {
    const batches = this.getBatches();
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysThreshold);

    return batches.filter(batch => {
      const exp = new Date(batch.expiryDate);
      return exp <= targetDate;
    }).map(batch => {
      const exp = new Date(batch.expiryDate);
      const diffTime = exp - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      let status = 'safe';
      if (diffDays <= 0) status = 'expired';
      else if (diffDays <= 30) status = 'critical';
      else if (diffDays <= 60) status = 'warning';
      else status = 'attention';

      return {
        ...batch,
        daysLeft: diffDays,
        expiryCategory: status
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }

  // ==========================================
  // PRICE ANOMALY DETECTION (Phase 13)
  // Non-accusatory: "Price Difference Detected"
  // ==========================================
  getPriceAnomalies() {
    const bills = this.getPurchaseBills().filter(b => b.status === 'verified');
    const productPrices = {};

    bills.forEach(bill => {
      (bill.items || []).forEach(item => {
        const normKey = item.productName.trim().toLowerCase();
        if (!productPrices[normKey]) {
          productPrices[normKey] = [];
        }
        productPrices[normKey].push({
          productName: item.productName,
          genericSalt: item.genericSalt,
          distributorName: bill.distributorName,
          distributorId: bill.distributorId,
          rate: Number(item.purchaseRate),
          date: bill.invoiceDate
        });
      });
    });

    const anomalies = [];
    Object.keys(productPrices).forEach(key => {
      const entries = productPrices[key];
      if (entries.length >= 2) {
        // Find min and max rate
        entries.sort((a, b) => a.rate - b.rate);
        const lowest = entries[0];
        const highest = entries[entries.length - 1];

        if (highest.rate > lowest.rate && highest.distributorId !== lowest.distributorId) {
          const diff = highest.rate - lowest.rate;
          const pct = ((diff / lowest.rate) * 100).toFixed(1);

          anomalies.push({
            id: `anom_${highest.productName.replace(/\s+/g, '_')}`,
            productName: highest.productName,
            genericSalt: highest.genericSalt,
            distributorA: highest.distributorName,
            rateA: highest.rate,
            distributorB: lowest.distributorName,
            rateB: lowest.rate,
            difference: diff,
            pctDiff: pct,
            severity: pct > 15 ? 'high' : 'medium'
          });
        }
      }
    });

    return anomalies;
  }

  // ==========================================
  // REVIEW CENTER UNIFIED INBOX (Phase 14)
  // ==========================================
  getReviewCenterItems() {
    const items = [];

    // 1. Bills needing verification
    this.getPurchaseBills().filter(b => b.status === 'needs_verification').forEach(b => {
      items.push({
        id: `rev_bill_${b.id}`,
        type: 'bill_verification',
        title: `Bill Review: ${b.invoiceNumber}`,
        subtitle: `${b.distributorName} • Grand Total: ₹${b.grandTotal.toFixed(2)}`,
        badge: 'Verification Required',
        urgency: 'high',
        targetTab: 'bills',
        data: b
      });
    });

    // 2. Expiring stock (< 30 days)
    this.getExpiringBatches(30).forEach(batch => {
      items.push({
        id: `rev_exp_${batch.id}`,
        type: 'expiry_alert',
        title: `Near Expiry: ${batch.productName}`,
        subtitle: `Batch: ${batch.batchNumber} • ${batch.daysLeft <= 0 ? 'Expired' : `Expires in ${batch.daysLeft} days`} (${batch.quantityInUnits} units)`,
        badge: batch.daysLeft <= 0 ? 'Expired' : 'Critical Expiry',
        urgency: 'high',
        targetTab: 'inventory',
        data: batch
      });
    });

    // 3. Price Anomalies
    this.getPriceAnomalies().forEach(a => {
      items.push({
        id: `rev_anom_${a.id}`,
        type: 'price_anomaly',
        title: `Price Difference: ${a.productName}`,
        subtitle: `${a.distributorA} charges ₹${a.rateA} vs ${a.distributorB} ₹${a.rateB} (+${a.pctDiff}%)`,
        badge: 'Price Difference Detected',
        urgency: 'medium',
        targetTab: 'bills',
        data: a
      });
    });

    return items;
  }

  // ==========================================
  // AUDIT LOGS (Phase 17)
  // ==========================================
  getAuditLogs() {
    return this.getCollection('auditLogs');
  }

  logAudit(action, details) {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log_${Date.now()}`,
      pharmacyId: pharmacyState.profile.id,
      userId: authState.user?.uid || "usr_guest",
      userName: authState.user?.displayName || "Dr. K. Rama Rao",
      action,
      details,
      timestamp: new Date().toISOString()
    });
    this.saveCollection('auditLogs', logs.slice(0, 100)); // Keep recent 100
  }
}

export const dbService = new DatabaseService();
