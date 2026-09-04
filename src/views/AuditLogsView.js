// Audit Trail View (Phase 17)
import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

export function renderAuditLogsView() {
  const logs = dbService.getAuditLogs();

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-md max-w-max-width mx-auto">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="font-headline-md text-headline-md text-on-surface">
              ${i18n.t('auditLogs')}
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant">
              Immutable regulatory audit trail under Pharmacy Drug & Cosmetics Act protocols.
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-label-caps font-bold bg-secondary-container text-primary">
            ${logs.length} Recorded Events
          </span>
        </div>

        <!-- Logs Feed -->
        <div class="bg-surface-container-lowest dark:bg-surface-container rounded-xl shadow-sm border border-outline-variant/30 divide-y divide-outline-variant/20 overflow-hidden">
          ${logs.length === 0 ? `
            <div class="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[48px] text-outline">history</span>
              <h3 class="font-headline-sm font-semibold text-on-surface">No Audit Records Yet</h3>
              <p class="font-body-sm text-xs text-on-surface-variant max-w-sm">
                Actions such as verified bill uploads, distributor payments, inventory adjustments, and profile edits are immutably logged here.
              </p>
            </div>
          ` : logs.map(log => `
            <div class="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors text-body-sm">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-surface-container-low dark:bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <span class="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      ${log.action}
                    </span>
                    <span class="text-[11px] text-outline font-code-num">
                      by ${log.userName}
                    </span>
                  </div>
                  <p class="text-on-surface-variant mt-0.5">
                    ${log.details}
                  </p>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="font-code-num text-on-surface-variant text-[12px] block">
                  ${new Date(log.timestamp).toLocaleString('en-IN')}
                </span>
                <span class="text-[10px] uppercase font-bold text-primary">Logged</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </main>
  `;
}

export function bindAuditLogsEvents(container, router) {}
