// Ohio Veterans — Navigator
// Shared chat-bubble rendering, extracted from intake.js so the bespoke
// VA-benefits flow (Addendum 14) can share the same transcript markup/CSS
// conventions without importing intake.js itself (which owns its own
// top-level start()/DOM listeners).

export function createChatUI(transcriptEl) {
  function scrollTranscriptToBottom() {
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  function appendAgentMessage(text) {
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
    scrollTranscriptToBottom();
    return message;
  }

  function appendUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--user';
    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    bubble.textContent = text;
    message.appendChild(bubble);
    transcriptEl.appendChild(message);
    scrollTranscriptToBottom();
    return message;
  }

  function appendCrisisMessage(text) {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--system';
    message.setAttribute('role', 'alert');

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    const icon = document.createElement('mms-icon');
    icon.setAttribute('name', 'warning');
    icon.setAttribute('size', 'md');
    const body = document.createElement('span');
    body.textContent = text;
    bubble.append(icon, body);

    message.appendChild(bubble);
    transcriptEl.appendChild(message);
    scrollTranscriptToBottom();
    return message;
  }

  function appendTypingIndicator() {
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
    bubble.append(
      document.createElement('span'),
      document.createElement('span'),
      document.createElement('span'),
    );

    message.append(avatar, bubble);
    transcriptEl.appendChild(message);
    scrollTranscriptToBottom();
    return message;
  }

  return {
    appendAgentMessage,
    appendUserMessage,
    appendCrisisMessage,
    appendTypingIndicator,
    scrollTranscriptToBottom,
  };
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Renders a checklist panel for a single- or multi-select question: a native
// mms-radio-group (single) or mms-checkbox-group (multi) wrapping one
// mms-radio/mms-checkbox per option — no custom row/highlight styling, so the
// list looks exactly like the canonical DS checkbox/radio group (previously
// each option was wrapped in a hand-rolled bordered/highlighted row, which
// produced a broken "stacked card" look with mismatched rounded corners when
// several adjacent rows were checked). mms-radio-group manages single-select
// state itself (set `value`, listen for the group's own `change` with
// `{ value }`); mms-checkbox-group is a plain layout/prop-propagation
// wrapper, so each mms-checkbox's own `change` event is still handled
// individually. Multi mode adds a footer with a submit button
// (id="continue-button", kept stable for callers that toggle its
// visibility). Digit keys 1-9 toggle the corresponding option (via the same
// shadow-DOM-input-click technique used elsewhere in this codebase);
// Cmd/Ctrl+Enter submits a multi-select — both are announced to screen
// readers via a visually-hidden hint rather than printed copy, and are
// suppressed while `textInput` has focus so typing isn't hijacked. Returns
// { dispose } — callers must call it before re-rendering the next turn's
// options so keydown listeners don't stack across turns.
export function renderOptionList(container, options, { mode, selected, onSelect, onToggle, onSubmit, submitLabel, textInput } = {}) {
  const panel = document.createElement('div');
  panel.className = 'chat-options';

  const group = document.createElement(mode === 'multi' ? 'mms-checkbox-group' : 'mms-radio-group');
  group.setAttribute('color-scheme', 'primary');
  if (mode === 'single' && selected) group.value = selected;

  const selectedSet = mode === 'multi' ? new Set(selected || []) : null;
  const controls = [];

  options.forEach((option) => {
    const control = document.createElement(mode === 'multi' ? 'mms-checkbox' : 'mms-radio');
    control.setAttribute('label', option.label);
    control.setAttribute('value', option.value);

    if (mode === 'multi') {
      control.setAttribute('checked-value', option.value);
      if (selectedSet.has(option.value)) control.setAttribute('checked', '');
      control.addEventListener('change', (event) => {
        const { checked, value } = event.detail;
        onToggle?.(value, checked);
      });
    }

    group.appendChild(control);
    controls.push(control);
  });

  if (mode === 'single') {
    group.addEventListener('change', (event) => onSelect?.(event.detail.value));
  }

  panel.appendChild(group);

  const hint = document.createElement('span');
  hint.className = 'visually-hidden';
  hint.textContent = mode === 'multi'
    ? `Press 1–${options.length} to toggle · ⌘/Ctrl + Enter to submit`
    : `Press 1–${options.length} to choose`;

  if (mode === 'multi') {
    const footer = document.createElement('div');
    footer.className = 'chat-options__footer';

    const submitButton = document.createElement('mms-button');
    submitButton.id = 'continue-button';
    submitButton.setAttribute('label', submitLabel || 'Continue');
    submitButton.setAttribute('variant', 'primary');
    submitButton.setAttribute('color-scheme', 'primary');
    submitButton.setAttribute('size', 'md');
    submitButton.addEventListener('click', () => onSubmit?.());

    footer.append(hint, submitButton);
    panel.appendChild(footer);
  } else {
    panel.appendChild(hint);
  }

  function handleKeydown(event) {
    if (textInput && document.activeElement === textInput) return;

    if (event.key >= '1' && event.key <= '9') {
      const control = controls[Number(event.key) - 1];
      if (!control) return;
      event.preventDefault();
      control.shadowRoot?.querySelector('input')?.click();
      return;
    }

    if (mode === 'multi' && event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSubmit?.();
    }
  }

  document.addEventListener('keydown', handleKeydown);
  container.appendChild(panel);

  return { dispose: () => document.removeEventListener('keydown', handleKeydown), panel };
}
