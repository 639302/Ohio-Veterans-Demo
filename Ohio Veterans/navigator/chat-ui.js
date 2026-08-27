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
