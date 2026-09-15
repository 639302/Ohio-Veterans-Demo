// Ohio Veterans — Navigator
// Bottom-sheet AI-assisted chat controller.
// Houses conversational intake for Job Seeker, Healthcare Seeker, Disability Claim Reporter,
// and CVSO lookup, respecting all VA AI trust & safety guidelines and disclosure rules.

import {
  BRANCHES,
  STATUSES,
  INDUSTRY_BUCKETS,
  matchOptionsFromText,
} from './questions.js?v=6';
import {
  COUNTY_SELECT_OPTIONS,
  getCvsoInfo,
  matchCountyOrZipFromText,
  getCaregiverSupportLocation,
} from './county-data.js?v=7';
import {
  getState,
  resetState,
  setAnswer,
  setScenario,
  setLandingText,
  setIntent,
} from './state.js?v=6';
import { createChatUI, wait, renderOptionList } from './chat-ui.js?v=10';
import { startVaBenefitsFlow, isVaBenefitsFlowActive } from './va-benefits-flow.js?v=11';
import { startDisabilityClaimFlow, isDisabilityClaimFlowActive } from './disability-claim-flow.js?v=11';
import { RESUME_BUILDER_FLOW } from './resume-builder-flow.js?v=7';
import { INTERVIEW_HELP_FLOW } from './interview-help-flow.js?v=7';

const RECENT_CHAT_STORAGE_KEY = 'navigator-recent-chat';
const DISCLOSURE_ACK_STORAGE_KEY = 'navigator-disclosure-ack';

let drawerBackdrop = null;
let drawerEl = null;
let transcriptEl = null;
let quickRepliesEl = null;
let textInputEl = null;
let sendButtonEl = null;
let closeButtonEl = null;
let bottomRecentChatsBtn = null;
let needHelpBtn = null;

let chatUI = null;
let awaitingDisclosureAcknowledgment = true;
let pendingContext = null;
let currentActiveFlow = null; // 'job-seeker' | 'cvso' | 'general'
let jobSeekerStep = 0; // 0: branch, 1: status, 2: county, 3: industries, 4: complete
let currentAgentNode = null;
let disposeOptionList = null;
let currentOptionsPanel = null;
let currentSelection = new Set();

export function getRecentChat() {
  try {
    const raw = sessionStorage.getItem(RECENT_CHAT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    const state = getState();
    if (state.answers?.branch || state.answers?.status || state.answers?.county || state.answers?.industries) {
      return {
        type: state.scenario || 'job-seeker',
        landingText: state.landingText || 'I need employment help',
        answers: state.answers,
        completed: Boolean(state.answers.industries),
        timestamp: Date.now(),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function saveRecentChat(data) {
  try {
    const existing = getRecentChat() || {};
    const merged = { ...existing, ...data };
    sessionStorage.setItem(RECENT_CHAT_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function updateRecentChatsButtonVisibility() {
  const bottomBar = document.getElementById('chat-drawer-bottom-actions');
  const hasRecent = Boolean(getRecentChat());
  if (bottomBar) {
    bottomBar.hidden = !hasRecent;
  }
}

export function matchIntentKeywords(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Most specific keyword checks go first, so a phrase like "caregiver
  // support" resolves to its own scenario rather than the generic
  // mental-health/support catch-all further down.

  // Supporting a Veteran / family member keywords
  if (/\b(supporting a veteran|helping my family member|help my family member)\b/i.test(lower)) {
    return 'supporting-veteran';
  }

  // Caregiver Support keywords
  if (/\bcaregiver\b/i.test(lower)) {
    return 'caregiver-support';
  }

  // Resume keywords: anything with "resume"
  if (/\bresume\b/i.test(lower)) {
    return 'resume-help';
  }

  // Interview keywords: anything with "interview"
  if (/\binterview\b/i.test(lower)) {
    return 'interview-help';
  }

  // GI Bill keywords
  if (/\bgi bill|gi promise\b/i.test(lower)) {
    return 'gi-bill';
  }

  // Home loan keywords: anything with "home loan"
  if (/\bhome loans?\b/i.test(lower)) {
    return 'home-loan';
  }

  // Veteran Homes keywords
  if (/\bveteran(?:'?s)? homes?\b/i.test(lower)) {
    return 'veteran-homes';
  }

  // Mental health / support keywords (checked after the more specific
  // caregiver / supporting-a-veteran checks above).
  // "Need help" only counts as a crisis/mental-health signal when it's a
  // short standalone request ("need help" / "I need help") or paired with a
  // mental-health/illness-related term (e.g. "I have anxiety and need help"),
  // so it doesn't hijack unrelated requests like "I need help finding a job".
  const isStandaloneNeedHelp = /^(i\s+)?need help[.!?]?$/i.test(lower.trim());
  const hasMentalHealthSignal = /\b(mental health|depress\w*|anxiety|anxious|suicid\w*|crisis|hopeless|struggl\w*|overwhelm\w*|ptsd|trauma|stress\w*|grief|griev\w*|lonely|isolat\w*|not okay|not ok)\b/i.test(lower);
  if (/\bmental health\b/i.test(lower) || /\bsupport\b/i.test(lower) || isStandaloneNeedHelp || (/\bneed help\b/i.test(lower) && hasMentalHealthSignal)) {
    return 'mental-health-support';
  }

  // Disability / claims keywords: "disability", "claims"
  if (/\b(disability|disabilities|claim|claims|compensation|service-connected|service connected|rating)\b/i.test(lower)) {
    return 'disability-claim-reporter';
  }

  // Job keywords: "job", "employment"
  if (/\b(job|jobs|employment|employ|work|career|hiring|hire|skillbridge)\b/i.test(lower)) {
    return 'job-seeker';
  }

  // Healthcare keywords: "healthcare", "benefits"
  if (/\b(healthcare|health care|medical|clinic|doctor|benefits|benefit|medicaid|va hospital)\b/i.test(lower)) {
    return 'healthcare-seeker';
  }

  // CVSO keywords: "cvso", "county", "officer", "service office"
  if (/\b(cvso|county veterans|service office|service officer|vso|representative)\b/i.test(lower)) {
    return 'cvso';
  }

  return null;
}

export function initChatDrawer() {
  drawerBackdrop = document.getElementById('chat-drawer-backdrop');
  drawerEl = document.getElementById('chat-drawer');
  transcriptEl = document.getElementById('chat-transcript');
  quickRepliesEl = document.getElementById('chat-quick-replies');
  textInputEl = document.getElementById('chat-text-input');
  sendButtonEl = document.getElementById('chat-send-button');
  closeButtonEl = document.getElementById('chat-drawer-close');
  bottomRecentChatsBtn = document.getElementById('see-recent-chats-bottom-btn');
  needHelpBtn = document.getElementById('chat-drawer-need-help-btn');

  if (!drawerEl || !transcriptEl) return;

  chatUI = createChatUI(transcriptEl);

  if (closeButtonEl) {
    closeButtonEl.addEventListener('click', closeChatDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeChatDrawer);
  }

  if (needHelpBtn) {
    needHelpBtn.addEventListener('click', () => {
      startHumanHelpFlow();
    });
  }

  if (bottomRecentChatsBtn) {
    bottomRecentChatsBtn.addEventListener('click', () => {
      reloadRecentJobSeekerChat();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawerEl && !drawerEl.hidden) {
      closeChatDrawer();
    }
  });

  if (sendButtonEl) {
    sendButtonEl.addEventListener('click', handleUserSend);
  }

  if (textInputEl) {
    textInputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleUserSend();
      }
    });
  }

  document.addEventListener('navigator-start-flow', (event) => {
    const { scenario, query, promptText } = event.detail || {};
    openChatDrawer({ scenario, query, promptText });
  });

  const aiFeedbackModal = document.getElementById('ai-feedback-modal');
  document.addEventListener('navigator-report-ai-response', () => {
    if (aiFeedbackModal) {
      aiFeedbackModal.open = true;
    }
  });
}

export function openChatDrawer({ scenario = null, query = null, promptText = null } = {}) {
  if (!drawerEl) initChatDrawer();
  if (!drawerEl) return;

  drawerEl.removeAttribute('hidden');
  if (drawerBackdrop) drawerBackdrop.removeAttribute('hidden');

  drawerEl.classList.add('is-open');
  if (drawerBackdrop) drawerBackdrop.classList.add('is-open');

  updateRecentChatsButtonVisibility();

  if (scenario || query || promptText) {
    pendingContext = { scenario, query, promptText };
  }

  // If transcript is empty, check if disclosure acknowledgment is needed or if we can reload recent session
  if (transcriptEl.children.length === 0) {
    const hasAck = sessionStorage.getItem(DISCLOSURE_ACK_STORAGE_KEY) === 'true';
    if (!hasAck) {
      awaitingDisclosureAcknowledgment = true;
      renderDisclosurePrompt();
    } else if (scenario || query || promptText) {
      awaitingDisclosureAcknowledgment = false;
      if (textInputEl) textInputEl.removeAttribute('disabled');
      if (sendButtonEl) sendButtonEl.removeAttribute('disabled');
      startRequestedContext();
    } else if (getRecentChat()) {
      reloadRecentJobSeekerChat();
    } else {
      awaitingDisclosureAcknowledgment = false;
      if (textInputEl) textInputEl.removeAttribute('disabled');
      if (sendButtonEl) sendButtonEl.removeAttribute('disabled');
      renderGeneralWelcome();
    }
  } else if (!awaitingDisclosureAcknowledgment && (scenario || query || promptText)) {
    startRequestedContext();
  }
}

export function closeChatDrawer() {
  if (!drawerEl) return;
  drawerEl.classList.remove('is-open');
  if (drawerBackdrop) drawerBackdrop.classList.remove('is-open');
}

function clearQuickReplies() {
  disposeOptionList?.();
  disposeOptionList = null;
  currentOptionsPanel?.remove();
  currentOptionsPanel = null;
  if (quickRepliesEl) quickRepliesEl.innerHTML = '';
  currentSelection = new Set();
}

function renderDisclosurePrompt() {
  clearQuickReplies();
  const msgNode = chatUI.appendDisclosureMessage();
  const bubble = msgNode.querySelector('.chat-message__bubble');

  const btnGroup = document.createElement('div');
  btnGroup.className = 'chat-message__button-group';

  const startButton = document.createElement('mms-button');
  startButton.setAttribute('label', 'I understand — Start chat');
  startButton.setAttribute('variant', 'primary');
  startButton.setAttribute('color-scheme', 'primary');
  startButton.setAttribute('size', 'sm');
  startButton.addEventListener('click', acknowledgeDisclosure);

  const helpButton = document.createElement('mms-button');
  helpButton.setAttribute('label', 'I need help');
  helpButton.setAttribute('variant', 'secondary');
  helpButton.setAttribute('color-scheme', 'primary');
  helpButton.setAttribute('size', 'sm');
  helpButton.addEventListener('click', startHumanHelpFlow);

  btnGroup.append(startButton, helpButton);

  if (getRecentChat()) {
    const recentBtn = document.createElement('mms-button');
    recentBtn.id = 'see-recent-chats-disclosure-btn';
    recentBtn.setAttribute('label', 'See recent chats');
    recentBtn.setAttribute('variant', 'ghost');
    recentBtn.setAttribute('color-scheme', 'primary');
    recentBtn.setAttribute('size', 'sm');
    recentBtn.setAttribute('left-icon', 'clock-counter-clockwise');
    recentBtn.addEventListener('click', reloadRecentJobSeekerChat);
    btnGroup.appendChild(recentBtn);
  }

  if (bubble) {
    bubble.appendChild(btnGroup);
  } else {
    quickRepliesEl.appendChild(btnGroup);
  }

  if (textInputEl) textInputEl.setAttribute('disabled', '');
  if (sendButtonEl) sendButtonEl.setAttribute('disabled', '');
}

function acknowledgeDisclosure() {
  sessionStorage.setItem(DISCLOSURE_ACK_STORAGE_KEY, 'true');
  awaitingDisclosureAcknowledgment = false;
  chatUI.appendUserMessage('I understand — Start chat');
  clearQuickReplies();
  updateRecentChatsButtonVisibility();

  if (textInputEl) {
    textInputEl.removeAttribute('disabled');
    textInputEl.focus();
  }
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');

  startRequestedContext();
}

export function reloadRecentJobSeekerChat() {
  const recent = getRecentChat();
  if (!recent) return;

  sessionStorage.setItem(DISCLOSURE_ACK_STORAGE_KEY, 'true');
  awaitingDisclosureAcknowledgment = false;
  currentActiveFlow = 'job-seeker';
  jobSeekerStep = 4;

  if (transcriptEl) transcriptEl.innerHTML = '';
  clearQuickReplies();

  if (textInputEl) {
    textInputEl.removeAttribute('disabled');
    textInputEl.focus();
  }
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');

  const initialText = recent.landingText || 'I need employment help';
  chatUI.appendUserMessage(initialText);

  chatUI.appendAgentMessage('I understand you want employment help. I can create a tailored list of jobs, but first I need to know a little more about you.');

  if (recent.answers?.branch) {
    chatUI.appendAgentMessage('Which branch did you serve in?');
    const branchLabel = BRANCHES.find((b) => b.value === recent.answers.branch)?.label || recent.answers.branch;
    chatUI.appendUserMessage(branchLabel);
  }

  if (recent.answers?.status) {
    chatUI.appendAgentMessage('Which of these best describes you right now?');
    const statusLabel = STATUSES.find((s) => s.value === recent.answers.status)?.label || recent.answers.status;
    chatUI.appendUserMessage(statusLabel);
  }

  if (recent.answers?.county) {
    chatUI.appendAgentMessage('Where in Ohio do you currently live (or plan to live)? You can choose a county or give me your zipcode.');
    const countyLabel = COUNTY_SELECT_OPTIONS.find((c) => c.value === recent.answers.county)?.label || `${recent.answers.county} County`;
    chatUI.appendUserMessage(countyLabel);
  }

  if (recent.answers?.industries) {
    chatUI.appendAgentMessage('What field of work interests you? Choose all that apply.');
    const indList = Array.isArray(recent.answers.industries) ? recent.answers.industries : [recent.answers.industries];
    const indLabels = indList.map((val) => {
      if (val === 'not-sure') return 'Not sure yet';
      return INDUSTRY_BUCKETS.find((i) => i.value === val)?.label || val;
    }).join(', ');
    chatUI.appendUserMessage(indLabels);
  }

  renderJobSeekerFinishStep();
  updateRecentChatsButtonVisibility();
}

function startHumanHelpFlow() {
  awaitingDisclosureAcknowledgment = false;
  chatUI.appendUserMessage('I need help');
  clearQuickReplies();
  if (textInputEl) textInputEl.removeAttribute('disabled');
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');

  const msgNode = chatUI.appendAgentMessage('I can help you connect with a person. Would you like to call or find your County Veterans Service Office representative?');
  const bubble = msgNode.querySelector('.chat-message__bubble');

  const btnGroup = document.createElement('div');
  btnGroup.className = 'chat-message__button-group';

  const callButton = document.createElement('mms-button');
  callButton.setAttribute('label', 'Call');
  callButton.setAttribute('variant', 'primary');
  callButton.setAttribute('color-scheme', 'primary');
  callButton.setAttribute('size', 'sm');
  callButton.addEventListener('click', () => {
    chatUI.appendUserMessage('Call');
    clearQuickReplies();
    const replyNode = chatUI.appendAgentMessage('Call VA at 800-698-2411 for help. For immediate crisis support, call 988, then press 1.');
    renderGeneralOptions(replyNode);
  });

  const findButton = document.createElement('mms-button');
  findButton.setAttribute('label', 'Find a representative');
  findButton.setAttribute('variant', 'secondary');
  findButton.setAttribute('color-scheme', 'primary');
  findButton.setAttribute('size', 'sm');
  findButton.addEventListener('click', () => {
    chatUI.appendUserMessage('Find a representative');
    clearQuickReplies();
    startCvsoFlow();
  });

  btnGroup.append(callButton, findButton);

  if (bubble) {
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) bubble.insertBefore(btnGroup, actions);
    else bubble.appendChild(btnGroup);
  } else {
    quickRepliesEl.append(btnGroup);
  }
}

function startRequestedContext() {
  const ctx = pendingContext;
  pendingContext = null;

  if (!ctx) {
    renderGeneralWelcome();
    return;
  }

  if (ctx.scenario === 'job-seeker') {
    startJobSeekerFlow(ctx.promptText || ctx.query || 'I need employment help');
    return;
  }

  if (ctx.scenario === 'healthcare-seeker') {
    startHealthcareSeekerFlow(ctx.promptText || ctx.query || 'File for healthcare benefits');
    return;
  }

  if (ctx.scenario === 'disability-claim-reporter') {
    startDisabilityClaimFlowScenario(ctx.promptText || ctx.query || 'File a disability claim');
    return;
  }

  if (ctx.scenario === 'cvso' || ctx.promptText === 'Find my CVSO') {
    startCvsoFlow(ctx.promptText || ctx.query || 'Find my CVSO');
    return;
  }

  if (ctx.query || ctx.promptText) {
    handleQuery(ctx.query || ctx.promptText);
    return;
  }

  renderGeneralWelcome();
}

function renderGeneralWelcome() {
  const msgNode = chatUI.appendAgentMessage('How can I help you today? You can choose one of the options below or type your question:');
  renderGeneralOptions(msgNode);
}

function renderGeneralOptions(targetNode) {
  clearQuickReplies();
  const bubble = targetNode?.querySelector('.chat-message__bubble') || quickRepliesEl;

  const btnGroup = document.createElement('div');
  btnGroup.className = 'chat-message__button-group';

  const options = [
    { label: 'I need employment help', scenario: 'job-seeker' },
    { label: 'File a disability claim', scenario: 'disability-claim-reporter' },
    { label: 'File for healthcare benefits', scenario: 'healthcare-seeker' },
    { label: 'Find my CVSO', scenario: 'cvso' },
  ];

  options.forEach((opt) => {
    const btn = document.createElement('mms-button');
    btn.setAttribute('label', opt.label);
    btn.setAttribute('variant', 'secondary');
    btn.setAttribute('color-scheme', 'primary');
    btn.setAttribute('size', 'sm');
    btn.addEventListener('click', () => {
      if (opt.scenario === 'job-seeker') startJobSeekerFlow(opt.label);
      else if (opt.scenario === 'disability-claim-reporter') startDisabilityClaimFlowScenario(opt.label);
      else if (opt.scenario === 'healthcare-seeker') startHealthcareSeekerFlow(opt.label);
      else if (opt.scenario === 'cvso') startCvsoFlow(opt.label);
    });
    btnGroup.appendChild(btn);
  });

  if (getRecentChat()) {
    const recentBtn = document.createElement('mms-button');
    recentBtn.setAttribute('label', 'See recent chats');
    recentBtn.setAttribute('variant', 'ghost');
    recentBtn.setAttribute('color-scheme', 'primary');
    recentBtn.setAttribute('size', 'sm');
    recentBtn.setAttribute('left-icon', 'clock-counter-clockwise');
    recentBtn.addEventListener('click', reloadRecentJobSeekerChat);
    btnGroup.appendChild(recentBtn);
  }

  if (bubble && bubble !== quickRepliesEl) {
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) bubble.insertBefore(btnGroup, actions);
    else bubble.appendChild(btnGroup);
  } else {
    quickRepliesEl.appendChild(btnGroup);
  }
}

function handleQuery(text) {
  const match = matchIntentKeywords(text);
  if (match === 'job-seeker') {
    startJobSeekerFlow(text);
  } else if (match === 'healthcare-seeker') {
    startHealthcareSeekerFlow(text);
  } else if (match === 'disability-claim-reporter') {
    startDisabilityClaimFlowScenario(text);
  } else if (match === 'cvso') {
    startCvsoFlow(text);
  } else if (match === 'resume-help') {
    startResumeHelpTopic(text);
  } else if (match === 'interview-help') {
    startInterviewHelpTopic(text);
  } else if (match === 'mental-health-support') {
    startMentalHealthSupportTopic(text);
  } else if (match === 'supporting-veteran') {
    startSupportingVeteranTopic(text);
  } else if (match === 'gi-bill') {
    startGiBillTopic(text);
  } else if (match === 'home-loan') {
    startHomeLoanTopic(text);
  } else if (match === 'veteran-homes') {
    startVeteranHomesTopic(text);
  } else if (match === 'caregiver-support') {
    startCaregiverSupportTopic(text);
  } else {
    chatUI.appendUserMessage(text);
    clearQuickReplies();
    const msgNode = chatUI.appendAgentMessage("I am only a demo and have limited resources right now, I can't help with your specific request at the moment, but I can help you with finding a job, reporting a disability claim or applying for healthcare benefits, would you like help with one of those tasks?");
    renderFallbackOptions(msgNode);
  }
}

function renderFallbackOptions(targetNode) {
  clearQuickReplies();
  const bubble = targetNode?.querySelector('.chat-message__bubble') || quickRepliesEl;

  const btnGroup = document.createElement('div');
  btnGroup.className = 'chat-message__button-group';

  const options = [
    { label: 'Finding a job', scenario: 'job-seeker' },
    { label: 'Reporting a disability claim', scenario: 'disability-claim-reporter' },
    { label: 'Applying for healthcare benefits', scenario: 'healthcare-seeker' },
  ];

  options.forEach((opt) => {
    const btn = document.createElement('mms-button');
    btn.setAttribute('label', opt.label);
    btn.setAttribute('variant', 'secondary');
    btn.setAttribute('color-scheme', 'primary');
    btn.setAttribute('size', 'sm');
    btn.addEventListener('click', () => {
      if (opt.scenario === 'job-seeker') startJobSeekerFlow(opt.label);
      else if (opt.scenario === 'disability-claim-reporter') startDisabilityClaimFlowScenario(opt.label);
      else if (opt.scenario === 'healthcare-seeker') startHealthcareSeekerFlow(opt.label);
    });
    btnGroup.appendChild(btn);
  });

  if (getRecentChat()) {
    const recentBtn = document.createElement('mms-button');
    recentBtn.setAttribute('label', 'See recent chats');
    recentBtn.setAttribute('variant', 'ghost');
    recentBtn.setAttribute('color-scheme', 'primary');
    recentBtn.setAttribute('size', 'sm');
    recentBtn.setAttribute('left-icon', 'clock-counter-clockwise');
    recentBtn.addEventListener('click', reloadRecentJobSeekerChat);
    btnGroup.appendChild(recentBtn);
  }

  if (bubble && bubble !== quickRepliesEl) {
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) bubble.insertBefore(btnGroup, actions);
    else bubble.appendChild(btnGroup);
  } else {
    quickRepliesEl.appendChild(btnGroup);
  }
}

// ======================================================================
// Job Seeker Flow
// ======================================================================

function startJobSeekerFlow(initialUserText) {
  currentActiveFlow = 'job-seeker';
  jobSeekerStep = 0;
  resetState();
  setScenario('job-seeker');
  setAnswer('scenario', 'job-seeker');
  setAnswer('goals', ['employment']);
  setLandingText(initialUserText);
  setIntent('employment');

  saveRecentChat({
    type: 'job-seeker',
    landingText: initialUserText,
    answers: getState().answers,
    completed: false,
    timestamp: Date.now(),
  });

  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();

  chatUI.appendAgentMessage('I understand you want employment help. I can create a tailored list of jobs, but first I need to know a little more about you.');
  renderJobSeekerBranchStep();
}

function renderJobSeekerBranchStep() {
  jobSeekerStep = 0;
  clearQuickReplies();
  currentAgentNode = chatUI.appendAgentMessage('Which branch did you serve in?');

  const bubble = currentAgentNode.querySelector('.chat-message__bubble') || quickRepliesEl;
  const { dispose, panel } = renderOptionList(bubble, BRANCHES, {
    mode: 'single',
    selected: getState().answers.branch,
    textInput: textInputEl,
    orientation: 'horizontal',
    itemsPerRow: 4,
    onSelect: (value) => {
      const label = BRANCHES.find((b) => b.value === value)?.label || value;
      submitJobSeekerAnswer('branch', value, label);
    },
  });
  disposeOptionList = dispose;
  currentOptionsPanel = panel;
}

function renderJobSeekerStatusStep() {
  jobSeekerStep = 1;
  clearQuickReplies();
  currentAgentNode = chatUI.appendAgentMessage('Which of these best describes you right now?');

  const bubble = currentAgentNode.querySelector('.chat-message__bubble') || quickRepliesEl;
  const { dispose, panel } = renderOptionList(bubble, STATUSES, {
    mode: 'single',
    selected: getState().answers.status,
    textInput: textInputEl,
    onSelect: (value) => {
      const label = STATUSES.find((s) => s.value === value)?.label || value;
      submitJobSeekerAnswer('status', value, label);
    },
  });
  disposeOptionList = dispose;
  currentOptionsPanel = panel;
}

function renderJobSeekerCountyStep() {
  jobSeekerStep = 2;
  clearQuickReplies();
  currentAgentNode = chatUI.appendAgentMessage('Where in Ohio do you currently live (or plan to live)? You can choose a county or give me your zipcode.');

  const panel = document.createElement('div');
  panel.className = 'chat-options';

  const select = document.createElement('mms-select');
  select.placeholder = 'Select a county…';
  select.size = 'lg';
  select.options = COUNTY_SELECT_OPTIONS;
  if (getState().answers.county) select.value = getState().answers.county;

  select.addEventListener('change', (event) => {
    const value = event.detail?.value ?? select.value;
    if (!value) return;
    const label = COUNTY_SELECT_OPTIONS.find((opt) => opt.value === value)?.label || value;
    submitJobSeekerAnswer('county', value, label);
  });

  panel.appendChild(select);
  const bubble = currentAgentNode.querySelector('.chat-message__bubble') || quickRepliesEl;
  bubble.appendChild(panel);
  currentOptionsPanel = panel;
}

function renderJobSeekerIndustriesStep() {
  jobSeekerStep = 3;
  clearQuickReplies();
  currentAgentNode = chatUI.appendAgentMessage('What field of work interests you? Choose all that apply.');

  const options = [
    ...INDUSTRY_BUCKETS.map(({ value, label, keywords }) => ({ value, label, keywords })),
    { value: 'not-sure', label: 'Not sure yet', keywords: ['not sure', 'no idea', "don't know"] },
  ];

  currentSelection = new Set(getState().answers.industries || []);
  const bubble = currentAgentNode.querySelector('.chat-message__bubble') || quickRepliesEl;

  const { dispose, panel } = renderOptionList(bubble, options, {
    mode: 'multi',
    selected: currentSelection,
    textInput: textInputEl,
    orientation: 'horizontal',
    itemsPerRow: 4,
    onToggle: (value, checked) => {
      if (checked) currentSelection.add(value);
      else currentSelection.delete(value);
      updateJobSeekerContinueButton();
    },
    onSubmit: () => {
      if (currentSelection.size === 0) return;
      const labels = options
        .filter((opt) => currentSelection.has(opt.value))
        .map((opt) => opt.label);
      submitJobSeekerAnswer('industries', Array.from(currentSelection), labels.join(', '));
    },
  });
  disposeOptionList = dispose;
  currentOptionsPanel = panel;
  updateJobSeekerContinueButton();
}

function updateJobSeekerContinueButton() {
  const continueButton = document.getElementById('continue-button');
  if (continueButton) {
    continueButton.style.display = currentSelection.size > 0 ? '' : 'none';
  }
}

function submitJobSeekerAnswer(key, value, displayText) {
  setAnswer(key, value);
  chatUI.appendUserMessage(displayText);
  clearQuickReplies();

  const currentAnswers = getState().answers;
  saveRecentChat({
    type: 'job-seeker',
    landingText: getState().landingText || 'I need employment help',
    answers: currentAnswers,
    completed: key === 'industries' || Boolean(currentAnswers.industries),
    timestamp: Date.now(),
  });

  advanceJobSeeker();
}

async function advanceJobSeeker() {
  const typing = chatUI.appendTypingIndicator();
  await wait(450);
  typing.remove();

  if (jobSeekerStep === 0) {
    renderJobSeekerStatusStep();
  } else if (jobSeekerStep === 1) {
    renderJobSeekerCountyStep();
  } else if (jobSeekerStep === 2) {
    renderJobSeekerIndustriesStep();
  } else if (jobSeekerStep === 3) {
    renderJobSeekerFinishStep();
  }
}

function renderJobSeekerFinishStep() {
  jobSeekerStep = 4;
  currentActiveFlow = null;
  clearQuickReplies();

  if (textInputEl) {
    textInputEl.removeAttribute('disabled');
  }
  if (sendButtonEl) {
    sendButtonEl.removeAttribute('disabled');
  }

  saveRecentChat({
    type: 'job-seeker',
    landingText: getState().landingText || 'I need employment help',
    answers: getState().answers,
    completed: true,
    timestamp: Date.now(),
  });

  const msgNode = chatUI.appendAgentMessage('I have all the information I need to help you find a job. You can see your results by clicking this button that will open a new page.');
  const bubble = msgNode.querySelector('.chat-message__bubble');

  const btnContainer = document.createElement('div');
  btnContainer.className = 'chat-message__inline-action';

  const resultsButton = document.createElement('mms-button');
  resultsButton.id = 'see-job-results-button';
  resultsButton.setAttribute('label', 'See my job results');
  resultsButton.setAttribute('variant', 'primary');
  resultsButton.setAttribute('color-scheme', 'primary');
  resultsButton.setAttribute('size', 'md');
  resultsButton.setAttribute('left-icon', 'briefcase');
  resultsButton.addEventListener('click', () => {
    window.location.href = 'employment-results.html';
  });

  btnContainer.appendChild(resultsButton);

  const actions = bubble?.querySelector('.chat-message__actions');
  if (actions && bubble) {
    bubble.insertBefore(btnContainer, actions);
  } else if (bubble) {
    bubble.appendChild(btnContainer);
  }

  updateRecentChatsButtonVisibility();
  chatUI.scrollTranscriptToBottom();
}

// ======================================================================
// Healthcare Seeker Flow
// ======================================================================

function startHealthcareSeekerFlow(initialUserText) {
  currentActiveFlow = 'healthcare-seeker';
  resetState();
  setScenario('healthcare-seeker');
  setAnswer('scenario', 'healthcare-seeker');
  setAnswer('goals', ['healthcare']);
  setLandingText(initialUserText);
  setIntent('healthcare');

  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();

  chatUI.appendAgentMessage('I understand you want to file for healthcare benefits. Let me ask you a few questions to help find the right information.');

  startVaBenefitsFlow({
    transcript: transcriptEl,
    quickReplies: quickRepliesEl,
    textInput: textInputEl,
    sendButton: sendButtonEl,
    onFinish: () => {
      currentActiveFlow = null;
    },
  });
}

// ======================================================================
// Disability Claim Reporter Flow
// ======================================================================

function startDisabilityClaimFlowScenario(initialUserText) {
  currentActiveFlow = 'disability-claim-reporter';
  resetState();
  setScenario('disability-claim-reporter');
  setAnswer('scenario', 'disability-claim-reporter');
  setAnswer('goals', ['benefits']);
  setLandingText(initialUserText);
  setIntent('benefits');

  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();

  chatUI.appendAgentMessage('I understand you want to file a disability claim. Let me ask you a few questions to help find the right information.');

  startDisabilityClaimFlow({
    transcript: transcriptEl,
    quickReplies: quickRepliesEl,
    textInput: textInputEl,
    sendButton: sendButtonEl,
    onFinish: () => {
      currentActiveFlow = null;
    },
  });
}

// ======================================================================
// Find My CVSO Flow
// ======================================================================

function startCvsoFlow(initialUserText = 'Find my CVSO') {
  currentActiveFlow = 'cvso';
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();

  currentAgentNode = chatUI.appendAgentMessage('Where in Ohio do you currently live (or plan to live)? You can choose a county or give me your zipcode.');

  const panel = document.createElement('div');
  panel.className = 'chat-options';

  const select = document.createElement('mms-select');
  select.placeholder = 'Select a county…';
  select.size = 'lg';
  select.options = COUNTY_SELECT_OPTIONS;

  select.addEventListener('change', (event) => {
    const value = event.detail?.value ?? select.value;
    if (!value) return;
    const label = COUNTY_SELECT_OPTIONS.find((opt) => opt.value === value)?.label || value;
    handleCvsoCountySelection(value, label);
  });

  panel.appendChild(select);
  const bubble = currentAgentNode.querySelector('.chat-message__bubble') || quickRepliesEl;
  bubble.appendChild(panel);
  currentOptionsPanel = panel;
}

function handleCvsoCountySelection(countyValue, displayLabel) {
  setAnswer('county', countyValue);
  chatUI.appendUserMessage(displayLabel);
  clearQuickReplies();

  const info = getCvsoInfo(countyValue);
  const infoText = [
    `Here is the contact information for the ${info.officeName}:`,
    info.address ? `📍 Address: ${info.address}` : null,
    info.phone ? `📞 Phone: ${info.phone}` : null,
    info.email ? `✉️ Email: ${info.email}` : null,
  ].filter(Boolean).join('\n');

  const msgNode = chatUI.appendAgentMessage(infoText);
  const bubble = msgNode.querySelector('.chat-message__bubble');

  const btnGroup = document.createElement('div');
  btnGroup.className = 'chat-message__button-group';

  if (info.website) {
    const webBtn = document.createElement('mms-button');
    webBtn.setAttribute('label', 'Visit Office Website');
    webBtn.setAttribute('variant', 'primary');
    webBtn.setAttribute('color-scheme', 'primary');
    webBtn.setAttribute('size', 'sm');
    webBtn.addEventListener('click', () => {
      window.open(info.website, '_blank', 'noopener,noreferrer');
    });
    btnGroup.appendChild(webBtn);
  }

  const findAnotherBtn = document.createElement('mms-button');
  findAnotherBtn.setAttribute('label', 'Check another county');
  findAnotherBtn.setAttribute('variant', 'secondary');
  findAnotherBtn.setAttribute('color-scheme', 'primary');
  findAnotherBtn.setAttribute('size', 'sm');
  findAnotherBtn.addEventListener('click', () => startCvsoFlow('Look up another county'));

  btnGroup.append(findAnotherBtn);

  if (bubble) {
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) bubble.insertBefore(btnGroup, actions);
    else bubble.appendChild(btnGroup);
  } else {
    quickRepliesEl.append(btnGroup);
  }

  currentActiveFlow = null;
  if (textInputEl) textInputEl.removeAttribute('disabled');
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');
}

// ======================================================================
// Resume Help / Interview Help — pulls in the Resume Builder and Interview
// Help node-graphs (resume-builder-flow.js / interview-help-flow.js — the
// same flow data that drives their standalone pages via flow-chat.js) and
// walks them right here in the main Navigator chat window, using the same
// bubble/quick-reply primitives as the Job Seeker flow above instead of a
// second nested chat widget.
// ======================================================================

let embeddedFlow = null; // { flow, currentNodeId } while a resume/interview flow is running

function startResumeHelpTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    'You can get help you update the design and make sure the language matches the job description of the job you are applying for.',
  );
  startEmbeddedFlow(RESUME_BUILDER_FLOW);
}

function startInterviewHelpTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  const msgNode = chatUI.appendAgentMessage(
    'You can get help you with questions you might expect to get during an interview or even practice an interview with you. Would you like to start?',
  );
  const bubble = msgNode.querySelector('.chat-message__bubble');
  const btnGroup = document.createElement('div');
  btnGroup.className = 'chat-message__button-group';

  const yesButton = document.createElement('mms-button');
  yesButton.setAttribute('label', 'Yes');
  yesButton.setAttribute('variant', 'primary');
  yesButton.setAttribute('color-scheme', 'primary');
  yesButton.setAttribute('size', 'sm');
  yesButton.addEventListener('click', () => {
    chatUI.appendUserMessage('Yes');
    clearQuickReplies();
    startEmbeddedFlow(INTERVIEW_HELP_FLOW);
  });

  const noButton = document.createElement('mms-button');
  noButton.setAttribute('label', 'No');
  noButton.setAttribute('variant', 'secondary');
  noButton.setAttribute('color-scheme', 'primary');
  noButton.setAttribute('size', 'sm');
  noButton.addEventListener('click', () => {
    chatUI.appendUserMessage('No');
    clearQuickReplies();
    const followUp = chatUI.appendAgentMessage(
      "No problem. I can help you with finding a job, reporting a disability claim, or applying for healthcare benefits — would you like help with one of those instead?",
    );
    renderFallbackOptions(followUp);
  });

  btnGroup.append(yesButton, noButton);
  if (bubble) {
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) bubble.insertBefore(btnGroup, actions);
    else bubble.appendChild(btnGroup);
  } else {
    quickRepliesEl.appendChild(btnGroup);
  }
}

function startEmbeddedFlow(flow) {
  currentActiveFlow = 'embedded-flow';
  embeddedFlow = { flow, currentNodeId: flow.start };
  renderEmbeddedFlowNode(flow.start);
}

function renderEmbeddedFlowNode(nodeId) {
  const flow = embeddedFlow.flow;
  const node = flow.nodes[nodeId];

  if (!node) {
    chatUI.appendAgentMessage(flow.closingMessage || 'All done!');
    finishEmbeddedFlow();
    return;
  }

  embeddedFlow.currentNodeId = nodeId;
  clearQuickReplies();
  currentAgentNode = chatUI.appendAgentMessage(node.prompt);
  const bubble = currentAgentNode.querySelector('.chat-message__bubble') || quickRepliesEl;

  if (node.type === 'single') {
    const { dispose, panel } = renderOptionList(bubble, node.options, {
      mode: 'single',
      textInput: textInputEl,
      onSelect: (value) => {
        const option = node.options.find((candidate) => candidate.value === value);
        advanceEmbeddedFlow(node, option, option.label);
      },
    });
    disposeOptionList = dispose;
    currentOptionsPanel = panel;
  } else if (node.type === 'file') {
    const chip = document.createElement('label');
    chip.className = 'chat-chip';
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'chat-chip__control';
    input.accept = '.pdf,.doc,.docx,.txt';
    const chipLabel = document.createElement('span');
    chipLabel.className = 'chat-chip__label';
    chipLabel.textContent = node.uploadLabel || 'Upload resume';
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      const fileName = file ? file.name : 'resume.pdf';
      advanceEmbeddedFlow(node, { value: fileName }, `📎 ${fileName}`);
    });
    chip.append(input, chipLabel);
    bubble.appendChild(chip);
    currentOptionsPanel = chip;
  }

  if (textInputEl) {
    textInputEl.removeAttribute('disabled');
    textInputEl.placeholder =
      node.type === 'file' ? 'Or type "skip" to continue without uploading' : 'Type your answer, or tap an option above';
    textInputEl.focus();
  }
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');
}

function advanceEmbeddedFlow(node, option, displayText) {
  chatUI.appendUserMessage(displayText);
  clearQuickReplies();
  const nextId =
    (option && option.next) ||
    (typeof node.next === 'function' ? node.next(option ? option.value : '') : node.next) ||
    null;
  renderEmbeddedFlowNode(nextId);
}

function finishEmbeddedFlow() {
  embeddedFlow = null;
  currentActiveFlow = null;
  if (textInputEl) {
    textInputEl.removeAttribute('disabled');
    textInputEl.placeholder = 'Type your answer, or tap an option above';
  }
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');
}

function handleEmbeddedFlowText(text) {
  const flow = embeddedFlow.flow;
  const node = flow.nodes[embeddedFlow.currentNodeId];
  if (!node) return;

  if (node.type === 'text' || node.type === 'file') {
    if (node.type === 'file' && /^skip$/i.test(text.trim())) {
      advanceEmbeddedFlow(node, { value: '' }, 'Skip');
      return;
    }
    advanceEmbeddedFlow(node, { value: text }, text);
    return;
  }

  const matches = matchOptionsFromText(node.options, text);
  if (matches.length === 0) {
    chatUI.appendUserMessage(text);
    chatUI.appendAgentMessage("I didn't quite catch that — you can also tap an option above.");
    return;
  }
  const option = node.options.find((candidate) => candidate.value === matches[0]);
  advanceEmbeddedFlow(node, option, option.label);
}

// ======================================================================
// Mental Health & Crisis Support / Supporting a Veteran / GI Bill /
// Veteran Homes / Caregiver Support — informational canned responses (no
// follow-up flow, except Caregiver Support which asks for a county/ZIP so
// it can point to the nearest regional caregiver support page).
// ======================================================================

function startMentalHealthSupportTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    [
      "You are not alone — help is available right now.",
      "The Veterans Crisis Line is free, confidential, and available 24/7. Call 988 then press 1, text 838255 or start a [live chat](https://www.veteranscrisisline.net/get-help-now/chat/) today.",
      "If you'd like to see a counselor, but don't want to go to the VA, we can help you find a [community based behavioral counselor](https://starproviders.org/find-support/) with training in military culture.",
      "The Department of Veterans Affairs and the National Suicide Prevention Lifeline have joined with the American Foundation for Suicide Prevention to create the [Veterans Self-Check Quiz](https://www.vetselfcheck.org/welcome.cfm). This is a safe, easy way to learn whether stress and depression might be affecting you.",
      'Using this service is completely voluntary and confidential.',
    ].join('\n\n'),
  );
}

function startSupportingVeteranTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    [
      'Preventing Veteran suicide starts with a conversation.',
      "If a Veteran you care about is struggling, you have an opportunity to help. Let them know the Veterans Crisis Line is available — trained responders are ready to listen, and you can even offer to stay on a confidential three-way call for as long as they'd like support.",
      'These signs require immediate attention. Call 911 for medical emergencies. For a suicide crisis, contact the Veterans Crisis Line: Dial 988 then Press 1.',
      [
        'Talking about or threatening to hurt or kill themselves',
        'Looking for ways to end their life, such as searching online or seeking access to firearms or pills',
        'Talking about death, dying, or suicide — even if it seems vague, joking, or offhand',
        'Engaging in self-destructive behavior, like drug or alcohol abuse or misusing weapons',
      ].map((item) => `- ${item}`).join('\n'),
      'These signs may indicate a Veteran needs help. Contact the Veterans Crisis Line now: Dial 988 then Press 1.',
      [
        "Appearing sad, hopeless, or like there's no reason to live",
        'Anxiety, agitation, sleeplessness, or mood swings',
        'Excessive guilt, shame, or sense of failure',
        'Rage, anger, or violent behavior (like punching a wall or getting into fights)',
        'Increasing alcohol or drug misuse, or engaging in risky activities without thinking',
        'Withdrawing from family and friends, losing interest in hobbies/work/school, or neglecting personal appearance',
        'Giving away prized possessions or getting affairs in order',
      ].map((item) => `- ${item}`).join('\n'),
    ].join('\n\n'),
  );
}

function startGiBillTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    [
      "The Ohio GI Promise seeks to make Ohio the most veteran-friendly state in the country for higher education. To encourage veterans from across the country to bring their families, leadership, motivation, and maturity to Ohio's colleges and universities, the State of Ohio's executive order creating the Ohio GI Promise outlines criteria that lets qualified veterans and their dependents, from anywhere in the country, skip the standard 12-month residency requirement and attend Ohio's public colleges and universities at in-state tuition rates.",
      "Your County Veterans Service Office can help confirm whether you or your family qualify and walk you through applying. Learn more about the [Ohio GI Promise](https://highered.ohio.gov/initiatives/campus-initiatives/education-for-veterans/ohio-gi-promise) and some frequently asked questions.",
    ].join('\n\n'),
  );
}

function startHomeLoanTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    [
      'Federal Home Loan Programs\nEligible veterans receive [guaranteed loans](https://www.benefits.va.gov/homeloans/) to purchase, repair, or refinance a home.',
      'Housing for Wounded, Injured, and Ill Service Members and Surviving Spouses is also available. [Learn more and apply today](https://www.usace.army.mil/Missions/Real-Estate/HAP/How-to-Apply/)',
      "Ohio Home Loan Programs\nThe Ohio Housing Finance Agency offers all the benefits of their first-time home buyer program to Ohio's heroes at an interest rate approximately 1/4% lower than the going interest rate.",
      '[Learn about eligibility](https://dam.assets.ohio.gov/image/upload/v1780516560/dvs.ohio.gov/benefits/ohio-heroes-fillable.pdf) · [Learn more about the program](https://dam.assets.ohio.gov/image/upload/v1780584772/dvs.ohio.gov/benefits/homebuyerguide.pdf)',
      'Your County Veterans Service Office can help you understand which home loan option is best for your situation. [Find your CVSO](https://dvs.ohio.gov/resources-for-veterans/find-your-cvso)',
    ].join('\n\n'),
  );
}

function startVeteranHomesTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    [
      'Determine your eligibility and apply for free to one of the [Ohio Veterans Homes](https://dvs.ohio.gov/veterans-homes/determining-eligibility).',
      'If you are facing housing instability, help is available. The National Call Center for Homeless Veterans (877-424-3838) connects you with VA and community resources, including the Health Care for Homeless Veterans program.',
      '[VA homeless resources](https://www.va.gov/homeless/) · [National Coalition for Homeless Veterans](https://nchv.org/)',
      'Ohio Veterans Homes\nIf you or your veteran family member may need long-term nursing or assisted-living care, Ohio operates two state veterans homes that may be worth exploring.',
      'Ohio Veterans Home – Sandusky (est. 1888)\nLong-term nursing, memory care, and domiciliary care.',
      'Ohio Veterans Home – Georgetown (est. 2003)\nSkilled nursing care.',
      '(888) 387-6446 · ohiovet@dvs.ohio.gov',
      '[Determining eligibility for Ohio Veterans Homes](https://dvs.ohio.gov/)',
    ].join('\n\n'),
  );
}

function startCaregiverSupportTopic(initialUserText) {
  chatUI.appendUserMessage(initialUserText);
  clearQuickReplies();
  chatUI.appendAgentMessage(
    'Family members and caregivers can also get help through your County Veterans Service Office, including caregiver support resources and benefits information for dependents.',
  );
  currentActiveFlow = 'caregiver-support';
  const msgNode = chatUI.appendAgentMessage(
    "What county do you live in (or what's your ZIP code)? I'll point you to the closest VA Caregiver Support Program location.",
  );
  const bubble = msgNode.querySelector('.chat-message__bubble') || quickRepliesEl;

  const panel = document.createElement('div');
  panel.className = 'chat-options';
  const select = document.createElement('mms-select');
  select.placeholder = 'Select a county…';
  select.size = 'lg';
  select.options = COUNTY_SELECT_OPTIONS;
  select.addEventListener('change', (event) => {
    const value = event.detail?.value ?? select.value;
    if (!value) return;
    const label = COUNTY_SELECT_OPTIONS.find((opt) => opt.value === value)?.label || value;
    handleCaregiverSupportCounty(value, label);
  });
  panel.appendChild(select);
  bubble.appendChild(panel);
  currentOptionsPanel = panel;

  if (textInputEl) {
    textInputEl.removeAttribute('disabled');
    textInputEl.focus();
  }
  if (sendButtonEl) sendButtonEl.removeAttribute('disabled');
}

function handleCaregiverSupportCounty(countyValue, displayLabel) {
  chatUI.appendUserMessage(displayLabel);
  clearQuickReplies();
  currentActiveFlow = null;

  const location = getCaregiverSupportLocation(countyValue);
  if (location) {
    chatUI.appendAgentMessage(`The closest VA Caregiver Support Program location for you is [${location.label}](${location.url}).`);
  } else {
    chatUI.appendAgentMessage(
      "I couldn't match that to a specific region, but you can find your nearest location on the [VA Caregiver Support Program](https://www.caregiver.va.gov/) site.",
    );
  }
}

// ======================================================================
// User Send Handler
// ======================================================================

function handleUserSend() {
  if (isVaBenefitsFlowActive() || isDisabilityClaimFlowActive()) return;
  if (awaitingDisclosureAcknowledgment) return;

  const text = textInputEl.value.trim();
  if (!text) return;
  textInputEl.value = '';

  if (currentActiveFlow === 'job-seeker' && jobSeekerStep < 4) {
    handleJobSeekerText(text);
    return;
  }

  if (currentActiveFlow === 'cvso') {
    const match = matchCountyOrZipFromText(text);
    if (match) {
      handleCvsoCountySelection(match, text);
    } else {
      chatUI.appendUserMessage(text);
      chatUI.appendAgentMessage("I didn't catch an Ohio county or ZIP code in that — you can also pick a county from the list above.");
    }
    return;
  }

  if (currentActiveFlow === 'caregiver-support') {
    const match = matchCountyOrZipFromText(text);
    if (match) {
      handleCaregiverSupportCounty(match, text);
    } else {
      chatUI.appendUserMessage(text);
      chatUI.appendAgentMessage("I didn't catch an Ohio county or ZIP code in that — you can also pick a county from the list above.");
    }
    return;
  }

  if (currentActiveFlow === 'embedded-flow') {
    handleEmbeddedFlowText(text);
    return;
  }

  // Handle free text query in general flow or at end of previous flows
  handleQuery(text);
}

function handleJobSeekerText(text) {
  if (jobSeekerStep === 0) {
    const matches = matchOptionsFromText(BRANCHES, text);
    if (matches.length > 0) {
      const val = matches[0];
      const label = BRANCHES.find((b) => b.value === val)?.label || val;
      submitJobSeekerAnswer('branch', val, label);
    } else {
      chatUI.appendUserMessage(text);
      chatUI.appendAgentMessage("I didn't recognize that branch — please select one from the options above.");
    }
  } else if (jobSeekerStep === 1) {
    const matches = matchOptionsFromText(STATUSES, text);
    if (matches.length > 0) {
      const val = matches[0];
      const label = STATUSES.find((s) => s.value === val)?.label || val;
      submitJobSeekerAnswer('status', val, label);
    } else {
      chatUI.appendUserMessage(text);
      chatUI.appendAgentMessage("I didn't recognize that status — please select one of the options above.");
    }
  } else if (jobSeekerStep === 2) {
    const match = matchCountyOrZipFromText(text);
    if (match) {
      submitJobSeekerAnswer('county', match, text);
    } else {
      chatUI.appendUserMessage(text);
      chatUI.appendAgentMessage("I didn't catch an Ohio county or ZIP code in that — you can also pick a county from the dropdown above.");
    }
  } else if (jobSeekerStep === 3) {
    const options = [
      ...INDUSTRY_BUCKETS.map(({ value, label, keywords }) => ({ value, label, keywords })),
      { value: 'not-sure', label: 'Not sure yet', keywords: ['not sure', 'no idea', "don't know"] },
    ];
    const matches = matchOptionsFromText(options, text);
    if (matches.length > 0) {
      const labels = options.filter((opt) => matches.includes(opt.value)).map((opt) => opt.label);
      submitJobSeekerAnswer('industries', matches, labels.join(', '));
    } else {
      chatUI.appendUserMessage(text);
      chatUI.appendAgentMessage("Please choose one or more fields of interest above, or select 'Not sure yet'.");
    }
  } else {
    handleQuery(text);
  }
}
