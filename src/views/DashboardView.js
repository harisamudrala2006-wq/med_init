// Dashboard View (Preserves Stitch Dashboard UI Exactly)
// Replaces hardcoded calculations with live Firestore-derived finances (Single Source of Truth)

import { pharmacyState } from '../context/pharmacyState.js';
import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

export function renderDashboardView() {
  const profile = pharmacyState.profile;
  const finances = dbService.getOverallFinances();
  const recentBills = dbService.getPurchaseBills().slice(0, 3);
  const recentPayments = dbService.getPayments().slice(0, 2);

  // Combine recent activities
  const activities = [
    ...recentBills.map(b => ({
      type: 'bill',
      title: b.distributorName,
      badge: b.status === 'verified' ? 'Verified' : 'Needs Verification',
      badgeClass: b.status === 'verified' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-tertiary-container/30 text-tertiary',
      desc: `#${b.invoiceNumber} • ${(b.items || []).length} items`,
      amount: `₹${Number(b.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amountColor: 'text-on-surface',
      icon: 'receipt_long',
      date: new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    })),
    ...recentPayments.map(p => ({
      type: 'payment',
      title: p.distributorName,
      badge: 'Paid',
      badgeClass: 'bg-secondary-container text-primary font-bold',
      desc: `Ref #${p.referenceNumber || 'REC'} • ${p.paymentMethod.toUpperCase()}`,
      amount: `₹${Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amountColor: 'text-primary dark:text-primary-fixed',
      icon: 'payments',
      date: new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }))
  ].slice(0, 4);

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Pharmacy Operating Status Header Pill -->
        <div class="flex items-center justify-between bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm border border-outline-variant/30">
          <div class="flex items-center gap-space-xs min-w-0">
            <div class="w-9 h-9 rounded-full bg-secondary-container dark:bg-secondary-container/50 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-primary-container dark:text-primary-fixed text-[20px]">verified</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-headline-sm text-headline-sm text-on-surface truncate">
                ${profile.name}
              </span>
              <span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse"></span>
                ${profile.shiftInfo}
              </span>
            </div>
          </div>
          <span class="font-label-caps text-label-caps bg-surface-container dark:bg-surface-container-high px-space-xs py-1 rounded-full text-primary dark:text-primary-fixed font-semibold flex-shrink-0">
            LIVE OCR
          </span>
        </div>

        <!-- Financial Summary: 2x2 Grid (Derived from Database) -->
        <section class="space-y-space-xs">
          <div class="flex items-center justify-between px-space-2xs">
            <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-bold">
              ${i18n.t('financialOverview')}
            </span>
            <span class="font-body-sm text-body-sm text-on-surface-variant font-medium">
              FY 2024–25
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-xs">
            <!-- 1. Outstanding Metric (Prominent Tile) -->
            <div class="bg-primary-container text-on-primary rounded-xl p-space-sm shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-caps text-label-caps text-on-primary-container uppercase tracking-wide">
                    ${i18n.t('outstanding')}
                  </span>
                  <span class="material-symbols-outlined text-on-primary-container text-[20px]">pending_actions</span>
                </div>
                <p class="font-headline-lg text-headline-lg font-bold tracking-tight text-white">
                  ₹${finances.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div class="pt-space-xs flex items-center gap-1">
                <span class="font-label-md text-label-md bg-white/20 text-white px-2 py-0.5 rounded-full">
                  ${finances.invoiceCount} ${i18n.t('invoicesDue')}
                </span>
              </div>
            </div>

            <!-- 2. Total Purchases -->
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wide">
                    ${i18n.t('purchases')}
                  </span>
                  <span class="material-symbols-outlined text-outline text-[20px]">shopping_cart</span>
                </div>
                <p class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  ₹${finances.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                ${finances.invoiceCount} Verified Invoices
              </p>
            </div>

            <!-- 3. Total Paid -->
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wide">
                    ${i18n.t('totalPaid')}
                  </span>
                  <span class="material-symbols-outlined text-primary dark:text-primary-fixed text-[20px]">check_circle</span>
                </div>
                <p class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  ₹${finances.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                ${i18n.t('reconciledBankUpi')}
              </p>
            </div>

            <!-- 4. Expiring Soon -->
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm flex flex-col justify-between border border-outline-variant/30">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wide">
                    ${i18n.t('expiringSoon')}
                  </span>
                  <span class="material-symbols-outlined text-error text-[20px]">hourglass_bottom</span>
                </div>
                <p class="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                  ${finances.expiringCount} Batches
                </p>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                ${i18n.t('withinDays')}
              </p>
            </div>
          </div>
        </section>

        <!-- Fast Dispense & Intake Quick Actions -->
        <section class="space-y-space-xs">
          <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider px-space-2xs font-bold">
            ${i18n.t('fastDispense')}
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            <!-- Action 1: Upload Bill -->
            <button 
              id="dash-upload-bill"
              class="flex items-center gap-space-xs bg-primary-container text-on-primary rounded-xl p-space-sm text-left shadow-sm active:scale-95 transition-all cursor-pointer" 
              type="button"
            >
              <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-[22px]">document_scanner</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-headline-sm text-headline-sm font-semibold truncate leading-tight">${i18n.t('uploadBill')}</span>
                <span class="font-label-sm text-label-sm text-on-primary-container truncate">OCR Intake</span>
              </div>
            </button>

            <!-- Action 2: Add Receipt -->
            <button 
              id="dash-add-receipt"
              class="flex items-center gap-space-xs bg-surface-container-lowest dark:bg-surface-container text-on-surface rounded-xl p-space-sm text-left shadow-sm border border-outline-variant/30 active:scale-95 transition-all cursor-pointer" 
              type="button"
            >
              <div class="w-10 h-10 rounded-lg bg-secondary-container dark:bg-secondary-container/40 text-primary flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-headline-sm text-headline-sm font-semibold truncate leading-tight">${i18n.t('addReceipt')}</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant truncate">Settle Dues</span>
              </div>
            </button>

            <!-- Action 3: Batch Stock -->
            <button 
              id="dash-view-inventory"
              class="flex items-center gap-space-xs bg-surface-container-lowest dark:bg-surface-container text-on-surface rounded-xl p-space-sm text-left shadow-sm border border-outline-variant/30 active:scale-95 transition-all cursor-pointer" 
              type="button"
            >
              <div class="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-container-highest text-on-surface flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-headline-sm text-headline-sm font-semibold truncate leading-tight">${i18n.t('inventory')}</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant truncate">Batch Audits</span>
              </div>
            </button>

            <!-- Action 4: Distributor Ledgers -->
            <button 
              id="dash-view-distributors"
              class="flex items-center gap-space-xs bg-surface-container-lowest dark:bg-surface-container text-on-surface rounded-xl p-space-sm text-left shadow-sm border border-outline-variant/30 active:scale-95 transition-all cursor-pointer" 
              type="button"
            >
              <div class="w-10 h-10 rounded-lg bg-surface-container-high dark:bg-surface-container-highest text-on-surface flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-headline-sm text-headline-sm font-semibold truncate leading-tight">${i18n.t('distributors')}</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant truncate">Live Ledgers</span>
              </div>
            </button>
          </div>
        </section>

        <!-- Audit Reconciliation Live Formula Banner (Single Source of Truth Proof) -->
        <section class="bg-surface-container-low dark:bg-surface-container rounded-xl p-space-sm space-y-space-xs border border-outline-variant/30">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary dark:text-primary-fixed text-[18px]">calculate</span>
              <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wide font-bold">
                ${i18n.t('auditVerificationLog')}
              </span>
            </div>
            <span class="font-label-caps text-label-caps bg-surface-container-lowest dark:bg-surface-container-high px-2.5 py-0.5 rounded-full text-primary dark:text-primary-fixed font-bold border border-outline-variant/20">
              ${i18n.t('balanced')}
            </span>
          </div>
          <div class="p-space-xs bg-surface-container-lowest dark:bg-surface-container-low rounded-lg">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between text-body-sm font-body-sm text-on-surface-variant gap-1">
              <span>
                Purchases (₹${finances.totalPurchases.toLocaleString('en-IN')}) − Paid (₹${finances.totalPaid.toLocaleString('en-IN')})
              </span>
              <span class="font-bold text-primary dark:text-primary-fixed">
                = ₹${finances.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Outstanding
              </span>
            </div>
          </div>
        </section>

        <!-- Visual Activity Context Card (Stitch Photo Asset) -->
        <div class="relative w-full rounded-xl overflow-hidden shadow-sm h-32">
          <img 
            alt="Pharmaceutical dispensary interior" 
            class="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfA5kwMjBwFgNHX9eIbrMD8fOQiW8lNlXSdP2kVcaO25Oy9CK49EXoWAVEwGNr85TrPg6tMnJStRyEDi0x2WNsw_IQ0aqe_ur3bIQw34zrCU42_GxUhdJgJk1n55AUt7pIYxPkup-9mHUuASOJXaFko1q2jy0emlYBqolWEvMFSBoBQYcau5aPbQ9va2e89B-0X6fZQquGC0QWvfDezEkm0YbFTzjQ72oTeMGJ4T3xj74imXK5HmFBmQ"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-on-surface/85 via-on-surface/50 to-transparent p-space-sm flex flex-col justify-end">
            <span class="font-label-caps text-label-caps text-surface-container uppercase tracking-wider font-bold">
              Dispensary & Cold Chain Operations
            </span>
            <p class="font-headline-sm text-headline-sm text-white font-medium">
              ${profile.name} • Certified Indian Pharmacy Standards
            </p>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <section class="space-y-space-xs">
          <div class="flex items-center justify-between px-space-2xs">
            <span class="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider font-bold">
              ${i18n.t('recentActivity')}
            </span>
            <button id="dash-view-all-bills" class="font-label-md text-label-md text-primary dark:text-primary-fixed font-semibold hover:underline cursor-pointer">
              ${i18n.t('viewAll')}
            </button>
          </div>

          <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl shadow-sm p-space-xs space-y-space-xs border border-outline-variant/30">
            ${activities.length === 0 ? `
              <div class="py-8 text-center text-on-surface-variant flex flex-col items-center justify-center gap-1.5">
                <span class="material-symbols-outlined text-[32px] text-outline">history</span>
                <p class="font-headline-sm text-sm font-semibold text-on-surface">No Recent Activity</p>
                <p class="font-body-sm text-xs text-on-surface-variant">Invoices and payments you record will appear here.</p>
              </div>
            ` : activities.map(act => `
              <div class="flex items-center justify-between p-space-xs hover:bg-surface-container-low dark:hover:bg-surface-container-high rounded-lg transition-colors">
                <div class="flex items-center gap-space-xs min-w-0">
                  <div class="w-8 h-8 rounded-full bg-surface-container dark:bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary dark:text-primary-fixed">
                    <span class="material-symbols-outlined text-[18px]">${act.icon}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                        ${act.title}
                      </span>
                      <span class="font-label-caps text-label-caps ${act.badgeClass} px-1.5 py-0.2 rounded">
                        ${act.badge}
                      </span>
                    </div>
                    <p class="font-body-sm text-body-sm text-on-surface-variant truncate">
                      ${act.desc}
                    </p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="font-headline-sm text-headline-sm font-semibold ${act.amountColor}">
                    ${act.amount}
                  </span>
                  <span class="block font-body-sm text-body-sm text-on-surface-variant">
                    ${act.date}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

      </div>
    </main>
  `;
}

export function bindDashboardEvents(container, router) {
  container.querySelector('#dash-upload-bill')?.addEventListener('click', () => router.navigate('upload-ocr'));
  container.querySelector('#dash-add-receipt')?.addEventListener('click', () => router.navigate('payments'));
  container.querySelector('#dash-view-inventory')?.addEventListener('click', () => router.navigate('inventory'));
  container.querySelector('#dash-view-distributors')?.addEventListener('click', () => router.navigate('distributors'));
  container.querySelector('#dash-view-all-bills')?.addEventListener('click', () => router.navigate('bills'));
}
