// src/dom.js — tiny DOM/string helpers.
//
// Kept dependency-free so view modules can import freely.

/**
 * HTML-escape a string for safe interpolation into innerHTML.
 * @param {unknown} s
 * @returns {string}
 */
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/**
 * scrollIntoView that honors `prefers-reduced-motion: reduce`.
 * Falls back to instant 'auto' for users who opt out of motion (WCAG 2.3.3).
 * @param {Element} el
 */
export function scrollIntoViewMotionSafe(el) {
  const reduce = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/**
 * Focus an element and guarantee a visible ring, for script-driven focus
 * moves that aren't route navigation (main.js's moveFocusToRoute() handles
 * that case itself). Same defect, same fix: app.css suppresses the outline
 * on any `:focus` that isn't `:focus-visible`, which otherwise leaves a
 * plain el.focus() with no visible indicator at all for pointer-only/AT
 * users (switch device, eye-tracking, sip-and-puff, magnifier) who never
 * press a key to establish keyboard modality first. `.route-focus:focus`
 * (app.css) restores one unconditionally; the `:focus` compound is
 * load-bearing — the bare `.route-focus` class alone loses the specificity
 * contest against that suppressor, so leaving it off would silently paint
 * nothing for exactly the users this exists for. Removed on blur so it
 * doesn't linger once the user moves on under their own steam.
 * @param {HTMLElement} el - element to focus; caller is responsible for
 *   making it focusable (e.g. tabindex="-1") beforehand.
 * @param {FocusOptions} [focusOpts] - forwarded to el.focus().
 */
export function focusWithVisibleRing(el, focusOpts) {
  el.classList.add('route-focus');
  el.addEventListener('blur', () => el.classList.remove('route-focus'), { once: true });
  el.focus(focusOpts);
}
