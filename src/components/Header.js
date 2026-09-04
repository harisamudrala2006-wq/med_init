// Header Component (Preserves Stitch Header Design)
// Replaces hard-coded pharmacy name with dynamic pharmacyState.profile.name.

import { pharmacyState } from '../context/pharmacyState.js';
import { themeState } from '../context/themeState.js';
import { i18n } from '../context/i18nState.js';
import { authService } from '../services/authService.js';
import { dbService } from '../services/dbService.js';

let isDrawerOpen = false;

export function renderHeader(onOpenNotifications) {
  const profile = pharmacyState.profile;
  const isDark = document.documentElement.classList.contains('dark');
  const notifications = dbService.getNotifications();
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const unreadCount = unreadNotifications.length;

  return `
    <header class="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:bg-surface-container-low/90 dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)] transition-colors">
      <div class="h-16 px-gutter-mobile flex items-center justify-between gap-space-xs max-w-max-width mx-auto relative">
        <!-- Brand Info -->
        <div class="flex items-center gap-space-xs min-w-0 flex-1">
          <img 
            alt="Pharmacy Logo" 
            class="h-8 w-auto object-contain flex-shrink-0 rounded-md" 
            src="${profile.logoUrl}"
          />
          <div class="flex flex-col min-w-0">
            <span class="font-headline-sm text-headline-sm text-on-surface tracking-tight truncate leading-tight">
              ${profile.name}
            </span>
            <span class="font-label-caps text-label-caps text-on-surface-variant truncate uppercase">
              ${i18n.t('pharmacyManagement')} • ${profile.posNode}
            </span>
          </div>
        </div>

        <!-- Utility Buttons -->
        <div class="flex items-center gap-space-2xs flex-shrink-0">
          <!-- Language Toggle (EN | తె) -->
          <button 
            id="header-lang-btn" 
            aria-label="Switch Language" 
            class="h-9 px-space-xs rounded-full bg-surface-container-low dark:bg-surface-container-high flex items-center gap-space-2xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span class="font-label-caps text-label-caps ${i18n.lang === 'en' ? 'font-bold text-primary' : 'text-on-surface-variant'}">EN</span>
            <span class="font-body-sm text-body-sm text-outline">|</span>
            <span class="font-label-caps text-label-caps ${i18n.lang === 'te' ? 'font-bold text-primary' : 'text-on-surface-variant'}">తె</span>
          </button>

          <!-- Theme Toggle (Light / Dark) -->
          <button 
            id="header-theme-btn" 
            aria-label="Toggle Theme" 
            class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">
              ${isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <!-- Notifications Bell & Drawer -->
          <div class="relative">
            <button 
              id="header-notifications-btn" 
              aria-label="Notifications" 
              class="w-10 h-10 relative rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container transition-colors cursor-pointer"
              type="button"
            >
              <span class="material-symbols-outlined text-[22px]">notifications</span>
              ${unreadCount > 0 ? `
                <span class="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white font-label-caps text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-container-lowest">
                  ${unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ` : ''}
            </button>

            <!-- Notifications Drawer / Dropdown -->
            <div 
              id="header-notifications-drawer" 
              class="${isDrawerOpen ? 'flex' : 'hidden'} flex-col absolute right-0 top-12 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden z-50 transition-all duration-200"
            >
              <!-- Drawer Header -->
              <div class="p-3.5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50 dark:bg-surface-container-high/40">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
                  <span class="font-headline-sm text-sm font-semibold text-on-surface">Expiry Alerts</span>
                  ${unreadCount > 0 ? `
                    <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-[10px] font-bold">
                      ${unreadCount} New
                    </span>
                  ` : ''}
                </div>
                <div class="flex items-center gap-2">
                  ${unreadCount > 0 ? `
                    <button 
                      id="btn-mark-all-read" 
                      type="button" 
                      class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  ` : ''}
                  <button 
                    id="btn-close-notif-drawer" 
                    type="button" 
                    class="w-6 h-6 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="max-h-[65vh] overflow-y-auto divide-y divide-outline-variant/15 p-2 space-y-1">
                ${notifications.length === 0 ? `
                  <div class="py-8 text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-outline text-[32px] mb-1">check_circle</span>
                    <p class="text-xs font-medium">All clear! No active expiry alerts.</p>
                  </div>
                ` : notifications.map(notif => {
                    let badgeStyle = "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
                    let dotColor = "bg-blue-500";
                    let thresholdLabel = `${notif.daysLeft}d left`;

                    if (notif.threshold === 'expired' || notif.daysLeft <= 0) {
                      badgeStyle = "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
                      dotColor = "bg-red-600";
                      thresholdLabel = "EXPIRED";
                    } else if (notif.threshold === '7_days' || notif.daysLeft <= 7) {
                      badgeStyle = "bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
                      dotColor = "bg-amber-600";
                      thresholdLabel = `${notif.daysLeft}d (Critical)`;
                    } else if (notif.threshold === '30_days' || notif.daysLeft <= 30) {
                      badgeStyle = "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
                      dotColor = "bg-yellow-500";
                      thresholdLabel = `${notif.daysLeft}d left`;
                    }

                    return `
                      <div class="p-2.5 rounded-xl transition-all ${notif.isRead ? 'opacity-65 hover:opacity-100' : 'bg-surface-container-low/60 dark:bg-surface-container-high/30 border border-outline-variant/20'} flex flex-col gap-1.5">
                        <div class="flex items-start justify-between gap-1.5">
                          <div class="flex items-center gap-1.5 min-w-0">
                            <span class="w-2 h-2 rounded-full ${dotColor} flex-shrink-0"></span>
                            <span class="font-semibold text-xs text-on-surface truncate">${notif.productName}</span>
                          </div>
                          <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badgeStyle} flex-shrink-0">
                            ${thresholdLabel}
                          </span>
                        </div>

                        <div class="text-[11px] text-on-surface-variant flex items-center justify-between">
                          <span>Batch: <strong class="text-on-surface font-mono font-medium">${notif.batchNumber}</strong></span>
                          <span>Expires: ${notif.expiryDate}</span>
                        </div>

                        <div class="flex items-center justify-end gap-2 pt-1 border-t border-outline-variant/10">
                          ${!notif.isRead ? `
                            <button 
                              data-mark-notif-read="${notif.id}" 
                              type="button" 
                              class="text-[11px] text-on-surface-variant hover:text-primary font-medium px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                            >
                              Mark read
                            </button>
                          ` : ''}
                          <button 
                            data-view-notif-batch="${notif.batchNumber}" 
                            type="button" 
                            class="text-[11px] bg-primary text-on-primary font-medium px-2 py-0.5 rounded-md hover:opacity-90 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>View Batch</span>
                            <span class="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    `;
                }).join('')}
              </div>

              <!-- Drawer Footer -->
              <div class="p-2 border-t border-outline-variant/20 bg-surface-container-low/40 dark:bg-surface-container-high/40 text-center">
                <button 
                  id="btn-goto-review-hub" 
                  type="button" 
                  class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  Open Review Center & Anomaly Hub &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- Profile / Logout Action -->
          <button 
            id="header-profile-btn" 
            aria-label="Profile and Session" 
            class="w-10 h-10 flex items-center justify-center rounded-full p-space-2xs cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            type="button"
            title="${authService.user?.fullName || authService.user?.phoneNumber || 'Pharmacist'}"
          >
            <img 
              alt="Profile" 
              class="w-8 h-8 rounded-full object-cover ring-1 ring-outline-variant/40" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1UZoBKOHjHUODpUTe3Q4kty05mIpB0r1JX3boVPQ1WnRcgWU7I-kt4UypaV0cEi5J6O1H_VWVcbZL2oyIqN0HP3ISJCejlviybtoPCjHXYD562hlFM0Mdcr_m8R3pf0iTNN94rTDK8z1Nfi09mulscLhSauEwpQcym6b7TFYu7y2n5jdooLEd7KyZEEc65u3O9W12A0Mr2vZZ5_FpVUpIDuDHrUIzQfinQrtznBZo-dlJiu-qDl1-Q9gsrN"
            />
          </button>
        </div>
      </div>
    </header>
  `;
}

export function bindHeaderEvents(container, router) {
  const langBtn = container.querySelector('#header-lang-btn');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const nextLang = i18n.lang === 'en' ? 'te' : 'en';
      i18n.setLanguage(nextLang);
    });
  }

  const themeBtn = container.querySelector('#header-theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      themeState.toggle();
    });
  }

  const notifBtn = container.querySelector('#header-notifications-btn');
  const drawer = container.querySelector('#header-notifications-drawer');

  if (notifBtn && drawer) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isDrawerOpen = !isDrawerOpen;
      if (isDrawerOpen) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
      } else {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
      }
    });

    const closeBtn = container.querySelector('#btn-close-notif-drawer');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isDrawerOpen = false;
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
      });
    }

    const markAllBtn = container.querySelector('#btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await dbService.markAllNotificationsAsRead();
        router.renderCurrentView();
      });
    }

    container.querySelectorAll('[data-mark-notif-read]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const notifId = btn.getAttribute('data-mark-notif-read');
        await dbService.markNotificationAsRead(notifId);
        router.renderCurrentView();
      });
    });

    container.querySelectorAll('[data-view-notif-batch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const batchNumber = btn.getAttribute('data-view-notif-batch');
        isDrawerOpen = false;
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
        router.navigate(`inventory?search=${encodeURIComponent(batchNumber)}`);
      });
    });

    const gotoReviewBtn = container.querySelector('#btn-goto-review-hub');
    if (gotoReviewBtn) {
      gotoReviewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isDrawerOpen = false;
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
        router.navigate('review-center');
      });
    }

    // Close drawer on click outside
    document.addEventListener('click', (e) => {
      if (isDrawerOpen && !drawer.contains(e.target) && !notifBtn.contains(e.target)) {
        isDrawerOpen = false;
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
      }
    });
  }

  const profileBtn = container.querySelector('#header-profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      router.navigate('settings');
    });
  }
}
