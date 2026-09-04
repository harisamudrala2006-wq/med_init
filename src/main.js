// Application Entry Point
import { Router } from './router.js';
import { authState } from './context/authState.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    console.error("Root #app container not found!");
    return;
  }

  const router = new Router(appContainer);
  
  // Check initial hash or session
  const initialHash = window.location.hash.replace('#', '');
  if (authState.isAuthenticated) {
    router.navigate(initialHash || 'dashboard');
  } else {
    router.navigate('login');
  }
});
