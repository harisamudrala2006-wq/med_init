// Theme Engine (Light / Dark / System)
// Preserves the Stitch light and dark design tokens and persists user preference.

let currentTheme = localStorage.getItem('medi_theme') || 'light';
const listeners = new Set();

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (!root) return;

  const prefersDark = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? Boolean(window.matchMedia('(prefers-color-scheme: dark)').matches)
    : false;
  
  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
}

// Initial apply
applyTheme(currentTheme);

// Listen to system changes if on system theme
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (currentTheme === 'system') {
        applyTheme('system');
        listeners.forEach(fn => fn(currentTheme));
      }
    });
  } catch (e) {
    console.warn("Could not attach dark mode listener:", e);
  }
}

export const themeState = {
  get theme() {
    return currentTheme;
  },

  setTheme(theme) {
    if (!['light', 'dark', 'system'].includes(theme)) return;
    currentTheme = theme;
    localStorage.setItem('medi_theme', theme);
    applyTheme(theme);
    listeners.forEach(fn => fn(currentTheme));
  },

  toggle() {
    const isDark = document.documentElement.classList.contains('dark');
    this.setTheme(isDark ? 'light' : 'dark');
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
