// Ohio Veterans — Navigator
// Chat-transcript intake: each question is an agent message, each answer a
// user message. Same question set/order/gating as the original stepper
// (state.js and questions.js are unchanged) — only the presentation is
// conversational. Every question is completable by tap/chip alone (kiosk
// path) or by typed free text, matched via questions.js/county-data.js's
// keyword matchers.

import { matchOptionsFromText } from './questions.js';
import { COUNTY_SELECT_OPTIONS, matchCountyFromText } from './county-data.js';
import {
  getState,
  getCurrentQuestion,
  getProgress,
  setAnswer,
  goToNext,
  goToPrevious,
  isLastQuestion,
} from './state.js';
import { createChatUI, wait, renderOptionList } from './chat-ui.js';
import { startVaBenefitsFlow, isVaBenefitsFlowActive } from './va-benefits-flow.js';
import { startDisabilityClaimFlow, isDisabilityClaimFlowActive } from './disability-claim-flow.js';

const transcript = document.getElementById('chat-transcript');
const quickReplies = document.getElementById('chat-quick-replies');
const textInput = document.getElementById('chat-text-input');
const sendButton = document.getElementById('chat-send-button');
const progressIndicator = document.getElementById('progress-indicator');
const progressLabel = document.getElementById('progress-label');
const progressTrack = document.getElementById('progress-track');
const progressFill = document.getElementById('progress-fill');
const backButton = document.getElementById('back-button');

const {
  appendAgentMessage,
  appendUserMessage,
  appendCrisisMessage,
  appendTypingIndicator,
  scrollTranscriptToBottom,
} = createChatUI(transcript);

// Working state for the question currently on screen; reset each turn.
let currentSelection = new Set();
let currentAgentNode = null;
let currentCrisisNode = null;
let disposeOptionList = null;
let currentOptionsPanel = null;

// Job-seeker and Healthcare-seeker scenarios: gates the first real question
// behind a Yes/No confirmation of the landing-page request, before any
// QUESTIONS entry runs.
let awaitingIntroConfirmation = false;

// One entry per already-answered question, so Back can rewind exactly one
// turn: remove that turn's user/crisis messages, restore its agent message
// as "current" again, and re-render its chips with the prior answer.
const turnStack = [];

function readExistingAnswer(questionId) {
  return getState().answers[questionId];
}

function updateProgress() {
  const { current, total } = getProgress();
  progressLabel.textContent = `Question ${current} of ${total}`;
  progressTrack.setAttribute('aria-valuenow', String(current));
  progressTrack.setAttribute('aria-valuemin', '1');
  progressTrack.setAttribute('aria-valuemax', String(total));
  progressFill.style.width = `${(current / total) * 100}%`;
}

function toggleCrisisMessage(question, show) {
  if (show && !currentCrisisNode) {
    currentCrisisNode = appendCrisisMessage(question.crisisNotice);
  } else if (!show && currentCrisisNode) {
    currentCrisisNode.remove();
    currentCrisisNode = null;
  }
}

function clearQuickReplies() {
  disposeOptionList?.();
  disposeOptionList = null;
  currentOptionsPanel?.remove();
  currentOptionsPanel = null;
  quickReplies.innerHTML = '';
  currentSelection = new Set();
}

function updateContinueButton() {
  const continueButton = document.getElementById('continue-button');
  if (!continueButton) return;
  continueButton.style.display = currentSelection.size > 0 ? '' : 'none';
}

function renderSingleChips(question, existingValue) {
  const bubble = currentAgentNode?.querySelector('.chat-message__bubble') || quickReplies;
  const { dispose, panel } = renderOptionList(bubble, question.options, {
    mode: 'single',
    selected: existingValue,
    textInput,
    onSelect: (value) => {
      const option = question.options.find((candidate) => candidate.value === value);
      submitAnswer(question, value, option.label);
    },
  });
  disposeOptionList = dispose;
  currentOptionsPanel = panel;
}

function renderMultiChips(question, existingValues) {
  currentSelection = new Set(existingValues || []);

  const bubble = currentAgentNode?.querySelector('.chat-message__bubble') || quickReplies;
  const { dispose, panel } = renderOptionList(bubble, question.options, {
    mode: 'multi',
    selected: currentSelection,
    textInput,
    onToggle: (value, checked) => {
      if (checked) currentSelection.add(value);
      else currentSelection.delete(value);

      if (question.crisisValue) {
        toggleCrisisMessage(question, currentSelection.has(question.crisisValue));
      }
      updateContinueButton();
    },
    onSubmit: () => {
      if (currentSelection.size === 0) return;
      const labels = question.options
        .filter((option) => currentSelection.has(option.value))
        .map((option) => option.label);
      submitAnswer(question, Array.from(currentSelection), labels.join(', '));
    },
  });
  disposeOptionList = dispose;
  currentOptionsPanel = panel;
  updateContinueButton();

  if (question.crisisValue) {
    toggleCrisisMessage(question, currentSelection.has(question.crisisValue));
  }
}

function renderCountyChips(question, existingValue) {
  const select = document.createElement('mms-select');
  select.placeholder = 'Select a county…';
  select.size = 'lg';
  select.options = COUNTY_SELECT_OPTIONS;
  if (existingValue) select.value = existingValue;

  select.addEventListener('change', (event) => {
    const value = event.detail?.value ?? select.value;
    if (!value) return;
    const label = COUNTY_SELECT_OPTIONS.find((option) => option.value === value)?.label || value;
    submitAnswer(question, value, label);
  });

  quickReplies.appendChild(select);
}

const DEFAULT_TEXT_INPUT_PLACEHOLDER = 'Type your answer, or tap an option above';

function resolveQuestionField(question, field) {
  const value = question[field];
  return typeof value === 'function' ? value(getState().answers) : value;
}

function renderChipsFor(question, existingAnswer) {
  clearQuickReplies();
  if (question.type === 'single') {
    renderSingleChips(question, existingAnswer);
  } else if (question.type === 'multi') {
    renderMultiChips(question, existingAnswer);
  } else if (question.type === 'select') {
    renderCountyChips(question, existingAnswer);
  }
  textInput.placeholder = question.type === 'text'
    ? resolveQuestionField(question, 'placeholder') || DEFAULT_TEXT_INPUT_PLACEHOLDER
    : DEFAULT_TEXT_INPUT_PLACEHOLDER;
  textInput.value = question.type === 'text' && existingAnswer ? existingAnswer : '';
  textInput.focus();
}

function beginTurn(question) {
  currentAgentNode = appendAgentMessage(resolveQuestionField(question, 'prompt'));
  currentCrisisNode = null;
  renderChipsFor(question, readExistingAnswer(question.id));
}

function renderYesNoChips() {
  clearQuickReplies();

  const yesButton = document.createElement('mms-button');
  yesButton.setAttribute('label', 'Yes');
  yesButton.setAttribute('variant', 'primary');
  yesButton.setAttribute('color-scheme', 'primary');
  yesButton.setAttribute('size', 'md');
  yesButton.addEventListener('click', () => confirmIntroYes());

  const noButton = document.createElement('mms-button');
  noButton.setAttribute('label', 'No');
  noButton.setAttribute('variant', 'secondary');
  noButton.setAttribute('color-scheme', 'primary');
  noButton.setAttribute('size', 'md');
  noButton.addEventListener('click', () => confirmIntroNo());

  quickReplies.append(yesButton, noButton);
}

function confirmIntroYes() {
  awaitingIntroConfirmation = false;
  appendUserMessage('Yes');
  clearQuickReplies();

  if (getState().answers.scenario === 'healthcare-seeker') {
    progressIndicator.hidden = true;
    startVaBenefitsFlow({
      transcript,
      quickReplies,
      textInput,
      sendButton,
      onFinish: () => {},
    });
    return;
  }

  if (getState().answers.scenario === 'disability-claim-reporter') {
    progressIndicator.hidden = true;
    startDisabilityClaimFlow({
      transcript,
      quickReplies,
      textInput,
      sendButton,
      onFinish: () => {},
    });
    return;
  }

  beginTurn(getCurrentQuestion());
  updateProgress();
}

function confirmIntroNo() {
  awaitingIntroConfirmation = false;
  appendUserMessage('No');
  window.location.href = 'index.html';
}

const SCENARIO_INTRO_FOLLOWUP = {
  'job-seeker': 'Let me ask you a few questions to create you a list of jobs tailored to you and your interests.',
  'healthcare-seeker': 'Let me ask you a few questions to help find the right information.',
  'disability-claim-reporter': 'Let me ask you a few questions to help find the right information.',
};

function beginIntroConfirmation(landingText, scenario) {
  const text = landingText || 'get help';
  const followUp = SCENARIO_INTRO_FOLLOWUP[scenario] || 'Let me ask you a few questions to help find the right information.';
  appendAgentMessage(`I understand you want to ${text}. ${followUp} Ready to get started?`);
  awaitingIntroConfirmation = true;
  renderYesNoChips();
}

function submitAnswer(question, value, displayText) {
  setAnswer(question.id, value);
  const userNode = appendUserMessage(displayText);
  turnStack.push({
    questionId: question.id,
    agentNode: currentAgentNode,
    userNode,
    crisisNode: currentCrisisNode,
  });
  currentAgentNode = null;
  currentCrisisNode = null;
  clearQuickReplies();
  advance();
}

async function advance() {
  if (isLastQuestion()) {
    appendAgentMessage("Got it — let's put together your pathway…");
    await wait(900);
    window.location.href = 'result.html';
    return;
  }

  const typing = appendTypingIndicator();
  goToNext();
  await wait(500);
  typing.remove();

  const question = getCurrentQuestion();
  beginTurn(question);
  updateProgress();
}

function handleTextSubmit() {
  if (isVaBenefitsFlowActive() || isDisabilityClaimFlowActive()) return;

  const text = textInput.value.trim();
  if (!text) return;

  if (awaitingIntroConfirmation) {
    const normalized = text.toLowerCase();
    textInput.value = '';
    if (/^(y|yes|yeah|yep|sure|ok|okay)/.test(normalized)) {
      confirmIntroYes();
    } else if (/^(n|no|nope|nah)/.test(normalized)) {
      confirmIntroNo();
    } else {
      appendUserMessage(text);
      appendAgentMessage('I didn\'t quite catch that — you can tap Yes or No above, or type "yes"/"no".');
    }
    return;
  }

  const question = getCurrentQuestion();
  if (!question) return;

  if (question.type === 'text') {
    submitAnswer(question, text, text);
    return;
  }

  if (question.type === 'select') {
    const match = matchCountyFromText(text);
    if (!match) {
      appendUserMessage(text);
      appendAgentMessage("I didn't catch a county in that — you can also pick one from the list above.");
      textInput.value = '';
      return;
    }
    submitAnswer(question, match, text);
    return;
  }

  const matches = matchOptionsFromText(question.options, text);
  if (matches.length === 0) {
    appendUserMessage(text);
    appendAgentMessage("I didn't quite catch that — you can also tap an option above.");
    textInput.value = '';
    return;
  }

  if (question.type === 'single') {
    submitAnswer(question, matches[0], text);
    return;
  }

  // Multi-select: typing implies confirmation, so merge into any existing
  // tap selections and submit immediately (no separate Continue tap needed).
  matches.forEach((value) => currentSelection.add(value));
  if (question.crisisValue && currentSelection.has(question.crisisValue)) {
    toggleCrisisMessage(question, true);
  }
  submitAnswer(question, Array.from(currentSelection), text);
}

backButton.addEventListener('click', () => {
  if (isVaBenefitsFlowActive() || isDisabilityClaimFlowActive()) return;

  if (turnStack.length === 0) {
    window.location.href = 'index.html';
    return;
  }

  currentAgentNode?.remove();
  const lastTurn = turnStack.pop();
  lastTurn.userNode?.remove();
  lastTurn.crisisNode?.remove();
  currentAgentNode = lastTurn.agentNode;
  currentCrisisNode = null;

  goToPrevious();
  const question = getCurrentQuestion();
  renderChipsFor(question, readExistingAnswer(question.id));
  updateProgress();
});

sendButton.addEventListener('click', () => handleTextSubmit());
textInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  handleTextSubmit();
});

function start() {
  const state = getState();
  const question = getCurrentQuestion();
  if (!question) {
    window.location.href = 'result.html';
    return;
  }
  if (SCENARIO_INTRO_FOLLOWUP[state.answers.scenario] && state.currentIndex === 0) {
    beginIntroConfirmation(state.landingText, state.answers.scenario);
    return;
  }
  beginTurn(question);
  updateProgress();
}

start();
