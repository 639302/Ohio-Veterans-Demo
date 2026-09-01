// Ohio Veterans — Navigator
// Mocked, session-scoped auth state for the header account menu. Instant
// toggle, no real form/credentials/backend — a demo stand-in only.

const STORAGE_KEY = 'navigator-auth-v1';
const DEFAULT_NAME = 'Jane Doe';

export function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).loggedIn === true : false;
  } catch {
    return false;
  }
}

export function getDisplayName() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).name || DEFAULT_NAME : DEFAULT_NAME;
  } catch {
    return DEFAULT_NAME;
  }
}

export function logIn(name) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ loggedIn: true, name: name || DEFAULT_NAME }));
}

export function logOut() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ loggedIn: false }));
}
