// src/views/question.js — single-question view with submit-answer flow.

import { escapeHtml } from '../dom.js';
import { domainLabel } from '../scoring.js';

/**
 * Render the current question and wire its handlers.
 * @param {{
 *   app: HTMLElement,
 *   state: object,
 *   missed: {add(id:number):void, remove(id:number):void, persist():Promise<void>},
 *   actions: {
 *     render():void,
 *     submitAll():Promise<void>,
 *   }
 * }} ctx
 */
export function renderQuestion(ctx) {
  const { app, state, missed, actions } = ctx;
  const q = state.questions[state.index];
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
    return `
        <label class="choice ${cls}">
          <input type="radio" name="choice" value="${letter}" ${isSel ? 'checked' : ''} ${revealed ? 'aria-disabled="true"' : ''} />
          <b>${letter}.</b> ${escapeHtml(q.choices[letter])}
          ${revealed && (letter === q.answer || letter === committed) ? `<div class="why"><b>${letter === q.answer ? 'Correct' : 'Why not'}:</b> ${escapeHtml(q.why[letter])}</div>` : ''}
        </label>`;
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
      <h1>CPACC Practice Test</h1>
      <div class="sub">Question ${state.index + 1} of ${state.questions.length} · answered ${answered}/${state.questions.length}</div>
      <div class="panel">
        <div class="qmeta">${domainLabel(q.domain)} · ${q.type}</div>
        <p class="qtext">${escapeHtml(q.q)}</p>
        <div id="kbd-hint" class="cite" style="display:block;margin-bottom:8px">Select an answer, then choose <b>Submit answer</b>.<span class="kbd-only"> Use arrow keys to move between choices.</span></div>
        <div id="choices" role="radiogroup" aria-label="Answer choices" aria-describedby="kbd-hint" ${revealed ? 'aria-disabled="true"' : ''}>${choicesHtml}</div>
        <div id="verdict" tabindex="-1" aria-live="polite" aria-atomic="true">${verdictHtml}</div>
        ${revealed && q.cite ? `<div class="cite">Source: ${escapeHtml(q.cite)}</div>` : ''}
        ${submitHelpHtml}
        <div class="nav">
          <div>
            <button class="secondary" id="prev" ${state.index === 0 ? 'disabled' : ''}>← Prev</button>
            <button class="secondary" id="next" ${state.index === state.questions.length - 1 ? 'disabled' : ''}>Next →</button>
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
      actions.render();
      // After re-render, move focus to the verdict region so the result
      // is announced and the user sees what they just earned.
      requestAnimationFrame(() => {
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
    const cls = state.answers[q.id] ? 'answered' : '';
    const lbl = state.answers[q.id] ? `Question ${i+1}, answered` : `Question ${i+1}, unanswered`;
    return `<button type="button" class="cell ${cls}" data-i="${i}" aria-label="${lbl}"${state.index === i ? ' aria-current="true"' : ''}>${i+1}</button>`;
  }).join('');
  return `<div class="panel"><h2 class="qmeta">Jump to question</h2><div class="grid" id="jump" role="group" aria-label="Question navigation">${cells}</div></div>`;
}
