// Ohio Veterans — Navigator
// Pathway Result screen: simulated loading transition, then renders the
// always-visible CVSO Match + Next Steps cards plus the Employment card
// from pathway-logic.js. Card DOM-rendering lives in card-renderers.js,
// shared with landing.js's static topic tabs.

import { getState, resetState, setIntent } from './state.js';
import { buildPathway } from './pathway-logic.js';
import { CATEGORIES } from './questions.js';
import { RENDERERS } from './card-renderers.js?v=2';
import { mountFlowChat } from './flow-chat.js';
import { RESUME_BUILDER_FLOW } from './resume-builder-flow.js';
import { INTERVIEW_HELP_FLOW } from './interview-help-flow.js';

// Tabs that show an embedded conversational chat widget (flow-chat.js)
// instead of pre-built cards. Keyed by tab.key from pathway-logic.js's
// JOB_FOCUS_TABS.
const TAB_CHAT_FLOWS = {
  'resume-builder': RESUME_BUILDER_FLOW,
  'interview-help': INTERVIEW_HELP_FLOW,
};

const loadingScreen = document.getElementById('loading-screen');
const errorScreen = document.getElementById('error-screen');
const emptyScreen = document.getElementById('empty-screen');
const emptyCategoryGrid = document.getElementById('empty-category-grid');
const emptyHeading = document.getElementById('empty-heading');
const resultsScreen = document.getElementById('results-screen');
const errorBody = document.getElementById('error-body');
const errorHeading = document.getElementById('error-heading');
const resultsHeading = document.getElementById('results-heading');
const persistentGrid = document.getElementById('persistent-grid');
const resultTabsWrapper = document.getElementById('result-tabs-wrapper');
const resultTablist = document.getElementById('result-tablist');
const resultTabpanels = document.getElementById('result-tabpanels');
const employmentGrid = document.getElementById('employment-grid');
const retryButton = document.getElementById('retry-button');

const CVSO_FALLBACK_PHONE = '(614) 644-0898';

function showError() {
  loadingScreen.hidden = true;
  errorScreen.hidden = false;
  errorBody.textContent = `Please try again, or contact your County Veterans Service Office at ${CVSO_FALLBACK_PHONE}.`;
  errorHeading.focus();
}

function renderCategoryCards() {
  CATEGORIES.forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tap-card';
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-label', `${category.label}: ${category.description}`);

    const icon = document.createElement('mms-icon');
    icon.setAttribute('name', category.icon);
    icon.setAttribute('size', 'lg');

    const title = document.createElement('span');
    title.className = 'tap-card__title';
    title.textContent = category.label;

    const description = document.createElement('span');
    description.className = 'tap-card__description';
    description.textContent = category.description;

    button.append(icon, title, description);
    button.addEventListener('click', () => {
      resetState();
      setIntent(category.value);
      window.location.href = 'intake.html';
    });

    emptyCategoryGrid.appendChild(button);
  });
}

function showEmptyState() {
  loadingScreen.hidden = true;
  emptyScreen.hidden = false;
  renderCategoryCards();
  emptyHeading.focus();
}

// Job-seeker scenario's per-job-focus tabs, one tab per selected option
// (Employment, Resume Builder, Interview Help). Mirrors landing.js's static
// topic-tab pattern (renderLandingTabs), adapted so each panel holds a list
// of cards instead of exactly one.
const TAB_ICONS = {
  employment: 'briefcase',
  'resume-builder': 'file-text',
  'interview-help': 'chat-circle-text',
};

function renderResultTabs(tabs) {
  resultTablist.innerHTML = '';
  resultTabpanels.innerHTML = '';

  tabs.forEach((tab, index) => {
    const tabItem = document.createElement('mms-tabs-item');
    tabItem.setAttribute('icon', TAB_ICONS[tab.key] || 'briefcase');
    tabItem.setAttribute('label', tab.label);
    tabItem.setAttribute('panel-id', `result-tabpanel-${tab.key}`);
    resultTablist.appendChild(tabItem);

    const panel = document.createElement('div');
    panel.className = 'result-tabpanel';
    panel.id = `result-tabpanel-${tab.key}`;
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = index !== 0;

    if (TAB_CHAT_FLOWS[tab.key]) {
      mountFlowChat(panel, TAB_CHAT_FLOWS[tab.key]);
    } else if (tab.cards.length) {
      tab.cards.forEach((card) => {
        const renderer = RENDERERS[card.key];
        if (renderer) panel.appendChild(renderer(card));
      });
    } else {
      const note = document.createElement('p');
      note.className = 'result-tabpanel__placeholder';
      note.textContent = "We're still building this section — check back soon.";
      panel.appendChild(note);
    }

    resultTabpanels.appendChild(panel);
  });

  resultTablist.addEventListener('tab-change', (event) => {
    const panels = Array.from(resultTabpanels.querySelectorAll('.result-tabpanel'));
    panels.forEach((panel, i) => {
      panel.hidden = i !== event.detail.index;
    });
  });
}

function showResults(answers) {
  loadingScreen.hidden = true;
  resultsScreen.hidden = false;
  const isHealthcareSeeker = answers.scenario === 'healthcare-seeker';
  // Healthcare Seeker's result screen shows both persistent cards (CVSO +
  // application status) full width, per that persona's bespoke result layout.
  persistentGrid.classList.toggle('result-grid--full-width', isHealthcareSeeker);
  const { persistent, employment, jobFocusTabs } = buildPathway(answers);
  persistent.forEach((card) => {
    const renderer = RENDERERS[card.key];
    if (renderer) persistentGrid.appendChild(renderer(card));
  });
  if (jobFocusTabs.length) {
    employmentGrid.hidden = true;
    resultTabsWrapper.hidden = false;
    renderResultTabs(jobFocusTabs);
  } else if (employment) {
    const renderer = RENDERERS[employment.key];
    if (renderer) employmentGrid.appendChild(renderer(employment));
  }
  resultsHeading.focus();
}

retryButton.addEventListener('click', () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('forceError');
  window.location.href = url.toString();
});

const forceError = new URLSearchParams(window.location.search).has('forceError');
if (new URLSearchParams(window.location.search).has('reset')) {
  resetState();
}
const { answers } = getState();

if (!forceError && Object.keys(answers).length === 0) {
  showEmptyState();
} else {
  window.setTimeout(() => {
    if (forceError) {
      showError();
      return;
    }
    showResults(answers);
  }, 1700);
}
