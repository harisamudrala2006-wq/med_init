// Login & Sign Up View (Preserves Stitch Styling Exactly)
// Real Firebase Authentication: Phone OTP and Email/Password with real session persistence
import { pharmacyState } from '../context/pharmacyState.js';
import { authService } from '../services/authService.js';
import { pharmacyService } from '../services/pharmacyService.js';
import { dbService } from '../services/dbService.js';
import { i18n } from '../context/i18nState.js';

let activeAuthMode = 'signin'; // 'signin' | 'signup'
let authMethod = 'phone'; // 'phone' | 'email'
let otpSent = false;
let enteredPhone = '+91 98490 12345';
let timerSeconds = 30;

export function renderLoginView() {
  const profile = pharmacyState.profile;

  return `
    <main class="flex flex-col relative w-full bg-surface dark:bg-background min-h-screen pt-safe pb-safe items-center justify-center p-gutter-normal">
      <div class="w-full max-w-[440px] flex flex-col gap-space-lg">
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
        <div class="bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl shadow-md p-space-xl flex flex-col border border-outline-variant/30">
          <!-- Brand Header -->
          <div class="flex flex-col items-center text-center pb-space-md">
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

          <!-- Auth Mode Tab Switcher: Sign In vs Create Account -->
          <div class="flex bg-surface-container dark:bg-surface-container-high p-1 rounded-xl mb-3">
            <button 
              id="auth-tab-signin" 
              type="button"
              class="flex-1 py-1.5 text-center font-label-md text-label-md rounded-lg transition-all cursor-pointer ${
                activeAuthMode === 'signin' 
                  ? 'bg-surface-container-lowest dark:bg-surface-container-low text-primary font-bold shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }"
            >
              Sign In
            </button>
            <button 
              id="auth-tab-signup" 
              type="button"
              class="flex-1 py-1.5 text-center font-label-md text-label-md rounded-lg transition-all cursor-pointer ${
                activeAuthMode === 'signup' 
                  ? 'bg-surface-container-lowest dark:bg-surface-container-low text-primary font-bold shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }"
            >
              Create Account
            </button>
          </div>

          <!-- Method Selector: Phone OTP vs Email / Password -->
          <div class="flex items-center justify-center gap-2 mb-space-md">
            <button 
              id="auth-method-phone" 
              type="button"
              class="text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                authMethod === 'phone'
                  ? 'bg-primary/10 text-primary border-primary font-semibold'
                  : 'text-on-surface-variant border-outline-variant/40 hover:text-on-surface'
              }"
            >
              <span class="material-symbols-outlined text-[14px] align-middle mr-1">call</span>
              Phone OTP
            </button>
            <button 
              id="auth-method-email" 
              type="button"
              class="text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-primary/10 text-primary border-primary font-semibold'
                  : 'text-on-surface-variant border-outline-variant/40 hover:text-on-surface'
              }"
            >
              <span class="material-symbols-outlined text-[14px] align-middle mr-1">mail</span>
              Email & Password
            </button>
          </div>

          <!-- Invisible reCAPTCHA container for Firebase Phone Auth -->
          <div id="recaptcha-container"></div>

          <!-- ========================================== -->
          <!-- METHOD 1: PHONE OTP AUTHENTICATION         -->
          <!-- ========================================== -->
          ${authMethod === 'phone' ? `
            <form class="flex flex-col gap-space-md" id="pharmacy-phone-form">
              ${!otpSent ? `
                <!-- Signup Name and Pharmacy if creating account -->
                ${activeAuthMode === 'signup' ? `
                  <div class="flex flex-col gap-1.5">
                    <label class="font-label-md text-label-md text-on-surface font-medium" for="login-fullname">
                      Full Name & Role
                    </label>
                    <div class="relative flex items-center">
                      <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                        <span class="material-symbols-outlined text-[18px]">person</span>
                      </span>
                      <input 
                        autocomplete="name" 
                        class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                        id="login-fullname" 
                        name="fullname" 
                        placeholder="e.g. Dr. K. Rama Rao" 
                        required 
                        type="text" 
                        value="Dr. K. Rama Rao"
                      />
                    </div>
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <label class="font-label-md text-label-md text-on-surface font-medium" for="login-pharmacy-name">
                      Pharmacy Name
                    </label>
                    <div class="relative flex items-center">
                      <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                        <span class="material-symbols-outlined text-[18px]">storefront</span>
                      </span>
                      <input 
                        class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                        id="login-pharmacy-name" 
                        name="pharmacyName" 
                        placeholder="e.g. Sri Maheswari Medical" 
                        required 
                        type="text" 
                        value="${profile.name || 'Sri Maheswari Medical'}"
                      />
                    </div>
                  </div>
                ` : ''}

                <!-- Phone Field with Country Code -->
                <div class="flex flex-col gap-1.5">
                  <label class="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between" for="login-phone">
                    <span>Mobile Phone Number</span>
                    <span class="font-code-num text-label-sm text-outline font-normal">SMS OTP</span>
                  </label>
                  <div class="flex items-center gap-2">
                    <div class="w-16 px-2.5 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-mono text-body-md rounded-lg shadow-sm text-center flex-shrink-0 font-medium">
                      +91
                    </div>
                    <div class="relative flex-1 flex items-center">
                      <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                        <span class="material-symbols-outlined text-[18px]">call</span>
                      </span>
                      <input 
                        autocomplete="tel" 
                        class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-code-num text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all tracking-wider" 
                        id="login-phone" 
                        name="phoneNumber" 
                        placeholder="98490 12345" 
                        required 
                        type="tel" 
                        value="98490 12345"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  class="w-full mt-2 py-3 px-4 bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer" 
                  id="login-phone-submit-btn" 
                  type="submit"
                >
                  <span class="material-symbols-outlined text-[18px]">sms</span>
                  <span id="login-phone-btn-text">Send Verification OTP</span>
                </button>
              ` : `
                <!-- OTP Entry Step -->
                <div class="flex flex-col gap-space-sm py-2">
                  <div class="flex items-center justify-between">
                    <span class="font-label-md text-label-md text-on-surface font-medium">Enter 6-Digit OTP</span>
                    <button 
                      id="login-change-phone-btn" 
                      type="button" 
                      class="font-label-sm text-label-sm text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Change Number
                    </button>
                  </div>

                  <div class="bg-surface-container-low dark:bg-surface-container-high p-2.5 rounded-lg text-center font-body-sm text-body-sm text-on-surface-variant">
                    Sent to <strong class="text-on-surface font-mono">${enteredPhone}</strong>
                  </div>

                  <div class="relative flex items-center justify-center py-2">
                    <input 
                      autocomplete="one-time-code" 
                      class="w-full text-center py-3 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-mono text-2xl font-bold tracking-[0.5em] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                      id="login-otp-code" 
                      maxlength="6" 
                      name="otpCode" 
                      placeholder="••••••" 
                      required 
                      type="text" 
                      value="123456"
                    />
                  </div>

                  <div class="flex items-center justify-between text-body-sm text-body-sm text-on-surface-variant px-1">
                    <span>Didn't receive code?</span>
                    <button 
                      id="login-resend-btn" 
                      type="button" 
                      class="font-medium text-primary hover:underline cursor-pointer bg-transparent border-none p-0"
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button 
                    class="w-full mt-2 py-3 px-4 bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer" 
                    id="login-otp-submit-btn" 
                    type="submit"
                  >
                    <span class="material-symbols-outlined text-[18px]">verified</span>
                    <span id="login-verify-btn-text">Verify & Open Dashboard</span>
                  </button>
                </div>
              `}
            </form>
          ` : `
            <!-- ========================================== -->
            <!-- METHOD 2: EMAIL & PASSWORD AUTHENTICATION  -->
            <!-- ========================================== -->
            <form class="flex flex-col gap-space-md" id="pharmacy-email-form">
              ${activeAuthMode === 'signup' ? `
                <div class="flex flex-col gap-1.5">
                  <label class="font-label-md text-label-md text-on-surface font-medium" for="email-fullname">
                    Full Name
                  </label>
                  <div class="relative flex items-center">
                    <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                      <span class="material-symbols-outlined text-[18px]">person</span>
                    </span>
                    <input 
                      autocomplete="name" 
                      class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                      id="email-fullname" 
                      name="fullname" 
                      placeholder="Dr. K. Rama Rao" 
                      required 
                      type="text" 
                      value="Dr. K. Rama Rao"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-label-md text-label-md text-on-surface font-medium" for="email-pharmacy-name">
                    Pharmacy Name
                  </label>
                  <div class="relative flex items-center">
                    <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                      <span class="material-symbols-outlined text-[18px]">storefront</span>
                    </span>
                    <input 
                      class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                      id="email-pharmacy-name" 
                      name="pharmacyName" 
                      placeholder="Sri Maheswari Medical" 
                      required 
                      type="text" 
                      value="${profile.name || 'Sri Maheswari Medical'}"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-label-md text-label-md text-on-surface font-medium" for="email-role">
                    Role & Permissions
                  </label>
                  <select 
                    id="email-role"
                    class="w-full px-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="owner" selected>Pharmacy Owner (Full Administrator)</option>
                    <option value="staff">Staff Pharmacist / Dispenser</option>
                  </select>
                </div>
              ` : ''}

              <div class="flex flex-col gap-1.5">
                <label class="font-label-md text-label-md text-on-surface font-medium" for="email-input">
                  Email Address
                </label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-[18px]">email</span>
                  </span>
                  <input 
                    autocomplete="email" 
                    class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                    id="email-input" 
                    name="email" 
                    placeholder="owner@sribalaji.in" 
                    required 
                    type="email" 
                    value="owner@sribalaji.in"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="font-label-md text-label-md text-on-surface font-medium" for="password-input">
                    Password
                  </label>
                  ${activeAuthMode === 'signin' ? `
                    <button 
                      id="btn-forgot-password" 
                      type="button" 
                      class="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  ` : ''}
                </div>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-outline flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-[18px]">lock</span>
                  </span>
                  <input 
                    autocomplete="current-password" 
                    class="w-full pl-9 pr-3 py-2.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                    id="password-input" 
                    minlength="6"
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type="password" 
                    value="Medical@2026"
                  />
                </div>
              </div>

              <button 
                class="w-full mt-2 py-3 px-4 bg-primary-container text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2 transition-all cursor-pointer" 
                id="login-email-submit-btn" 
                type="submit"
              >
                <span class="material-symbols-outlined text-[18px]">${activeAuthMode === 'signup' ? 'person_add' : 'login'}</span>
                <span id="login-email-btn-text">${activeAuthMode === 'signup' ? 'Create Pharmacy Account' : 'Sign In with Email'}</span>
              </button>
            </form>
          `}

          <!-- Inline Error / Status Banner -->
          <div class="bg-error-container text-on-error-container rounded-lg p-2.5 hidden flex items-start gap-2 mt-3" id="login-error-banner">
            <span class="material-symbols-outlined text-[18px] text-error flex-shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">error</span>
            <div class="flex flex-col">
              <span class="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-error" id="login-error-title">
                Authentication Error
              </span>
              <span class="font-body-sm text-body-sm text-on-error-container leading-tight" id="login-error-text">
                Failed to authenticate. Please check your credentials.
              </span>
            </div>
          </div>

          <!-- Shift Roster Context Note -->
          <div class="mt-space-md pt-space-sm bg-surface-container-low dark:bg-surface-container-high rounded-lg p-3 flex items-center gap-3">
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
            <span class="font-label-sm text-label-sm text-on-surface-variant">TLS 1.3 Firebase Verified</span>
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

  // Auth Mode Tabs: Sign In vs Create Account
  container.querySelector('#auth-tab-signin')?.addEventListener('click', () => {
    activeAuthMode = 'signin';
    otpSent = false;
    router.renderCurrentView();
  });

  container.querySelector('#auth-tab-signup')?.addEventListener('click', () => {
    activeAuthMode = 'signup';
    otpSent = false;
    router.renderCurrentView();
  });

  // Auth Method Switcher: Phone vs Email
  container.querySelector('#auth-method-phone')?.addEventListener('click', () => {
    authMethod = 'phone';
    otpSent = false;
    router.renderCurrentView();
  });

  container.querySelector('#auth-method-email')?.addEventListener('click', () => {
    authMethod = 'email';
    otpSent = false;
    router.renderCurrentView();
  });

  // Error Banner Elements
  const errorBanner = container.querySelector('#login-error-banner');
  const errorText = container.querySelector('#login-error-text');
  const errorTitle = container.querySelector('#login-error-title');

  function showError(title, msg) {
    if (errorTitle) errorTitle.textContent = title;
    if (errorText) errorText.textContent = msg;
    errorBanner?.classList.remove('hidden');
  }

  // Change phone number button
  container.querySelector('#login-change-phone-btn')?.addEventListener('click', () => {
    otpSent = false;
    router.renderCurrentView();
  });

  // Resend OTP button
  container.querySelector('#login-resend-btn')?.addEventListener('click', async () => {
    errorBanner?.classList.add('hidden');
    await authService.sendOtp(enteredPhone);
    alert(`A fresh verification code has been dispatched to ${enteredPhone}`);
  });

  // ==========================================
  // Form Submission: Phone Auth
  // ==========================================
  const phoneForm = container.querySelector('#pharmacy-phone-form');
  phoneForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner?.classList.add('hidden');

    if (!otpSent) {
      // Step 1: Send OTP
      const phoneInput = container.querySelector('#login-phone');
      const btnText = container.querySelector('#login-phone-btn-text');
      enteredPhone = phoneInput ? phoneInput.value.trim() : '98490 12345';

      if (btnText) btnText.textContent = "Sending OTP...";

      const res = await authService.sendOtp(enteredPhone, 'recaptcha-container');
      if (res.success) {
        otpSent = true;
        router.renderCurrentView();
      } else {
        if (btnText) btnText.textContent = "Send Verification OTP";
        showError("Phone Auth Error", res.error || "Failed to send OTP. Please check phone number or try Email Sign-In.");
      }
    } else {
      // Step 2: Verify OTP
      const otpInput = container.querySelector('#login-otp-code');
      const verifyBtnText = container.querySelector('#login-verify-btn-text');
      const code = otpInput ? otpInput.value.trim() : '';

      const fullName = container.querySelector('#login-fullname')?.value || '';
      const pharmacyName = container.querySelector('#login-pharmacy-name')?.value || '';

      if (verifyBtnText) verifyBtnText.textContent = "Verifying...";

      const result = await authService.verifyOtp(code, {
        isSignUp: activeAuthMode === 'signup',
        fullName,
        pharmacyName
      });

      if (result.success) {
        const pharmacyId = result.user?.pharmacyId || 'pharmacy_sri_maheswari';
        pharmacyService.initRealtimeSync(pharmacyId);
        dbService.initFirestoreSync();
        router.navigate('dashboard');
      } else {
        if (verifyBtnText) verifyBtnText.textContent = "Verify & Open Dashboard";
        showError("Invalid Code", result.error || "Invalid OTP entered. Please try again.");
      }
    }
  });

  // ==========================================
  // Form Submission: Email & Password Auth
  // ==========================================
  const emailForm = container.querySelector('#pharmacy-email-form');
  emailForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBanner?.classList.add('hidden');

    const email = container.querySelector('#email-input')?.value?.trim();
    const password = container.querySelector('#password-input')?.value?.trim();
    const btnText = container.querySelector('#login-email-btn-text');

    if (!email || !password) {
      showError("Missing Fields", "Please enter both email and password.");
      return;
    }

    if (activeAuthMode === 'signup') {
      const fullName = container.querySelector('#email-fullname')?.value?.trim() || "Dr. K. Rama Rao";
      const pharmacyName = container.querySelector('#email-pharmacy-name')?.value?.trim() || "Sri Maheswari Medical";
      const role = container.querySelector('#email-role')?.value || "owner";

      if (btnText) btnText.textContent = "Creating Account...";

      const res = await authService.registerWithEmail(email, password, fullName, pharmacyName, role);
      if (res.success) {
        const pharmacyId = res.user?.pharmacyId || 'pharmacy_sri_maheswari';
        pharmacyService.initRealtimeSync(pharmacyId);
        dbService.initFirestoreSync();
        router.navigate('dashboard');
      } else {
        if (btnText) btnText.textContent = "Create Pharmacy Account";
        showError("Registration Failed", res.error || "Could not register account. Try another email.");
      }
    } else {
      if (btnText) btnText.textContent = "Signing In...";

      const res = await authService.loginWithEmail(email, password);
      if (res.success) {
        const pharmacyId = res.user?.pharmacyId || 'pharmacy_sri_maheswari';
        pharmacyService.initRealtimeSync(pharmacyId);
        dbService.initFirestoreSync();
        router.navigate('dashboard');
      } else {
        if (btnText) btnText.textContent = "Sign In with Email";
        showError("Sign In Failed", res.error || "Invalid email or password.");
      }
    }
  });

  // Forgot password
  container.querySelector('#btn-forgot-password')?.addEventListener('click', async () => {
    const email = container.querySelector('#email-input')?.value?.trim();
    if (!email) {
      showError("Reset Password", "Please enter your email address in the field above first.");
      return;
    }
    const res = await authService.resetPassword(email);
    if (res.success) {
      alert(`Password reset instructions have been dispatched to ${email}`);
    } else {
      showError("Reset Failed", res.error || "Could not send reset email.");
    }
  });
}
