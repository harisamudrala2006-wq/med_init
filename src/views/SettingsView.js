// Settings & Appearance View (Phases 4, 18, 19)
// Preserves Stitch Settings_and_Appearance_Dark_Mode_82e975e7.html
// Dynamic Pharmacy Name configuration propagated across entire system.

import { pharmacyState } from '../context/pharmacyState.js';
import { themeState } from '../context/themeState.js';
import { i18n } from '../context/i18nState.js';
import { dbService } from '../services/dbService.js';
import { pharmacyService } from '../services/pharmacyService.js';
import { authService } from '../services/authService.js';

export function renderSettingsView() {
  const profile = pharmacyState.profile;
  const currentTheme = themeState.theme;
  const currentLang = i18n.lang;

  return `
    <main class="flex flex-col relative w-full pt-16 pb-24 lg:pl-64 bg-background dark:bg-surface min-h-screen">
      <div class="flex flex-col w-full px-gutter-mobile py-space-md space-y-space-lg max-w-max-width mx-auto">
        
        <!-- Header Banner -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-primary-container text-[26px]">tune</span>
              <h1 class="font-headline-md text-headline-md tracking-tight text-on-surface">
                ${i18n.t('settings')}
              </h1>
            </div>
            <span class="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-secondary-container text-primary font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              v2.4.1 Active
            </span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant">
            Manage interface theme, dispensary credentials, compliance tags, and workstation preferences.
          </p>
        </div>

        <!-- 1. Appearance / Theme Selector (Phase 18) -->
        <section class="flex flex-col gap-space-xs">
          <div class="flex items-center justify-between px-space-2xs">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-[18px] text-primary">palette</span>
              <span class="font-headline-sm text-headline-sm text-on-surface">${i18n.t('appearance')}</span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Immediate switch</span>
          </div>

          <div class="grid grid-cols-3 gap-space-xs">
            <!-- Light -->
            <button 
              id="set-theme-light"
              class="relative flex flex-col p-space-sm rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-sm border border-outline-variant/30 text-left transition-all cursor-pointer ${currentTheme === 'light' ? 'ring-2 ring-primary' : ''}"
              type="button"
            >
              <div class="flex items-center justify-between w-full">
                <span class="font-label-md text-label-md text-on-surface font-semibold">${i18n.t('themeLight')}</span>
                ${currentTheme === 'light' ? '<span class="material-symbols-outlined text-[18px] text-primary">check_circle</span>' : ''}
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-1">Daylight mode</span>
            </button>

            <!-- Dark -->
            <button 
              id="set-theme-dark"
              class="relative flex flex-col p-space-sm rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-sm border border-outline-variant/30 text-left transition-all cursor-pointer ${currentTheme === 'dark' ? 'ring-2 ring-primary' : ''}"
              type="button"
            >
              <div class="flex items-center justify-between w-full">
                <span class="font-label-md text-label-md text-on-surface font-semibold">${i18n.t('themeDark')}</span>
                ${currentTheme === 'dark' ? '<span class="material-symbols-outlined text-[18px] text-primary">check_circle</span>' : ''}
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-1">Night shift mode</span>
            </button>

            <!-- System -->
            <button 
              id="set-theme-system"
              class="relative flex flex-col p-space-sm rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-sm border border-outline-variant/30 text-left transition-all cursor-pointer ${currentTheme === 'system' ? 'ring-2 ring-primary' : ''}"
              type="button"
            >
              <div class="flex items-center justify-between w-full">
                <span class="font-label-md text-label-md text-on-surface font-semibold">${i18n.t('themeSystem')}</span>
                ${currentTheme === 'system' ? '<span class="material-symbols-outlined text-[18px] text-primary">check_circle</span>' : ''}
              </div>
              <span class="font-label-sm text-label-sm text-on-surface-variant mt-1">System sync</span>
            </button>
          </div>
        </section>

        <!-- 2. Language Switcher (Phase 19) -->
        <section class="flex flex-col gap-space-xs">
          <div class="flex items-center justify-between px-space-2xs">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-[18px] text-primary">translate</span>
              <span class="font-headline-sm text-headline-sm text-on-surface">${i18n.t('language')}</span>
            </div>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Bilingual Support</span>
          </div>

          <div class="grid grid-cols-2 gap-space-xs">
            <button 
              id="set-lang-en"
              class="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-sm border border-outline-variant/30 transition-all text-left cursor-pointer ${currentLang === 'en' ? 'ring-2 ring-primary' : ''}"
              type="button"
            >
              <div class="flex items-center gap-space-sm">
                <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm">A</div>
                <div>
                  <span class="font-label-md text-label-md font-semibold text-on-surface block">English</span>
                  <span class="font-label-sm text-label-sm text-primary">Primary</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] ${currentLang === 'en' ? 'text-primary' : 'text-outline'}">
                ${currentLang === 'en' ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
            </button>

            <button 
              id="set-lang-te"
              class="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-sm border border-outline-variant/30 transition-all text-left cursor-pointer ${currentLang === 'te' ? 'ring-2 ring-primary' : ''}"
              type="button"
            >
              <div class="flex items-center gap-space-sm">
                <div class="w-8 h-8 rounded-full bg-surface-container-high dark:bg-surface-container-highest text-on-surface flex items-center justify-center font-headline-sm text-headline-sm">తె</div>
                <div>
                  <span class="font-label-md text-label-md font-semibold text-on-surface block">తెలుగు (Telugu)</span>
                  <span class="font-label-sm text-label-sm text-on-surface-variant">ప్రాంతీయ భాష</span>
                </div>
              </div>
              <span class="material-symbols-outlined text-[18px] ${currentLang === 'te' ? 'text-primary' : 'text-outline'}">
                ${currentLang === 'te' ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
            </button>
          </div>
        </section>

        <!-- 3. Pharmacy Information Form (Phase 4 — No Hardcoding!) -->
        <section class="flex flex-col gap-space-xs">
          <div class="flex items-center justify-between px-space-2xs">
            <div class="flex items-center gap-space-xs">
              <span class="material-symbols-outlined text-[18px] text-primary">local_pharmacy</span>
              <span class="font-headline-sm text-headline-sm text-on-surface">${i18n.t('pharmacyInformation')}</span>
            </div>
            <span class="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-semibold">
              TS / AP Drug Control Admin
            </span>
          </div>

          <form id="pharmacy-profile-form" class="bg-surface-container-lowest dark:bg-surface-container rounded-xl shadow-sm p-space-md border border-outline-variant/30 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <!-- Name -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('pharmacyName')}</label>
                <input 
                  id="profile-name-input"
                  class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface font-semibold focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                  type="text" 
                  value="${profile.name}"
                  required
                />
              </div>

              <!-- Drug License -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('drugLicense')}</label>
                <input 
                  id="profile-dl-input"
                  class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface font-code-num focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                  type="text" 
                  value="${profile.drugLicense}"
                />
              </div>

              <!-- GSTIN -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('gstin')}</label>
                <input 
                  id="profile-gstin-input"
                  class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface font-code-num focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                  type="text" 
                  value="${profile.gstin}"
                />
              </div>

              <!-- Phone -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('phoneNumber')}</label>
                <input 
                  id="profile-phone-input"
                  class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                  type="text" 
                  value="${profile.phone}"
                />
              </div>

              <!-- Email -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('emailAddress')}</label>
                <input 
                  id="profile-email-input"
                  class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                  type="email" 
                  value="${profile.email}"
                />
              </div>

              <!-- Address -->
              <div class="flex flex-col gap-1">
                <label class="font-label-caps text-label-caps text-on-surface-variant font-medium">${i18n.t('address')}</label>
                <input 
                  id="profile-address-input"
                  class="w-full h-11 px-3 bg-surface-container-low dark:bg-surface-container-high rounded-lg text-body-md text-on-surface focus:ring-2 focus:ring-primary border border-outline-variant/30" 
                  type="text" 
                  value="${profile.address}"
                />
              </div>
            </div>

            <!-- Save Action Button -->
            <button 
              type="submit"
              class="w-full h-12 bg-primary-container text-on-primary font-headline-sm text-body-md rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">save</span>
              <span>${i18n.t('saveSettings')}</span>
            </button>
          </form>
        </section>

      </div>
    </main>
  `;
}

export function bindSettingsEvents(container, router) {
  // Theme selection
  container.querySelector('#set-theme-light')?.addEventListener('click', () => {
    themeState.setTheme('light');
    router.renderCurrentView();
  });
  container.querySelector('#set-theme-dark')?.addEventListener('click', () => {
    themeState.setTheme('dark');
    router.renderCurrentView();
  });
  container.querySelector('#set-theme-system')?.addEventListener('click', () => {
    themeState.setTheme('system');
    router.renderCurrentView();
  });

  // Language selection
  container.querySelector('#set-lang-en')?.addEventListener('click', () => {
    i18n.setLanguage('en');
    router.renderCurrentView();
  });
  container.querySelector('#set-lang-te')?.addEventListener('click', () => {
    i18n.setLanguage('te');
    router.renderCurrentView();
  });

  // Save Pharmacy Profile (immediately reflected in Firestore & everywhere)
  container.querySelector('#pharmacy-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newName = container.querySelector('#profile-name-input').value.trim();
    const newDl = container.querySelector('#profile-dl-input').value.trim();
    const newGstin = container.querySelector('#profile-gstin-input').value.trim();
    const newPhone = container.querySelector('#profile-phone-input').value.trim();
    const newEmail = container.querySelector('#profile-email-input').value.trim();
    const newAddress = container.querySelector('#profile-address-input').value.trim();

    const pharmacyId = authService.user?.pharmacyId || pharmacyState.profile.id || 'pharmacy_sri_maheswari';

    const updates = {
      name: newName,
      drugLicense: newDl,
      gstin: newGstin,
      phone: newPhone,
      email: newEmail,
      address: newAddress
    };

    // Persist to Cloud Firestore and local reactive state
    await pharmacyService.savePharmacyProfile(pharmacyId, updates);

    dbService.logAudit("Settings Updated", "pharmacies", pharmacyId, `Pharmacy profile updated: ${newName} (GSTIN: ${newGstin})`);
    alert(i18n.t('settingsUpdated'));
    router.renderCurrentView();
  });
}
