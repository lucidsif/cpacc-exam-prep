// src/views/results.js — final results page with per-question review + chats.

import { escapeHtml, scrollIntoViewMotionSafe, focusWithVisibleRing } from '../dom.js';
import { domainLabel, scoreTest } from '../scoring.js';
import { TEST_SIZE } from '../sampling.js';
import { renderChatFragment } from './chat.js';
import { renderProvenanceBadge, wireProvenanceInteractions } from '../provenance.js';

/**
 * Render the results page.
 * @param {{
 *   app: HTMLElement,
 *   state: object,
 *   missed: {get():Set<number>},
 *   actions: {
 *     render():void,
 *     startTest(mode:string):void,
 *     sendChat(qid:number):Promise<void>,
 *   }
 * }} ctx
 */
export function renderResults(ctx) {
  const { app, state, missed, actions, provenanceForQuestion } = ctx;
  const { correct, total, pct, domainStats } = scoreTest(state.questions, state.answers);

  const cells = state.questions.map((q, i) => {
    const a = state.answers[q.id];
    const cls = a === q.answer ? 'right' : (a ? 'wrong' : '');
    const mark = a === q.answer ? '✓' : (a ? '✗' : '·');
    const lbl = a === q.answer ? `Question ${i+1}, correct` : (a ? `Question ${i+1}, incorrect` : `Question ${i+1}, unanswered`);
    return `<button type="button" class="cell ${cls}" data-jump="${i}" aria-label="${lbl}"><span aria-hidden="true">${i+1} ${mark}</span></button>`;
  }).join('');

  const details = state.questions.map((q, i) => {
    const picked = state.answers[q.id];
    const itemLabel = `Question ${i + 1}`;
    const choices = ["A","B","C","D"].map(letter => {
      let cls = '';
      if (letter === q.answer) cls = 'correct';
      else if (letter === picked) cls = 'incorrect';
      // WCAG 1.4.1: cls above is a colour-only cue (border/background hue,
      // see styles/app.css .choice.correct/.incorrect) with no text
      // equivalent — the "Correct:"/"Why not:" prefix just below renders
      // for all four choices, so it carries no signal about which one was
      // actually picked. Mirrors the sr-only state text question.js already
      // uses for the live view's revealed choices.
      const isYours = letter === picked;
      const isCorrectLetter = letter === q.answer;
      let stateText = '';
      if (isYours && isCorrectLetter) stateText = 'Your answer. Correct.';
      else if (isYours) stateText = 'Your answer.';
      else if (isCorrectLetter) stateText = 'Correct answer.';
      return `
          <div class="choice ${cls}">
            <b>${letter}.</b> ${escapeHtml(q.choices[letter])}${stateText ? ` <span class="sr-only">${stateText}</span>` : ''}
            <div class="why"><b>${letter === q.answer ? 'Correct' : 'Why not'}:</b> ${escapeHtml(q.why[letter])}</div>
          </div>`;
    }).join('');
    const chatOpen = state.chats[q.id]?.open;
    const prov = provenanceForQuestion ? provenanceForQuestion(q) : null;
    return `
        <div class="panel" data-qid="${q.id}" id="result-q-${i}">
          <h2 class="qmeta">Q${i+1} · ${domainLabel(q.domain)} · ${q.type} · your answer: ${picked || '—'} · correct: ${q.answer}</h2>
          ${renderProvenanceBadge(prov, itemLabel, `results-${q.id}`, state.expandedProvenance?.has(`results-${q.id}`))}
          <p class="qtext">${escapeHtml(q.q)}</p>
          ${choices}
          ${q.cite ? `<div class="cite">Source: ${escapeHtml(q.cite)}</div>` : ''}
          ${q.flag ? `<div class="flag"><b><span aria-hidden="true">⚑</span> Confidence note:</b> ${escapeHtml(q.flag)}</div>` : ''}
          ${state.chatEnabled ? `
          <div class="row" style="margin-top:10px">
            <!-- Every one of these 20 toggles otherwise shares the same two
                 accessible names ("Discuss this question with the AI tutor" /
                 "Hide chat") — a screen reader's elements list becomes 20
                 indistinguishable entries. The sr-only suffix disambiguates,
                 same approach as renderProvenanceBadge's itemLabel. -->
            <button type="button" class="toggle linkish" data-toggle="${q.id}" aria-expanded="${!!chatOpen}" aria-controls="chat-panel-${q.id}"><span aria-hidden="true">${chatOpen ? '▾' : '▸'}</span> ${chatOpen ? 'Hide chat' : 'Discuss this question with the AI tutor'}<span class="sr-only"> — ${itemLabel}</span></button>
          </div>
          <div id="chat-panel-${q.id}">${chatOpen ? renderChatFragment(q, state.chats[q.id], itemLabel) : ''}</div>` : ''}
        </div>`;
  }).join('');

  const missedNow = missed.get().size;
  const modeLabel =
    state.mode === 'missed' ? 'Missed-question practice'
    : state.mode === 'bear' ? 'Bear notes practice'
    : 'Weighted practice test';

  // A missed-practice run that comes back with nothing missed (every
  // question answered correctly) has no pool left to retake — sampling.js
  // would hand back an empty set, which used to reach the test view with
  // zero questions and crash question.js. Disable rather than repurpose the
  // button into an unrelated "new random set" action: this mirrors the
  // guard already on home.js's #practice-missed button (disabled at count
  // 0), so the retake control behaves the same way everywhere it appears.
  // #back sits right next to #retake in the same .nav row, so a keyboard
  // user tabbing here still lands on a live control either way.
  const retakeDisabled = state.mode === 'missed' && missedNow === 0;
  const retakeLabel = retakeDisabled
    ? 'No missed questions left to retake'
    : state.mode === 'missed' ? `Practice ${Math.min(TEST_SIZE, missedNow)} missed again`
    : `Take another ${TEST_SIZE} (new random set)`;

  app.innerHTML = `
      <h1>Results</h1>
      <div class="sub">${modeLabel} · ${total} questions · missed list now: ${missedNow}</div>
      <div class="panel">
        <div class="score">${correct} / ${total} <small>(${pct}%)</small></div>
        <div class="row" style="margin-top:8px">
          ${Object.entries(domainStats).filter(([,s]) => s.t > 0).map(([d, s]) =>
            `<span class="pill">${domainLabel(Number(d))}: ${s.c}/${s.t}</span>`
          ).join('')}
        </div>
        <div class="grid" style="margin-top:14px" role="group" aria-label="Question results navigation">${cells}</div>
        <div class="nav">
          <button id="retake"${retakeDisabled ? ' disabled aria-describedby="retake-help"' : ''}>${retakeLabel}</button>
          ${retakeDisabled ? '<span id="retake-help" class="sr-only">You answered every missed question correctly, so there\'s nothing left to retake. Start a new test from the home page instead.</span>' : ''}
          <button class="secondary" id="back">Back to start</button>
        </div>
      </div>
      ${details}
    `;
  wireProvenanceInteractions(app, state);

  document.getElementById('retake').onclick = () => actions.startTest(state.mode);
  // "Back to start" invalidates the submission, not just the question set —
  // clear both so a stale #/results history entry can't be restored later
  // with nothing to show (see router.js's `results` restorability check).
  document.getElementById('back').onclick = () => { state.questions = []; state.submitted = false; state.view = 'home'; actions.render(); };

  document.querySelectorAll('[data-jump]').forEach(cell => {
    cell.onclick = () => {
      const el = document.getElementById('result-q-' + cell.dataset.jump);
      if (!el) return;
      scrollIntoViewMotionSafe(el);
      // Scrolling alone doesn't move a screen reader's reading position —
      // only focus does. The panel isn't natively focusable, so make it so.
      el.setAttribute('tabindex', '-1');
      // focusWithVisibleRing (not a plain el.focus()): same script-driven
      // focus move as moveFocusToRoute() (main.js), so it needs the same
      // .route-focus ring for pointer-only/AT users.
      focusWithVisibleRing(el, { preventScroll: true });
    };
  });

  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.onclick = () => {
      const id = Number(el.dataset.toggle);
      state.chats[id] = state.chats[id] || { open: false, history: [], draft: '' };
      state.chats[id].open = !state.chats[id].open;
      // Explicit focus target (not just bare render()): this is an in-place
      // re-render so no-arg render() would already restore focus via the
      // data-toggle matcher, but naming it here keeps the intent legible —
      // focus must land back on the toggle so its new aria-expanded state
      // is announced, not silently flipped on an unfocused element.
      actions.render({ focus: `[data-toggle="${id}"]` });
    };
  });
  document.querySelectorAll('[data-send]').forEach(el => {
    // sendChat (main.js) reads this input's live DOM value directly and
    // clears that DOM node, with no idea state.chats[id].draft exists — so
    // the draft (what actually survives a re-render, see chat.js/state.js)
    // has to be cleared here or the next render would put the just-sent
    // text right back in the box.
    el.onclick = () => {
      const id = Number(el.dataset.send);
      if (state.chats[id]) state.chats[id].draft = '';
      actions.sendChat(id);
    };
  });
  document.querySelectorAll('[data-input]').forEach(el => {
    el.oninput = (e) => {
      const id = Number(el.dataset.input);
      state.chats[id] = state.chats[id] || { open: true, history: [], draft: '' };
      state.chats[id].draft = e.target.value;
    };
    el.onkeydown = (e) => {
      // isComposing guards an in-progress IME candidate (CJK input): that
      // Enter confirms the candidate, it isn't a request to send, and
      // without this a typed Japanese/Chinese/Korean message gets cut off
      // and sent on its first confirming keystroke.
      if (e.key !== 'Enter' || e.isComposing) return;
      const id = Number(el.dataset.input);
      if (state.chats[id]) state.chats[id].draft = '';
      actions.sendChat(id);
    };
  });
}
