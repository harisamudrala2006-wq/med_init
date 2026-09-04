// Reports & Analytics View (Phase 16)
// Computed entirely from real database records (Single Source of Truth)

import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

export function renderReportsView() {
  const finances = dbService.getOverallFinances();
  const distributors = dbService.getDistributors();
  const batches = dbService.getBatches();
  const anomalies = dbService.getPriceAnomalies();

  // Top purchased products
  const productTally = {};
  dbService.getPurchaseBills().filter(b => b.status === 'verified').forEach(bill => {
    (bill.items || []).forEach(item => {
      if (!productTally[item.productName]) {
        productTally[item.productName] = { name: item.productName, qty: 0, spend: 0 };
      }
      productTally[item.productName].qty += Number(item.quantity || 0);
      productTally[item.productName].spend += Number(item.total || 0);
    });
  });

  const topProducts = Object.values(productTally).sort((a, b) => b.spend - a.spend).slice(0, 5);

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              Financial Reports & Analytics
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Comprehensive real-time ledger breakdowns and inventory movement audits.
            </p>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-space-xs">
          <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm border border-outline-variant/30">
            <span class="font-label-caps text-label-caps text-on-surface-variant uppercase font-bold">Total Purchases</span>
            <div class="font-headline-lg font-bold text-on-surface font-code-num mt-1">
              ₹${finances.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span class="text-[11px] text-on-surface-variant">From ${finances.invoiceCount} Verified Invoices</span>
          </div>

          <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm border border-outline-variant/30">
            <span class="font-label-caps text-label-caps text-secondary font-bold uppercase">Total Settled</span>
            <div class="font-headline-lg font-bold text-secondary dark:text-secondary-fixed font-code-num mt-1">
              ₹${finances.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span class="text-[11px] text-on-surface-variant">Reconciled Payments</span>
          </div>

          <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-sm shadow-sm border border-outline-variant/30">
            <span class="font-label-caps text-label-caps text-tertiary font-bold uppercase">Net Outstanding</span>
            <div class="font-headline-lg font-bold text-tertiary font-code-num mt-1">
              ₹${finances.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span class="text-[11px] text-tertiary">Payables Balance</span>
          </div>
        </div>

        <!-- Distributor Outstanding Breakdown Table -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-3">
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Distributor Outstanding Ledger
          </h2>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-body-sm">
              <thead class="border-b border-outline-variant/20 text-on-surface-variant font-label-caps uppercase">
                <tr>
                  <th class="py-2">Distributor</th>
                  <th class="py-2">Purchases</th>
                  <th class="py-2">Settled</th>
                  <th class="py-2">Outstanding Due</th>
                  <th class="py-2">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/15">
                ${distributors.length === 0 ? `
                  <tr>
                    <td colspan="5" class="py-8 text-center text-on-surface-variant">
                      <span class="material-symbols-outlined text-[32px] text-outline mb-1 block">local_shipping</span>
                      <p class="font-medium text-xs">No distributor accounts registered yet.</p>
                      <p class="text-[11px] text-outline mt-0.5">Register distributors to track ledger balances and payment settlement history.</p>
                    </td>
                  </tr>
                ` : distributors.map(dist => {
                  const f = dbService.getDistributorFinances(dist.id);
                  return `
                    <tr>
                      <td class="py-2.5 font-medium text-on-surface">${dist.name}</td>
                      <td class="py-2.5 font-code-num">₹${f.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td class="py-2.5 font-code-num text-secondary">₹${f.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td class="py-2.5 font-code-num font-bold text-tertiary">₹${f.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td class="py-2.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${f.outstanding > 0 ? 'bg-tertiary-container/20 text-tertiary' : 'bg-secondary-container text-primary'}">
                          ${f.outstanding > 0 ? 'Pending' : 'Settled'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Purchased Products -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-3">
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Top Purchased Products by Value
          </h2>
          <div class="space-y-2">
            ${topProducts.length === 0 ? `
              <div class="py-8 text-center text-on-surface-variant border border-dashed border-outline-variant/30 rounded-xl">
                <span class="material-symbols-outlined text-[32px] text-outline mb-1 block">inventory_2</span>
                <p class="font-medium text-xs">No purchase invoice items recorded yet.</p>
                <p class="text-[11px] text-outline mt-0.5">Verified purchase bills will automatically rank top medicines here.</p>
              </div>
            ` : topProducts.map((p, i) => `
              <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low dark:bg-surface-container-high text-body-sm">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-primary-container text-on-primary font-bold text-[12px] flex items-center justify-center">
                    ${i + 1}
                  </span>
                  <div>
                    <span class="font-medium text-on-surface block">${p.name}</span>
                    <span class="text-on-surface-variant text-[11px]">${p.qty} packs purchased</span>
                  </div>
                </div>
                <div class="text-right font-code-num font-semibold text-primary dark:text-primary-fixed">
                  ₹${p.spend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </main>
  `;
}

export function bindReportsEvents(container, router) {}
