// Payment Receipt Workflow View (Phase 10)
// Preserves accounting rule: Outstanding = Verified Purchases - Verified Payments

import { dbService } from '../services/dbService.js';
import { storageService } from '../services/storageService.js';
import { authService } from '../services/authService.js';
import { i18n } from '../context/i18nState.js';

export function renderPaymentsView() {
  const distributors = dbService.getDistributors();
  const allPayments = dbService.getPayments();

  const totalSettled = allPayments
    .filter(p => p.status === 'verified')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              Payments & Receipt Allocation
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Total Verified Settlements: <span class="font-semibold text-secondary font-code-num">₹${totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        <!-- Receipt Intake Form Card -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-4">
          <div class="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span class="material-symbols-outlined text-primary text-[22px]">payments</span>
            <h2 class="font-headline-sm text-headline-sm text-on-surface">Record New Verified Settlement</h2>
          </div>

          <form id="record-payment-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <!-- Distributor Selector -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Select Distributor</label>
                <select id="pay-distributor-select" class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30 cursor-pointer">
                  ${distributors.map(d => `
                    <option value="${d.id}">${d.name}</option>
                  `).join('')}
                </select>
              </div>

              <!-- Payment Amount -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Payment Amount (₹)</label>
                <input id="pay-amount-input" type="number" step="0.01" placeholder="e.g. 5000.00" required class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface font-code-num focus:ring-2 focus:ring-primary border border-outline-variant/30" />
              </div>

              <!-- Payment Method -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Payment Method</label>
                <select id="pay-method-select" class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30 cursor-pointer">
                  <option value="bank_transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash Counter Receipt</option>
                </select>
              </div>
            </div>

            <!-- Dynamic Outstanding Simulation Strip -->
            <div id="payment-calc-strip" class="p-space-sm rounded-lg bg-surface-container-low dark:bg-surface-container-high grid grid-cols-3 gap-2 text-body-sm">
              <div>
                <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Prior Outstanding</span>
                <span id="calc-prior-outstanding" class="font-headline-sm font-bold text-tertiary font-code-num">₹0.00</span>
              </div>
              <div>
                <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Payment Amount</span>
                <span id="calc-payment-amt" class="font-headline-sm font-bold text-secondary font-code-num">₹0.00</span>
              </div>
              <div>
                <span class="font-label-caps text-label-caps text-primary block uppercase font-bold">Remaining Outstanding</span>
                <span id="calc-remaining-outstanding" class="font-headline-sm font-bold text-primary font-code-num">₹0.00</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Reference Number (UTR / Cheque / Txn ID)</label>
                <input id="pay-ref-input" type="text" placeholder="e.g. HDFC-NEFT-8899201" class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30" />
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Payment Date</label>
                <input id="pay-date-input" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30" />
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">Attach Proof / Receipt (Optional)</label>
                <input id="pay-receipt-file" type="file" accept="image/*,.pdf" class="w-full h-11 px-3 py-2 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-sm text-on-surface file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-secondary-container file:text-primary cursor-pointer border border-outline-variant/30" />
              </div>
            </div>

            <button type="submit" id="pay-submit-btn" class="w-full h-12 bg-primary-container text-on-primary font-headline-sm text-body-md rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Verify & Record Payment Settlement</span>
            </button>
          </form>
        </div>

        <!-- Payments History Feed -->
        <div class="space-y-space-xs">
          <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-bold">
            Settlement Audit Feed
          </span>
          ${allPayments.length === 0 ? `
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-6 text-center text-on-surface-variant border border-outline-variant/30 flex flex-col items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[32px] text-outline">payments</span>
              <p class="font-headline-sm text-sm">No Payment Settlements Recorded</p>
              <p class="font-body-sm text-xs">Recorded distributor payments and remittances will appear here.</p>
            </div>
          ` : allPayments.map(p => `
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-secondary-container dark:bg-secondary-container/40 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">${p.distributorName}</h3>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Ref: <span class="font-code-num text-on-surface font-medium">${p.referenceNumber || 'N/A'}</span> • Method: ${p.paymentMethod.toUpperCase()} • Date: ${p.paymentDate}
                    ${p.receiptUrl ? ` • <a href="${p.receiptUrl}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium inline-flex items-center gap-0.5"><span class="material-symbols-outlined text-[14px]">attachment</span>View Receipt</a>` : ''}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <span class="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed font-code-num block">
                  ₹${Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span class="text-[11px] font-bold text-secondary">Verified Settlement</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </main>
  `;
}

export function bindPaymentsEvents(container, router) {
  const distSelect = container.querySelector('#pay-distributor-select');
  const amountInput = container.querySelector('#pay-amount-input');
  const priorEl = container.querySelector('#calc-prior-outstanding');
  const amtEl = container.querySelector('#calc-payment-amt');
  const remEl = container.querySelector('#calc-remaining-outstanding');

  function updateCalc() {
    if (!distSelect || !amountInput) return;
    const distId = distSelect.value;
    const finances = dbService.getDistributorFinances(distId);
    const amount = parseFloat(amountInput.value) || 0;
    const remaining = Math.max(0, finances.outstanding - amount);

    priorEl.textContent = `₹${finances.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    amtEl.textContent = `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    remEl.textContent = `₹${remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  distSelect?.addEventListener('change', updateCalc);
  amountInput?.addEventListener('input', updateCalc);
  updateCalc();

  // Handle submit
  container.querySelector('#record-payment-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const distId = distSelect.value;
    const dist = dbService.getDistributorById(distId);
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const refNumber = container.querySelector('#pay-ref-input').value.trim() || `REC-${Date.now()}`;
    const paymentMethod = container.querySelector('#pay-method-select').value;
    const paymentDate = container.querySelector('#pay-date-input').value;
    const receiptFileInput = container.querySelector('#pay-receipt-file');
    const submitBtn = container.querySelector('#pay-submit-btn');

    let receiptUrl = '';
    const file = receiptFileInput?.files?.[0];

    if (file) {
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span>Uploading Receipt...</span>`;
        }
        const pharmacyId = authService.user?.pharmacyId || 'pharmacy_sri_maheswari';
        const uploadRes = await storageService.uploadReceiptImage(file, pharmacyId, `pay_${Date.now()}`);
        if (uploadRes?.url) {
          receiptUrl = uploadRes.url;
        }
      } catch (err) {
        console.warn("Could not upload receipt:", err);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    }

    dbService.savePayment({
      distributorId: dist.id,
      distributorName: dist.name,
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber: refNumber,
      receiptUrl,
      status: "verified"
    });

    alert(`Payment of ₹${amount.toFixed(2)} to ${dist.name} recorded and verified! Distributor outstanding balance updated.`);
    router.renderCurrentView();
  });
}
