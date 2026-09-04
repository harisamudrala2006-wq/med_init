// Dual Navigation Component (Phase 20 — Responsive Mobile & Desktop)
// Mobile: Bottom Navigation Bar with exact Stitch styling
// Desktop: Left Sidebar Navigation for POS & high-resolution displays

import { i18n } from '../context/i18nState.js';
import { dbService } from '../services/dbService.js';
import { authState } from '../context/authState.js';

export function renderBottomNav(currentTab = 'dashboard') {
  const reviewCount = dbService.getReviewCenterItems().length;

  const items = [
    { id: 'dashboard', label: i18n.t('dashboard'), icon: 'dashboard' },
    { id: 'bills', label: i18n.t('bills'), icon: 'receipt_long' },
    { id: 'inventory', label: i18n.t('inventory'), icon: 'inventory_2' },
    { id: 'distributors', label: i18n.t('distributors'), icon: 'local_shipping' },
    { id: 'more', label: i18n.t('more'), icon: 'more_horiz', badge: reviewCount > 0 ? reviewCount : null }
  ];

  return `
    <nav class="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-1px_8px_rgba(0,0,0,0.04)] dark:bg-surface-container-low/95 dark:shadow-[0_-1px_8px_rgba(0,0,0,0.3)] lg:hidden border-t border-outline-variant/30">
      <div class="flex justify-around items-center h-16 px-space-2xs max-w-max-width mx-auto">
        ${items.map(item => {
          const isActive = currentTab === item.id || (item.id === 'more' && ['settings', 'reports', 'review-center', 'expiry', 'anomalies', 'audit'].includes(currentTab));
          return `
            <button 
              data-nav="${item.id}"
              aria-current="${isActive ? 'page' : 'false'}" 
              class="flex flex-col items-center justify-center gap-1 min-w-[56px] h-14 rounded-lg transition-colors cursor-pointer relative ${
                isActive 
                  ? 'text-primary font-semibold dark:text-primary-fixed' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }" 
              type="button"
            >
              <div class="relative flex items-center justify-center">
                <span class="material-symbols-outlined text-[22px]" style="${isActive ? "font-variation-settings: 'FILL' 1;" : ''}">
                  ${item.icon}
                </span>
                ${item.badge ? `
                  <span class="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-error text-white leading-tight">
                    ${item.badge}
                  </span>
                ` : ''}
              </div>
              <span class="font-label-caps text-[10px] tracking-normal truncate max-w-[64px]">
                ${item.label}
              </span>
            </button>
          `;
        }).join('')}
      </div>
    </nav>
  `;
}

export function renderDesktopSidebar(currentTab = 'dashboard') {
  const reviewCount = dbService.getReviewCenterItems().length;

  const links = [
    { id: 'dashboard', label: i18n.t('dashboard'), icon: 'dashboard' },
    { id: 'bills', label: i18n.t('bills'), icon: 'receipt_long' },
    { id: 'upload-ocr', label: i18n.t('uploadBill'), icon: 'document_scanner' },
    { id: 'inventory', label: i18n.t('inventory'), icon: 'inventory_2' },
    { id: 'distributors', label: i18n.t('distributors'), icon: 'local_shipping' },
    { id: 'review-center', label: i18n.t('reviewCenter'), icon: 'rule', badge: reviewCount > 0 ? reviewCount : null },
    { id: 'expiry', label: i18n.t('expiry'), icon: 'hourglass_bottom' },
    { id: 'anomalies', label: i18n.t('priceAnomalies'), icon: 'price_change' },
    { id: 'reports', label: i18n.t('reports'), icon: 'analytics' },
    { id: 'audit', label: i18n.t('auditLogs'), icon: 'history_edu' },
    { id: 'settings', label: i18n.t('settings'), icon: 'settings' }
  ];

  return `
    <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:bg-surface-container-lowest lg:dark:bg-surface-container-low lg:border-r lg:border-outline-variant/30 z-40 p-4 justify-between overflow-y-auto">
      <div class="space-y-1">
        <div class="px-3 py-2 text-label-caps uppercase text-on-surface-variant font-bold tracking-wider">
          ${i18n.t('pharmacyManagement')}
        </div>
        ${links.map(link => {
          const isActive = currentTab === link.id;
          return `
            <button 
              data-nav="${link.id}"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer ${
                isActive 
                  ? 'bg-primary-container text-on-primary font-semibold shadow-sm' 
                  : 'text-on-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
              }"
              type="button"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-[20px]" style="${isActive ? "font-variation-settings: 'FILL' 1;" : ''}">
                  ${link.icon}
                </span>
                <span>${link.label}</span>
              </div>
              ${link.badge ? `
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? 'bg-white text-primary' : 'bg-error text-white'}">
                  ${link.badge}
                </span>
              ` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <div class="pt-4 border-t border-outline-variant/30">
        <button 
          id="sidebar-logout-btn"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-error font-label-md text-label-md hover:bg-error-container/20 transition-colors cursor-pointer"
          type="button"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          <span>${i18n.t('logout')}</span>
        </button>
      </div>
    </aside>
  `;
}

export function bindNavigationEvents(container, router) {
  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-nav');
      if (tab === 'more') {
        router.navigate('review-center');
      } else {
        router.navigate(tab);
      }
    });
  });

  const logoutBtn = container.querySelector('#sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authState.logout();
      router.navigate('login');
    });
  }
}
