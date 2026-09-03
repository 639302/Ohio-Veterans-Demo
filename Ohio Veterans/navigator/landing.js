// Ohio Veterans — Navigator
// Landing screen behavior: free-text submit and the static topic tab strip
// (Benefits, GI Bill, Mental Health, Housing, Family — the 5 topics that
// aren't personalized by intake answers). Before a scenario has been chosen
// (fresh visit, no account-menu pick yet), the search box + CTA is swapped
// for a scenario dropdown so a first-time visitor picks a persona up front;
// once a scenario is set the normal free-text search box takes over again.

import { matchCategoryFromText } from './questions.js';
import { getState, resetState, setIntent, setScenario, setLandingText } from './state.js';
import { buildBenefitsCard, buildGiBillCard, buildMentalHealthCard, buildHousingCard, buildFamilyCard, buildVeteranSupportCard, buildEmploymentTopicCard } from './static-content.js';
import { RENDERERS } from './card-renderers.js?v=2';
import { SCENARIOS } from './scenarios.js';

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

const textForm = document.getElementById('landing-form');
const scenarioForm = document.getElementById('landing-scenario-form');
const hasScenario = Boolean(getState().answers.scenario);

if (hasScenario) {
  scenarioForm.hidden = true;
  textForm.hidden = false;

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
} else {
  textForm.hidden = true;
  scenarioForm.hidden = false;

  const scenarioSelect = document.getElementById('landing-scenario-select');
  const scenarioSubmit = document.getElementById('landing-scenario-submit');
  scenarioSelect.options = SCENARIOS.map((scenario) => ({ value: scenario.value, label: scenario.label }));

  function submitScenario() {
    const value = scenarioSelect.value;
    const scenario = SCENARIOS.find((item) => item.value === value);
    if (!scenario) return;
    resetState();
    setIntent(scenario.goal);
    setScenario(scenario.value);
    if (scenario.promptText) setLandingText(scenario.promptText);
    window.location.reload();
  }

  scenarioSubmit.addEventListener('click', submitScenario);
}
