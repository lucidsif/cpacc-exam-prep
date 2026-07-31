// src/views/results.js — final results page with per-question review + chats.

import { escapeHtml, scrollIntoViewMotionSafe } from '../dom.js';
import { domainLabel, scoreTest } from '../scoring.js';
import { TEST_SIZE } from '../sampling.js';
import { renderChatFragment } from './chat.js';
import { renderProvenanceBadge } from '../provenance.js';

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
    const choices = ["A","B","C","D"].map(letter => {
      let cls = '';
      if (letter === q.answer) cls = 'correct';
      else if (letter === picked) cls = 'incorrect';
      return `
          <div class="choice ${cls}">
            <b>${letter}.</b> ${escapeHtml(q.choices[letter])}
            <div class="why"><b>${letter === q.answer ? 'Correct' : 'Why not'}:</b> ${escapeHtml(q.why[letter])}</div>
          </div>`;
    }).join('');
    const chatOpen = state.chats[q.id]?.open;
    const prov = provenanceForQuestion ? provenanceForQuestion(q) : null;
    return `
        <div class="panel" data-qid="${q.id}" id="result-q-${i}">
          <h2 class="qmeta">Q${i+1} · ${domainLabel(q.domain)} · ${q.type} · your answer: ${picked || '—'} · correct: ${q.answer}</h2>
          ${renderProvenanceBadge(prov, `Question ${i + 1}`)}
          <p class="qtext">${escapeHtml(q.q)}</p>
          ${choices}
          ${q.cite ? `<div class="cite">Source: ${escapeHtml(q.cite)}</div>` : ''}
          ${q.flag ? `<div class="flag"><b>⚑ Confidence note:</b> ${escapeHtml(q.flag)}</div>` : ''}
          ${state.chatEnabled ? `
          <div class="row" style="margin-top:10px">
            <button type="button" class="toggle linkish" data-toggle="${q.id}" aria-expanded="${!!chatOpen}"><span aria-hidden="true">${chatOpen ? '▾' : '▸'}</span> ${chatOpen ? 'Hide chat' : 'Discuss this question with the AI tutor'}</button>
          </div>
          ${chatOpen ? renderChatFragment(q, state.chats[q.id]) : ''}` : ''}
        </div>`;
  }).join('');

  const missedNow = missed.get().size;
  const modeLabel =
    state.mode === 'missed' ? 'Missed-question practice'
    : state.mode === 'bear' ? 'Bear notes practice'
    : 'Weighted practice test';

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
        <div class="grid" style="margin-top:14px">${cells}</div>
        <div class="nav">
          <button id="retake">${state.mode === 'missed' ? `Practice ${Math.min(TEST_SIZE, missedNow)} missed again` : `Take another ${TEST_SIZE} (new random set)`}</button>
          <button class="secondary" id="back">Back to start</button>
        </div>
      </div>
      ${details}
    `;

  document.getElementById('retake').onclick = () => actions.startTest(state.mode);
  document.getElementById('back').onclick = () => { state.questions = []; state.view = 'home'; actions.render(); };

  document.querySelectorAll('[data-jump]').forEach(cell => {
    cell.onclick = () => {
      const el = document.getElementById('result-q-' + cell.dataset.jump);
      if (el) scrollIntoViewMotionSafe(el);
    };
  });

  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.onclick = () => {
      const id = Number(el.dataset.toggle);
      state.chats[id] = state.chats[id] || { open: false, history: [] };
      state.chats[id].open = !state.chats[id].open;
      actions.render();
    };
  });
  document.querySelectorAll('[data-send]').forEach(el => {
    el.onclick = () => actions.sendChat(Number(el.dataset.send));
  });
  document.querySelectorAll('[data-input]').forEach(el => {
    el.onkeydown = (e) => { if (e.key === 'Enter') actions.sendChat(Number(el.dataset.input)); };
  });
}
