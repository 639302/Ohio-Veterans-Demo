// Ohio Veterans — Navigator
// Light/Dark Mode toggle, shared across all three pages. Persists the
// selection in sessionStorage, mirroring auth.js's mocked-session pattern.

const KEY = 'navigator-theme-v1';

export function isDarkMode() {
  return sessionStorage.getItem(KEY) === 'dark';
}

export function setDarkMode(enabled) {
  sessionStorage.setItem(KEY, enabled ? 'dark' : 'light');
  applyTheme();
}

export function applyTheme() {
  document.documentElement.setAttribute('data-mode', isDarkMode() ? 'dark' : 'light');
}

applyTheme();
