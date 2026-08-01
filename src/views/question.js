// src/views/question.js — single-question view with submit-answer flow.

import { escapeHtml } from '../dom.js';
import { domainLabel } from '../scoring.js';
import { renderProvenanceBadge, renderChatProvenanceBanner, CHAT_PROVENANCE } from '../provenance.js';

/**
 * Render the current question and wire its handlers.
 * @param {{
 *   app: HTMLElement,
 *   state: object,
 *   missed: {add(id:number):void, remove(id:number):void, persist():Promise<void>},
 *   actions: {
 *     render():void,
 *     submitAll():Promise<void>,
 *     announce(msg:string):void,
 *   }
 * }} ctx
 */
export function renderQuestion(ctx) {
  const { app, state, missed, actions, provenanceForQuestion } = ctx;
  const q = state.questions[state.index];
  const prov = provenanceForQuestion ? provenanceForQuestion(q) : null;
  const committed = state.answers[q.id];
  const pending = state.pending[q.id];
  const revealed = !!state.revealed[q.id];
  const picked = revealed ? committed : pending;
  const allRevealed = state.questions.every(qq => state.revealed[qq.id]);
  const isLast = state.index === state.questions.length - 1;
  const showSubmitAll = isLast || allRevealed;

  const choicesHtml = ["A","B","C","D"].map(letter => {
    const isSel = picked === letter;
    let cls = isSel ? 'selected' : '';
    if (revealed) {
      if (letter === q.answer) cls = 'correct';
      else if (letter === committed) cls = 'incorrect';
      else cls = '';
    }
    // Defect 2: the rationale used to live inside <label>, which made it
    // part of the radio's accessible name (60+ words spoken as the
    // control's name) and re-checked the radio when clicked. Render it as
    // a sibling of the label instead and wire it up via aria-describedby.
    const hasWhy = revealed && (letter === q.answer || letter === committed);
    const describedBy = hasWhy ? ` aria-describedby="why-${letter}"` : '';
    // Defect 1: native `disabled` (applied via the enclosing <fieldset>,
    // see below) removes revealed choices from the accessibility tree's
    // interactive state, which also drops the "which one did I pick"
    // signal. Restore it as visually-hidden text on the affected choice(s).
    let stateText = '';
    if (revealed) {
      const isYours = letter === committed;
      const isCorrect = letter === q.answer;
      if (isYours && isCorrect) stateText = 'Your answer. Correct.';
      else if (isYours) stateText = 'Your answer.';
      else if (isCorrect) stateText = 'Correct answer.';
    }
    const whyHtml = hasWhy
      ? `<div class="why" id="why-${letter}"><b>${letter === q.answer ? 'Correct' : 'Why not'}:</b> ${escapeHtml(q.why[letter])}</div>`
      : '';
    return `
        <label class="choice ${cls}">
          <input type="radio" name="choice" value="${letter}" ${isSel ? 'checked' : ''}${describedBy} />
          <b>${letter}.</b> ${escapeHtml(q.choices[letter])}${stateText ? ` <span class="sr-only">${stateText}</span>` : ''}
        </label>${whyHtml}`;
  }).join('');

  const answered = Object.keys(state.answers).length;
  const verdictHtml = revealed
    ? (committed === q.answer
        ? `<div class="why" style="border-left-color:var(--right)"><b style="color:var(--right)"><span aria-hidden="true">✓ </span>Correct.</b></div>`
        : `<div class="why" style="border-left-color:var(--wrong)"><b style="color:var(--wrong)"><span aria-hidden="true">✗ </span>Incorrect.</b> Correct answer: <b>${q.answer}</b>.</div>`)
    : '';

  const canSubmitAnswer = !revealed && !!pending;
  const submitAnswerAttrs = canSubmitAnswer
    ? `aria-describedby="kbd-hint"`
    : `disabled aria-describedby="${revealed ? 'kbd-hint' : 'submit-help'}"`;
  const submitHelpHtml = revealed
    ? ''
    : `<span id="submit-help" class="sr-only">Select a choice to enable Submit answer.</span>`;

  app.innerHTML = `
      <h1>Question ${state.index + 1} of ${state.questions.length}</h1>
      <div class="sub">CPACC Practice Test · answered ${answered}/${state.questions.length}</div>
      <div class="panel">
        <div class="qmeta">${domainLabel(q.domain)} · ${q.type}</div>
        ${renderProvenanceBadge(prov, `Question ${state.index + 1}`)}
        <p class="qtext">${escapeHtml(q.q)}</p>
        <div id="kbd-hint" class="cite" style="display:block;margin-bottom:8px">Select an answer, then choose <b>Submit answer</b>.${!revealed ? '<span class="kbd-only"> Use arrow keys to move between choices.</span>' : ''}</div>
        <fieldset id="choices" style="border:0;margin:0;padding:0;min-width:0" aria-describedby="kbd-hint"${revealed ? ' disabled' : ''}>
          <legend class="sr-only">Answer choices for question ${state.index + 1}: ${escapeHtml(q.q)}</legend>
          ${choicesHtml}
        </fieldset>
        <div id="verdict" tabindex="-1">${verdictHtml}</div>
        ${revealed && q.cite ? `<div class="cite">Source: ${escapeHtml(q.cite)}</div>` : ''}
        ${submitHelpHtml}
        <div class="nav">
          <div>
            <button class="secondary" id="prev" ${state.index === 0 ? 'disabled' : ''}><span aria-hidden="true">← </span>Prev</button>
            <button class="secondary" id="next" ${state.index === state.questions.length - 1 ? 'disabled' : ''}>Next<span aria-hidden="true"> →</span></button>
          </div>
          <div class="row" style="gap:8px">
            ${revealed
              ? ''
              : `<button id="submit-answer" ${submitAnswerAttrs}>Submit answer</button>`}
            ${showSubmitAll
              ? `<button id="submit-all" class="secondary" style="border-color:var(--accent);color:var(--accent);font-weight:700">Submit test and see score</button>`
              : ''}
          </div>
        </div>
      </div>
      ${renderJumpGrid(state)}
    `;

  // Selecting a radio just tracks pending — no auto-reveal.
  document.querySelectorAll('input[name="choice"]').forEach(el => {
    el.onchange = (e) => {
      if (state.revealed[q.id]) return;
      state.pending[q.id] = e.target.value;
      const btn = document.getElementById('submit-answer');
      if (btn) {
        btn.disabled = false;
        btn.setAttribute('aria-describedby', 'kbd-hint');
      }
      document.querySelectorAll('#choices .choice').forEach((lbl, i) => {
        const letter = ["A","B","C","D"][i];
        lbl.classList.toggle('selected', letter === e.target.value);
      });
    };
  });

  document.getElementById('prev').onclick = () => { if (state.index > 0) { state.index--; actions.render(); } };
  document.getElementById('next').onclick = () => { if (state.index < state.questions.length - 1) { state.index++; actions.render(); } };

  const submitAnswerBtn = document.getElementById('submit-answer');
  if (submitAnswerBtn) {
    submitAnswerBtn.onclick = () => {
      const choice = state.pending[q.id];
      if (!choice) return;
      state.answers[q.id] = choice;
      state.revealed[q.id] = true;
      if (choice !== q.answer) missed.add(q.id);
      else missed.remove(q.id);
      missed.persist();
      // Defect 4: #verdict is populated in the same innerHTML write that
      // creates it, so a live region on it would never announce (it has
      // to exist before its contents change). Announce through the
      // persistent #route-status region instead.
      actions.announce(choice === q.answer ? 'Correct.' : `Incorrect. The correct answer is ${q.answer}.`);
      // Defect 5: capture identity before the render so the rAF below can
      // tell whether it's still the render it thinks it is — if the user
      // hits Back in the same frame, main.js's popstate render already
      // moved focus to a different route/question, and this callback
      // re-querying the live DOM by id would steal it back.
      const qid = q.id;
      const qIndex = state.index;
      actions.render();
      // After re-render, move focus to the verdict region so the result
      // is announced and the user sees what they just earned.
      requestAnimationFrame(() => {
        if (state.view !== 'test' || state.index !== qIndex || state.questions[state.index]?.id !== qid) return;
        const v = document.getElementById('verdict');
        if (v) v.focus();
      });
    };
  }

  const submitAllBtn = document.getElementById('submit-all');
  if (submitAllBtn) {
    submitAllBtn.onclick = async () => {
      const unanswered = state.questions.filter(qq => !state.revealed[qq.id]).length;
      if (unanswered > 0 && !confirm(`${unanswered} question(s) still unanswered. Submit test anyway?`)) return;
      await actions.submitAll();
    };
  }

  // Jump grid wiring (rendered into a sibling panel by renderJumpGrid).
  const jump = document.getElementById('jump');
  if (jump) {
    jump.querySelectorAll('.cell').forEach(cell => {
      cell.onclick = () => { state.index = Number(cell.dataset.i); actions.render(); };
    });
  }
}

function renderJumpGrid(state) {
  const cells = state.questions.map((q, i) => {
    const isAnswered = !!state.answers[q.id];
    const cls = isAnswered ? 'answered' : '';
    const lbl = isAnswered ? `Question ${i+1}, answered` : `Question ${i+1}, unanswered`;
    // WCAG 1.4.1: the answered/unanswered distinction was colour-only (and
    // the colour deltas were barely perceptible to begin with). Add a
    // non-colour mark, mirroring results.js's aria-hidden glyph-in-span
    // idiom so the accessible name (still just aria-label) is untouched.
    const mark = isAnswered ? '✓' : '·';
    return `<button type="button" class="cell ${cls}" data-i="${i}" aria-label="${lbl}"${state.index === i ? ' aria-current="true"' : ''}><span aria-hidden="true">${i+1} ${mark}</span></button>`;
  }).join('');
  return `<div class="panel"><h2 class="qmeta">Jump to question</h2><div class="grid" id="jump" role="group" aria-label="Question navigation">${cells}</div></div>`;
}
