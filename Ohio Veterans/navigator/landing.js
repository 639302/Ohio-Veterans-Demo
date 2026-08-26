// Ohio Veterans — Navigator
// Landing screen behavior: free-text submit and the static topic tab strip
// (Benefits, GI Bill, Mental Health, Housing, Family — the 5 topics that
// aren't personalized by intake answers). Category quick-start scenarios now
// live in the account menu (nav.js/scenarios.js) instead of on this page.

import { matchCategoryFromText } from './questions.js';
import { getState, resetState, setIntent, setScenario, setLandingText } from './state.js';
import { buildBenefitsCard, buildGiBillCard, buildMentalHealthCard, buildHousingCard, buildFamilyCard } from './static-content.js';
import { RENDERERS } from './card-renderers.js?v=2';

const tablistEl = document.getElementById('landing-tablist');
const tabpanelsEl = document.getElementById('landing-tabpanels');

const TOPIC_CARDS = [
  buildMentalHealthCard(),
  buildBenefitsCard(),
  buildGiBillCard(),
  buildHousingCard(),
  buildFamilyCard(),
];

function activateLandingTab(index) {
  const tabButtons = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  const panels = Array.from(tabpanelsEl.querySelectorAll('[role="tabpanel"]'));
  tabButtons.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected) tab.focus();
  });
  panels.forEach((panel, i) => {
    panel.hidden = i !== index;
  });
}

function handleLandingTablistKeydown(event) {
  const tabButtons = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
  const currentIndex = tabButtons.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
  let nextIndex = null;

  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabButtons.length;
  else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = tabButtons.length - 1;
  else return;

  event.preventDefault();
  activateLandingTab(nextIndex);
}

function renderLandingTabs() {
  tablistEl.innerHTML = '';
  tabpanelsEl.innerHTML = '';

  TOPIC_CARDS.forEach((card, index) => {
    const selected = index === 0;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'result-tab';
    tab.id = `landing-tab-${card.key}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(selected));
    tab.setAttribute('aria-controls', `landing-tabpanel-${card.key}`);
    tab.tabIndex = selected ? 0 : -1;
    tab.textContent = card.title;
    tab.addEventListener('click', () => activateLandingTab(index));
    tablistEl.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'result-tabpanel';
    panel.id = `landing-tabpanel-${card.key}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `landing-tab-${card.key}`);
    panel.hidden = !selected;
    const renderer = RENDERERS[card.key];
    if (renderer) panel.appendChild(renderer(card));
    tabpanelsEl.appendChild(panel);
  });

  tablistEl.addEventListener('keydown', handleLandingTablistKeydown);
}

renderLandingTabs();

const textInput = document.getElementById('landing-text-input');
const submitButton = document.getElementById('landing-submit');

const { landingText } = getState();
if (landingText) {
  textInput.addEventListener('focus', () => {
    textInput.value = landingText;
  }, { once: true });
}

function submitFreeText() {
  const text = textInput.value || '';
  const guess = matchCategoryFromText(text);
  const scenario = getState().answers.scenario;
  resetState();
  if (scenario) setScenario(scenario);
  setLandingText(text);
  setIntent(guess);
  window.location.href = 'intake.html';
}

submitButton.addEventListener('click', submitFreeText);
textInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') submitFreeText();
});
