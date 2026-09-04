// Upload Purchase Bill & OCR Workflow View (Phases 6, 7, 8, 13)
// Exact match to Stitch Upload_Purchase_Bill_and_OCR_a0564e61.html

import { dbService } from '../services/dbService.js';
import { storageService } from '../services/storageService.js';
import { ocrService } from '../services/ocrService.js';
import { i18n } from '../context/i18nState.js';

let draftBill = {
  invoiceNumber: "INV-2024-" + Math.floor(1000 + Math.random() * 9000),
  invoiceDate: new Date().toISOString().split('T')[0],
  distributorId: "dist_abc_pharma",
  distributorName: "ABC Pharma Distributors Ltd.",
  ocrConfidence: 94,
  fileName: "INV_SCAN_CAMERA_01.jpg",
  fileSize: "1.8 MB",
  items: [
    {
      productName: "Augmentin 625 Duo Tablet",
      genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
      batchNumber: "AUG-" + Math.floor(1000 + Math.random() * 9000),
      expiryDate: "2026-11-30",
      quantity: 15,
      packSize: "10 Tabs",
      purchaseRate: 142.50,
      discount: 5.0,
      gstRate: 12,
      taxableValue: 2030.62,
      total: 2274.30,
      hasAnomaly: true,
      anomalyText: "ABC Pharma charges ₹142.50 (+8.2% above Apex Medilink ₹131.70)"
    },
    {
      productName: "Pan-D Capsule",
      genericSalt: "Pantoprazole (40mg) + Domperidone (30mg)",
      batchNumber: "PND-" + Math.floor(1000 + Math.random() * 9000),
      expiryDate: "2026-08-31",
      quantity: 25,
      packSize: "15 Caps",
      purchaseRate: 110.00,
      discount: 4.0,
      gstRate: 12,
      taxableValue: 2640.00,
      total: 2956.80,
      hasAnomaly: false
    }
  ]
};

export function renderUploadOCRView() {
  const distributors = dbService.getDistributors();
  
  // Calculate totals from line items
  const subtotal = draftBill.items.reduce((sum, it) => sum + (it.taxableValue || (it.quantity * it.purchaseRate * (1 - it.discount/100))), 0);
  const gstTotal = draftBill.items.reduce((sum, it) => sum + (it.total - it.taxableValue), 0);
  const calculatedGrandTotal = subtotal + gstTotal;
  
  // Duplicate check
  const duplicateWarning = dbService.checkDuplicateBill(draftBill.distributorId, draftBill.invoiceNumber);

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Progress Stepper Tracker from Stitch -->
        <div class="px-gutter-mobile py-space-sm bg-surface-container-lowest dark:bg-surface-container rounded-xl shadow-sm border border-outline-variant/30">
          <div class="flex items-center justify-between mb-space-xs">
            <div class="flex items-center gap-space-2xs">
              <span class="font-label-caps text-label-caps uppercase text-primary dark:text-primary-fixed font-bold tracking-wider">Step 2 of 2</span>
              <span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              <span class="font-label-md text-label-md text-on-surface">Review OCR Extraction</span>
            </div>
            <span class="font-label-caps text-label-caps font-semibold px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
              Ready for Verification
            </span>
          </div>
          <div class="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden flex">
            <div class="bg-primary w-full h-full rounded-full transition-all duration-500"></div>
          </div>
        </div>

        <!-- Upload Source Actions & Scanned Document Card -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
          <div class="grid grid-cols-2 gap-space-xs">
            <button 
              id="ocr-take-photo-btn"
              class="h-11 px-space-xs rounded-lg bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-2xs font-label-md text-label-md transition-colors active:scale-95 cursor-pointer" 
              type="button"
            >
              <span class="material-symbols-outlined text-[20px] text-primary dark:text-primary-fixed">photo_camera</span>
              <span>${i18n.t('takePhoto')}</span>
            </button>
            <label 
              class="h-11 px-space-xs rounded-lg bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-2xs font-label-md text-label-md transition-colors active:scale-95 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px] text-secondary dark:text-secondary-fixed">image</span>
              <span>${i18n.t('uploadGallery')}</span>
              <input type="file" id="ocr-file-picker" accept="image/*,.pdf" class="hidden" />
            </label>
          </div>

          <!-- Document Thumbnail & OCR Confidence Score -->
          <div class="flex items-center gap-space-sm bg-surface-container-low dark:bg-surface-container-high p-space-xs rounded-lg">
            <div class="relative w-16 h-18 rounded-md overflow-hidden flex-shrink-0 bg-surface-container-high shadow-sm">
              <img 
                alt="Scanned Pharmaceutical Invoice" 
                class="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfEEdNM9uza0VQrfzLezJYBQXFsu7IA2eyFNGRlp7x7qENzqanAfT1DlMj9IIlKuIFwRpLb5qhJs4fjzYEgauwBtATGpASzJYsGwkl3bqLkOIZ-O4Sq96PQ2kD30ahRLofnBvH1Fta83l3WGYlELHhGnP_3EdRnUJf83AdmpnqTW_PySzP8hoXOZfInX4bqbVSiSPZ4Hm3eFua-bt6tuWKFG6YmCkoPaCXgI9NB7QOK5Yhb8Kd_7wpww"
              />
              <span class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></span>
              <span class="absolute bottom-1 right-1 text-white material-symbols-outlined text-[16px]">zoom_in</span>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center justify-between gap-space-2xs">
                <p class="font-label-md text-label-md text-on-surface font-semibold truncate">${draftBill.fileName}</p>
                <span class="font-label-caps text-label-caps text-on-surface-variant">${draftBill.fileSize}</span>
              </div>
              <div class="flex items-center gap-space-2xs mt-1">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps font-semibold">
                  <span class="material-symbols-outlined text-[13px] text-primary">verified</span>
                  OCR Confidence: High (${draftBill.ocrConfidence}%)
                </span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                Processed live • ${draftBill.items.length} ${i18n.t('itemsExtracted')}
              </p>
            </div>
          </div>
        </div>

        <!-- Duplicate Warning Alert Banner (Phase 8) -->
        ${duplicateWarning ? `
          <div class="bg-error-container text-on-error-container rounded-xl p-space-sm flex items-start gap-3 shadow-sm border border-error/30">
            <span class="material-symbols-outlined text-error text-[22px] flex-shrink-0 mt-0.5">warning</span>
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm text-error font-bold">${i18n.t('duplicateBillWarning')}</span>
              <p class="font-body-sm text-body-sm leading-relaxed">
                Bill <strong>#${draftBill.invoiceNumber}</strong> already exists in the system for <strong>${draftBill.distributorName}</strong> with Grand Total <strong>₹${duplicateWarning.grandTotal.toFixed(2)}</strong>. Saving will create a duplicate record unless confirmed.
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Editable Extracted Invoice Header Metadata -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
          <div class="flex items-center justify-between pb-space-xs">
            <div class="flex items-center gap-space-2xs">
              <span class="material-symbols-outlined text-primary dark:text-primary-fixed text-[20px]">receipt_long</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface">${i18n.t('invoiceMetadata')}</h2>
            </div>
            <span class="font-label-caps text-label-caps text-primary bg-surface-container-low dark:bg-surface-container-high px-2 py-1 rounded-md font-medium">Auto-Extracted</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            <!-- Bill Number -->
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('billNumber')}</label>
              <input 
                id="ocr-bill-number" 
                class="w-full h-11 px-space-sm bg-surface-container-low dark:bg-surface-container-high rounded-lg font-code-md text-code-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                type="text" 
                value="${draftBill.invoiceNumber}"
              />
            </div>

            <!-- Bill Date -->
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('billDate')}</label>
              <input 
                id="ocr-bill-date" 
                class="w-full h-11 px-space-sm bg-surface-container-low dark:bg-surface-container-high rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                type="date" 
                value="${draftBill.invoiceDate}"
              />
            </div>

            <!-- Distributor -->
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('distributor')}</label>
              <select 
                id="ocr-distributor-select" 
                class="w-full h-11 px-space-sm bg-surface-container-low dark:bg-surface-container-high rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30 cursor-pointer"
              >
                ${distributors.map(d => `
                  <option value="${d.id}" ${d.id === draftBill.distributorId ? 'selected' : ''}>
                    ${d.name}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Extracted Line Items Header -->
        <div class="flex items-center justify-between pt-1">
          <div class="flex items-center gap-space-2xs">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">${i18n.t('extractedLineItems')}</h2>
            <span class="w-6 h-6 rounded-full bg-primary-container text-on-primary text-[12px] font-bold flex items-center justify-center">
              ${draftBill.items.length}
            </span>
          </div>
          <button 
            id="ocr-add-item-btn" 
            class="font-label-md text-label-md text-primary dark:text-primary-fixed font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            ${i18n.t('addItem')}
          </button>
        </div>

        <!-- Line Items List with Price Anomaly Notice -->
        <div class="space-y-space-xs">
          ${draftBill.items.map((item, idx) => `
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    ${item.productName}
                  </h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Salt: ${item.genericSalt}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-code-num text-body-sm bg-surface-container-low dark:bg-surface-container-high px-2 py-1 rounded text-on-surface">
                    B.No: ${item.batchNumber}
                  </span>
                  <span class="font-code-num text-body-sm bg-surface-container-low dark:bg-surface-container-high px-2 py-1 rounded text-on-surface">
                    Exp: ${item.expiryDate}
                  </span>
                </div>
              </div>

              <!-- Price Anomaly Alert Pill (Phase 13) -->
              ${item.hasAnomaly ? `
                <div class="p-2.5 rounded-lg bg-tertiary-container/15 text-tertiary border border-tertiary-container/30 flex items-center gap-2 text-body-sm">
                  <span class="material-symbols-outlined text-[18px] text-tertiary flex-shrink-0">price_change</span>
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1">
                    <span>${i18n.t('priceDifferenceDetected')}: ${item.anomalyText}</span>
                    <span class="font-bold text-[11px] uppercase tracking-wider bg-tertiary/10 px-2 py-0.5 rounded">Review</span>
                  </div>
                </div>
              ` : ''}

              <!-- Grid of Qty, Rate, Discount, GST, Total -->
              <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-body-sm">
                <div>
                  <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Quantity</span>
                  <span class="font-semibold text-on-surface font-code-num">${item.quantity} strips (${item.packSize})</span>
                </div>
                <div>
                  <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Rate / Unit</span>
                  <span class="font-code-num text-on-surface">₹${item.purchaseRate.toFixed(2)}</span>
                </div>
                <div>
                  <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Discount</span>
                  <span class="font-code-num text-on-surface">${item.discount}%</span>
                </div>
                <div>
                  <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">GST Rate</span>
                  <span class="font-code-num text-on-surface">${item.gstRate}%</span>
                </div>
                <div>
                  <span class="font-label-caps text-label-caps text-primary block uppercase font-bold">Line Total</span>
                  <span class="font-headline-sm text-headline-sm font-bold text-primary font-code-num">₹${item.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Bill Reconciliation & Tax Breakdown Card (Phase 7) -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <span class="font-headline-sm text-headline-sm text-on-surface">Invoice Reconciliation</span>
            <span class="font-label-caps text-label-caps text-primary font-bold">GST Standard Breakdown</span>
          </div>

          <div class="space-y-1.5 text-body-sm">
            <div class="flex justify-between text-on-surface-variant">
              <span>${i18n.t('taxableValue')} (Subtotal)</span>
              <span class="font-code-num text-on-surface">₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-on-surface-variant">
              <span>CGST (6%) + SGST (6%)</span>
              <span class="font-code-num text-on-surface">₹${gstTotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-on-surface pt-2 border-t border-outline-variant/20 font-headline-sm">
              <span class="font-bold">${i18n.t('grandTotal')}</span>
              <span class="font-bold text-primary dark:text-primary-fixed font-code-num text-headline-md">
                ₹${calculatedGrandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom Action Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-xs pt-2">
          <button 
            id="ocr-reject-btn"
            class="h-12 px-space-md rounded-xl bg-surface-container-low dark:bg-surface-container-high text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container transition-colors cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px] text-error">close</span>
            <span>${i18n.t('rejectRescan')}</span>
          </button>

          <button 
            id="ocr-save-bill-btn"
            class="h-12 px-space-md rounded-xl bg-primary-container text-on-primary font-headline-sm text-body-md flex items-center justify-center gap-2 shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">save</span>
            <span>${i18n.t('saveBillToInventory')}</span>
          </button>
        </div>

      </div>
    </main>
  `;
}

export function bindUploadOCREvents(container, router) {
  const handleFileProcess = async (file) => {
    if (!file) return;
    const saveBtn = container.querySelector('#ocr-save-bill-btn');
    if (saveBtn) saveBtn.disabled = true;

    try {
      const uploadRes = await storageService.uploadBillImage(file, dbService.activePharmacyId, `bill_${Date.now()}`);
      draftBill.fileName = uploadRes.fileName;
      draftBill.fileSize = uploadRes.fileSize;
      draftBill.imageUrl = uploadRes.url;
      draftBill.storagePath = uploadRes.storagePath;

      // Extract real OCR items
      const ocrResult = await ocrService.extractBillData(uploadRes.url, dbService.getDistributors());
      draftBill.invoiceNumber = ocrResult.invoiceNumber;
      draftBill.invoiceDate = ocrResult.invoiceDate;
      draftBill.distributorId = ocrResult.distributorId;
      draftBill.distributorName = ocrResult.distributorName;
      draftBill.ocrConfidence = ocrResult.ocrConfidence;
      draftBill.items = ocrResult.items;

      router.renderCurrentView();
    } catch (err) {
      alert("Error processing bill: " + err.message);
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  };

  // Photo capture trigger
  container.querySelector('#ocr-take-photo-btn')?.addEventListener('click', () => {
    const filePicker = container.querySelector('#ocr-file-picker');
    if (filePicker) {
      filePicker.setAttribute('capture', 'environment');
      filePicker.click();
    }
  });

  // File picker handler
  container.querySelector('#ocr-file-picker')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleFileProcess(file);
    }
  });

  // Distributor selection
  container.querySelector('#ocr-distributor-select')?.addEventListener('change', (e) => {
    const selectedDist = dbService.getDistributorById(e.target.value);
    if (selectedDist) {
      draftBill.distributorId = selectedDist.id;
      draftBill.distributorName = selectedDist.name;
    }
  });

  // Add Item Dialog
  container.querySelector('#ocr-add-item-btn')?.addEventListener('click', () => {
    const medName = prompt("Enter Medicine Brand Name:", "Azithral 500 Tablet");
    if (!medName) return;
    const qty = parseInt(prompt("Enter Pack Quantity:", "10"), 10) || 10;
    const rate = parseFloat(prompt("Enter Purchase Rate per Pack (₹):", "72.00")) || 72;

    const sub = qty * rate;
    const tax = sub * 0.12;

    draftBill.items.push({
      productName: medName,
      genericSalt: "Pharmaceutical Salt",
      batchNumber: "MAN-" + Math.floor(1000 + Math.random() * 9000),
      expiryDate: "2026-10-31",
      quantity: qty,
      packSize: "10 Tabs",
      purchaseRate: rate,
      discount: 0,
      gstRate: 12,
      taxableValue: sub,
      total: sub + tax,
      hasAnomaly: false
    });

    router.renderCurrentView();
  });

  // Reject / Re-scan
  container.querySelector('#ocr-reject-btn')?.addEventListener('click', () => {
    if (confirm("Discard this OCR scan and return to bills?")) {
      router.navigate('bills');
    }
  });

  // Save Bill to Inventory & Firestore
  container.querySelector('#ocr-save-bill-btn')?.addEventListener('click', () => {
    const invoiceNum = container.querySelector('#ocr-bill-number').value.trim();
    const invoiceDate = container.querySelector('#ocr-bill-date').value;

    if (!invoiceNum) {
      alert("Please specify a valid invoice number.");
      return;
    }

    // Check duplicate
    const duplicate = dbService.checkDuplicateBill(draftBill.distributorId, invoiceNum);
    if (duplicate) {
      const confirmDup = confirm(`Duplicate Warning: Bill #${invoiceNum} already exists for ${draftBill.distributorName}. Do you still want to proceed?`);
      if (!confirmDup) return;
    }

    const subtotal = draftBill.items.reduce((sum, it) => sum + it.taxableValue, 0);
    const gstTotal = draftBill.items.reduce((sum, it) => sum + (it.total - it.taxableValue), 0);
    const grandTotal = subtotal + gstTotal;

    // Save as verified bill (triggers Firestore write, batch updates, and price alert checks)
    const saved = dbService.savePurchaseBill({
      ...draftBill,
      invoiceNumber: invoiceNum,
      invoiceDate: invoiceDate,
      subtotal,
      cgst: gstTotal / 2,
      sgst: gstTotal / 2,
      igst: 0,
      totalTax: gstTotal,
      grandTotal,
      status: "verified"
    });

    alert(`Purchase Bill #${saved.invoiceNumber} for ${saved.distributorName} successfully recorded in Cloud Firestore!`);
    router.navigate('bills');
  });
}
