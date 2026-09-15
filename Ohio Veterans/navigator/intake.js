// Ohio Veterans — Navigator
// Chat-transcript intake: each question is an agent message, each answer a
// user message. Same question set/order/gating as the original stepper
// (state.js and questions.js are unchanged) — only the presentation is
// conversational. Every question is completable by tap/chip alone (kiosk
// path) or by typed free text, matched via questions.js/county-data.js's
// keyword matchers.

import './session-reset.js?v=1';
import { matchOptionsFromText } from './questions.js?v=4';
import { COUNTY_SELECT_OPTIONS, getCvsoInfo, matchCountyOrZipFromText } from './county-data.js?v=2';
import {
  getState,
  getCurrentQuestion,
  getProgress,
  setAnswer,
  goToNext,
  goToPrevious,
  isLastQuestion,
} from './state.js?v=4';
import { createChatUI, wait, renderOptionList } from './chat-ui.js?v=10';
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
  appendDisclosureMessage,
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

let awaitingDisclosureAcknowledgment = false;

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
  const panel = document.createElement('div');
  panel.className = 'chat-options';

  const select = document.createElement('mms-select');
  select.placeholder = 'Select a county';
  select.size = 'lg';
  select.options = COUNTY_SELECT_OPTIONS;
  if (existingValue) select.value = existingValue;

  select.addEventListener('change', (event) => {
    const value = event.detail?.value ?? select.value;
    if (!value) return;
    const label = COUNTY_SELECT_OPTIONS.find((option) => option.value === value)?.label || value;
    submitAnswer(question, value, label);
  });

  panel.appendChild(select);
  const bubble = currentAgentNode?.querySelector('.chat-message__bubble') || quickReplies;
  bubble.appendChild(panel);
  currentOptionsPanel = panel;
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

function renderDisclosureChoices() {
  clearQuickReplies();

  const startButton = document.createElement('mms-button');
  startButton.setAttribute('label', 'I understand — Start chat');
  startButton.setAttribute('variant', 'primary');
  startButton.setAttribute('color-scheme', 'primary');
  startButton.setAttribute('size', 'md');
  startButton.addEventListener('click', () => acknowledgeDisclosure());

  const helpButton = document.createElement('mms-button');
  helpButton.setAttribute('label', 'I need help');
  helpButton.setAttribute('variant', 'secondary');
  helpButton.setAttribute('color-scheme', 'primary');
  helpButton.setAttribute('size', 'md');
  helpButton.addEventListener('click', () => startHumanHelpFlow());

  quickReplies.append(startButton, helpButton);
  textInput.setAttribute('disabled', '');
  sendButton.setAttribute('disabled', '');
}

function enableTextInput() {
  textInput.removeAttribute('disabled');
  sendButton.removeAttribute('disabled');
}

function acknowledgeDisclosure() {
  awaitingDisclosureAcknowledgment = false;
  appendUserMessage('I understand — Start chat');
  clearQuickReplies();
  enableTextInput();
  progressIndicator.hidden = false;
  startIntake();
}

function startHumanHelpFlow() {
  awaitingDisclosureAcknowledgment = false;
  appendUserMessage('I need help');
  clearQuickReplies();
  appendAgentMessage('I can help you connect with a person. Would you like to call or find your County Veterans Service Office representative?');

  const callButton = document.createElement('mms-button');
  callButton.setAttribute('label', 'Call');
  callButton.setAttribute('variant', 'primary');
  callButton.setAttribute('color-scheme', 'primary');
  callButton.setAttribute('size', 'md');
  callButton.addEventListener('click', () => {
    appendUserMessage('Call');
    clearQuickReplies();
    appendAgentMessage('Call VA at 800-698-2411 for help. For immediate crisis support, call 988, then press 1.');
  });

  const findButton = document.createElement('mms-button');
  findButton.setAttribute('label', 'Find a representative');
  findButton.setAttribute('variant', 'secondary');
  findButton.setAttribute('color-scheme', 'primary');
  findButton.setAttribute('size', 'md');
  findButton.addEventListener('click', () => {
    appendUserMessage('Find a representative');
    clearQuickReplies();
    appendAgentMessage('What Ohio county do you live in? I can look up your County Veterans Service Office representative.');
    const select = document.createElement('mms-select');
    select.placeholder = 'Select a county…';
    select.size = 'lg';
    select.options = COUNTY_SELECT_OPTIONS;
    select.addEventListener('change', (event) => {
      const value = event.detail?.value ?? select.value;
      if (!value) return;
      const label = COUNTY_SELECT_OPTIONS.find((option) => option.value === value)?.label || value;
      appendUserMessage(label);
      select.remove();
      const info = getCvsoInfo(value);
      appendAgentMessage(`${info.officeName} — ${info.address} — ${info.phone}`);
    });
    quickReplies.appendChild(select);
  });

  quickReplies.append(callButton, findButton);
}

function startScenarioFlow(scenario) {
  if (scenario === 'healthcare-seeker') {
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

  if (scenario === 'disability-claim-reporter') {
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

const SCENARIO_INTRO_FOLLOWUP = {
  'job-seeker': 'I can help create you a list of jobs and give you some interview and resume help, but I need to know a little more about you.',
  'healthcare-seeker': 'Let me ask you a few questions to help find the right information.',
  'disability-claim-reporter': 'Let me ask you a few questions to help find the right information.',
};

function beginIntroConfirmation(landingText, scenario) {
  const text = landingText || 'get help';
  const followUp = SCENARIO_INTRO_FOLLOWUP[scenario] || 'Let me ask you a few questions to help find the right information.';
  appendAgentMessage(`I understand you want to ${text}. ${followUp}`);
  startScenarioFlow(scenario);
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
  if (awaitingDisclosureAcknowledgment) return;

  const text = textInput.value.trim();
  if (!text) return;

  const question = getCurrentQuestion();
  if (!question) return;

  if (question.type === 'text') {
    submitAnswer(question, text, text);
    return;
  }

  if (question.type === 'select') {
    const match = matchCountyOrZipFromText(text);
    if (!match) {
      appendUserMessage(text);
      appendAgentMessage("I didn't catch an Ohio county or ZIP code in that — you can also pick a county from the list above.");
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

const feedbackModal = document.getElementById('ai-feedback-modal');
const feedbackText = document.getElementById('ai-feedback-text');

document.addEventListener('navigator-report-ai-response', () => {
  feedbackModal.open = true;
});

feedbackModal.addEventListener('primary-click', () => {
  feedbackText.value = '';
  feedbackModal.open = false;
});

feedbackModal.addEventListener('close', () => {
  feedbackText.value = '';
});

sendButton.addEventListener('click', () => handleTextSubmit());
textInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  event.preventDefault();
  handleTextSubmit();
});

function startIntake() {
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

function start() {
  progressIndicator.hidden = true;
  awaitingDisclosureAcknowledgment = true;
  appendDisclosureMessage();
  renderDisclosureChoices();
}

start();
