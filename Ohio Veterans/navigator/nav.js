// Ohio Veterans — Navigator
// Header account-menu disclosure, shared across all three pages. Renders
// Profile/Light Mode/Dark Mode/Sign out (logged in) or Login/Create an
// Account/Light Mode/Dark Mode (logged out) from auth.js's mocked,
// instant-toggle session state and theme.js's persisted mode, plus a "Try a
// scenario" section that seeds a guided-persona goal and jumps into intake.

import { isLoggedIn, logIn, logOut, getDisplayName } from './auth.js';
import { isDarkMode, setDarkMode } from './theme.js';
import { resetState, setIntent, setScenario, setLandingText } from './state.js';
import { SCENARIOS } from './scenarios.js';

const trigger = document.getElementById('nav-account-button');
const menu = document.getElementById('account-menu');
const avatar = document.getElementById('account-avatar');
const authButtons = document.getElementById('nav-auth-buttons');
const loginButton = document.getElementById('nav-login-button');
const createAccountButton = document.getElementById('nav-create-account-button');
const loginModal = document.getElementById('login-modal');
const createAccountModal = document.getElementById('create-account-modal');

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

  function addLabel(text) {
    const label = document.createElement('p');
    label.className = 'account-menu__label';
    label.textContent = text;
    menu.appendChild(label);
  }

  function addScenarioRow(scenario) {
    addAction(scenario.label, scenario.icon, () => {
      resetState();
      setIntent(scenario.goal);
      setScenario(scenario.value);
      if (scenario.promptText) setLandingText(scenario.promptText);
      window.location.href = '/Ohio-Veterans-Demo/Ohio%20Veterans/navigator/';
    });
  }

  function renderMenuItems() {
    menu.innerHTML = '';
    if (isLoggedIn()) {
      addAction('Profile', 'user-circle', () => {});
      addDivider();
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
      addDivider();
      addAction('Sign out', 'sign-out', logOut);
    } else {
      addThemeRow('Light Mode', 'sun', false);
      addThemeRow('Dark Mode', 'moon', true);
    }
    addDivider();
    addLabel('Try a scenario');
    SCENARIOS.forEach(addScenarioRow);
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

  if (loginButton && loginModal) {
    loginButton.addEventListener('click', () => {
      loginModal.open = true;
    });

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

  if (createAccountButton && createAccountModal) {
    createAccountButton.addEventListener('click', () => {
      createAccountModal.open = true;
    });

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
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleKeydown);
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

  trigger.addEventListener('click', () => {
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
document.querySelectorAll('.nav-header__nav a').forEach((link) => {
  if (normalizeNavPath(new URL(link.href, window.location.href).pathname) !== currentPath) return;
  link.setAttribute('aria-current', 'page');
});

const govBannerToggle = document.getElementById('gov-banner-toggle');
const govBannerPanel = document.getElementById('gov-banner-panel');

if (govBannerToggle && govBannerPanel) {
  govBannerToggle.addEventListener('click', () => {
    const expanded = govBannerToggle.getAttribute('aria-expanded') === 'true';
    govBannerPanel.hidden = expanded;
    govBannerToggle.setAttribute('aria-expanded', String(!expanded));
  });
}
