// tests/views.test.js — lightweight DOM tests for view modules.
//
// Mounts each view's HTML output into jsdom and asserts the key
// accessibility properties survive any future refactor:
//   - exactly one h1
//   - radiogroup with aria-describedby pointing to an existing element
//   - verdict region is tabindex=-1 and aria-live
//   - status counter is role=status aria-live
//   - chat log is role=log aria-live
//   - decorative emoji are aria-hidden
//   - skip link is present in index.html shell

import { JSDOM } from 'jsdom';
import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));

async function loadView(modName) {
  const file = url.pathToFileURL(path.join(HERE, '..', modName)).href;
  return import(file);
}

function makeDom() {
  const dom = new JSDOM(`<!doctype html><html><body><main id="app" tabindex="-1"></main></body></html>`, { url: 'http://localhost/' });
  // Provide globals view modules / scoring may touch indirectly.
  globalThis.document = dom.window.document;
  globalThis.window = dom.window;
  return dom;
}

const fakeQuestion = {
  id: 1, domain: 1, type: 'recall', q: 'What is X?',
  choices: { A: 'a', B: 'b', C: 'c', D: 'd' },
  answer: 'A',
  why: { A: 'right', B: 'wrong', C: 'wrong', D: 'wrong' },
};

const fakeState = {
  mode: 'weighted',
  questions: [fakeQuestion],
  answers: {}, pending: {}, revealed: {},
  index: 0, submitted: false,
  chats: {}, homeChat: { history: [] },
  chatEnabled: false,
  flashcards: null, disabilities: null, legal: null,
};

const fakeMissed = {
  get: () => new Set(),
  add() {}, remove() {}, persist: async () => {},
  clear: async () => {},
};
const fakeActions = {
  render() {}, startTest() {}, startFlashcards() {}, openDisabilities() {},
  openLegal() {}, submitAll: async () => {}, sendHomeChat: async () => {},
  clearHomeChat() {}, sendChat: async () => {},
};

export async function run({ test, assertTrue, assertEq }) {
  await test('index.html shell has skip link, home button, and main with tabindex -1', () => {
    const html = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    assertTrue(doc.querySelector('a.skip-link'), 'no skip link');
    assertTrue(doc.querySelector('#home-btn[aria-label]'), 'home button missing or no aria-label');
    const main = doc.querySelector('main#app');
    assertTrue(main, 'no main#app');
    assertEq(main.getAttribute('tabindex'), '-1', 'main not focusable for skip link');
  });

  await test('renderHome: one h1, no broken aria-describedby refs', async () => {
    const dom = makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    renderHome({
      app: dom.window.document.getElementById('app'),
      state: fakeState,
      data: { CPACC_BANK: [fakeQuestion], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: { categories: [], items: [] }, LEGAL: { jurisdictions: [], items: [] } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    assertEq(doc.querySelectorAll('h1').length, 1, 'expected exactly one h1');
    assertTrue(doc.getElementById('start'), 'start button missing');
  });

  await test('renderQuestion: radiogroup, kbd-hint, verdict region, status counter, aria-describedby resolves', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, pending: {} },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;

    // h1 / heading hierarchy
    assertEq(doc.querySelectorAll('h1').length, 1);

    // radiogroup wired correctly
    const rg = doc.getElementById('choices');
    assertTrue(rg, 'no choices container');
    assertEq(rg.getAttribute('role'), 'radiogroup');
    const desc = rg.getAttribute('aria-describedby');
    assertEq(desc, 'kbd-hint');
    assertTrue(doc.getElementById('kbd-hint'), 'aria-describedby target missing');

    // verdict is focusable + live
    const v = doc.getElementById('verdict');
    assertTrue(v, 'no verdict region');
    assertEq(v.getAttribute('tabindex'), '-1');
    assertEq(v.getAttribute('aria-live'), 'polite');

    // status counter
    const sub = doc.querySelector('.sub[role="status"]');
    assertTrue(sub, 'progress counter missing role=status');
    assertEq(sub.getAttribute('aria-live'), 'polite');

    // 4 radios
    assertEq(doc.querySelectorAll('input[type="radio"][name="choice"]').length, 4);
  });

  await test('renderQuestion submit-answer disabled when no pending answer', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, pending: {} },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const btn = dom.window.document.getElementById('submit-answer');
    assertTrue(btn, 'submit-answer missing');
    assertTrue(btn.hasAttribute('disabled'), 'should be disabled');
    assertEq(btn.getAttribute('aria-describedby'), 'submit-help');
    assertTrue(dom.window.document.getElementById('submit-help'), 'submit-help description missing');
  });

  await test('renderQuestion submit-all only shown on last question or all revealed', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    // single question = also the last question → submit-all visible
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState },
      missed: fakeMissed, actions: fakeActions,
    });
    assertTrue(dom.window.document.getElementById('submit-all'), 'submit-all should show on last Q');
  });

  await test('renderResults shows score and per-question review markup', async () => {
    const dom = makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    renderResults({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, answers: { 1: 'A' }, revealed: { 1: true }, submitted: true },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    assertEq(doc.querySelectorAll('h1').length, 1);
    assertTrue(doc.querySelector('.score'), 'no score readout');
    assertTrue(doc.getElementById('retake'), 'retake button missing');
    assertTrue(doc.getElementById('back'), 'back button missing');
  });

  await test('renderFlashcards renders an accessible card toggle', async () => {
    const dom = makeDom();
    const { renderFlashcards } = await loadView('src/views/flashcards.js');
    renderFlashcards({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, flashcards: { cards: [{ id: 1, tag: 't', front: 'F', back: 'B' }], index: 0, flipped: false } },
      actions: fakeActions,
    });
    const card = dom.window.document.getElementById('card');
    assertTrue(card, 'card button missing');
    assertEq(card.getAttribute('aria-pressed'), 'false');
    assertTrue(card.hasAttribute('aria-label'), 'card needs aria-label');
  });

  await test('decorative emoji in renderHome have aria-hidden="true"', async () => {
    const dom = makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    renderHome({
      app: dom.window.document.getElementById('app'),
      state: fakeState,
      data: { CPACC_BANK: [fakeQuestion], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: { categories: [], items: [] }, LEGAL: { jurisdictions: [], items: [] } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const emoji = dom.window.document.querySelectorAll('.qmeta-emoji');
    assertTrue(emoji.length > 0, 'no qmeta-emoji found');
    for (const e of emoji) {
      assertEq(e.getAttribute('aria-hidden'), 'true', 'decorative emoji must be aria-hidden');
    }
  });
}
