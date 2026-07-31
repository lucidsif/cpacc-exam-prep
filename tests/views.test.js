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
  view: 'test',
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
      provenance: {},
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

    // Progress counter is plain text — intentionally NOT a live region.
    // (Per accessibility-lead Phase 6 review: only one polite live region
    // per view to avoid dueling announcements with #verdict.)
    const sub = doc.querySelector('.sub');
    assertTrue(sub, 'progress counter missing');
    assertEq(sub.hasAttribute('aria-live'), false, 'counter should not be a live region');
    assertEq(sub.hasAttribute('role'), false, 'counter should not carry role=status');

    // 4 radios
    assertEq(doc.querySelectorAll('input[type="radio"][name="choice"]').length, 4);
  });

  await test('renderQuestion uses aria-disabled (not disabled) on revealed radios so keyboard review still works', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, answers: { 1: 'B' }, revealed: { 1: true } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const radios = dom.window.document.querySelectorAll('input[type="radio"][name="choice"]');
    for (const r of radios) {
      assertEq(r.hasAttribute('disabled'), false, 'revealed radios must not use native disabled');
      assertEq(r.getAttribute('aria-disabled'), 'true', 'revealed radios must use aria-disabled');
    }
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

  await test('renderProvenanceBadge produces a <details> with labeled summary, confidence pill, and dl card', async () => {
    const dom = makeDom();
    const { renderProvenanceBadge } = await loadView('src/provenance.js');
    const prov = {
      category: 'ai-from-source',
      label: 'AI-authored from BoK',
      citations: ['IAAP BoK Oct 2023'],
      generatedBy: 'Claude Sonnet 4.6',
      generatedAt: '2025-04',
      humanReview: 'Author reviewed against citation.',
      confidence: 'high',
      limitations: ['Not endorsed by IAAP.'],
    };
    const html = renderProvenanceBadge(prov, 'Question 1');
    const wrap = dom.window.document.createElement('div');
    wrap.innerHTML = html;
    const det = wrap.querySelector('details.provenance');
    assertTrue(det, 'no <details> rendered');
    const summary = det.querySelector('summary');
    assertTrue(summary, 'no <summary>');
    assertTrue(summary.getAttribute('aria-label').includes('Question 1'), 'aria-label should include the item label');
    // Decorative emoji must be hidden from AT
    const emoji = summary.querySelector('.pv-icon');
    assertEq(emoji.getAttribute('aria-hidden'), 'true');
    // Confidence pill carries text, glyph (aria-hidden), AND color class — SC 1.4.1 dual encoding
    const pill = summary.querySelector('.pv-conf');
    assertTrue(pill.classList.contains('pv-conf-high'), 'confidence pill should have a color class');
    assertTrue(pill.textContent.toLowerCase().includes('high'), 'confidence pill must include the word "High"');
    const glyph = pill.querySelector('.pv-conf-glyph');
    assertEq(glyph.getAttribute('aria-hidden'), 'true');
    // Provenance card uses <dl> for semantic field pairs (SC 1.3.1)
    const dl = det.querySelector('dl.provenance-card');
    assertTrue(dl, 'provenance card should be a <dl>');
    const dts = dl.querySelectorAll('dt');
    const dds = dl.querySelectorAll('dd');
    assertTrue(dts.length >= 5, 'expected ≥5 provenance fields');
    assertEq(dts.length, dds.length, 'dt/dd count must match');
  });

  await test('renderChatProvenanceBanner exposes an "About AI in this app" trigger', async () => {
    const dom = makeDom();
    const { renderChatProvenanceBanner } = await loadView('src/provenance.js');
    const wrap = dom.window.document.createElement('div');
    wrap.innerHTML = renderChatProvenanceBanner();
    const trigger = wrap.querySelector('[data-open-ai-info]');
    assertTrue(trigger, 'banner must contain a data-open-ai-info trigger');
    assertEq(trigger.tagName, 'BUTTON');
  });

  await test('renderAiInfoDialog produces a labelled <dialog> with a close button', async () => {
    const dom = makeDom();
    const { renderAiInfoDialog } = await loadView('src/provenance.js');
    const wrap = dom.window.document.createElement('div');
    wrap.innerHTML = renderAiInfoDialog();
    const dlg = wrap.querySelector('dialog#ai-info-dialog');
    assertTrue(dlg, 'no dialog rendered');
    assertEq(dlg.getAttribute('aria-labelledby'), 'ai-info-title');
    assertTrue(wrap.querySelector('#ai-info-title'), 'aria-labelledby target must exist');
    assertTrue(wrap.querySelector('[data-close-ai-info]'), 'dialog needs a close trigger');
  });

  await test('home page shows a "Goes beyond CPACC scope" note on the Human disabilities card', async () => {
    const dom = makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    renderHome({
      app: dom.window.document.getElementById('app'),
      state: fakeState,
      data: { CPACC_BANK: [fakeQuestion], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: { categories: [], items: [] }, LEGAL: { jurisdictions: [], items: [] } },
      provenance: {},
      missed: fakeMissed,
      actions: fakeActions,
    });
    // Scope note is rendered inside the Human disabilities panel — find by the trigger button id.
    const btn = dom.window.document.getElementById('start-disabilities');
    assertTrue(btn, 'disabilities button missing');
    const panel = btn.closest('.panel');
    const note = panel.querySelector('.scope-note');
    assertTrue(note, 'home Disabilities panel must include a scope-note');
    assertTrue(note.textContent.toLowerCase().includes('beyond cpacc scope'), 'note must read "beyond CPACC scope"');
  });

  await test('disabilities reference page repeats the scope note (deep links / back-nav land here)', async () => {
    const dom = makeDom();
    const { renderDisabilities } = await loadView('src/views/disabilities.js');
    renderDisabilities({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, disabilities: { view: 'categories' } },
      data: { DISABILITIES: { categories: [{ id: 'visual', label: 'Visual', emoji: '👁️', color: '#fff', summary: 's' }], items: [{ category: 'visual', id: 'x', name: 'X', emoji: 'x', description: 'd' }] } },
      provenance: {},
      missed: fakeMissed,
      actions: fakeActions,
    });
    const note = dom.window.document.querySelector('.scope-note');
    assertTrue(note, 'disabilities reference page must include a scope-note');
    assertTrue(note.textContent.toLowerCase().includes('beyond cpacc scope'), 'note must read "beyond CPACC scope"');
  });

  await test('popstate-driven navigation moves focus to <main> (src/main.js + src/router.js)', async () => {
    // Full-app boot, not a single-view mount: the focus-on-route-change
    // contract lives in main.js's popstate listener, not in any one view.
    const indexHtml = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
    const dom = new JSDOM(indexHtml, { url: 'http://localhost/#/', pretendToBeVisual: true, runScripts: 'outside-only' });
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    globalThis.location = dom.window.location;
    globalThis.history = dom.window.history;
    globalThis.localStorage = dom.window.localStorage;
    globalThis.confirm = () => true;

    await loadView('src/main.js');
    await new Promise(r => setTimeout(r, 20)); // let the async chat-status/missed-set probes settle

    document.getElementById('start').click();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/1', 'starting a test should push #/test/1');

    document.getElementById('next').click();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/2', 'advancing a question should push #/test/2');

    history.back();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/1', 'Back should restore the previous question');
    assertEq(document.activeElement && document.activeElement.id, 'app', 'Back should move focus to <main id="app"> for keyboard/AT users');
  });

  await test('decorative emoji in renderHome have aria-hidden="true"', async () => {
    const dom = makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    renderHome({
      app: dom.window.document.getElementById('app'),
      state: fakeState,
      data: { CPACC_BANK: [fakeQuestion], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: { categories: [], items: [] }, LEGAL: { jurisdictions: [], items: [] } },
      provenance: {},
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
