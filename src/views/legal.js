// src/views/legal.js — history/laws/standards reference (jurisdiction grid + detail list).

import { escapeHtml, scrollIntoViewMotionSafe, focusWithVisibleRing } from '../dom.js';
import { renderProvenanceBadge, wireProvenanceInteractions } from '../provenance.js';

/** Pick an emoji for a legal item based on its `type` field. */
function emojiForType(type) {
  if (!type) return '📖';
  if (type.includes('Convention'))     return '📜';
  if (type.includes('Standard'))       return '📐';
  if (type.includes('Directive'))      return '🇪🇺';
  if (type.includes('Statute'))        return '⚖️';
  if (type.includes('Charter'))        return '📜';
  if (type.includes('Treaty'))         return '🌐';
  if (type.includes('Framework'))      return '🧩';
  if (type.includes('Declaration'))    return '📜';
  if (type.includes('Classification')) return '🩺';
  if (type.includes('Milestone'))      return '📅';
  return '📖';
}

/**
 * Render the laws/standards reference page.
 * @param {{
 *   app: HTMLElement,
 *   state: {legal:{view:'categories'|'list', category?:string}},
 *   data: {LEGAL: {jurisdictions:Array, items:Array}},
 *   actions: { render():void },
 * }} ctx
 */
export function renderLegal(ctx) {
  const { app, state, data, actions, provenance } = ctx;
  const d = data.LEGAL;
  const view = state.legal.view;
  const visible = d.items.filter(i => i.cpacc !== false);
  const prov = provenance?.LEGAL;

  if (view === 'categories') {
    const cards = d.jurisdictions.filter(c => visible.some(i => i.jurisdiction === c.id)).map(c => {
      const count = visible.filter(i => i.jurisdiction === c.id).length;
      return `
          <button type="button" class="cat-card" data-jur="${c.id}" style="border-top: 3px solid ${escapeHtml(c.color)}">
            <span class="cat-emoji" aria-hidden="true">${escapeHtml(c.emoji)}</span>
            <span class="cat-label">${escapeHtml(c.label)}</span>
            <span class="cat-count">${count} ${count === 1 ? 'item' : 'items'}</span>
          </button>`;
    }).join('');
    app.innerHTML = `
        <h1>History, laws & standards</h1>
        <div class="sub">${visible.length} CPACC-relevant items across ${d.jurisdictions.filter(c => visible.some(i => i.jurisdiction === c.id)).length} groups. Tap a group to browse.</div>
        ${renderProvenanceBadge(prov, 'the laws and standards reference', 'legal', state.expandedProvenance?.has('legal'))}
        <div class="cat-grid">${cards}</div>
      `;
    wireProvenanceInteractions(app, state);
    document.querySelectorAll('[data-jur]').forEach(el => {
      el.onclick = () => { state.legal = { view: 'list', category: el.dataset.jur }; state.view = 'legal'; actions.render(); };
    });
    return;
  }

  // view === 'list'
  const cat = d.jurisdictions.find(c => c.id === state.legal.category);
  let items = visible.filter(i => i.jurisdiction === cat.id);
  if (cat.id === 'timeline') {
    items = items.slice().sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  }
  // Full name, not a truncated prefix — a fixed .slice(0, 32) used to cut
  // these mid-word with no ellipsis (e.g. "...ADA Title II web"), affecting
  // 10 of 26 timeline anchors and 6 of 7 UN ones. disabilities.js's
  // equivalent anchor list (:61) renders the full item name; matching that
  // here keeps every anchor's accessible name complete. Any visual
  // shortening belongs in CSS (text-overflow etc.), not in the name itself.
  const anchors = items.map(i => `<button type="button" class="anchor" data-anchor="${i.id}">${escapeHtml(i.year)} · ${escapeHtml(i.name)}</button>`).join('');
  const inline = items.map(item => {
    const facts = (item.keyFacts || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
    return `
          <div class="dis-item" id="dis-${item.id}">
            <div class="dis-head">
              <div class="dis-emoji" aria-hidden="true">${emojiForType(item.type)}</div>
              <div>
                <h2 class="dis-name">${escapeHtml(item.name)}</h2>
                <div class="dis-prev">${escapeHtml(item.year || '')}${item.type ? ' · ' + escapeHtml(item.type) : ''}</div>
              </div>
            </div>
            <p class="dis-desc">${escapeHtml(item.summary || '')}</p>
            ${facts ? `<h3 class="section-h">Key facts</h3><ul>${facts}</ul>` : ''}
          </div>`;
  }).join('');

  app.innerHTML = `
        <div class="row" style="margin-bottom:14px">
          <button class="secondary small" id="back-jurs"><span aria-hidden="true">←</span> All groups</button>
        </div>
        <div class="cat-overview" style="border-top: 4px solid ${escapeHtml(cat.color)}">
          <div class="cat-hero">
            <div class="cat-hero-emoji" aria-hidden="true">${escapeHtml(cat.emoji)}</div>
            <div>
              <h1>${escapeHtml(cat.label)} · history, laws & standards</h1>
              <div class="sub" style="margin:4px 0 0">${items.length} item${items.length === 1 ? '' : 's'}${cat.id === 'timeline' ? ' · sorted by year' : ''}</div>
            </div>
          </div>
          <p class="cat-summary">${escapeHtml(cat.summary || '')}</p>
        </div>
        <!--
          tabindex="0" + role="group"/aria-label live together on this outer
          element on purpose, not on .anchor-list inside it — see the
          matching comment in disabilities.js's equivalent anchor bar for
          why (app.css's overflow-y:auto, the scrollable-region-focusable
          fix, is on .dis-anchor-bar; the accessible name has to live on
          that same element to be guaranteed rather than assumed).
        -->
        <div class="dis-anchor-bar" role="group" aria-label="${escapeHtml(cat.label)} items navigation" tabindex="0"><div class="anchor-list">${anchors}</div></div>
        ${inline}
      `;
  document.getElementById('back-jurs').onclick = () => { state.legal = { view: 'categories' }; state.view = 'legal'; actions.render(); };
  document.querySelectorAll('[data-anchor]').forEach(el => {
    el.onclick = () => {
      const target = document.getElementById('dis-' + el.dataset.anchor);
      if (target) {
        scrollIntoViewMotionSafe(target);
        // Move focus to the scrolled-to item so keyboard/SR users actually land there (WCAG 2.4.3).
        target.setAttribute('tabindex', '-1');
        // focusWithVisibleRing (not a plain target.focus()): same script-driven
        // focus move as moveFocusToRoute() (main.js), so it needs the same
        // .route-focus ring for pointer-only/AT users.
        focusWithVisibleRing(target, { preventScroll: true });
      }
    };
  });
}
