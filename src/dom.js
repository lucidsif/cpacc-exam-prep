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
