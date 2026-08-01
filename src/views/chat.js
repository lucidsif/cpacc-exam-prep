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
  return `
      <div class="chat">
        ${renderChatProvenanceBanner()}
        <div class="log" id="log-${q.id}" role="log" aria-label="Discussion of this question">${logHtml}</div>
        <div class="chat-input">
          <input type="text" data-input="${q.id}" placeholder="Type a question and press Enter..." aria-label="Ask about this question" />
          <button class="small" data-send="${q.id}">Send</button>
        </div>
      </div>`;
}
