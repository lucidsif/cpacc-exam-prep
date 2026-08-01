// src/views/disabilities.js — human-disabilities reference (category grid + detail list).

import { escapeHtml, scrollIntoViewMotionSafe, focusWithVisibleRing } from '../dom.js';
import { renderProvenanceBadge, wireProvenanceToggles } from '../provenance.js';

// Per-category top-line stat pills (curated from the source notes).
const CATEGORY_STATS = {
  visual: ["2.2B globally with vision impairment/blindness (WHO)", "33M+ blind", "~1B preventable or correctable"],
  auditory: ["466M / ~6.1% globally with disabling hearing loss (WHO)", "Most >65 years old"],
  speech: ["Often co-occurs with neurological or developmental conditions"],
  motor: ["Low back pain is the #1 cause of disability globally (YLD)", "~619M affected"],
  neurological: ["Migraine: ~14–15% globally (#2 disability after back pain)", "Epilepsy: ~50M globally", "Photosensitive epilepsy: ~3% of those with epilepsy"],
  cognitive: ["Intellectual disability: 1–3% of pop (~200M)", "Dyslexia: 5–10% (up to 17%)", "ADHD: 2–7% children, ~4% adults"],
  psychological: ["Anxiety is the MOST prevalent psychological disability", "Anxiety: 2.5–7% by country", "PWD have 2× risk of depression"],
  multiple: ["Deafblindness uses touch as the primary communication channel"],
  other: ["1.3B people / 16% of world experience significant disability (WHO)"]
};

/**
 * Render the disabilities reference page.
 * @param {{
 *   app: HTMLElement,
 *   state: {disabilities:{view:'categories'|'list', category?:string}},
 *   data: {DISABILITIES: {categories:Array, items:Array}},
 *   actions: { render():void },
 * }} ctx
 */
export function renderDisabilities(ctx) {
  const { app, state, data, actions, provenance } = ctx;
  const d = data.DISABILITIES;
  const view = state.disabilities.view;
  const prov = provenance?.DISABILITIES;

  if (view === 'categories') {
    const cards = d.categories.map(c => {
      const count = d.items.filter(i => i.category === c.id).length;
      return `
          <button type="button" class="cat-card" data-cat="${c.id}" style="border-top: 3px solid ${escapeHtml(c.color)}">
            <span class="cat-emoji" aria-hidden="true">${escapeHtml(c.emoji)}</span>
            <span class="cat-label">${escapeHtml(c.label)}</span>
            <span class="cat-count">${count} ${count === 1 ? 'condition' : 'conditions'}</span>
          </button>`;
    }).join('');
    app.innerHTML = `
        <h1>Human disabilities</h1>
        <div class="sub">${d.items.length} conditions across ${d.categories.length} categories. Tap a category to browse.</div>
        <p class="scope-note"><span class="scope-icon" aria-hidden="true">ℹ️</span> <span><b>Goes beyond CPACC scope</b> — for deeper study.</span></p>
        ${renderProvenanceBadge(prov, 'the disabilities reference', 'disabilities', state.expandedProvenance?.has('disabilities'))}
        <div class="cat-grid">${cards}</div>
      `;
    wireProvenanceToggles(app, state);
    document.querySelectorAll('[data-cat]').forEach(el => {
      el.onclick = () => { state.disabilities = { view: 'list', category: el.dataset.cat }; state.view = 'disabilities'; actions.render(); };
    });
    return;
  }

  // view === 'list'
  const cat = d.categories.find(c => c.id === state.disabilities.category);
  const items = d.items.filter(i => i.category === cat.id);
  const stats = (CATEGORY_STATS[cat.id] || []).map(s => `<span class="stat-pill">${escapeHtml(s)}</span>`).join('');
  const anchors = items.map(i => `<button type="button" class="anchor" data-anchor="${i.id}"><span aria-hidden="true">${escapeHtml(i.emoji)}</span> ${escapeHtml(i.name)}</button>`).join('');
  const inline = items.map(item => {
    const facts = (item.keyFacts || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');
    const solutions = (item.a11ySolutions || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');
    return `
          <div class="dis-item" id="dis-${item.id}">
            <div class="dis-head">
              <div class="dis-emoji" aria-hidden="true">${escapeHtml(item.emoji)}</div>
              <div>
                <h2 class="dis-name">${escapeHtml(item.name)}</h2>
                <div class="dis-prev">${escapeHtml(item.prevalence || '')}</div>
              </div>
            </div>
            <p class="dis-desc">${escapeHtml(item.description || '')}</p>
            <div class="dis-cols">
              <div>
                ${facts ? `<h3 class="section-h">Key facts</h3><ul>${facts}</ul>` : ''}
              </div>
              <div>
                ${solutions ? `<h3 class="section-h">Accessibility solutions</h3><ul>${solutions}</ul>` : ''}
              </div>
            </div>
          </div>`;
  }).join('');

  app.innerHTML = `
        <div class="row" style="margin-bottom:14px">
          <button class="secondary small" id="back-cats"><span aria-hidden="true">←</span> All categories</button>
        </div>
        <div class="cat-overview" style="border-top: 4px solid ${escapeHtml(cat.color)}">
          <div class="cat-hero">
            <div class="cat-hero-emoji" aria-hidden="true">${escapeHtml(cat.emoji)}</div>
            <div>
              <h1>${escapeHtml(cat.label)} — human disabilities</h1>
              <div class="sub" style="margin:4px 0 0">${items.length} condition${items.length === 1 ? '' : 's'}</div>
            </div>
          </div>
          <p class="cat-summary">${escapeHtml(cat.summary || '')}</p>
          ${stats ? `<div class="stat-row">${stats}</div>` : ''}
        </div>
        <!--
          tabindex="0" + role="group"/aria-label live together on this outer
          element on purpose, not on .anchor-list inside it: app.css's
          overflow-y:auto (the scrollable-region-focusable fix, WCAG 2.1.1)
          is on .dis-anchor-bar, so THIS is the element that must be the tab
          stop for real keyboard scrolling (arrow keys/Page Down/Home/End
          act on whichever scrollable element has focus, not one of its
          non-scrolling descendants). Putting role="group"+aria-label on a
          separate, non-focusable child was tried first and looked fine in
          Chromium — it computes a name for the focused generic wrapper from
          the labelled child's content anyway — but that's an undocumented
          Chromium fallback, not something the accessible-name spec
          guarantees for a bare focusable role="generic" element in every
          engine/AT. Keeping the name on the SAME element that gets
          tabindex (matching .chat .log's pattern in home.js/chat.js, one
          element carrying scrollability + tabindex + name together) is what
          actually guarantees the announcement rather than assuming it.
        -->
        <div class="dis-anchor-bar" role="group" aria-label="${escapeHtml(cat.label)} conditions navigation" tabindex="0"><div class="anchor-list">${anchors}</div></div>
        ${inline}
      `;
  document.getElementById('back-cats').onclick = () => { state.disabilities = { view: 'categories' }; state.view = 'disabilities'; actions.render(); };
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
