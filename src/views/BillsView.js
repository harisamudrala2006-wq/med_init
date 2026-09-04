// Purchase Bills & Invoices View (Preserves Stitch Bills Design)
import { dbService } from '../services/dbService.js';
import { authService } from '../services/authService.js';
import { i18n } from '../context/i18nState.js';

let activeFilter = 'all';
let searchQuery = '';

export function renderBillsView() {
  const allBills = dbService.getPurchaseBills();
  
  const filteredBills = allBills.filter(bill => {
    const matchesFilter = 
      activeFilter === 'all' || 
      bill.status === activeFilter;
    const matchesSearch = 
      !searchQuery || 
      bill.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.distributorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const verifiedTotal = allBills
    .filter(b => b.status === 'verified')
    .reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Header & Action Row -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              ${i18n.t('purchaseBillsAndInvoices')}
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Total Verified Purchases: <span class="font-semibold text-primary font-code-num">₹${verifiedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
          <button 
            id="bills-upload-new"
            class="h-11 px-space-md bg-primary-container text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">add_a_photo</span>
            <span>${i18n.t('uploadScanBill')}</span>
          </button>
        </div>

        <!-- Search & Filter Controls -->
        <div class="flex flex-col sm:flex-row items-center gap-space-xs">
          <!-- Search Bar -->
          <div class="relative flex items-center w-full sm:flex-1">
            <span class="absolute left-3 text-outline pointer-events-none flex items-center">
              <span class="material-symbols-outlined text-[20px]">search</span>
            </span>
            <input 
              id="bills-search-input"
              class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest dark:bg-surface-container text-on-surface rounded-xl border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
              placeholder="Search invoice number, distributor..." 
              type="text" 
              value="${searchQuery}"
            />
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
            ${[
              { id: 'all', label: 'All' },
              { id: 'verified', label: 'Verified' },
              { id: 'needs_verification', label: 'Needs Review' },
              { id: 'ocr_processing', label: 'Processing' }
            ].map(f => `
              <button 
                data-filter="${f.id}"
                class="px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-low dark:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }"
                type="button"
              >
                ${f.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Bills Cards List -->
        <div class="space-y-space-xs">
          ${filteredBills.length === 0 ? `
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-8 text-center text-on-surface-variant border border-outline-variant/30">
              <span class="material-symbols-outlined text-[48px] text-outline mb-2">receipt</span>
              <p class="font-headline-sm text-headline-sm">No Purchase Bills Found</p>
              <p class="font-body-sm text-body-sm mt-1">Try changing search keywords or upload a new distributor invoice.</p>
            </div>
          ` : filteredBills.map(bill => {
            const isVerified = bill.status === 'verified';
            const isPending = bill.status === 'needs_verification';
            
            return `
              <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 hover:border-primary/50 transition-all">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-xs border-b border-outline-variant/20">
                  <div class="flex items-center gap-space-xs min-w-0">
                    <div class="w-10 h-10 rounded-lg bg-surface-container dark:bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
                      <span class="material-symbols-outlined text-[20px]">receipt_long</span>
                    </div>
                    <div class="min-w-0">
                      <h2 class="font-headline-sm text-headline-sm text-on-surface truncate">
                        ${bill.distributorName}
                      </h2>
                      <p class="font-code-num text-body-sm text-on-surface-variant">
                        Invoice #${bill.invoiceNumber} • Date: ${bill.invoiceDate}
                      </p>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-1 rounded-full text-label-caps font-semibold ${
                      isVerified ? 'bg-secondary-container text-primary font-bold' :
                      isPending ? 'bg-tertiary-container/30 text-tertiary font-bold animate-pulse' :
                      'bg-error-container text-error'
                    }">
                      ${isVerified ? i18n.t('statusVerified') : isPending ? i18n.t('statusNeedsVerification') : i18n.t('statusRejected')}
                    </span>
                  </div>
                </div>

                <!-- Line Items Preview -->
                <div class="py-space-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-body-sm">
                  <div>
                    <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Items</span>
                    <span class="font-semibold text-on-surface">${(bill.items || []).length} medicines</span>
                  </div>
                  <div>
                    <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Taxable</span>
                    <span class="font-code-num text-on-surface">₹${Number(bill.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">GST (CGST+SGST)</span>
                    <span class="font-code-num text-on-surface">₹${Number(bill.totalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span class="font-label-caps text-label-caps text-primary block uppercase font-bold">Grand Total</span>
                    <span class="font-headline-sm text-headline-sm text-primary font-bold font-code-num">₹${Number(bill.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <!-- Action Buttons & Item Preview -->
                <div class="mt-space-xs pt-space-xs border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    ${(bill.imageUrl || bill.scannedImageUrl) ? `
                      <a 
                        href="${bill.imageUrl || bill.scannedImageUrl}" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-semibold text-primary hover:bg-surface-container-low flex items-center gap-1 transition-colors"
                      >
                        <span class="material-symbols-outlined text-[16px]">visibility</span>
                        <span>View Scanned Bill</span>
                      </a>
                    ` : ''}

                    <button 
                      data-toggle-items="${bill.id}"
                      class="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer transition-colors"
                      type="button"
                    >
                      <span class="material-symbols-outlined text-[16px]">list_alt</span>
                      <span>Items (${(bill.items || []).length})</span>
                    </button>
                  </div>

                  <div class="flex items-center gap-2">
                    ${isPending ? `
                      <button 
                        data-verify-bill="${bill.id}"
                        class="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                        type="button"
                      >
                        <span class="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Verify Bill</span>
                      </button>
                    ` : ''}

                    ${authService.isOwner ? `
                      <button 
                        data-delete-bill="${bill.id}"
                        class="px-2.5 py-1.5 text-xs text-error hover:bg-error-container/20 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        type="button"
                        title="Delete Invoice"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- Expanded Line Items Table -->
                <div id="items-preview-${bill.id}" class="hidden mt-2 p-3 bg-surface-container-low dark:bg-surface-container-high rounded-xl border border-outline-variant/20 overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="border-b border-outline-variant/20 text-on-surface-variant font-label-caps">
                        <th class="pb-1.5">Medicine</th>
                        <th class="pb-1.5">Batch</th>
                        <th class="pb-1.5">Expiry</th>
                        <th class="pb-1.5 text-right">Qty</th>
                        <th class="pb-1.5 text-right">Rate (₹)</th>
                        <th class="pb-1.5 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-outline-variant/10">
                      ${(bill.items || []).map(it => `
                        <tr>
                          <td class="py-1.5 font-medium text-on-surface">${it.productName}</td>
                          <td class="py-1.5 font-mono text-on-surface-variant">${it.batchNumber}</td>
                          <td class="py-1.5 text-on-surface-variant">${it.expiryDate}</td>
                          <td class="py-1.5 text-right font-mono">${it.quantity}</td>
                          <td class="py-1.5 text-right font-mono">${Number(it.purchaseRate).toFixed(2)}</td>
                          <td class="py-1.5 text-right font-mono font-semibold text-on-surface">${Number(it.total || (it.quantity * it.purchaseRate)).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    </main>
  `;
}

export function bindBillsEvents(container, router) {
  container.querySelector('#bills-upload-new')?.addEventListener('click', () => {
    router.navigate('upload-ocr');
  });

  // Search input
  const searchInput = container.querySelector('#bills-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    router.renderCurrentView();
  });

  // Filters
  container.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter');
      router.renderCurrentView();
    });
  });

  // Toggle line items table
  container.querySelectorAll('[data-toggle-items]').forEach(btn => {
    btn.addEventListener('click', () => {
      const billId = btn.getAttribute('data-toggle-items');
      const table = container.querySelector(`#items-preview-${billId}`);
      table?.classList.toggle('hidden');
    });
  });

  // Quick verify
  container.querySelectorAll('[data-verify-bill]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const billId = btn.getAttribute('data-verify-bill');
      const bill = dbService.getPurchaseBillById(billId);
      if (bill) {
        bill.status = 'verified';
        await dbService.savePurchaseBill(bill);
        alert(`Bill #${bill.invoiceNumber} successfully verified! Stock batches and distributor ledger have been updated.`);
        router.renderCurrentView();
      }
    });
  });

  // Delete bill (owner only)
  container.querySelectorAll('[data-delete-bill]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const billId = btn.getAttribute('data-delete-bill');
      if (confirm("Are you sure you want to delete this bill? Associated batch inventory will also be adjusted.")) {
        await dbService.deletePurchaseBill(billId);
        router.renderCurrentView();
      }
    });
  });
}
