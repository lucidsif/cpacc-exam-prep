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
