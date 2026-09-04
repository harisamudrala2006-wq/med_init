// Theme Engine (Light / Dark / System)
// Preserves the Stitch light and dark design tokens and persists user preference.

let currentTheme = localStorage.getItem('medi_theme') || 'light';
const listeners = new Set();

function applyTheme(theme) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
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
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'system') {
      applyTheme('system');
      listeners.forEach(fn => fn(currentTheme));
    }
  });
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
