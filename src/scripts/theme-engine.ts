const STORAGE_KEY = 'wahyu-theme';
const ATTR = 'data-theme';

type Theme = 'dark' | 'light';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage tidak tersedia (private browsing, iframe, dll)
  }
  return 'dark';
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'light') {
    root.setAttribute(ATTR, 'light');
  } else {
    root.removeAttribute(ATTR);
  }
  root.style.colorScheme = theme;
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore write failure
  }
}

export function initTheme(): void {
  const theme = getStoredTheme();
  applyTheme(theme);
}

export function toggleTheme(): Theme {
  const current = document.documentElement.getAttribute(ATTR) === 'light' ? 'light' : 'dark';
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  storeTheme(next);
  document.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: next } }));
  return next;
}

export function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute(ATTR) === 'light' ? 'light' : 'dark';
}

// Auto-init saat module di-import sebagai client-side script
initTheme();
