// Application Entry Point
import { Router } from './router.js';
import { authService } from './services/authService.js';

function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error("Root #app container not found!");
    return;
  }

  try {
    const router = new Router(appContainer);
    
    // Check initial hash or session
    const initialHash = window.location.hash.replace('#', '');
    if (authService.isAuthenticated) {
      router.navigate(initialHash || 'dashboard');
    } else {
      router.navigate('login');
    }
  } catch (err) {
    console.error("Critical Router initialization failure:", err);
    appContainer.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; text-align: center; color: #ba1a1a;">
        <h2>Initialization Error</h2>
        <p>${err.message}</p>
        <button onclick="localStorage.clear(); location.reload();" style="padding: 0.5rem 1rem; margin-top: 1rem; cursor: pointer;">
          Clear Cache & Reload
        </button>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
