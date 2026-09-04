// Purchase Bills & Invoices View (Preserves Stitch Bills Design)
import { dbService } from '../services/dbService.js';
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

                <!-- Action Button for unverified bill -->
                ${isPending ? `
                  <div class="mt-space-xs pt-space-xs border-t border-outline-variant/20 flex justify-end gap-2">
                    <button 
                      data-verify-bill="${bill.id}"
                      class="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      type="button"
                    >
                      <span class="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Verify & Update Inventory</span>
                    </button>
                  </div>
                ` : ''}
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

  // Quick verify
  container.querySelectorAll('[data-verify-bill]').forEach(btn => {
    btn.addEventListener('click', () => {
      const billId = btn.getAttribute('data-verify-bill');
      const bill = dbService.getPurchaseBillById(billId);
      if (bill) {
        bill.status = 'verified';
        dbService.savePurchaseBill(bill);
        alert(`Bill #${bill.invoiceNumber} successfully verified! Stock batches and distributor ledger have been updated.`);
        router.renderCurrentView();
      }
    });
  });
}
