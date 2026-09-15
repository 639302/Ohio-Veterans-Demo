// Ohio Veterans — Navigator
// Bespoke VA-benefits-application conversation for the Healthcare Seeker
// persona (Addendum 14). Reuses intake.js/chat-ui.js's chat-bubble
// markup/CSS conventions but owns its own procedural control flow — this is
// intentionally NOT built on flow-chat.js's generic node engine, since
// screens here (multi-field forms, an editable summary, an agreement
// screen, a file download) don't fit that engine's single/text node shape.

import {
  MOCK_PROFILE,
  EDITABLE_PROFILE_FIELDS,
  OHIO_VA_FACILITIES,
  ELIGIBILITY_QUESTIONS,
  AGREEMENT_CONTENT,
  WHAT_TO_EXPECT_CONTENT,
  GET_HELP_TEXT,
} from './va-benefits-data.js?v=6';
import { COUNTY_SELECT_OPTIONS, getCvsoInfo } from './county-data.js?v=6';
import { setAnswer } from './state.js?v=6';
import { createChatUI, wait } from './chat-ui.js?v=10';
import { logIn } from './auth.js?v=6';
import { renderAvatar } from './nav.js?v=17';

const DEFAULT_PLACEHOLDER = 'Type your answer, or tap an option above';

const INSURANCE_FIELDS = [
  { key: 'insurerName', prompt: 'What is the name of your insurance company?' },
  { key: 'policyholderName', prompt: 'Who is the policyholder?' },
  { key: 'policyNumber', prompt: 'What is your policy number?' },
  { key: 'groupCode', prompt: 'What is your group code?' },
];

let active = false;

export function isVaBenefitsFlowActive() {
  return active;
}

export function startVaBenefitsFlow({ transcript, quickReplies, textInput, sendButton, onFinish }) {
  active = true;

  const { appendAgentMessage, appendUserMessage, appendTypingIndicator, scrollTranscriptToBottom } = createChatUI(transcript);

  // Local mutable copy — edits never touch the shared MOCK_PROFILE export.
  let profile = { ...MOCK_PROFILE };
  const applicationAnswers = {};
  let loggedIn = false;
  // Drives pathway-logic.js's application-status card on result.html; defaults
  // to 'not-started' for every early-exit/decline path.
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

  function renderScreen(screenId, args) {
    clearQuickReplies();
    hideTextInput();
    SCREENS[screenId](args || {});
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
    hideTextInput();
    active = false;
    if (onFinish) onFinish();
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
      active = false;
      if (onFinish) onFinish();
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

  function closeOutThen(message, hasLoggedIn) {
    appendAgentMsg(message);
    ensureCountyThenWrapup(hasLoggedIn);
  }

  function ensureCountyThenWrapup(hasLoggedIn) {
    setAnswer('applicationStatus', applicationStatus);
    if (hasLoggedIn) {
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
    const msg = appendAgentMsg(`Your health care application request has been recorded. If you have any questions or need further assistance, your local County Veterans Service Office is available to help:\n${info.officeName}\n${info.address || ''}\nPhone: ${info.phone}`);
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

  // --- Already-applied branch ---------------------------------------------

  function renderAlreadyAppliedScreen() {
    const msg = appendAgentMsg('Have you already applied for VA health care benefits?');
    renderYesNo(
      () => renderScreen('status-check-question'),
      () => renderScreen('submit-now-question'),
      msg
    );
  }

  function renderStatusCheckQuestionScreen() {
    const msg = appendAgentMsg('Would you like to check the status of your application?');
    renderYesNo(
      () => renderScreen('status-login'),
      () => {
        applicationStatus = 'submitted';
        closeOutThen('No problem — thanks for stopping by.', false);
      },
      msg
    );
  }

  function renderStatusLoginScreen() {
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
      renderScreen('status-result');
    }, msg);
  }

  function renderStatusResultScreen() {
    applicationStatus = 'pending';
    const info = getCvsoInfo(profile.county);
    appendAgentMsg('Your application status: Pending.');
    appendAgentMsg(`Your local CVSO: ${info.officeName} — ${info.address} — ${info.phone}`);
    const msg = appendAgentMsg('Is there anything else I can help you with?');
    addButton("No, that's all", 'primary', () => {
      appendUserMessage("No, that's all");
      appendAgentMsg('Ok. Have a nice day.');
      ensureCountyThenWrapup(loggedIn);
    }, msg);
  }

  // --- Not-yet-applied branch ---------------------------------------------

  function renderSubmitNowScreen() {
    const msg = appendAgentMsg('Would you like to submit an application for VA health care benefits now?');
    renderYesNo(
      () => renderScreen('eligibility', { index: 0 }),
      () => closeOutThen('No problem — thanks for stopping by. You can always come back later.', false),
      msg
    );
  }

  function advanceEligibility(index) {
    if (index + 1 < ELIGIBILITY_QUESTIONS.length) {
      renderScreen('eligibility', { index: index + 1 });
    } else {
      renderScreen('fill-out-now-question');
    }
  }

  function renderEligibilityScreen({ index }) {
    const question = ELIGIBILITY_QUESTIONS[index];
    const msg = appendAgentMsg(question.prompt);
    renderYesNo(
      () => (question.failValue === 'yes' ? renderScreen('not-eligible') : advanceEligibility(index)),
      () => (question.failValue === 'no' ? renderScreen('not-eligible') : advanceEligibility(index)),
      msg
    );
  }

  function renderNotEligibleScreen() {
    applicationStatus = 'not-eligible';
    appendAgentMsg("Based on your answers, it doesn't look like you're eligible for VA health care benefits at this time. Your County Veterans Service Office can help you explore other options or double-check your eligibility.");
    const msg = appendAgentMsg('Is there anything else I can help you with?');
    addButton("No, that's all", 'primary', () => {
      appendUserMessage("No, that's all");
      appendAgentMsg('Ok. Have a nice day.');
      ensureCountyThenWrapup(loggedIn);
    }, msg);
  }

  function renderFillOutNowScreen() {
    const msg = appendAgentMsg('Good news — based on your answers, you may be eligible for VA health care benefits. Would you like to fill out the application now?');
    renderYesNo(
      () => renderScreen('login'),
      () => closeOutThen("No problem — you can always come back and fill out the application when you're ready.", false),
      msg
    );
  }

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
    return [
      `${profile.name}   ${profile.dob}`,
      `SSN: •••-••-${profile.ssnLast4}`,
      profile.sex,
      profile.country,
      `${profile.address}, ${profile.city}, ${profile.state} ${profile.zip} (this is my mailing address)`,
      profile.email,
      profile.phone,
      `VA disability rating: ${profile.disabilityRating}`,
      `Veterans pension: ${profile.veteransPension}`,
      `${profile.branch} service start date: ${profile.serviceStart}`,
      `Service end date: ${profile.serviceEnd}`,
      `Character of service: ${profile.characterOfService}`,
      `Toxic exposure: ${profile.toxicExposure}`,
      `DD214: ${profile.dd214Uploaded ? 'Uploaded' : 'Not uploaded'}`,
      `Marital status: ${profile.maritalStatus}`,
      `Eligible for Medicaid: ${profile.medicaidEligible}`,
    ].join('\n');
  }

  function renderProfileSummaryScreen() {
    appendAgentMsg("Here's what I found on file for you:");
    appendAgentMsgMultiline(formatProfileSummary());
    const msg = appendAgentMsg('Does this all look correct?');
    renderYesNo(
      () => renderScreen('insurance-question'),
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
    select.options = EDITABLE_PROFILE_FIELDS.map((field) => ({ value: field.key, label: field.label }));
    select.addEventListener('change', (event) => {
      const value = event.detail?.value ?? select.value;
      if (!value) return;
      const field = EDITABLE_PROFILE_FIELDS.find((f) => f.key === value);
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

  function renderInsuranceQuestionScreen() {
    const msg = appendAgentMsg('Do you have health insurance you would like to add to your application?');
    renderYesNo(
      () => renderScreen('insurance-form', { step: 0 }),
      () => renderScreen('facility-picker'),
      msg
    );
  }

  function renderInsuranceFormScreen({ step }) {
    const field = INSURANCE_FIELDS[step];
    appendAgentMsg(field.prompt);
    showTextInput('Type your answer', (text) => {
      appendUserMessage(text);
      applicationAnswers[field.key] = text;
      if (step + 1 < INSURANCE_FIELDS.length) {
        renderScreen('insurance-form', { step: step + 1 });
      } else {
        renderScreen('appointment-contact');
      }
    });
  }

  function renderFacilityPickerScreen() {
    const msg = appendAgentMsg('Which Ohio VA facility would you prefer for your care?');
    const bubble = msg.querySelector('.chat-message__bubble');
    const panel = document.createElement('div');
    panel.className = 'chat-options';

    const select = document.createElement('mms-select');
    select.placeholder = 'Select a facility…';
    select.size = 'lg';
    select.options = OHIO_VA_FACILITIES;
    select.addEventListener('change', (event) => {
      const value = event.detail?.value ?? select.value;
      if (!value) return;
      const label = OHIO_VA_FACILITIES.find((facility) => facility.value === value)?.label || value;
      appendUserMessage(label);
      applicationAnswers.facility = label;
      clearQuickReplies();
      renderScreen('appointment-contact');
    });
    panel.appendChild(select);
    const actions = bubble.querySelector('.chat-message__actions');
    if (actions) {
      bubble.insertBefore(panel, actions);
    } else {
      bubble.appendChild(panel);
    }
  }

  function renderAppointmentContactScreen() {
    const msg = appendAgentMsg('Would you like the VA to contact you to schedule your first appointment?');
    renderYesNo(
      () => { applicationAnswers.scheduleContact = 'Yes'; renderScreen('agreement'); },
      () => { applicationAnswers.scheduleContact = 'No'; renderScreen('agreement'); },
      msg
    );
  }

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
      closeOutThen('Ok — since you do not agree to the terms, we are unable to move forward with your application at this time. Your County Veterans Service Office can help you explore your options.', loggedIn);
    }, message);
  }

  function buildApplicationTextSummary() {
    const lines = [
      'VA Health Care Application Summary',
      `Submitted: ${new Date().toLocaleDateString()}`,
      '',
      'Applicant Information',
      ...formatProfileSummary().split('\n'),
      '',
    ];
    if (applicationAnswers.insurerName) {
      lines.push(
        'Health Insurance',
        `Insurer: ${applicationAnswers.insurerName}`,
        `Policyholder: ${applicationAnswers.policyholderName}`,
        `Policy Number: ${applicationAnswers.policyNumber}`,
        `Group Code: ${applicationAnswers.groupCode}`,
        '',
      );
    } else if (applicationAnswers.facility) {
      lines.push('Preferred VA Facility', applicationAnswers.facility, '');
    }
    lines.push(`Requested VA contact to schedule first appointment: ${applicationAnswers.scheduleContact || 'Not specified'}`);
    return lines.join('\n');
  }

  function downloadApplication() {
    const text = buildApplicationTextSummary();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'va-health-care-application.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderSubmissionConfirmationScreen() {
    applicationStatus = 'submitted';
    const dateStr = new Date().toLocaleDateString();
    const msg = appendAgentMsg(`Your application has been submitted for ${profile.name} on ${dateStr}.`);
    addButton('Download application', 'secondary', () => downloadApplication(), msg);
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

  function renderAnythingElseScreen() {
    const msg = appendAgentMsg('Is there anything else I can help you with today?');
    addButton("No, that's all — thank you", 'primary', () => {
      appendUserMessage("No, that's all — thank you");
      appendAgentMsg('Ok. Have a nice day.');
      ensureCountyThenWrapup(loggedIn);
    }, msg);
  }

  const SCREENS = {
    'already-applied': renderAlreadyAppliedScreen,
    'status-check-question': renderStatusCheckQuestionScreen,
    'status-login': renderStatusLoginScreen,
    'status-result': renderStatusResultScreen,
    'submit-now-question': renderSubmitNowScreen,
    eligibility: renderEligibilityScreen,
    'not-eligible': renderNotEligibleScreen,
    'fill-out-now-question': renderFillOutNowScreen,
    login: renderLoginScreen,
    'profile-summary': renderProfileSummaryScreen,
    'edit-select-field': renderEditSelectFieldScreen,
    'edit-value': renderEditValueScreen,
    'insurance-question': renderInsuranceQuestionScreen,
    'insurance-form': renderInsuranceFormScreen,
    'facility-picker': renderFacilityPickerScreen,
    'appointment-contact': renderAppointmentContactScreen,
    agreement: renderAgreementScreen,
    'submission-confirmation': renderSubmissionConfirmationScreen,
    'what-to-expect': renderWhatToExpectScreen,
    'anything-else': renderAnythingElseScreen,
    'fallback-county': renderFallbackCountyScreen,
  };

  renderScreen('already-applied');
}
