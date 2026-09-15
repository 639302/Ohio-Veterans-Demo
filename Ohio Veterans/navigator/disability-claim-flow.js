// Ohio Veterans — Navigator
// Bespoke VA-disability-claim conversation for the Disability Claim Reporter
// persona (Addendum 15). Mirrors va-benefits-flow.js's exact structure/
// conventions (own procedural control flow, not flow-chat.js's generic node
// engine — multi-field forms, an editable summary, a conditional checklist,
// a hard-disabled option, a document-upload screen, and an agreement screen
// don't fit that engine's single/text node shape).

import {
  DISABILITY_PROFILE,
  EDITABLE_DISABILITY_FIELDS,
  TOXIC_EXPOSURE_OPTIONS,
  BDD_REQUIREMENTS,
  DOCUMENT_UPLOAD_CATEGORIES,
  AGREEMENT_CONTENT,
  WHAT_TO_EXPECT_CONTENT,
  GET_HELP_TEXT,
} from './disability-claim-data.js?v=6';
import { COUNTY_SELECT_OPTIONS, getCvsoInfo } from './county-data.js?v=6';
import { getState, setAnswer } from './state.js?v=6';
import { createChatUI, wait } from './chat-ui.js?v=10';
import { logIn } from './auth.js?v=6';
import { renderAvatar } from './nav.js?v=17';

const DEFAULT_PLACEHOLDER = 'Type your answer, or tap an option above';

let active = false;

export function isDisabilityClaimFlowActive() {
  return active;
}

export function startDisabilityClaimFlow({ transcript, quickReplies, textInput, sendButton, onFinish }) {
  active = true;

  const { appendAgentMessage, appendUserMessage, appendTypingIndicator, scrollTranscriptToBottom } = createChatUI(transcript);

  // Local mutable copy — edits never touch the shared DISABILITY_PROFILE export.
  let profile = { ...DISABILITY_PROFILE };
  let loggedIn = false;
  let filedBefore = false;
  let stillServing = false;
  const uploadedFiles = {};
  const claimAnswers = {};
  // Drives pathway-logic.js's application-status card on result.html; only
  // ever 'not-started' or 'submitted' for this persona (no pending/not-eligible
  // outcome — the spec's evidence/BDD branching doesn't gate the claim itself).
  let applicationStatus = 'not-started';

  let pendingTextHandler = null;
  let lastAgentNode = null;

  function appendAgentMsg(text) {
    lastAgentNode = appendAgentMessage(text);
    return lastAgentNode;
  }

  function appendAgentMsgMultiline(text) {
    const node = appendAgentMessage(text);
    const span = node.querySelector('.chat-message__bubble > span:last-child');
    if (span) span.style.whiteSpace = 'pre-line';
    lastAgentNode = node;
    return node;
  }

  function clearQuickReplies() {
    if (quickReplies) quickReplies.innerHTML = '';
  }

  function showTextInput(placeholder, onSubmit) {
    textInput.placeholder = placeholder || DEFAULT_PLACEHOLDER;
    textInput.value = '';
    textInput.focus();
    pendingTextHandler = onSubmit;
  }

  function hideTextInput() {
    pendingTextHandler = null;
    textInput.placeholder = DEFAULT_PLACEHOLDER;
  }

  function handleTextSubmit() {
    const text = textInput.value.trim();
    if (!text || !pendingTextHandler) return;
    textInput.value = '';
    const handler = pendingTextHandler;
    pendingTextHandler = null;
    handler(text);
  }

  sendButton.addEventListener('click', () => {
    if (!active) return;
    handleTextSubmit();
  });
  textInput.addEventListener('keydown', (event) => {
    if (!active || event.key !== 'Enter') return;
    event.preventDefault();
    handleTextSubmit();
  });

  function addButton(label, variant, onClick, targetNode = lastAgentNode) {
    const bubble = targetNode?.querySelector('.chat-message__bubble') || quickReplies;
    let group = bubble.querySelector('.chat-message__button-group');
    if (!group) {
      group = document.createElement('div');
      group.className = 'chat-message__button-group';
      const actions = bubble.querySelector('.chat-message__actions');
      if (actions) {
        bubble.insertBefore(group, actions);
      } else {
        bubble.appendChild(group);
      }
    }
    const button = document.createElement('mms-button');
    button.setAttribute('label', label);
    button.setAttribute('variant', variant || 'secondary');
    button.setAttribute('color-scheme', 'primary');
    button.setAttribute('size', 'sm');
    button.addEventListener('click', () => {
      button.disabled = true;
      onClick();
    });
    group.appendChild(button);
    scrollTranscriptToBottom();
    return button;
  }

  function renderYesNo(onYes, onNo, targetNode = lastAgentNode) {
    addButton('Yes', 'primary', () => {
      appendUserMessage('Yes');
      clearQuickReplies();
      onYes();
    }, targetNode);
    addButton('No', 'secondary', () => {
      appendUserMessage('No');
      clearQuickReplies();
      onNo();
    }, targetNode);
  }

  // "Any other disability?" — Yes is visually present but inert per the
  // spec's explicit "only allow them to select no."
  function renderYesDisabledNo(onNo, targetNode = lastAgentNode) {
    const bubble = targetNode?.querySelector('.chat-message__bubble') || quickReplies;
    let group = bubble.querySelector('.chat-message__button-group');
    if (!group) {
      group = document.createElement('div');
      group.className = 'chat-message__button-group';
      const actions = bubble.querySelector('.chat-message__actions');
      if (actions) {
        bubble.insertBefore(group, actions);
      } else {
        bubble.appendChild(group);
      }
    }
    const yesButton = document.createElement('mms-button');
    yesButton.setAttribute('label', 'Yes');
    yesButton.setAttribute('variant', 'primary');
    yesButton.setAttribute('color-scheme', 'primary');
    yesButton.setAttribute('size', 'sm');
    yesButton.setAttribute('aria-disabled', 'true');
    yesButton.toggleAttribute('disabled', true);
    group.appendChild(yesButton);

    const noButton = document.createElement('mms-button');
    noButton.setAttribute('label', 'No');
    noButton.setAttribute('variant', 'secondary');
    noButton.setAttribute('color-scheme', 'primary');
    noButton.setAttribute('size', 'sm');
    noButton.addEventListener('click', () => {
      appendUserMessage('No');
      clearQuickReplies();
      onNo();
    });
    group.appendChild(noButton);
    scrollTranscriptToBottom();
  }

  let currentScreenId = null;
  let currentScreenArgs = null;

  function renderScreen(screenId, args) {
    currentScreenId = screenId;
    currentScreenArgs = args || {};
    clearQuickReplies();
    hideTextInput();
    SCREENS[screenId](currentScreenArgs);
  }

  // --- Get Help (reachable from every screen) ---------------------------

  function openGetHelp() {
    appendUserMessage('Need help?');
    appendAgentMsg(GET_HELP_TEXT);
    clearQuickReplies();
    hideTextInput();
    addButton('Call', 'primary', () => {
      appendUserMessage('Call');
      clearQuickReplies();
      runCallSequence();
    });
    addButton('Find a Representative', 'secondary', () => {
      appendUserMessage('Find a Representative');
      clearQuickReplies();
      runFindRepresentative();
    });
  }

  async function runCallSequence() {
    const typing = appendTypingIndicator();
    await wait(1000);
    typing.remove();
    appendAgentMsg('Calling MyVA411 from your computer…');
    const typing2 = appendTypingIndicator();
    await wait(1200);
    typing2.remove();
    appendAgentMsg("You're connected — a live representative will be with you shortly.");
    renderScreen(currentScreenId, currentScreenArgs);
  }

  function runFindRepresentative() {
    const msg = appendAgentMsg('What Ohio county do you live in? I can look up your local accredited representative.');
    const bubble = msg.querySelector('.chat-message__bubble');
    const panel = document.createElement('div');
    panel.className = 'chat-options';

    const select = document.createElement('mms-select');
    select.placeholder = 'Select a county…';
    select.size = 'lg';
    select.options = COUNTY_SELECT_OPTIONS;
    select.addEventListener('change', (event) => {
      const value = event.detail?.value ?? select.value;
      if (!value) return;
      const label = COUNTY_SELECT_OPTIONS.find((option) => option.value === value)?.label || value;
      appendUserMessage(label);
      clearQuickReplies();
      const info = getCvsoInfo(value);
      appendAgentMsg(`${info.officeName} — ${info.address} — ${info.phone}`);
      hideTextInput();
      addButton('Continue', 'primary', () => {
        appendUserMessage('Continue');
        clearQuickReplies();
        renderScreen(currentScreenId, currentScreenArgs);
      });
    });
    panel.appendChild(select);
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) {
      bubble.insertBefore(panel, actions);
    } else {
      bubble.appendChild(panel);
    }
  }

  // --- Wrap-up (silently records county, then ends the conversation) -----

  function closeOutThen(message) {
    appendAgentMsg(message);
    renderScreen('anything-else');
  }

  function renderAnythingElseScreen() {
    const msg = appendAgentMsg('Is there anything else I can help you with today?');
    addButton("No, that's all — thank you", 'primary', () => {
      appendUserMessage("No, that's all — thank you");
      appendAgentMsg('Ok. Have a nice day.');
      ensureCountyThenWrapup();
    }, msg);
  }

  function ensureCountyThenWrapup() {
    setAnswer('applicationStatus', applicationStatus);
    if (loggedIn) {
      setAnswer('county', profile.county);
      finish();
    } else {
      renderScreen('fallback-county');
    }
  }

  function renderFallbackCountyScreen() {
    const msg = appendAgentMsg('What Ohio county do you live in?');
    const bubble = msg.querySelector('.chat-message__bubble');
    const panel = document.createElement('div');
    panel.className = 'chat-options';

    const select = document.createElement('mms-select');
    select.placeholder = 'Select a county…';
    select.size = 'lg';
    select.options = COUNTY_SELECT_OPTIONS;
    select.addEventListener('change', (event) => {
      const value = event.detail?.value ?? select.value;
      if (!value) return;
      const label = COUNTY_SELECT_OPTIONS.find((option) => option.value === value)?.label || value;
      appendUserMessage(label);
      setAnswer('county', value);
      clearQuickReplies();
      finish();
    });
    panel.appendChild(select);
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) {
      bubble.insertBefore(panel, actions);
    } else {
      bubble.appendChild(panel);
    }
  }

  async function finish() {
    active = false;
    const county = getState().answers.county || profile.county || 'Franklin';
    const info = getCvsoInfo(county);
    const msg = appendAgentMsg(`Your disability claim information has been recorded. If you need help gathering evidence or filing an appeal, your County Veterans Service Office has accredited representatives ready to assist:\n${info.officeName}\n${info.address || ''}\nPhone: ${info.phone}`);
    addButton('Find a job', 'primary', () => {
      document.dispatchEvent(new CustomEvent('navigator-start-flow', { detail: { scenario: 'job-seeker' } }));
    }, msg);
    addButton('Find my CVSO', 'secondary', () => {
      document.dispatchEvent(new CustomEvent('navigator-start-flow', { detail: { scenario: 'cvso' } }));
    }, msg);
    addButton('Ask another question', 'ghost', () => {
      document.dispatchEvent(new CustomEvent('navigator-start-flow', { detail: { scenario: null } }));
    }, msg);
    if (onFinish) onFinish();
  }

  // --- Claim type / filed-before branch -----------------------------------

  function renderClaimTypeQuestionScreen() {
    appendAgentMsg("Tell me about the type of claim you'd like to file — what condition or disability are you dealing with?");
    showTextInput('Describe your condition', (text) => {
      appendUserMessage(text);
      claimAnswers.claimType = text;
      renderScreen('filed-before-question');
    });
  }

  function renderFiledBeforeQuestionScreen() {
    const msg = appendAgentMsg('Have you filed a claim for disability compensation before?');
    renderYesNo(
      () => { filedBefore = true; renderScreen('existing-claim-message'); },
      () => { filedBefore = false; renderScreen('first-claim-message'); },
      msg
    );
  }

  // --- Existing-claim branch -----------------------------------------------

  function renderExistingClaimMessageScreen() {
    appendAgentMsg("Ok, I understand you want to file a new claim for an existing service-connected disability.");
    renderScreen('evidence-question');
  }

  function renderEvidenceQuestionScreen() {
    const msg = appendAgentMsg('Do you have new evidence to support your claim?');
    renderYesNo(
      () => renderScreen('login'),
      () => renderScreen('no-evidence-message'),
      msg
    );
  }

  function renderNoEvidenceMessageScreen() {
    const msg = appendAgentMsg("You don't have to submit any evidence — we may need to schedule you for a claim exam instead. Do you want to proceed?");
    renderYesNo(
      () => renderScreen('login'),
      () => closeOutThen('No problem — thanks for stopping by.'),
      msg
    );
  }

  // --- First-claim branch ----------------------------------------------------

  function renderFirstClaimMessageScreen() {
    appendAgentMsg('Ok, I understand you want to file your first claim for disability compensation.');
    renderScreen('active-duty-question');
  }

  function renderActiveDutyQuestionScreen() {
    const msg = appendAgentMsg('Are you currently on active duty?');
    renderYesNo(
      () => { stillServing = true; renderScreen('bdd-message'); },
      () => { stillServing = false; renderScreen('login'); },
      msg
    );
  }

  function renderBddMessageScreen() {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--agent';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    const avatarIcon = document.createElement('mms-icon');
    avatarIcon.setAttribute('name', 'robot');
    avatarIcon.setAttribute('size', 'sm');
    avatar.appendChild(avatarIcon);

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    const author = document.createElement('span');
    author.className = 'chat-message__author';
    author.textContent = 'The Navigator';

    const intro = document.createElement('p');
    intro.textContent = BDD_REQUIREMENTS.intro;

    const list = document.createElement('ul');
    BDD_REQUIREMENTS.bullets.forEach((bulletText) => {
      const item = document.createElement('li');
      item.textContent = bulletText;
      list.appendChild(item);
    });

    const closing = document.createElement('p');
    closing.textContent = BDD_REQUIREMENTS.closing;

    bubble.append(author, intro, list, closing);
    message.append(avatar, bubble);
    transcript.appendChild(message);
    scrollTranscriptToBottom();
    lastAgentNode = message;

    renderYesNo(
      () => renderScreen('bdd-eligible-message'),
      () => renderScreen('bdd-ineligible-message'),
      message
    );
  }

  function renderBddEligibleMessageScreen() {
    appendAgentMsg('Ok great, we will proceed with your claim under the Benefits Delivery at Discharge program.');
    renderScreen('login');
  }

  function renderBddIneligibleMessageScreen() {
    appendAgentMsg("You can still submit a standard claim — let's get started.");
    renderScreen('login');
  }

  // --- Login + profile summary ----------------------------------------------

  function renderLoginScreen() {
    const msg = appendAgentMsg("To show the benefit of an API integration with ID.me , this prototype can show a sample sign-in step, but it does not connect to ID.me or access actual VA information.");
    addButton('Continue with sample sign-in', 'primary', async () => {
      appendUserMessage('Continue with sample sign-in');
      clearQuickReplies();
      const typing = appendTypingIndicator();
      await wait(900);
      typing.remove();
      loggedIn = true;
      logIn(profile.name);
      renderAvatar();
      renderScreen('profile-summary');
    }, msg);
  }

  function formatProfileSummary() {
    const lines = [
      `${profile.name}   ${profile.dob}`,
      `SSN: •••-••-${profile.ssnLast4}`,
    ];
    if (filedBefore) lines.push(`VA filing number: ${profile.vaFilingNumber}`);
    lines.push(
      `${profile.address}, ${profile.city}, ${profile.state} ${profile.zip}`,
      profile.email,
      profile.phone,
      `${profile.branch} service start date: ${profile.serviceStart}`,
    );
    if (!stillServing) lines.push(`Service end date: ${profile.serviceEnd}`);
    lines.push(`DD214: ${profile.dd214Uploaded ? 'Uploaded' : 'Not uploaded'}`);
    return lines.join('\n');
  }

  function renderProfileSummaryScreen() {
    appendAgentMsg("Here's what I found on file for you:");
    appendAgentMsgMultiline(formatProfileSummary());
    const msg = appendAgentMsg('Does this all look correct?');
    renderYesNo(
      () => renderScreen('toxic-exposure-question'),
      () => renderScreen('edit-select-field'),
      msg
    );
  }

  function renderEditSelectFieldScreen() {
    const msg = appendAgentMsg('Which field would you like to update?');
    const bubble = msg.querySelector('.chat-message__bubble');
    const panel = document.createElement('div');
    panel.className = 'chat-options';

    const select = document.createElement('mms-select');
    select.placeholder = 'Select a field…';
    select.size = 'lg';
    select.options = EDITABLE_DISABILITY_FIELDS.map((field) => ({ value: field.key, label: field.label }));
    select.addEventListener('change', (event) => {
      const value = event.detail?.value ?? select.value;
      if (!value) return;
      const field = EDITABLE_DISABILITY_FIELDS.find((f) => f.key === value);
      appendUserMessage(field.label);
      clearQuickReplies();
      renderScreen('edit-value', { field });
    });
    panel.appendChild(select);
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) {
      bubble.insertBefore(panel, actions);
    } else {
      bubble.appendChild(panel);
    }
  }

  function renderEditValueScreen({ field }) {
    appendAgentMsg(`What should ${field.label.toLowerCase()} be instead?`);
    showTextInput(`Enter new ${field.label.toLowerCase()}`, (text) => {
      appendUserMessage(text);
      profile = { ...profile, [field.key]: text };
      renderScreen('profile-summary');
    });
  }

  // --- Toxic exposure --------------------------------------------------------

  function renderToxicExposureQuestionScreen() {
    const msg = appendAgentMsg('Are you claiming any conditions related to toxic exposure?');
    renderYesNo(
      () => renderScreen('toxic-exposure-checklist'),
      () => renderScreen('other-disability-question'),
      msg
    );
  }

  function renderToxicExposureChecklistScreen() {
    const msg = appendAgentMsg('Which types of toxic exposure apply to you? Choose all that apply.');
    const bubble = msg.querySelector('.chat-message__bubble');
    const selection = new Set();

    const panel = document.createElement('div');
    panel.className = 'chat-options';

    TOXIC_EXPOSURE_OPTIONS.forEach((option) => {
      const checkbox = document.createElement('mms-checkbox');
      checkbox.setAttribute('label', option.label);
      checkbox.setAttribute('checked-value', option.value);
      checkbox.setAttribute('color-scheme', 'primary');
      checkbox.addEventListener('change', (event) => {
        const checked = event.detail?.checked !== undefined ? event.detail.checked : Boolean(checkbox.checked || checkbox.hasAttribute('checked'));
        const val = event.detail?.value || checkbox.getAttribute('checked-value') || option.value;
        if (checked) selection.add(val);
        else selection.delete(val);
      });
      panel.appendChild(checkbox);
    });

    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) {
      bubble.insertBefore(panel, actions);
    } else {
      bubble.appendChild(panel);
    }

    addButton('Continue', 'primary', () => {
      const labels = TOXIC_EXPOSURE_OPTIONS
        .filter((option) => selection.has(option.value))
        .map((option) => option.label);
      appendUserMessage(labels.length ? labels.join(', ') : 'None selected');
      claimAnswers.toxicExposure = Array.from(selection);
      clearQuickReplies();
      if (selection.has('other')) {
        appendAgentMsg('Please describe the other toxic exposure.');
        showTextInput('Describe the exposure', (text) => {
          appendUserMessage(text);
          claimAnswers.toxicExposureOther = text;
          renderScreen('other-disability-question');
        });
      } else {
        renderScreen('other-disability-question');
      }
    }, msg);
  }

  // --- Other disability (Yes hard-disabled) -----------------------------------

  function renderOtherDisabilityQuestionScreen() {
    const msg = appendAgentMsg('Is there any other disability you want to claim today?');
    renderYesDisabledNo(() => renderScreen('document-upload'), msg);
  }

  // --- Document upload ---------------------------------------------------------

  function renderDocumentUploadScreen() {
    const msg = appendAgentMsg('Please upload any supporting documents you have, or skip this step if you don\'t have any to upload right now.');
    const bubble = msg.querySelector('.chat-message__bubble');

    const panel = document.createElement('div');
    panel.className = 'chat-options';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '8px';

    DOCUMENT_UPLOAD_CATEGORIES.forEach((category) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '4px';

      const label = document.createElement('span');
      label.textContent = category.label;
      row.appendChild(label);

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.addEventListener('change', () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        uploadedFiles[category.key] = file.name;
        appendUserMessage(`📎 ${file.name} (${category.label})`);
      });
      row.appendChild(fileInput);
      panel.appendChild(row);
    });

    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) {
      bubble.insertBefore(panel, actions);
    } else {
      bubble.appendChild(panel);
    }

    addButton('Submit', 'primary', () => {
      appendUserMessage('Submit');
      clearQuickReplies();
      renderScreen('agreement');
    }, msg);

    addButton('Skip', 'secondary', () => {
      appendUserMessage('Skip');
      clearQuickReplies();
      renderScreen('agreement');
    }, msg);
  }

  // --- Agreement (reused from Healthcare Seeker's copy) -------------------------

  function renderAgreementScreen() {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--agent';

    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    const avatarIcon = document.createElement('mms-icon');
    avatarIcon.setAttribute('name', 'robot');
    avatarIcon.setAttribute('size', 'sm');
    avatar.appendChild(avatarIcon);

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    const author = document.createElement('span');
    author.className = 'chat-message__author';
    author.textContent = 'The Navigator';

    const heading = document.createElement('strong');
    heading.textContent = AGREEMENT_CONTENT.heading;

    const intro = document.createElement('p');
    intro.textContent = AGREEMENT_CONTENT.intro;

    const list = document.createElement('ul');
    AGREEMENT_CONTENT.bullets.forEach((bulletText) => {
      const item = document.createElement('li');
      item.textContent = bulletText;
      list.appendChild(item);
    });

    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = AGREEMENT_CONTENT.readMoreLabel;
    const detailsBody = document.createElement('p');
    detailsBody.textContent = AGREEMENT_CONTENT.readMoreBody;
    details.append(summary, detailsBody);

    const privacyLink = document.createElement('mms-link');
    privacyLink.setAttribute('href', AGREEMENT_CONTENT.privacyLinkHref);
    privacyLink.setAttribute('target', '_blank');
    privacyLink.setAttribute('rel', 'noopener');
    privacyLink.textContent = AGREEMENT_CONTENT.privacyLinkLabel;

    const penalty = document.createElement('p');
    const penaltyStrong = document.createElement('strong');
    penaltyStrong.textContent = AGREEMENT_CONTENT.penaltyNote;
    penalty.appendChild(penaltyStrong);

    bubble.append(author, heading, intro, list, details, privacyLink, penalty);
    message.append(avatar, bubble);
    transcript.appendChild(message);
    scrollTranscriptToBottom();
    lastAgentNode = message;

    addButton('I agree', 'primary', () => {
      appendUserMessage('I agree');
      clearQuickReplies();
      renderScreen('submission-confirmation');
    }, message);
    addButton('I do not agree', 'secondary', () => {
      appendUserMessage('I do not agree');
      clearQuickReplies();
      closeOutThen('Ok — since you do not agree to the terms, we are unable to move forward with your claim at this time. Your County Veterans Service Office can help you explore your options.');
    }, message);
  }

  // --- Submission confirmation + what to expect ---------------------------------

  function buildClaimTextSummary() {
    const lines = [
      'VA Disability Claim Summary',
      `Submitted: ${new Date().toLocaleDateString()}`,
      '',
      'Applicant Information',
      ...formatProfileSummary().split('\n'),
      '',
      `Claim type: ${claimAnswers.claimType || 'Not specified'}`,
    ];
    if (claimAnswers.toxicExposure?.length) {
      lines.push(`Toxic exposure: ${claimAnswers.toxicExposure.join(', ')}`);
      if (claimAnswers.toxicExposureOther) lines.push(`Other exposure detail: ${claimAnswers.toxicExposureOther}`);
    }
    if (Object.keys(uploadedFiles).length) {
      lines.push('', 'Uploaded documents');
      DOCUMENT_UPLOAD_CATEGORIES.forEach((category) => {
        if (uploadedFiles[category.key]) lines.push(`${category.label}: ${uploadedFiles[category.key]}`);
      });
    }
    return lines.join('\n');
  }

  function downloadClaim() {
    const text = buildClaimTextSummary();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'va-disability-claim.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderSubmissionConfirmationScreen() {
    applicationStatus = 'submitted';
    const dateStr = new Date().toLocaleDateString();
    const msg = appendAgentMsg(`Your application has been submitted for ${profile.name} on ${dateStr}.`);
    addButton('Download application', 'secondary', () => downloadClaim(), msg);
    addButton('Continue', 'primary', () => {
      appendUserMessage('Continue');
      clearQuickReplies();
      renderScreen('what-to-expect');
    }, msg);
  }

  function renderWhatToExpectScreen() {
    const message = document.createElement('div');
    message.className = 'chat-message chat-message--agent';
    const avatar = document.createElement('div');
    avatar.className = 'chat-avatar';
    const avatarIcon = document.createElement('mms-icon');
    avatarIcon.setAttribute('name', 'robot');
    avatarIcon.setAttribute('size', 'sm');
    avatar.appendChild(avatarIcon);

    const bubble = document.createElement('div');
    bubble.className = 'chat-message__bubble';
    const author = document.createElement('span');
    author.className = 'chat-message__author';
    author.textContent = 'The Navigator';
    const heading = document.createElement('strong');
    heading.className = 'what-to-expect__heading';
    heading.textContent = WHAT_TO_EXPECT_CONTENT.heading;
    bubble.append(author, heading);

    WHAT_TO_EXPECT_CONTENT.sections.forEach((section) => {
      const sectionTitle = document.createElement('p');
      sectionTitle.className = 'what-to-expect__section-title';
      const sectionTitleStrong = document.createElement('strong');
      sectionTitleStrong.textContent = section.title;
      sectionTitle.appendChild(sectionTitleStrong);
      bubble.appendChild(sectionTitle);

      section.paragraphs.forEach((paragraph) => {
        const paragraphEl = document.createElement('p');
        paragraphEl.className = 'what-to-expect__section-body';
        if (paragraph.linkLabel) {
          paragraphEl.append(paragraph.textBefore);
          const link = document.createElement('mms-link');
          link.setAttribute('href', paragraph.linkHref);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener');
          link.textContent = paragraph.linkLabel;
          paragraphEl.appendChild(link);
          paragraphEl.append(paragraph.textAfter);
        } else {
          paragraphEl.textContent = paragraph.text;
        }
        bubble.appendChild(paragraphEl);
      });
    });

    message.append(avatar, bubble);
    transcript.appendChild(message);
    scrollTranscriptToBottom();
    lastAgentNode = message;

    addButton('Continue', 'primary', () => {
      appendUserMessage('Continue');
      clearQuickReplies();
      renderScreen('anything-else');
    }, message);
  }

  const SCREENS = {
    'claim-type-question': renderClaimTypeQuestionScreen,
    'filed-before-question': renderFiledBeforeQuestionScreen,
    'existing-claim-message': renderExistingClaimMessageScreen,
    'evidence-question': renderEvidenceQuestionScreen,
    'no-evidence-message': renderNoEvidenceMessageScreen,
    'first-claim-message': renderFirstClaimMessageScreen,
    'active-duty-question': renderActiveDutyQuestionScreen,
    'bdd-message': renderBddMessageScreen,
    'bdd-eligible-message': renderBddEligibleMessageScreen,
    'bdd-ineligible-message': renderBddIneligibleMessageScreen,
    login: renderLoginScreen,
    'profile-summary': renderProfileSummaryScreen,
    'edit-select-field': renderEditSelectFieldScreen,
    'edit-value': renderEditValueScreen,
    'toxic-exposure-question': renderToxicExposureQuestionScreen,
    'toxic-exposure-checklist': renderToxicExposureChecklistScreen,
    'other-disability-question': renderOtherDisabilityQuestionScreen,
    'document-upload': renderDocumentUploadScreen,
    agreement: renderAgreementScreen,
    'submission-confirmation': renderSubmissionConfirmationScreen,
    'what-to-expect': renderWhatToExpectScreen,
    'anything-else': renderAnythingElseScreen,
    'fallback-county': renderFallbackCountyScreen,
  };

  renderScreen('claim-type-question');
}
