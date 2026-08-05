// src/provenance.js — AI transparency labels (IBM AI FactSheet style).
//
// Three content buckets get distinct provenance treatments:
//   1. ai-from-source  — AI-authored from a citable primary source (BoK PDF,
//                        public legislation). Item-level cite fields point
//                        to specific pages or documents.
//   2. ai-from-notes   — AI-derived from the author's own study notes,
//                        which are themselves a distillation of various
//                        CPACC reference material. One step removed from
//                        primary sources.
//   3. ai-live         — Live AI responses (chat tutor). Not pre-reviewed.
//
// Provenance objects follow this shape:
//   { category, label, citations:[], generatedBy, generatedAt, humanReview,
//     confidence: 'high'|'medium'|'low'|'variable',
//     limitations:[] }
//
// This module renders the badge/disclosure UI. Data files own the metadata.

import { escapeHtml, focusWithVisibleRing } from './dom.js';

/** Provenance for live chat responses. Static — chat is never pre-reviewed. */
export const CHAT_PROVENANCE = {
  category: 'ai-live',
  label: 'AI live response — not pre-reviewed',
  citations: ['Live response from the configured LLM provider. Per-question chat also receives the question text, choices, BoK rationale, and citation as context.'],
  generatedBy: 'The operator-configured LLM (see LLM_PROVIDER / LLM_MODEL)',
  generatedAt: 'Just now',
  humanReview: 'None — responses are not pre-reviewed.',
  confidence: 'variable',
  limitations: [
    'May produce plausible-sounding but incorrect statements (hallucinations).',
    'Not authorized or endorsed by IAAP.',
    'Verify claims against the BoK or other authoritative sources before relying on them.',
  ],
};

/** Map confidence levels to a paired color + shape glyph + label for SC 1.4.1. */
const CONFIDENCE = {
  high:     { glyph: '●',  text: 'High confidence',     cls: 'pv-conf-high' },
  medium:   { glyph: '◐',  text: 'Medium confidence',   cls: 'pv-conf-med'  },
  low:      { glyph: '○',  text: 'Low confidence',      cls: 'pv-conf-low'  },
  variable: { glyph: '?',  text: 'Variable confidence', cls: 'pv-conf-var' },
};

/**
 * Render the inline badge + collapsible provenance card for one item.
 * Uses native <details>/<summary> for zero-JS disclosure semantics.
 *
 * <summary> maps to role="button", which takes its accessible name from its
 * content — so we let the visible label (prov.label) and confidence text
 * form the name instead of overriding it with aria-label (that would satisfy
 * only sighted users and fail WCAG 2.5.3 Label in Name for speech-input
 * users). itemLabel is appended as a visually-hidden suffix purely to keep
 * each badge's name unique across a page with 20+ of them.
 *
 * @param {object} prov - provenance object (see shape above)
 * @param {string} itemLabel - human label for the item, appended via
 *   .sr-only so screen readers hear "... — AI provenance for Question 4"
 *   after the visible label/confidence, disambiguating repeated badges
 * @param {string} [id] - stable key identifying this badge across renders
 *   (e.g. `question-${q.id}`). Without one, the <details> can't carry
  *   `data-prov-id` and wireProvenanceToggles() has nothing to hook, so the
  *   disclosure falls back to always-closed — the same behaviour this had
  *   before open state was backed in state.js.
  * @param {boolean} [isOpen] - whether `id` is in state.expandedProvenance;
  *   used to set the native `<details open>` attribute so the disclosure
  *   persists across in-place re-renders. The chevron direction is set
  *   directly on the DOM element by wireProvenanceToggles during the toggle
  *   event, so it updates immediately on user interaction even before the
  *   next render.
  * @returns {string} HTML string
 */
export function renderProvenanceBadge(prov, itemLabel, id, isOpen) {
  if (!prov) return '';
  const conf = CONFIDENCE[prov.confidence] || CONFIDENCE.variable;
  const safeLabel = escapeHtml(itemLabel || 'this item');
  const idAttr = id ? ` data-prov-id="${escapeHtml(id)}"` : '';
  const flagForm = id ? `
      <div class="pv-flag-form" data-prov-flag-form="${escapeHtml(id)}" hidden>
        <form data-flag-submit="${escapeHtml(id)}">
          <label for="flag-text-${escapeHtml(id)}">What is wrong, and what should it say instead?</label>
          <textarea id="flag-text-${escapeHtml(id)}" name="text" rows="3" maxlength="1000" required
                    aria-required="true"></textarea>
          <div class="flag-actions">
            <button type="submit">Submit</button>
            <button type="button" class="pv-flag-cancel" data-prov-flag-cancel="${escapeHtml(id)}">Cancel</button>
          </div>
        </form>
        <div class="pv-flag-status" aria-live="polite"></div>
      </div>` : '';

  // The flag button must live OUTSIDE <details> — putting it inside
  // <summary> triggers axe's nested-interactive rule (both are focusable
  // controls, WCAG 4.12), and putting it as a sibling after <summary>
  // means the browser hides it when collapsed (everything after summary is
  // hidden). A wrapper <div> keeps the button visible at all times while
  // grouping it with the badge for layout.
  const flagBtnHtml = id ? `<button type="button" class="pv-flag-btn" data-prov-flag="${escapeHtml(id)}">Flag</button>` : '';

  return `
    <div class="provenance-row">${flagBtnHtml}
      <details class="provenance"${isOpen ? ' open' : ''}${idAttr}>
        <summary>
          <span class="pv-icon" aria-hidden="true">🤖</span>
          <span class="pv-cat">${escapeHtml(prov.label)}</span>
          <span class="pv-conf ${conf.cls}">
            <span class="pv-conf-glyph" aria-hidden="true">${conf.glyph}</span> ${conf.text}
          </span>
          <span class="pv-chev" aria-hidden="true">▸</span>
          <span class="sr-only"> — AI provenance for ${safeLabel}</span>
        </summary>
        <dl class="provenance-card">
          ${renderField('Source(s)', (prov.citations || []).join('; '))}
          ${renderField('Generated by', prov.generatedBy)}
          ${renderField('Generated', prov.generatedAt)}
          ${renderField('Human review', prov.humanReview)}
          ${renderField('Confidence', conf.text)}
          ${renderLimitations(prov.limitations || [])}
        </dl>${flagForm}
      </details>
    </div>
  `;
}

function renderField(term, value) {
  if (!value) return '';
  return `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd>`;
}

function renderLimitations(items) {
  if (!items.length) return '';
  const lis = items.map(i => `<li>${escapeHtml(i)}</li>`).join('');
  return `<dt>Limitations</dt><dd><ul class="pv-limits">${lis}</ul></dd>`;
}

/**
 * Keep provenance <details> disclosures open across in-place re-renders.
 * Every render rebuilds app.innerHTML wholesale, which resets any
 * user-expanded native <details> back to closed — including one a
 * virtual-cursor screen reader user is mid-read through, which is worse
 * than the visible collapse: the subtree is removed out from under them,
 * not just visually toggled. Call this once per render, after the badge
 * markup is in the DOM; it listens for the native `toggle` event (fired on
 * both open and close, from any input method) and records the id in
 * `state.expandedProvenance` so the NEXT render's `isOpen` argument to
 * renderProvenanceBadge reflects it.
 * @param {ParentNode} container - element containing zero or more
 *   `.provenance[data-prov-id]` <details> to wire (usually the app root)
 * @param {{expandedProvenance?: Set<string>}} state - lazily gets
 *   `expandedProvenance` if the caller's state object doesn't have one yet
 *   (test fixtures built by hand, rather than via state.js's createState(),
 *   commonly won't)
 */
export function wireProvenanceToggles(container, state) {
  if (!state.expandedProvenance) state.expandedProvenance = new Set();
  container.querySelectorAll('.provenance[data-prov-id]').forEach(det => {
    const id = det.dataset.provId;
    det.addEventListener('toggle', () => {
      if (det.open) state.expandedProvenance.add(id);
      else state.expandedProvenance.delete(id);
      // Update the chevron immediately from the DOM element's open state,
      // before the next render's innerHTML rebuild overwrites it.
      const chev = det.querySelector('.pv-chev');
      if (chev) chev.textContent = det.open ? '▾' : '▸';
    });
  });
}

/**
 * Wire flag buttons and forms into provenance badges. Uses inline .onclick /
 * .onsubmit (matching the view wiring pattern) rather than addEventListener.
 * @param {ParentNode} container - element containing provenance badges to wire
 * @param {{expandedProvenance?: Set<string>}} state - passed through for the
 *   toggle wiring; not used by flag logic itself
 */
export function wireFlagButtons(container, state) {
  container.querySelectorAll('[data-prov-flag]').forEach(btn => {
    btn.onclick = () => {
      // Auto-expand the <details> if collapsed so the form is visible.
      const det = btn.parentElement?.querySelector('.provenance');
      if (det && !det.open) det.open = true;

      const form = container.querySelector(`[data-prov-flag-form="${btn.dataset.provFlag}"]`);
      if (form) form.hidden = !form.hidden;
    };
  });

  container.querySelectorAll('[data-prov-flag-cancel]').forEach(btn => {
    btn.onclick = () => {
      const form = container.querySelector(`[data-prov-flag-form="${btn.dataset.provFlagCancel}"]`);
      if (form) form.hidden = true;
    };
  });

  container.querySelectorAll('[data-flag-submit]').forEach(form => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const id = form.dataset.flagSubmit;
      // Derive itemLabel from the badge's sr-only suffix (" — AI provenance for X").
      const summary = form.closest('summary') || form.closest('.provenance')?.querySelector('summary');
      const srOnly = summary?.querySelector('.sr-only');
      const itemLabel = srOnly ? (srOnly.textContent.match(/ — AI provenance for (.+)/)?.[1] || id) : id;
      const text = form.querySelector('[name="text"]')?.value || '';
      if (!text) return;

      const status = form.closest('.pv-flag-form')?.querySelector('.pv-flag-status');
      try {
        const res = await fetch('/corrections', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id, itemLabel, text, pageUrl: location.href }),
        });
        const data = await res.json();
        if (data.ok) {
          if (status) { status.textContent = 'Thanks — this will be reviewed.'; status.className = 'pv-flag-status success'; }
          form.querySelector('[name="text"]').value = '';
          const wrapper = form.closest('.pv-flag-form');
          if (wrapper) wrapper.hidden = true;
        } else {
          throw new Error(data.error);
        }
      } catch {
        if (status) { status.textContent = 'Could not submit. Please try again.'; status.className = 'pv-flag-status error'; }
      }
    };
  });
}

/** Wire both provenance toggles and flag buttons. Call once per render, after badges are in the DOM. */
export function wireProvenanceInteractions(container, state) {
  wireProvenanceToggles(container, state);
  wireFlagButtons(container, state);
}

/**
 * Render the static AI-disclaimer banner shown above each chat transcript.
 * @param {string} [itemLabel] - human label for the panel this banner sits
 *   in (e.g. "Question 4"), appended as a visually-hidden suffix on the
 *   "About AI in this app" button — same reasoning as renderProvenanceBadge's
 *   itemLabel: with several chat panels open at once (results.js) that
 *   button's accessible name would otherwise repeat identically across all
 *   of them. Omit it where only one banner exists on the page (home.js) —
 *   there's nothing to disambiguate from.
 * @returns {string} HTML string (event wired separately via [data-open-ai-info])
 */
export function renderChatProvenanceBanner(itemLabel) {
  const suffix = itemLabel ? `<span class="sr-only"> — ${escapeHtml(itemLabel)}</span>` : '';
  return `
    <div class="pv-banner" role="note">
      <span class="pv-icon" aria-hidden="true">🤖</span>
      <span><b>AI live response — not pre-reviewed.</b> Verify against authoritative sources.</span>
      <button type="button" class="linkish pv-info-link" data-open-ai-info aria-haspopup="dialog">About AI in this app${suffix}</button>
    </div>
  `;
}

/**
 * Render the page-level "About AI in this app" dialog (closed by default).
 * Returns markup for a native <dialog>. Use installAiInfoDialog() to wire it up.
 */
export function renderAiInfoDialog() {
  return `
    <dialog id="ai-info-dialog" class="ai-dialog" aria-labelledby="ai-info-title">
      <!-- This <article> looks like unnecessary wrapping, but it is load-bearing:
           <dialog> is not in the <header> element's list of ancestors that
           suppress its implicit banner landmark role, so a bare
           <dialog><header>...</header></dialog> would give this dialog a
           second 'banner' landmark on top of the page's real one. <article>
           IS on that exclusion list, so nesting <header> inside it keeps this
           a plain section instead. Do not remove this wrapper on its own —
           if it goes, the <header> below needs to change too (e.g. a <div>). -->
      <article>
        <header class="row" style="justify-content:space-between;align-items:flex-start">
          <h2 id="ai-info-title" style="margin:0">About AI in this app</h2>
          <button type="button" class="secondary small" data-close-ai-info aria-label="Close dialog">✕</button>
        </header>
        <p>This study app uses AI in two ways. The bundled content was authored ahead of time by Claude. Each piece of content is labeled with a provenance badge you can expand for full detail.</p>
        <!-- No live chat tutor on this deploy. -->

        <h3>1. AI-authored from the BoK (high confidence)</h3>
        <p>The main practice question bank was written by Claude directly from the IAAP CPACC Body of Knowledge (October 2023, v4.0). Every item carries a BoK page citation. The author states each item was checked against the cited page.</p>

        <h3>2. AI-derived from author's notes (medium confidence)</h3>
        <p>The Bear-notes practice bank and flashcards were generated by Claude from the author's personal study notes and reviewed by the author for factual alignment. Despite the review, the author may have made mistakes — users should verify before relying on these in a high-stakes context. Parts of the disabilities and laws references were also generated from those notes. The disabilities reference covers 71 conditions across 9 categories — far more than the CPACC exam tests — and was spot-checked rather than reviewed item-by-item. Those notes are themselves the author's distillation of CPACC reference material. So this content is one step removed from primary sources.</p>

        <!-- No live chat tutor on this deploy. -->
        <!-- <h3>3. AI live chat (variable confidence, not pre-reviewed)</h3> -->
        <!-- <p>The optional chat tutor sends your message to the configured LLM provider in real time, and shows the reply unmodified. Chat replies are <b>not</b> pre-reviewed and may contain hallucinations. The per-question chat receives the question text, choices, BoK rationale, and citation as context, to ground the response. Even so, verify against the BoK or other authoritative sources before relying on a chat response.</p> -->
        <h3>What this is not</h3>
        <ul>
          <li>Not authorized or endorsed by IAAP.</li>
          <li>Not equivalent to the actual CPACC exam (which is 100 questions in 2 hours).</li>
          <li>Not a replacement for the official Body of Knowledge or accredited study materials.</li>
        </ul>

        <h3>How to read confidence pills</h3>
        <dl class="provenance-card">
          <dt><span class="pv-conf pv-conf-high"><span aria-hidden="true">●</span> High</span></dt>
          <dd>Authored from a citable primary source. The author states they reviewed it against the citation.</dd>
          <dt><span class="pv-conf pv-conf-med"><span aria-hidden="true">◐</span> Medium</span></dt>
          <dd>Derived from the author's notes. The bear-notes bank and flashcards were reviewed by the author but may still contain errors; parts of the disabilities and laws references were spot-checked.</dd>
          <dt><span class="pv-conf pv-conf-low"><span aria-hidden="true">○</span> Low</span></dt>
          <dd>Significant uncertainty flagged, usually paired with a visible Confidence note on the item.</dd>
          <!-- No live chat on this deploy — "Variable" confidence has no meaning. -->
          <!-- <dt><span class="pv-conf pv-conf-var"><span aria-hidden="true">?</span> Variable</span></dt> -->
          <!-- <dd>Live AI response. Quality varies per query.</dd> -->
        </dl>

        <p>The full <b>AI_TRANSPARENCY.md</b> document in the project repository goes further. It covers the three content buckets, the per-item provenance shape, confidence pill semantics, and how to file a correction. It also covers what the "reviewed" and "spot-checked" language above can and cannot be taken to mean from outside.</p>

        <div class="nav" style="justify-content:flex-end">
          <button type="button" data-close-ai-info>Close</button>
        </div>
      </article>
    </dialog>
  `;
}

/**
 * Wire up the AI-info dialog. Call once after the dialog markup is in the DOM.
 * Returns a cleanup function (idempotent).
 */
export function installAiInfoDialog() {
  const dlg = document.getElementById('ai-info-dialog');
  if (!dlg) return () => {};
  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }
  // An in-place re-render (e.g. a pending chat reply landing) can detach the
  // original trigger element while the dialog is open. Focusing a detached
  // node is a silent no-op that drops focus to <body>, so fall back to the
  // route's own heading when the trigger is gone — same landing spot
  // moveFocusToRoute() (main.js) uses for navigation, and for the same
  // reason: #app itself is focusable (this used to fall back to it
  // directly), but a plain el.focus() there gets no visible ring —
  // app.css's `:focus:not(:focus-visible)` suppressor kills the outline on
  // any script-driven focus that isn't marked `.route-focus`, leaving a
  // pointer-only/AT user on an unnamed `main` landmark with no indicator at
  // all. focusWithVisibleRing (dom.js) is the fix already established for
  // this exact class of problem; landing on the heading instead of bare
  // <main> also gives the user something more useful to have focus land on.
  function restoreFocus() {
    if (lastFocus && lastFocus.isConnected && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
      return;
    }
    const target = document.querySelector('#app h1') || document.getElementById('app');
    if (target) {
      target.setAttribute('tabindex', '-1');
      focusWithVisibleRing(target);
    }
  }

  // The native 'close' event fires for BOTH dismissal paths: our own
  // dlg.close() call below, and the browser's own Escape handling on a
  // showModal() dialog (which never runs our close() function at all).
  // Handling restoration only here — not also inline in close() — is what
  // guarantees it runs exactly once per dismissal.
  dlg.addEventListener('close', restoreFocus);

  function close() {
    if (typeof dlg.close === 'function') {
      dlg.close(); // dispatches 'close', which runs restoreFocus above
    } else {
      // removeAttribute('open') is the no-native-<dialog> fallback and does
      // NOT dispatch a 'close' event (only HTMLDialogElement.close() and
      // native Escape dismissal do), so this path must restore focus itself.
      dlg.removeAttribute('open');
      restoreFocus();
    }
  }

  document.addEventListener('click', onClick);
  function onClick(e) {
    const opener = e.target.closest('[data-open-ai-info]');
    if (opener) { e.preventDefault(); open(); return; }
    const closer = e.target.closest('[data-close-ai-info]');
    if (closer) { e.preventDefault(); close(); return; }
  }
  // Native <dialog> handles Escape itself in modern browsers; the resulting
  // 'close' event is caught by the listener registered above.

  return () => {
    document.removeEventListener('click', onClick);
    dlg.removeEventListener('close', restoreFocus);
  };
}
