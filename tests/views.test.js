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
//   - skip link is present in index.html shell, header/nav landmarks wrap it
//     and the home button, #route-status stays a sibling of #app
//   - chat messages carry a non-color speaker label (WCAG 1.4.1)
//   - jump-grid answered mark is a non-color cue that doesn't leak into
//     the accessible name (WCAG 1.4.1)

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
  clearHomeChat() {}, sendChat: async () => {}, announce() {},
};

// Full-app boot helper (index.html + src/main.js), for tests that need the
// real router/focus/live-region wiring rather than a single mounted view.
// Cache-busts the src/main.js import so each call gets a fresh module
// instance — Node's dynamic import() caches by exact specifier, and
// main.js runs its boot side effects (reading globalThis.document, adding
// the popstate listener, etc.) at import time, so reusing the cached
// instance across tests would silently skip all of that on every call
// after the first.
//
// Also stubs window.scrollTo, which jsdom doesn't implement (Part 2): the
// production call in src/main.js's moveFocusToRoute is correct, jsdom just
// logs "Not implemented" to its virtual console instead of throwing, and
// three stack traces per boot bury real failures in the test output.
let _bootCounter = 0;
async function bootApp(hash = '#/') {
  const indexHtml = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
  const dom = new JSDOM(indexHtml, { url: `http://localhost/${hash}`, pretendToBeVisual: true, runScripts: 'outside-only' });
  dom.window.scrollTo = () => {};
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.location = dom.window.location;
  globalThis.history = dom.window.history;
  globalThis.localStorage = dom.window.localStorage;
  globalThis.confirm = () => true;
  // src/views/question.js's submit-answer handler calls the bare identifier
  // requestAnimationFrame(...) — valid in a real browser, where `window` IS
  // the global object, but not in this harness, where `window` is a jsdom
  // object distinct from Node's globalThis. Forward it (and its pair) the
  // same way `window`/`document`/etc. are forwarded above, so the app code
  // doesn't need `window.requestAnimationFrame` to run under Node.
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);

  const mainUrl = `${url.pathToFileURL(path.join(HERE, '..', 'src/main.js')).href}?boot=${_bootCounter++}`;
  await import(mainUrl);
  await new Promise(r => setTimeout(r, 20)); // let the async chat-status/missed-set probes settle
  return dom;
}

// Stubs globalThis.fetch for exactly one test, matching requests by simple
// substring (checked in array order — put more specific paths like
// '/chat-status' before broader ones like '/chat' so they don't shadow each
// other). Returns a restore function; callers MUST call it in a `finally`
// so a later test (in this file or one that runs after it — the whole
// suite shares one process) doesn't see a stubbed fetch.
function stubFetch(handlers) {
  const original = globalThis.fetch;
  globalThis.fetch = async (input, opts) => {
    const url = String(input);
    for (const [match, handler] of handlers) {
      if (url.includes(match)) return handler(opts);
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  return () => { globalThis.fetch = original; };
}

export async function run({ test, assertTrue, assertEq }) {
  await test('index.html shell has skip link, home button, and main with tabindex -1', () => {
    const html = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    assertTrue(doc.querySelector('a.skip-link'), 'no skip link');

    // The Home button's aria-label was deliberately removed: it duplicated
    // the visible "⌂ Home" text for no benefit, and an aria-label always
    // wins over visible text for the accessible name — leaving it in place
    // risked the two silently drifting apart (WCAG 2.5.3 Label in Name).
    // The visible text is now the sole source of the accessible name, with
    // the decorative glyph pulled out of it via aria-hidden.
    const homeBtn = doc.querySelector('#home-btn');
    assertTrue(homeBtn, 'no home button');
    assertEq(homeBtn.hasAttribute('aria-label'), false, 'home button must not carry aria-label — its visible text is now the accessible name');
    assertTrue(homeBtn.textContent.includes('Home'), 'home button visible text should read "Home"');
    const glyph = homeBtn.querySelector('span[aria-hidden="true"]');
    assertTrue(glyph, 'the ⌂ glyph must be wrapped in an aria-hidden span so it does not leak into the accessible name');
    assertTrue(glyph.textContent.includes('⌂'), 'the aria-hidden span should contain the ⌂ glyph');

    const main = doc.querySelector('main#app');
    assertTrue(main, 'no main#app');
    assertEq(main.getAttribute('tabindex'), '-1', 'main not focusable for skip link');
  });

  await test('index.html shell: skip link + home button live in <header>/<nav aria-label="Site">, and #route-status is a sibling of #app, not inside <header> or <main>', () => {
    const html = fs.readFileSync(path.join(HERE, '..', 'index.html'), 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const header = doc.querySelector('header');
    assertTrue(header, 'no <header> landmark');
    assertTrue(header.querySelector('a.skip-link'), 'skip link should live inside <header>');

    const nav = header.querySelector('nav[aria-label="Site"]');
    assertTrue(nav, 'no <nav aria-label="Site"> inside <header>');
    assertTrue(nav.querySelector('#home-btn'), 'home button should live inside <nav aria-label="Site">');

    // Load-bearing: every view render does `app.innerHTML = ...`, which
    // would destroy #route-status if it lived inside <main id="app">. It
    // also has no business inside <header> — it announces route changes,
    // not site navigation. It must be a sibling of #app instead.
    const main = doc.querySelector('main#app');
    const routeStatus = doc.getElementById('route-status');
    assertTrue(routeStatus, 'no #route-status element');
    assertEq(main.contains(routeStatus), false, '#route-status must not be inside <main id="app"> — app.innerHTML rewrites would destroy it');
    assertEq(header.contains(routeStatus), false, '#route-status must not be inside <header>');
    assertEq(routeStatus.parentElement, main.parentElement, '#route-status must be a sibling of #app (share the same parent)');
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

  await test('renderQuestion: fieldset/legend choices group, kbd-hint, verdict region, aria-describedby resolves', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, pending: {} },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;

    // h1 / heading hierarchy — the h1 must identify the specific question
    // (not just the app name), since it's the route-focus target a screen
    // reader user lands on after every Next/Prev/jump-grid step. The app
    // name demotes to the .sub line instead.
    assertEq(doc.querySelectorAll('h1').length, 1);
    assertEq(doc.querySelector('h1').textContent, 'Question 1 of 1');

    // #choices is a native <fieldset> — implicit role=group, named by its
    // <legend> — not an ARIA radiogroup with aria-label. A <label>-less
    // radiogroup relies on authors remembering aria-label/aria-labelledby;
    // a fieldset/legend can't be forgotten the same way and degrades
    // gracefully with no ARIA at all.
    const rg = doc.getElementById('choices');
    assertTrue(rg, 'no choices container');
    assertEq(rg.tagName, 'FIELDSET', 'choices container should be a native <fieldset>');
    const legend = rg.querySelector('legend');
    assertTrue(legend, 'fieldset needs a <legend> to name the group');
    assertTrue(legend.textContent.toLowerCase().includes('question 1'), 'legend should name the question');
    const desc = rg.getAttribute('aria-describedby');
    assertEq(desc, 'kbd-hint');
    assertTrue(doc.getElementById('kbd-hint'), 'aria-describedby target missing');

    // verdict is focusable but NOT a pre-populated live region: it's empty
    // in this same-innerHTML-write render (nothing revealed yet), and even
    // when populated (see the "aria-disabled" rewrite below) a live region
    // created with its content already in place never announces — the
    // announcement goes through actions.announce() (#route-status)
    // instead. See src/main.js's announce() and question.js's submit
    // handler.
    const v = doc.getElementById('verdict');
    assertTrue(v, 'no verdict region');
    assertEq(v.getAttribute('tabindex'), '-1');
    assertEq(v.hasAttribute('aria-live'), false, 'verdict must not be a live region — it is pre-populated by the same innerHTML write, so aria-live would never fire');

    // Progress counter is plain text — intentionally NOT a live region.
    // (Per accessibility-lead Phase 6 review: only one polite live region
    // per view to avoid dueling announcements with #verdict.)
    const sub = doc.querySelector('.sub');
    assertTrue(sub, 'progress counter missing');
    assertEq(sub.hasAttribute('aria-live'), false, 'counter should not be a live region');
    assertEq(sub.hasAttribute('role'), false, 'counter should not carry role=status');
    assertTrue(sub.textContent.includes('CPACC Practice Test'), 'the app name demotes to the .sub line, not the h1');

    // 4 radios
    assertEq(doc.querySelectorAll('input[type="radio"][name="choice"]').length, 4);
  });

  await test('renderQuestion makes revealed choices genuinely inert via <fieldset disabled>, restoring the picked/correct state as sr-only text', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      // fakeQuestion.answer is 'A'; picking 'B' exercises both the "your
      // answer" (B, wrong) and "correct answer" (A) sr-only branches.
      state: { ...fakeState, answers: { 1: 'B' }, revealed: { 1: true } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;

    // The fieldset itself carries native `disabled`, which cascades to every
    // control inside it — this is what makes revealed choices genuinely
    // inert (unlike the old per-radio aria-disabled, which left them
    // focusable/actionable to assistive tech despite looking disabled).
    const fieldset = doc.getElementById('choices');
    assertTrue(fieldset, 'no choices container');
    assertTrue(fieldset.hasAttribute('disabled'), 'fieldset should be disabled once the answer is revealed');

    // No individual radio should carry the old aria-disabled workaround —
    // the fieldset's native disabled state already does the job.
    const radios = doc.querySelectorAll('input[type="radio"][name="choice"]');
    assertEq(radios.length, 4);
    for (const r of radios) {
      assertEq(r.hasAttribute('aria-disabled'), false, 'radios must not carry the old aria-disabled workaround');
    }

    // Native `disabled` removes a control from the accessibility tree's
    // interactive state, which would otherwise silently drop the "which
    // one did I pick" / "which one was correct" signal. That's restored as
    // visually-hidden text alongside the affected choice(s).
    const labels = doc.querySelectorAll('#choices .choice');
    const byLetter = {};
    labels.forEach((lbl, i) => { byLetter[["A","B","C","D"][i]] = lbl; });
    assertTrue(byLetter.B.querySelector('.sr-only').textContent.includes('Your answer.'), 'the picked (wrong) choice needs "Your answer." sr-only text');
    assertTrue(byLetter.A.querySelector('.sr-only').textContent.includes('Correct answer.'), 'the correct choice needs "Correct answer." sr-only text');
    assertTrue(!byLetter.C.querySelector('.sr-only'), 'an unrelated choice should carry no sr-only state text');
    assertTrue(!byLetter.D.querySelector('.sr-only'), 'an unrelated choice should carry no sr-only state text');
  });

  await test('renderQuestion: sr-only state text reads "Your answer. Correct." when the picked choice is also correct', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      // fakeQuestion.answer is 'A' — picking it merges the "your answer"
      // and "correct answer" branches into one sr-only string.
      state: { ...fakeState, answers: { 1: 'A' }, revealed: { 1: true } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const labels = doc.querySelectorAll('#choices .choice');
    const a = labels[0]; // letter A
    assertTrue(a.querySelector('.sr-only').textContent.includes('Your answer. Correct.'), 'a correct pick should read "Your answer. Correct."');
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

  await test('renderQuestion: h1 text differs between question indices (WCAG 2.4.6 — the route-focus target must identify which question, not just repeat the app name)', async () => {
    const twoQuestions = [
      fakeQuestion,
      { ...fakeQuestion, id: 2, q: 'What is Y?' },
    ];

    const domFirst = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    renderQuestion({
      app: domFirst.window.document.getElementById('app'),
      state: { ...fakeState, questions: twoQuestions, index: 0 },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const h1First = domFirst.window.document.querySelector('h1').textContent;

    const domSecond = makeDom();
    renderQuestion({
      app: domSecond.window.document.getElementById('app'),
      state: { ...fakeState, questions: twoQuestions, index: 1 },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const h1Second = domSecond.window.document.querySelector('h1').textContent;

    assertTrue(h1First !== h1Second, 'h1 must change between questions, or a screen reader user stepping through the test hears the same heading every time');
    assertEq(h1First, 'Question 1 of 2');
    assertEq(h1Second, 'Question 2 of 2');
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

  await test('renderFlashcards: #card is a plain container (not a button) so its text is reachable; #flip-card is the real keyboard control', async () => {
    const dom = makeDom();
    const { renderFlashcards } = await loadView('src/views/flashcards.js');
    renderFlashcards({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, flashcards: { cards: [{ id: 1, tag: 't', front: 'F', back: 'B' }], index: 0, flipped: false } },
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const card = doc.getElementById('card');
    assertTrue(card, 'card container missing');
    // A button (or any element with aria-label/aria-pressed) computes its
    // accessible name from the label attribute alone, which swallows the
    // card's actual content — front/back text and tag became invisible to
    // screen readers. #card must be a plain container whose content is
    // ordinary navigable text instead.
    assertTrue(card.tagName !== 'BUTTON', '#card must not be a <button>');
    assertEq(card.hasAttribute('aria-label'), false, '#card must not carry aria-label — it would swallow the card content');
    assertEq(card.hasAttribute('aria-pressed'), false, '#card must not carry aria-pressed — it is not a toggle button');
    assertTrue(card.textContent.includes('F'), 'front text should be reachable as ordinary text content');
    const side = card.querySelector('.sr-only');
    assertTrue(side, 'card needs an sr-only side indicator');
    assertEq(side.textContent, 'Front of card');
    // The real, keyboard-operable control.
    const flip = doc.getElementById('flip-card');
    assertTrue(flip, '#flip-card control missing');
    assertEq(flip.tagName, 'BUTTON', '#flip-card should be a real button');
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
    // <summary> maps to role=button, which takes its accessible name from
    // its CONTENT. An aria-label here would override that and suppress
    // the visible provenance label + confidence level from the name,
    // failing WCAG 2.5.3 Label in Name (speech-input users say what they
    // see, and what they see wouldn't be in the name). The name must come
    // from the summary's own text content instead — the visible label,
    // the confidence word, and a trailing .sr-only suffix that
    // disambiguates repeated badges across a page.
    assertEq(summary.hasAttribute('aria-label'), false, 'summary must not carry aria-label — it would suppress the visible label/confidence from the accessible name');
    assertTrue(summary.textContent.includes(prov.label), 'summary text should include the visible provenance label');
    assertTrue(summary.textContent.toLowerCase().includes('high'), 'summary text should include the confidence word');
    assertTrue(summary.textContent.includes('Question 1'), 'summary text should include the disambiguating item label');
    const srSuffix = summary.querySelector('.sr-only');
    assertTrue(srSuffix, 'summary needs a .sr-only suffix carrying the item label');
    assertTrue(srSuffix.textContent.includes('Question 1'), 'the .sr-only suffix should carry the item label');
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

  await test('click- and popstate-driven navigation moves focus to the route\'s <h1> inside #app, not <body> or bare #app (src/main.js + src/router.js)', async () => {
    // Full-app boot, not a single-view mount: the focus-on-route-change
    // contract lives in main.js's popstate listener and render(), not in
    // any one view. Focus now correctly lands on the route's <h1> (which
    // has no id), so checking `.id === 'app'` would always be empty —
    // assert element identity instead.
    await bootApp('#/');
    const app = document.getElementById('app');

    function assertFocusOnRouteH1(msg) {
      const el = document.activeElement;
      assertTrue(el, `${msg}: nothing focused`);
      assertTrue(app.contains(el), `${msg}: focus should be inside #app`);
      assertEq(el.tagName, 'H1', `${msg}: focus should be the route's <h1>`);
    }

    // This is the exact gap that let ~20 navigation paths ship dropping
    // focus to <body>: the previous suite only ever asserted location.hash
    // after these clicks, never where focus went.
    document.getElementById('start').click();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/1', 'starting a test should push #/test/1');
    assertFocusOnRouteH1('after starting a test');

    document.getElementById('next').click();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/2', 'advancing a question should push #/test/2');
    assertFocusOnRouteH1('after clicking next');

    history.back();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/1', 'Back should restore the previous question');
    assertFocusOnRouteH1('after Back');
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

  // ---- WCAG 1.4.1 color-independence coverage: chat speaker labels, jump-grid answered mark ----

  await test('renderChatFragment: each role gets its WCAG 1.4.1 speaker label; message content is escaped, the label is not', async () => {
    const { renderChatFragment } = await loadView('src/views/chat.js');
    const chat = {
      history: [
        { role: 'user', content: '<b>ignore me</b> what does POUR mean?' },
        { role: 'assistant', content: 'POUR = Perceivable, Operable, Understandable, Robust.' },
        { role: 'error', content: 'Something went wrong.' },
      ],
    };
    const html = renderChatFragment(fakeQuestion, chat);
    const dom = makeDom();
    const wrap = dom.window.document.createElement('div');
    wrap.innerHTML = html;
    const msgs = wrap.querySelectorAll('.msg');
    assertEq(msgs.length, 3, 'expected one .msg per history entry');

    const expected = [['user', 'You:'], ['assistant', 'Tutor:'], ['error', 'Error:']];
    expected.forEach(([role, label], i) => {
      const msg = msgs[i];
      assertTrue(msg.classList.contains(role), `message ${i} should carry the .${role} class`);
      const roleEl = msg.querySelector('b.msg-role');
      assertTrue(roleEl, `message ${i} missing <b class="msg-role">`);
      assertEq(roleEl.textContent, label, `message ${i} label mismatch`);
    });

    // Content is escaped — the literal "<b>" from history[0].content must
    // survive as visible text, not become a real element. If it were
    // unescaped it would parse as markup and disappear from textContent,
    // and a second <b> (beyond .msg-role) would appear in the DOM.
    assertTrue(msgs[0].textContent.includes('<b>ignore me</b>'), 'message content must be escapeHtml-escaped, not parsed as markup');
    assertEq(msgs[0].querySelectorAll('b').length, 1, 'only the .msg-role <b> should exist — an unescaped content <b> would add a second one');
  });

  await test('renderHome: home chat carries the same WCAG 1.4.1 speaker labels for all three roles, content escaped', async () => {
    const dom = makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    const state = {
      ...fakeState,
      chatEnabled: true,
      homeChat: {
        history: [
          { role: 'user', content: 'What is <script>alert(1)</script>?' },
          { role: 'assistant', content: 'A definition.' },
          { role: 'error', content: 'Network error.' },
        ],
      },
    };
    renderHome({
      app: dom.window.document.getElementById('app'),
      state,
      data: { CPACC_BANK: [fakeQuestion], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: { categories: [], items: [] }, LEGAL: { jurisdictions: [], items: [] } },
      provenance: {},
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const log = doc.getElementById('home-log');
    assertTrue(log, 'home chat log missing (chatEnabled: true should render the chat panel)');
    const msgs = log.querySelectorAll('.msg');
    assertEq(msgs.length, 3, 'expected one .msg per history entry');

    const expected = [['user', 'You:'], ['assistant', 'Tutor:'], ['error', 'Error:']];
    expected.forEach(([role, label], i) => {
      assertTrue(msgs[i].classList.contains(role), `message ${i} should carry the .${role} class`);
      const roleEl = msgs[i].querySelector('b.msg-role');
      assertTrue(roleEl, `message ${i} missing <b class="msg-role">`);
      assertEq(roleEl.textContent, label, `message ${i} label mismatch`);
    });

    assertTrue(msgs[0].textContent.includes('<script>alert(1)</script>'), 'message content must be escaped, not parsed as markup');
    assertEq(msgs[0].querySelectorAll('script').length, 0, 'escaped content must not create a real <script> element');
  });

  await test('renderJumpGrid: answered mark differs from unanswered, lives inside an aria-hidden span, and does not leak into the button aria-label', async () => {
    const dom = makeDom();
    const { renderQuestion } = await loadView('src/views/question.js');
    const twoQuestions = [fakeQuestion, { ...fakeQuestion, id: 2, q: 'What is Y?' }];
    renderQuestion({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, questions: twoQuestions, index: 0, answers: { 1: 'A' }, revealed: { 1: true } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const cells = doc.querySelectorAll('#jump .cell');
    assertEq(cells.length, 2, 'expected one cell per question');
    const [answeredCell, unansweredCell] = cells;

    const answeredGlyphSpan = answeredCell.querySelector('span[aria-hidden="true"]');
    const unansweredGlyphSpan = unansweredCell.querySelector('span[aria-hidden="true"]');
    assertTrue(answeredGlyphSpan, 'answered cell missing aria-hidden glyph span');
    assertTrue(unansweredGlyphSpan, 'unanswered cell missing aria-hidden glyph span');

    assertTrue(answeredGlyphSpan.textContent.includes('✓'), 'answered cell glyph should include ✓');
    assertTrue(unansweredGlyphSpan.textContent.includes('·'), 'unanswered cell glyph should include ·');
    assertTrue(answeredGlyphSpan.textContent !== unansweredGlyphSpan.textContent, 'glyphs must differ between answered and unanswered cells');

    // Critically: the glyph must not leak into the accessible name — the
    // button's aria-label stays exactly "Question N, answered/unanswered",
    // sourced separately from the aria-hidden span's content.
    assertEq(answeredCell.getAttribute('aria-label'), 'Question 1, answered');
    assertEq(unansweredCell.getAttribute('aria-label'), 'Question 2, unanswered');
    assertTrue(!answeredCell.getAttribute('aria-label').includes('✓'), 'aria-label must not contain the glyph');
    assertTrue(!unansweredCell.getAttribute('aria-label').includes('·'), 'aria-label must not contain the glyph');
  });

  await test('renderJumpGrid: exactly one cell carries aria-current="true" — the cell for state.index — and it moves when the index changes (WCAG 1.4.1: this attribute is also the ONLY visual indicator, via .cell[aria-current] in app.css)', async () => {
    const threeQuestions = [fakeQuestion, { ...fakeQuestion, id: 2, q: 'What is Y?' }, { ...fakeQuestion, id: 3, q: 'What is Z?' }];
    const { renderQuestion } = await loadView('src/views/question.js');

    const domA = makeDom();
    renderQuestion({
      app: domA.window.document.getElementById('app'),
      state: { ...fakeState, questions: threeQuestions, index: 1 },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const currentA = domA.window.document.querySelectorAll('#jump .cell[aria-current="true"]');
    assertEq(currentA.length, 1, 'exactly one jump-grid cell should carry aria-current="true"');
    assertEq(currentA[0].dataset.i, '1', 'the aria-current cell should be the one for state.index (1)');

    // Re-render at a different index — aria-current must move with it, not
    // stick to the first cell or disappear.
    const domB = makeDom();
    renderQuestion({
      app: domB.window.document.getElementById('app'),
      state: { ...fakeState, questions: threeQuestions, index: 2 },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const currentB = domB.window.document.querySelectorAll('#jump .cell[aria-current="true"]');
    assertEq(currentB.length, 1, 'exactly one jump-grid cell should carry aria-current="true" after the index changes');
    assertEq(currentB[0].dataset.i, '2', 'the aria-current cell should follow state.index (now 2)');
  });

  await test('regression guard: chat role and jump-grid answered state are distinguishable by something other than a class/color alone (WCAG 1.4.1)', async () => {
    // The original defect in both places was that `.msg.user` vs
    // `.msg.assistant` and `.cell.answered` vs `.cell` differed only by
    // class name (and therefore only by color) — nothing a screen reader
    // user or someone who can't perceive the color difference could sense
    // was different. This test would fail if either fix were reverted to
    // "just add a class back" instead of restoring a genuinely perceivable
    // (here: textual) cue, because it never inspects the class list —
    // only rendered text content.
    const { renderChatFragment } = await loadView('src/views/chat.js');
    const chatHtml = renderChatFragment(fakeQuestion, {
      history: [
        { role: 'user', content: 'a question' },
        { role: 'assistant', content: 'an answer' },
      ],
    });
    const chatDom = makeDom();
    const wrap = chatDom.window.document.createElement('div');
    wrap.innerHTML = chatHtml;
    const [userMsg, assistantMsg] = wrap.querySelectorAll('.msg');
    assertTrue(userMsg.textContent.trim().startsWith('You:'), 'user message text alone must announce the speaker');
    assertTrue(assistantMsg.textContent.trim().startsWith('Tutor:'), 'assistant message text alone must announce the speaker');
    assertTrue(userMsg.textContent.slice(0, 10) !== assistantMsg.textContent.slice(0, 10), 'the two messages must read differently by text alone');

    const { renderQuestion } = await loadView('src/views/question.js');
    const gridDom = makeDom();
    const twoQuestions = [fakeQuestion, { ...fakeQuestion, id: 2, q: 'What is Y?' }];
    renderQuestion({
      app: gridDom.window.document.getElementById('app'),
      state: { ...fakeState, questions: twoQuestions, index: 0, answers: { 1: 'A' }, revealed: { 1: true } },
      missed: fakeMissed,
      actions: fakeActions,
    });
    const [answeredCell, unansweredCell] = gridDom.window.document.querySelectorAll('#jump .cell');
    assertTrue(answeredCell.textContent.trim() !== unansweredCell.textContent.trim(), 'jump-grid cells must read differently by text alone, independent of the .answered class/color');
  });

  // ---- Part 3: coverage that let the focus/heading/skip-link bugs ship green ----

  await test('activating the skip link does not navigate away from the current route (regression)', async () => {
    // Regression for the critical bug: href="#app" is kept only as a
    // no-JS fallback. With JS active, main.js intercepts the click and
    // calls e.preventDefault() specifically so it never reaches
    // location.hash — letting it through used to fire a popstate for a
    // hash applyPath can't resolve to any route, which fell through to
    // "unknown route" and bounced a mid-test user to home.
    await bootApp('#/');
    const app = document.getElementById('app');

    document.getElementById('start').click();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/test/1', 'sanity: test started');

    const skip = document.getElementById('skip-link');
    assertTrue(skip, 'no #skip-link');
    // A real, dispatched click (not calling .onclick directly) so the
    // browser's native default action for an <a href="#app"> is actually
    // exercised and has to be prevented, same as a real activation.
    skip.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 5));

    assertEq(location.hash, '#/test/1', 'skip link must not change the route — it must still be #/test/1');
    const el = document.activeElement;
    assertTrue(app.contains(el), 'skip link should move focus into #app');
    assertEq(el.tagName, 'H1', 'skip link should move focus to the route\'s <h1>');
  });

  await test('a raw popstate for a non-route hash like "#app" does not reset the app to home (regression)', async () => {
    // jsdom may not fire popstate on fragment activation the way Chromium
    // does, so the skip-link test above can't be trusted alone to exercise
    // main.js's popstate guard (`if (hash !== '' && !hash.startsWith('#/'))
    // return;`). Dispatch the popstate directly to test that guard in
    // isolation, independent of whether jsdom's <a> activation behavior
    // fires one on its own.
    await bootApp('#/');

    document.getElementById('start').click();
    await new Promise(r => setTimeout(r, 5));
    assertTrue(document.getElementById('choices'), 'sanity: mid-test, question view mounted');

    window.location.hash = 'app';
    window.dispatchEvent(new window.PopStateEvent('popstate', { state: null }));
    await new Promise(r => setTimeout(r, 5));

    assertTrue(document.getElementById('choices'), 'app must still show the in-progress test, not have reset to home');
    assertEq(document.getElementById('start'), null, 'home view must not have been rendered for a "#app" popstate');
  });

  await test('focus restoration: disabling #prev-card on flip to card 1 lands focus on #next-card, not <body>', async () => {
    // Subtle infrastructure (captureFocus/restoreFocus/nearestFocusableSibling
    // in src/main.js) that rots silently without a test: when the focused
    // control disables itself as a side effect of the click that triggered
    // it, the old node is already gone by the time focus restoration runs,
    // and doing nothing would drop focus to <body> — exactly the bug this
    // file exists to prevent, just at the boundary instead of the middle.
    await bootApp('#/');
    document.getElementById('start-flashcards').click();
    await new Promise(r => setTimeout(r, 30)); // startFlashcards lazy-imports sampling.js
    assertEq(location.hash, '#/flashcards', 'sanity: flashcards started');

    document.getElementById('next-card').click();
    await new Promise(r => setTimeout(r, 5)); // now on card 2; #prev-card enabled

    const prevCard = document.getElementById('prev-card');
    assertTrue(prevCard && !prevCard.disabled, 'sanity: #prev-card enabled on card 2');
    prevCard.focus();
    prevCard.click(); // back to card 1 -> #prev-card disables itself
    await new Promise(r => setTimeout(r, 5));

    const el = document.activeElement;
    assertTrue(el !== document.body, 'focus must not fall to <body> when #prev-card disables itself');
    assertEq(el && el.id, 'next-card', 'focus should land on the nearest focusable sibling, #next-card');
  });

  await test('focus restoration: #prev disabling itself on question-view navigation still does not drop focus to <body> (it lands on the route h1 instead)', async () => {
    // Same underlying worry as the flashcards case above — does a control
    // disabling itself as a side effect of its own click drop focus to
    // <body>? — but a DIFFERENT resolution here: unlike the flashcard
    // index, the question index is part of main.js's routeKey (see
    // src/router.js's comment: "stepping between questions is a real
    // navigation axis"), so clicking #prev/#next is treated as a real
    // navigation and unconditionally moves focus to the route's <h1> via
    // moveFocusToRoute(), never reaching the captureFocus/restoreFocus /
    // nearestFocusableSibling fallback path at all. Asserting that
    // fallback path's target (#next) here would be wrong — it would
    // encode a behavior the app doesn't have. What's actually being
    // guarded is the same outcome the flashcards test guards: focus must
    // not end up on <body>.
    await bootApp('#/');
    document.getElementById('start').click();
    await new Promise(r => setTimeout(r, 5)); // question 1; #prev disabled

    document.getElementById('next').click();
    await new Promise(r => setTimeout(r, 5)); // question 2; #prev enabled

    const app = document.getElementById('app');
    const prev = document.getElementById('prev');
    assertTrue(prev && !prev.disabled, 'sanity: #prev enabled on question 2');
    prev.focus();
    prev.click(); // back to question 1 -> #prev disables itself
    await new Promise(r => setTimeout(r, 5));

    const el = document.activeElement;
    assertTrue(el !== document.body, 'focus must not fall to <body> when #prev disables itself');
    assertTrue(app.contains(el), 'focus should land inside #app');
    assertEq(el.tagName, 'H1', 'question-view navigation always moves focus to the route h1, even when triggered by a control that disables itself');
  });

  // Collects heading tags in document order and reports whether the
  // outline ever jumps more than one level deeper at once (e.g. h1 -> h3
  // with no h2 between). Doesn't check for *shallower* jumps (h3 -> h1 is
  // fine — that's just starting a new section) since that's not what
  // "skipped level" means for WCAG 1.3.1 / 2.4.6 purposes.
  function headingOutlineHasNoSkips(root) {
    const levels = [...root.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName[1]));
    let prev = 0;
    for (const lvl of levels) {
      if (lvl > prev + 1) return false;
      prev = lvl;
    }
    return true;
  }

  await test('renderDisabilities detail view ({view:"list"}) has exactly one visible h1 and no skipped heading levels', async () => {
    const dom = makeDom();
    const { renderDisabilities } = await loadView('src/views/disabilities.js');
    renderDisabilities({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, disabilities: { view: 'list', category: 'visual' } },
      data: {
        DISABILITIES: {
          categories: [{ id: 'visual', label: 'Visual', emoji: '👁️', color: '#0af', summary: 'Vision-related disabilities.' }],
          items: [{
            category: 'visual', id: 'low-vision', name: 'Low vision', emoji: '👓',
            description: 'Reduced visual acuity even with correction.',
            keyFacts: ['Affects reading and navigation.'],
            a11ySolutions: ['Support text resizing and high contrast.'],
            prevalence: '2B+ globally',
          }],
        },
      },
      provenance: {},
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const h1s = doc.querySelectorAll('h1');
    assertEq(h1s.length, 1, 'expected exactly one h1 on the disabilities detail view');
    assertEq(h1s[0].classList.contains('sr-only'), false, 'the route-focus target h1 must be visible, not sr-only');
    assertTrue(headingOutlineHasNoSkips(doc), 'heading outline must not skip a level (h1 -> h2 -> h3)');
  });

  await test('renderLegal detail view ({view:"list"}) has exactly one visible h1 and no skipped heading levels', async () => {
    const dom = makeDom();
    const { renderLegal } = await loadView('src/views/legal.js');
    renderLegal({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, legal: { view: 'list', category: 'us' } },
      data: {
        LEGAL: {
          jurisdictions: [{ id: 'us', label: 'United States', emoji: '🇺🇸', color: '#036', summary: 'US disability law.' }],
          items: [{
            id: 'ada', jurisdiction: 'us', name: 'Americans with Disabilities Act', year: '1990', type: 'Statute',
            summary: 'Civil rights law prohibiting discrimination based on disability.',
            keyFacts: ['Covers employment, public accommodations, and telecommunications.'],
            cpacc: true,
          }],
        },
      },
      provenance: {},
      missed: fakeMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const h1s = doc.querySelectorAll('h1');
    assertEq(h1s.length, 1, 'expected exactly one h1 on the legal detail view');
    assertEq(h1s[0].classList.contains('sr-only'), false, 'the route-focus target h1 must be visible, not sr-only');
    assertTrue(headingOutlineHasNoSkips(doc), 'heading outline must not skip a level (h1 -> h2 -> h3)');
  });

  // ---- #/accessibility — the accessibility statement page (static content) ----

  await test('renderAccessibility: exactly one visible h1 (not sr-only) as the route-focus target, and the heading outline has no skipped levels', async () => {
    // This branch's governing rule — set by the disabilities/legal detail
    // route fixes above — is that the route-focus target h1 must be
    // visible, not sr-only. Pinning it here too so a future author copying
    // this page's structure can't silently regress it.
    const dom = makeDom();
    const { renderAccessibility } = await loadView('src/views/accessibility.js');
    renderAccessibility({ app: dom.window.document.getElementById('app') });
    const doc = dom.window.document;
    const h1s = doc.querySelectorAll('h1');
    assertEq(h1s.length, 1, 'expected exactly one h1 on the accessibility statement page');
    assertEq(h1s[0].classList.contains('sr-only'), false, 'the route-focus target h1 must be visible, not sr-only');
    assertTrue(headingOutlineHasNoSkips(doc), 'heading outline must not skip a level (h1 -> h2 -> h3)');
  });

  await test('renderAccessibility: Feedback section has a working mailto: link to tawsif@perenniala11y.com, not the "not yet published" placeholder copy', async () => {
    // The statement's whole purpose depends on a working report route. This
    // guards against FEEDBACK_CONTACT in src/views/accessibility.js being
    // reset to null/empty and the page silently shipping with placeholder
    // copy instead of a real contact.
    const dom = makeDom();
    const { renderAccessibility } = await loadView('src/views/accessibility.js');
    renderAccessibility({ app: dom.window.document.getElementById('app') });
    const doc = dom.window.document;
    const mailLink = doc.querySelector('a[href="mailto:tawsif@perenniala11y.com"]');
    assertTrue(mailLink, 'accessibility statement must contain a mailto: link to tawsif@perenniala11y.com');
    assertTrue(
      !doc.body.textContent.includes('A public contact route for accessibility feedback is not yet published'),
      'placeholder copy ("A public contact route ... is not yet published") must not ship once a real contact exists'
    );
  });

  await test('renderHome: links to the accessibility statement (#/accessibility) with descriptive link text', async () => {
    // A statement nobody can find is not a feedback mechanism.
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
    const link = doc.querySelector('a[href="#/accessibility"]');
    assertTrue(link, 'renderHome must contain a link to #/accessibility');
    const text = link.textContent.trim();
    assertTrue(text.length > 0, 'the #/accessibility link must have visible text');
    const lower = text.toLowerCase();
    const ambiguous = ['click here', 'read more', 'here', 'learn more', 'more info'];
    assertTrue(!ambiguous.some(bad => lower === bad || lower.includes(bad)), `link text must be descriptive (WCAG 2.4.4), not ambiguous boilerplate — got "${text}"`);
  });

  await test('booted app: activating the home page\'s "Accessibility statement" link actually renders #/accessibility end to end — proves main.js\'s render dispatcher and titleFor both wire the route, not just that the view mounts in isolation or that applyPath maps the path', async () => {
    // The isolation-mounted renderAccessibility test above and router.test.js's
    // applyPath tests each prove one half of the wiring. Neither proves
    // main.js's render() dispatcher and titleFor() actually connect them:
    // deleting the `case 'accessibility':` line from both left the suite
    // green because nothing drove a real navigation through main.js to
    // #/accessibility. Driving it through the real home-page link (rather
    // than setting location.hash directly) also proves the link itself
    // works end to end, not just that the route exists.
    await bootApp('#/');
    const link = document.querySelector('a[href="#/accessibility"]');
    assertTrue(link, 'sanity: home page must have a link to #/accessibility');

    link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 20));

    assertEq(location.hash, '#/accessibility', 'sanity: activating the link should navigate to #/accessibility');

    const h1 = document.querySelector('h1');
    assertTrue(h1, 'expected an h1 to render');
    assertEq(h1.textContent, 'Accessibility statement', 'the rendered h1 must be the statement\'s heading, not home\'s "CPACC Practice Test" — this fails if main.js\'s render() dispatcher silently falls through to renderHome for the accessibility view');
    assertEq(document.title, 'Accessibility statement — CPACC Practice Test', 'document.title must be the statement\'s unique title, not the generic home title — this fails if titleFor() drops its accessibility case');
    assertEq(document.activeElement, h1, 'focus must land on the route\'s h1, consistent with this branch\'s focus contract for every other route — proves the new route participates in that contract rather than merely rendering');
  });

  // ---- Chat transcripts are explicitly non-live (role="log" + aria-live="off") ----

  await test('chat transcripts (#home-log and #log-<id>) carry role="log" AND an explicit aria-live="off" together — this is deliberate, not a contradiction to "clean up": role="log" implies aria-live="polite", but both transcripts are rebuilt wholesale via app.innerHTML on every render, and replies are announced through #route-status instead — aria-live="off" is what makes #route-status the single deterministic announcement path instead of leaving double-announcement to chance. Do NOT delete the aria-live to "fix" the apparent contradiction.', async () => {
    const domHome = makeDom();
    const { renderHome } = await loadView('src/views/home.js');
    const homeState = { ...fakeState, chatEnabled: true, homeChat: { history: [] } };
    renderHome({
      app: domHome.window.document.getElementById('app'),
      state: homeState,
      data: { CPACC_BANK: [fakeQuestion], BEAR_BANK: [], BEAR_FLASHCARDS: [], DISABILITIES: { categories: [], items: [] }, LEGAL: { jurisdictions: [], items: [] } },
      provenance: {},
      missed: fakeMissed,
      actions: fakeActions,
    });
    const homeLog = domHome.window.document.getElementById('home-log');
    assertTrue(homeLog, '#home-log missing (chatEnabled: true should render the chat panel)');
    assertEq(homeLog.getAttribute('role'), 'log', '#home-log must carry role="log"');
    assertEq(homeLog.getAttribute('aria-live'), 'off', '#home-log must carry an explicit aria-live="off" — role="log" implies aria-live="polite", but the transcript is rebuilt wholesale by innerHTML and chat replies are announced through #route-status instead; without this override, a screen reader could double-announce or announce unpredictably');

    const { renderChatFragment } = await loadView('src/views/chat.js');
    const html = renderChatFragment(fakeQuestion, { history: [] });
    const wrap = domHome.window.document.createElement('div');
    wrap.innerHTML = html;
    const qLog = wrap.querySelector(`#log-${fakeQuestion.id}`);
    assertTrue(qLog, '#log-<id> missing');
    assertEq(qLog.getAttribute('role'), 'log', '#log-<id> must carry role="log"');
    assertEq(qLog.getAttribute('aria-live'), 'off', '#log-<id> must carry an explicit aria-live="off" for the same reason as #home-log: role="log" implies aria-live="polite", but the transcript is innerHTML-rebuilt and replies are announced through #route-status instead');
  });

  await test('document.title differs between #/disabilities and #/disabilities/<id>', async () => {
    // titleFor() is internal to main.js (not exported), so it's exercised
    // through the booted app rather than tested in isolation.
    await bootApp('#/');
    document.getElementById('start-disabilities').click();
    await new Promise(r => setTimeout(r, 5));
    assertEq(location.hash, '#/disabilities', 'sanity: on the disabilities grid');
    const gridTitle = document.title;

    const catBtn = document.querySelector('[data-cat]');
    assertTrue(catBtn, 'no category card to click');
    const catLabel = catBtn.querySelector('.cat-label')?.textContent || '';
    catBtn.click();
    await new Promise(r => setTimeout(r, 5));
    assertTrue(location.hash.startsWith('#/disabilities/'), 'sanity: on a disabilities detail route');
    const detailTitle = document.title;

    assertTrue(gridTitle !== detailTitle, `#/disabilities and its detail route must have different titles, got "${gridTitle}" for both`);
    assertTrue(detailTitle.includes(catLabel), 'detail title should name the specific category, not just repeat the grid title');
  });

  await test('#route-status live region exists as a sibling of #app, is role=status, and receives text from announce()', async () => {
    await bootApp('#/');
    const app = document.getElementById('app');
    const routeStatus = document.getElementById('route-status');
    assertTrue(routeStatus, 'no #route-status element');
    // Must survive app.innerHTML rewrites, which it can only do by living
    // outside the element that gets rewritten.
    assertEq(app.contains(routeStatus), false, '#route-status must be a sibling of #app, not a descendant');
    assertEq(routeStatus.getAttribute('role'), 'status');
    assertEq(routeStatus.getAttribute('aria-live'), 'polite');

    // Drive an actual announce() call: submitting an answer announces the
    // verdict through #route-status (see src/views/question.js /
    // src/main.js's announce()).
    document.getElementById('start').click();
    await new Promise(r => setTimeout(r, 5));
    const radio = document.querySelector('input[name="choice"]');
    assertTrue(radio, 'no answer radio to pick');
    radio.click();
    const submitBtn = document.getElementById('submit-answer');
    assertTrue(submitBtn && !submitBtn.disabled, 'sanity: submit-answer enabled after picking a choice');
    submitBtn.click();

    // announce() debounces through a 75ms setTimeout — wait longer than that.
    await new Promise(r => setTimeout(r, 150));
    assertTrue(routeStatus.textContent.length > 0, 'announce() should eventually write text into #route-status');
  });

  // ---- Part 3 (task doc): styles/app.css ----
  //
  // jsdom does not do layout or cascade resolution, so a test that parses
  // CSS text and claims to verify a computed style, a contrast ratio, or
  // that a selector actually wins the cascade would be theatre. The one
  // check below is honestly scoped: it is a text-presence guard against
  // accidental deletion of the prefers-reduced-motion block, nothing more.
  // Everything else new in app.css this round (:focus:not(:focus-visible),
  // .cell[aria-current], .cite .linkish, ::placeholder, .msg-role) is
  // exercised indirectly by the DOM tests above (e.g. the jump-grid test
  // checks .cell markup; the chat-label tests check .msg-role markup) but
  // is not — and should not be — asserted on as CSS.
  await test('styles/app.css text-presence guard: still declares a prefers-reduced-motion block (cheap deletion guard only)', () => {
    const css = fs.readFileSync(path.join(HERE, '..', 'styles', 'app.css'), 'utf8');
    assertTrue(css.includes('prefers-reduced-motion'), 'app.css should still declare a prefers-reduced-motion media query');
  });

  // ---- Part 4: adversarial-review tripwires -------------------------------
  //
  // Three fixes the suite could pass 113/113 with reverted (see the
  // per-tripwire comments below), plus the harder nearestFocusableSibling
  // case. Every fetch-stubbed test here restores globalThis.fetch in a
  // `finally` (see stubFetch above) — the suite runs all files in one
  // process, so a leaked stub would poison whatever runs next.

  // Tripwire 1: sendHomeChat/sendChat in src/main.js announce a chat reply
  // through #route-status — it's the ONLY way the reply reaches a screen
  // reader, since the transcript is a pre-populated role="log" region (no
  // aria-live can fire on content that was already there when the element
  // was created). Deleting either `announce()` call leaves the suite green
  // unless something drives the chat path itself, which nothing previously
  // did — the existing #route-status test (~line 905) only exercises the
  // answer-submit announce() call.
  await test('sendHomeChat: a successful reply is announced through #route-status (WCAG 4.1.3) — the role=log transcript alone never fires for screen readers', async () => {
    const restore = stubFetch([
      ['/chat-status', () => ({ ok: true, json: async () => ({ enabled: true }) })],
      ['/chat-general', () => ({ ok: true, json: async () => ({ reply: 'POUR stands for Perceivable, Operable, Understandable, Robust.' }) })],
      ['/missed', () => ({ ok: true, json: async () => ({ ids: [] }) })],
    ]);
    try {
      await bootApp('#/');
      const input = document.getElementById('home-input');
      assertTrue(input, 'sanity: #home-input should render once chatEnabled resolves true');
      input.value = 'What does POUR mean?';
      document.getElementById('home-send').click();

      // announce() debounces through a 75ms setTimeout (see main.js) on top
      // of the stubbed fetch's own microtask — wait past both.
      await new Promise(r => setTimeout(r, 150));
      const routeStatus = document.getElementById('route-status');
      assertTrue(routeStatus.textContent.includes('POUR stands for'), 'the chat reply text must reach #route-status, or a screen reader user never hears it');
      assertEq(routeStatus.getAttribute('aria-live'), 'polite', 'a successful reply should use the polite live region');
    } finally {
      restore();
    }
  });

  await test('sendHomeChat: a failed reply is announced through #route-status with aria-live="assertive" (the assertive path had zero prior coverage)', async () => {
    const restore = stubFetch([
      ['/chat-status', () => ({ ok: true, json: async () => ({ enabled: true }) })],
      ['/chat-general', () => ({ ok: false, status: 500, json: async () => ({ error: 'server exploded' }) })],
      ['/missed', () => ({ ok: true, json: async () => ({ ids: [] }) })],
    ]);
    try {
      await bootApp('#/');
      const input = document.getElementById('home-input');
      assertTrue(input, 'sanity: #home-input should render once chatEnabled resolves true');
      input.value = 'What does POUR mean?';
      document.getElementById('home-send').click();

      await new Promise(r => setTimeout(r, 150));
      const routeStatus = document.getElementById('route-status');
      assertTrue(routeStatus.textContent.includes('server exploded'), 'the chat error text must also reach #route-status');
      assertEq(routeStatus.getAttribute('aria-live'), 'assertive', 'a failed reply must switch #route-status to assertive — the user is actively waiting on it');
    } finally {
      restore();
    }
  });

  await test('sendChat (per-question chat on the results page) also announces a successful reply through #route-status', async () => {
    const restore = stubFetch([
      ['/chat-status', () => ({ ok: true, json: async () => ({ enabled: true }) })],
      ['/chat', () => ({ ok: true, json: async () => ({ reply: 'Great question — WCAG 1.4.1 is Use of Color.' }) })],
      ['/missed', () => ({ ok: true, json: async () => ({ ids: [] }) })],
    ]);
    try {
      await bootApp('#/');
      document.getElementById('start').click();
      await new Promise(r => setTimeout(r, 5));
      // Jump straight to the last question so #submit-all is available
      // without answering all TEST_SIZE (20) questions — reaching /results
      // is what matters here, scoring doesn't.
      for (let i = 0; i < 19; i++) document.getElementById('next').click();
      await new Promise(r => setTimeout(r, 10));
      assertEq(location.hash, '#/test/20', 'sanity: on the last question');

      const submitAll = document.getElementById('submit-all');
      assertTrue(submitAll, 'sanity: submit-all visible on the last question');
      submitAll.click();
      await new Promise(r => setTimeout(r, 10));
      assertEq(location.hash, '#/results', 'sanity: reached results');

      const toggle = document.querySelector('[data-toggle]');
      assertTrue(toggle, 'sanity: a per-question chat toggle should render once chatEnabled resolves true');
      toggle.click();
      await new Promise(r => setTimeout(r, 5));

      const qid = toggle.dataset.toggle;
      const input = document.querySelector(`[data-input="${qid}"]`);
      assertTrue(input, 'sanity: chat input for the toggled question should exist');
      input.value = 'Why is B wrong?';
      document.querySelector(`[data-send="${qid}"]`).click();

      await new Promise(r => setTimeout(r, 150));
      const routeStatus = document.getElementById('route-status');
      assertTrue(routeStatus.textContent.includes('WCAG 1.4.1 is Use of Color'), 'the per-question chat reply must also reach #route-status');
      assertEq(routeStatus.getAttribute('aria-live'), 'polite');
    } finally {
      restore();
    }
  });

  // Tripwire 3: captureFocus/restoreFocus (src/main.js) re-find the
  // focused control after an in-place re-render by `id` first, then by one
  // of RESTORABLE_DATA_ATTRS, and replay selectionStart/selectionEnd for
  // text inputs. None of the happy path had a test — deleting the
  // setSelectionRange call, or the whole data-* matching branch, left the
  // suite green.
  await test('focus restoration: an in-place re-render preserves focus on #home-input by id and replays its captured caret offsets via setSelectionRange', async () => {
    // #home-input's value isn't part of app state (see src/state.js — no
    // draft-text field), so the freshly re-rendered input is always empty;
    // restoreFocus's setSelectionRange call therefore has no *visible*
    // effect on this control in the current app. What's genuinely testable
    // — and what would break if that call (or its containing `if`) were
    // deleted — is whether restoreFocus actually INVOKES setSelectionRange
    // on the re-found element with the captured offsets. A prototype spy
    // observes that call without needing the value to survive.
    let resolveMissed;
    const missedGate = new Promise(r => { resolveMissed = r; });
    const restore = stubFetch([
      ['/chat-status', () => ({ ok: true, json: async () => ({ enabled: true }) })],
      ['/missed', async () => { await missedGate; return { ok: true, json: async () => ({ ids: [] }) }; }],
    ]);
    let spyInstalled = false;
    let proto, original;
    try {
      await bootApp('#/');
      const input = document.getElementById('home-input');
      assertTrue(input, 'sanity: #home-input should render once chatEnabled resolves true');

      proto = window.HTMLInputElement.prototype;
      original = proto.setSelectionRange;
      const calls = [];
      proto.setSelectionRange = function (start, end) {
        calls.push({ el: this, start, end });
        return original.call(this, start, end);
      };
      spyInstalled = true;

      input.value = 'what does pour sta';
      input.focus();
      input.setSelectionRange(5, 5); // caret mid-string — simulates a mid-edit user
      assertEq(document.activeElement, input, 'sanity: #home-input is focused with a mid-edit caret');

      // Resolve the deferred /missed probe now, well after boot. This
      // fires main.js's real `missed.fetchFromServer().then(() => render())`
      // — a genuine in-place re-render (routeKey is unchanged: still
      // view=home) with no explicit opts.focus, exactly the delayed-probe
      // scenario this app hits in production on a slow network.
      resolveMissed();
      await new Promise(r => setTimeout(r, 20));

      const newInput = document.getElementById('home-input');
      assertTrue(newInput, 'sanity: #home-input should still exist after the in-place re-render');
      assertTrue(newInput !== input, 'sanity: the re-render actually replaced the node (innerHTML rewrite) rather than reusing it');
      assertEq(document.activeElement, newInput, 'focus should be restored to the re-found #home-input by id, not dropped to <body>');

      const call = calls.find(c => c.el === newInput);
      assertTrue(call, 'restoreFocus should call setSelectionRange on the re-found input with the captured caret offsets');
      assertEq(call.start, 5, 'captured selectionStart should be replayed');
      assertEq(call.end, 5, 'captured selectionEnd should be replayed');
    } finally {
      if (spyInstalled) proto.setSelectionRange = original;
      restore();
    }
  });

  await test('focus restoration: an in-place re-render on the results page preserves focus on a jump-grid cell found by data-jump (RESTORABLE_DATA_ATTRS — data-jump was JUST added and had no coverage)', async () => {
    let resolveChatStatus;
    const chatStatusGate = new Promise(r => { resolveChatStatus = r; });
    const restore = stubFetch([
      ['/chat-status', async () => { await chatStatusGate; return { ok: true, json: async () => ({ enabled: false }) }; }],
      ['/missed', () => ({ ok: true, json: async () => ({ ids: [] }) })],
    ]);
    try {
      await bootApp('#/');
      document.getElementById('start').click();
      await new Promise(r => setTimeout(r, 5));
      for (let i = 0; i < 19; i++) document.getElementById('next').click();
      await new Promise(r => setTimeout(r, 10));
      assertEq(location.hash, '#/test/20', 'sanity: on the last question');

      const submitAll = document.getElementById('submit-all');
      assertTrue(submitAll, 'sanity: submit-all visible on the last question');
      submitAll.click();
      await new Promise(r => setTimeout(r, 10));
      assertEq(location.hash, '#/results', 'sanity: reached results');

      const cell = document.querySelector('[data-jump="0"]');
      assertTrue(cell, 'sanity: jump-grid cell 0 exists on the results page');
      cell.focus();
      assertEq(document.activeElement, cell, 'sanity: the jump-grid cell is focused');

      // Resolve the deferred /chat-status probe now — main.js's real
      // `fetchChatStatus().then(enabled => { state.chatEnabled = enabled; render(); })`
      // fires a genuine in-place re-render (chatEnabled isn't part of
      // routeKey) with no explicit opts.focus, well after the user has
      // already navigated to and started interacting with results.
      resolveChatStatus();
      await new Promise(r => setTimeout(r, 20));

      const newCell = document.querySelector('[data-jump="0"]');
      assertTrue(newCell, 'sanity: the jump-grid cell should still exist after the in-place re-render');
      assertTrue(newCell !== cell, 'sanity: the re-render actually replaced the node rather than reusing it');
      assertEq(document.activeElement, newCell, 'focus should be restored to the re-found data-jump cell, not dropped to <body>');
    } finally {
      restore();
    }
  });

  // "Also" item: nearestFocusableSibling widens parent -> .panel -> #app.
  // The existing flashcards Prev/Next test only exercises the first (parent)
  // step. This covers the harder case: an entire cluster (home's
  // #practice-missed + #clear-missed) disabling together, so neither the
  // immediate parent (.row) nor the .panel has anything left to hand focus
  // to, and the search has to widen all the way to #app.
  // ---- Part 5: results-empty-missed-pool regression (results.js + main.js) ----
  //
  // Regression coverage for the production bug: finishing a missed-practice
  // run with everything correct empties the missed set; the results page
  // used to render an enabled "Practice 0 missed again" button whose click
  // handler called startTest('missed'), which sampled zero questions,
  // entered the test view anyway, and crashed renderQuestion on
  // state.questions[state.index] being undefined. Two independent guards
  // were added — results.js disables/relabels #retake, and main.js's
  // startTest() refuses to touch state when the sampled pool is empty — and
  // each test below is scoped to catch exactly one of them reverting.

  await test('renderResults: #retake is genuinely disabled (not aria-disabled) with a real aria-describedby target when a missed-practice run comes back with nothing left to retake', async () => {
    const dom = makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    const zeroMissed = { get: () => new Set(), add() {}, remove() {}, persist: async () => {}, clear: async () => {} };
    renderResults({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, mode: 'missed', answers: { 1: 'A' }, revealed: { 1: true }, submitted: true },
      missed: zeroMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const retake = doc.getElementById('retake');
    assertTrue(retake, 'retake button missing');

    // The real, native disabled attribute — not a lookalike.
    assertTrue(retake.hasAttribute('disabled'), 'retake should carry the real disabled attribute when the missed pool is empty');
    // aria-disabled was deliberately removed from this codebase (it leaves a
    // control focusable/actionable to assistive tech despite looking
    // disabled — see the fieldset/aria-disabled test above for the same
    // reasoning applied elsewhere) — pin that it never comes back here.
    assertEq(retake.hasAttribute('aria-disabled'), false, 'retake must not carry aria-disabled — that lie was deliberately removed from this codebase');

    const describedBy = retake.getAttribute('aria-describedby');
    assertTrue(describedBy, 'retake needs aria-describedby pointing at an explanation');
    const explanation = doc.getElementById(describedBy);
    assertTrue(explanation, `aria-describedby="${describedBy}" must resolve to an element that actually exists`);
    assertTrue(explanation.classList.contains('sr-only'), 'the retake explanation must be visually hidden (.sr-only)');

    assertTrue(!retake.textContent.includes('Practice 0'), 'label must no longer read "Practice 0 missed again"');

    // #back sits in the same .nav row so the page isn't a dead end for a
    // keyboard user once #retake goes inert.
    const back = doc.getElementById('back');
    assertTrue(back, 'back button missing');
    assertEq(back.hasAttribute('disabled'), false, '#back must stay enabled so the page is not a dead end');
  });

  await test('renderResults: #retake stays enabled with no retake-help wiring when the missed pool is non-empty (guards against an over-broad "always disable retake in missed mode" fix)', async () => {
    const dom = makeDom();
    const { renderResults } = await loadView('src/views/results.js');
    const nonEmptyMissed = { get: () => new Set([1, 2, 3]), add() {}, remove() {}, persist: async () => {}, clear: async () => {} };
    renderResults({
      app: dom.window.document.getElementById('app'),
      state: { ...fakeState, mode: 'missed', answers: { 1: 'A' }, revealed: { 1: true }, submitted: true },
      missed: nonEmptyMissed,
      actions: fakeActions,
    });
    const doc = dom.window.document;
    const retake = doc.getElementById('retake');
    assertTrue(retake, 'retake button missing');
    assertEq(retake.hasAttribute('disabled'), false, 'retake must not be disabled while there are still missed questions to retake');
    assertEq(retake.hasAttribute('aria-describedby'), false, 'retake must carry no aria-describedby/retake-help wiring when it is not disabled');
    assertTrue(!doc.getElementById('retake-help'), 'no #retake-help explanation should render when retake is not disabled');
  });

  await test("startTest('missed') refuses to enter the test view when the sampled pool is empty (src/main.js guard), leaving the app exactly where it was and announcing why", async () => {
    // Both real UI entry points to actions.startTest('missed') — home's
    // #practice-missed and results' #retake — are themselves disabled at
    // zero missed (the tests above cover #retake; #practice-missed mirrors
    // it in home.js). A disabled button's onclick handler is wired but
    // never reachable via a real click (confirmed: jsdom, like real
    // browsers, does not dispatch 'click' through .click() on a disabled
    // element) — so exercising this via a literal click would only test
    // the UI-level disablement a second time. Calling the handler directly
    // instead reaches actions.startTest('missed') the same way the button
    // would if it were ever wired without that guard, isolating the
    // separate, defense-in-depth guard inside startTest() itself.
    const restore = stubFetch([
      ['/chat-status', () => ({ ok: true, json: async () => ({ enabled: false }) })],
      ['/missed', () => ({ ok: true, json: async () => ({ ids: [] }) })],
    ]);
    try {
      await bootApp('#/');
      assertTrue(document.getElementById('start'), 'sanity: booted on the home page');
      assertEq(location.hash, '#/', 'sanity: starting hash is #/');

      const practiceBtn = document.getElementById('practice-missed');
      assertTrue(practiceBtn, 'sanity: #practice-missed exists');
      assertTrue(practiceBtn.disabled, 'sanity: #practice-missed is disabled with an empty missed set (home.js\'s own guard, not what this test targets)');

      practiceBtn.onclick();
      await new Promise(r => setTimeout(r, 150)); // past announce()'s 75ms debounce

      assertEq(location.hash, '#/', 'startTest must not push #/test/1 when the sampled pool is empty');
      assertTrue(!document.getElementById('choices'), 'no #choices fieldset should mount — the app must not enter the test view');
      assertTrue(document.getElementById('start'), 'the home page should still be showing, untouched');

      const routeStatus = document.getElementById('route-status');
      assertTrue(routeStatus.textContent.includes('No missed questions to practice'), 'announce() should tell the user why nothing happened');
    } finally {
      restore();
    }
  });

  await test('focus restoration: clearing the missed list disables #practice-missed AND #clear-missed together — focus does not fall to <body> (nearestFocusableSibling widens past .row and .panel to #app)', async () => {
    const restore = stubFetch([
      ['/chat-status', () => ({ ok: true, json: async () => ({ enabled: false }) })],
      ['/missed', (opts) => opts && opts.method === 'DELETE'
        ? { ok: true, json: async () => ({}) }
        : { ok: true, json: async () => ({ ids: [101] }) }],
    ]);
    try {
      await bootApp('#/');
      const practice = document.getElementById('practice-missed');
      const clear = document.getElementById('clear-missed');
      assertTrue(practice && !practice.disabled, 'sanity: #practice-missed enabled with a non-empty missed list');
      assertTrue(clear && !clear.disabled, 'sanity: #clear-missed enabled with a non-empty missed list');

      clear.focus();
      clear.click(); // confirm() is stubbed true by bootApp
      await new Promise(r => setTimeout(r, 10));

      const practiceAfter = document.getElementById('practice-missed');
      const clearAfter = document.getElementById('clear-missed');
      assertTrue(practiceAfter.disabled, 'sanity: #practice-missed disables once the missed list is empty');
      assertTrue(clearAfter.disabled, 'sanity: #clear-missed disables itself as a side effect of its own click');

      const el = document.activeElement;
      assertTrue(el !== document.body, 'focus must not fall to <body> when the whole missed-practice row disables at once');
      assertTrue(document.getElementById('app').contains(el), 'focus should land on some other focusable control within the rendered route, not escape #app');
    } finally {
      restore();
    }
  });
}
