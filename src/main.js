// src/main.js — entry point.
//
// Wires together:
//   - state (src/state.js)
//   - missed-set storage (src/storage.js)
//   - chat fetch helpers (src/chat.js)
//   - sampling (src/sampling.js)
//   - view modules (src/views/*.js)
//   - router (src/router.js)
//
// The render loop is a single dispatcher: it reads the explicit
// `state.view` field and delegates to the right view. Views never call
// each other; they invoke `actions.*` callbacks to mutate state and
// re-render. After each render, the URL hash is synced to match state so
// browser Back/Forward works; a popstate-driven render does the reverse
// (URL → state) and must not push a new history entry.

import { CPACC_BANK, CPACC_BANK_PROVENANCE } from '../data/questions.js';
import { BEAR_BANK, BEAR_BANK_PROVENANCE } from '../data/bear-questions.js';
import { BEAR_FLASHCARDS, BEAR_FLASHCARDS_PROVENANCE } from '../data/bear-flashcards.js';
import { DISABILITIES, DISABILITIES_PROVENANCE } from '../data/disabilities.js';
import { LEGAL, LEGAL_PROVENANCE } from '../data/legal.js';
import { renderAiInfoDialog, installAiInfoDialog } from './provenance.js';

import { createState, resetState } from './state.js';
import { createMissedStore } from './storage.js';
import { fetchChatStatus, sendHomeMessage, sendQuestionMessage } from './chat.js';
import { sampleQuestions, sampleMissedQuestions } from './sampling.js';
import { pathFor, applyPath } from './router.js';

import { renderHome }         from './views/home.js';
import { renderQuestion }     from './views/question.js';
import { renderResults }      from './views/results.js';
import { renderFlashcards }   from './views/flashcards.js';
import { renderDisabilities } from './views/disabilities.js';
import { renderLegal }        from './views/legal.js';

// -------- boot -----------------------------------------------------------

const app = document.getElementById('app');
const homeBtn = document.getElementById('home-btn');
const routeStatus = document.getElementById('route-status');
const state = createState();
const missed = createMissedStore();
const data = { CPACC_BANK, BEAR_BANK, BEAR_FLASHCARDS, DISABILITIES, LEGAL };
const provenance = {
  CPACC_BANK: CPACC_BANK_PROVENANCE,
  BEAR_BANK: BEAR_BANK_PROVENANCE,
  BEAR_FLASHCARDS: BEAR_FLASHCARDS_PROVENANCE,
  DISABILITIES: DISABILITIES_PROVENANCE,
  LEGAL: LEGAL_PROVENANCE,
};

// Lookup the right provenance for a given question by its id. CPACC bank
// uses ids < 1000; BEAR bank uses ids ≥ 1000. Item-level `provenance` field
// overrides the bank default.
const _cpaccIds = new Set(CPACC_BANK.map(q => q.id));
function provenanceForQuestion(q) {
  if (q && q.provenance) return q.provenance;
  return _cpaccIds.has(q?.id) ? provenance.CPACC_BANK : provenance.BEAR_BANK;
}

// Known category/jurisdiction ids, for the router to detect an unknown
// #/disabilities/<id> or #/legal/<id> and fall back to the grid.
const routeIds = {
  disabilityCategoryIds: new Set(DISABILITIES.categories.map(c => c.id)),
  legalCategoryIds: new Set(LEGAL.jurisdictions.map(j => j.id)),
};

// Category/jurisdiction label lookups, so page titles can distinguish
// #/disabilities from #/disabilities/<id> instead of colliding.
const disabilityCategoryLabels = new Map(DISABILITIES.categories.map(c => [c.id, c.label]));
const legalCategoryLabels = new Map(LEGAL.jurisdictions.map(j => [j.id, j.label]));

// Page title per view, so Back/Forward is distinguishable in browser
// history and announced by screen readers.
function titleFor(state) {
  switch (state.view) {
    case 'test':         return `Question ${state.index + 1} of ${state.questions.length} — CPACC Practice Test`;
    case 'results':       return 'Results — CPACC Practice Test';
    case 'flashcards':    return 'Flashcards — CPACC Practice Test';
    case 'disabilities': {
      const label = state.disabilities?.category && disabilityCategoryLabels.get(state.disabilities.category);
      return label ? `${label} — Human disabilities — CPACC Practice Test` : 'Human disabilities — CPACC Practice Test';
    }
    case 'legal': {
      const label = state.legal?.category && legalCategoryLabels.get(state.legal.category);
      return label ? `${label} — History, laws & standards — CPACC Practice Test` : 'History, laws & standards — CPACC Practice Test';
    }
    case 'home':
    default:              return 'CPACC Practice Test';
  }
}

// Pending announce() timer, so overlapping calls coalesce on purpose (see
// below) instead of by accident.
let announceTimer = null;

// Writes `msg` into the persistent #route-status live region (a sibling of
// <main>, so it survives app.innerHTML rewrites). Clearing before setting
// is required so announcing the same string twice in a row still fires —
// aria-live only speaks on a text change, not on assignment.
//
// A short setTimeout (not requestAnimationFrame) is what makes that clear
// actually land as its own observed mutation: rAF runs before the next
// paint, so the clear and the set can both land in the same accessibility-
// tree update, and a repeated message (e.g. pressing Back twice through
// two dead history entries) goes unheard. Any pending timer is cleared
// first so a second announce() before the first has fired replaces it
// (last message wins) instead of the first one silently vanishing.
//
// `assertive: true` switches the shared region's priority for this call.
// It isn't restored afterward on a timer of its own — instead every call
// sets aria-live fresh for itself, so the next ordinary (polite) announce()
// puts it back with no extra state to track or race. sendChat/sendHomeChat
// pass this for a failed reply: the user is actively waiting on it, so
// hearing the failure is worth risking interruption of some unrelated
// queued polite announcement, which would be the rarer case anyway.
function announce(msg, { assertive = false } = {}) {
  if (!routeStatus) return;
  if (announceTimer !== null) clearTimeout(announceTimer);
  routeStatus.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
  routeStatus.textContent = '';
  announceTimer = setTimeout(() => {
    routeStatus.textContent = msg;
    announceTimer = null;
  }, 75);
}

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
  state.view = 'test';
  render();
}

function startFlashcards() {
  // Lazy import to avoid a top-level circular concern; shuffle is small.
  import('./sampling.js').then(({ shuffle }) => {
    state.flashcards = { cards: shuffle(BEAR_FLASHCARDS || []), index: 0, flipped: false };
    state.view = 'flashcards';
    render();
  });
}

function openDisabilities() {
  state.disabilities = { view: 'categories' };
  state.view = 'disabilities';
  render();
}

function openLegal() {
  state.legal = { view: 'categories' };
  state.view = 'legal';
  render();
}

async function submitAll() {
  state.submitted = true;
  state.view = 'results';
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
  // The transcript is `role="log"` with no `aria-live` (a live region
  // can't announce content that was already part of the innerHTML write
  // that created it — see src/views/chat.js), so the reply has to be
  // spoken through #route-status explicitly. Only the assistant's reply
  // (or the error) is announced, never the user's own message — they just
  // typed it, they don't need it read back.
  if (res.ok) {
    state.homeChat.history.push({ role: 'assistant', content: res.reply });
    announce(res.reply);
  } else {
    state.homeChat.history.push({ role: 'error', content: res.error });
    announce(res.error, { assertive: true });
  }
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
  // Same reasoning as sendHomeChat above: role="log" has no aria-live, so
  // announce the reply/error through #route-status; don't echo the user's
  // own message back to them.
  if (res.ok) {
    chat.history.push({ role: 'assistant', content: res.reply });
    announce(res.reply);
  } else {
    chat.history.push({ role: 'error', content: res.error });
    announce(res.error, { assertive: true });
  }
  render();
}

// -------- render dispatcher ---------------------------------------------

// Set right before a popstate-driven render so it can skip the history
// push (the URL already matches state — pushing again would duplicate the
// entry).
let renderingFromPopstate = false;

// The route key of the most recent render, so render() can tell a real
// navigation (view/question/category changed) apart from an in-place
// re-render (chat send, card flip, chat toggle, ...) that should leave
// focus exactly where the user left it. Question index is included
// because stepping between questions is a real navigation axis (see
// src/router.js's comment on the same point).
let lastRouteKey = null;
function routeKey(state) {
  return [state.view, state.index, state.disabilities?.category || '', state.legal?.category || ''].join('/');
}

// data-* attributes views use to mark controls that are safe to re-find
// after a re-render but don't have a stable `id` (chat toggles, jump-grid
// cells, category cards, ...). Checked in this order; first match wins.
const RESTORABLE_DATA_ATTRS = ['data-send', 'data-input', 'data-toggle', 'data-cat', 'data-jur', 'data-anchor', 'data-i'];

// Records enough about document.activeElement to re-find it (by id, then
// by one of RESTORABLE_DATA_ATTRS) after app.innerHTML is replaced. Returns
// null if nothing worth restoring is focused.
function captureFocus() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return null;
  const info = { id: el.id || null, dataAttr: null, dataValue: null, selectionStart: null, selectionEnd: null };
  for (const attr of RESTORABLE_DATA_ATTRS) {
    if (el.hasAttribute(attr)) { info.dataAttr = attr; info.dataValue = el.getAttribute(attr); break; }
  }
  if (typeof el.selectionStart === 'number') {
    info.selectionStart = el.selectionStart;
    info.selectionEnd = el.selectionEnd;
  }
  return info;
}

// Whether `el` can actually receive focus — `.focus()` on a disabled or
// aria-hidden element is a silent no-op, not an error, so callers have to
// check first rather than find out by watching document.activeElement.
function isFocusable(el) {
  return !!el && !el.disabled && el.getAttribute('aria-hidden') !== 'true';
}

// Elements plausibly focusable via restoreFocus's fallback below. Just a
// heuristic for "something in this cluster the user could tab to" — not a
// general focusability computation (doesn't handle tabindex="-1" on
// non-interactive elements, contenteditable, etc.), which is fine because
// the only candidates that show up here are the buttons/inputs/links this
// app renders.
const FOCUSABLE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

// Finds a focusable stand-in for `el` among its siblings when `el` itself
// can't take focus (see restoreFocus). Searches the parent rather than the
// whole document so e.g. Prev disabling doesn't jump focus to some
// unrelated focusable element elsewhere on the page.
function nearestFocusableSibling(el) {
  const container = el.parentElement;
  if (!container) return null;
  for (const candidate of container.querySelectorAll(FOCUSABLE_SELECTOR)) {
    if (candidate !== el && isFocusable(candidate)) return candidate;
  }
  return null;
}

// CSS.escape guards the interpolated attribute value below: every current
// dataValue is an internal id or array index, but a stray quote in one
// would otherwise throw inside querySelector. jsdom (this project's test
// environment) doesn't implement CSS.escape, so fall back to the raw value
// there; every dataValue this app produces is an internal id or array
// index with nothing needing escaping, so the fallback is safe in
// practice. Real browsers all support CSS.escape, so this only ever
// matters under jsdom.
const escapeAttr = (v) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(v)) : String(v));

// Re-finds the element captureFocus() described and refocuses it,
// restoring caret position for text inputs so a mid-edit caret survives a
// re-render. Does nothing if the element is gone — an in-place re-render
// that happens to remove what was focused should never yank focus to
// <main> as a side effect.
function restoreFocus(info) {
  if (!info) return;
  const el = (info.id && document.getElementById(info.id))
    || (info.dataAttr && document.querySelector(`[${info.dataAttr}="${escapeAttr(info.dataValue)}"]`));
  if (!el) return;

  if (isFocusable(el)) {
    el.focus();
    if (info.selectionStart !== null && typeof el.setSelectionRange === 'function') {
      el.setSelectionRange(info.selectionStart, info.selectionEnd);
    }
    return;
  }

  // The control that had focus got disabled by this same re-render — e.g.
  // Prev disables itself at card 1, or Next at the last card/question.
  // The old node is already gone (innerHTML already swapped by the time
  // restoreFocus runs), so doing nothing here would drop focus to <body>:
  // exactly the "keyboard user loses their place" bug this file exists to
  // fix, just at the boundary instead of the middle. Land on the nearest
  // focusable control in the same cluster instead (Prev disables -> Next
  // takes focus) so the user stays in the neighborhood they were already
  // in, rather than <body> or a jarring jump to the route's <h1>. If
  // nothing nearby is focusable, leave focus alone rather than guessing.
  const fallback = nearestFocusableSibling(el);
  if (fallback) fallback.focus();
}

// Focuses the route's landmark — its <h1> if the view rendered one, else
// <main> itself — then explicitly scrolls to top. Doing both explicitly
// (rather than letting scroll follow focus) keeps focus and scroll
// deterministic instead of racing the browser's own handling.
function moveFocusToRoute() {
  const target = app.querySelector('h1') || app;
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function render(opts = {}) {
  // (Re-)wire the home button on every render; it lives outside <main>.
  if (homeBtn) {
    homeBtn.onclick = () => {
      const mid = state.questions.length > 0 && !state.submitted;
      if (mid && !confirm('Leave this test and return home? Your progress will be lost.')) return;
      resetState(state);
      render();
    };
  }

  const ctx = { app, state, data, missed, provenance, provenanceForQuestion, actions: {
    render, startTest, startFlashcards, openDisabilities, openLegal,
    submitAll, sendHomeChat, clearHomeChat, sendChat, announce,
  }};

  // Decide navigation-vs-in-place *before* the DOM is replaced, and grab
  // whatever's currently focused in case this turns out to be in-place.
  const newRouteKey = routeKey(state);
  const isNavigation = newRouteKey !== lastRouteKey;
  lastRouteKey = newRouteKey;
  const preserved = captureFocus();

  switch (state.view) {
    case 'legal':       renderLegal(ctx); break;
    case 'disabilities': renderDisabilities(ctx); break;
    case 'flashcards':  renderFlashcards(ctx); break;
    case 'results':     renderResults(ctx); break;
    case 'test':        renderQuestion(ctx); break;
    case 'home':
    default:            renderHome(ctx); break;
  }

  document.title = titleFor(state);

  // Sync the URL to match state. Comparing paths (not pushing
  // unconditionally) is what keeps chat sends, card flips, and radio
  // clicks from spamming the history stack — those re-render but don't
  // change state.view/index/category, so the path is unchanged. Never push
  // on a popstate-driven render — the URL already matches (it's what drove
  // this render); pushing again would duplicate the history entry.
  const path = pathFor(state);
  if (!renderingFromPopstate && path !== location.hash) {
    history.pushState(null, '', path);
  }

  // Focus handling, in priority order: an explicit selector wins if it
  // resolves; a forced or genuine navigation moves focus to the route's
  // landmark; otherwise put focus back where it was before this render.
  if (opts.focus && opts.focus !== 'route') {
    const el = document.querySelector(opts.focus);
    if (el) { el.focus(); return; }
  }
  if (isNavigation || opts.focus === 'route') {
    moveFocusToRoute();
  } else {
    restoreFocus(preserved);
  }
}

// -------- popstate --------------------------------------------------------

window.addEventListener('popstate', () => {
  const hash = location.hash;
  // Not every hash change is an app route — e.g. the skip link's href
  // still points at "#app" for no-JS fallback, and activating it fires a
  // popstate too. Ignore anything that isn't '' or '#/...' rather than
  // letting applyPath fall through to "unknown route" and bounce the user
  // off to home mid-task. (location.hash is '' for a URL ending in a bare
  // "#" — it's never the literal string '#' — so that's not a case worth
  // checking separately here.)
  if (hash !== '' && !hash.startsWith('#/')) return;

  const restored = applyPath(hash, state, routeIds);
  if (!restored) {
    // The URL points at something that no longer exists in memory (a
    // fresh reload landed mid-test, or on results, etc). Replace rather
    // than push so the URL never lies about what's on screen and Back
    // from here doesn't bounce right back to the same dead entry.
    history.replaceState(null, '', pathFor(state));
    // applyPath's fallback destination isn't always home: an unknown
    // #/disabilities/<id> or #/legal/<id> falls back to that section's
    // category grid, not home (see src/router.js). Naming the actual
    // post-fallback view via titleFor — the same string used for
    // document.title — is what keeps this true instead of telling a
    // screen reader user they're on the home page while they're looking
    // at the disabilities grid.
    announce(`That page isn't available — showing ${titleFor(state)}.`);
  }
  renderingFromPopstate = true;
  try {
    render();
  } finally {
    renderingFromPopstate = false;
  }
});

// -------- skip link --------------------------------------------------------

// href="#app" is kept for no-JS fallback (native same-page anchor jump).
// With JS active we intercept the click entirely so it never touches
// location.hash — letting it through fired a popstate for a hash applyPath
// can't resolve to any route (it's not '#/...'), which fell through to
// "unknown route" and bounced the user to home mid-test.
const skipLink = document.getElementById('skip-link');
if (skipLink) {
  skipLink.onclick = (e) => {
    e.preventDefault();
    moveFocusToRoute();
  };
}

// -------- startup --------------------------------------------------------

// Back/Forward shouldn't restore a scroll position of its own — render()'s
// focus handling (moveFocusToRoute's explicit scrollTo) is the source of
// truth for scroll position, and a browser-restored scroll could leave the
// element it just focused off-screen. Trade-off: this also disables the
// browser's scroll restoration on plain reload, so reloading a long
// scrolled page lands at the top instead of where the user was. Accepted
// because reload already re-runs the boot flow below and moves focus to
// the resolved route's landmark (moveFocusToRoute / the render() call at
// the bottom of this file) — a stale mid-page scroll position would fight
// that focus move rather than complement it.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// Resolve whatever hash the page loaded with (deep link, reload, or a
// stale entry) once at boot. Always replaceState, never push — this is
// establishing the current entry, not creating a new one. applyPath has
// already fallen back to home in state if the hash wasn't restorable
// (nothing is sampled yet on a fresh load, so #/test/n or #/results
// never restore here — see src/router.js).
applyPath(location.hash, state, routeIds);
history.replaceState(null, '', pathFor(state));

// Seed the route key from the resolved boot state so the very first paint
// below is treated as "in place" rather than a navigation — cold load
// shouldn't steal focus into <main> before the user has done anything.
lastRouteKey = routeKey(state);

// Probe chat availability (server may or may not have an LLM provider configured).
fetchChatStatus().then(enabled => {
  state.chatEnabled = enabled;
  // Repaint whatever the user is looking at now that availability is
  // known, regardless of view: chat affordances render on more than just
  // home (results gates its per-question "Discuss with the AI tutor"
  // toggle on state.chatEnabled too — see src/views/results.js), so
  // gating this on state.view === 'home' silently left results without
  // its toggles if the probe was still pending when the user got there.
  // Unconditionally re-rendering is safe now that render() is in-place
  // and focus-preserving (captureFocus/restoreFocus) — that was the whole
  // point of adding them.
  render();
  // No announcement here: chatEnabled starts `null` on every single page
  // load and this probe only ever runs once, at boot, before the user has
  // seen anything chat-related on screen. "The probe settled" isn't an
  // event that needs correcting — announcing it here fired on every visit
  // where chat happened to be configured, regardless of whether anything
  // actually changed from the user's perspective.
});

// Load missed set from server (or local fallback), then repaint whatever the
// user is looking at now that it's known: the missed-set count shows up on
// both home ("Practice N missed") and results ("missed list now: N", the
// retake button label — see src/views/results.js), so gating this on
// state.view === 'home' left results showing a stale (typically 0) count if
// the fetch was still in flight when the user submitted and landed there.
// Unconditionally re-rendering is safe now that render() is in-place and
// focus-preserving (captureFocus/restoreFocus) — same reasoning as the
// fetchChatStatus() probe above. Note this must stay a wrapping arrow
// function, not `.then(render)` directly: render(opts) now reads `opts`,
// and `.then` would otherwise hand it the resolved missed-set value.
missed.fetchFromServer().then(() => {
  render();
});

// Append the (initially closed) "About AI in this app" dialog to the document
// body so it's available from any view via the data-open-ai-info trigger.
document.body.insertAdjacentHTML('beforeend', renderAiInfoDialog());
installAiInfoDialog();

// Render once immediately so the user sees something while async loads.
render();
