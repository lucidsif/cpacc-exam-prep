// src/views/chat.js — chat panel fragment shared by question + results views.
//
// Stateless: takes a question + its chat history and returns the HTML.
// The parent view is responsible for wiring data-send / data-input handlers.

import { escapeHtml } from '../dom.js';
import { renderChatProvenanceBanner } from '../provenance.js';

// WCAG 1.4.1: speaker identity must not rely on bubble color alone.
// This visible label is the non-color cue; see styles/app.css .msg-role.
const ROLE_LABELS = { user: 'You:', assistant: 'Tutor:', error: 'Error:' };

/**
 * Render the per-question chat panel as an HTML string.
 * @param {object} q   - the question object
 * @param {{history:Array<{role:string,content:string}>}} chat
 */
export function renderChatFragment(q, chat) {
  const logHtml = chat.history.map(m => `<div class="msg ${m.role}"><b class="msg-role">${ROLE_LABELS[m.role] || ''}</b>${escapeHtml(m.content)}</div>`).join('')
    || `<div class="msg assistant"><b class="msg-role">${ROLE_LABELS.assistant}</b>Ask me anything about this question — why an option is wrong, what the BoK says, edge cases, related concepts.</div>`;
  // role="log" carries an implicit aria-live="polite" — dropping the explicit
  // attribute doesn't remove that behaviour, it just makes it invisible in
  // the markup. This transcript is rebuilt wholesale via innerHTML on every
  // render (never appended to), and every reply/error is already announced
  // explicitly through announce() -> #route-status (see sendChat in
  // main.js). That leaves the same message with two possible announcement
  // paths, and whether a screen reader would actually speak it twice depends
  // on browser/AT combination in ways we can't guarantee from here either
  // way. aria-live="off" is an explicit override of role="log"'s implicit
  // value, so it turns that ambiguity into a certainty: this region never
  // announces on its own, and #route-status is the one deliberate
  // announcement path. Do NOT delete the aria-live to "fix" the apparent
  // contradiction with role="log" — that contradiction is intentional and
  // deleting it is exactly what reintroduces the double-announcement risk.
  // role="log" stays for its structural/navigational value (screen readers
  // expose it for jumping between log entries); only its implicit live
  // behaviour is suppressed.
  return `
      <div class="chat">
        ${renderChatProvenanceBanner()}
        <div class="log" id="log-${q.id}" role="log" aria-live="off" aria-label="Discussion of this question">${logHtml}</div>
        <div class="chat-input">
          <input type="text" data-input="${q.id}" placeholder="Type a question and press Enter..." aria-label="Ask about this question" />
          <button class="small" data-send="${q.id}">Send</button>
        </div>
      </div>`;
}
