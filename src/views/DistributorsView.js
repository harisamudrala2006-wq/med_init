// Distributors & Balances View (Preserves Stitch Distributors Design)
import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

let searchQuery = '';

export function renderDistributorsView() {
  const distributors = dbService.getDistributors();

  const filtered = distributors.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return d.name.toLowerCase().includes(q) || 
           (d.gstin && d.gstin.toLowerCase().includes(q)) || 
           (d.phone && d.phone.includes(q));
  });

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Title & Add Distributor Action -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              ${i18n.t('distributorsAndBalances')}
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Live vendor ledgers, terms, and outstanding payables.
            </p>
          </div>
          <button 
            id="dist-add-new-btn"
            class="h-11 px-space-md bg-primary-container text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">person_add</span>
            <span>Add Distributor</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative flex items-center w-full">
          <span class="absolute left-3 text-outline pointer-events-none flex items-center">
            <span class="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input 
            id="dist-search-input"
            class="w-full h-11 pl-10 pr-4 bg-surface-container-lowest dark:bg-surface-container text-on-surface rounded-xl border border-outline-variant/30 text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
            placeholder="Search distributor name, GSTIN, phone..." 
            type="text" 
            value="${searchQuery}"
          />
        </div>

        <!-- Distributors Grid / List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
          ${filtered.map(dist => {
            const finances = dbService.getDistributorFinances(dist.id);
            const hasDue = finances.outstanding > 0;

            return `
              <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:border-primary/50 transition-all space-y-3">
                
                <!-- Distributor Header -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-space-sm min-w-0">
                    <div class="w-11 h-11 rounded-lg bg-surface-container dark:bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
                      <span class="material-symbols-outlined text-[24px]">domain</span>
                    </div>
                    <div class="min-w-0">
                      <h2 class="font-headline-sm text-headline-sm text-on-surface truncate">
                        ${dist.name}
                      </h2>
                      <p class="font-code-num text-[12px] text-on-surface-variant">
                        GSTIN: ${dist.gstin || 'N/A'} • DL: ${dist.dlNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                    hasDue ? 'bg-tertiary-container/20 text-tertiary' : 'bg-secondary-container text-primary'
                  } flex-shrink-0">
                    ${hasDue ? 'Due Outstanding' : 'Settled'}
                  </span>
                </div>

                <!-- Financial Ledger Metric Strip -->
                <div class="grid grid-cols-3 gap-2 bg-surface-container-low dark:bg-surface-container-high p-space-xs rounded-lg text-body-sm">
                  <div>
                    <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Purchases</span>
                    <span class="font-code-num text-on-surface font-semibold">₹${finances.totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span class="font-label-caps text-label-caps text-on-surface-variant block uppercase">Settled</span>
                    <span class="font-code-num text-secondary dark:text-secondary-fixed font-semibold">₹${finances.totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span class="font-label-caps text-label-caps text-tertiary block uppercase font-bold">Outstanding</span>
                    <span class="font-code-num text-tertiary font-bold">₹${finances.outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <!-- Contact & Actions Footer -->
                <div class="flex items-center justify-between pt-1 text-body-sm text-on-surface-variant">
                  <div class="flex items-center gap-1 min-w-0 truncate">
                    <span class="material-symbols-outlined text-[16px] text-outline">call</span>
                    <a href="tel:${dist.phone}" class="hover:underline text-secondary">${dist.phone}</a>
                  </div>

                  <button 
                    data-view-distributor="${dist.id}"
                    class="font-label-md text-label-md text-primary dark:text-primary-fixed font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    type="button"
                  >
                    <span>View Ledger</span>
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
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

export function bindDistributorsEvents(container, router) {
  // Search
  container.querySelector('#dist-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    router.renderCurrentView();
  });

  // Add Distributor
  container.querySelector('#dist-add-new-btn')?.addEventListener('click', () => {
    const name = prompt("Enter Distributor Company Name:");
    if (!name) return;
    const phone = prompt("Enter Phone Number:", "+91 98480 ");
    const gstin = prompt("Enter 15-digit GSTIN:", "37AABC" + Math.floor(1000 + Math.random() * 9000) + "F1Z0");

    dbService.addDistributor({
      name,
      phone: phone || "+91 98480 00000",
      gstin: gstin || "37AABCA0000A1Z0",
      dlNumber: "20B/21B-AP-2024",
      address: "Industrial Area, Andhra Pradesh",
      paymentTerms: "Net 15 Days"
    });

    alert(`Distributor "${name}" created successfully!`);
    router.renderCurrentView();
  });

  // View Distributor Detail
  container.querySelectorAll('[data-view-distributor]').forEach(btn => {
    btn.addEventListener('click', () => {
      const distId = btn.getAttribute('data-view-distributor');
      router.navigate(`distributor-detail?id=${distId}`);
    });
  });
}
