// Header Component (Preserves Stitch Header Design)
// Replaces hard-coded pharmacy name with dynamic pharmacyState.profile.name.

import { pharmacyState } from '../context/pharmacyState.js';
import { themeState } from '../context/themeState.js';
import { i18n } from '../context/i18nState.js';
import { authService } from '../services/authService.js';
import { dbService } from '../services/dbService.js';

export function renderHeader(onOpenNotifications) {
  const profile = pharmacyState.profile;
  const isDark = document.documentElement.classList.contains('dark');
  const reviewItems = dbService.getReviewCenterItems();
  const alertCount = reviewItems.length;

  return `
    <header class="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:bg-surface-container-low/90 dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)] transition-colors">
      <div class="h-16 px-gutter-mobile flex items-center justify-between gap-space-xs max-w-max-width mx-auto">
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

          <!-- Notifications Bell -->
          <button 
            id="header-notifications-btn" 
            aria-label="Notifications" 
            class="w-10 h-10 relative rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span class="material-symbols-outlined text-[22px]">notifications</span>
            ${alertCount > 0 ? `
              <span class="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
            ` : ''}
          </button>

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
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      router.navigate('review-center');
    });
  }

  const profileBtn = container.querySelector('#header-profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      router.navigate('settings');
    });
  }
}
