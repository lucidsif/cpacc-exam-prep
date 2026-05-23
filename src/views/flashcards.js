// src/views/flashcards.js — flashcard study view (front/back, prev/next/flip/shuffle).

import { escapeHtml } from '../dom.js';
import { shuffle } from '../sampling.js';
import { renderProvenanceBadge } from '../provenance.js';

/**
 * Render the active flashcards session.
 * @param {{
 *   app: HTMLElement,
 *   state: {flashcards:{cards:Array, index:number, flipped:boolean}},
 *   actions: { render():void },
 * }} ctx
 */
export function renderFlashcards(ctx) {
  const { app, state, actions, provenance } = ctx;
  const prov = provenance?.BEAR_FLASHCARDS;
  const fc = state.flashcards;
  const card = fc.cards[fc.index];

  app.innerHTML = `
      <h1>Bear notes flashcards</h1>
      <div class="sub">Card ${fc.index + 1} of ${fc.cards.length}</div>
      ${renderProvenanceBadge(prov, 'these flashcards')}
      <div class="panel">
        <button type="button" class="flashcard" id="card" aria-label="${fc.flipped ? 'Showing back. Click to flip to front.' : 'Showing front. Click to flip to back.'}" aria-pressed="${fc.flipped}">
          <span class="tag-pill">${escapeHtml(card.tag || 'card')}</span>
          ${fc.flipped
            ? `<div class="back-text">${escapeHtml(card.back)}</div>`
            : `<div class="front-text">${escapeHtml(card.front)}</div>
               <div class="flip-hint" aria-hidden="true">Click to flip</div>`}
        </button>
        <div class="nav">
          <div>
            <button class="secondary" id="prev-card" ${fc.index === 0 ? 'disabled' : ''}>← Prev</button>
            <button class="secondary" id="next-card" ${fc.index === fc.cards.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
          <div>
            <button id="flip-card">${fc.flipped ? 'Show front' : 'Show back'}</button>
            <button class="secondary" id="shuffle-cards">Shuffle</button>
          </div>
        </div>
      </div>
    `;

  document.getElementById('card').onclick = () => { fc.flipped = !fc.flipped; actions.render(); };
  document.getElementById('flip-card').onclick = (e) => { e.stopPropagation(); fc.flipped = !fc.flipped; actions.render(); };
  document.getElementById('prev-card').onclick = () => { if (fc.index > 0) { fc.index--; fc.flipped = false; actions.render(); } };
  document.getElementById('next-card').onclick = () => { if (fc.index < fc.cards.length - 1) { fc.index++; fc.flipped = false; actions.render(); } };
  document.getElementById('shuffle-cards').onclick = () => { fc.cards = shuffle(fc.cards); fc.index = 0; fc.flipped = false; actions.render(); };
}
