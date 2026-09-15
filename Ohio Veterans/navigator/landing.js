// Ohio Veterans — Navigator
// Landing screen behavior: free-text submit, personalized prompt shortcuts,
// the bottom-sheet chat drawer experience, and the static topic tab strip.

import './session-reset.js?v=1';
import { matchCategoryFromText } from './questions.js?v=6';
import { getState, resetState, setIntent, setScenario, setLandingText } from './state.js?v=6';
import { buildBenefitsCard, buildGiBillCard, buildMentalHealthCard, buildHousingCard, buildFamilyCard, buildVeteranSupportCard, buildEmploymentTopicCard } from './static-content.js?v=6';
import { RENDERERS } from './card-renderers.js?v=11';
import { initChatDrawer, openChatDrawer, matchIntentKeywords } from './chat-drawer.js?v=19';

initChatDrawer();

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

function renderStartForm() {
  textForm.hidden = false;

  const textInput = document.getElementById('landing-text-input');
  const submitButton = document.getElementById('landing-submit');

  function submitFreeText() {
    const text = textInput.value || '';
    const match = matchIntentKeywords(text);
    openChatDrawer({ query: text, scenario: match });
  }

  submitButton.addEventListener('click', submitFreeText);
  textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitFreeText();
  });
}

renderStartForm();

document.querySelectorAll('.landing-prompt-card').forEach((card) => {
  customElements.whenDefined('mms-card').then(() => {
    card.showBody = false;
  });

  function startPrompt() {
    const scenarioValue = card.dataset.promptScenario;
    const promptText = card.dataset.promptText || card.getAttribute('title-text') || card.textContent.trim();
    openChatDrawer({ scenario: scenarioValue, promptText });
  }

  card.addEventListener('click', startPrompt);
  card.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    startPrompt();
  });
});
