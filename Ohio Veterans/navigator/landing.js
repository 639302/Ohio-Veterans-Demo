// Ohio Veterans — Navigator
// Landing screen behavior: free-text submit and the static topic tab strip
// (Benefits, GI Bill, Mental Health, Housing, Family — the 5 topics that
// aren't personalized by intake answers). Category quick-start scenarios now
// live in the account menu (nav.js/scenarios.js) instead of on this page.

import { matchCategoryFromText } from './questions.js';
import { getState, resetState, setIntent, setScenario, setLandingText } from './state.js';
import { buildBenefitsCard, buildGiBillCard, buildMentalHealthCard, buildHousingCard, buildFamilyCard, buildVeteranSupportCard, buildEmploymentTopicCard } from './static-content.js';
import { RENDERERS } from './card-renderers.js?v=2';

const tablistEl = document.getElementById('landing-tablist');
const tabpanelsEl = document.getElementById('landing-tabpanels');

const TOPIC_CARDS = [
  buildMentalHealthCard(),
  buildVeteranSupportCard(),
  buildEmploymentTopicCard(),
  buildBenefitsCard(),
  buildGiBillCard(),
  buildHousingCard(),
  buildFamilyCard(),
];

function renderLandingTabs() {
  tablistEl.innerHTML = '';
  tabpanelsEl.innerHTML = '';

  TOPIC_CARDS.forEach((card, index) => {
    const tabItem = document.createElement('mms-tabs-item');
    tabItem.setAttribute('icon', card.icon);
    tabItem.setAttribute('label', card.title);
    tabItem.setAttribute('panel-id', `landing-tabpanel-${card.key}`);
    tablistEl.appendChild(tabItem);

    const panel = document.createElement('div');
    panel.className = 'result-tabpanel';
    panel.id = `landing-tabpanel-${card.key}`;
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = index !== 0;
    const renderer = RENDERERS[card.key];
    if (renderer) panel.appendChild(renderer(card));
    tabpanelsEl.appendChild(panel);
  });

  tablistEl.addEventListener('tab-change', (event) => {
    const panels = Array.from(tabpanelsEl.querySelectorAll('.result-tabpanel'));
    panels.forEach((panel, i) => {
      panel.hidden = i !== event.detail.index;
    });
  });
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
