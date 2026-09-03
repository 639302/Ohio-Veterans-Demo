// Ohio Veterans — Navigator
// Reusable embedded chat widget, generic over any declarative flow-graph
// data (see resume-builder-flow.js for the shape). Mirrors intake.js's
// interaction pattern (agent/user bubbles, typing-indicator delay, tap
// chips + free-text fallback via questions.js's matchOptionsFromText) but
// takes a container + flow as parameters instead of reading global IDs, so
// multiple independent widgets can mount into different tabpanels on one
// page. Conversation state persists to sessionStorage under
// `navigator-flow-<flow.id>-v1` — swept by state.js's resetState() via the
// `navigator-flow-` key prefix convention (naming-only coupling, no import).

import { matchOptionsFromText } from './questions.js';
import { renderOptionList } from './chat-ui.js';

const DEFAULT_CLOSING_MESSAGE = "Thanks! I'll have more questions to help build out your resume soon.";

export function mountFlowChat(container, flow) {
  const storageKey = `navigator-flow-${flow.id}-v1`;

  function loadState() {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveState() {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }

  const state = loadState() || { currentNodeId: flow.start, transcript: [], completed: false };
  let disposeOptionList = null;
  let currentOptionsPanel = null;
  let currentAgentNode = null;

  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'chat-card';

  const transcriptEl = document.createElement('div');
  transcriptEl.className = 'chat-transcript';
  transcriptEl.setAttribute('role', 'log');
  transcriptEl.setAttribute('aria-live', 'polite');

  const quickReplies = document.createElement('div');
  quickReplies.className = 'chat-quick-replies';

  const inputRow = document.createElement('div');
  inputRow.className = 'chat-input-row';

  const inputId = `chat-text-input-${flow.id}`;
  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.setAttribute('for', inputId);
  label.textContent = 'Type your answer';

  const textInput = document.createElement('mms-text-field');
  textInput.id = inputId;
  textInput.setAttribute('placeholder', 'Type your answer, or tap an option above');
  textInput.setAttribute('size', 'lg');

  const sendButton = document.createElement('mms-button');
  sendButton.setAttribute('label', 'Send');
  sendButton.setAttribute('icon-only', '');
  sendButton.setAttribute('left-icon', 'paper-plane-right');
  sendButton.setAttribute('variant', 'primary');
  sendButton.setAttribute('color-scheme', 'primary');
  sendButton.setAttribute('size', 'lg');

  inputRow.append(label, textInput, sendButton);
  card.append(transcriptEl, quickReplies, inputRow);
  container.appendChild(card);

  function scrollToBottom() {
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  function renderAgentBubble(text) {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--agent';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    const icon = document.createElement('mms-icon');
    icon.setAttribute('name', 'robot');
    icon.setAttribute('size', 'sm');
    avatar.appendChild(icon);

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    const author = document.createElement('span');
    author.className = 'chat-message__author';
    author.textContent = 'The Navigator';
    const body = document.createElement('span');
    body.textContent = text;
    bubble.append(author, body);

    message.append(avatar, bubble);
    transcriptEl.appendChild(message);
    scrollToBottom();
    return message;
  }

  function renderUserBubble(text) {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--user';
    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    bubble.textContent = text;
    message.appendChild(bubble);
    transcriptEl.appendChild(message);
    scrollToBottom();
  }

  function renderTypingIndicator() {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--agent';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    const icon = document.createElement('mms-icon');
    icon.setAttribute('name', 'robot');
    icon.setAttribute('size', 'sm');
    avatar.appendChild(icon);

    const bubble = document.createElement('div');
    bubble.className = 'chat-typing-indicator';
    bubble.append(document.createElement('span'), document.createElement('span'), document.createElement('span'));

    message.append(avatar, bubble);
    transcriptEl.appendChild(message);
    scrollToBottom();
    return message;
  }

  function appendAgentMessage(text) {
    currentAgentNode = renderAgentBubble(text);
    state.transcript.push({ role: 'agent', text });
    saveState();
  }

  function appendUserMessage(text) {
    renderUserBubble(text);
    state.transcript.push({ role: 'user', text });
    saveState();
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clearQuickReplies() {
    disposeOptionList?.();
    disposeOptionList = null;
    currentOptionsPanel?.remove();
    currentOptionsPanel = null;
    quickReplies.innerHTML = '';
  }

  function setInputDisabled(disabled) {
    if (disabled) {
      textInput.setAttribute('disabled', '');
      sendButton.setAttribute('disabled', '');
    } else {
      textInput.removeAttribute('disabled');
      sendButton.removeAttribute('disabled');
    }
  }

  function renderSingleChips(node) {
    const bubble = currentAgentNode?.querySelector('.chat-message__bubble') || quickReplies;
    const { dispose, panel } = renderOptionList(bubble, node.options, {
      mode: 'single',
      textInput,
      onSelect: (value) => {
        const option = node.options.find((candidate) => candidate.value === value);
        submitAnswer(node, option, option.label);
      },
    });
    disposeOptionList = dispose;
    currentOptionsPanel = panel;
  }

  // Fakes a file upload for demo purposes: a real native file picker (so it
  // feels genuine), but the "parsing" that follows is entirely scripted —
  // only the picked filename is used, the file's contents are never read.
  function renderFileUpload(node) {
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
      submitAnswer(node, { value: fileName }, `📎 ${fileName}`);
    });

    chip.append(input, chipLabel);
    quickReplies.appendChild(chip);
  }

  function showNode(nodeId) {
    const node = flow.nodes[nodeId];
    state.currentNodeId = nodeId;
    saveState();

    clearQuickReplies();
    setInputDisabled(false);
    if (node.type === 'single') renderSingleChips(node);
    else if (node.type === 'file') renderFileUpload(node);

    textInput.value = '';
    textInput.placeholder =
      node.type === 'file' ? 'Or type "skip" to continue without uploading' : 'Type your answer, or tap an option above';
    textInput.focus();
  }

  async function advance(node, option) {
    clearQuickReplies();
    setInputDisabled(true);
    const typing = renderTypingIndicator();
    await wait(500);
    typing.remove();

    // node.next may be a plain node id, or a function of the raw answer
    // text (option.value) that returns a node id — lets a text node route
    // to different follow-up content based on what the user typed, without
    // the engine needing to know anything about that content itself.
    const nextId =
      (option && option.next) ||
      (typeof node.next === 'function' ? node.next(option ? option.value : '') : node.next) ||
      null;
    if (!nextId || !flow.nodes[nextId]) {
      appendAgentMessage(flow.closingMessage || DEFAULT_CLOSING_MESSAGE);
      state.completed = true;
      saveState();
      setInputDisabled(true);
      inputRow.hidden = true;
      return;
    }

    appendAgentMessage(flow.nodes[nextId].prompt);
    showNode(nextId);
  }

  function submitAnswer(node, option, displayText) {
    appendUserMessage(displayText);
    advance(node, option);
  }

  function handleTextSubmit() {
    const text = textInput.value.trim();
    if (!text) return;

    const node = flow.nodes[state.currentNodeId];
    if (!node) return;

    if (node.type === 'text' || node.type === 'file') {
      textInput.value = '';
      submitAnswer(node, { value: text }, text);
      return;
    }

    const matches = matchOptionsFromText(node.options, text);
    if (matches.length === 0) {
      appendUserMessage(text);
      appendAgentMessage("I didn't quite catch that — you can also tap an option above.");
      textInput.value = '';
      return;
    }

    const option = node.options.find((candidate) => candidate.value === matches[0]);
    textInput.value = '';
    submitAnswer(node, option, option.label);
  }

  sendButton.addEventListener('click', () => handleTextSubmit());
  textInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleTextSubmit();
  });

  if (state.transcript.length) {
    state.transcript.forEach((entry) => {
      if (entry.role === 'agent') currentAgentNode = renderAgentBubble(entry.text);
      else renderUserBubble(entry.text);
    });
  } else {
    appendAgentMessage(flow.nodes[flow.start].prompt);
  }

  if (state.completed) {
    clearQuickReplies();
    inputRow.hidden = true;
  } else {
    showNode(state.currentNodeId);
  }
}
