// Ohio Veterans — Navigator
// Header account-menu disclosure, shared across all three pages. Renders
// Profile/Light Mode/Dark Mode/Sign out (logged in) or Login/Create an
// Account/Light Mode/Dark Mode (logged out) from auth.js's mocked,
// instant-toggle session state and theme.js's persisted mode, plus a "Try a
// scenario" section that seeds a guided-persona goal and jumps into intake.

import './session-reset.js?v=1';
import { isLoggedIn, logIn, logOut, getDisplayName, isStakeholder } from './auth.js';
import { isDarkMode, setDarkMode } from './theme.js';
import { resetState } from './state.js';

const trigger = document.getElementById('nav-account-button');
const menu = document.getElementById('account-menu');
const avatar = document.getElementById('account-avatar');
const authButtons = document.getElementById('nav-auth-buttons');
const loginButton = document.getElementById('nav-login-button');
const createAccountButton = document.getElementById('nav-create-account-button');
const loginModal = document.getElementById('login-modal');
const createAccountModal = document.getElementById('create-account-modal');
let accountMenuResizeHandler = null;

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) || '';
  return initials.toUpperCase();
}

// Exported so other modules (e.g. the bespoke chat scenario flows) can
// refresh the header avatar after calling auth.js's logIn() directly.
export function renderAvatar() {
  if (avatar) {
    const loggedIn = isLoggedIn();
    avatar.classList.toggle('account-avatar--guest', !loggedIn);
    avatar.innerHTML = loggedIn
      ? getInitials(getDisplayName())
      : '<mms-icon name="user" size="xl"></mms-icon>';
  }
  if (authButtons) authButtons.hidden = isLoggedIn();
}

if (trigger && menu) {
  function openLoginModal() {
    if (loginModal) loginModal.open = true;
  }

  function openCreateAccountModal() {
    if (createAccountModal) createAccountModal.open = true;
  }

  function addAction(label, icon, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-menu__item';
    button.innerHTML = icon
      ? `<mms-icon name="${icon}" size="sm"></mms-icon><span>${label}</span>`
      : `<span>${label}</span>`;
    button.addEventListener('click', () => {
      action();
      renderAvatar();
      closeMenu();
      trigger.focus();
    });
    menu.appendChild(button);
  }

  function addDivider() {
    const hr = document.createElement('hr');
    hr.className = 'account-menu__divider';
    menu.appendChild(hr);
  }

  function addThemeRow(label, icon, dark) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-menu__item';
    if (isDarkMode() === dark) button.classList.add('account-menu__item--active');
    button.innerHTML = `<mms-icon name="${icon}" size="sm"></mms-icon><span>${label}</span>`;
    button.addEventListener('click', () => {
      setDarkMode(dark);
      renderMenuItems();
    });
    menu.appendChild(button);
  }

  function addStakeholderRow() {
    addAction('ODVS Stakeholder', 'chart-bar', () => {
      resetState();
      logIn('ODVS Stakeholder', 'stakeholder');
      window.location.href = 'dashboard.html';
    });
  }

  function renderMenuItems() {
    menu.innerHTML = '';
    if (isStakeholder()) {
      addAction('Dashboard', 'chart-bar', () => {
        window.location.href = 'dashboard.html';
      });
      addDivider();
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
      addDivider();
      addAction('Sign out', 'sign-out', () => {
        logOut();
        window.location.href = '/Ohio%20Veterans/navigator/';
      });
      return;
    }
    if (isLoggedIn()) {
      addAction('Profile', 'user-circle', () => {});
      addDivider();
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
      addDivider();
      addAction('Sign out', 'sign-out', logOut);
    } else {
      addAction('Login', 'user-circle', openLoginModal);
      addAction('Create an Account', 'user-plus', openCreateAccountModal);
      addDivider();
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
    }
    addDivider();
    addStakeholderRow();
  }

  renderAvatar();

  function clearFieldError(field) {
    field.removeAttribute('error');
    field.removeAttribute('error-text');
  }

  function setFieldError(field, message) {
    field.setAttribute('error', '');
    field.setAttribute('error-text', message);
  }

  function isValidEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
  }

  if (loginModal) {
    if (loginButton) loginButton.addEventListener('click', openLoginModal);

    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');

    loginModal.addEventListener('primary-click', () => {
      [loginEmail, loginPassword].forEach(clearFieldError);
      let valid = true;
      if (!isValidEmail(loginEmail.value || '')) {
        setFieldError(loginEmail, 'Enter a valid email address');
        valid = false;
      }
      if (!loginPassword.value) {
        setFieldError(loginPassword, 'Password is required');
        valid = false;
      }
      if (!valid) return;

      logIn();
      renderAvatar();
      loginModal.open = false;
      loginEmail.value = '';
      loginPassword.value = '';
    });

    loginModal.addEventListener('close', () => {
      [loginEmail, loginPassword].forEach(clearFieldError);
      loginEmail.value = '';
      loginPassword.value = '';
    });

    const loginIdmeButton = document.getElementById('login-idme-button');
    const loginLogingovButton = document.getElementById('login-logingov-button');

    function signInWithIdp() {
      [loginEmail, loginPassword].forEach(clearFieldError);
      logIn();
      renderAvatar();
      loginModal.open = false;
      loginEmail.value = '';
      loginPassword.value = '';
    }

    if (loginIdmeButton) loginIdmeButton.addEventListener('click', signInWithIdp);
    if (loginLogingovButton) loginLogingovButton.addEventListener('click', signInWithIdp);
  }

  if (createAccountModal) {
    if (createAccountButton) createAccountButton.addEventListener('click', openCreateAccountModal);

    const createName = document.getElementById('create-account-name');
    const createEmail = document.getElementById('create-account-email');
    const createPassword = document.getElementById('create-account-password');

    createAccountModal.addEventListener('primary-click', () => {
      [createName, createEmail, createPassword].forEach(clearFieldError);
      let valid = true;
      if (!createName.value.trim()) {
        setFieldError(createName, 'Full name is required');
        valid = false;
      }
      if (!isValidEmail(createEmail.value || '')) {
        setFieldError(createEmail, 'Enter a valid email address');
        valid = false;
      }
      if (!createPassword.value) {
        setFieldError(createPassword, 'Password is required');
        valid = false;
      }
      if (!valid) return;

      logIn(createName.value.trim());
      renderAvatar();
      createAccountModal.open = false;
      createName.value = '';
      createEmail.value = '';
      createPassword.value = '';
    });

    createAccountModal.addEventListener('close', () => {
      [createName, createEmail, createPassword].forEach(clearFieldError);
      createName.value = '';
      createEmail.value = '';
      createPassword.value = '';
    });
  }

  [loginModal, createAccountModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      modal.dispatchEvent(new Event('primary-click'));
    });
  });

  function openMenu() {
    renderMenuItems();
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    positionAccountMenu();
    accountMenuResizeHandler = positionAccountMenu;
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', accountMenuResizeHandler);
    window.addEventListener('scroll', accountMenuResizeHandler, { passive: true });
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeydown);
    if (accountMenuResizeHandler) {
      window.removeEventListener('resize', accountMenuResizeHandler);
      window.removeEventListener('scroll', accountMenuResizeHandler);
      accountMenuResizeHandler = null;
    }
  }

  function positionAccountMenu() {
    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const header = trigger.closest('mms-header');
    const headerBottom = header?.shadowRoot?.querySelector('header')?.getBoundingClientRect().bottom || triggerRect.bottom;
    const viewportPadding = 16;
    const top = Math.max(triggerRect.bottom + 8, headerBottom + 8);
    const right = Math.max(viewportPadding, window.innerWidth - triggerRect.right);
    const maxHeight = Math.max(240, window.innerHeight - top - viewportPadding);

    menu.style.setProperty('--account-menu-top', `${top}px`);
    menu.style.setProperty('--account-menu-right', `${right}px`);
    menu.style.setProperty('--account-menu-max-height', `${maxHeight}px`);

    if (menuRect.left < viewportPadding) {
      menu.style.setProperty('--account-menu-right', `${viewportPadding}px`);
    }
  }

  function handleOutsideClick(event) {
    if (trigger.contains(event.target) || menu.contains(event.target)) return;
    closeMenu();
  }

  function handleKeydown(event) {
    if (event.key !== 'Escape') return;
    closeMenu();
    trigger.focus();
  }

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });
}

const menuToggle = document.getElementById('nav-menu-toggle');
const collapsible = document.getElementById('nav-collapsible');

if (menuToggle && collapsible) {
  function openMobileMenu() {
    collapsible.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('left-icon', 'x');
    document.addEventListener('click', handleMobileOutsideClick);
    document.addEventListener('keydown', handleMobileKeydown);
  }

  function closeMobileMenu() {
    collapsible.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('left-icon', 'list');
    document.removeEventListener('click', handleMobileOutsideClick);
    document.removeEventListener('keydown', handleMobileKeydown);
  }

  function handleMobileOutsideClick(event) {
    if (menuToggle.contains(event.target) || collapsible.contains(event.target)) return;
    closeMobileMenu();
  }

  function handleMobileKeydown(event) {
    if (event.key !== 'Escape') return;
    closeMobileMenu();
    menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    if (collapsible.classList.contains('is-open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

function normalizeNavPath(pathname) {
  let path = pathname.replace(/\/index\.html?$/, '/').replace(/\.html?$/, '');
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

const currentPath = normalizeNavPath(window.location.pathname);
document.querySelectorAll('.nav-header__nav a, .nav-header__submenu a').forEach((link) => {
  if (normalizeNavPath(new URL(link.href, window.location.href).pathname) !== currentPath) return;
  link.setAttribute('aria-current', 'page');
});

const headerDropdownTriggers = Array.from(document.querySelectorAll([
  'mms-header button[aria-controls="resources-menu"]',
  'mms-header mms-button[aria-controls="help-menu"]',
  'mms-header mms-button[aria-controls="search-menu"]',
].join(', ')));

function getControlledPanel(triggerButton) {
  const panelId = triggerButton?.getAttribute('aria-controls');
  return panelId ? document.getElementById(panelId) : null;
}

function positionHeaderPanel(triggerButton, panel) {
  const triggerRect = triggerButton.getBoundingClientRect();
  const header = triggerButton.closest('mms-header');
  const headerBottom = header?.shadowRoot?.querySelector('header')?.getBoundingClientRect().bottom || triggerRect.bottom;
  const viewportPadding = 16;
  const top = Math.max(triggerRect.bottom + 8, headerBottom + 8);
  const alignLeft = panel.classList.contains('nav-header__submenu');

  panel.style.setProperty('--nav-menu-top', `${top}px`);
  panel.style.removeProperty('--nav-menu-left');
  panel.style.removeProperty('--nav-menu-right');

  if (alignLeft) {
    const left = Math.min(Math.max(viewportPadding, triggerRect.left), window.innerWidth - panel.offsetWidth - viewportPadding);
    panel.style.setProperty('--nav-menu-left', `${left}px`);
  } else {
    const right = Math.max(viewportPadding, window.innerWidth - triggerRect.right);
    panel.style.setProperty('--nav-menu-right', `${right}px`);
  }
}

function closeHeaderDropdown(triggerButton) {
  const panel = getControlledPanel(triggerButton);
  if (!triggerButton || !panel) return;
  panel.hidden = true;
  triggerButton.setAttribute('aria-expanded', 'false');
}

function closeOtherHeaderDropdowns(activeTrigger) {
  headerDropdownTriggers
    .filter((triggerButton) => triggerButton !== activeTrigger)
    .forEach(closeHeaderDropdown);
}

headerDropdownTriggers.forEach((triggerButton) => {
  const panel = getControlledPanel(triggerButton);
  if (!panel) return;

  triggerButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = triggerButton.getAttribute('aria-expanded') !== 'true';
    closeOtherHeaderDropdowns(triggerButton);
    panel.hidden = !willOpen;
    triggerButton.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) positionHeaderPanel(triggerButton, panel);
  });
});

document.addEventListener('click', (event) => {
  const clickedInsideHeaderDropdown = headerDropdownTriggers.some((triggerButton) => {
    const panel = getControlledPanel(triggerButton);
    return triggerButton.contains(event.target) || panel?.contains(event.target);
  });
  if (clickedInsideHeaderDropdown) return;
  headerDropdownTriggers.forEach(closeHeaderDropdown);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  headerDropdownTriggers.forEach(closeHeaderDropdown);
});

window.addEventListener('resize', () => {
  headerDropdownTriggers.forEach((triggerButton) => {
    const panel = getControlledPanel(triggerButton);
    if (!panel || panel.hidden) return;
    positionHeaderPanel(triggerButton, panel);
  });
});

window.addEventListener('scroll', () => {
  headerDropdownTriggers.forEach((triggerButton) => {
    const panel = getControlledPanel(triggerButton);
    if (!panel || panel.hidden) return;
    positionHeaderPanel(triggerButton, panel);
  });
}, { passive: true });

const siteSearchInput = document.getElementById('site-search-input');
const siteSearchSubmit = document.getElementById('site-search-submit');

function submitSiteSearch() {
  const query = siteSearchInput?.value?.trim() || '';
  const url = new URL('https://dvs.ohio.gov/search');
  if (query) url.searchParams.set('q', query);
  window.location.href = url.toString();
}

if (siteSearchSubmit) siteSearchSubmit.addEventListener('click', submitSiteSearch);
if (siteSearchInput) {
  siteSearchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    submitSiteSearch();
  });
}

const navigatorLauncher = document.getElementById('navigator-launcher');

if (navigatorLauncher) {
  navigatorLauncher.addEventListener('click', () => {
    const chatDrawer = document.getElementById('chat-drawer');
    if (chatDrawer) {
      document.dispatchEvent(new CustomEvent('navigator-start-flow', { detail: {} }));
      return;
    }
    const isHomePage = normalizeNavPath(window.location.pathname) === '/Ohio%20Veterans/navigator'
      || normalizeNavPath(window.location.pathname) === '/Ohio%20Veterans/navigator/';
    const landingInput = document.getElementById('landing-text-input');
    const intakeInput = document.getElementById('chat-input');

    if (landingInput) {
      landingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      landingInput.focus();
      return;
    }

    if (intakeInput) {
      intakeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      intakeInput.focus();
      return;
    }

    window.location.href = isHomePage ? '#main-content' : '/Ohio%20Veterans/navigator/#main-content';
  });
}

const siteHeader = document.querySelector('mms-header.site-header');

if (siteHeader) {
  const pinHeaderThreshold = Number(siteHeader.getAttribute('scroll-threshold') || 24);

  function updateSiteHeaderPinning() {
    const shouldPin = window.scrollY > pinHeaderThreshold;
    siteHeader.toggleAttribute('fixed', shouldPin);
    siteHeader.toggleAttribute('scrolled', shouldPin);
    siteHeader.setAttribute('logo-size', shouldPin ? 'sm' : 'xl');
    if (shouldPin) {
      siteHeader.style.setProperty('--_brand-logo-base', '16px');
      siteHeader.style.setProperty('--mms-header-logo-height', '32px');
    } else {
      siteHeader.style.removeProperty('--_brand-logo-base');
      siteHeader.style.removeProperty('--mms-header-logo-height');
    }
  }

  updateSiteHeaderPinning();
  window.addEventListener('scroll', updateSiteHeaderPinning, { passive: true });
}

const govBannerToggle = document.getElementById('gov-banner-toggle');
const govBannerPanel = document.getElementById('gov-banner-panel');

if (isStakeholder()) {
  const header = document.querySelector('mms-header');
  if (header) header.setAttribute('home-href', 'dashboard.html');
}

if (govBannerToggle && govBannerPanel) {
  govBannerToggle.addEventListener('click', () => {
    const expanded = govBannerToggle.getAttribute('aria-expanded') === 'true';
    govBannerPanel.hidden = expanded;
    govBannerToggle.setAttribute('aria-expanded', String(!expanded));
  });
}
