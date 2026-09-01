// Ohio Veterans — Navigator
// Session-scoped state shared across index.html -> intake.html -> result.html.
// Since this is a plain multi-page static site (no SPA/router), state is
// persisted to sessionStorage so it survives full page navigations within
// one browser tab/session, and is cleared on kiosk reset / Retry.

import { QUESTIONS } from './questions.js';
import { logOut } from './auth.js';

const STORAGE_KEY = 'navigator-state-v1';

function defaultState() {
  return {
    intent: null, // best-guess category from landing (keyword match or card tap)
    answers: {}, // { [questionId]: string | string[] }
    currentIndex: 0, // index into getVisibleQuestions()
    landingText: null, // raw text shown/typed on the landing screen, reused for the Job Seeker intro message
  };
}

export function getState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Also sweeps any embedded chat widget's saved conversation (see
// flow-chat.js's `navigator-flow-<id>-v1` sessionStorage keys) so a full
// intake restart doesn't leave a stale conversation behind. Coupled to
// flow-chat.js only by this key-prefix naming convention, not an import.
// Also signs the veteran back out: a mock ID.me login completed during one
// demo run (va-benefits-flow.js / disability-claim-flow.js) shouldn't carry
// into the next run started from a fresh scenario/category pick.
export function resetState() {
  sessionStorage.removeItem(STORAGE_KEY);
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith('navigator-flow-'))
    .forEach((key) => sessionStorage.removeItem(key));
  logOut();
}

export function setIntent(intent) {
  const state = getState();
  state.intent = intent;
  // Seed Q5 (goals) with the landing intent, still fully editable.
  if (intent && !state.answers.goals) {
    state.answers.goals = [intent];
  }
  saveState(state);
}

export function setAnswer(questionId, value) {
  const state = getState();
  state.answers[questionId] = value;
  saveState(state);
}

// Tags the session with a guided-persona scenario (e.g. 'job-seeker') so
// questions.js's conditionals can branch the question set per persona.
export function setScenario(scenario) {
  const state = getState();
  state.answers.scenario = scenario;
  saveState(state);
}

export function setLandingText(text) {
  const state = getState();
  state.landingText = text;
  saveState(state);
}

// Returns the subset of QUESTIONS that apply given current answers
// (i.e. filters out Q5b unless its conditional passes).
export function getVisibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.conditional || q.conditional(answers));
}

export function getCurrentQuestion() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  return visible[state.currentIndex] || null;
}

export function getProgress() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  return { current: state.currentIndex + 1, total: visible.length };
}

// Advances to the next visible question. Returns false (and leaves state
// untouched) when already on the last question, so callers know to
// transition to result.html instead.
export function goToNext() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  if (state.currentIndex >= visible.length - 1) return false;
  state.currentIndex += 1;
  saveState(state);
  return true;
}

// Steps back one visible question. Returns false when already on the
// first question (caller should return to index.html instead).
export function goToPrevious() {
  const state = getState();
  if (state.currentIndex <= 0) return false;
  state.currentIndex -= 1;
  saveState(state);
  return true;
}

export function isLastQuestion() {
  const state = getState();
  const visible = getVisibleQuestions(state.answers);
  return state.currentIndex >= visible.length - 1;
}
