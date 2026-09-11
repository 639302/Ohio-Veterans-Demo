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
    const badge = document.createElement('span');
    badge.className = 'chat-message__ai-badge';
    badge.textContent = 'AI-powered response';
    author.appendChild(badge);
    const body = document.createElement('span');
    body.textContent = text;
    const actions = document.createElement('div');
    actions.className = 'chat-message__actions';
    const reportButton = document.createElement('button');
    reportButton.type = 'button';
    reportButton.className = 'chat-message__report-button';
    reportButton.textContent = 'Report a problem';
    reportButton.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('navigator-report-ai-response'));
    });
    if (shouldShowVerifyLink(text)) {
      const verifyLink = document.createElement('a');
      verifyLink.href = 'https://www.va.gov/';
      verifyLink.target = '_blank';
      verifyLink.rel = 'noopener noreferrer';
      verifyLink.textContent = 'Verify on VA.gov';
      actions.appendChild(verifyLink);
    }
    actions.appendChild(reportButton);
    bubble.append(author, body, actions);

    message.append(avatar, bubble);
    transcriptEl.appendChild(message);
    scrollTranscriptToBottom();
    return message;
  }

  function shouldShowVerifyLink(text) {
    return !isQuestionOnly(text) && !isIntroTransition(text);
  }

  function isQuestionOnly(text) {
    const normalized = text.trim();
    return /^(what|which|where|when|why|how|do|does|did|is|are|was|were|have|has|can|could|would|will|tell me|please describe|please upload)\b/i.test(normalized);
  }

  function isIntroTransition(text) {
    return /^I understand you want to\b/i.test(text.trim());
  }

  function appendDisclosureMessage() {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--agent';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    const icon = document.createElement('mms-icon');
    icon.setAttribute('name', 'robot');
    icon.setAttribute('size', 'sm');
    avatar.appendChild(icon);

    const bubble = document.createElement('section');
    bubble.className = 'chat-message__bubble chat-message__bubble--disclosure';
    bubble.setAttribute('aria-labelledby', 'chat-disclosure-heading');

    const author = document.createElement('span');
    author.className = 'chat-message__author';
    author.textContent = 'The Navigator';
    const heading = document.createElement('h2');
    heading.id = 'chat-disclosure-heading';
    heading.className = 'chat-disclosure__heading';
    heading.textContent = 'Before you start';

    const paragraphs = [
      ['You are using an AI-powered tool, not chatting with a person.', ' The Navigator is operated by the Ohio Department of Veterans Services (ODVS), which is separate from the U.S. Department of Veterans Affairs (VA).'],
      ['It can suggest information and next steps, but it cannot make VA or ODVS decisions, determine eligibility, provide legal or medical advice, or submit a claim. Important information may be incomplete or incorrect—verify it with an official source or a Veterans Service Officer.'],
      ['Do not enter', ' a Social Security number, VA claim number, medical details, financial-account information, passwords, or other sensitive personal information. This prototype does not store or send your chat information to VA systems.'],
    ];

    paragraphs.forEach(([emphasis, text], index) => {
      const paragraph = document.createElement('p');
      if (index === 0 || index === 2) {
        const strong = document.createElement('strong');
        strong.textContent = emphasis;
        paragraph.append(strong, text);
      } else {
        paragraph.textContent = emphasis;
      }
      bubble.appendChild(paragraph);
    });

    const resources = document.createElement('p');
    const cvsoLink = document.createElement('a');
    cvsoLink.href = 'https://dvs.ohio.gov/resources-for-veterans/find-your-cvso';
    cvsoLink.target = '_blank';
    cvsoLink.rel = 'noopener noreferrer';
    cvsoLink.textContent = 'Find a County Veterans Service Office';
    const crisisLink = document.createElement('a');
    crisisLink.href = 'tel:988';
    crisisLink.textContent = '988';
    resources.append(cvsoLink, ' or call ', crisisLink, ', then press 1, for the Veterans Crisis Line.');
    bubble.prepend(author, heading);
    bubble.appendChild(resources);

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
    appendDisclosureMessage,
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
