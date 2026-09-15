// Ohio Veterans — Navigator
// Every top-level page imports this first so that reloading the page (a
// normal F5 refresh or a hard/cache-busting refresh — the Navigation Timing
// API reports both the same way) always starts a brand-new demo session:
// intake answers, chat history, disclosure acknowledgement, and the mocked
// ID.me login are all wiped before any other script gets a chance to read
// them. Clicking links/buttons to move between pages is a "navigate" (or
// "back_forward") entry, not a "reload", so normal in-demo navigation still
// carries state from page to page as before.
try {
  const [navEntry] = performance.getEntriesByType('navigation');
  if (navEntry && navEntry.type === 'reload') {
    sessionStorage.clear();
  }
} catch {
  // Navigation Timing API unavailable — nothing to do, session simply
  // persists as it did before this file existed.
}
