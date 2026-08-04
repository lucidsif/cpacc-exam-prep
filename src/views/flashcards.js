// src/views/flashcards.js — flashcard study view (front/back, prev/next/flip/shuffle).

import { escapeHtml } from '../dom.js';
import { shuffle } from '../sampling.js';
import { renderProvenanceBadge, wireProvenanceToggles } from '../provenance.js';

/**
 * Render the active flashcards session.
 * @param {{
 *   app: HTMLElement,
 *   state: {flashcards:{cards:Array, index:number, flipped:boolean}},
 *   actions: { render(opts?:{focus?:string}):void, announce(msg:string):void },
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
      ${renderProvenanceBadge(prov, 'these flashcards', 'flashcards', state.expandedProvenance?.has('flashcards'))}
      <div class="panel">
        <!-- Plain container, not a button: its content (tag, front/back text) must be
             ordinary navigable text for screen readers, which a button's accessible-name
             computation would otherwise swallow. The onclick below is a redundant mouse
             affordance only — #flip-card is the real keyboard-operable control, so this
             does NOT create a WCAG 2.1.1 keyboard-access gap. Do not turn this back into
             a <button>. -->
        <div class="flashcard" id="card">
          <div class="sr-only">${fc.flipped ? 'Back of card' : 'Front of card'}</div>
          <span class="tag-pill">${escapeHtml(card.tag || 'card')}</span>
          ${fc.flipped
            ? `<div class="back-text">${escapeHtml(card.back)}</div>`
            : `<div class="front-text">${escapeHtml(card.front)}</div>
               <div class="flip-hint" aria-hidden="true">Click to flip</div>`}
        </div>
        <div class="nav">
          <div>
            <button class="secondary" id="prev-card" ${fc.index === 0 ? 'disabled' : ''}><span aria-hidden="true">← </span>Prev</button>
            <button class="secondary" id="next-card" ${fc.index === fc.cards.length - 1 ? 'disabled' : ''}>Next<span aria-hidden="true"> →</span></button>
          </div>
          <div>
            <button id="flip-card">${fc.flipped ? 'Show front' : 'Show back'}</button>
            <button class="secondary" id="shuffle-cards">Shuffle</button>
          </div>
        </div>
      </div>
    `;
  wireProvenanceToggles(app, state);

  // Flip toggles state, announces the newly revealed side's text (the live region
  // lives outside <main> and survives the innerHTML swap below), and explicitly
  // refocuses #flip-card. This is a same-route in-place re-render, so no-arg
  // render() would already preserve focus — but being explicit is clearer and
  // also covers the #card click path, where focus was never on #flip-card to begin
  // with (a click on #card doesn't focus it; it's not focusable).
  function flip() {
    fc.flipped = !fc.flipped;
    actions.announce(fc.flipped ? `Back of card. ${card.back}` : `Front of card. ${card.front}`);
    actions.render({ focus: '#flip-card' });
  }
  document.getElementById('card').onclick = flip;
  document.getElementById('flip-card').onclick = (e) => { e.stopPropagation(); flip(); };

  // routeKey() (src/main.js) is keyed on the TEST question index, not the
  // flashcard index — a flashcard is a different card at the same route, so
  // Prev/Next/Shuffle are in-place re-renders exactly like flip() above:
  // same button, same name, same page title. flip() already announces its
  // own state change; this was the one card-change path that didn't (WCAG
  // 4.1.3) — announce the new card the same way flip() announces a face.
  function announceCard() {
    const c = fc.cards[fc.index];
    actions.announce(`Card ${fc.index + 1} of ${fc.cards.length}. Front of card. ${c.front}`);
  }
  document.getElementById('prev-card').onclick = () => {
    if (fc.index > 0) { fc.index--; fc.flipped = false; announceCard(); actions.render(); }
  };
  document.getElementById('next-card').onclick = () => {
    if (fc.index < fc.cards.length - 1) { fc.index++; fc.flipped = false; announceCard(); actions.render(); }
  };
  document.getElementById('shuffle-cards').onclick = () => {
    fc.cards = shuffle(fc.cards); fc.index = 0; fc.flipped = false;
    actions.announce(`Shuffled. Card 1 of ${fc.cards.length}. Front of card. ${fc.cards[0].front}`);
    actions.render();
  };
}
