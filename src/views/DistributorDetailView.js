// Distributor Details & Ledger View (Phase 9, 10, 21)
// Replicates Stitch Distributor_Details_Dark_Mode_781dd93c.html with dual-entry reconciliation proof

import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

let activeTab = 'invoices';

export function renderDistributorDetailView(distributorId) {
  const dist = dbService.getDistributorById(distributorId) || dbService.getDistributors()[0];
  if (!dist) {
    return `<div class="p-8 text-center text-on-surface">Distributor not found.</div>`;
  }

  const finances = dbService.getDistributorFinances(dist.id);
  const bills = finances.bills;
  const payments = finances.payments;

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Back Button & Breadcrumbs -->
        <div class="flex items-center gap-2">
          <button id="detail-back-btn" class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer text-on-surface">
            <span class="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <span class="font-label-md text-label-md text-on-surface-variant">Distributors / ${dist.name}</span>
        </div>

        <!-- Distributor Identity Card -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-3">
          <div class="flex items-start justify-between gap-space-sm">
            <div class="flex items-center gap-space-sm min-w-0">
              <div class="w-12 h-12 rounded-lg bg-surface-container-low dark:bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
                <span class="material-symbols-outlined text-[28px]">domain</span>
              </div>
              <div class="min-w-0">
                <h1 class="font-headline-sm text-headline-sm text-on-surface truncate">${dist.name}</h1>
                <p class="font-code-num text-body-sm text-on-surface-variant truncate">GSTIN: ${dist.gstin} • DL: ${dist.dlNumber}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded text-[11px] font-bold ${
              finances.outstanding > 0 ? 'bg-tertiary-container/20 text-tertiary' : 'bg-secondary-container text-primary'
            } flex-shrink-0">
              ${finances.outstanding > 0 ? 'Payment Due' : 'Account Settled'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body-sm text-on-surface-variant pt-2 border-t border-outline-variant/20">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[18px] text-outline">location_on</span>
              <span class="truncate">${dist.address}</span>
            </div>
            <div class="flex items-center gap-1.5 sm:justify-end">
              <span class="material-symbols-outlined text-[18px] text-outline">call</span>
              <a href="tel:${dist.phone}" class="text-secondary font-medium hover:underline">${dist.phone}</a>
            </div>
          </div>
        </div>

        <!-- Financial Ledger Highlight Cards -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-2">
          <div class="flex items-center justify-between pb-1">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider font-bold">
              ${i18n.t('accountingSummary')}
            </span>
            <span class="font-label-caps text-label-caps text-primary font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">sync_alt</span>
              FY 2024–25
            </span>
          </div>

          <div class="grid grid-cols-3 gap-space-xs">
            <div class="bg-surface-container-low dark:bg-surface-container-high rounded-lg p-space-sm flex flex-col justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">${i18n.t('grossInvoiced')}</span>
              <div class="mt-1 font-tabular-mono text-on-surface font-semibold text-headline-sm truncate">
                ₹${finances.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span class="text-[11px] text-outline font-label-sm">${finances.billCount} Invoices</span>
            </div>

            <div class="bg-surface-container-low dark:bg-surface-container-high rounded-lg p-space-sm flex flex-col justify-between">
              <span class="font-label-sm text-label-sm text-on-surface-variant">${i18n.t('settled')}</span>
              <div class="mt-1 font-tabular-mono text-secondary dark:text-secondary-fixed font-semibold text-headline-sm truncate">
                ₹${finances.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span class="text-[11px] text-secondary font-label-sm">${finances.paymentCount} Payments</span>
            </div>

            <div class="bg-surface-container-high dark:bg-surface-container-highest rounded-lg p-space-sm flex flex-col justify-between">
              <span class="font-label-sm text-label-sm text-tertiary font-bold">${i18n.t('outstanding')}</span>
              <div class="mt-1 font-tabular-mono text-tertiary font-bold text-headline-sm truncate">
                ₹${finances.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span class="text-[11px] text-tertiary font-label-sm">Due Balance</span>
            </div>
          </div>
        </div>

        <!-- Dual-Entry Reconciliation Proof Banner (From Stitch) -->
        <div class="bg-surface-container-low dark:bg-surface-container rounded-xl p-space-sm flex items-start gap-space-sm shadow-sm border border-outline-variant/30">
          <div class="w-8 h-8 rounded-lg bg-surface-container-high dark:bg-surface-container-highest flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
            <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 mb-0.5">
              <span class="font-label-sm text-label-sm text-primary dark:text-primary-fixed uppercase font-bold tracking-wide">
                ${i18n.t('dualEntryVerification')}
              </span>
              <span class="material-symbols-outlined text-primary text-[14px]">check_circle</span>
            </div>
            <p class="font-body-sm text-body-sm text-on-surface leading-snug">
              Total Purchases (<strong>₹${finances.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>) − Total Settled Payments (<strong>₹${finances.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>) = <strong class="text-tertiary">₹${finances.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> Verified Outstanding.
            </p>
          </div>
        </div>

        <!-- Action Buttons: Upload Bill & Record Payment -->
        <div class="grid grid-cols-2 gap-space-sm">
          <button 
            id="detail-upload-bill-btn"
            class="h-12 px-space-sm rounded-xl bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-sm" 
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
            <span>Upload Bill</span>
          </button>
          <button 
            id="detail-record-payment-btn"
            class="h-12 px-space-sm rounded-xl bg-surface-container-lowest dark:bg-surface-container text-on-surface border border-outline-variant/30 font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container active:scale-95 transition-all cursor-pointer shadow-sm" 
            type="button"
          >
            <span class="material-symbols-outlined text-[20px] text-secondary">payments</span>
            <span>${i18n.t('recordPayment')}</span>
          </button>
        </div>

        <!-- Ledger Tabs: Invoices vs Payments -->
        <div class="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <button 
            id="tab-invoices-btn"
            class="px-4 py-2 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
              activeTab === 'invoices' 
                ? 'bg-primary text-on-primary font-bold shadow-sm' 
                : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:text-on-surface'
            }"
            type="button"
          >
            Purchase Invoices (${bills.length})
          </button>
          <button 
            id="tab-payments-btn"
            class="px-4 py-2 rounded-lg font-label-md text-label-md cursor-pointer transition-all ${
              activeTab === 'payments' 
                ? 'bg-primary text-on-primary font-bold shadow-sm' 
                : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:text-on-surface'
            }"
            type="button"
          >
            Payment Receipts (${payments.length})
          </button>
        </div>

        <!-- Ledger Table / List -->
        <div class="space-y-space-xs">
          ${activeTab === 'invoices' ? (
            bills.length === 0 ? `<div class="p-6 text-center text-on-surface-variant">No invoices recorded for this distributor.</div>` :
            bills.map(b => `
              <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-surface-container-low dark:bg-surface-container-high flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[18px]">receipt_long</span>
                  </div>
                  <div>
                    <span class="font-headline-sm text-headline-sm text-on-surface block font-code-num">#${b.invoiceNumber}</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Date: ${b.invoiceDate} • ${(b.items || []).length} line items</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-headline-sm text-headline-sm font-semibold text-on-surface font-code-num block">
                    ₹${Number(b.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span class="text-[11px] font-bold text-primary">Verified</span>
                </div>
              </div>
            `).join('')
          ) : (
            payments.length === 0 ? `<div class="p-6 text-center text-on-surface-variant">No payments recorded for this distributor.</div>` :
            payments.map(p => `
              <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-secondary-container dark:bg-secondary-container/40 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-[18px]">payments</span>
                  </div>
                  <div>
                    <span class="font-headline-sm text-headline-sm text-on-surface block">Ref: ${p.referenceNumber || 'N/A'}</span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant">Date: ${p.paymentDate} • ${p.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-headline-sm text-headline-sm font-semibold text-primary font-code-num block">
                    ₹${Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span class="text-[11px] font-bold text-secondary">Verified Settlement</span>
                </div>
              </div>
            `).join('')
          )}
        </div>

      </div>
    </main>
  `;
}

export function bindDistributorDetailEvents(container, router, distributorId) {
  const dist = dbService.getDistributorById(distributorId);

  container.querySelector('#detail-back-btn')?.addEventListener('click', () => {
    router.navigate('distributors');
  });

  container.querySelector('#tab-invoices-btn')?.addEventListener('click', () => {
    activeTab = 'invoices';
    router.renderCurrentView();
  });

  container.querySelector('#tab-payments-btn')?.addEventListener('click', () => {
    activeTab = 'payments';
    router.renderCurrentView();
  });

  container.querySelector('#detail-upload-bill-btn')?.addEventListener('click', () => {
    router.navigate('upload-ocr');
  });

  // Record Payment Dialog
  container.querySelector('#detail-record-payment-btn')?.addEventListener('click', () => {
    if (!dist) return;
    const finances = dbService.getDistributorFinances(dist.id);
    const amountStr = prompt(`Record Verified Payment to ${dist.name}\nCurrent Outstanding: ₹${finances.outstanding.toFixed(2)}\nEnter Amount (₹):`, finances.outstanding.toFixed(2));
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive payment amount.");
      return;
    }

    const refNum = prompt("Enter Payment Reference Number (e.g., UTR / Cheque # / UPI ID):", "NEFT-" + Math.floor(100000 + Math.random() * 900000));

    dbService.savePayment({
      distributorId: dist.id,
      distributorName: dist.name,
      amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "bank_transfer",
      referenceNumber: refNum || "REC-" + Date.now(),
      status: "verified"
    });

    alert(`Payment of ₹${amount.toFixed(2)} to ${dist.name} recorded! Outstanding balance has been immediately reconciled.`);
    router.renderCurrentView();
  });
}
