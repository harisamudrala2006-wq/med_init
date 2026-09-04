// Review Center & Attention Required Hub (Phase 14)
import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

export function renderReviewCenterView() {
  const items = dbService.getReviewCenterItems();

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              ${i18n.t('reviewCenter')}
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Unified compliance inbox for unverified bills, price anomalies, and inventory alerts.
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-label-sm font-bold ${
            items.length > 0 ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'
          }">
            ${items.length} Attention Required
          </span>
        </div>

        <!-- Items Feed -->
        <div class="space-y-space-xs">
          ${items.length === 0 ? `
            <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-12 text-center text-on-surface-variant border border-outline-variant/30">
              <span class="material-symbols-outlined text-[56px] text-primary mb-2">task_alt</span>
              <h2 class="font-headline-md text-headline-md text-on-surface">All Clear! No Pending Issues</h2>
              <p class="font-body-sm text-body-sm mt-1">All invoices are verified, price checks are clean, and no batches are expiring within 30 days.</p>
            </div>
          ` : items.map(item => {
            const isHigh = item.urgency === 'high';
            return `
              <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/50 transition-all">
                <div class="flex items-start gap-3 min-w-0">
                  <div class="w-10 h-10 rounded-lg ${
                    isHigh ? 'bg-error-container text-error' : 'bg-tertiary-container/30 text-tertiary'
                  } flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="material-symbols-outlined text-[22px]">
                      ${item.type === 'bill_verification' ? 'receipt_long' :
                        item.type === 'expiry_alert' ? 'hourglass_bottom' : 'price_change'}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">
                        ${item.title}
                      </h3>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        isHigh ? 'bg-error-container text-error' : 'bg-tertiary-container/20 text-tertiary'
                      }">
                        ${item.badge}
                      </span>
                    </div>
                    <p class="font-body-sm text-body-sm text-on-surface-variant">
                      ${item.subtitle}
                    </p>
                  </div>
                </div>

                <button 
                  data-action-review="${item.targetTab}"
                  class="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer flex-shrink-0"
                  type="button"
                >
                  <span>Resolve / Review</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    </main>
  `;
}

export function bindReviewCenterEvents(container, router) {
  container.querySelectorAll('[data-action-review]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-action-review');
      router.navigate(target);
    });
  });
}
