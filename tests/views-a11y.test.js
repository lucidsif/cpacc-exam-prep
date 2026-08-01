// tests/views-a11y.test.js — regression coverage for the Workstream D
// accessibility fixes (unsent-chat-draft loss, silent flashcard navigation,
// duplicate accessible names on results, and IME composition safety).
//
// Deliberately a separate file from tests/views.test.js (owned by another
// workstream) rather than an addition to it — see fix-plan.md Workstream D.
// Discovered automatically by tests/run.js (any *.test.js in this directory).
//
// Handlers are invoked directly (el.onclick(), el.oninput({target: el}),
// el.onkeydown({key, isComposing})) rather than through dom.dispatchEvent
// wherever a plain function call expresses the same behaviour more
// reliably — this sidesteps jsdom's KeyboardEvent/InputEvent quirks and
// keeps these tests about the app's own logic, not jsdom's event fidelity.

import { JSDOM } from 'jsdom';
import path from 'node:path';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));

async function loadView(modName) {
  const file = url.pathToFileURL(path.join(HERE, '..', modName)).href;
  return import(file);
}

function makeDom() {
  const dom = new JSDOM(`<!doctype html><html><body><main id="app" tabindex="-1"></main></body></html>`, { url: 'http://localhost/' });
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  return dom;
}

const fakeQuestion = (id, letter = 'A') => ({
  id, domain: 1, type: 'recall', q: `Question text ${id}?`,
  choices: { A: 'a', B: 'b', C: 'c', D: 'd' },
  answer: letter,
  why: { A: 'right', B: 'wrong', C: 'wrong', D: 'wrong' },
});

function baseState(overrides = {}) {
  return {
    view: 'home',
    mode: 'weighted',
    questions: [],
    answers: {}, pending: {}, revealed: {},
    index: 0, submitted: false,
    chats: {}, homeChat: { history: [], draft: '' },
    chatEnabled: true,
    flashcards: null, disabilities: null, legal: null,
    expandedProvenance: new Set(),
    ...overrides,
  };
}

const fakeMissed = { get: () => new Set(), add() {}, remove() {}, persist: async () => {}, clear: async () => {} };

function spyActions(overrides = {}) {
  const calls = { announce: [], render: 0 };
  return {
    calls,
    actions: {
      render() { calls.render++; },
      startTest() {}, startFlashcards() {}, openDisabilities() {}, openLegal() {},
      submitAll: async () => {}, sendHomeChat: async () => {}, clearHomeChat() {},
      sendChat: async () => {}, announce(msg) { calls.announce.push(msg); },
      ...overrides,
    },
  };
}

export async function run({ test, assertTrue, assertEq }) {
  // ---- D1: unsent chat text must survive an in-place re-render ----

  await test('D1: home chat draft survives a re-render, and is cleared on send', async () => {
    makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    const state = baseState({ chatEnabled: true });
    const data = { CPACC_BANK: [], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: null, LEGAL: null };
    const { actions } = spyActions();

    renderHome({ app: document.getElementById('app'), state, data, missed: fakeMissed, actions });
    const input = document.getElementById('home-input');
    assertTrue(input, 'home-input missing');

    // Simulate typing: oninput syncs state, not just the live DOM node.
    input.value = 'unsent draft text';
    input.oninput({ target: input });
    assertEq(state.homeChat.draft, 'unsent draft text', 'oninput should sync the draft into state');

    // An unrelated in-place re-render (e.g. a chat reply landing, another
    // panel toggling) must not wipe it out.
    renderHome({ app: document.getElementById('app'), state, data, missed: fakeMissed, actions });
    const reRenderedInput = document.getElementById('home-input');
    assertTrue(reRenderedInput !== input, 'sanity: re-render should have replaced the node');
    assertEq(reRenderedInput.value, 'unsent draft text', 'draft must survive an in-place re-render, not be wiped to empty');

    // Sending clears the draft (view-level responsibility, since
    // sendHomeChat itself only clears the live DOM node, not state).
    const sendBtn = document.getElementById('home-send');
    sendBtn.onclick();
    assertEq(state.homeChat.draft, '', 'clicking Send should clear the draft so the next render shows an empty box');
  });

  await test('D1: per-question chat draft on results.js survives a sibling question\'s chat toggle (two-click repro)', async () => {
    makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    const q1 = fakeQuestion(1);
    const q2 = fakeQuestion(2);
    const state = baseState({ view: 'results', questions: [q1, q2], submitted: true, chatEnabled: true });
    const { actions } = spyActions();
    const ctx = { app: document.getElementById('app'), state, missed: fakeMissed, actions, provenanceForQuestion: () => null };

    renderResults(ctx);
    // Open Q1's chat.
    document.querySelector('[data-toggle="1"]').onclick();
    renderResults(ctx); // what actions.render() would have triggered for real

    const q1Input = document.querySelector('[data-input="1"]');
    assertTrue(q1Input, 'Q1 chat input should exist once its panel is open');
    q1Input.value = 'why is B wrong';
    q1Input.oninput({ target: q1Input });
    assertEq(state.chats[1].draft, 'why is B wrong', 'oninput should record Q1\'s draft in state');

    // Toggling Q2's chat is the sibling in-place re-render from the D1 repro.
    document.querySelector('[data-toggle="2"]').onclick();
    renderResults(ctx);

    const q1InputAfter = document.querySelector('[data-input="1"]');
    assertTrue(q1InputAfter, 'Q1 chat panel should still be open after toggling Q2');
    assertEq(q1InputAfter.value, 'why is B wrong', 'Q1\'s draft must survive Q2\'s toggle, not be silently destroyed');
  });

  // ---- D2: flashcard Prev/Next/Shuffle must announce (WCAG 4.1.3) ----

  await test('D2: flashcards Next/Prev/Shuffle each announce the new card (card-change path was previously silent)', async () => {
    makeDom();
    const { renderFlashcards } = await loadView('src/views/flashcards.js');
    const cards = [
      { id: 1, tag: 't', front: 'Front one', back: 'Back one' },
      { id: 2, tag: 't', front: 'Front two', back: 'Back two' },
    ];
    const state = baseState({ view: 'flashcards', flashcards: { cards, index: 0, flipped: false } });
    const { actions, calls } = spyActions();

    renderFlashcards({ app: document.getElementById('app'), state, actions });
    document.getElementById('next-card').onclick();
    assertEq(calls.announce.length, 1, 'Next should announce exactly once');
    assertTrue(calls.announce[0].includes('Front two'), 'Next\'s announcement should name the newly-shown card');
    assertTrue(/card 2 of 2/i.test(calls.announce[0]), 'Next\'s announcement should state the new position');

    renderFlashcards({ app: document.getElementById('app'), state, actions });
    document.getElementById('prev-card').onclick();
    assertEq(calls.announce.length, 2, 'Prev should also announce');
    assertTrue(calls.announce[1].includes('Front one'), 'Prev\'s announcement should name the card it moved back to');

    renderFlashcards({ app: document.getElementById('app'), state, actions });
    document.getElementById('shuffle-cards').onclick();
    assertEq(calls.announce.length, 3, 'Shuffle should also announce');
    assertTrue(/card 1 of 2/i.test(calls.announce[2]), 'Shuffle\'s announcement should reset to card 1');
  });

  // ---- D4: 20 identical accessible names on results.js ----

  await test('D4: results.js chat toggle/send/input/log names are disambiguated per question, not identical across all 20', async () => {
    makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    const q1 = fakeQuestion(1);
    const q2 = fakeQuestion(2);
    const state = baseState({
      view: 'results', questions: [q1, q2], submitted: true, chatEnabled: true,
      chats: { 1: { open: true, history: [], draft: '' }, 2: { open: true, history: [], draft: '' } },
    });
    const { actions } = spyActions();
    renderResults({ app: document.getElementById('app'), state, missed: fakeMissed, actions, provenanceForQuestion: () => null });

    const toggle1 = document.querySelector('[data-toggle="1"]');
    const toggle2 = document.querySelector('[data-toggle="2"]');
    assertTrue(toggle1.textContent !== toggle2.textContent, 'toggle buttons must not share one accessible name across questions');
    assertTrue(toggle1.textContent.includes('Question 1'), 'Q1 toggle name should identify question 1');
    assertTrue(toggle2.textContent.includes('Question 2'), 'Q2 toggle name should identify question 2');

    const send1 = document.querySelector('[data-send="1"]');
    const send2 = document.querySelector('[data-send="2"]');
    assertTrue(send1.textContent !== send2.textContent, '"Send" buttons must not share one accessible name across questions');

    const input1 = document.querySelector('[data-input="1"]');
    const input2 = document.querySelector('[data-input="2"]');
    assertTrue(input1.getAttribute('aria-label') !== input2.getAttribute('aria-label'), 'chat inputs must not share one aria-label across questions');

    const log1 = document.getElementById('log-1');
    const log2 = document.getElementById('log-2');
    assertTrue(log1.getAttribute('aria-label') !== log2.getAttribute('aria-label'), 'chat log regions must not share one aria-label across questions');
  });

  // ---- follow-up: scrollable chat logs must be keyboard-reachable ----
  //
  // styles/app.css caps .chat .log at max-height:320px with overflow-y:auto,
  // making both transcripts scrollable regions. With no tabindex, axe flags
  // this as scrollable-region-focusable (wcag2a/wcag211, Level A) — a
  // keyboard-only or screen-reader user has no way to scroll back through
  // history once a conversation runs long enough to overflow. The default
  // seeded transcript is short enough that this stayed latent in the axe
  // scans; pin it directly here instead of depending on overflow happening
  // to occur in a scanned fixture.

  await test('scrollable chat log containers (#home-log, #log-<id>) carry tabindex="0" so keyboard users can scroll them', async () => {
    makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    const homeState = baseState({ chatEnabled: true, homeChat: { history: [{ role: 'user', content: 'hi' }], draft: '' } });
    const data = { CPACC_BANK: [], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: null, LEGAL: null };
    const { actions: homeActions } = spyActions();
    renderHome({ app: document.getElementById('app'), state: homeState, data, missed: fakeMissed, actions: homeActions });

    const homeLog = document.getElementById('home-log');
    assertTrue(homeLog, 'home-log missing');
    assertEq(homeLog.getAttribute('tabindex'), '0', '#home-log must carry tabindex="0" — it is a scrollable region (styles/app.css .chat .log)');
    assertTrue(homeLog.hasAttribute('aria-label'), 'sanity: #home-log should still have its accessible name');

    const { renderResults } = await loadView('src/views/results.js');
    const q1 = fakeQuestion(1);
    const resultsState = baseState({
      view: 'results', questions: [q1], submitted: true, chatEnabled: true,
      chats: { 1: { open: true, history: [{ role: 'user', content: 'hi' }], draft: '' } },
    });
    const { actions } = spyActions();
    renderResults({ app: document.getElementById('app'), state: resultsState, missed: fakeMissed, actions, provenanceForQuestion: () => null });

    const perQuestionLog = document.getElementById('log-1');
    assertTrue(perQuestionLog, 'log-1 missing');
    assertEq(perQuestionLog.getAttribute('tabindex'), '0', '#log-<id> must carry tabindex="0" — it is a scrollable region (styles/app.css .chat .log)');
    assertTrue(perQuestionLog.hasAttribute('aria-label'), 'sanity: #log-<id> should still have its accessible name');
  });

  // ---- D5: IME composition must not trigger a premature send ----

  await test('D5: Enter while composing (CJK IME) does not send — home chat and per-question chat', async () => {
    makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    let homeSends = 0;
    const state = baseState({ chatEnabled: true });
    const data = { CPACC_BANK: [], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: null, LEGAL: null };
    const { actions: homeActions } = spyActions({ sendHomeChat: async () => { homeSends++; } });
    renderHome({ app: document.getElementById('app'), state, data, missed: fakeMissed, actions: homeActions });

    const homeInput = document.getElementById('home-input');
    homeInput.onkeydown({ key: 'Enter', isComposing: true });
    assertEq(homeSends, 0, 'Enter during IME composition must not send the home chat message');
    homeInput.onkeydown({ key: 'Enter', isComposing: false });
    assertEq(homeSends, 1, 'sanity: a genuine Enter (not composing) should still send');
  });

  await test('D5: Enter while composing (CJK IME) does not send — results.js per-question chat', async () => {
    makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    let chatSends = 0;
    const q1 = fakeQuestion(1);
    const state = baseState({
      view: 'results', questions: [q1], submitted: true, chatEnabled: true,
      chats: { 1: { open: true, history: [], draft: '' } },
    });
    const { actions } = spyActions({ sendChat: async () => { chatSends++; } });
    renderResults({ app: document.getElementById('app'), state, missed: fakeMissed, actions, provenanceForQuestion: () => null });

    const input = document.querySelector('[data-input="1"]');
    input.onkeydown({ key: 'Enter', isComposing: true });
    assertEq(chatSends, 0, 'Enter during IME composition must not send the per-question chat message');
    input.onkeydown({ key: 'Enter', isComposing: false });
    assertEq(chatSends, 1, 'sanity: a genuine Enter (not composing) should still send');
  });

  // ---- anchor bars need the same group semantics as the jump grids, AND
  // need to be a real keyboard-operable scrollable region ----
  //
  // question.js's and results.js's jump grids carry role="group" +
  // aria-label on their container so a screen reader announces them as a
  // named group of 20-ish sibling buttons, not an unlabelled flat list.
  // disabilities.js's and legal.js's anchor bars are the same shape (up to
  // 26 sibling <button class="anchor">s) and previously had none of that.
  //
  // role="group"/aria-label live on .dis-anchor-bar itself (not the nested
  // .anchor-list) because that's also the element styles/app.css caps at
  // max-height:30vh with overflow-y:auto — a later pass gave that a
  // scrollable-region-focusable fix (WCAG 2.1.1) by adding tabindex="0",
  // and the accessible name has to live on the SAME element that becomes
  // the tab stop to be guaranteed rather than assumed (see the comment in
  // disabilities.js/legal.js above this markup for the reasoning).

  await test('disabilities.js anchor bar (.dis-anchor-bar) carries role="group" + a non-empty aria-label + tabindex="0", matching the jump grid pattern and .chat .log\'s scrollable-region-focusable fix', async () => {
    makeDom();
    const { renderDisabilities } = await loadView('src/views/disabilities.js');
    const data = { DISABILITIES: {
      categories: [{ id: 'testcat', label: 'Test Category', emoji: '🧪', color: '#000' }],
      items: [
        { id: 'item1', category: 'testcat', emoji: '🧪', name: 'Item One', prevalence: '', description: '', keyFacts: [], a11ySolutions: [] },
        { id: 'item2', category: 'testcat', emoji: '🧪', name: 'Item Two', prevalence: '', description: '', keyFacts: [], a11ySolutions: [] },
      ],
    }};
    const state = baseState({ view: 'disabilities', disabilities: { view: 'list', category: 'testcat' } });
    const { actions } = spyActions();
    renderDisabilities({ app: document.getElementById('app'), state, data, actions, provenance: null });

    const anchorBar = document.querySelector('.dis-anchor-bar');
    assertTrue(anchorBar, '.dis-anchor-bar missing');
    assertEq(anchorBar.getAttribute('role'), 'group', 'anchor bar should carry role="group" like the jump grids');
    const label = anchorBar.getAttribute('aria-label');
    assertTrue(!!label && label.includes('Test Category'), 'anchor bar aria-label should be non-empty and name the category');
    assertEq(anchorBar.getAttribute('tabindex'), '0', '.dis-anchor-bar is the scrollable element (app.css max-height/overflow-y:auto) and must itself be a keyboard-reachable tab stop');
  });

  await test('legal.js anchor bar (.dis-anchor-bar) carries role="group" + a non-empty aria-label + tabindex="0", matching the jump grid pattern and .chat .log\'s scrollable-region-focusable fix', async () => {
    makeDom();
    const { renderLegal } = await loadView('src/views/legal.js');
    const data = { LEGAL: {
      jurisdictions: [{ id: 'testjur', label: 'Test Jurisdiction', emoji: '⚖️', color: '#000' }],
      items: [
        { id: 'item1', jurisdiction: 'testjur', name: 'Item One', year: '2000', type: 'Statute', cpacc: true, summary: '', keyFacts: [] },
        { id: 'item2', jurisdiction: 'testjur', name: 'Item Two', year: '2001', type: 'Statute', cpacc: true, summary: '', keyFacts: [] },
      ],
    }};
    const state = baseState({ view: 'legal', legal: { view: 'list', category: 'testjur' } });
    const { actions } = spyActions();
    renderLegal({ app: document.getElementById('app'), state, data, actions, provenance: null });

    const anchorBar = document.querySelector('.dis-anchor-bar');
    assertTrue(anchorBar, '.dis-anchor-bar missing');
    assertEq(anchorBar.getAttribute('role'), 'group', 'anchor bar should carry role="group" like the jump grids');
    const label = anchorBar.getAttribute('aria-label');
    assertTrue(!!label && label.includes('Test Jurisdiction'), 'anchor bar aria-label should be non-empty and name the jurisdiction');
    assertEq(anchorBar.getAttribute('tabindex'), '0', '.dis-anchor-bar is the scrollable element (app.css max-height/overflow-y:auto) and must itself be a keyboard-reachable tab stop');
  });

  // ---- "About AI in this app" must not repeat across simultaneously-open
  // chat panels, same as the toggle/send/input/log fix above (D4) ----

  await test('results.js disambiguates the "About AI in this app" button per open chat panel', async () => {
    makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    const q1 = fakeQuestion(1);
    const q2 = fakeQuestion(2);
    const state = baseState({
      view: 'results', questions: [q1, q2], submitted: true, chatEnabled: true,
      chats: { 1: { open: true, history: [], draft: '' }, 2: { open: true, history: [], draft: '' } },
    });
    const { actions } = spyActions();
    renderResults({ app: document.getElementById('app'), state, missed: fakeMissed, actions, provenanceForQuestion: () => null });

    const aiBtn1 = document.querySelector('#chat-panel-1 [data-open-ai-info]');
    const aiBtn2 = document.querySelector('#chat-panel-2 [data-open-ai-info]');
    assertTrue(aiBtn1, 'Q1 chat panel should render an "About AI in this app" button');
    assertTrue(aiBtn2, 'Q2 chat panel should render an "About AI in this app" button');
    assertTrue(aiBtn1.textContent !== aiBtn2.textContent, '"About AI in this app" buttons must not share one accessible name across open panels');
    assertTrue(aiBtn1.textContent.includes('Question 1'), 'Q1\'s "About AI in this app" name should identify question 1');
    assertTrue(aiBtn2.textContent.includes('Question 2'), 'Q2\'s "About AI in this app" name should identify question 2');
  });

  // ---- provenance <details> disclosure state must survive an in-place
  // re-render, not silently collapse (every render rebuilds app.innerHTML,
  // and the old stateless <details> had nothing to rebuild `open` from) ----
  //
  // An existing views.test.js test focuses a provenance <summary> through
  // this exact kind of re-render and stays green while the disclosure
  // collapses underneath it (it never asserts `.open`) — this test asserts
  // `.open` directly so that regression can't hide the same way again.

  await test('a provenance <details> disclosure the user opened stays open across an in-place re-render (state.expandedProvenance), instead of silently collapsing', async () => {
    const dom = makeDom();
    const { renderDisabilities } = await loadView('src/views/disabilities.js');
    const data = { DISABILITIES: {
      categories: [{ id: 'testcat', label: 'Test Category', emoji: '🧪', color: '#000' }],
      items: [{ id: 'item1', category: 'testcat', emoji: '🧪', name: 'Item One', prevalence: '', description: '', keyFacts: [], a11ySolutions: [] }],
    }};
    const prov = { label: 'AI-derived', citations: ['x'], generatedBy: 'Claude', generatedAt: 'now', humanReview: 'none', confidence: 'medium', limitations: [] };
    const state = baseState({ view: 'disabilities', disabilities: { view: 'categories' } });
    const { actions } = spyActions();
    const ctx = { app: document.getElementById('app'), state, data, actions, provenance: { DISABILITIES: prov } };

    renderDisabilities(ctx);
    const details = document.querySelector('details.provenance');
    assertTrue(details, 'provenance <details> missing');
    assertEq(details.open, false, 'sanity: starts closed');

    // Open it the way a real user would — native <details> flips its own
    // `.open` and fires `toggle`; wireProvenanceToggles (provenance.js)
    // listens for exactly that event to record the id in state.
    details.open = true;
    details.dispatchEvent(new dom.window.Event('toggle'));
    assertTrue(state.expandedProvenance.has('disabilities'), 'opening the disclosure should record its id in state.expandedProvenance');

    // An unrelated in-place re-render (e.g. a chat reply landing elsewhere)
    // rebuilds app.innerHTML wholesale. The bug: this used to always emit a
    // stateless <details> with no `open`, so it silently collapsed here
    // even though the user never touched it — and for a virtual-cursor
    // screen reader user reading through it, that's the subtree being
    // pulled out from under them mid-read, not just a visual collapse.
    renderDisabilities(ctx);
    const detailsAfter = document.querySelector('details.provenance');
    assertTrue(detailsAfter, 'provenance <details> should still exist after the re-render');
    assertTrue(detailsAfter !== details, 'sanity: re-render should have replaced the node, not reused it');
    assertEq(detailsAfter.open, true, 'the disclosure must stay open across an in-place re-render, not silently collapse');
  });

  // ---- #submit-help must not resurrect once a choice is pending ----

  await test('#submit-help does not resurrect as a stale, contradictory description once a choice is pending (e.g. across a Next-then-Prev round trip)', async () => {
    makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    const q1 = fakeQuestion(1, 'A');
    const q2 = fakeQuestion(2, 'B');
    const state = baseState({ view: 'test', questions: [q1, q2], index: 0, pending: {} });
    const { actions } = spyActions();
    const ctx = { app: document.getElementById('app'), state, missed: fakeMissed, actions };

    renderQuestion(ctx);
    assertTrue(document.getElementById('submit-help'), 'sanity: submit-help present before any choice is picked');

    // Pick a choice — the onchange handler records state.pending directly
    // and deliberately does not trigger a render (see question.js's own
    // comment on that forEach).
    const radioB = document.querySelector('input[name="choice"][value="B"]');
    radioB.checked = true;
    radioB.onchange({ target: radioB });
    assertEq(state.pending[q1.id], 'B', 'sanity: pending recorded');

    // Simulate a Next-then-Prev round trip: two ordinary full re-renders of
    // the same (still-pending, still-unrevealed) question.
    renderQuestion(ctx);
    renderQuestion(ctx);

    assertTrue(!document.getElementById('submit-help'), '#submit-help must not resurrect once a choice is pending — it used to unconditionally reappear on any render while !revealed, regardless of pending, reading "Select a choice to enable Submit answer" while a choice WAS selected and Submit WAS enabled');
    const btn = document.getElementById('submit-answer');
    assertTrue(btn, 'submit-answer missing');
    assertEq(btn.hasAttribute('disabled'), false, 'sanity: submit-answer should be enabled once a choice is pending');
    assertEq(btn.getAttribute('aria-describedby'), 'kbd-hint', 'submit-answer should describe via kbd-hint, not the stale submit-help, once a choice is pending');
  });

  // ---- #kbd-hint must not keep instructing an action that's no longer
  // possible once the answer is revealed ----

  await test('#kbd-hint stops instructing "choose Submit answer" once the question is revealed (that button and the enabled fieldset are both gone by then)', async () => {
    makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    const q = fakeQuestion(1, 'A');

    const unrevealedState = baseState({ view: 'test', questions: [q], index: 0, pending: {} });
    renderQuestion({ app: document.getElementById('app'), state: unrevealedState, missed: fakeMissed, actions: spyActions().actions });
    const hintBefore = document.getElementById('kbd-hint');
    assertTrue(hintBefore, 'kbd-hint missing');
    assertTrue(hintBefore.textContent.includes('Submit answer'), 'sanity: the unrevealed hint should mention Submit answer');

    const revealedState = baseState({ view: 'test', questions: [q], index: 0, answers: { 1: 'A' }, revealed: { 1: true } });
    renderQuestion({ app: document.getElementById('app'), state: revealedState, missed: fakeMissed, actions: spyActions().actions });
    const hintAfter = document.getElementById('kbd-hint');
    assertTrue(hintAfter, 'kbd-hint missing after reveal');
    assertTrue(!hintAfter.textContent.includes('Submit answer'), 'the revealed hint must not still instruct "choose Submit answer" — that control no longer exists once revealed');
    assertTrue(!document.getElementById('submit-answer'), 'sanity: submit-answer really is gone once revealed');
  });
}
