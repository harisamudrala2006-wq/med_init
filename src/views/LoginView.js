// Login View (Preserves Stitch Login UI Exactly)
// Replaces hardcoded strings with dynamic pharmacy profile and wire with Firebase Auth.

import { pharmacyState } from '../context/pharmacyState.js';
import { authState } from '../context/authState.js';
import { i18n } from '../context/i18nState.js';

export function renderLoginView() {
  const profile = pharmacyState.profile;

  return `
    <main class="flex flex-col relative w-full bg-surface dark:bg-background min-h-screen pt-safe pb-safe items-center justify-center p-gutter-normal">
      <div class="w-full max-w-[420px] flex flex-col gap-space-lg">
        <!-- Top Utility: Language Switcher & Clinical Auth Pill -->
        <div class="flex items-center justify-between px-space-xs">
          <div class="flex items-center gap-1.5 bg-surface-container-low dark:bg-surface-container-high px-2.5 py-1 rounded-full text-secondary dark:text-secondary-fixed">
            <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">shield</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">${i18n.t('clinicalAuth')}</span>
          </div>

          <!-- Language Pill Switcher -->
          <div class="flex items-center bg-surface-container dark:bg-surface-container-high rounded-full p-0.5">
            <button 
              id="login-lang-en" 
              type="button" 
              class="px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
                i18n.lang === 'en' 
                  ? 'font-semibold bg-surface-container-lowest dark:bg-surface-container-low text-primary shadow-sm' 
                  : 'font-medium text-on-surface-variant hover:text-on-surface'
              } transition-all cursor-pointer"
            >
              EN
            </button>
            <span class="text-outline text-label-sm px-0.5 font-light">|</span>
            <button 
              id="login-lang-te" 
              type="button" 
              class="px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
                i18n.lang === 'te' 
                  ? 'font-semibold bg-surface-container-lowest dark:bg-surface-container-low text-primary shadow-sm' 
                  : 'font-medium text-on-surface-variant hover:text-on-surface'
              } transition-all cursor-pointer"
            >
              తెలుగు
            </button>
          </div>
        </div>

        <!-- Main Authentication Panel -->
        <div class="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl shadow-md p-space-xl flex flex-col border border-outline-variant/30">
          <!-- Brand Header -->
          <div class="flex flex-col items-center text-center pb-space-lg">
            <div class="w-14 h-14 bg-surface-container-low dark:bg-surface-container-high rounded-xl flex items-center justify-center p-2 mb-space-md shadow-sm">
              <img 
                alt="${profile.name} Brand Icon" 
                class="w-full h-full object-contain rounded-lg" 
                src="${profile.logoUrl}"
              />
            </div>
            <h1 class="font-headline-md text-headline-md text-on-surface tracking-tight" id="login-brand-title">
              ${profile.name}
            </h1>
            <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              ${i18n.t('pharmacyManagement')}
            </p>
          </div>

          <!-- Live Dispensary Terminal Badge -->
          <div class="bg-surface-container-low dark:bg-surface-container-high rounded-lg px-3 py-2 flex items-center justify-between mb-space-lg">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span class="font-code-num text-code-num text-on-surface-variant text-[11px]">${profile.posNode}</span>
            </div>
            <span class="font-code-num text-code-num text-[11px] text-primary font-medium dark:text-primary-fixed">ONLINE</span>
          </div>

          <!-- Login Form -->
          <form class="flex flex-col gap-space-md" id="pharmacy-login-form">
            <!-- Field: Identifier -->
            <div class="flex flex-col gap-1.5">
              <label class="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between" for="login-identifier">
                <span>${i18n.t('mobileOrEmail')}</span>
                <span class="font-code-num text-label-sm text-outline font-normal">Rx ID / UID</span>
              </label>
              <div class="relative flex items-center">
                <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-[18px]">badge</span>
                </span>
                <input 
                  autocomplete="username" 
                  class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                  id="login-identifier" 
                  name="identifier" 
                  placeholder="98490 12345 or staff@sribalaji.in" 
                  required 
                  type="text" 
                  value="98490 12345"
                />
              </div>
            </div>

            <!-- Field: Password -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-label-md text-label-md text-on-surface font-medium" for="login-password">
                  ${i18n.t('password')}
                </label>
                <span class="font-label-sm text-label-sm text-outline font-normal">Min. 6 chars</span>
              </div>
              <div class="relative flex items-center">
                <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                  <span class="material-symbols-outlined text-[18px]">lock</span>
                </span>
                <input 
                  autocomplete="current-password" 
                  class="w-full pl-9 pr-10 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-code-num text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-wide" 
                  id="login-password" 
                  name="password" 
                  placeholder="••••••••••••" 
                  required 
                  type="password"
                  value="pharma123"
                />
                <button 
                  aria-label="Toggle password display" 
                  class="absolute right-2.5 p-1 text-outline hover:text-on-surface flex items-center rounded focus:outline-none transition-colors cursor-pointer" 
                  id="login-pwd-toggle" 
                  type="button"
                >
                  <span class="material-symbols-outlined text-[18px]" id="login-pwd-eye">visibility</span>
                </button>
              </div>
            </div>

            <!-- Inline Error Banner -->
            <div class="bg-error-container text-on-error-container rounded-lg p-2.5 hidden flex items-start gap-2" id="login-error-banner">
              <span class="material-symbols-outlined text-[18px] text-error flex-shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">error</span>
              <div class="flex flex-col">
                <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-error" id="login-error-title">
                  ${i18n.t('verificationRequired')}
                </span>
                <span class="font-body-sm text-body-sm text-on-error-container leading-tight" id="login-error-text">
                  ${i18n.t('loginErrorDesc')}
                </span>
              </div>
            </div>

            <!-- Remember Me & Reset Credentials Links -->
            <div class="flex items-center justify-between pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  checked 
                  class="w-4 h-4 rounded bg-surface-container text-primary-container focus:ring-0 cursor-pointer accent-primary" 
                  id="login-remember" 
                  type="checkbox"
                />
                <span class="font-body-sm text-body-sm text-on-surface">${i18n.t('rememberMe')}</span>
              </label>
              <button 
                class="font-body-sm text-body-sm font-medium text-primary hover:underline cursor-pointer bg-transparent border-none p-0" 
                id="login-forgot-btn"
                type="button"
              >
                ${i18n.t('forgotPassword')}
              </button>
            </div>

            <!-- Primary Sign In Action Button -->
            <button 
              class="w-full mt-2 py-3 px-4 bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer" 
              id="login-submit-btn" 
              type="submit"
            >
              <span class="material-symbols-outlined text-[18px]">lock_open</span>
              <span id="login-btn-text">${i18n.t('signIn')}</span>
            </button>
          </form>

          <!-- Shift Roster Context Note -->
          <div class="mt-space-lg pt-space-md bg-surface-container-low dark:bg-surface-container-high rounded-lg p-3 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-surface-container-lowest dark:bg-surface-container-low flex items-center justify-center text-primary-container flex-shrink-0">
              <span class="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                ${i18n.t('dayShiftAudit')}
              </span>
              <span class="font-body-sm text-body-sm text-on-surface-variant truncate">
                ${i18n.t('staffScheduleSync')}
              </span>
            </div>
          </div>
        </div>

        <!-- Security & Compliance Footer -->
        <div class="flex flex-col items-center text-center gap-1 px-space-sm">
          <div class="flex items-center gap-1.5 text-secondary dark:text-secondary-fixed">
            <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">lock</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">TLS 1.3 End-to-End Encrypted</span>
          </div>
          <p class="font-body-sm text-body-sm text-outline max-w-[340px] leading-relaxed">
            ${i18n.t('securityNotice')}
          </p>
        </div>
      </div>
    </main>
  `;
}

export function bindLoginEvents(container, router) {
  // Language switcher
  container.querySelector('#login-lang-en')?.addEventListener('click', () => i18n.setLanguage('en'));
  container.querySelector('#login-lang-te')?.addEventListener('click', () => i18n.setLanguage('te'));

  // Password visibility toggle
  const pwdInput = container.querySelector('#login-password');
  const pwdEye = container.querySelector('#login-pwd-eye');
  container.querySelector('#login-pwd-toggle')?.addEventListener('click', () => {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      pwdEye.textContent = 'visibility_off';
    } else {
      pwdInput.type = 'password';
      pwdEye.textContent = 'visibility';
    }
  });

  // Forgot Password
  container.querySelector('#login-forgot-btn')?.addEventListener('click', () => {
    const email = prompt("Enter your registered pharmacy staff email for password reset:");
    if (email) {
      authState.forgotPassword(email);
      alert(`Password reset instructions sent to ${email}. Check your inbox.`);
    }
  });

  // Form Submission
  const form = container.querySelector('#pharmacy-login-form');
  const btnText = container.querySelector('#login-btn-text');
  const errorBanner = container.querySelector('#login-error-banner');
  const errorText = container.querySelector('#login-error-text');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner.classList.add('hidden');
    const identifier = container.querySelector('#login-identifier').value;
    const password = container.querySelector('#login-password').value;

    btnText.textContent = i18n.t('authenticating');

    const result = await authState.login(identifier, password);
    if (result.success) {
      router.navigate('dashboard');
    } else {
      btnText.textContent = i18n.t('signIn');
      errorText.textContent = result.error || i18n.t('loginErrorDesc');
      errorBanner.classList.remove('hidden');
    }
  });
}
