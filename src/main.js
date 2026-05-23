// src/main.js — entry point.
//
// Wires together:
//   - state (src/state.js)
//   - missed-set storage (src/storage.js)
//   - chat fetch helpers (src/chat.js)
//   - sampling (src/sampling.js)
//   - view modules (src/views/*.js)
//
// The render loop is a single dispatcher: it inspects the state shape
// and delegates to the right view. Views never call each other; they
// invoke `actions.*` callbacks to mutate state and re-render.

import { CPACC_BANK } from '../data/questions.js';
import { BEAR_BANK } from '../data/bear-questions.js';
import { BEAR_FLASHCARDS } from '../data/bear-flashcards.js';
import { DISABILITIES } from '../data/disabilities.js';
import { LEGAL } from '../data/legal.js';

import { createState, resetState } from './state.js';
import { createMissedStore } from './storage.js';
import { fetchChatStatus, sendHomeMessage, sendQuestionMessage } from './chat.js';
import { sampleQuestions, sampleMissedQuestions } from './sampling.js';

import { renderHome }         from './views/home.js';
import { renderQuestion }     from './views/question.js';
import { renderResults }      from './views/results.js';
import { renderFlashcards }   from './views/flashcards.js';
import { renderDisabilities } from './views/disabilities.js';
import { renderLegal }        from './views/legal.js';

// -------- boot -----------------------------------------------------------

const app = document.getElementById('app');
const homeBtn = document.getElementById('home-btn');
const state = createState();
const missed = createMissedStore();
const data = { CPACC_BANK, BEAR_BANK, BEAR_FLASHCARDS, DISABILITIES, LEGAL };

// -------- actions --------------------------------------------------------

function startTest(mode) {
  state.mode = mode || 'weighted';
  state.questions =
    state.mode === 'missed' ? sampleMissedQuestions([CPACC_BANK, BEAR_BANK], missed.get())
    : state.mode === 'bear' ? sampleQuestions(BEAR_BANK)
    : sampleQuestions(CPACC_BANK);
  state.answers = {};
  state.pending = {};
  state.revealed = {};
  state.index = 0;
  state.submitted = false;
  state.chats = {};
  render();
}

function startFlashcards() {
  // Lazy import to avoid a top-level circular concern; shuffle is small.
  import('./sampling.js').then(({ shuffle }) => {
    state.flashcards = { cards: shuffle(BEAR_FLASHCARDS || []), index: 0, flipped: false };
    render();
  });
}

function openDisabilities() {
  state.disabilities = { view: 'categories' };
  render();
}

function openLegal() {
  state.legal = { view: 'categories' };
  render();
}

async function submitAll() {
  state.submitted = true;
  // Only update missed-set for questions the user actually submitted an
  // answer for. Unanswered questions stay in whatever state they were in.
  for (const q of state.questions) {
    if (!state.revealed[q.id]) continue;
    const a = state.answers[q.id];
    if (a === q.answer) missed.remove(q.id);
    else missed.add(q.id);
  }
  await missed.persist();
  render();
}

async function sendHomeChat() {
  const input = document.getElementById('home-input');
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text) return;
  state.homeChat.history.push({ role: 'user', content: text });
  input.value = '';
  render();
  const res = await sendHomeMessage(state.homeChat.history.slice(0, -1), text);
  if (res.ok) state.homeChat.history.push({ role: 'assistant', content: res.reply });
  else state.homeChat.history.push({ role: 'error', content: res.error });
  render();
}

function clearHomeChat() {
  state.homeChat = { history: [] };
  render();
}

async function sendChat(qid) {
  const q = state.questions.find(x => x.id === qid);
  const input = document.querySelector(`[data-input="${qid}"]`);
  if (!input || !q) return;
  const text = (input.value || '').trim();
  if (!text) return;
  const chat = state.chats[qid] = state.chats[qid] || { open: true, history: [] };
  chat.history.push({ role: 'user', content: text });
  input.value = '';
  render();
  const res = await sendQuestionMessage(q, state.answers[q.id] || null, chat.history.slice(0, -1), text);
  if (res.ok) chat.history.push({ role: 'assistant', content: res.reply });
  else chat.history.push({ role: 'error', content: res.error });
  render();
}

// -------- render dispatcher ---------------------------------------------

function render() {
  // (Re-)wire the home button on every render; it lives outside <main>.
  if (homeBtn) {
    homeBtn.onclick = () => {
      const mid = state.questions.length > 0 && !state.submitted;
      if (mid && !confirm('Leave this test and return home? Your progress will be lost.')) return;
      resetState(state);
      render();
    };
  }

  const ctx = { app, state, data, missed, actions: {
    render, startTest, startFlashcards, openDisabilities, openLegal,
    submitAll, sendHomeChat, clearHomeChat, sendChat,
  }};

  if (state.legal)              return renderLegal(ctx);
  if (state.disabilities)       return renderDisabilities(ctx);
  if (state.flashcards)         return renderFlashcards(ctx);
  if (state.submitted)          return renderResults(ctx);
  if (state.questions.length === 0) return renderHome(ctx);
  return renderQuestion(ctx);
}

// -------- startup --------------------------------------------------------

// Probe chat availability (server may or may not have ANTHROPIC_API_KEY).
fetchChatStatus().then(enabled => {
  state.chatEnabled = enabled;
  render();
});

// Load missed set from server (or local fallback), then first paint.
missed.fetchFromServer().then(render);

// Render once immediately so the user sees something while async loads.
render();
