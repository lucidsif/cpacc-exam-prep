// src/views/chat.js — chat panel fragment shared by question + results views.
//
// Stateless: takes a question + its chat history and returns the HTML.
// The parent view is responsible for wiring data-send / data-input handlers.

import { escapeHtml } from '../dom.js';

/**
 * Render the per-question chat panel as an HTML string.
 * @param {object} q   - the question object
 * @param {{history:Array<{role:string,content:string}>}} chat
 */
export function renderChatFragment(q, chat) {
  const logHtml = chat.history.map(m => `<div class="msg ${m.role}">${escapeHtml(m.content)}</div>`).join('')
    || `<div class="msg assistant">Ask me anything about this question — why an option is wrong, what the BoK says, edge cases, related concepts.</div>`;
  return `
      <div class="chat">
        <div class="log" id="log-${q.id}" role="log" aria-live="polite" aria-label="Discussion of this question">${logHtml}</div>
        <div class="chat-input">
          <input type="text" data-input="${q.id}" placeholder="Type a question and press Enter..." aria-label="Ask about this question" />
          <button class="small" data-send="${q.id}">Send</button>
        </div>
      </div>`;
}
