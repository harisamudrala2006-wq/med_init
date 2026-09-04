// Upload Purchase Bill & Camera OCR Workflow View
// Preserves Stitch UI Design with real Live Camera capture, Cloud Vision OCR, and Firebase Storage
import { dbService } from '../services/dbService.js';
import { storageService } from '../services/storageService.js';
import { ocrService } from '../services/ocrService.js';
import { authService } from '../services/authService.js';
import { i18n } from '../context/i18nState.js';

let isCameraActive = false;
let cameraStream = null;
let isProcessingOcr = false;
let isUploadingBill = false;
let ocrError = null;
let currentImageBlob = null;
let previewImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDfEEdNM9uza0VQrfzLezJYBQXFsu7IA2eyFNGRlp7x7qENzqanAfT1DlMj9IIlKuIFwRpLb5qhJs4fjzYEgauwBtATGpASzJYsGwkl3bqLkOIZ-O4Sq96PQ2kD30ahRLofnBvH1Fta83l3WGYlELHhGnP_3EdRnUJf83AdmpnqTW_PySzP8hoXOZfInX4bqbVSiSPZ4Hm3eFua-bt6tuWKFG6YmCkoPaCXgI9NB7QOK5Yhb8Kd_7wpww";

let draftBill = {
  invoiceNumber: "INV-2024-" + Math.floor(1000 + Math.random() * 9000),
  invoiceDate: new Date().toISOString().split('T')[0],
  monthDelivered: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
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
  const subtotal = draftBill.items.reduce((sum, it) => sum + (it.taxableValue || (it.quantity * it.purchaseRate * (1 - (it.discount || 0)/100))), 0);
  const gstTotal = draftBill.items.reduce((sum, it) => sum + (it.total - (it.taxableValue || (it.quantity * it.purchaseRate))), 0);
  const calculatedGrandTotal = subtotal + gstTotal;
  
  // Duplicate check
  const duplicateWarning = dbService.checkDuplicateBill(draftBill.distributorId, draftBill.invoiceNumber);

  // Derive month delivered from invoiceDate
  const parsedDate = new Date(draftBill.invoiceDate);
  const derivedMonth = !isNaN(parsedDate.getTime()) 
    ? parsedDate.toLocaleString("en-US", { month: "long", year: "numeric" })
    : draftBill.monthDelivered;

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

        <!-- Error & Alert State Banner -->
        ${ocrError ? `
          <div class="bg-error-container text-on-error-container rounded-xl p-space-sm flex items-start gap-3 shadow-sm border border-error/30 animate-pulse">
            <span class="material-symbols-outlined text-error text-[22px] flex-shrink-0 mt-0.5">error</span>
            <div class="flex-1 flex flex-col">
              <span class="font-headline-sm text-headline-sm text-error font-bold">Scanning Notice</span>
              <p class="font-body-sm text-body-sm leading-relaxed">${ocrError}</p>
            </div>
            <button id="ocr-dismiss-error" class="text-on-error-container hover:opacity-75 cursor-pointer" type="button">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ` : ''}

        <!-- Upload Source Actions & Camera Viewfinder -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
          
          ${isCameraActive ? `
            <!-- Live Camera Viewfinder Overlay -->
            <div class="relative w-full rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center p-2 border-2 border-primary">
              <video id="camera-live-stream" autoplay playsinline class="w-full h-72 object-cover rounded-lg"></video>
              <canvas id="camera-snapshot-canvas" class="hidden"></canvas>
              
              <div class="absolute bottom-4 flex items-center gap-3">
                <button 
                  id="camera-capture-frame-btn"
                  class="h-12 px-5 bg-primary-container text-on-primary font-headline-sm rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer ring-4 ring-white/30"
                  type="button"
                >
                  <span class="material-symbols-outlined text-[24px]">camera</span>
                  <span>Capture Bill Photo</span>
                </button>
                <button 
                  id="camera-close-stream-btn"
                  class="h-12 px-4 bg-surface-container/90 text-on-surface font-label-md rounded-full shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer backdrop-blur"
                  type="button"
                >
                  <span class="material-symbols-outlined text-[18px]">close</span>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ` : `
            <!-- Standard Capture / Gallery Buttons -->
            <div class="grid grid-cols-2 gap-space-xs">
              <button 
                id="ocr-take-photo-btn"
                class="h-11 px-space-xs rounded-lg bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-2xs font-label-md text-label-md transition-colors active:scale-95 cursor-pointer" 
                type="button"
              >
                <span class="material-symbols-outlined text-[20px] text-primary dark:text-primary-fixed">photo_camera</span>
                <span>Live Camera OCR</span>
              </button>
              <label 
                class="h-11 px-space-xs rounded-lg bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-2xs font-label-md text-label-md transition-colors active:scale-95 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px] text-secondary dark:text-secondary-fixed">image</span>
                <span>${i18n.t('uploadGallery')}</span>
                <input type="file" id="ocr-file-picker" accept="image/*,.pdf" capture="environment" class="hidden" />
              </label>
            </div>
          `}

          <!-- Processing State Loading Spinner -->
          ${isProcessingOcr ? `
            <div class="bg-surface-container-low dark:bg-surface-container-high p-4 rounded-xl flex items-center justify-center gap-3 text-primary">
              <span class="material-symbols-outlined text-[26px] animate-spin">progress_activity</span>
              <div class="flex flex-col">
                <span class="font-headline-sm font-semibold">Running Cloud Vision OCR...</span>
                <span class="text-body-sm text-on-surface-variant">Extracting medicine names, unit prices, batches & expiry dates</span>
              </div>
            </div>
          ` : `
            <!-- Document Thumbnail & OCR Confidence Score -->
            <div class="flex items-center gap-space-sm bg-surface-container-low dark:bg-surface-container-high p-space-xs rounded-lg">
              <div class="relative w-16 h-18 rounded-md overflow-hidden flex-shrink-0 bg-surface-container-high shadow-sm">
                <img 
                  alt="Scanned Invoice" 
                  class="w-full h-full object-cover" 
                  src="${previewImageUrl}"
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
                    OCR Confidence: ${draftBill.ocrConfidence}%
                  </span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                  Delivered: <strong class="text-primary font-semibold">${derivedMonth}</strong> • ${draftBill.items.length} ${i18n.t('itemsExtracted')}
                </p>
              </div>
            </div>
          `}
        </div>

        <!-- Duplicate Warning Alert Banner -->
        ${duplicateWarning ? `
          <div class="bg-error-container text-on-error-container rounded-xl p-space-sm flex items-start gap-3 shadow-sm border border-error/30">
            <span class="material-symbols-outlined text-error text-[22px] flex-shrink-0 mt-0.5">warning</span>
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm text-error font-bold">${i18n.t('duplicateBillWarning')}</span>
              <p class="font-body-sm text-body-sm leading-relaxed">
                Bill <strong>#${draftBill.invoiceNumber}</strong> already exists in the system for <strong>${draftBill.distributorName}</strong> with Grand Total <strong>₹${duplicateWarning.grandTotal.toFixed(2)}</strong>.
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Editable Extracted Invoice Header Metadata -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col gap-space-sm">
          <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
            <div class="flex items-center gap-space-2xs">
              <span class="material-symbols-outlined text-primary dark:text-primary-fixed text-[20px]">receipt_long</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface">${i18n.t('invoiceMetadata')}</h2>
            </div>
            <span class="font-label-caps text-label-caps text-primary bg-secondary-container/40 px-2 py-0.5 rounded-full font-bold">
              Delivered: ${derivedMonth}
            </span>
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

            <!-- Invoice / Delivery Date -->
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Invoice / Delivery Date</label>
              <input 
                id="ocr-bill-date" 
                class="w-full h-11 px-space-sm bg-surface-container-low dark:bg-surface-container-high rounded-lg font-code-md text-code-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                type="date" 
                value="${draftBill.invoiceDate}" 
              />
            </div>

            <!-- Distributor -->
            <div class="flex flex-col gap-1">
              <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('distributorVendor')}</label>
              <select 
                id="ocr-distributor-select" 
                class="w-full h-11 px-space-sm bg-surface-container-low dark:bg-surface-container-high rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30 cursor-pointer"
              >
                ${distributors.map(d => `
                  <option value="${d.id}" ${d.id === draftBill.distributorId ? 'selected' : ''}>${d.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Editable Review Step: Line Items Extraction Table -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-space-sm">
          <div class="flex items-center justify-between pb-space-xs border-b border-outline-variant/20">
            <div class="flex items-center gap-space-2xs">
              <span class="material-symbols-outlined text-primary text-[20px]">medication</span>
              <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Editable Line Items (${draftBill.items.length})
              </h2>
            </div>
            <button 
              id="ocr-add-item-btn"
              class="h-9 px-3 rounded-lg bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container text-primary text-label-md font-semibold flex items-center gap-1 border border-outline-variant/30 cursor-pointer active:scale-95 transition-all"
              type="button"
            >
              <span class="material-symbols-outlined text-[16px]">add</span>
              <span>Add Medicine</span>
            </button>
          </div>

          <!-- Items Table / Card Stream -->
          <div class="space-y-space-xs">
            ${draftBill.items.map((item, idx) => `
              <div class="p-space-sm rounded-xl bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/30 space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1">
                    <input 
                      data-item-field="productName" 
                      data-item-index="${idx}"
                      class="w-full bg-transparent font-headline-sm font-semibold text-on-surface border-b border-transparent focus:border-primary focus:outline-none" 
                      value="${item.productName}" 
                      placeholder="Medicine Name"
                    />
                    <span class="text-[11px] text-on-surface-variant">${item.genericSalt || 'Clinical Formula'}</span>
                  </div>
                  <button 
                    data-remove-item="${idx}"
                    class="text-error hover:opacity-75 p-1 cursor-pointer"
                    title="Remove Item"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <label class="font-label-caps text-on-surface-variant text-[10px] block">Batch Number</label>
                    <input 
                      data-item-field="batchNumber" 
                      data-item-index="${idx}"
                      class="w-full px-2 py-1 rounded bg-surface-container dark:bg-surface-container-highest font-code-num text-on-surface text-body-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary"
                      value="${item.batchNumber}"
                    />
                  </div>

                  <div>
                    <label class="font-label-caps text-on-surface-variant text-[10px] block">Expiry Date</label>
                    <input 
                      data-item-field="expiryDate" 
                      data-item-index="${idx}"
                      type="date"
                      class="w-full px-2 py-1 rounded bg-surface-container dark:bg-surface-container-highest font-code-num text-on-surface text-body-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary"
                      value="${item.expiryDate}"
                    />
                  </div>

                  <div>
                    <label class="font-label-caps text-on-surface-variant text-[10px] block">Quantity (Packs)</label>
                    <input 
                      data-item-field="quantity" 
                      data-item-index="${idx}"
                      type="number"
                      class="w-full px-2 py-1 rounded bg-surface-container dark:bg-surface-container-highest font-code-num text-on-surface text-body-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary"
                      value="${item.quantity}"
                    />
                  </div>

                  <div>
                    <label class="font-label-caps text-primary text-[10px] block font-bold">Unit Price (₹)</label>
                    <input 
                      data-item-field="purchaseRate" 
                      data-item-index="${idx}"
                      type="number"
                      step="0.01"
                      class="w-full px-2 py-1 rounded bg-surface-container dark:bg-surface-container-highest font-code-num font-semibold text-primary text-body-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary"
                      value="${item.purchaseRate}"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-outline-variant/15 text-[12px] text-on-surface-variant">
                  <span>Pack Size: ${item.packSize || '10 Units'} • GST: ${item.gstRate || 12}%</span>
                  <span class="font-bold text-on-surface font-code-num">Line Total: ₹${Number(item.total || (item.quantity * item.purchaseRate * 1.12)).toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Verification Summary & Confirm Action -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-3">
          <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Subtotal (Taxable Value):</span>
            <span class="font-code-num font-semibold text-on-surface">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="flex items-center justify-between text-body-sm text-on-surface-variant">
            <span>Estimated GST:</span>
            <span class="font-code-num font-semibold text-on-surface">₹${gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="flex items-center justify-between text-headline-sm font-bold text-on-surface pt-2 border-t border-outline-variant/20">
            <span>Total Payable:</span>
            <span class="text-primary font-code-num text-headline-md">₹${calculatedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="grid grid-cols-2 gap-space-sm pt-2">
            <button 
              id="ocr-reject-btn"
              class="h-12 px-4 rounded-xl bg-surface-container-low dark:bg-surface-container-high text-on-surface font-label-md flex items-center justify-center gap-2 border border-outline-variant/30 cursor-pointer active:scale-95 transition-all"
              type="button"
            >
              <span class="material-symbols-outlined text-[20px] text-error">close</span>
              <span>Discard Scan</span>
            </button>

            <button 
              id="ocr-save-bill-btn"
              class="h-12 px-4 rounded-xl bg-primary-container text-on-primary font-headline-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all ${isUploadingBill ? 'opacity-75 pointer-events-none' : ''}"
              type="button"
            >
              ${isUploadingBill ? `
                <span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>Writing to Firestore & Storage...</span>
              ` : `
                <span class="material-symbols-outlined text-[20px]">verified</span>
                <span>Confirm & Update Inventory</span>
              `}
            </button>
          </div>
        </div>

      </div>
    </main>
  `;
}

export function bindUploadOCREvents(container, router) {
  // Dismiss error
  container.querySelector('#ocr-dismiss-error')?.addEventListener('click', () => {
    ocrError = null;
    router.renderCurrentView();
  });

  // Handle OCR file processing
  const handleFileProcess = async (fileOrBlob) => {
    isProcessingOcr = true;
    ocrError = null;
    currentImageBlob = fileOrBlob;
    router.renderCurrentView();

    try {
      if (fileOrBlob instanceof Blob || fileOrBlob instanceof File) {
        previewImageUrl = URL.createObjectURL(fileOrBlob);
      }
      const distributors = dbService.getDistributors();
      const extracted = await ocrService.extractBillData(fileOrBlob, distributors);
      
      draftBill = {
        ...draftBill,
        ...extracted,
        fileName: fileOrBlob.name || `CAPTURE_${Date.now()}.jpg`,
        fileSize: fileOrBlob.size ? `${(fileOrBlob.size / (1024 * 1024)).toFixed(2)} MB` : "1.5 MB"
      };
    } catch (err) {
      console.error("OCR Processing error:", err);
      ocrError = `OCR extraction notice: ${err.message}. You can manually verify and edit the fields below.`;
    } finally {
      isProcessingOcr = false;
      router.renderCurrentView();
    }
  };

  // Live Camera Trigger
  container.querySelector('#ocr-take-photo-btn')?.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback for browsers without WebRTC camera API
      const filePicker = container.querySelector('#ocr-file-picker');
      if (filePicker) filePicker.click();
      return;
    }

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      isCameraActive = true;
      router.renderCurrentView();

      setTimeout(() => {
        const videoEl = document.querySelector('#camera-live-stream');
        if (videoEl && cameraStream) {
          videoEl.srcObject = cameraStream;
        }
      }, 50);
    } catch (err) {
      console.warn("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        ocrError = "Camera permission was denied. Please allow camera permissions in your browser or use the file picker.";
      } else {
        ocrError = `Could not start camera: ${err.message}. Falling back to file picker.`;
      }
      isCameraActive = false;
      router.renderCurrentView();

      // Trigger fallback input
      const filePicker = container.querySelector('#ocr-file-picker');
      if (filePicker) filePicker.click();
    }
  });

  // Capture Frame from Camera Stream
  container.querySelector('#camera-capture-frame-btn')?.addEventListener('click', () => {
    const videoEl = container.querySelector('#camera-live-stream');
    const canvas = container.querySelector('#camera-snapshot-canvas');
    if (!videoEl || !canvas) return;

    canvas.width = videoEl.videoWidth || 1280;
    canvas.height = videoEl.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    // Stop camera tracks
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    isCameraActive = false;

    canvas.toBlob(async (blob) => {
      if (blob) {
        await handleFileProcess(blob);
      }
    }, 'image/jpeg', 0.88);
  });

  // Close Camera Stream
  container.querySelector('#camera-close-stream-btn')?.addEventListener('click', () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    isCameraActive = false;
    router.renderCurrentView();
  });

  // File Picker
  container.querySelector('#ocr-file-picker')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
  });

  // Metadata input listeners
  container.querySelector('#ocr-bill-number')?.addEventListener('input', (e) => {
    draftBill.invoiceNumber = e.target.value.trim();
  });

  container.querySelector('#ocr-bill-date')?.addEventListener('change', (e) => {
    draftBill.invoiceDate = e.target.value;
    const pDate = new Date(draftBill.invoiceDate);
    if (!isNaN(pDate.getTime())) {
      draftBill.monthDelivered = pDate.toLocaleString("en-US", { month: "long", year: "numeric" });
    }
  });

  container.querySelector('#ocr-distributor-select')?.addEventListener('change', (e) => {
    const selectedDist = dbService.getDistributorById(e.target.value);
    if (selectedDist) {
      draftBill.distributorId = selectedDist.id;
      draftBill.distributorName = selectedDist.name;
    }
  });

  // Line item inline editing
  container.querySelectorAll('[data-item-field]').forEach(input => {
    input.addEventListener('change', (e) => {
      const field = input.getAttribute('data-item-field');
      const idx = parseInt(input.getAttribute('data-item-index'), 10);
      if (draftBill.items[idx]) {
        let val = e.target.value;
        if (field === 'quantity' || field === 'purchaseRate') {
          val = parseFloat(val) || 0;
        }
        draftBill.items[idx][field] = val;
        // Recalculate totals
        const qty = draftBill.items[idx].quantity || 0;
        const rate = draftBill.items[idx].purchaseRate || 0;
        draftBill.items[idx].taxableValue = Number((qty * rate).toFixed(2));
        draftBill.items[idx].total = Number((draftBill.items[idx].taxableValue * 1.12).toFixed(2));
      }
    });
  });

  // Remove Item
  container.querySelectorAll('[data-remove-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-remove-item'), 10);
      draftBill.items.splice(idx, 1);
      router.renderCurrentView();
    });
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
      genericSalt: "Active Formulation",
      batchNumber: "MAN-" + Math.floor(1000 + Math.random() * 9000),
      expiryDate: `${new Date().getFullYear() + 2}-08-31`,
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

  // Discard / Reject
  container.querySelector('#ocr-reject-btn')?.addEventListener('click', () => {
    if (confirm("Discard this scan and return to bills?")) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      router.navigate('bills');
    }
  });

  // Confirm & Save Bill
  container.querySelector('#ocr-save-bill-btn')?.addEventListener('click', async () => {
    const invoiceNum = container.querySelector('#ocr-bill-number').value.trim();
    const invoiceDate = container.querySelector('#ocr-bill-date').value;

    if (!invoiceNum) {
      alert("Please provide an invoice number.");
      return;
    }

    if (draftBill.items.length === 0) {
      alert("Please add at least one line item before saving.");
      return;
    }

    isUploadingBill = true;
    router.renderCurrentView();

    try {
      const pharmacyId = authService.user?.pharmacyId || 'pharmacy_sri_maheswari';
      const billId = `bill_${Date.now()}`;
      let storageUrl = previewImageUrl;

      // Upload raw invoice image to Firebase Storage: bills/{pharmacyId}/{billId}.jpg
      if (currentImageBlob) {
        const uploadRes = await storageService.uploadBillImage(currentImageBlob, pharmacyId, billId);
        if (uploadRes?.url) {
          storageUrl = uploadRes.url;
        }
      }

      const subtotal = draftBill.items.reduce((sum, it) => sum + (it.taxableValue || (it.quantity * it.purchaseRate)), 0);
      const gstTotal = draftBill.items.reduce((sum, it) => sum + (it.total - (it.taxableValue || (it.quantity * it.purchaseRate))), 0);
      const grandTotal = subtotal + gstTotal;

      // Save purchase bill + batch records via dbService
      await dbService.savePurchaseBill({
        ...draftBill,
        id: billId,
        invoiceNumber: invoiceNum,
        invoiceDate: invoiceDate,
        imageUrl: storageUrl,
        subtotal,
        totalTax: gstTotal,
        grandTotal,
        status: "verified"
      });

      alert(`Purchase Bill #${invoiceNum} verified and recorded! Batches and distributor balances have been synced in Cloud Firestore.`);
      router.navigate('bills');
    } catch (saveErr) {
      console.error("Failed to save verified bill:", saveErr);
      alert(`Error saving bill: ${saveErr.message}`);
    } finally {
      isUploadingBill = false;
      router.renderCurrentView();
    }
  });
}
