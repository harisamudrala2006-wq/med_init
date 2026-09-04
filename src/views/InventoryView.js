// Batch Inventory & Expiry Tracking View (Phases 11 & 12)
import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

let searchQuery = '';
let filterExpiry = 'all';

export function setInventoryFilter(query = '', expiry = 'all') {
  searchQuery = query;
  filterExpiry = expiry;
}

export function renderInventoryView(params = {}) {
  if (params && params.search !== undefined) {
    searchQuery = params.search;
  }
  const batches = dbService.getBatches();
  const now = new Date();

  const enrichedBatches = batches.map(b => {
    const exp = new Date(b.expiryDate);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    let cat = 'safe';
    if (diffDays <= 0) cat = 'expired';
    else if (diffDays <= 30) cat = '30';
    else if (diffDays <= 60) cat = '60';
    else if (diffDays <= 90) cat = '90';

    return {
      ...b,
      daysLeft: diffDays,
      cat
    };
  });

  const filtered = enrichedBatches.filter(b => {
    const matchesSearch = !searchQuery || 
      b.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.genericSalt && b.genericSalt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExpiry = 
      filterExpiry === 'all' || 
      (filterExpiry === 'expired' && b.daysLeft <= 0) ||
      (filterExpiry === '30' && b.daysLeft > 0 && b.daysLeft <= 30) ||
      (filterExpiry === '60' && b.daysLeft > 30 && b.daysLeft <= 60) ||
      (filterExpiry === '90' && b.daysLeft > 60 && b.daysLeft <= 90);

    return matchesSearch && matchesExpiry;
  });

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Header & Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              ${i18n.t('batchInventory')}
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Batch-level tracking with expiry alerts and audit-logged manual adjustments.
            </p>
          </div>
        </div>

        <!-- Expiry Buckets Quick Filter Strip (Phase 12) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button 
            data-exp-filter="expired"
            class="p-space-xs rounded-xl bg-surface-container-lowest dark:bg-surface-container text-left border border-outline-variant/30 hover:border-error transition-all cursor-pointer ${filterExpiry === 'expired' ? 'ring-2 ring-error' : ''}"
          >
            <span class="font-label-caps text-label-caps text-error uppercase font-bold block">Expired</span>
            <span class="font-headline-sm font-bold text-error font-code-num">
              ${enrichedBatches.filter(b => b.daysLeft <= 0).length} Batches
            </span>
          </button>

          <button 
            data-exp-filter="30"
            class="p-space-xs rounded-xl bg-surface-container-lowest dark:bg-surface-container text-left border border-outline-variant/30 hover:border-error transition-all cursor-pointer ${filterExpiry === '30' ? 'ring-2 ring-error' : ''}"
          >
            <span class="font-label-caps text-label-caps text-error uppercase font-bold block">&lt; 30 Days</span>
            <span class="font-headline-sm font-bold text-error font-code-num">
              ${enrichedBatches.filter(b => b.daysLeft > 0 && b.daysLeft <= 30).length} Batches
            </span>
          </button>

          <button 
            data-exp-filter="60"
            class="p-space-xs rounded-xl bg-surface-container-lowest dark:bg-surface-container text-left border border-outline-variant/30 hover:border-tertiary transition-all cursor-pointer ${filterExpiry === '60' ? 'ring-2 ring-tertiary' : ''}"
          >
            <span class="font-label-caps text-label-caps text-tertiary uppercase font-bold block">30–60 Days</span>
            <span class="font-headline-sm font-bold text-tertiary font-code-num">
              ${enrichedBatches.filter(b => b.daysLeft > 30 && b.daysLeft <= 60).length} Batches
            </span>
          </button>

          <button 
            data-exp-filter="all"
            class="p-space-xs rounded-xl bg-surface-container-lowest dark:bg-surface-container text-left border border-outline-variant/30 hover:border-primary transition-all cursor-pointer ${filterExpiry === 'all' ? 'ring-2 ring-primary' : ''}"
          >
            <span class="font-label-caps text-label-caps text-primary uppercase font-bold block">All Stock</span>
            <span class="font-headline-sm font-bold text-primary font-code-num">
              ${enrichedBatches.length} Total
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative flex items-center w-full">
          <span class="absolute left-3 text-outline pointer-events-none flex items-center">
            <span class="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input 
            id="inv-search-input"
            class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest dark:bg-surface-container text-on-surface rounded-xl border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            placeholder="Search medicine brand, composition, batch code..." 
            type="text" 
            value="${searchQuery}"
          />
        </div>

        <!-- Inventory Batches List -->
        <div class="space-y-space-xs">
          ${filtered.map(batch => {
            const isExp = batch.daysLeft <= 0;
            const isCritical = batch.daysLeft > 0 && batch.daysLeft <= 30;
            const isWarning = batch.daysLeft > 30 && batch.daysLeft <= 60;

            const badgeBg = isExp ? 'bg-error-container text-error' :
                            isCritical ? 'bg-error-container/50 text-error' :
                            isWarning ? 'bg-tertiary-container/30 text-tertiary' :
                            'bg-secondary-container text-primary';

            const badgeText = isExp ? 'EXPIRED' :
                              isCritical ? `Expiring in ${batch.daysLeft}d` :
                              isWarning ? `Expiring in ${batch.daysLeft}d` :
                              `Safe (${batch.daysLeft}d)`;

            return `
              <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-all">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                      ${batch.productName}
                    </h2>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}">
                      ${badgeText}
                    </span>
                  </div>
                  <p class="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Composition: ${batch.genericSalt || 'Standard Clinical Formulation'}
                  </p>
                  <div class="flex flex-wrap items-center gap-2 text-body-sm text-on-surface-variant pt-1">
                    <span class="bg-surface-container-low dark:bg-surface-container-high px-2 py-0.5 rounded font-code-num text-on-surface">
                      B.No: ${batch.batchNumber}
                    </span>
                    <span class="font-code-num text-on-surface">
                      Exp: ${batch.expiryDate}
                    </span>
                    <span>•</span>
                    <span>Pack: ${batch.packSize || '10 Tabs'}</span>
                    <span>•</span>
                    <span>Vendor: ${batch.distributorName}</span>
                  </div>
                </div>

                <!-- Stock Quantity & Adjust Stock Action -->
                <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/20 gap-1 flex-shrink-0">
                  <div class="text-left sm:text-right">
                    <span class="font-headline-md text-headline-md font-bold text-on-surface font-code-num block">
                      ${batch.quantityInUnits} <span class="text-body-sm font-normal text-on-surface-variant">units</span>
                    </span>
                    <span class="font-body-sm text-body-sm text-on-surface-variant font-code-num">
                      Purchase: ₹${Number(batch.purchaseRate).toFixed(2)} | MRP: ₹${batch.mrp || (batch.purchaseRate * 1.25).toFixed(2)}
                    </span>
                  </div>
                  <button 
                    data-adjust-stock="${batch.id}"
                    class="px-3 py-1.5 bg-surface-container-low dark:bg-surface-container-high hover:bg-surface-container text-primary dark:text-primary-fixed rounded-lg font-label-md text-label-md flex items-center gap-1 border border-outline-variant/30 cursor-pointer active:scale-95 transition-all"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    <span>${i18n.t('adjustStock')}</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    </main>
  `;
}

export function bindInventoryEvents(container, router) {
  // Search
  container.querySelector('#inv-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    router.renderCurrentView();
  });

  // Filter
  container.querySelectorAll('[data-exp-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      filterExpiry = btn.getAttribute('data-exp-filter');
      router.renderCurrentView();
    });
  });

  // Adjust Stock (Phase 11 Requirement: Requires quantity change + reason + user + date/time)
  container.querySelectorAll('[data-adjust-stock]').forEach(btn => {
    btn.addEventListener('click', () => {
      const batchId = btn.getAttribute('data-adjust-stock');
      const changeStr = prompt("Enter stock quantity adjustment (e.g. +10 for return, -5 for damage/breakage):", "-2");
      if (!changeStr) return;

      const change = parseInt(changeStr, 10);
      if (isNaN(change)) {
        alert("Invalid quantity adjustment value.");
        return;
      }

      const reason = prompt("Mandatory Reason for Stock Adjustment (e.g., 'Broken strip during dispense', 'Physical count audit', 'Customer return'):");
      if (!reason || !reason.trim()) {
        alert("A valid clinical adjustment reason is required by regulatory audit standards.");
        return;
      }

      dbService.adjustInventory(batchId, change, reason.trim());
      alert("Inventory successfully updated and recorded in the audit trail.");
      router.renderCurrentView();
    });
  });
}
