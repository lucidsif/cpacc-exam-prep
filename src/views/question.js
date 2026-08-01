// src/views/question.js — single-question view with submit-answer flow.

import { escapeHtml } from '../dom.js';
import { domainLabel } from '../scoring.js';
import { renderProvenanceBadge } from '../provenance.js';

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
    // Defect 1: native `disabled` (applied via the enclosing <fieldset>,
    // see below) does NOT strip a revealed radio's role, accessible name,
    // or checked state from the accessibility tree — per HTML-AAM,
    // `disabled` maps only to the disabled state, and `checked` is still
    // emitted on the input below, which is proof the node stays in the
    // tree. What `disabled` actually removes is focusability: once a
    // fieldset (or the radio itself) is disabled, Tab, NVDA/JAWS focus
    // mode, and JAWS's F quick-nav can no longer reach it, so a keyboard
    // user tabbing through controls loses the "which one did I pick"
    // signal even though a browse-mode/virtual-cursor read of the page
    // would still find it. Restore it as visually-hidden text on the
    // affected choice(s) so it's available regardless of navigation mode.
    let stateText = '';
    if (revealed) {
      const isYours = letter === committed;
      const isCorrect = letter === q.answer;
      if (isYours && isCorrect) stateText = 'Your answer. Correct.';
      else if (isYours) stateText = 'Your answer.';
      else if (isCorrect) stateText = 'Correct answer.';
    }
    const describedByIds = [hasWhy && `why-${letter}`, stateText && `state-${letter}`].filter(Boolean);
    const describedBy = describedByIds.length ? ` aria-describedby="${describedByIds.join(' ')}"` : '';
    const whyHtml = hasWhy
      ? `<div class="why" id="why-${letter}"><b>${letter === q.answer ? 'Correct' : 'Why not'}:</b> ${escapeHtml(q.why[letter])}</div>`
      : '';
    // The stateText span used to live inside <label>, which put it in the
    // radio's accessible NAME rather than its state — choice A's name
    // became "A. Perceivable Your answer. Correct.", a control name that
    // mutates with application state (fails WCAG 4.1.2/2.5.3). Giving the
    // radio an explicit aria-labelledby pointing only at the letter+text
    // span re-associates the name to just that content; stateText stays a
    // sibling inside the label (so it's still reached by anyone reading
    // the choice) but is no longer part of what makes up the name.
    return `
        <label class="choice ${cls}">
          <input type="radio" name="choice" value="${letter}" ${isSel ? 'checked' : ''}${describedBy} aria-labelledby="choice-label-${letter}" />
          <span id="choice-label-${letter}"><b>${letter}.</b> ${escapeHtml(q.choices[letter])}</span>${stateText ? ` <span class="sr-only" id="state-${letter}">${stateText}</span>` : ''}
        </label>${whyHtml}`;
  }).join('');

  const answered = Object.keys(state.answers).length;
  const verdictHtml = revealed
    ? (committed === q.answer
        ? `<div class="why" style="border-left-color:var(--right)"><b style="color:var(--right)"><span aria-hidden="true">✓ </span>Correct.</b></div>`
        : `<div class="why" style="border-left-color:var(--wrong)"><b style="color:var(--wrong)"><span aria-hidden="true">✗ </span>Incorrect.</b> Correct answer: <b>${q.answer}</b>.</div>`)
    : '';

  const canSubmitAnswer = !revealed && !!pending;
  // #submit-help is only ever reachable while this button carries native
  // `disabled` — a real `disabled` control is unfocusable (Tab, NVDA/JAWS
  // focus mode, and JAWS's F quick-nav all skip it), so its
  // aria-describedby can never be read via focus. Swapping this to
  // aria-disabled would fix that (the onclick guard below already no-ops
  // with nothing pending, so a click would do nothing different), but
  // tests/views.test.js pins a real `disabled` attribute here — the same
  // choice the fieldset above makes deliberately, for the same reason: a
  // fake aria-disabled leaves the control focusable/actionable to
  // assistive tech despite looking disabled, which is a worse failure mode
  // than a hint that's only reachable by browse-mode reading rather than
  // by Tab. Left as native `disabled`; the hint text is still perceivable
  // to a virtual-cursor read of the page, just not focus-associated.
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
        <!--
          Once revealed, every radio's aria-describedby="why-X" (set above,
          in the choicesHtml loop) is inherited-unfocusable via this
          fieldset's native disabled attribute — so that description can
          never be read via focus either. Same tradeoff as #submit-help
          below: this fieldset stays genuinely disabled on purpose (see
          tests/views.test.js's "genuinely inert via <fieldset disabled>"
          test and its own comment about the old per-radio aria-disabled
          leaving choices focusable/actionable to assistive tech after the
          answer was locked in) — that correctness matters more than
          restoring focus-reachability to the rationale text, which remains
          perceivable via an ordinary browse-mode read of the page either
          way (the .why block and the state-X sr-only span are both plain,
          non-hidden siblings in reading order).
        -->
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
      // Picking a choice deliberately doesn't trigger a full render (see the
      // comment above this forEach), so #submit-help — a plain node, not
      // reactive to anything — would otherwise sit in the DOM forever after
      // this point, telling a browse-mode user to "select a choice" long
      // after they've done exactly that. Nothing else points at it once
      // submit-answer's aria-describedby above moves to kbd-hint, so remove
      // it outright rather than leave it an orphaned, stale description.
      const help = document.getElementById('submit-help');
      if (help) help.remove();
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
      //
      // This does mean the verdict is spoken twice in short succession: once
      // here through #route-status, and again when focus below lands on
      // #verdict (whose text says close to the same thing) — the same
      // double-announcement class already eliminated for chat (see
      // chat.js). It isn't collapsed to one path here because the two paths
      // aren't actually redundant to remove: tests/views.test.js's
      // "#route-status live region... receives text from announce()" test
      // drives exactly this submit flow and pins that #route-status ends up
      // non-empty, so dropping this call breaks a frozen assertion; and the
      // focus move onto #verdict below is load-bearing on its own — once
      // this button is removed by the re-render, main.js's own focus
      // restoration has no id/data-attr left to find it by, so skipping the
      // explicit v.focus() would drop focus to <body> instead, a worse bug
      // than hearing the result twice. Fixing this properly means either
      // main.js gaining a positional fallback that makes the explicit
      // v.focus() below redundant, or this test being loosened to allow
      // #route-status to legitimately stay silent on submit — both changes
      // outside this file's ownership. Flagged rather than "fixed" here.
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
