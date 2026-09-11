// Ohio Veterans — Navigator
// Pathway Result screen: simulated loading transition, then renders the
// always-visible CVSO Match + Next Steps cards plus the Employment card
// from pathway-logic.js. Card DOM-rendering lives in card-renderers.js,
// shared with landing.js's static topic tabs.

import { getState, resetState, setIntent, setScenario, setLandingText } from './state.js?v=4';
import { buildPathway } from './pathway-logic.js?v=2';
import { CATEGORIES } from './questions.js?v=4';
import { RENDERERS } from './card-renderers.js?v=3';
import { mountFlowChat } from './flow-chat.js?v=3';
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

const FOLLOWUP_QUESTIONS = [
  {
    label: 'What should I bring to my CVSO?',
    action: 'cvso',
  },
  {
    label: 'Help with a job interview',
    action: 'interview',
  },
  {
    label: 'Help with healthcare benefits',
    action: 'healthcare',
  },
  {
    label: 'Filing a disability claim',
    action: 'disability',
  },
];

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

function startGuidedScenario({ scenario, intent, landingText }) {
  resetState();
  setIntent(intent);
  setScenario(scenario);
  setLandingText(landingText);
  window.location.href = 'intake.html';
}

function createFollowupMessage(text, type = 'agent') {
  const message = document.createElement('div');
  message.className = `pathway-followup-chat__message pathway-followup-chat__message--${type}`;
  message.textContent = text;
  return message;
}

function scrollFollowupChatToBottom(chatLog) {
  chatLog.scrollTop = chatLog.scrollHeight;
}

function renderClaimOffer(container) {
  const offer = createFollowupMessage(
    "I can help you submit a claim today if you don't want to visit your CVSO. Would you like help with that today?"
  );

  const actions = document.createElement('div');
  actions.className = 'pathway-followup-chat__actions';

  const yesButton = document.createElement('mms-button');
  yesButton.setAttribute('label', 'Yes');
  yesButton.setAttribute('variant', 'primary');
  yesButton.setAttribute('color-scheme', 'primary');
  yesButton.setAttribute('size', 'md');
  yesButton.addEventListener('click', () => {
    startGuidedScenario({
      scenario: 'disability-claim-reporter',
      intent: 'benefits',
      landingText: 'I need help submitting a disability claim',
    });
  });

  const noButton = document.createElement('mms-button');
  noButton.setAttribute('label', 'No');
  noButton.setAttribute('variant', 'secondary');
  noButton.setAttribute('color-scheme', 'primary');
  noButton.setAttribute('size', 'md');
  noButton.addEventListener('click', () => {
    container.appendChild(createFollowupMessage('No', 'user'));
    container.appendChild(createFollowupMessage('Okay. You can still contact your CVSO when you are ready.'));
  });

  actions.append(yesButton, noButton);
  offer.appendChild(actions);
  container.appendChild(offer);
}

function renderCvsoBringResponse(container) {
  const intro = createFollowupMessage(
    "When meeting with your County Veterans Service Officer (CVSO) to file a VA disability claim, it's helpful to bring the following items:"
  );
  const list = document.createElement('ul');
  [
    'Medical records and hospital records related to your claimed condition or showing your disability has gotten worse',
    'Private medical records and hospital reports showing the same',
    'Supporting statements from family, friends, clergy, law enforcement, or people you served with explaining your condition and its impact',
    'Your discharge papers (DD214 or other separation documents)',
    'Any service treatment records you have',
  ].forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  const closing = document.createElement('p');
  closing.textContent = 'Having these documents ready can help process your claim more quickly. For more details on what evidence you may need.';
  intro.append(list, closing);
  container.appendChild(intro);
  renderClaimOffer(container);
}

function handleFollowupAction(action, label, chatLog) {
  chatLog.appendChild(createFollowupMessage(label, 'user'));

  if (action === 'cvso') {
    renderCvsoBringResponse(chatLog);
  } else if (action === 'interview') {
    chatLog.appendChild(createFollowupMessage('Try the Interview Help tab for answers tailored to your job position.'));
  } else if (action === 'healthcare') {
    startGuidedScenario({
      scenario: 'healthcare-seeker',
      intent: 'healthcare',
      landingText: 'I need help getting healthcare',
    });
  } else if (action === 'disability') {
    startGuidedScenario({
      scenario: 'disability-claim-reporter',
      intent: 'benefits',
      landingText: 'I need help submitting a disability claim',
    });
  }

  scrollFollowupChatToBottom(chatLog);
}

function inferFollowupAction(text) {
  const normalized = text.toLowerCase();
  if (/\b(cvso|county veterans|bring|document|dd214|discharge|records|evidence)\b/.test(normalized)) return 'cvso';
  if (/\b(interview|resume|job|position|prepare)\b/.test(normalized)) return 'interview';
  if (/\b(healthcare|health care|medical|enroll|clinic)\b/.test(normalized)) return 'healthcare';
  if (/\b(disability|claim|file|compensation)\b/.test(normalized)) return 'disability';
  return null;
}

function handleFollowupText(textInput, chatLog) {
  const text = textInput.value.trim();
  if (!text) return;

  const action = inferFollowupAction(text);
  if (action) {
    handleFollowupAction(action, text, chatLog);
  } else {
    chatLog.appendChild(createFollowupMessage(text, 'user'));
    chatLog.appendChild(createFollowupMessage(
      'I can help explain your pathway, point you to next steps, or guide you through another process. Try one of the quick questions below, or contact your CVSO for official guidance.'
    ));
    scrollFollowupChatToBottom(chatLog);
  }

  textInput.value = '';
}

function renderFollowupCard() {
  const card = document.createElement('mms-card');
  card.className = 'pathway-followup-card';
  card.setAttribute('variant', 'accent-left');
  card.setAttribute('color-scheme', 'primary');
  card.setAttribute('roundness', 'subtle');
  card.setAttribute('surface', 'tint');
  card.setAttribute('title-text', 'Do you need more help?');
  card.setAttribute('icon', 'chat-circle-text');

  const body = document.createElement('div');
  body.className = 'pathway-followup-card__body';
  body.setAttribute('slot', 'body-content');

  const expandButton = document.createElement('mms-button');
  expandButton.className = 'pathway-followup-card__expand-button';
  expandButton.setAttribute('label', 'Expand chat');
  expandButton.setAttribute('variant', 'ghost');
  expandButton.setAttribute('color-scheme', 'primary');
  expandButton.setAttribute('size', 'md');
  expandButton.setAttribute('aria-expanded', 'false');

  const intro = document.createElement('p');
  intro.textContent = 'Have another question, The Navigator can help explain these suggestions, point you to next steps, or guide you through another process. It cannot make decisions, determine eligibility, provide legal or medical advice.';

  const inputForm = document.createElement('form');
  inputForm.className = 'chat-input-row pathway-followup-card__input-form';

  const inputLabel = document.createElement('label');
  inputLabel.className = 'visually-hidden';
  inputLabel.setAttribute('for', 'pathway-followup-input');
  inputLabel.textContent = 'Ask a question about your pathway';

  const textInput = document.createElement('mms-text-field');
  textInput.id = 'pathway-followup-input';
  textInput.setAttribute('placeholder', 'Ask a question about your pathway');
  textInput.setAttribute('size', 'lg');

  const askButton = document.createElement('mms-button');
  askButton.setAttribute('label', 'Send');
  askButton.setAttribute('icon-only', '');
  askButton.setAttribute('left-icon', 'paper-plane-right');
  askButton.setAttribute('variant', 'primary');
  askButton.setAttribute('color-scheme', 'primary');
  askButton.setAttribute('size', 'lg');

  inputForm.append(inputLabel, textInput, askButton);

  const quickHeading = document.createElement('p');
  quickHeading.className = 'pathway-followup-card__quick-heading';
  quickHeading.textContent = 'Quick questions:';

  const quickList = document.createElement('div');
  quickList.className = 'pathway-followup-card__quick-list';

  const chatLog = document.createElement('div');
  chatLog.className = 'pathway-followup-chat';
  chatLog.setAttribute('aria-live', 'polite');

  expandButton.addEventListener('click', () => {
    const expanded = card.classList.toggle('is-expanded');
    expandButton.setAttribute('label', expanded ? 'Minimize chat' : 'Expand chat');
    expandButton.setAttribute('aria-expanded', String(expanded));
    document.body.classList.toggle('has-pathway-followup-sheet', expanded);
    if (expanded) textInput.focus();
  });

  inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handleFollowupText(textInput, chatLog);
  });

  askButton.addEventListener('click', (event) => {
    event.preventDefault();
    handleFollowupText(textInput, chatLog);
  });

  FOLLOWUP_QUESTIONS.forEach((question) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pathway-followup-card__quick-button';
    button.textContent = question.label;
    button.addEventListener('click', () => handleFollowupAction(question.action, question.label, chatLog));
    quickList.appendChild(button);
  });

  body.append(expandButton, intro, inputForm, quickHeading, quickList, chatLog);
  card.appendChild(body);
  return card;
}

// Job-seeker scenario's Employment, Resume Builder, and Interview Help tabs.
// Mirrors landing.js's static topic-tab pattern (renderLandingTabs), adapted
// so each panel holds a list of cards instead of exactly one.
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
  persistentGrid.appendChild(renderFollowupCard());
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
